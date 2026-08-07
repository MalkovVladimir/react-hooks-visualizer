import { useState, useTransition } from 'react'
import { Btn, Chip, Panel, Row, SlowRow, Stage } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'mark an update as non-urgent so the interface stays alive',
    code: `function SearchPage() {
  const [inputText, setInputText] = useState('')   // urgent: letters in the field
  const [listQuery, setListQuery] = useState('')   // non-urgent: the heavy list
  const [isPending, startTransition] = useTransition()

  const handleChange = (event) => {
    setInputText(event.target.value)               // applied immediately

    startTransition(() => {
      setListQuery(event.target.value)             // React may interrupt this render
    })
  }

  return (
    <>
      <input value={inputText} onChange={handleChange} />
      {isPending && <Spinner />}
      <SlowList query={listQuery} />
    </>
  )
}`,
    without: 'without transition',
    with: 'with useTransition',
    pending: 'isPending — the list is catching up',
    placeholder: 'type fast: “laptop”',
    clear: 'clear',
    responsiveness: 'responsiveness meter:',
    all: 'all',
    result: (query: string, index: number) => `${query} · result ${index}`,
    hint: (ms: number) =>
      `Each render of the list takes about ${ms} ms. Without a transition the letters arrive in jerks and the ball freezes; with it the field and the animation stay alive while the list catches up.`,
    listTitle: (mode: string) => `list · ${mode}`,
    urgent: 'urgent update',
    nonUrgent: 'non-urgent update',
    notes: [
      'Updates inside `startTransition` count as background work: React may interrupt their render when something urgent arrives — a keystroke, for example.',
      '`isPending` is a ready-made “the background update is still running” flag, used to show a spinner or dim the stale content.',
      'The update has to be in the synchronous part of the callback. After an `await` React no longer treats it as part of the transition — use a nested `startTransition` after the wait.',
      'Never wrap a controlled input in a transition: the `<input value>` must update immediately, otherwise characters stick.',
      'There is also a stateless variant — the imported `startTransition` function. The hook exists precisely for `isPending`.',
      'In React 19 form actions (`<form action>`, `useActionState`) are wrapped in a transition automatically.',
    ],
  },
  ru: {
    tagline: 'пометить обновление как не срочное, чтобы интерфейс не залипал',
    code: `function SearchPage() {
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
}`,
    without: 'без transition',
    with: 'с useTransition',
    pending: 'isPending — список догоняет',
    placeholder: 'печатайте быстро: «ноутбук»',
    clear: 'очистить',
    responsiveness: 'индикатор отзывчивости:',
    all: 'все',
    result: (query: string, index: number) => `${query} · результат ${index}`,
    hint: (ms: number) =>
      `Каждый рендер списка занимает ≈${ms} мс. Без transition буквы появляются рывками и шарик замирает; с ним поле и анимация остаются живыми, а список догоняет.`,
    listTitle: (mode: string) => `список · ${mode}`,
    urgent: 'срочное обновление',
    nonUrgent: 'не срочное обновление',
    notes: [
      'Обновления внутри `startTransition` считаются фоновыми: React может прервать их рендер, если пришло срочное — например, нажатие клавиши.',
      '`isPending` — готовый флаг «фоновое обновление ещё идёт», по нему рисуют спиннер или приглушают устаревший контент.',
      'Обновление должно быть внутри синхронной части колбэка. После `await` React уже не считает его частью перехода — используйте вложенный `startTransition` после ожидания.',
      'Нельзя оборачивать в transition управление полем ввода: значение `<input value>` обязано обновляться немедленно, иначе символы «залипают».',
      'Есть и вариант без состояния ожидания — импортируемая функция `startTransition`. Хук нужен именно ради `isPending`.',
      'В React 19 действия форм (`<form action>`, `useActionState`) оборачиваются в transition автоматически.',
    ],
  },
}

const ROWS = 50
const COST_PER_ROW_MS = 4

function SlowList({ query, label }: { query: string; label: (query: string, index: number) => string }) {
  return (
    <div className="list-scroll">
      {Array.from({ length: ROWS }, (_, index) => (
        <SlowRow key={index} costMs={COST_PER_ROW_MS} label={label(query, index + 1)} />
      ))}
    </div>
  )
}

function Demo() {
  const t = useText(text)
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
          {t.without}
        </Btn>
        <Btn
          variant={useTransitionMode ? 'primary' : 'default'}
          onClick={() => setUseTransitionMode(true)}
        >
          {t.with}
        </Btn>
        {isPending && <Chip tone="warn">{t.pending}</Chip>}
      </Row>

      <Row>
        <input
          className="input"
          style={{ flex: 1 }}
          value={inputText}
          onChange={handleChange}
          placeholder={t.placeholder}
        />
        <Btn
          variant="ghost"
          onClick={() => {
            setInputText('')
            startTransition(() => setListQuery(''))
          }}
        >
          {t.clear}
        </Btn>
      </Row>

      <Row>
        <span className="label">{t.responsiveness}</span>
        <div className="bouncer-track">
          <div className="bouncer" />
        </div>
      </Row>

      <div className="muted">{t.hint(Math.round(ROWS * COST_PER_ROW_MS))}</div>

      <Panel title={t.listTitle(useTransitionMode ? t.nonUrgent : t.urgent)}>
        <div className={isPending ? 'stale' : undefined}>
          <SlowList query={listQuery || t.all} label={t.result} />
        </div>
      </Panel>
    </Stage>
  )
}

export const useTransitionDemo: HookDemo = {
  id: 'useTransition',
  pkg: 'react',
  since: '18',
  text,
  Demo,
}
