import { useEffect, useLayoutEffect, useState } from 'react'
import {
  Btn,
  Chip,
  LogPanel,
  PhaseTrack,
  Row,
  Stage,
  createSignal,
  useLogStore,
  useSignal,
  type LogStore,
  type Signal,
} from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'synchronise with the outside world after the paint',
    code: `function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()                    // side effect — after the frame is painted

    return () => connection.disconnect()    // cleanup: before the next run and on unmount
  }, [roomId])                              // re-runs only when roomId changes

  return <h1>Room {roomId}</h1>
}

function App() {
  const [roomId, setRoomId] = useState('general')
  const [unreadCount, setUnread] = useState(0)  // changes — the effect does NOT re-run

  return isOpen && <ChatRoom roomId={roomId} />
}`,
    phases: ['render', 'commit: DOM updated', 'paint: frame on screen', 'useEffect'],
    unread: (count: number) => `unread: ${count}`,
    addUnread: '+1 unread',
    hint: 'The room is a dependency, so switching it runs cleanup → connect. The “+1 unread” button re-renders the component, and the effect stays silent.',
    connection: 'connection:',
    connected: (room: string) => `connected to #${room}`,
    disconnected: 'disconnected',
    notMounted: 'not mounted',
    unmountedBox: '<ChatRoom /> is unmounted',
    empty: 'switch a room or unmount the component',
    logMount: '— mounting <ChatRoom />',
    logUnmount: '— unmounting <ChatRoom />',
    logCleanup: (room: string) => `🧹 cleanup: disconnect("${room}")`,
    notes: [
      'An effect runs after the commit and after the browser has painted the frame — that is why it never delays what the user sees.',
      'Cleanup runs twice over: before every re-run of the effect and once on unmount. You can see it in the timeline — the old room disconnects before the new one connects.',
      'The dependency array is not “when to run” but “what the effect depends on”. A missing dependency gives you a closure over a stale value.',
      'No array — after every render; `[]` — once on mount; `[roomId]` — whenever the room changes.',
      'In development under `<StrictMode>` React mounts the component twice (mount → cleanup → mount) to expose effects without cleanup. StrictMode is off in this project so the timeline stays readable.',
      'Not needed for anything you can compute while rendering, nor for reacting to a user action — that belongs in an event handler.',
    ],
  },
  ru: {
    tagline: 'синхронизация с внешним миром после отрисовки',
    code: `function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()                    // побочный эффект — после отрисовки кадра

    return () => connection.disconnect()    // очистка: перед следующим запуском и при размонтировании
  }, [roomId])                              // перезапуск только при смене roomId

  return <h1>Комната {roomId}</h1>
}

function App() {
  const [roomId, setRoomId] = useState('general')
  const [unreadCount, setUnread] = useState(0)  // меняется — эффект НЕ перезапускается

  return isOpen && <ChatRoom roomId={roomId} />
}`,
    phases: ['render', 'commit: DOM обновлён', 'paint: кадр на экране', 'useEffect'],
    unread: (count: number) => `непрочитанных: ${count}`,
    addUnread: '+1 непрочитанное',
    hint: 'Смена комнаты — в зависимостях, поэтому идёт цепочка cleanup → connect. Кнопка «+1 непрочитанное» вызывает ре-рендер, но эффект молчит.',
    connection: 'соединение:',
    connected: (room: string) => `подключено к #${room}`,
    disconnected: 'отключено',
    notMounted: 'не смонтирован',
    unmountedBox: '<ChatRoom /> размонтирован',
    empty: 'переключите комнату или размонтируйте компонент',
    logMount: '— монтируем <ChatRoom />',
    logUnmount: '— размонтируем <ChatRoom />',
    logCleanup: (room: string) => `🧹 cleanup: disconnect("${room}")`,
    notes: [
      'Эффект выполняется после коммита и после того, как браузер нарисовал кадр — поэтому он не блокирует показ.',
      'Функция очистки вызывается дважды: перед каждым повторным запуском эффекта и один раз при размонтировании. Видно в ленте: cleanup старой комнаты идёт до connect новой.',
      'Массив зависимостей — не «когда запускать», а «от чего эффект зависит». Пропущенная зависимость даёт замыкание на устаревшее значение.',
      'Без массива — эффект после каждого рендера; с `[]` — один раз на монтирование; с `[roomId]` — при смене комнаты.',
      'В dev-режиме под `<StrictMode>` React монтирует компонент дважды (mount → cleanup → mount), чтобы выявить эффекты без очистки. В этом проекте StrictMode выключен, чтобы лента читалась.',
      'Не нужен для того, что можно посчитать при рендере, и для реакции на действие пользователя — это место обработчика события.',
    ],
  },
}

type Status = { kind: 'idle' | 'on' | 'off'; room: string }

type Wiring = {
  log: LogStore['log']
  phase: Signal<number>
  status: Signal<Status>
  unreadLabel: (count: number) => string
  cleanupLabel: (room: string) => string
}

function ChatRoom({
  roomId,
  unreadCount,
  wiring,
}: {
  roomId: string
  unreadCount: number
  wiring: Wiring
}) {
  wiring.log(`render <ChatRoom roomId="${roomId}" unread={${unreadCount}} />`, 'render')
  wiring.phase.set(0)

  // Только чтобы показать момент коммита — сам по себе он тут не нужен.
  useLayoutEffect(() => {
    wiring.phase.set(1)
  })

  useEffect(() => {
    wiring.phase.set(2)
    const toEffectPhase = setTimeout(() => wiring.phase.set(3), 220)
    wiring.log(`✅ connect("${roomId}")`, 'effect')
    wiring.status.set({ kind: 'on', room: roomId })

    return () => {
      clearTimeout(toEffectPhase)
      wiring.log(wiring.cleanupLabel(roomId), 'cleanup')
      wiring.status.set({ kind: 'off', room: roomId })
    }
  }, [roomId])

  return (
    <div className="box">
      <Row>
        <Chip tone="accent">#{roomId}</Chip>
        <span className="muted">{wiring.unreadLabel(unreadCount)}</span>
      </Row>
    </div>
  )
}

// Обе панели читают сигналы сами — иначе ре-рендер от них дошёл бы до <ChatRoom />
// и лента событий показывала бы рендеры, которых в реальном коде нет.
function PhaseView({ signal, phases }: { signal: Signal<number>; phases: string[] }) {
  return <PhaseTrack phases={phases} active={useSignal(signal)} />
}

function StatusView({
  signal,
  label,
  render,
}: {
  signal: Signal<Status>
  label: string
  render: (status: Status) => string
}) {
  const status = useSignal(signal)
  const caption = render(status)
  return (
    <Row>
      <span className="label">{label}</span>
      <span key={caption}>
        <Chip tone={status.kind === 'on' ? 'good' : 'bad'}>{caption}</Chip>
      </span>
    </Row>
  )
}

const ROOMS = ['general', 'random', 'design']

function Demo() {
  const t = useText(text)
  const logStore = useLogStore()
  const [wiring] = useState<Wiring>(() => ({
    log: logStore.log,
    phase: createSignal(-1),
    status: createSignal<Status>({ kind: 'idle', room: '' }),
    unreadLabel: t.unread,
    cleanupLabel: t.logCleanup,
  }))

  const [isMounted, setIsMounted] = useState(true)
  const [roomId, setRoomId] = useState('general')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isMounted) wiring.phase.set(-1)
  }, [isMounted, wiring])

  return (
    <Stage>
      <Row>
        <Btn
          variant={isMounted ? 'danger' : 'primary'}
          onClick={() => {
            logStore.log(isMounted ? t.logUnmount : t.logMount, 'dim')
            setIsMounted((value) => !value)
          }}
        >
          {isMounted ? 'unmount' : 'mount'}
        </Btn>
        {ROOMS.map((room) => (
          <Btn
            key={room}
            variant={room === roomId ? 'primary' : 'default'}
            onClick={() => setRoomId(room)}
          >
            #{room}
          </Btn>
        ))}
        <Btn variant="ghost" onClick={() => setUnreadCount((n) => n + 1)}>
          {t.addUnread}
        </Btn>
      </Row>

      <div className="muted">{t.hint}</div>

      <PhaseView signal={wiring.phase} phases={t.phases} />

      <StatusView
        signal={wiring.status}
        label={t.connection}
        render={(status) =>
          status.kind === 'on'
            ? t.connected(status.room)
            : status.kind === 'off'
              ? t.disconnected
              : t.notMounted
        }
      />

      {isMounted ? (
        <ChatRoom roomId={roomId} unreadCount={unreadCount} wiring={wiring} />
      ) : (
        <div className="box muted">{t.unmountedBox}</div>
      )}

      <LogPanel store={logStore} empty={t.empty} />
    </Stage>
  )
}

export const useEffectDemo: HookDemo = { id: 'useEffect', pkg: 'react', text, Demo }
