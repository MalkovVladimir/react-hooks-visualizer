import { useId, useState } from 'react'
import { Btn, Chip, Panel, Row, Split, Stage } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'a unique id for a label ↔ input pair, identical on server and client',
    code: `function PasswordField({ title }) {
  // One call -> one prefix, unique for every copy of the component.
  const fieldId = useId()

  return (
    <div>
      <label htmlFor={fieldId + '-input'}>{title}</label>
      <input id={fieldId + '-input'} aria-describedby={fieldId + '-hint'} />
      <p id={fieldId + '-hint'}>At least 8 characters</p>
    </div>
  )
}

// Two copies on one page and no id collision at all:
<PasswordField title="Password" />
<PasswordField title="Repeat password" />`,
    password: 'Password',
    repeat: 'Repeat password',
    extra: (index: number) => `Extra field ${index}`,
    clickHint: '(click it — the field gets focus)',
    minChars: 'At least 8 characters',
    copy: (index: number) => `copy #${index}`,
    addCopy: 'add another copy',
    removeExtra: 'remove the extras',
    hint: 'each one gets its own prefix — the ids can never collide',
    notes: [
      'The main job is hydration: `Math.random()` or a counter produce different strings on the server and on the client, and React complains about the markup mismatch. `useId` derives the id from the component’s position in the tree, so both sides agree.',
      'One call per component. Need several ids? Add suffixes: `` `${fieldId}-input` ``, `` `${fieldId}-hint` ``.',
      'Not for lists: item keys must come from your data, not from `useId`.',
      'The string format is an implementation detail and has changed between versions (`«:r1:»` in React 18, `«_r_2_»` in 19). Do not parse it and do not rely on its shape: React 18 ids broke `querySelector` unless escaped.',
      'If two independent React apps live on one page, give them different `identifierPrefix` values so the ids never overlap.',
    ],
  },
  ru: {
    tagline: 'уникальный id для связки label ↔ input, одинаковый на сервере и клиенте',
    code: `function PasswordField({ title }) {
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
<PasswordField title="Повторите пароль" />`,
    password: 'Пароль',
    repeat: 'Повторите пароль',
    extra: (index: number) => `Дополнительное поле ${index}`,
    clickHint: '(кликните — сфокусируется поле)',
    minChars: 'Минимум 8 символов',
    copy: (index: number) => `копия №${index}`,
    addCopy: 'добавить ещё копию',
    removeExtra: 'убрать лишние',
    hint: 'каждая получает свой префикс — id никогда не столкнутся',
    notes: [
      'Главная задача — гидратация: `Math.random()` или счётчик дадут на сервере и на клиенте разные строки, и React отругается за несовпадение разметки. `useId` генерирует id из позиции компонента в дереве, поэтому они совпадают.',
      'Один вызов на компонент. Нужно несколько id — добавляйте суффиксы: `` `${fieldId}-input` ``, `` `${fieldId}-hint` ``.',
      'Не для списков: ключи элементов должны приходить из данных, а не из `useId`.',
      'Формат строки — деталь реализации и менялся между версиями (`«:r1:»` в React 18, `«_r_2_»` в 19). Не парсите её и не рассчитывайте на конкретный вид: id из React 18 без экранирования ломали `querySelector`.',
      'Если на одной странице живут два независимых React-приложения, задайте им разные `identifierPrefix`, чтобы id не пересеклись.',
    ],
  },
}

type Labels = (typeof text)['en']

function PasswordField({ title, t }: { title: string; t: Labels }) {
  const fieldId = useId()

  return (
    <>
      <Row>
        <label htmlFor={`${fieldId}-input`} style={{ cursor: 'pointer' }}>
          {title} <span className="muted">{t.clickHint}</span>
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
        {t.minChars}
      </div>
      <Row>
        <Chip tone="accent">useId() → «{fieldId}»</Chip>
      </Row>
    </>
  )
}

function Demo() {
  const t = useText(text)
  const [extraFields, setExtraFields] = useState<number[]>([])

  return (
    <Stage>
      <Split>
        <Panel title={t.copy(1)}>
          <PasswordField title={t.password} t={t} />
        </Panel>
        <Panel title={t.copy(2)}>
          <PasswordField title={t.repeat} t={t} />
        </Panel>
      </Split>

      {extraFields.map((fieldKey) => (
        <Panel key={fieldKey} title={t.copy(fieldKey)}>
          <PasswordField title={t.extra(fieldKey)} t={t} />
        </Panel>
      ))}

      <Row>
        <Btn
          variant="primary"
          onClick={() => setExtraFields((fields) => [...fields, fields.length + 3])}
        >
          {t.addCopy}
        </Btn>
        <Btn variant="ghost" onClick={() => setExtraFields([])}>
          {t.removeExtra}
        </Btn>
        <span className="muted">{t.hint}</span>
      </Row>
    </Stage>
  )
}

export const useIdDemo: HookDemo = { id: 'useId', pkg: 'react', since: '18', text, Demo }
