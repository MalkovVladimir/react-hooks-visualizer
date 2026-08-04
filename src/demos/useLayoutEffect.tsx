import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Btn,
  Chip,
  LogPanel,
  Panel,
  Row,
  Split,
  Stage,
  afterCurrentTask,
  createLogStore,
  type LogStore,
} from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function Tooltip() {
  const [top, setTop] = useState(0)   // первый рендер: подсказка в углу
  const bubble = useRef(null)

  // useLayoutEffect: замер и setState проходят в том же синхронном
  // проходе, что и коммит. Браузер физически не может показать
  // промежуточный кадр — он получает уже исправленную позицию.
  useLayoutEffect(() => {
    const height = bubble.current.offsetHeight
    setTop(ANCHOR_TOP - height - 10)
  }, [])

  // useEffect: React отдаёт кадр браузеру и выполняет эффект
  // отдельной задачей. Между ними браузер вправе отрисовать
  // подсказку в позиции 0 — это и есть «мигание».

  return <div ref={bubble} style={{ position: 'absolute', top }}>подсказка</div>
}`

const ANCHOR_TOP = 84

type Trace = { log: LogStore['log']; startedAt: number }

function useTraceMark(trace: Trace) {
  return (text: string, kind: Parameters<LogStore['log']>[1] = 'dim') =>
    trace.log(`+${(performance.now() - trace.startedAt).toFixed(1)} мс · ${text}`, kind)
}

/** Замер после отрисовки: эффект выполняется отдельной задачей. */
function BubbleAfterPaint({ trace }: { trace: Trace }) {
  const [top, setTop] = useState(0)
  const bubble = useRef<HTMLDivElement>(null)
  const mark = useTraceMark(trace)
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    isFirstRender.current = false
    mark('render — подсказка в позиции 0', 'render')
    afterCurrentTask(() => mark('⚡ задача завершилась — браузер свободен', 'paint'))
    requestAnimationFrame(() => mark('🖼 кадр отрисован', 'paint'))
  }

  useEffect(() => {
    mark(`useEffect: замер offsetHeight = ${bubble.current?.offsetHeight}px → setTop`, 'effect')
    setTop(ANCHOR_TOP - (bubble.current?.offsetHeight ?? 0) - 10)
  }, [])

  useLayoutEffect(() => {
    if (top !== 0) mark('коммит исправленной позиции', 'cleanup')
  }, [top])

  return (
    <div className="tooltip-bubble" ref={bubble} style={{ top, left: 16 }}>
      подсказка ↓
    </div>
  )
}

/** Замер до отрисовки: всё укладывается в один синхронный проход. */
function BubbleBeforePaint({ trace }: { trace: Trace }) {
  const [top, setTop] = useState(0)
  const bubble = useRef<HTMLDivElement>(null)
  const mark = useTraceMark(trace)
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    isFirstRender.current = false
    mark('render — подсказка в позиции 0', 'render')
    afterCurrentTask(() => mark('⚡ задача завершилась — браузер свободен', 'paint'))
    requestAnimationFrame(() => mark('🖼 кадр отрисован', 'paint'))
  }

  useLayoutEffect(() => {
    mark(`useLayoutEffect: замер offsetHeight = ${bubble.current?.offsetHeight}px → setTop`, 'effect')
    setTop(ANCHOR_TOP - (bubble.current?.offsetHeight ?? 0) - 10)
  }, [])

  useLayoutEffect(() => {
    if (top !== 0) mark('коммит исправленной позиции', 'cleanup')
  }, [top])

  return (
    <div className="tooltip-bubble" ref={bubble} style={{ top, left: 16 }}>
      подсказка ↓
    </div>
  )
}

function Area({ children }: { children: React.ReactNode }) {
  return (
    <div className="tooltip-area">
      {children}
      <div className="anchor-dot" style={{ top: ANCHOR_TOP + 4, left: 16 }}>
        якорь
      </div>
    </div>
  )
}

function Demo() {
  const [tick, setTick] = useState(0)
  const [stores] = useState(() => ({ after: createLogStore(12), before: createLogStore(12) }))

  const mount = () => {
    stores.after.clear()
    stores.before.clear()
    setTick((value) => value + 1)
  }

  const startedAt = performance.now()

  return (
    <Stage>
      <Row>
        <Btn variant="primary" onClick={mount}>
          {tick === 0 ? 'смонтировать подсказку' : 'смонтировать заново'}
        </Btn>
        <span className="muted">
          ленты ниже пишут реальные отметки времени этого монтирования
        </span>
      </Row>

      <Split>
        <Panel title="замер в useEffect" tone="bad">
          <Area>
            {tick > 0 && (
              <BubbleAfterPaint key={tick} trace={{ log: stores.after.log, startedAt }} />
            )}
          </Area>
          <div style={{ marginTop: 10 }}>
            <LogPanel store={stores.after} empty="нажмите «смонтировать подсказку»" />
          </div>
          <Row>
            <Chip tone="bad">срабатывает последним</Chip>
          </Row>
        </Panel>

        <Panel title="замер в useLayoutEffect" tone="good">
          <Area>
            {tick > 0 && (
              <BubbleBeforePaint key={tick} trace={{ log: stores.before.log, startedAt }} />
            )}
          </Area>
          <div style={{ marginTop: 10 }}>
            <LogPanel store={stores.before} empty="нажмите «смонтировать подсказку»" />
          </div>
          <Row>
            <Chip tone="good">срабатывает до отрисовки</Chip>
          </Row>
        </Panel>
      </Split>

      <div className="muted">
        Ленты показывают реальные отметки вашего браузера, а не заготовленный сценарий. Гарантия
        такая: layout-эффект успевает до отрисовки кадра, обычный эффект — после. Успеет ли браузер
        показать промежуточный кадр с подсказкой в позиции 0, зависит от нагрузки: на пустой
        странице лишний кадр часто проскакивает незаметно, под нагрузкой он и превращается в
        заметное мигание.
      </div>
    </Stage>
  )
}

export const useLayoutEffectDemo: HookDemo = {
  id: 'useLayoutEffect',
  pkg: 'react',
  tagline: 'измерить DOM и поправить его до того, как браузер отрисует кадр',
  code,
  Demo,
  notes: [
    'Порядок такой: React обновил DOM → `useLayoutEffect` (синхронно) → браузер рисует → `useEffect`.',
    '`setState` внутри layout-эффекта перерисовывает компонент в том же синхронном проходе, поэтому промежуточное состояние на экран не попадает. Тот же код в `useEffect` даёт лишний коммит отдельной задачей — вот его браузер и может успеть нарисовать.',
    'Насколько заметно мигание — вопрос везения и нагрузки: на быстрой машине лишний кадр часто проскакивает незаметно, под нагрузкой становится хорошо виден. Поэтому правило простое: измеряете layout — берите `useLayoutEffect`.',
    'Он блокирует отрисовку: тяжёлая работа внутри = замерший интерфейс. Держите его коротким.',
    'При SSR не выполняется — сервер ничего не рисует. Если код обязан отработать и там, вынесите его в `useEffect` или отрисуйте первый вариант без замеров.',
    'Позиционирование, которое умеет CSS (`position: sticky`, anchor positioning), лучше отдать CSS: никакой JS не угонится за компоновкой браузера.',
  ],
}
