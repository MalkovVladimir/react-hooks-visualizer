import { memo, useDeferredValue, useState } from 'react'
import { Chip, Panel, Rich, Row, SlowRow, Split, Stage } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'show the previous result while the new one is computed in the background',
    code: `function SearchPage() {
  const [query, setQuery] = useState('')

  // A "lagging copy" of the value: React renders the old one first,
  // prepares the new one in the background and swaps it in when ready.
  const deferredQuery = useDeferredValue(query)

  // While the two differ, the screen shows a stale result.
  const isStale = query !== deferredQuery

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />

      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        {/* SlowResults is wrapped in memo — otherwise it re-renders with the parent */}
        <SlowResults query={deferredQuery} />
      </div>
    </>
  )
}`,
    placeholder: 'type — and watch the two values below',
    urgentTitle: 'query — the urgent value',
    deferredTitle: 'deferredQuery — the deferred one',
    urgentHint: 'updates on every keystroke',
    deferredHint: 'catches up when React has spare time',
    staleChip: 'the values diverged → a stale result is on screen',
    freshChip: 'the values match → the result is current',
    listTitle: (ms: number) => `heavy list · render ≈ ${ms} ms`,
    match: (query: string, index: number) => `${query} — match ${index}`,
    all: 'everything',
    hint: 'The list only ever receives `deferredQuery`, so it never slows down typing: while the background render is running, the dimmed previous result stays on screen.',
    notes: [
      'The hook returns a lagging copy of a value. First comes a fast render with the old copy, then React prepares a render with the new one in the background and swaps it in.',
      'The background render is interruptible: if the user types another character, the work started so far is thrown away and everything restarts from the new value.',
      'Comparing `value !== deferredValue` is the official way to know that the screen holds stale data and to dim it.',
      'The difference from `useTransition`: there you own the code that calls `setState` and wrap it; here you only own the value — it may have arrived as a prop.',
      'The heavy component is the one that must receive the deferred value. If it is not wrapped in `memo`, it re-renders with its parent anyway and the point is lost.',
      'Another use is with Suspense: a deferred value keeps the list from collapsing into a fallback on every new request.',
    ],
  },
  ru: {
    tagline: 'показать прошлый результат, пока новый считается в фоне',
    code: `function SearchPage() {
  const [query, setQuery] = useState('')

  // «Отложенная копия» значения: сначала React отрисует старую,
  // а новую досчитает в фоне и покажет, когда будет готова.
  const deferredQuery = useDeferredValue(query)

  // Пока значения не совпали — на экране устаревший результат.
  const isStale = query !== deferredQuery

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />

      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        {/* SlowResults обёрнут в memo — иначе он перерисуется вместе с родителем */}
        <SlowResults query={deferredQuery} />
      </div>
    </>
  )
}`,
    placeholder: 'печатайте — и следите за двумя значениями ниже',
    urgentTitle: 'query — срочное значение',
    deferredTitle: 'deferredQuery — отложенное',
    urgentHint: 'обновляется на каждое нажатие',
    deferredHint: 'догоняет, когда у React появляется свободное время',
    staleChip: 'значения разошлись → показан устаревший результат',
    freshChip: 'значения совпали → результат актуален',
    listTitle: (ms: number) => `тяжёлый список · рендер ≈ ${ms} мс`,
    match: (query: string, index: number) => `${query} — совпадение ${index}`,
    all: 'всё',
    hint: 'Список получает только `deferredQuery`, поэтому он не тормозит ввод: пока идёт фоновый рендер, показан приглушённый прошлый результат.',
    notes: [
      'Хук возвращает «отстающую копию» значения. Сначала идёт быстрый рендер со старой копией, затем React в фоне готовит рендер с новой и подменяет её.',
      'Фоновый рендер прерываемый: если пользователь набрал ещё символ, начатая работа выбрасывается и всё начинается с нового значения.',
      'Сравнение `value !== deferredValue` — официальный способ узнать, что на экране устаревшие данные, и приглушить их.',
      'Отличие от `useTransition`: там вы владеете кодом, который вызывает `setState`, и оборачиваете его; здесь вы владеете только значением — например, оно пришло пропом.',
      'Тяжёлым должен быть компонент, который получает отложенное значение. Если он не обёрнут в `memo`, он всё равно перерисуется вместе с родителем и смысл пропадёт.',
      'Ещё применение — с Suspense: отложенное значение не даёт списку схлопнуться в fallback при каждом новом запросе.',
    ],
  },
}

const ROWS = 40
const COST_PER_ROW_MS = 4
const COST_MS = ROWS * COST_PER_ROW_MS

// memo обязателен: иначе список перерисуется вместе с родителем,
// несмотря на то что deferredQuery не изменился.
const SlowResults = memo(function SlowResults({
  query,
  label,
}: {
  query: string
  label: (query: string, index: number) => string
}) {
  return (
    <div className="list-scroll" style={{ height: 130 }}>
      {Array.from({ length: ROWS }, (_, index) => (
        <SlowRow key={index} costMs={COST_PER_ROW_MS} label={label(query, index + 1)} />
      ))}
    </div>
  )
})

function Demo() {
  const t = useText(text)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery

  return (
    <Stage>
      <Row>
        <input
          className="input"
          style={{ flex: 1 }}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.placeholder}
        />
      </Row>

      <Split>
        <Panel title={t.urgentTitle} tone="good">
          <div className="big-num" style={{ fontSize: 18 }}>
            «{query || '∅'}»
          </div>
          <div className="muted">{t.urgentHint}</div>
        </Panel>

        <Panel title={t.deferredTitle} tone={isStale ? 'bad' : 'good'}>
          <div className="big-num" style={{ fontSize: 18 }}>
            «{deferredQuery || '∅'}»
          </div>
          <div className="muted">{t.deferredHint}</div>
        </Panel>
      </Split>

      <Row>
        {isStale ? <Chip tone="warn">{t.staleChip}</Chip> : <Chip tone="good">{t.freshChip}</Chip>}
      </Row>

      <Panel title={t.listTitle(COST_MS)}>
        <div className={isStale ? 'stale' : undefined}>
          <SlowResults query={deferredQuery || t.all} label={t.match} />
        </div>
      </Panel>

      <div className="muted">
        <Rich>{t.hint}</Rich>
      </div>
    </Stage>
  )
}

export const useDeferredValueDemo: HookDemo = {
  id: 'useDeferredValue',
  pkg: 'react',
  since: '18',
  text,
  Demo,
}
