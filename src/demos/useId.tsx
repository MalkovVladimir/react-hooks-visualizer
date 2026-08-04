import { useId, useState } from 'react'
import { Btn, Chip, Panel, Row, Split, Stage } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function PasswordField({ title }) {
  // Один вызов -> один префикс, уникальный для каждой копии компонента.
  const fieldId = useId()

  return (
    <div>
      <label htmlFor={fieldId + '-input'}>{title}</label>
      <input id={fieldId + '-input'} aria-describedby={fieldId + '-hint'} />
      <p id={fieldId + '-hint'}>Минимум 8 символов</p>
    </div>
  )
}

// Две копии на одной странице — и никакого конфликта id:
<PasswordField title="Пароль" />
<PasswordField title="Повторите пароль" />`

function PasswordField({ title }: { title: string }) {
  const fieldId = useId()

  return (
    <>
      <Row>
        <label htmlFor={`${fieldId}-input`} style={{ cursor: 'pointer' }}>
          {title} <span className="muted">(кликните — сфокусируется поле)</span>
        </label>
      </Row>
      <Row>
        <input
          className="input"
          id={`${fieldId}-input`}
          type="password"
          aria-describedby={`${fieldId}-hint`}
          placeholder="••••••••"
          style={{ flex: 1 }}
        />
      </Row>
      <div id={`${fieldId}-hint`} className="muted" style={{ marginTop: 6 }}>
        Минимум 8 символов
      </div>
      <Row>
        <Chip tone="accent">useId() → «{fieldId}»</Chip>
      </Row>
    </>
  )
}

function Demo() {
  const [extraFields, setExtraFields] = useState<number[]>([])

  return (
    <Stage>
      <Split>
        <Panel title="копия №1">
          <PasswordField title="Пароль" />
        </Panel>
        <Panel title="копия №2">
          <PasswordField title="Повторите пароль" />
        </Panel>
      </Split>

      {extraFields.map((fieldKey) => (
        <Panel key={fieldKey} title={`копия №${fieldKey}`}>
          <PasswordField title={`Дополнительное поле ${fieldKey}`} />
        </Panel>
      ))}

      <Row>
        <Btn
          variant="primary"
          onClick={() => setExtraFields((fields) => [...fields, fields.length + 3])}
        >
          добавить ещё копию
        </Btn>
        <Btn variant="ghost" onClick={() => setExtraFields([])}>
          убрать лишние
        </Btn>
        <span className="muted">каждая получает свой префикс — id никогда не столкнутся</span>
      </Row>
    </Stage>
  )
}

export const useIdDemo: HookDemo = {
  id: 'useId',
  pkg: 'react',
  tagline: 'уникальный id для связки label ↔ input, одинаковый на сервере и клиенте',
  code,
  Demo,
  notes: [
    'Главная задача — гидратация: `Math.random()` или счётчик дадут на сервере и на клиенте разные строки, и React отругается за несовпадение разметки. `useId` генерирует id из позиции компонента в дереве, поэтому они совпадают.',
    'Один вызов на компонент. Нужно несколько id — добавляйте суффиксы: `` `${fieldId}-input` ``, `` `${fieldId}-hint` ``.',
    'Не для списков: ключи элементов должны приходить из данных, а не из `useId`.',
    'Формат строки — деталь реализации и менялся между версиями (`«:r1:»` в React 18, `«_r_2_»` в 19). Не парсите её и не рассчитывайте на конкретный вид: id из React 18 без экранирования ломали `querySelector`.',
    'Если на одной странице живут два независимых React-приложения, задайте им разные `identifierPrefix`, чтобы id не пересеклись.',
  ],
  since: '18',
}
