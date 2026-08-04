import { useFormStatus } from 'react-dom'
import { Chip, Panel, Row, Stage, sleep } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `import { useFormStatus } from 'react-dom'

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
}`

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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button className="btn primary" type="submit" disabled={pending}>
      {pending ? 'Загружаем…' : 'Загрузить'}
    </button>
  )
}

function Demo() {
  return (
    <Stage>
      <Panel title="вне формы — хук возвращает пустой статус" tone="bad">
        <StatusReadout where="компонент рендерится рядом с <form>" />
      </Panel>

      <Panel title="внутри формы — хук видит её статус" tone="good">
        <form action={async () => sleep(1600)}>
          <Row>
            <input className="input" name="fileName" defaultValue="отчёт.pdf" style={{ flex: 1 }} />
            <SubmitButton />
          </Row>
          <div style={{ marginTop: 12 }}>
            <StatusReadout where="компонент рендерится внутри <form>" />
          </div>
        </form>
      </Panel>

      <div className="muted">
        Нажмите «Загрузить»: на 1.6 секунды нижняя панель покажет `pending: true`, метод и
        отправляемые данные — а верхняя останется пустой. Кнопка блокирует сама себя, не получая ни
        одного пропа.
      </div>
    </Stage>
  )
}

export const useFormStatusDemo: HookDemo = {
  id: 'useFormStatus',
  pkg: 'react-dom',
  tagline: 'узнать статус отправки ближайшей формы, не прокидывая пропсы',
  code,
  Demo,
  notes: [
    'Возвращает `{ pending, data, method, action }`. `data` — это `FormData` текущей отправки, поэтому можно показать, что именно уходит на сервер.',
    'Главная ловушка: хук читает статус формы, которая находится выше по дереву. В компоненте, который сам рендерит `<form>`, он всегда вернёт `pending: false` — нужен отдельный дочерний компонент.',
    'Смысл в том, чтобы кнопка, спиннер или прогресс-бар были переиспользуемыми: они не принимают пропсов и работают в любой форме.',
    'Статус появляется, только если форма отправляется через проп `action` (функцию). Обычный `onSubmit` с ручным `fetch` хук не видит.',
    'Импортируется из `react-dom`, а не из `react` — единственный хук в этом списке из другого пакета.',
  ],
  since: '19',
}
