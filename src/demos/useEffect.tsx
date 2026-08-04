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
import type { HookDemo } from '../types'

const code = `function ChatRoom({ roomId }) {
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
}`

const PHASES = ['render', 'commit: DOM обновлён', 'paint: кадр на экране', 'useEffect'] as const

type Wiring = { log: LogStore['log']; phase: Signal<number>; status: Signal<string> }

function ChatRoom({ roomId, unreadCount, wiring }: { roomId: string; unreadCount: number; wiring: Wiring }) {
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
    wiring.status.set(`подключено к #${roomId}`)

    return () => {
      clearTimeout(toEffectPhase)
      wiring.log(`🧹 cleanup: disconnect("${roomId}")`, 'cleanup')
      wiring.status.set('отключено')
    }
  }, [roomId])

  return (
    <div className="box">
      <Row>
        <Chip tone="accent">#{roomId}</Chip>
        <span className="muted">непрочитанных: {unreadCount}</span>
      </Row>
    </div>
  )
}

// Обе панели читают сигналы сами — иначе ре-рендер от них дошёл бы до <ChatRoom />
// и лента событий показывала бы рендеры, которых в реальном коде нет.
function PhaseView({ signal }: { signal: Signal<number> }) {
  return <PhaseTrack phases={PHASES} active={useSignal(signal)} />
}

function StatusView({ signal }: { signal: Signal<string> }) {
  const status = useSignal(signal)
  return (
    <Row>
      <span className="label">соединение:</span>
      <span key={status}>
        <Chip tone={status.startsWith('подключено') ? 'good' : 'bad'}>{status}</Chip>
      </span>
    </Row>
  )
}

const ROOMS = ['general', 'random', 'design']

function Demo() {
  const logStore = useLogStore()
  const [wiring] = useState<Wiring>(() => ({
    log: logStore.log,
    phase: createSignal(-1),
    status: createSignal('не смонтирован'),
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
            logStore.log(isMounted ? '— размонтируем <ChatRoom />' : '— монтируем <ChatRoom />', 'dim')
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
          +1 непрочитанное
        </Btn>
      </Row>

      <div className="muted">
        Смена комнаты — в зависимостях, поэтому идёт цепочка cleanup → connect. Кнопка
        «+1 непрочитанное» вызывает ре-рендер, но эффект молчит.
      </div>

      <PhaseView signal={wiring.phase} />

      <StatusView signal={wiring.status} />

      {isMounted ? (
        <ChatRoom roomId={roomId} unreadCount={unreadCount} wiring={wiring} />
      ) : (
        <div className="box muted">&lt;ChatRoom /&gt; размонтирован</div>
      )}

      <LogPanel store={logStore} empty="переключите комнату или размонтируйте компонент" />
    </Stage>
  )
}

export const useEffectDemo: HookDemo = {
  id: 'useEffect',
  pkg: 'react',
  tagline: 'синхронизация с внешним миром после отрисовки',
  code,
  Demo,
  notes: [
    'Эффект выполняется после коммита и после того, как браузер нарисовал кадр — поэтому он не блокирует показ.',
    'Функция очистки вызывается дважды: перед каждым повторным запуском эффекта и один раз при размонтировании. Видно в ленте: cleanup старой комнаты идёт до connect новой.',
    'Массив зависимостей — не «когда запускать», а «от чего эффект зависит». Пропущенная зависимость даёт замыкание на устаревшее значение.',
    'Без массива — эффект после каждого рендера; с `[]` — один раз на монтирование; с `[roomId]` — при смене комнаты.',
    'В dev-режиме под `<StrictMode>` React монтирует компонент дважды (mount → cleanup → mount), чтобы выявить эффекты без очистки. В этом демо StrictMode выключен, чтобы лента читалась.',
    'Не нужен для того, что можно посчитать при рендере, и для реакции на действие пользователя — это место обработчика события.',
  ],
}
