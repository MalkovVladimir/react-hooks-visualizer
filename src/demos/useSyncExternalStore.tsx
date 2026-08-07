import { useEffect, useState, useSyncExternalStore } from 'react'
import { Btn, Chip, Panel, Row, Split, Stage } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'subscribe to state outside React — no lost or torn values',
    code: `// The store lives outside React and changes on its own.
const priceStore = {
  subscribe(onChange) {
    const timerId = setInterval(() => { price = next(); onChange() }, 1000)
    return () => clearInterval(timerId)      // unsubscribe
  },
  getSnapshot: () => price,                  // must return the same value if nothing changed
  getServerSnapshot: () => 0,                // for SSR
}

// Correct: React subscribes at the right moment and compares snapshots itself.
function Ticker() {
  const price = useSyncExternalStore(
    priceStore.subscribe,
    priceStore.getSnapshot,
    priceStore.getServerSnapshot,
  )
  return <b>{price}</b>
}

// Naive: the subscription is set up AFTER the paint, so the first frame
// shows the default value and any change between render and effect is lost.
function NaiveTicker() {
  const [price, setPrice] = useState(0)
  useEffect(() => priceStore.subscribe(() => setPrice(priceStore.getSnapshot())), [])
  return <b>{price}</b>
}`,
    correct: 'correct at once',
    money: (value: number) => `$${value}`,
    waiting: 'no value yet',
    late: 'arrived a tick late',
    remount: 'remount both',
    unsubscribe: 'unsubscribe (unmount)',
    subscribe: 'subscribe (mount)',
    ticks: (ms: number) => `the store ticks every ${ms} ms`,
    hint: (ms: number) =>
      `Press “remount” — the left panel shows a dash for up to ${ms} ms, while the right one picks up the current value during the render itself.`,
    naiveTitle: 'useEffect + useState (naive)',
    naiveNote:
      'The subscription is set up after the paint, so the first frame has no value at all and the data only shows up on the next tick of the store.',
    correctNote:
      'React reads the snapshot during the render itself, so the value is right in the very first frame.',
    correctTitle: 'useSyncExternalStore',
    noSubscribers:
      'no subscribers — the store stopped its own timer (that is what the cleanup returned from subscribe does)',
    notes: [
      'Three arguments: `subscribe(onChange)` returns an unsubscribe function, `getSnapshot()` returns the current value, and the third is the snapshot used on the server during SSR.',
      '`getSnapshot` must return the very same value (`Object.is`) while the store has not changed. Build a new object every call and you get an infinite render loop.',
      'React reads the snapshot during rendering, so the value is correct from the first frame — and cannot drift apart between components during concurrent rendering (that is what tearing means).',
      '`subscribe` must be a stable function. Declare it outside the component or wrap it in `useCallback`, otherwise React resubscribes on every render.',
      'Typical sources: your own state store, `window.matchMedia`, `navigator.onLine`, `localStorage`, a WebSocket. Browser APIs have `useSyncExternalStore` — do not hand-roll a `useEffect`.',
      'Updates from an external store are always synchronous: you cannot mark them as non-urgent with `startTransition`.',
    ],
  },
  ru: {
    tagline: 'подписка на состояние вне React — без потерянных и рассинхронизированных значений',
    code: `// Стор живёт вне React и меняется сам по себе.
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
}`,
    correct: 'верно сразу',
    money: (value: number) => `${value} ₽`,
    waiting: 'значения ещё нет',
    late: 'пришло на тик позже',
    remount: 'перемонтировать оба',
    unsubscribe: 'отписаться (unmount)',
    subscribe: 'подписаться (mount)',
    ticks: (ms: number) => `стор тикает каждые ${ms} мс`,
    hint: (ms: number) =>
      `Нажмите «перемонтировать» — левая панель до ${ms} мс показывает прочерк, правая берёт актуальное значение сразу при рендере.`,
    naiveTitle: 'useEffect + useState (наивно)',
    naiveNote:
      'Подписка оформляется после отрисовки, поэтому в первом кадре значения нет вовсе, а данные появляются только со следующим тиком стора.',
    correctNote:
      'React читает снимок прямо во время рендера, поэтому значение верно уже в первом кадре.',
    correctTitle: 'useSyncExternalStore',
    noSubscribers:
      'подписчиков нет — стор остановил свой таймер (это делает функция очистки из subscribe)',
    notes: [
      'Три аргумента: `subscribe(onChange)` возвращает функцию отписки, `getSnapshot()` отдаёт текущее значение, третий — снимок для сервера при SSR.',
      '`getSnapshot` обязан возвращать то же самое значение (`Object.is`), пока стор не изменился. Если каждый раз собирать новый объект — получите бесконечный цикл рендеров.',
      'React читает снимок во время рендера, поэтому значение верно с первого кадра — и не может «разъехаться» между компонентами при конкурентном рендеринге (это и есть tearing).',
      '`subscribe` должна быть стабильной функцией. Объявите её вне компонента или заверните в `useCallback`, иначе React будет переподписываться на каждом рендере.',
      'Типичные источники: собственный стор состояния, `window.matchMedia`, `navigator.onLine`, `localStorage`, WebSocket. Для браузерных API есть `useSyncExternalStore` — не городите `useEffect`.',
      'Обновления из внешнего стора всегда синхронные: пометить их как не срочные через `startTransition` нельзя.',
    ],
  },
}

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

type Labels = (typeof text)['en']

function CorrectTicker({ label, money }: { label: string; money: Labels['money'] }) {
  const value = useSyncExternalStore(
    priceStore.subscribe,
    priceStore.getSnapshot,
    priceStore.getServerSnapshot,
  )
  return (
    <>
      <div className="big-num">{money(value)}</div>
      <Chip tone="good">{label}</Chip>
    </>
  )
}

function NaiveTicker({
  waiting,
  late,
  money,
}: {
  waiting: string
  late: string
  money: Labels['money']
}) {
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => priceStore.subscribe(() => setValue(priceStore.getSnapshot())), [])

  return (
    <>
      <div className="big-num">{value === null ? '—' : money(value)}</div>
      {value === null ? <Chip tone="bad">{waiting}</Chip> : <Chip tone="warn">{late}</Chip>}
    </>
  )
}

function Demo() {
  const t = useText(text)
  const [mountKey, setMountKey] = useState(1)
  const [isMounted, setIsMounted] = useState(true)

  return (
    <Stage>
      <Row>
        <Btn variant="primary" onClick={() => setMountKey((key) => key + 1)}>
          {t.remount}
        </Btn>
        <Btn onClick={() => setIsMounted((value) => !value)}>
          {isMounted ? t.unsubscribe : t.subscribe}
        </Btn>
        <Chip>{t.ticks(TICK_MS)}</Chip>
      </Row>

      <div className="muted">{t.hint(TICK_MS)}</div>

      {isMounted ? (
        <Split>
          <Panel title={t.naiveTitle} tone="bad">
            <NaiveTicker key={mountKey} waiting={t.waiting} late={t.late} money={t.money} />
            <div className="muted" style={{ marginTop: 10 }}>
              {t.naiveNote}
            </div>
          </Panel>
          <Panel title={t.correctTitle} tone="good">
            <CorrectTicker key={mountKey} label={t.correct} money={t.money} />
            <div className="muted" style={{ marginTop: 10 }}>
              {t.correctNote}
            </div>
          </Panel>
        </Split>
      ) : (
        <div className="box muted">{t.noSubscribers}</div>
      )}
    </Stage>
  )
}

export const useSyncExternalStoreDemo: HookDemo = {
  id: 'useSyncExternalStore',
  pkg: 'react',
  since: '18',
  text,
  Demo,
}
