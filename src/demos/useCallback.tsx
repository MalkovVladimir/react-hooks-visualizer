import { memo, useCallback, useState } from 'react'
import { Btn, Chip, Panel, RenderFlash, Row, Split, Stage, useRenderCount } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `// memo сравнивает пропсы по ссылке и пропускает рендер, если они не изменились.
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
}`

const ExpensiveList = memo(function ExpensiveList({
  onSelect,
  title,
}: {
  onSelect: (id: string) => void
  title: string
}) {
  const renderCount = useRenderCount()
  return (
    <RenderFlash>
      <Row>
        <Chip tone="accent">рендеров: {renderCount}</Chip>
        <span className="muted">{title}</span>
      </Row>
      <Row>
        <Btn onClick={() => onSelect('id-1')}>выбрать элемент</Btn>
      </Row>
    </RenderFlash>
  )
})

function Demo() {
  const [unrelatedCount, setUnrelatedCount] = useState(0)
  const [selected, setSelected] = useState('—')

  const handleSelectPlain = (id: string) => setSelected(`${id} (plain)`)
  const handleSelectStable = useCallback((id: string) => setSelected(`${id} (stable)`), [])

  return (
    <Stage>
      <Row>
        <Btn variant="primary" onClick={() => setUnrelatedCount((count) => count + 1)}>
          +1 к несвязанному счётчику ({unrelatedCount})
        </Btn>
        <Chip>выбрано: {selected}</Chip>
      </Row>

      <div className="muted">
        Счётчик живёт в родителе и к спискам отношения не имеет. Жмите — и смотрите, какая панель
        вспыхивает.
      </div>

      <Split>
        <Panel title="обычная функция" tone="bad">
          <ExpensiveList onSelect={handleSelectPlain} title="проп onSelect — новая ссылка каждый раз" />
        </Panel>
        <Panel title="useCallback([])" tone="good">
          <ExpensiveList onSelect={handleSelectStable} title="проп onSelect — та же ссылка" />
        </Panel>
      </Split>
    </Stage>
  )
}

export const useCallbackDemo: HookDemo = {
  id: 'useCallback',
  pkg: 'react',
  tagline: 'сохранить ссылку на функцию между рендерами',
  code,
  Demo,
  notes: [
    'Это `useMemo` для функции: `useCallback(fn, deps)` эквивалентен `useMemo(() => fn, deps)`.',
    'Сам по себе он ничего не ускоряет. Польза появляется только если функция уходит пропом в `memo`-компонент, в зависимости эффекта или в `value` контекста.',
    'Функция замыкает значения того рендера, в котором была создана. Забыли зависимость — обработчик будет работать со старым состоянием.',
    'Обновляя состояние из такой функции, используйте форму `setValue(previous => ...)` — тогда зависимость от текущего значения не нужна и список деп остаётся пустым.',
    'Если функция нужна эффекту, но не должна его перезапускать — это случай не для `useCallback`, а для `useEffectEvent`.',
    'React Compiler делает такую мемоизацию автоматически: с ним ручной `useCallback` в большинстве компонентов лишний.',
  ],
}
