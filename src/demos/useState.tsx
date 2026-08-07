import { useState } from 'react'
import { Btn, Chip, Label, LogPanel, Rich, Row, Stage, useLogStore, useRenderCount } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'local state of a component',
    code: `function ClickCounter() {
  const [clickCount, setClickCount] = useState(0)

  // Three calls with the same value -> +1.
  // Inside the handler clickCount is frozen at this render's value.
  const addThreeByValue = () => {
    setClickCount(clickCount + 1)
    setClickCount(clickCount + 1)
    setClickCount(clickCount + 1)
  }

  // Three updater functions -> +3.
  // React applies them in order, each to the freshest value.
  const addThreeByUpdater = () => {
    setClickCount(previous => previous + 1)
    setClickCount(previous => previous + 1)
    setClickCount(previous => previous + 1)
  }

  return (
    <>
      <output>{clickCount}</output>
      <button onClick={addThreeByValue}>+3 by value</button>
      <button onClick={addThreeByUpdater}>+3 by updater</button>
    </>
  )
}`,
    renders: 'renders',
    byValue: '+3 by value',
    byUpdater: '+3 by updater',
    reset: 'reset',
    hint: 'Both buttons call `setClickCount` three times. Same click, different outcome — compare the counter and the number of renders.',
    empty: 'press either button',
    logClick: (value: number) => `click: clickCount in this render = ${value}`,
    logValue: (value: number) =>
      `3 × setClickCount(${value} + 1) → becomes ${value + 1}`,
    logUpdater: (value: number) =>
      `3 × setClickCount(p => p + 1) → becomes ${value + 3}`,
    notes: [
      'A state variable is a snapshot of one particular render. Inside a handler `clickCount` never changes after `setClickCount`, which is why three “by value” calls add up to +1.',
      'An updater `p => p + 1` goes into a queue and receives the latest value — that is the safe way to update state that depends on the previous state.',
      'All `setState` calls from one handler are batched: three calls produce one re-render (watch the render counter).',
      'Passing the same value (compared with `Object.is`) lets React skip the re-render entirely.',
      'Lazy initialisation: `useState(() => heavyInit())` runs once instead of on every render.',
    ],
  },
  ru: {
    tagline: 'локальное состояние компонента',
    code: `function ClickCounter() {
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
}`,
    renders: 'рендеров',
    byValue: '+3 по значению',
    byUpdater: '+3 через updater',
    reset: 'сброс',
    hint: 'Обе кнопки вызывают `setClickCount` трижды. Одинаковый клик — разный результат: сравните счётчик и число рендеров.',
    empty: 'нажмите любую кнопку',
    logClick: (value: number) => `клик: clickCount в этом рендере = ${value}`,
    logValue: (value: number) =>
      `3 × setClickCount(${value} + 1) → станет ${value + 1}`,
    logUpdater: (value: number) =>
      `3 × setClickCount(p => p + 1) → станет ${value + 3}`,
    notes: [
      'Переменная состояния — снимок конкретного рендера. Внутри обработчика `clickCount` не изменится после `setClickCount`, поэтому три вызова «по значению» дают +1.',
      'Функция-апдейтер `p => p + 1` попадает в очередь и получает актуальное значение — так безопасно обновлять состояние, зависящее от предыдущего.',
      'Все `setState` из одного обработчика батчатся: три вызова = один ре-рендер (видно по счётчику рендеров).',
      'Если передать то же самое значение (`Object.is`), React может пропустить ре-рендер целиком.',
      'Ленивая инициализация: `useState(() => heavyInit())` — вычислится один раз, а не на каждом рендере.',
    ],
  },
}

function Demo() {
  const t = useText(text)
  const [clickCount, setClickCount] = useState(0)
  const renderCount = useRenderCount()
  const logStore = useLogStore()

  const addThreeByValue = () => {
    logStore.log(t.logClick(clickCount), 'dim')
    setClickCount(clickCount + 1)
    setClickCount(clickCount + 1)
    setClickCount(clickCount + 1)
    logStore.log(t.logValue(clickCount), 'error')
  }

  const addThreeByUpdater = () => {
    setClickCount((previous) => previous + 1)
    setClickCount((previous) => previous + 1)
    setClickCount((previous) => previous + 1)
    logStore.log(t.logUpdater(clickCount), 'effect')
  }

  return (
    <Stage>
      <Row>
        <div>
          <Label>clickCount</Label>
          <div className="big-num">{clickCount}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Chip tone="accent">
            {t.renders}: {renderCount}
          </Chip>
        </div>
      </Row>

      <Row>
        <Btn onClick={addThreeByValue}>{t.byValue}</Btn>
        <Btn variant="primary" onClick={addThreeByUpdater}>
          {t.byUpdater}
        </Btn>
        <Btn variant="ghost" onClick={() => setClickCount(0)}>
          {t.reset}
        </Btn>
      </Row>

      <div className="muted">
        <Rich>{t.hint}</Rich>
      </div>

      <LogPanel store={logStore} empty={t.empty} />
    </Stage>
  )
}

export const useStateDemo: HookDemo = { id: 'useState', pkg: 'react', text, Demo }
