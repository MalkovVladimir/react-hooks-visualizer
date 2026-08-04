import { useDebugValue, useEffect, useState } from 'react'
import { Btn, Chip, Panel, Row, Split, Stage } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `// Свой хук: снаружи видно только булево значение.
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
useDebugValue(lastSyncDate, date => date.toLocaleString('ru-RU'))`

function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [latencyMs, setLatencyMs] = useState(24)

  useDebugValue(isOnline ? `online · ${latencyMs} мс` : 'offline')

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
}: {
  withDebugValue: boolean
  label: string
  isOnline: boolean
  latencyMs: number
}) {
  return (
    <div className="devtools">
      <div className="devtools-bar">⚛️ Components — имитация панели React DevTools</div>
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
          <span style={{ opacity: 0.5 }}>
            State: {String(isOnline)} · State: {latencyMs} (детали свёрнуты)
          </span>
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
  const { isOnline, latencyMs, setIsOnline } = useConnectionStatus()
  const label = isOnline ? `online · ${latencyMs} мс` : 'offline'

  return (
    <Stage>
      <Row>
        <Btn variant={isOnline ? 'danger' : 'primary'} onClick={() => setIsOnline((value) => !value)}>
          {isOnline ? 'разорвать соединение' : 'подключиться'}
        </Btn>
        <Chip tone={isOnline ? 'good' : 'bad'}>{label}</Chip>
      </Row>

      <div className="muted">
        Единственный видимый эффект хука — подпись в React DevTools. Ниже — имитация того, как
        выглядит один и тот же кастомный хук с ярлыком и без него.
      </div>

      <Split>
        <Panel title="без useDebugValue" tone="bad">
          <DevtoolsPane
            withDebugValue={false}
            label={label}
            isOnline={isOnline}
            latencyMs={latencyMs}
          />
          <div className="muted" style={{ marginTop: 10 }}>
            Видны только сырые значения `useState` — что за хук и что означает `true`, приходится
            выяснять по коду.
          </div>
        </Panel>

        <Panel title="с useDebugValue" tone="good">
          <DevtoolsPane withDebugValue label={label} isOnline={isOnline} latencyMs={latencyMs} />
          <div className="muted" style={{ marginTop: 10 }}>
            Рядом с именем хука сразу читаемое состояние — переключите соединение и посмотрите, как
            меняется подпись.
          </div>
        </Panel>
      </Split>
    </Stage>
  )
}

export const useDebugValueDemo: HookDemo = {
  id: 'useDebugValue',
  pkg: 'react',
  tagline: 'подписать кастомный хук в React DevTools',
  code,
  Demo,
  notes: [
    'На поведение приложения не влияет вообще: это метка для расширения React DevTools.',
    'Вызывать имеет смысл только внутри собственных хуков (`useSomething`), и обычно только в тех, что переиспользуются в разных местах. Внутри компонента он бесполезен.',
    'Второй аргумент — функция форматирования. Она вызывается лениво, только при осмотре хука в DevTools, поэтому дорогое форматирование в неё выносить безопасно.',
    'В production-сборке вызов ничего не делает, но код всё равно попадает в бандл — не суйте туда тяжёлые вычисления первым аргументом.',
    'Панель на этой странице — имитация. Настоящую подпись видно в расширении React DevTools во вкладке Components.',
  ],
}
