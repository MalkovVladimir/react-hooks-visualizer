import { useDebugValue, useEffect, useState } from 'react'
import { Btn, Chip, Panel, Rich, Row, Split, Stage } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'label a custom hook in React DevTools',
    code: `// A custom hook: from the outside all you see is a boolean.
function useConnectionStatus(serverUrl) {
  const [isOnline, setIsOnline] = useState(true)
  const [latencyMs, setLatency] = useState(24)

  // A label for React DevTools: next to the hook name you get
  // "ConnectionStatus: online · 24 ms" instead of a bare true / 24.
  useDebugValue(isOnline ? \`online · \${latencyMs} ms\` : 'offline')

  return { isOnline, latencyMs, setIsOnline }
}

// Expensive formatting? The second argument runs only
// when someone actually inspects the hook in DevTools.
useDebugValue(lastSyncDate, date => date.toLocaleString('en-GB'))`,
    online: (ms: number) => `online · ${ms} ms`,
    offline: 'offline',
    disconnect: 'drop the connection',
    connect: 'connect',
    devtoolsBar: '⚛️ Components — a mock-up of the React DevTools panel',
    collapsed: (online: boolean, ms: number) => `State: ${online} · State: ${ms} (details collapsed)`,
    hint: 'The only visible effect of this hook is a caption in React DevTools. Below is a mock-up of how the same custom hook looks with and without a label.',
    withoutTitle: 'without useDebugValue',
    withTitle: 'with useDebugValue',
    withoutHint:
      'Only the raw `useState` values are visible — what the hook is and what `true` means has to be worked out from the code.',
    withHint:
      'Readable state right next to the hook name — toggle the connection and watch the caption change.',
    notes: [
      'It has no effect on application behaviour whatsoever: it is a label for the React DevTools extension.',
      'Only worth calling inside your own hooks (`useSomething`), and usually only in those reused in several places. Inside a component it is pointless.',
      'The second argument is a formatting function. It is called lazily, only when the hook is inspected in DevTools, so expensive formatting is safe there.',
      'In a production build the call does nothing, but the code still ships in the bundle — do not put heavy computation in the first argument.',
      'The panel on this page is a mock-up. The real caption shows up in the React DevTools extension, in the Components tab.',
    ],
  },
  ru: {
    tagline: 'подписать кастомный хук в React DevTools',
    code: `// Свой хук: снаружи видно только булево значение.
function useConnectionStatus(serverUrl) {
  const [isOnline, setIsOnline] = useState(true)
  const [latencyMs, setLatency] = useState(24)

  // Ярлык для React DevTools: рядом с именем хука появится
  // "ConnectionStatus: online · 24 мс" вместо голых true / 24.
  useDebugValue(isOnline ? \`online · \${latencyMs} мс\` : 'offline')

  return { isOnline, latencyMs, setIsOnline }
}

// Дорогое форматирование? Второй аргумент вызовется,
// только когда хук реально смотрят в DevTools.
useDebugValue(lastSyncDate, date => date.toLocaleString('ru-RU'))`,
    online: (ms: number) => `online · ${ms} мс`,
    offline: 'offline',
    disconnect: 'разорвать соединение',
    connect: 'подключиться',
    devtoolsBar: '⚛️ Components — имитация панели React DevTools',
    collapsed: (online: boolean, ms: number) =>
      `State: ${online} · State: ${ms} (детали свёрнуты)`,
    hint: 'Единственный видимый эффект хука — подпись в React DevTools. Ниже — имитация того, как выглядит один и тот же кастомный хук с ярлыком и без него.',
    withoutTitle: 'без useDebugValue',
    withTitle: 'с useDebugValue',
    withoutHint:
      'Видны только сырые значения `useState` — что за хук и что означает `true`, приходится выяснять по коду.',
    withHint:
      'Рядом с именем хука сразу читаемое состояние — переключите соединение и посмотрите, как меняется подпись.',
    notes: [
      'На поведение приложения не влияет вообще: это метка для расширения React DevTools.',
      'Вызывать имеет смысл только внутри собственных хуков (`useSomething`), и обычно только в тех, что переиспользуются в разных местах. Внутри компонента он бесполезен.',
      'Второй аргумент — функция форматирования. Она вызывается лениво, только при осмотре хука в DevTools, поэтому дорогое форматирование в неё выносить безопасно.',
      'В production-сборке вызов ничего не делает, но код всё равно попадает в бандл — не суйте туда тяжёлые вычисления первым аргументом.',
      'Панель на этой странице — имитация. Настоящую подпись видно в расширении React DevTools во вкладке Components.',
    ],
  },
}

type Labels = (typeof text)['en']

function useConnectionStatus(t: Labels) {
  const [isOnline, setIsOnline] = useState(true)
  const [latencyMs, setLatencyMs] = useState(24)

  useDebugValue(isOnline ? t.online(latencyMs) : t.offline)

  useEffect(() => {
    if (!isOnline) return
    const timerId = setInterval(() => setLatencyMs(12 + Math.round(Math.random() * 60)), 1500)
    return () => clearInterval(timerId)
  }, [isOnline])

  return { isOnline, latencyMs, setIsOnline }
}

function DevtoolsPane({
  withDebugValue,
  label,
  isOnline,
  latencyMs,
  t,
}: {
  withDebugValue: boolean
  label: string
  isOnline: boolean
  latencyMs: number
  t: Labels
}) {
  return (
    <div className="devtools">
      <div className="devtools-bar">{t.devtoolsBar}</div>
      <div className="devtools-row">ConnectionIndicator</div>
      <div className="devtools-row" style={{ paddingLeft: 24 }}>
        hooks
      </div>
      <div className="devtools-row" style={{ paddingLeft: 40 }}>
        {withDebugValue ? (
          <>
            ConnectionStatus: <span className="hl">"{label}"</span>
          </>
        ) : (
          <>
            State: <span className="hl">{String(isOnline)}</span>
          </>
        )}
      </div>
      <div className="devtools-row" style={{ paddingLeft: 40 }}>
        {withDebugValue ? (
          <span style={{ opacity: 0.5 }}>{t.collapsed(isOnline, latencyMs)}</span>
        ) : (
          <>
            State: <span className="hl">{latencyMs}</span>
          </>
        )}
      </div>
    </div>
  )
}

function Demo() {
  const t = useText(text)
  const { isOnline, latencyMs, setIsOnline } = useConnectionStatus(t)
  const label = isOnline ? t.online(latencyMs) : t.offline

  return (
    <Stage>
      <Row>
        <Btn variant={isOnline ? 'danger' : 'primary'} onClick={() => setIsOnline((value) => !value)}>
          {isOnline ? t.disconnect : t.connect}
        </Btn>
        <Chip tone={isOnline ? 'good' : 'bad'}>{label}</Chip>
      </Row>

      <div className="muted">{t.hint}</div>

      <Split>
        <Panel title={t.withoutTitle} tone="bad">
          <DevtoolsPane
            withDebugValue={false}
            label={label}
            isOnline={isOnline}
            latencyMs={latencyMs}
            t={t}
          />
          <div className="muted" style={{ marginTop: 10 }}>
            <Rich>{t.withoutHint}</Rich>
          </div>
        </Panel>

        <Panel title={t.withTitle} tone="good">
          <DevtoolsPane
            withDebugValue
            label={label}
            isOnline={isOnline}
            latencyMs={latencyMs}
            t={t}
          />
          <div className="muted" style={{ marginTop: 10 }}>
            {t.withHint}
          </div>
        </Panel>
      </Split>
    </Stage>
  )
}

export const useDebugValueDemo: HookDemo = { id: 'useDebugValue', pkg: 'react', text, Demo }
