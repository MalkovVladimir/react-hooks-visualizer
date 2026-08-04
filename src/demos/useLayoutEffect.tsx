import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Btn,
  Chip,
  LogPanel,
  Panel,
  Row,
  Split,
  Stage,
  createLogStore,
  nextPaint,
  type LogStore,
} from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function Tooltip() {
  const [top, setTop] = useState(0)   // первый рендер: подсказка в углу
  const bubble = useRef(null)

  // useLayoutEffect выполняется сразу после коммита и синхронно:
  // setState внутри перерисовывает компонент ДО отрисовки, поэтому
  // первый же кадр, который увидит пользователь, уже правильный.
  useLayoutEffect(() => {
    const height = bubble.current.offsetHeight
    setTop(ANCHOR_TOP - height - 10)
  }, [])

  // Тот же код в useEffect выполнится после того, как кадр уйдёт
  // браузеру. Сколько кадров успеет показать подсказку в позиции 0 —
  // зависит от нагрузки, но их всегда как минимум может быть один.

  return <div ref={bubble} style={{ position: 'absolute', top }}>подсказка</div>
}`

const ANCHOR_TOP = 84
// Пауза задана временем, а не числом кадров: в свёрнутой вкладке браузер
// кадров не рисует вовсе, и демо не должно из-за этого зависать.
const SLOW_MOTION_MS = 700

type Trace = { log: LogStore['log']; startedAt: number }

function useTraceMark(trace: Trace) {
  return (text: string, kind: Parameters<LogStore['log']>[1] = 'dim') =>
    trace.log(`+${(performance.now() - trace.startedAt).toFixed(1)} мс · ${text}`, kind)
}

/** Считает кадры, отрисованные с момента монтирования. */
function useFrameCounter() {
  const frames = useRef(0)
  const [, forceRender] = useState(0)

  useEffect(() => {
    let isStopped = false
    let request = 0
    const tick = () => {
      if (isStopped) return
      frames.current += 1
      forceRender((value) => value + 1)
      request = requestAnimationFrame(tick)
    }
    request = requestAnimationFrame(tick)
    return () => {
      isStopped = true
      cancelAnimationFrame(request)
    }
  }, [])

  return frames
}

function BubbleView({
  top,
  bubbleRef,
  badFrames,
}: {
  top: number
  bubbleRef: React.RefObject<HTMLDivElement | null>
  badFrames: number | null
}) {
  return (
    <>
      <div className="tooltip-area">
        <div className="tooltip-bubble" ref={bubbleRef} style={{ top, left: 16 }}>
          подсказка ↓
        </div>
        <div className="anchor-dot" style={{ top: ANCHOR_TOP + 4, left: 16 }}>
          якорь
        </div>
      </div>
      <Row>
        {badFrames === null ? (
          <Chip>подсказка не смонтирована</Chip>
        ) : (
          <Chip tone={badFrames > 0 ? 'bad' : 'good'}>
            кадров с неправильной позицией: {badFrames}
          </Chip>
        )}
      </Row>
    </>
  )
}

/**
 * Замер в useEffect — после отрисовки.
 * В режиме замедленной съёмки перед замером мы честно уступаем браузеру кадры:
 * процессор свободен, просто ждём отрисовку, и промежуточное состояние видно глазом.
 */
function BubbleAfterPaint({ trace, isSlowMotion }: { trace: Trace; isSlowMotion: boolean }) {
  const [top, setTop] = useState(0)
  const [badFrames, setBadFrames] = useState<number | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const frames = useFrameCounter()
  const mark = useTraceMark(trace)
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    isFirstRender.current = false
    mark('render — подсказка в позиции 0', 'render')
    queueMicrotask(() => mark('микрозадача после рендера', 'dim'))
  }

  useEffect(() => {
    let isCancelled = false

    const run = async () => {
      if (isSlowMotion) {
        mark(`замедленная съёмка: уступаем браузеру кадры ${SLOW_MOTION_MS} мс`, 'paint')
        const until = performance.now() + SLOW_MOTION_MS
        while (performance.now() < until) {
          await nextPaint()
          if (isCancelled) return
          setBadFrames(frames.current)
        }
      }
      const height = bubbleRef.current?.offsetHeight ?? 0
      mark(`useEffect: замер ${height}px → setTop`, 'effect')
      setBadFrames(frames.current)
      setTop(ANCHOR_TOP - height - 10)
    }

    setBadFrames(frames.current)
    void run()
    return () => {
      isCancelled = true
    }
  }, [])

  return <BubbleView top={top} bubbleRef={bubbleRef} badFrames={badFrames} />
}

/**
 * Замер в useLayoutEffect — до отрисовки.
 * Здесь уступить кадр невозможно в принципе: хук синхронный, и всё,
 * что он делает, происходит до того, как браузер получит кадр.
 */
function BubbleBeforePaint({ trace }: { trace: Trace }) {
  const [top, setTop] = useState(0)
  const [badFrames, setBadFrames] = useState<number | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const frames = useFrameCounter()
  const mark = useTraceMark(trace)
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    isFirstRender.current = false
    mark('render — подсказка в позиции 0', 'render')
    queueMicrotask(() => mark('микрозадача после рендера', 'dim'))
  }

  useLayoutEffect(() => {
    const height = bubbleRef.current?.offsetHeight ?? 0
    mark(`useLayoutEffect: замер ${height}px → setTop`, 'effect')
    setBadFrames(frames.current)
    setTop(ANCHOR_TOP - height - 10)
  }, [])

  return <BubbleView top={top} bubbleRef={bubbleRef} badFrames={badFrames} />
}

function Demo() {
  const [tick, setTick] = useState(0)
  const [isSlowMotion, setIsSlowMotion] = useState(true)
  const [stores] = useState(() => ({ after: createLogStore(14), before: createLogStore(14) }))
  const startedAt = useRef(0)

  const mount = () => {
    stores.after.clear()
    stores.before.clear()
    startedAt.current = performance.now()
    setTick((value) => value + 1)
  }

  return (
    <Stage>
      <Row>
        <Btn variant="primary" onClick={mount}>
          {tick === 0 ? 'смонтировать подсказку' : 'смонтировать заново'}
        </Btn>
        <Btn variant={isSlowMotion ? 'primary' : 'default'} onClick={() => setIsSlowMotion(true)}>
          замедленная съёмка
        </Btn>
        <Btn variant={isSlowMotion ? 'default' : 'primary'} onClick={() => setIsSlowMotion(false)}>
          обычный темп
        </Btn>
      </Row>

      <div className="muted">
        {isSlowMotion ? (
          <>
            Перед замером левая панель {SLOW_MOTION_MS} мс подряд ждёт{' '}
            <code className="inline-code">requestAnimationFrame</code> — процессор свободен, просто
            проходят настоящие кадры. Так растянут тот самый промежуток, который в обычном темпе
            длится один кадр.
          </>
        ) : (
          <>
            Обычный темп: на незагруженной странице React часто успевает выполнить эффект в том же
            проходе, и разрыв не ловится вовсе — сравните отметки времени в лентах, разница будет
            около миллисекунды. Именно поэтому «иногда мигает, а иногда нет»: гарантий, что кадр не
            проскочит, <code className="inline-code">useEffect</code> не даёт.
          </>
        )}
      </div>

      <Split>
        <Panel title="замер в useEffect — после отрисовки" tone="bad">
          {tick > 0 ? (
            <BubbleAfterPaint
              key={tick}
              isSlowMotion={isSlowMotion}
              trace={{ log: stores.after.log, startedAt: startedAt.current }}
            />
          ) : (
            <BubbleView top={0} bubbleRef={{ current: null }} badFrames={null} />
          )}
          <div style={{ marginTop: 10 }}>
            <LogPanel store={stores.after} empty="нажмите «смонтировать подсказку»" />
          </div>
        </Panel>

        <Panel title="замер в useLayoutEffect — до отрисовки" tone="good">
          {tick > 0 ? (
            <BubbleBeforePaint
              key={tick}
              trace={{ log: stores.before.log, startedAt: startedAt.current }}
            />
          ) : (
            <BubbleView top={0} bubbleRef={{ current: null }} badFrames={null} />
          )}
          <div style={{ marginTop: 10 }}>
            <LogPanel store={stores.before} empty="нажмите «смонтировать подсказку»" />
          </div>
        </Panel>
      </Split>

      <div className="muted">
        Справа уступить кадр нечему: layout-эффект синхронный, его нельзя «подождать» — поэтому там
        всегда 0 кадров с неправильной позицией, при любых настройках и любой нагрузке.
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
    '`setState` внутри layout-эффекта перерисовывает компонент в том же синхронном проходе, поэтому промежуточное состояние на экран не попадает. Тот же код в `useEffect` даёт лишний коммит уже после кадра — вот его браузер и успевает показать.',
    'Насколько заметно мигание — вопрос нагрузки: на пустой странице лишний кадр часто проскакивает незаметно, под нагрузкой превращается в явный прыжок. Правило простое: измеряете layout — берите `useLayoutEffect`.',
    'Замедленная съёмка в демо не нагружает процессор: она просто ждёт настоящие кадры через `requestAnimationFrame`. Растягивается только пауза, порядок хуков остаётся ровно таким же.',
    'Он блокирует отрисовку: тяжёлая работа внутри = замерший интерфейс. Держите его коротким.',
    'При SSR не выполняется — сервер ничего не рисует. Если код обязан отработать и там, вынесите его в `useEffect` или отрисуйте первый вариант без замеров.',
    'Позиционирование, которое умеет CSS (`position: sticky`, anchor positioning), лучше отдать CSS: никакой JS не угонится за компоновкой браузера.',
  ],
}
