import { useState, useTransition } from 'react'
import { Btn, Chip, Panel, Row, SlowRow, Stage } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function SearchPage() {
  const [inputText, setInputText] = useState('')   // срочное: буквы в поле
  const [listQuery, setListQuery] = useState('')   // не срочное: тяжёлый список
  const [isPending, startTransition] = useTransition()

  const handleChange = (event) => {
    setInputText(event.target.value)               // применится немедленно

    startTransition(() => {
      setListQuery(event.target.value)             // React может прервать этот рендер
    })
  }

  return (
    <>
      <input value={inputText} onChange={handleChange} />
      {isPending && <Spinner />}
      <SlowList query={listQuery} />
    </>
  )
}`

const ROWS = 50
const COST_PER_ROW_MS = 4

function SlowList({ query }: { query: string }) {
  return (
    <div className="list-scroll">
      {Array.from({ length: ROWS }, (_, index) => (
        <SlowRow key={index} costMs={COST_PER_ROW_MS} label={`${query || 'все'} · результат ${index + 1}`} />
      ))}
    </div>
  )
}

function Demo() {
  const [useTransitionMode, setUseTransitionMode] = useState(true)
  const [inputText, setInputText] = useState('')
  const [listQuery, setListQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputText(value)
    if (useTransitionMode) startTransition(() => setListQuery(value))
    else setListQuery(value)
  }

  return (
    <Stage>
      <Row>
        <Btn
          variant={useTransitionMode ? 'default' : 'primary'}
          onClick={() => setUseTransitionMode(false)}
        >
          без transition
        </Btn>
        <Btn
          variant={useTransitionMode ? 'primary' : 'default'}
          onClick={() => setUseTransitionMode(true)}
        >
          с useTransition
        </Btn>
        {isPending && <Chip tone="warn">isPending — список догоняет</Chip>}
      </Row>

      <Row>
        <input
          className="input"
          style={{ flex: 1 }}
          value={inputText}
          onChange={handleChange}
          placeholder="печатайте быстро: «ноутбук»"
        />
        <Btn
          variant="ghost"
          onClick={() => {
            setInputText('')
            startTransition(() => setListQuery(''))
          }}
        >
          очистить
        </Btn>
      </Row>

      <Row>
        <span className="label">индикатор отзывчивости:</span>
        <div className="bouncer-track">
          <div className="bouncer" />
        </div>
      </Row>

      <div className="muted">
        Каждый рендер списка занимает ≈{Math.round(ROWS * COST_PER_ROW_MS)} мс. Без transition буквы
        появляются рывками и шарик замирает; с ним поле и анимация остаются живыми, а список
        догоняет.
      </div>

      <Panel title={`список · ${useTransitionMode ? 'не срочное обновление' : 'срочное обновление'}`}>
        <div className={isPending ? 'stale' : undefined}>
          <SlowList query={listQuery} />
        </div>
      </Panel>
    </Stage>
  )
}

export const useTransitionDemo: HookDemo = {
  id: 'useTransition',
  pkg: 'react',
  tagline: 'пометить обновление как не срочное, чтобы интерфейс не залипал',
  code,
  Demo,
  notes: [
    'Обновления внутри `startTransition` считаются фоновыми: React может прервать их рендер, если пришло срочное — например, нажатие клавиши.',
    '`isPending` — готовый флаг «фоновое обновление ещё идёт», по нему рисуют спиннер или приглушают устаревший контент.',
    'Обновление должно быть внутри синхронной части колбэка. После `await` React уже не считает его частью перехода — используйте вложенный `startTransition` после ожидания.',
    'Нельзя оборачивать в transition управление полем ввода: значение `<input value>` обязано обновляться немедленно, иначе символы «залипают».',
    'Есть и вариант без состояния ожидания — импортируемая функция `startTransition`. Хук нужен именно ради `isPending`.',
    'В React 19 действия форм (`<form action>`, `useActionState`) оборачиваются в transition автоматически.',
  ],
  since: '18',
}
