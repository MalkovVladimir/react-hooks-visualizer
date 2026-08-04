import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

/* ------------------------------------------------------------------ панели */

export function Panel({
  title,
  tone,
  children,
}: {
  title: ReactNode
  tone?: 'good' | 'bad'
  children: ReactNode
}) {
  return (
    <div className="panel">
      <div className={`panel-head${tone ? ` is-${tone}` : ''}`}>
        <span className="dot" />
        {title}
      </div>
      <div className="panel-body">{children}</div>
    </div>
  )
}

export function Stage({ title = 'rendered html', children }: { title?: string; children: ReactNode }) {
  return (
    <Panel title={title}>
      <div className="stage">{children}</div>
    </Panel>
  )
}

export function Split({ children }: { children: ReactNode }) {
  return <div className="split">{children}</div>
}

/* ------------------------------------------------------------ базовые атомы */

export function Btn({
  children,
  onClick,
  variant = 'default',
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary' | 'ghost' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      className={`btn${variant === 'default' ? '' : ` ${variant}`}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function Chip({
  children,
  tone,
}: {
  children: ReactNode
  tone?: 'accent' | 'good' | 'bad' | 'warn'
}) {
  return <span className={`chip${tone ? ` ${tone}` : ''}`}>{children}</span>
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="row">{children}</div>
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="label">{children}</div>
}

/* --------------------------------------------- внешнее состояние (сигналы) */

export type Signal<T> = {
  get: () => T
  set: (next: T) => void
  subscribe: (listener: () => void) => () => void
}

/**
 * Крошечный store вне React. Нужен, чтобы демо могли писать в лог прямо из фазы
 * рендера: уведомление подписчиков откладывается в микротаску, поэтому ре-рендер
 * получает только сама панель лога, а не отслеживаемый компонент.
 */
export function createSignal<T>(initial: T): Signal<T> {
  let value = initial
  let scheduled = false
  const listeners = new Set<() => void>()

  const notify = () => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      listeners.forEach((listener) => listener())
    })
  }

  return {
    get: () => value,
    set: (next) => {
      if (Object.is(next, value)) return
      value = next
      notify()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export function useSignal<T>(signal: Signal<T>): T {
  return useSyncExternalStore(signal.subscribe, signal.get, signal.get)
}

/* -------------------------------------------------------------- лог событий */

export type LogKind = 'render' | 'effect' | 'cleanup' | 'paint' | 'error' | 'dim'
export type LogLine = { id: number; text: string; kind: LogKind; time: string }

export type LogStore = Signal<LogLine[]> & {
  log: (text: string, kind?: LogKind) => void
  clear: () => void
}

let logSeq = 0

export function createLogStore(limit = 60): LogStore {
  const signal = createSignal<LogLine[]>([])
  return {
    ...signal,
    log(text, kind = 'dim') {
      const time = new Date().toLocaleTimeString('ru-RU', { hour12: false }).slice(3)
      signal.set([...signal.get(), { id: logSeq++, text, kind, time }].slice(-limit))
    },
    clear: () => signal.set([]),
  }
}

export function useLogStore(limit = 60) {
  return useMemo(() => createLogStore(limit), [limit])
}

export function LogPanel({
  store,
  empty = 'событий пока нет',
}: {
  store: LogStore
  empty?: string
}) {
  const lines = useSignal(store)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (node) node.scrollTop = node.scrollHeight
  }, [lines])

  return (
    <div className="log" ref={ref}>
      {lines.length === 0 && <div className="log-empty">{empty}</div>}
      {lines.map((line) => (
        <div key={line.id} className={`log-line ${line.kind}`}>
          <span className="log-time">{line.time}</span>
          <span>{line.text}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------- индикация ре-рендеров */

/** Считает, сколько раз отрендерился компонент (не вызывая ре-рендер). */
export function useRenderCount() {
  const count = useRef(0)
  count.current += 1
  return count.current
}

/**
 * Подсвечивает контейнер вспышкой на каждом коммите — видно, кто ре-рендерится.
 * `deps` не указываем намеренно: эффект должен срабатывать на любом рендере.
 */
export function RenderFlash({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    node.classList.remove('flash')
    void node.offsetWidth // форсируем reflow, чтобы анимация перезапустилась
    node.classList.add('flash')
  })

  return (
    <div className="box" ref={ref}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------ фазы рендера */

export function PhaseTrack({ phases, active }: { phases: readonly string[]; active: number }) {
  return (
    <div className="phase-track">
      {phases.map((phase, index) => (
        <div key={phase} className={`phase${index === active ? ' on' : ''}`}>
          {phase}
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- утилиты */

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/**
 * Ставит колбэк в очередь макрозадач сразу за текущей.
 * Между задачами браузер волен отрисовать кадр — по этой отметке видно,
 * уложилась ли работа React в один синхронный проход.
 */
export function afterCurrentTask(callback: () => void) {
  const channel = new MessageChannel()
  channel.port1.onmessage = () => {
    channel.port1.close()
    callback()
  }
  channel.port2.postMessage(null)
}

/** Искусственно нагружает поток — чтобы «тормоза» были видны глазом. */
export function burnCpu(ms: number) {
  const until = performance.now() + ms
  while (performance.now() < until) {
    /* блокируем главный поток */
  }
}

/**
 * Одна «дорогая» строка списка. Стоимость размазана по множеству компонентов
 * специально: конкурентный рендер React прерывается на границах компонентов,
 * а один длинный цикл внутри одного компонента прервать невозможно.
 */
export function SlowRow({ label, costMs }: { label: string; costMs: number }) {
  burnCpu(costMs)
  return <div className="list-row">{label}</div>
}
