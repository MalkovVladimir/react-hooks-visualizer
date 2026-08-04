import { useEffect, useState, useSyncExternalStore } from 'react'
import { Btn, Chip, Panel, Row, Split, Stage } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `// Стор живёт вне React и меняется сам по себе.
const priceStore = {
  subscribe(onChange) {
    const timerId = setInterval(() => { price = next(); onChange() }, 1000)
    return () => clearInterval(timerId)      // отписка
  },
  getSnapshot: () => price,                  // должен вернуть то же значение, если ничего не менялось
  getServerSnapshot: () => 0,                // для SSR
}

// Правильно: React сам подпишется в нужный момент и сравнит снимки.
function Ticker() {
  const price = useSyncExternalStore(
    priceStore.subscribe,
    priceStore.getSnapshot,
    priceStore.getServerSnapshot,
  )
  return <b>{price} ₽</b>
}

// Наивно: подписка оформляется уже ПОСЛЕ отрисовки, поэтому
// первый кадр показывает значение по умолчанию, а изменения
// между рендером и эффектом теряются.
function NaiveTicker() {
  const [price, setPrice] = useState(0)
  useEffect(() => priceStore.subscribe(() => setPrice(priceStore.getSnapshot())), [])
  return <b>{price} ₽</b>
}`

/* ------------------------- внешний стор: обычный JS, про React ничего не знает */

const TICK_MS = 1200
let price = 1000
let ticks = 0
const listeners = new Set<() => void>()
let timerId: ReturnType<typeof setInterval> | null = null

const priceStore = {
  subscribe(onChange: () => void) {
    listeners.add(onChange)
    if (!timerId) {
      timerId = setInterval(() => {
        ticks += 1
        price = 1000 + Math.round(Math.sin(ticks / 3) * 120) + (ticks % 7)
        listeners.forEach((listener) => listener())
      }, TICK_MS)
    }
    return () => {
      listeners.delete(onChange)
      if (listeners.size === 0 && timerId) {
        clearInterval(timerId)
        timerId = null
      }
    }
  },
  getSnapshot: () => price,
  getServerSnapshot: () => 1000,
}

/* ------------------------------------------------------------------ подписчики */

function CorrectTicker() {
  const value = useSyncExternalStore(
    priceStore.subscribe,
    priceStore.getSnapshot,
    priceStore.getServerSnapshot,
  )
  return (
    <>
      <div className="big-num">{value} ₽</div>
      <Chip tone="good">верно с первого кадра</Chip>
    </>
  )
}

function NaiveTicker() {
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => priceStore.subscribe(() => setValue(priceStore.getSnapshot())), [])

  return (
    <>
      <div className="big-num">{value === null ? '—' : `${value} ₽`}</div>
      {value === null ? (
        <Chip tone="bad">ждём первого события стора</Chip>
      ) : (
        <Chip tone="warn">данные появились только со следующим тиком</Chip>
      )}
    </>
  )
}

function Demo() {
  const [mountKey, setMountKey] = useState(1)
  const [isMounted, setIsMounted] = useState(true)

  return (
    <Stage>
      <Row>
        <Btn variant="primary" onClick={() => setMountKey((key) => key + 1)}>
          перемонтировать оба
        </Btn>
        <Btn onClick={() => setIsMounted((value) => !value)}>
          {isMounted ? 'отписаться (unmount)' : 'подписаться (mount)'}
        </Btn>
        <Chip>стор тикает каждые {TICK_MS} мс</Chip>
      </Row>

      <div className="muted">
        Нажмите «перемонтировать» — левая панель до {TICK_MS} мс показывает прочерк, правая берёт
        актуальное значение сразу при рендере.
      </div>

      {isMounted ? (
        <Split>
          <Panel title="useEffect + useState (наивно)" tone="bad">
            <NaiveTicker key={mountKey} />
          </Panel>
          <Panel title="useSyncExternalStore" tone="good">
            <CorrectTicker key={mountKey} />
          </Panel>
        </Split>
      ) : (
        <div className="box muted">
          подписчиков нет — стор остановил свой таймер (это делает функция очистки из subscribe)
        </div>
      )}
    </Stage>
  )
}

export const useSyncExternalStoreDemo: HookDemo = {
  id: 'useSyncExternalStore',
  pkg: 'react',
  tagline: 'подписка на состояние вне React — без потерянных и рассинхронизированных значений',
  code,
  Demo,
  notes: [
    'Три аргумента: `subscribe(onChange)` возвращает функцию отписки, `getSnapshot()` отдаёт текущее значение, третий — снимок для сервера при SSR.',
    '`getSnapshot` обязан возвращать то же самое значение (`Object.is`), пока стор не изменился. Если каждый раз собирать новый объект — получите бесконечный цикл рендеров.',
    'React читает снимок во время рендера, поэтому значение верно с первого кадра — и не может «разъехаться» между компонентами при конкурентном рендеринге (это и есть tearing).',
    '`subscribe` должна быть стабильной функцией. Объявите её вне компонента или заверните в `useCallback`, иначе React будет переподписываться на каждом рендере.',
    'Типичные источники: собственный стор состояния, `window.matchMedia`, `navigator.onLine`, `localStorage`, WebSocket. Для браузерных API есть `useSyncExternalStore` — не городите `useEffect`.',
    'Обновления из внешнего стора всегда синхронные: пометить их как не срочные через `startTransition` нельзя.',
  ],
  since: '18',
}
