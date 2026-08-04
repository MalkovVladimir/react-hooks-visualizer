import { useOptimistic, useRef, useState } from 'react'
import { Btn, Chip, LogPanel, Row, Stage, sleep, useLogStore } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function Chat() {
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
}`

type Message = { id: number; text: string; sending: boolean; failed?: boolean }

let messageSeq = 0

function Demo() {
  const logStore = useLogStore()
  const [messages, setMessages] = useState<Message[]>([
    { id: messageSeq++, text: 'Привет! Это подтверждённые сообщения.', sending: false },
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
    const text = String(formData.get('text') ?? '').trim()
    if (!text) return

    addOptimistic(text)
    logStore.log(`оптимистично показали: "${text}"`, 'render')
    await sleep(1400)

    if (serverFails) {
      logStore.log('сервер ответил 500 → оптимистичное сообщение откатилось', 'error')
      setMessages((previous) => [
        ...previous,
        { id: messageSeq++, text, sending: false, failed: true },
      ])
      return
    }

    logStore.log(`сервер подтвердил: "${text}"`, 'effect')
    setMessages((previous) => [...previous, { id: messageSeq++, text, sending: false }])
  }

  const pendingCount = visibleMessages.filter((message) => message.sending).length

  return (
    <Stage>
      <Row>
        <Btn
          variant={serverFails ? 'danger' : 'primary'}
          onClick={() => setServerFails((value) => !value)}
        >
          сервер: {serverFails ? 'отвечает ошибкой' : 'отвечает успехом'}
        </Btn>
        <Chip tone={pendingCount ? 'warn' : undefined}>в полёте: {pendingCount}</Chip>
        <span className="muted">задержка ответа — 1.4 с</span>
      </Row>

      <div className="box" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visibleMessages.map((message, index) => (
          <div
            key={message.id === -1 ? `optimistic-${index}` : message.id}
            className={`msg${message.sending ? ' optimistic' : ''}${message.failed ? ' failed' : ''}`}
          >
            {message.text}
            {message.sending && <span className="muted"> · отправляется…</span>}
            {message.failed && <span> · не доставлено</span>}
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
            placeholder="напишите сообщение и нажмите Enter"
            defaultValue="Тестовое сообщение"
            style={{ flex: 1 }}
          />
          <button className="btn primary" type="submit">
            Отправить
          </button>
        </Row>
      </form>

      <div className="muted">
        Сообщение появляется мгновенно пунктиром. Переключите сервер в режим ошибки — увидите, как
        оптимистичная запись исчезает и заменяется пометкой «не доставлено».
      </div>

      <LogPanel store={logStore} empty="отправьте сообщение" />
    </Stage>
  )
}

export const useOptimisticDemo: HookDemo = {
  id: 'useOptimistic',
  pkg: 'react',
  tagline: 'показать результат сразу, пока сервер ещё думает',
  code,
  Demo,
  notes: [
    'Возвращает пару: значение для отрисовки и функцию, которая добавляет к нему «ещё не подтверждённое» изменение.',
    'Откат бесплатный: как только экшен (или transition) завершился, React выбрасывает оптимистичное состояние и показывает настоящее. Ничего откатывать руками не нужно.',
    'Вызывать `addOptimistic` можно только внутри экшена или `startTransition` — вне их оптимистичное значение немедленно сбросится.',
    'Второй аргумент — чистая функция `(текущееСостояние, оптимистичноеЗначение) => новоеСостояние`, вроде reducer.',
    'Не забудьте про ошибку: сам по себе хук показывает только успешный сценарий, а сообщение «не доставлено» вы рисуете сами по реальному состоянию.',
    'Хорошо ложится на лайки, отправку сообщений, чекбоксы в списках — всё, где ожидание сети раздражает сильнее, чем редкий откат.',
  ],
  since: '19',
}
