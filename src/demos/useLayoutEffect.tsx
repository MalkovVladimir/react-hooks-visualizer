import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Btn,
  Chip,
  LogPanel,
  Panel,
  Rich,
  Row,
  Split,
  Stage,
  createLogStore,
  nextPaint,
  type LogStore,
} from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'measure the DOM and fix it before the browser paints',
    code: `function Tooltip() {
  const [top, setTop] = useState(0)   // first render: the tooltip sits in the corner
  const bubble = useRef(null)

  // useLayoutEffect runs right after the commit, synchronously:
  // setState inside it re-renders before the paint, so the very
  // first frame the user sees is already the correct one.
  useLayoutEffect(() => {
    const height = bubble.current.offsetHeight
    setTop(ANCHOR_TOP - height - 10)
  }, [])

  // The same code in useEffect runs after the frame has gone to the
  // browser. How many frames show the tooltip at position 0 depends
  // on the load — but there can always be at least one.

  return <div ref={bubble} style={{ position: 'absolute', top }}>tooltip</div>
}`,
    bubble: 'tooltip ↓',
    anchor: 'anchor',
    mount: 'mount the tooltip',
    remount: 'mount it again',
    slowMotion: 'slow motion',
    realTime: 'real time',
    notMounted: 'tooltip is not mounted',
    badFrames: (count: number) => `frames shown at the wrong position: ${count}`,
    slowHint: (ms: number) =>
      `Before measuring, the left panel waits on \`requestAnimationFrame\` for ${ms} ms — the CPU is idle, real frames just go by. That stretches out the very gap that normally lasts a single frame.`,
    realHint:
      'Real time: on an idle page React often runs the effect within the same pass and the gap never opens at all — compare the timestamps in the two timelines, the difference is about a millisecond. That is why it “sometimes flickers and sometimes does not”: `useEffect` gives you no guarantee that a frame will not slip through.',
    leftTitle: 'measured in useEffect — after the paint',
    rightTitle: 'measured in useLayoutEffect — before the paint',
    empty: 'press “mount the tooltip”',
    footer:
      'On the right there is no frame to yield: a layout effect is synchronous and cannot be awaited — which is why it always shows 0 wrong frames, under any settings and any load.',
    logRender: 'render — tooltip at position 0',
    logMicrotask: 'microtask queued during render',
    logSlow: (ms: number) => `slow motion: yielding frames to the browser for ${ms} ms`,
    logEffect: (height: number) => `useEffect: measured ${height}px → setTop`,
    logLayout: (height: number) => `useLayoutEffect: measured ${height}px → setTop`,
    notes: [
      'The order is: React updates the DOM → `useLayoutEffect` (synchronously) → the browser paints → `useEffect`.',
      '`setState` inside a layout effect re-renders within the same synchronous pass, so the intermediate state never reaches the screen. The same code in `useEffect` produces an extra commit after the frame — and that is what the browser gets to show.',
      'How visible the flicker is depends on load: on an empty page the extra frame often slips by unnoticed, under load it turns into an obvious jump. The rule is simple: if you measure layout, use `useLayoutEffect`.',
      'Slow motion in this demo puts no load on the CPU: it simply waits for real frames via `requestAnimationFrame`. Only the pause is stretched — the order of the hooks stays exactly the same.',
      'It blocks painting: heavy work inside means a frozen interface. Keep it short.',
      'It does not run during SSR — the server paints nothing. If the code must run there too, move it to `useEffect` or render a first pass that needs no measurements.',
      'Positioning that CSS can do (`position: sticky`, anchor positioning) is better left to CSS: no JavaScript keeps up with the browser’s own layout.',
    ],
  },
  ru: {
    tagline: 'измерить DOM и поправить его до того, как браузер отрисует кадр',
    code: `function Tooltip() {
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
}`,
    bubble: 'подсказка ↓',
    anchor: 'якорь',
    mount: 'смонтировать подсказку',
    remount: 'смонтировать заново',
    slowMotion: 'замедленная съёмка',
    realTime: 'обычный темп',
    notMounted: 'подсказка не смонтирована',
    badFrames: (count: number) => `кадров с неправильной позицией: ${count}`,
    slowHint: (ms: number) =>
      `Перед замером левая панель ${ms} мс подряд ждёт \`requestAnimationFrame\` — процессор свободен, просто проходят настоящие кадры. Так растянут тот самый промежуток, который в обычном темпе длится один кадр.`,
    realHint:
      'Обычный темп: на незагруженной странице React часто успевает выполнить эффект в том же проходе, и разрыв не ловится вовсе — сравните отметки времени в лентах, разница будет около миллисекунды. Именно поэтому «иногда мигает, а иногда нет»: гарантий, что кадр не проскочит, `useEffect` не даёт.',
    leftTitle: 'замер в useEffect — после отрисовки',
    rightTitle: 'замер в useLayoutEffect — до отрисовки',
    empty: 'нажмите «смонтировать подсказку»',
    footer:
      'Справа уступить кадр нечему: layout-эффект синхронный, его нельзя «подождать» — поэтому там всегда 0 кадров с неправильной позицией, при любых настройках и любой нагрузке.',
    logRender: 'render — подсказка в позиции 0',
    logMicrotask: 'микрозадача после рендера',
    logSlow: (ms: number) => `замедленная съёмка: уступаем браузеру кадры ${ms} мс`,
    logEffect: (height: number) => `useEffect: замер ${height}px → setTop`,
    logLayout: (height: number) => `useLayoutEffect: замер ${height}px → setTop`,
    notes: [
      'Порядок такой: React обновил DOM → `useLayoutEffect` (синхронно) → браузер рисует → `useEffect`.',
      '`setState` внутри layout-эффекта перерисовывает компонент в том же синхронном проходе, поэтому промежуточное состояние на экран не попадает. Тот же код в `useEffect` даёт лишний коммит уже после кадра — вот его браузер и успевает показать.',
      'Насколько заметно мигание — вопрос нагрузки: на пустой странице лишний кадр часто проскакивает незаметно, под нагрузкой превращается в явный прыжок. Правило простое: измеряете layout — берите `useLayoutEffect`.',
      'Замедленная съёмка в демо не нагружает процессор: она просто ждёт настоящие кадры через `requestAnimationFrame`. Растягивается только пауза, порядок хуков остаётся ровно таким же.',
      'Он блокирует отрисовку: тяжёлая работа внутри = замерший интерфейс. Держите его коротким.',
      'При SSR не выполняется — сервер ничего не рисует. Если код обязан отработать и там, вынесите его в `useEffect` или отрисуйте первый вариант без замеров.',
      'Позиционирование, которое умеет CSS (`position: sticky`, anchor positioning), лучше отдать CSS: никакой JS не угонится за компоновкой браузера.',
    ],
  },
}

const ANCHOR_TOP = 84
// Пауза задана временем, а не числом кадров: в свёрнутой вкладке браузер
// кадров не рисует вовсе, и демо не должно из-за этого зависать.
const SLOW_MOTION_MS = 700

type Labels = (typeof text)['en']
type Trace = { log: LogStore['log']; startedAt: number }

function useTraceMark(trace: Trace) {
  return (message: string, kind: Parameters<LogStore['log']>[1] = 'dim') =>
    trace.log(`+${(performance.now() - trace.startedAt).toFixed(1)} ms · ${message}`, kind)
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
  t,
}: {
  top: number
  bubbleRef: React.RefObject<HTMLDivElement | null>
  badFrames: number | null
  t: Labels
}) {
  return (
    <>
      <div className="tooltip-area">
        <div className="tooltip-bubble" ref={bubbleRef} style={{ top, left: 16 }}>
          {t.bubble}
        </div>
        <div className="anchor-dot" style={{ top: ANCHOR_TOP + 4, left: 16 }}>
          {t.anchor}
        </div>
      </div>
      <Row>
        {badFrames === null ? (
          <Chip>{t.notMounted}</Chip>
        ) : (
          <Chip tone={badFrames > 0 ? 'bad' : 'good'}>{t.badFrames(badFrames)}</Chip>
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
function BubbleAfterPaint({
  trace,
  isSlowMotion,
  t,
}: {
  trace: Trace
  isSlowMotion: boolean
  t: Labels
}) {
  const [top, setTop] = useState(0)
  const [badFrames, setBadFrames] = useState<number | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const frames = useFrameCounter()
  const mark = useTraceMark(trace)
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    isFirstRender.current = false
    mark(t.logRender, 'render')
    queueMicrotask(() => mark(t.logMicrotask, 'dim'))
  }

  useEffect(() => {
    let isCancelled = false

    const run = async () => {
      if (isSlowMotion) {
        mark(t.logSlow(SLOW_MOTION_MS), 'paint')
        const until = performance.now() + SLOW_MOTION_MS
        while (performance.now() < until) {
          await nextPaint()
          if (isCancelled) return
          setBadFrames(frames.current)
        }
      }
      const height = bubbleRef.current?.offsetHeight ?? 0
      mark(t.logEffect(height), 'effect')
      setBadFrames(frames.current)
      setTop(ANCHOR_TOP - height - 10)
    }

    setBadFrames(frames.current)
    void run()
    return () => {
      isCancelled = true
    }
  }, [])

  return <BubbleView top={top} bubbleRef={bubbleRef} badFrames={badFrames} t={t} />
}

/**
 * Замер в useLayoutEffect — до отрисовки.
 * Здесь уступить кадр невозможно в принципе: хук синхронный, и всё,
 * что он делает, происходит до того, как браузер получит кадр.
 */
function BubbleBeforePaint({ trace, t }: { trace: Trace; t: Labels }) {
  const [top, setTop] = useState(0)
  const [badFrames, setBadFrames] = useState<number | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const frames = useFrameCounter()
  const mark = useTraceMark(trace)
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    isFirstRender.current = false
    mark(t.logRender, 'render')
    queueMicrotask(() => mark(t.logMicrotask, 'dim'))
  }

  useLayoutEffect(() => {
    const height = bubbleRef.current?.offsetHeight ?? 0
    mark(t.logLayout(height), 'effect')
    setBadFrames(frames.current)
    setTop(ANCHOR_TOP - height - 10)
  }, [])

  return <BubbleView top={top} bubbleRef={bubbleRef} badFrames={badFrames} t={t} />
}

function Demo() {
  const t = useText(text)
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
          {tick === 0 ? t.mount : t.remount}
        </Btn>
        <Btn variant={isSlowMotion ? 'primary' : 'default'} onClick={() => setIsSlowMotion(true)}>
          {t.slowMotion}
        </Btn>
        <Btn variant={isSlowMotion ? 'default' : 'primary'} onClick={() => setIsSlowMotion(false)}>
          {t.realTime}
        </Btn>
      </Row>

      <div className="muted">
        <Rich>{isSlowMotion ? t.slowHint(SLOW_MOTION_MS) : t.realHint}</Rich>
      </div>

      <Split>
        <Panel title={t.leftTitle} tone="bad">
          {tick > 0 ? (
            <BubbleAfterPaint
              key={tick}
              isSlowMotion={isSlowMotion}
              t={t}
              trace={{ log: stores.after.log, startedAt: startedAt.current }}
            />
          ) : (
            <BubbleView top={0} bubbleRef={{ current: null }} badFrames={null} t={t} />
          )}
          <div style={{ marginTop: 12 }}>
            <LogPanel store={stores.after} empty={t.empty} />
          </div>
        </Panel>

        <Panel title={t.rightTitle} tone="good">
          {tick > 0 ? (
            <BubbleBeforePaint
              key={tick}
              t={t}
              trace={{ log: stores.before.log, startedAt: startedAt.current }}
            />
          ) : (
            <BubbleView top={0} bubbleRef={{ current: null }} badFrames={null} t={t} />
          )}
          <div style={{ marginTop: 12 }}>
            <LogPanel store={stores.before} empty={t.empty} />
          </div>
        </Panel>
      </Split>

      <div className="muted">{t.footer}</div>
    </Stage>
  )
}

export const useLayoutEffectDemo: HookDemo = { id: 'useLayoutEffect', pkg: 'react', text, Demo }
