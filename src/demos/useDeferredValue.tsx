import { memo, useDeferredValue, useState } from 'react'
import { Chip, Panel, Row, SlowRow, Split, Stage } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function SearchPage() {
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
}`

const ROWS = 40
const COST_PER_ROW_MS = 4
const COST_MS = ROWS * COST_PER_ROW_MS

// memo обязателен: иначе список перерисуется вместе с родителем,
// несмотря на то что deferredQuery не изменился.
const SlowResults = memo(function SlowResults({ query }: { query: string }) {
  return (
    <div className="list-scroll" style={{ height: 130 }}>
      {Array.from({ length: ROWS }, (_, index) => (
        <SlowRow key={index} costMs={COST_PER_ROW_MS} label={`${query || 'всё'} — совпадение ${index + 1}`} />
      ))}
    </div>
  )
})

function Demo() {
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
          placeholder="печатайте — и следите за двумя значениями ниже"
        />
      </Row>

      <Split>
        <Panel title="query — срочное значение" tone="good">
          <div className="big-num" style={{ fontSize: 18 }}>
            «{query || '∅'}»
          </div>
          <div className="muted">обновляется на каждое нажатие</div>
        </Panel>

        <Panel title="deferredQuery — отложенное" tone={isStale ? 'bad' : 'good'}>
          <div className="big-num" style={{ fontSize: 18 }}>
            «{deferredQuery || '∅'}»
          </div>
          <div className="muted">догоняет, когда у React появляется свободное время</div>
        </Panel>
      </Split>

      <Row>
        {isStale ? (
          <Chip tone="warn">значения разошлись → показан устаревший результат</Chip>
        ) : (
          <Chip tone="good">значения совпали → результат актуален</Chip>
        )}
      </Row>

      <Panel title={`тяжёлый список · рендер ≈ ${COST_MS} мс`}>
        <div className={isStale ? 'stale' : undefined}>
          <SlowResults query={deferredQuery} />
        </div>
      </Panel>

      <div className="muted">
        Список получает только <code className="inline-code">deferredQuery</code>, поэтому он не
        тормозит ввод: пока идёт фоновый рендер, показан приглушённый прошлый результат.
      </div>
    </Stage>
  )
}

export const useDeferredValueDemo: HookDemo = {
  id: 'useDeferredValue',
  pkg: 'react',
  tagline: 'показать прошлый результат, пока новый считается в фоне',
  code,
  Demo,
  notes: [
    'Хук возвращает «отстающую копию» значения. Сначала идёт быстрый рендер со старой копией, затем React в фоне готовит рендер с новой и подменяет её.',
    'Фоновый рендер прерываемый: если пользователь набрал ещё символ, начатая работа выбрасывается и всё начинается с нового значения.',
    'Сравнение `value !== deferredValue` — официальный способ узнать, что на экране устаревшие данные, и приглушить их.',
    'Отличие от `useTransition`: там вы владеете кодом, который вызывает `setState`, и оборачиваете его; здесь вы владеете только значением — например, оно пришло пропом.',
    'Тяжёлым должен быть компонент, который получает отложенное значение. Если он не обёрнут в `memo`, он всё равно перерисуется вместе с родителем и смысл пропадёт.',
    'Ещё применение — с Suspense: отложенное значение не даёт списку схлопнуться в fallback при каждом новом запросе.',
  ],
  since: '18',
}
