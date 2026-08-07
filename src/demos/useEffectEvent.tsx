import { useEffect, useEffectEvent, useState } from 'react'
import { Btn, Chip, LogPanel, Panel, Row, Split, Stage, useLogStore, type LogStore } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'cut the non-reactive part out of an effect so it stops restarting',
    code: `function Ticker({ stepSize }) {
  const [total, setTotal] = useState(0)

  // The non-reactive part of the effect: it always sees a fresh stepSize
  // but is NOT a dependency, so the timer never restarts because of it.
  const onTick = useEffectEvent(() => {
    setTotal(previous => previous + stepSize)
  })

  useEffect(() => {
    const timerId = setInterval(onTick, 1000)
    return () => clearInterval(timerId)
  }, [])            // empty: the interval is created once

  return <output>{total}</output>
}

// Without useEffectEvent you would have to write [stepSize] —
// and every change of the step would reset the timer to a new round.`,
    stepLabel: 'step:',
    hint: 'switch the step and watch the progress bars',
    leftTitle: 'stepSize in the dependencies',
    rightTitle: 'useEffectEvent',
    leftChip: 'the bar jumps back to 0',
    rightChip: 'the bar never stutters',
    leftHint: 'every change of the step kills the interval and starts a new one.',
    rightHint: 'one interval for the whole lifetime, and the step is read fresh.',
    empty: 'change the step to see who recreates the timer',
    logRestart: (step: number) => `⟳ setInterval recreated (stepSize = ${step})`,
    logClear: '🧹 clearInterval — the round is lost',
    logOnce: '✅ setInterval created once',
    notes: [
      'An effect splits in two: the reactive part (what it should restart on) and “the thing that simply has to happen at that moment”. The second one goes into `useEffectEvent`.',
      'The function it returns always sees the props and state of the latest render — stale closures cannot happen.',
      'It must not be listed in dependencies and must not be passed outside — only called from effects of the same component.',
      'Typical uses: logging a page visit with the current `userId`, a notification with the current theme, an interval with a changing step.',
      'It is not a replacement for `useCallback`: this is not an optimisation but a split between reactive and non-reactive logic. Handlers in JSX do not need it.',
      'The stable API shipped in React 19.2 (before that it lived as the experimental `experimental_useEffectEvent`).',
    ],
  },
  ru: {
    tagline: 'вырезать из эффекта не реактивную часть, чтобы он не перезапускался',
    code: `function Ticker({ stepSize }) {
  const [total, setTotal] = useState(0)

  // Не реактивная часть эффекта: всегда видит свежий stepSize,
  // но НЕ является зависимостью — таймер от неё не перезапускается.
  const onTick = useEffectEvent(() => {
    setTotal(previous => previous + stepSize)
  })

  useEffect(() => {
    const timerId = setInterval(onTick, 1000)
    return () => clearInterval(timerId)
  }, [])            // пусто: интервал создаётся один раз

  return <output>{total}</output>
}

// Без useEffectEvent пришлось бы писать [stepSize] —
// и каждый выбор шага сбрасывал бы таймер на новый круг.`,
    stepLabel: 'шаг:',
    hint: 'переключайте шаг и смотрите на полоски прогресса',
    leftTitle: 'stepSize в зависимостях',
    rightTitle: 'useEffectEvent',
    leftChip: 'полоска прыгает в 0',
    rightChip: 'полоска не сбивается',
    leftHint: 'каждая смена шага убивает интервал и заводит новый.',
    rightHint: 'интервал один на всё время жизни, а шаг читается свежий.',
    empty: 'меняйте шаг — увидите, кто пересоздаёт таймер',
    logRestart: (step: number) => `⟳ setInterval пересоздан (stepSize = ${step})`,
    logClear: '🧹 clearInterval — круг сброшен',
    logOnce: '✅ setInterval создан один раз',
    notes: [
      'Эффект делится надвое: реактивное (от чего он должен перезапускаться) и «то, что просто надо сделать в момент события». Второе заворачивается в `useEffectEvent`.',
      'Функция из `useEffectEvent` всегда видит пропсы и состояние последнего рендера — устаревших замыканий не бывает.',
      'Её нельзя указывать в зависимостях и нельзя передавать наружу — только вызывать из эффектов того же компонента.',
      'Типичные применения: логирование посещения страницы с актуальным `userId`, уведомление с текущей темой, интервал с изменяемым шагом.',
      'Не заменяет `useCallback`: это не оптимизация, а разделение реактивной и не реактивной логики. Для обработчиков в JSX он не нужен.',
      'Стабильный API появился в React 19.2 (до этого жил как экспериментальный `experimental_useEffectEvent`).',
    ],
  },
}

const TICK_MS = 1400

type Labels = (typeof text)['en']

/** Прогресс-бар: наглядно видно, что таймер начал круг заново (смена key = рестарт анимации). */
function Progress({ runId }: { runId: number }) {
  return (
    <div className="bar-track" style={{ marginTop: 10 }}>
      <div
        key={runId}
        className="bar-fill running"
        style={{ ['--tick' as string]: `${TICK_MS}ms` }}
      />
    </div>
  )
}

/** Вариант «в лоб»: stepSize в зависимостях — интервал пересоздаётся. */
function TickerWithDep({
  stepSize,
  log,
  t,
}: {
  stepSize: number
  log: LogStore['log']
  t: Labels
}) {
  const [total, setTotal] = useState(0)
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    log(t.logRestart(stepSize), 'error')
    setRunId((value) => value + 1)
    const timerId = setInterval(() => setTotal((previous) => previous + stepSize), TICK_MS)
    return () => {
      log(t.logClear, 'cleanup')
      clearInterval(timerId)
    }
  }, [stepSize, log, t])

  return (
    <>
      <div className="big-num">{total}</div>
      <Progress runId={runId} />
    </>
  )
}

/** Вариант с useEffectEvent: интервал живёт, но шаг всегда актуальный. */
function TickerWithEffectEvent({
  stepSize,
  log,
  t,
}: {
  stepSize: number
  log: LogStore['log']
  t: Labels
}) {
  const [total, setTotal] = useState(0)

  const onTick = useEffectEvent(() => {
    setTotal((previous) => previous + stepSize)
  })

  useEffect(() => {
    log(t.logOnce, 'effect')
    const timerId = setInterval(onTick, TICK_MS)
    return () => clearInterval(timerId)
  }, [log, t])

  return (
    <>
      <div className="big-num">{total}</div>
      <Progress runId={0} />
    </>
  )
}

function Demo() {
  const t = useText(text)
  const logStore = useLogStore()
  const [stepSize, setStepSize] = useState(1)

  return (
    <Stage>
      <Row>
        <span className="label">{t.stepLabel}</span>
        {[1, 10, 100].map((step) => (
          <Btn
            key={step}
            variant={step === stepSize ? 'primary' : 'default'}
            onClick={() => setStepSize(step)}
          >
            +{step}
          </Btn>
        ))}
        <span className="muted">{t.hint}</span>
      </Row>

      <Split>
        <Panel title={t.leftTitle} tone="bad">
          <TickerWithDep stepSize={stepSize} log={logStore.log} t={t} />
          <div className="muted" style={{ marginTop: 10 }}>
            <Chip tone="bad">{t.leftChip}</Chip> {t.leftHint}
          </div>
        </Panel>

        <Panel title={t.rightTitle} tone="good">
          <TickerWithEffectEvent stepSize={stepSize} log={logStore.log} t={t} />
          <div className="muted" style={{ marginTop: 10 }}>
            <Chip tone="good">{t.rightChip}</Chip> {t.rightHint}
          </div>
        </Panel>
      </Split>

      <LogPanel store={logStore} empty={t.empty} />
    </Stage>
  )
}

export const useEffectEventDemo: HookDemo = {
  id: 'useEffectEvent',
  pkg: 'react',
  since: '19.2',
  text,
  Demo,
}
