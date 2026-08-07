import { useFormStatus } from 'react-dom'
import { Chip, Panel, Rich, Row, Stage, sleep } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'read the status of the nearest form without passing props',
    code: `import { useFormStatus } from 'react-dom'

// The button knows nothing about the form and takes no props —
// the hook finds the nearest <form> ABOVE it in the tree.
function SubmitButton() {
  const { pending, data, method } = useFormStatus()

  return (
    <button disabled={pending}>
      {pending ? 'Uploading…' : 'Upload'}
    </button>
  )
}

function UploadForm() {
  // IMPORTANT: here useFormStatus returns pending: false —
  // the hook reads the parent form's status, not the one this component renders.
  return (
    <form action={uploadAction}>
      <input name="fileName" />
      <SubmitButton />
    </form>
  )
}`,
    outsideTitle: 'outside the form — the hook returns an empty status',
    insideTitle: 'inside the form — the hook sees its status',
    outsideWhere: 'component rendered next to <form>',
    insideWhere: 'component rendered inside <form>',
    uploading: 'Uploading…',
    upload: 'Upload',
    fileName: 'report.pdf',
    hint: 'Press “Upload”: for 1.6 seconds the lower panel shows `pending: true`, the method and the data being sent — while the upper one stays empty. The button disables itself without receiving a single prop.',
    notes: [
      'It returns `{ pending, data, method, action }`. `data` is the `FormData` of the current submission, so you can show exactly what is going to the server.',
      'The main trap: the hook reads the status of a form above it in the tree. In a component that renders the `<form>` itself it always returns `pending: false` — you need a separate child component.',
      'The point is that a button, spinner or progress bar becomes reusable: they take no props and work inside any form.',
      'A status appears only if the form is submitted through the `action` prop (a function). A plain `onSubmit` with a manual `fetch` is invisible to the hook.',
      'It is imported from `react-dom`, not from `react` — the only hook in this list from a different package.',
    ],
  },
  ru: {
    tagline: 'узнать статус отправки ближайшей формы, не прокидывая пропсы',
    code: `import { useFormStatus } from 'react-dom'

// Кнопка ничего не знает про форму и не принимает пропсов —
// хук сам находит ближайшую <form> ВЫШЕ по дереву.
function SubmitButton() {
  const { pending, data, method } = useFormStatus()

  return (
    <button disabled={pending}>
      {pending ? 'Загружаем…' : 'Загрузить'}
    </button>
  )
}

function UploadForm() {
  // ВАЖНО: здесь useFormStatus вернёт pending: false —
  // хук читает статус родительской формы, а не той, что рендерит сам компонент.
  return (
    <form action={uploadAction}>
      <input name="fileName" />
      <SubmitButton />
    </form>
  )
}`,
    outsideTitle: 'вне формы — хук возвращает пустой статус',
    insideTitle: 'внутри формы — хук видит её статус',
    outsideWhere: 'компонент рендерится рядом с <form>',
    insideWhere: 'компонент рендерится внутри <form>',
    uploading: 'Загружаем…',
    upload: 'Загрузить',
    fileName: 'отчёт.pdf',
    hint: 'Нажмите «Загрузить»: на 1.6 секунды нижняя панель покажет `pending: true`, метод и отправляемые данные — а верхняя останется пустой. Кнопка блокирует сама себя, не получая ни одного пропа.',
    notes: [
      'Возвращает `{ pending, data, method, action }`. `data` — это `FormData` текущей отправки, поэтому можно показать, что именно уходит на сервер.',
      'Главная ловушка: хук читает статус формы, которая находится выше по дереву. В компоненте, который сам рендерит `<form>`, он всегда вернёт `pending: false` — нужен отдельный дочерний компонент.',
      'Смысл в том, чтобы кнопка, спиннер или прогресс-бар были переиспользуемыми: они не принимают пропсов и работают в любой форме.',
      'Статус появляется, только если форма отправляется через проп `action` (функцию). Обычный `onSubmit` с ручным `fetch` хук не видит.',
      'Импортируется из `react-dom`, а не из `react` — единственный хук в этом списке из другого пакета.',
    ],
  },
}

function StatusReadout({ where }: { where: string }) {
  const { pending, data, method } = useFormStatus()
  const fileName = data?.get('fileName')

  return (
    <div className="box">
      <Row>
        <span className="muted">{where}</span>
        <Chip tone={pending ? 'warn' : undefined}>pending: {String(pending)}</Chip>
        <Chip>method: {method ?? 'null'}</Chip>
        <Chip>data: {pending && fileName ? String(fileName) : 'null'}</Chip>
      </Row>
    </div>
  )
}

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="btn primary" type="submit" disabled={pending}>
      {pending ? busy : idle}
    </button>
  )
}

function Demo() {
  const t = useText(text)

  return (
    <Stage>
      <Panel title={t.outsideTitle} tone="bad">
        <StatusReadout where={t.outsideWhere} />
      </Panel>

      <Panel title={t.insideTitle} tone="good">
        <form action={async () => sleep(1600)}>
          <Row>
            <input className="input" name="fileName" defaultValue={t.fileName} style={{ flex: 1 }} />
            <SubmitButton idle={t.upload} busy={t.uploading} />
          </Row>
          <div style={{ marginTop: 12 }}>
            <StatusReadout where={t.insideWhere} />
          </div>
        </form>
      </Panel>

      <div className="muted">
        <Rich>{t.hint}</Rich>
      </div>
    </Stage>
  )
}

export const useFormStatusDemo: HookDemo = {
  id: 'useFormStatus',
  pkg: 'react-dom',
  since: '19',
  text,
  Demo,
}
