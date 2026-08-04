import { useMemo, useRef, useState } from 'react'
import { Btn, Chip, Label, Panel, Row, Split, Stage } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function ProductList({ query }) {
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
}`

const PRODUCTS = Array.from({ length: 4000 }, (_, index) => `товар-${index}`)
const WORK_ITERATIONS = 9_000_000

/** Честно тяжёлая функция: считает «релевантность» перебором. */
function filterProducts(query: string) {
  const startedAt = performance.now()
  const found = PRODUCTS.filter((name) => name.includes(query))
  let relevance = 0
  for (let index = 0; index < WORK_ITERATIONS; index++) relevance += Math.sqrt(index % 97)
  return { found, relevance, ms: Math.round(performance.now() - startedAt) }
}

function Result({
  result,
  computeCount,
  isCompact,
}: {
  result: ReturnType<typeof filterProducts>
  computeCount: number
  isCompact: boolean
}) {
  return (
    <>
      <Row>
        <Chip tone={result.ms > 40 ? 'bad' : 'good'}>последний расчёт: {result.ms} мс</Chip>
        <Chip tone="accent">пересчётов: {computeCount}</Chip>
      </Row>
      <div className="list-scroll" style={{ marginTop: 10, height: 110 }}>
        {result.found.slice(0, isCompact ? 6 : 30).map((name) => (
          <div className="list-row" key={name}>
            {name}
          </div>
        ))}
        {result.found.length === 0 && <div className="list-row">ничего не найдено</div>}
      </div>
    </>
  )
}

function WithoutMemo({ query, isCompact }: { query: string; isCompact: boolean }) {
  const computeCount = useRef(0)
  const result = filterProducts(query)
  computeCount.current += 1
  return <Result result={result} computeCount={computeCount.current} isCompact={isCompact} />
}

function WithMemo({ query, isCompact }: { query: string; isCompact: boolean }) {
  const computeCount = useRef(0)
  const result = useMemo(() => {
    computeCount.current += 1
    return filterProducts(query)
  }, [query])
  return <Result result={result} computeCount={computeCount.current} isCompact={isCompact} />
}

function Demo() {
  const [query, setQuery] = useState('7')
  const [isCompact, setIsCompact] = useState(false)

  return (
    <Stage>
      <Row>
        <Label>поиск</Label>
        <input
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="например 12"
        />
        <Btn variant={isCompact ? 'primary' : 'default'} onClick={() => setIsCompact((v) => !v)}>
          сжатый вид: {isCompact ? 'вкл' : 'выкл'}
        </Btn>
      </Row>

      <div className="muted">
        Кнопка «сжатый вид» к поиску не относится, но вызывает ре-рендер. Смотрите, у кого растёт
        счётчик пересчётов.
      </div>

      <Split>
        <Panel title="без useMemo" tone="bad">
          <WithoutMemo query={query} isCompact={isCompact} />
        </Panel>
        <Panel title="с useMemo([query])" tone="good">
          <WithMemo query={query} isCompact={isCompact} />
        </Panel>
      </Split>
    </Stage>
  )
}

export const useMemoDemo: HookDemo = {
  id: 'useMemo',
  pkg: 'react',
  tagline: 'кешировать результат вычисления между рендерами',
  code,
  Demo,
  notes: [
    'Кеш живёт ровно до изменения зависимостей — и сбрасывается при размонтировании. Это оптимизация, а не хранилище: React вправе выбросить кеш.',
    'Второе применение — стабильная ссылка. Объект или массив, отданный в `memo`-компонент или в `value` контекста, должен быть тем же между рендерами, иначе мемоизация ниже не работает.',
    'Функция внутри должна быть чистой и без аргументов: `useMemo(() => calc(a, b), [a, b])`, а не `useMemo(calc(a, b), ...)` — это частая опечатка, которая вычисляет всё сразу.',
    'Смысл появляется, когда расчёт действительно дорогой (десятки миллисекунд) или когда важна ссылочная стабильность. На `x * 2` он только добавит работы.',
    'Прежде чем мемоизировать, посмотрите, нельзя ли вычислять меньше: сузить состояние, вынести тяжёлое в отдельный компонент.',
    'React Compiler (React 19) умеет расставлять такую мемоизацию сам — тогда ручной `useMemo` в большинстве мест не нужен.',
  ],
}
