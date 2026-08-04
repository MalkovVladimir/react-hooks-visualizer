import { useEffect, useEffectEvent, useState } from 'react'
import { Btn, Chip, LogPanel, Panel, Row, Split, Stage, useLogStore, type LogStore } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function Ticker({ stepSize }) {
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
// и каждый выбор шага сбрасывал бы таймер на новый круг.`

const TICK_MS = 1400

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
function TickerWithDep({ stepSize, log }: { stepSize: number; log: LogStore['log'] }) {
  const [total, setTotal] = useState(0)
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    log(`⟳ setInterval пересоздан (stepSize = ${stepSize})`, 'error')
    setRunId((value) => value + 1)
    const timerId = setInterval(() => setTotal((previous) => previous + stepSize), TICK_MS)
    return () => {
      log('🧹 clearInterval — круг сброшен', 'cleanup')
      clearInterval(timerId)
    }
  }, [stepSize, log])

  return (
    <>
      <div className="big-num">{total}</div>
      <Progress runId={runId} />
    </>
  )
}

/** Вариант с useEffectEvent: интервал живёт, но шаг всегда актуальный. */
function TickerWithEffectEvent({ stepSize, log }: { stepSize: number; log: LogStore['log'] }) {
  const [total, setTotal] = useState(0)

  const onTick = useEffectEvent(() => {
    setTotal((previous) => previous + stepSize)
  })

  useEffect(() => {
    log('✅ setInterval создан один раз', 'effect')
    const timerId = setInterval(onTick, TICK_MS)
    return () => clearInterval(timerId)
  }, [log])

  return (
    <>
      <div className="big-num">{total}</div>
      <Progress runId={0} />
    </>
  )
}

function Demo() {
  const logStore = useLogStore()
  const [stepSize, setStepSize] = useState(1)

  return (
    <Stage>
      <Row>
        <span className="label">шаг:</span>
        {[1, 10, 100].map((step) => (
          <Btn
            key={step}
            variant={step === stepSize ? 'primary' : 'default'}
            onClick={() => setStepSize(step)}
          >
            +{step}
          </Btn>
        ))}
        <span className="muted">переключайте шаг и смотрите на полоски прогресса</span>
      </Row>

      <Split>
        <Panel title="stepSize в зависимостях" tone="bad">
          <TickerWithDep stepSize={stepSize} log={logStore.log} />
          <div className="muted" style={{ marginTop: 10 }}>
            <Chip tone="bad">полоска прыгает в 0</Chip> каждая смена шага убивает интервал и заводит
            новый.
          </div>
        </Panel>

        <Panel title="useEffectEvent" tone="good">
          <TickerWithEffectEvent stepSize={stepSize} log={logStore.log} />
          <div className="muted" style={{ marginTop: 10 }}>
            <Chip tone="good">полоска не сбивается</Chip> интервал один на всё время жизни, а шаг
            читается свежий.
          </div>
        </Panel>
      </Split>

      <LogPanel store={logStore} empty="меняйте шаг — увидите, кто пересоздаёт таймер" />
    </Stage>
  )
}

export const useEffectEventDemo: HookDemo = {
  id: 'useEffectEvent',
  pkg: 'react',
  tagline: 'вырезать из эффекта не реактивную часть, чтобы он не перезапускался',
  code,
  Demo,
  notes: [
    'Эффект делится надвое: реактивное (от чего он должен перезапускаться) и «то, что просто надо сделать в момент события». Второе заворачивается в `useEffectEvent`.',
    'Функция из `useEffectEvent` всегда видит пропсы и состояние последнего рендера — устаревших замыканий не бывает.',
    'Её нельзя указывать в зависимостях и нельзя передавать наружу — только вызывать из эффектов того же компонента.',
    'Типичные применения: логирование посещения страницы с актуальным `userId`, уведомление с текущей темой, интервал с изменяемым шагом.',
    'Не заменяет `useCallback`: это не оптимизация, а разделение реактивной и не реактивной логики. Для обработчиков в JSX он не нужен.',
    'Стабильный API появился в React 19.2 (до этого жил как экспериментальный `experimental_useEffectEvent`).',
  ],
  since: '19.2',
}
