import { useMemo, useRef, useState } from 'react'
import { Btn, Chip, Label, Panel, Row, Split, Stage } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'cache the result of a computation between renders',
    code: `function ProductList({ query }) {
  const [isCompact, setCompact] = useState(false)   // nothing to do with the search

  // Without useMemo: the heavy work repeats on EVERY render,
  // including the one caused by switching the list layout.
  const foundProducts = filterProducts(query)

  // With useMemo: the result comes from the cache until query changes.
  const foundProducts = useMemo(
    () => filterProducts(query),
    [query],
  )

  return <List items={foundProducts} compact={isCompact} />
}`,
    searchLabel: 'search',
    placeholder: 'try 12',
    compact: 'compact view',
    on: 'on',
    off: 'off',
    hint: 'The “compact view” button has nothing to do with the search, yet it re-renders the component. Watch whose recompute counter grows.',
    lastRun: (ms: number) => `last run: ${ms} ms`,
    recomputes: (count: number) => `recomputes: ${count}`,
    nothing: 'nothing found',
    withoutTitle: 'without useMemo',
    withTitle: 'with useMemo([query])',
    notes: [
      'The cache lives exactly until a dependency changes — and is dropped on unmount. It is an optimisation, not storage: React is allowed to throw it away.',
      'The second use is a stable reference. An object or array handed to a `memo` component or to a context `value` must stay the same between renders, otherwise memoisation further down does nothing.',
      'The function must be pure and take no arguments: `useMemo(() => calc(a, b), [a, b])`, not `useMemo(calc(a, b), ...)` — a common typo that computes everything immediately.',
      'It earns its place when the work is genuinely expensive (tens of milliseconds) or when reference stability matters. On `x * 2` it only adds work.',
      'Before memoising, check whether you can compute less: narrow the state, move the heavy part into its own component.',
      'React Compiler (React 19) can insert this memoisation for you — with it, a hand-written `useMemo` is unnecessary in most places.',
    ],
  },
  ru: {
    tagline: 'кешировать результат вычисления между рендерами',
    code: `function ProductList({ query }) {
  const [isCompact, setCompact] = useState(false)   // к поиску отношения не имеет

  // Без useMemo: тяжёлый расчёт повторяется на КАЖДОМ рендере,
  // в том числе когда переключили вид списка.
  const foundProducts = filterProducts(query)

  // С useMemo: результат берётся из кеша, пока query не изменился.
  const foundProducts = useMemo(
    () => filterProducts(query),
    [query],
  )

  return <List items={foundProducts} compact={isCompact} />
}`,
    searchLabel: 'поиск',
    placeholder: 'например 12',
    compact: 'сжатый вид',
    on: 'вкл',
    off: 'выкл',
    hint: 'Кнопка «сжатый вид» к поиску не относится, но вызывает ре-рендер. Смотрите, у кого растёт счётчик пересчётов.',
    lastRun: (ms: number) => `последний расчёт: ${ms} мс`,
    recomputes: (count: number) => `пересчётов: ${count}`,
    nothing: 'ничего не найдено',
    withoutTitle: 'без useMemo',
    withTitle: 'с useMemo([query])',
    notes: [
      'Кеш живёт ровно до изменения зависимостей — и сбрасывается при размонтировании. Это оптимизация, а не хранилище: React вправе выбросить кеш.',
      'Второе применение — стабильная ссылка. Объект или массив, отданный в `memo`-компонент или в `value` контекста, должен быть тем же между рендерами, иначе мемоизация ниже не работает.',
      'Функция внутри должна быть чистой и без аргументов: `useMemo(() => calc(a, b), [a, b])`, а не `useMemo(calc(a, b), ...)` — это частая опечатка, которая вычисляет всё сразу.',
      'Смысл появляется, когда расчёт действительно дорогой (десятки миллисекунд) или когда важна ссылочная стабильность. На `x * 2` он только добавит работы.',
      'Прежде чем мемоизировать, посмотрите, нельзя ли вычислять меньше: сузить состояние, вынести тяжёлое в отдельный компонент.',
      'React Compiler (React 19) умеет расставлять такую мемоизацию сам — тогда ручной `useMemo` в большинстве мест не нужен.',
    ],
  },
}

const PRODUCTS = Array.from({ length: 4000 }, (_, index) => `item-${index}`)
const WORK_ITERATIONS = 9_000_000

/** Честно тяжёлая функция: считает «релевантность» перебором. */
function filterProducts(query: string) {
  const startedAt = performance.now()
  const found = PRODUCTS.filter((name) => name.includes(query))
  let relevance = 0
  for (let index = 0; index < WORK_ITERATIONS; index++) relevance += Math.sqrt(index % 97)
  return { found, relevance, ms: Math.round(performance.now() - startedAt) }
}

type Labels = (typeof text)['en']

function Result({
  result,
  computeCount,
  isCompact,
  t,
}: {
  result: ReturnType<typeof filterProducts>
  computeCount: number
  isCompact: boolean
  t: Labels
}) {
  return (
    <>
      <Row>
        <Chip tone={result.ms > 40 ? 'bad' : 'good'}>{t.lastRun(result.ms)}</Chip>
        <Chip tone="accent">{t.recomputes(computeCount)}</Chip>
      </Row>
      <div className="list-scroll" style={{ marginTop: 10, height: 110 }}>
        {result.found.slice(0, isCompact ? 6 : 30).map((name) => (
          <div className="list-row" key={name}>
            {name}
          </div>
        ))}
        {result.found.length === 0 && <div className="list-row">{t.nothing}</div>}
      </div>
    </>
  )
}

function WithoutMemo({ query, isCompact, t }: { query: string; isCompact: boolean; t: Labels }) {
  const computeCount = useRef(0)
  const result = filterProducts(query)
  computeCount.current += 1
  return <Result result={result} computeCount={computeCount.current} isCompact={isCompact} t={t} />
}

function WithMemo({ query, isCompact, t }: { query: string; isCompact: boolean; t: Labels }) {
  const computeCount = useRef(0)
  const result = useMemo(() => {
    computeCount.current += 1
    return filterProducts(query)
  }, [query])
  return <Result result={result} computeCount={computeCount.current} isCompact={isCompact} t={t} />
}

function Demo() {
  const t = useText(text)
  const [query, setQuery] = useState('7')
  const [isCompact, setIsCompact] = useState(false)

  return (
    <Stage>
      <Row>
        <Label>{t.searchLabel}</Label>
        <input
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.placeholder}
        />
        <Btn variant={isCompact ? 'primary' : 'default'} onClick={() => setIsCompact((v) => !v)}>
          {t.compact}: {isCompact ? t.on : t.off}
        </Btn>
      </Row>

      <div className="muted">{t.hint}</div>

      <Split>
        <Panel title={t.withoutTitle} tone="bad">
          <WithoutMemo query={query} isCompact={isCompact} t={t} />
        </Panel>
        <Panel title={t.withTitle} tone="good">
          <WithMemo query={query} isCompact={isCompact} t={t} />
        </Panel>
      </Split>
    </Stage>
  )
}

export const useMemoDemo: HookDemo = { id: 'useMemo', pkg: 'react', text, Demo }
