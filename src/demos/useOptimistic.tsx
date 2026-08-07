import { useOptimistic, useRef, useState } from 'react'
import { Btn, Chip, LogPanel, Row, Stage, sleep, useLogStore } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'show the result at once while the server is still thinking',
    code: `function Chat() {
  const [messages, setMessages] = useState([])

  // The first argument is the "real" state.
  // The second says how to show it together with a change that is not confirmed yet.
  const [visibleMessages, addOptimistic] = useOptimistic(
    messages,
    (current, pendingText) => [...current, { text: pendingText, sending: true }],
  )

  async function sendAction(formData) {
    const text = formData.get('text')

    addOptimistic(text)            // the message shows up instantly
    const saved = await api.send(text)   // wait for the server

    if (saved.ok) {
      setMessages(previous => [...previous, { text, sending: false }])
    }
    // if the server failed, do nothing: once the action finishes
    // the optimistic state rolls back on its own
  }

  return <form action={sendAction}>…</form>
}`,
    firstMessage: 'Hi! These are the confirmed messages.',
    serverOk: 'server: replies with success',
    serverFail: 'server: replies with an error',
    inFlight: (count: number) => `in flight: ${count}`,
    delay: 'response delay — 1.4 s',
    sendingSuffix: ' · sending…',
    failedSuffix: ' · not delivered',
    placeholder: 'write a message and press Enter',
    defaultText: 'Test message',
    send: 'Send',
    hint: 'The message appears instantly with a dashed border. Switch the server to error mode and watch the optimistic entry vanish and get replaced by a “not delivered” note.',
    empty: 'send a message',
    logOptimistic: (value: string) => `shown optimistically: "${value}"`,
    logFail: 'the server returned 500 → the optimistic message rolled back',
    logOk: (value: string) => `the server confirmed: "${value}"`,
    notes: [
      'It returns a pair: the value to render, and a function that adds a not-yet-confirmed change to it.',
      'Rolling back is free: as soon as the action (or transition) finishes, React drops the optimistic state and shows the real one. There is nothing to undo by hand.',
      '`addOptimistic` can only be called inside an action or `startTransition` — outside them the optimistic value is discarded immediately.',
      'The second argument is a pure `(currentState, optimisticValue) => newState` function, much like a reducer.',
      'Do not forget the failure path: the hook itself only shows the happy scenario, and a “not delivered” note is something you render from the real state.',
      'It fits likes, message sending and checkboxes in lists — anywhere waiting on the network annoys more than the occasional rollback.',
    ],
  },
  ru: {
    tagline: 'показать результат сразу, пока сервер ещё думает',
    code: `function Chat() {
  const [messages, setMessages] = useState([])

  // Первый аргумент — «настоящее» состояние.
  // Второй — как показать его вместе с ещё не подтверждённым изменением.
  const [visibleMessages, addOptimistic] = useOptimistic(
    messages,
    (current, pendingText) => [...current, { text: pendingText, sending: true }],
  )

  async function sendAction(formData) {
    const text = formData.get('text')

    addOptimistic(text)            // сообщение появляется мгновенно
    const saved = await api.send(text)   // ждём сервер

    if (saved.ok) {
      setMessages(previous => [...previous, { text, sending: false }])
    }
    // если сервер ответил ошибкой — ничего не делаем:
    // по завершении экшена оптимистичное состояние откатится само
  }

  return <form action={sendAction}>…</form>
}`,
    firstMessage: 'Привет! Это подтверждённые сообщения.',
    serverOk: 'сервер: отвечает успехом',
    serverFail: 'сервер: отвечает ошибкой',
    inFlight: (count: number) => `в полёте: ${count}`,
    delay: 'задержка ответа — 1.4 с',
    sendingSuffix: ' · отправляется…',
    failedSuffix: ' · не доставлено',
    placeholder: 'напишите сообщение и нажмите Enter',
    defaultText: 'Тестовое сообщение',
    send: 'Отправить',
    hint: 'Сообщение появляется мгновенно пунктиром. Переключите сервер в режим ошибки — увидите, как оптимистичная запись исчезает и заменяется пометкой «не доставлено».',
    empty: 'отправьте сообщение',
    logOptimistic: (value: string) => `оптимистично показали: "${value}"`,
    logFail: 'сервер ответил 500 → оптимистичное сообщение откатилось',
    logOk: (value: string) => `сервер подтвердил: "${value}"`,
    notes: [
      'Возвращает пару: значение для отрисовки и функцию, которая добавляет к нему «ещё не подтверждённое» изменение.',
      'Откат бесплатный: как только экшен (или transition) завершился, React выбрасывает оптимистичное состояние и показывает настоящее. Ничего откатывать руками не нужно.',
      'Вызывать `addOptimistic` можно только внутри экшена или `startTransition` — вне их оптимистичное значение немедленно сбросится.',
      'Второй аргумент — чистая функция `(текущееСостояние, оптимистичноеЗначение) => новоеСостояние`, вроде reducer.',
      'Не забудьте про ошибку: сам по себе хук показывает только успешный сценарий, а сообщение «не доставлено» вы рисуете сами по реальному состоянию.',
      'Хорошо ложится на лайки, отправку сообщений, чекбоксы в списках — всё, где ожидание сети раздражает сильнее, чем редкий откат.',
    ],
  },
}

type Message = { id: number; text: string; sending: boolean; failed?: boolean }

let messageSeq = 0

function Demo() {
  const t = useText(text)
  const logStore = useLogStore()
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: messageSeq++, text: t.firstMessage, sending: false },
  ])
  const [serverFails, setServerFails] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [visibleMessages, addOptimistic] = useOptimistic(
    messages,
    (current: Message[], pendingText: string) => [
      ...current,
      { id: -1, text: pendingText, sending: true },
    ],
  )

  async function sendAction(formData: FormData) {
    const value = String(formData.get('text') ?? '').trim()
    if (!value) return

    addOptimistic(value)
    logStore.log(t.logOptimistic(value), 'render')
    await sleep(1400)

    if (serverFails) {
      logStore.log(t.logFail, 'error')
      setMessages((previous) => [
        ...previous,
        { id: messageSeq++, text: value, sending: false, failed: true },
      ])
      return
    }

    logStore.log(t.logOk(value), 'effect')
    setMessages((previous) => [...previous, { id: messageSeq++, text: value, sending: false }])
  }

  const pendingCount = visibleMessages.filter((message) => message.sending).length

  return (
    <Stage>
      <Row>
        <Btn
          variant={serverFails ? 'danger' : 'primary'}
          onClick={() => setServerFails((value) => !value)}
        >
          {serverFails ? t.serverFail : t.serverOk}
        </Btn>
        <Chip tone={pendingCount ? 'warn' : undefined}>{t.inFlight(pendingCount)}</Chip>
        <span className="muted">{t.delay}</span>
      </Row>

      <div className="box" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visibleMessages.map((message, index) => (
          <div
            key={message.id === -1 ? `optimistic-${index}` : message.id}
            className={`msg${message.sending ? ' optimistic' : ''}${message.failed ? ' failed' : ''}`}
          >
            {message.text}
            {message.sending && <span className="muted">{t.sendingSuffix}</span>}
            {message.failed && <span>{t.failedSuffix}</span>}
          </div>
        ))}
      </div>

      <form
        action={async (formData) => {
          await sendAction(formData)
          if (inputRef.current) inputRef.current.value = ''
        }}
      >
        <Row>
          <input
            ref={inputRef}
            className="input"
            name="text"
            placeholder={t.placeholder}
            defaultValue={t.defaultText}
            style={{ flex: 1 }}
          />
          <button className="btn primary" type="submit">
            {t.send}
          </button>
        </Row>
      </form>

      <div className="muted">{t.hint}</div>

      <LogPanel store={logStore} empty={t.empty} />
    </Stage>
  )
}

export const useOptimisticDemo: HookDemo = {
  id: 'useOptimistic',
  pkg: 'react',
  since: '19',
  text,
  Demo,
}
