import { memo, useCallback, useState } from 'react'
import { Btn, Chip, Panel, RenderFlash, Row, Split, Stage, useRenderCount } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'keep the same function reference between renders',
    code: `// memo compares props by reference and skips the render if nothing changed.
const ExpensiveList = memo(function ExpensiveList({ onSelect }) {
  return <button onClick={() => onSelect('id-1')}>select</button>
})

function Page() {
  const [unrelatedCount, setUnrelated] = useState(0)

  // A brand-new function on every render -> the prop changes -> memo is useless.
  const handleSelectPlain = (id) => console.log(id)

  // The very same function until the dependencies change -> memo works.
  const handleSelectStable = useCallback((id) => console.log(id), [])

  return (
    <>
      <button onClick={() => setUnrelated(c => c + 1)}>+1 to the counter above</button>
      <ExpensiveList onSelect={handleSelectPlain} />   {/* re-renders every time */}
      <ExpensiveList onSelect={handleSelectStable} />  {/* stays put */}
    </>
  )
}`,
    renders: (count: number) => `renders: ${count}`,
    select: 'select an item',
    bump: (count: number) => `+1 to an unrelated counter (${count})`,
    selected: (value: string) => `selected: ${value}`,
    hint: 'The counter lives in the parent and has nothing to do with the lists. Click it and watch which panel flashes.',
    plainTitle: 'a plain function',
    stableTitle: 'useCallback([])',
    plainProp: 'the onSelect prop is a new reference every time',
    stableProp: 'the onSelect prop is the same reference',
    notes: [
      'This is `useMemo` for a function: `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.',
      'On its own it speeds up nothing. It pays off only when the function is passed to a `memo` component, into effect dependencies, or into a context `value`.',
      'The function closes over the values of the render that created it. Forget a dependency and the handler will work with stale state.',
      'When updating state from such a function, use the `setValue(previous => ...)` form — then you do not depend on the current value and the dependency list stays empty.',
      'If an effect needs the function but must not restart because of it, that is a case for `useEffectEvent`, not `useCallback`.',
      'React Compiler does this memoisation automatically: with it, a hand-written `useCallback` is redundant in most components.',
    ],
  },
  ru: {
    tagline: 'сохранить ссылку на функцию между рендерами',
    code: `// memo сравнивает пропсы по ссылке и пропускает рендер, если они не изменились.
const ExpensiveList = memo(function ExpensiveList({ onSelect }) {
  return <button onClick={() => onSelect('id-1')}>выбрать</button>
})

function Page() {
  const [unrelatedCount, setUnrelated] = useState(0)

  // Новая функция на каждом рендере -> проп меняется -> memo бесполезен.
  const handleSelectPlain = (id) => console.log(id)

  // Та же самая функция, пока зависимости не изменились -> memo работает.
  const handleSelectStable = useCallback((id) => console.log(id), [])

  return (
    <>
      <button onClick={() => setUnrelated(c => c + 1)}>+1 к счётчику сверху</button>
      <ExpensiveList onSelect={handleSelectPlain} />   {/* ре-рендерится всегда */}
      <ExpensiveList onSelect={handleSelectStable} />  {/* стоит на месте */}
    </>
  )
}`,
    renders: (count: number) => `рендеров: ${count}`,
    select: 'выбрать элемент',
    bump: (count: number) => `+1 к несвязанному счётчику (${count})`,
    selected: (value: string) => `выбрано: ${value}`,
    hint: 'Счётчик живёт в родителе и к спискам отношения не имеет. Жмите — и смотрите, какая панель вспыхивает.',
    plainTitle: 'обычная функция',
    stableTitle: 'useCallback([])',
    plainProp: 'проп onSelect — новая ссылка каждый раз',
    stableProp: 'проп onSelect — та же ссылка',
    notes: [
      'Это `useMemo` для функции: `useCallback(fn, deps)` эквивалентен `useMemo(() => fn, deps)`.',
      'Сам по себе он ничего не ускоряет. Польза появляется только если функция уходит пропом в `memo`-компонент, в зависимости эффекта или в `value` контекста.',
      'Функция замыкает значения того рендера, в котором была создана. Забыли зависимость — обработчик будет работать со старым состоянием.',
      'Обновляя состояние из такой функции, используйте форму `setValue(previous => ...)` — тогда зависимость от текущего значения не нужна и список деп остаётся пустым.',
      'Если функция нужна эффекту, но не должна его перезапускать — это случай не для `useCallback`, а для `useEffectEvent`.',
      'React Compiler делает такую мемоизацию автоматически: с ним ручной `useCallback` в большинстве компонентов лишний.',
    ],
  },
}

const ExpensiveList = memo(function ExpensiveList({
  onSelect,
  title,
  renderLabel,
  selectLabel,
}: {
  onSelect: (id: string) => void
  title: string
  renderLabel: (count: number) => string
  selectLabel: string
}) {
  const renderCount = useRenderCount()
  return (
    <RenderFlash>
      <Row>
        <Chip tone="accent">{renderLabel(renderCount)}</Chip>
        <span className="muted">{title}</span>
      </Row>
      <Row>
        <Btn onClick={() => onSelect('id-1')}>{selectLabel}</Btn>
      </Row>
    </RenderFlash>
  )
})

function Demo() {
  const t = useText(text)
  const [unrelatedCount, setUnrelatedCount] = useState(0)
  const [selected, setSelected] = useState('—')

  const handleSelectPlain = (id: string) => setSelected(`${id} (plain)`)
  const handleSelectStable = useCallback((id: string) => setSelected(`${id} (stable)`), [])

  return (
    <Stage>
      <Row>
        <Btn variant="primary" onClick={() => setUnrelatedCount((count) => count + 1)}>
          {t.bump(unrelatedCount)}
        </Btn>
        <Chip>{t.selected(selected)}</Chip>
      </Row>

      <div className="muted">{t.hint}</div>

      <Split>
        <Panel title={t.plainTitle} tone="bad">
          <ExpensiveList
            onSelect={handleSelectPlain}
            title={t.plainProp}
            renderLabel={t.renders}
            selectLabel={t.select}
          />
        </Panel>
        <Panel title={t.stableTitle} tone="good">
          <ExpensiveList
            onSelect={handleSelectStable}
            title={t.stableProp}
            renderLabel={t.renders}
            selectLabel={t.select}
          />
        </Panel>
      </Split>
    </Stage>
  )
}

export const useCallbackDemo: HookDemo = { id: 'useCallback', pkg: 'react', text, Demo }
