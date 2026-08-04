import { useState } from 'react'
import { Btn, Chip, Label, LogPanel, Row, Stage, useLogStore, useRenderCount } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function ClickCounter() {
  const [clickCount, setClickCount] = useState(0)

  // Три вызова с одним и тем же значением -> +1.
  // clickCount внутри обработчика "заморожен" на значении этого рендера.
  const addThreeByValue = () => {
    setClickCount(clickCount + 1)
    setClickCount(clickCount + 1)
    setClickCount(clickCount + 1)
  }

  // Три функции-апдейтера -> +3.
  // React применяет их по очереди к самому свежему значению.
  const addThreeByUpdater = () => {
    setClickCount(previous => previous + 1)
    setClickCount(previous => previous + 1)
    setClickCount(previous => previous + 1)
  }

  return (
    <>
      <output>{clickCount}</output>
      <button onClick={addThreeByValue}>+3 по значению</button>
      <button onClick={addThreeByUpdater}>+3 через updater</button>
    </>
  )
}`

function Demo() {
  const [clickCount, setClickCount] = useState(0)
  const renderCount = useRenderCount()
  const logStore = useLogStore()
  const log = logStore.log

  const addThreeByValue = () => {
    log(`клик: clickCount в этом рендере = ${clickCount}`, 'dim')
    setClickCount(clickCount + 1)
    setClickCount(clickCount + 1)
    setClickCount(clickCount + 1)
    log(`3 × setClickCount(${clickCount} + 1) → станет ${clickCount + 1}`, 'error')
  }

  const addThreeByUpdater = () => {
    setClickCount((previous) => previous + 1)
    setClickCount((previous) => previous + 1)
    setClickCount((previous) => previous + 1)
    log(`3 × setClickCount(p => p + 1) → станет ${clickCount + 3}`, 'effect')
  }

  return (
    <Stage>
      <Row>
        <div>
          <Label>clickCount</Label>
          <div className="big-num">{clickCount}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Chip tone="accent">рендеров: {renderCount}</Chip>
        </div>
      </Row>

      <Row>
        <Btn onClick={addThreeByValue}>+3 по значению</Btn>
        <Btn variant="primary" onClick={addThreeByUpdater}>
          +3 через updater
        </Btn>
        <Btn variant="ghost" onClick={() => setClickCount(0)}>
          сброс
        </Btn>
      </Row>

      <div className="muted">
        Обе кнопки вызывают <code className="inline-code">setClickCount</code> трижды. Одинаковый
        клик — разный результат: сравните счётчик и число рендеров.
      </div>

      <LogPanel store={logStore} empty="нажмите любую кнопку" />
    </Stage>
  )
}

export const useStateDemo: HookDemo = {
  id: 'useState',
  pkg: 'react',
  tagline: 'локальное состояние компонента',
  code,
  Demo,
  notes: [
    'Переменная состояния — снимок конкретного рендера. Внутри обработчика `clickCount` не изменится после `setClickCount`, поэтому три вызова «по значению» дают +1.',
    'Функция-апдейтер `p => p + 1` попадает в очередь и получает актуальное значение — так безопасно обновлять состояние, зависящее от предыдущего.',
    'Все `setState` из одного обработчика батчатся: три вызова = один ре-рендер (видно по счётчику рендеров).',
    'Если передать то же самое значение (`Object.is`), React может пропустить ре-рендер целиком.',
    'Ленивая инициализация: `useState(() => heavyInit())` — вычислится один раз, а не на каждом рендере.',
  ],
}
