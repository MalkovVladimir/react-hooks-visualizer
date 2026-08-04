import { useActionState } from 'react'
import { Chip, LogPanel, Row, Stage, sleep, useLogStore } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `const initialState = { status: 'idle', message: '', attempts: 0 }

function SubscribeForm() {
  // Первый аргумент экшена — предыдущее состояние, второй — FormData.
  // Хук сам оборачивает вызов в transition и даёт isPending.
  const [formState, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const email = formData.get('email')
      await api.subscribe(email)                       // ждём сервер

      if (!email.includes('@')) {
        return { status: 'error', message: 'Нужен настоящий email',
                 attempts: previousState.attempts + 1 }
      }
      return { status: 'ok', message: 'Подписка оформлена: ' + email,
               attempts: previousState.attempts + 1 }
    },
    initialState,
  )

  return (
    <form action={submitAction}>
      <input name="email" disabled={isPending} />
      <button disabled={isPending}>{isPending ? 'Отправляем…' : 'Подписаться'}</button>
      {formState.message && <p>{formState.message}</p>}
    </form>
  )
}`

type FormState = { status: 'idle' | 'ok' | 'error'; message: string; attempts: number }

const initialState: FormState = { status: 'idle', message: '', attempts: 0 }

function Demo() {
  const logStore = useLogStore()

  const [formState, submitAction, isPending] = useActionState<FormState, FormData>(
    async (previousState, formData) => {
      const email = String(formData.get('email') ?? '')
      logStore.log(`экшен запущен, попытка №${previousState.attempts + 1}: "${email}"`, 'render')
      await sleep(1100)

      if (!email.includes('@')) {
        logStore.log('сервер ответил ошибкой валидации', 'error')
        return {
          status: 'error',
          message: 'Нужен настоящий email — со знаком @',
          attempts: previousState.attempts + 1,
        }
      }

      logStore.log('сервер подтвердил подписку', 'effect')
      return {
        status: 'ok',
        message: `Подписка оформлена: ${email}`,
        attempts: previousState.attempts + 1,
      }
    },
    initialState,
  )

  return (
    <Stage>
      <form action={submitAction}>
        <Row>
          <input
            className="input"
            name="email"
            defaultValue="почта-без-собаки"
            disabled={isPending}
            style={{ flex: 1 }}
            placeholder="email"
          />
          <button className="btn primary" type="submit" disabled={isPending}>
            {isPending ? 'Отправляем…' : 'Подписаться'}
          </button>
        </Row>
      </form>

      <Row>
        <Chip tone={isPending ? 'warn' : undefined}>isPending: {String(isPending)}</Chip>
        <Chip tone="accent">попыток: {formState.attempts}</Chip>
        {formState.status !== 'idle' && (
          <Chip tone={formState.status === 'ok' ? 'good' : 'bad'}>{formState.status}</Chip>
        )}
      </Row>

      {formState.message && (
        <div className="box" style={{ borderColor: formState.status === 'ok' ? '#2f6b48' : '#5a2d38' }}>
          {formState.message}
        </div>
      )}

      <div className="muted">
        Отправьте как есть — придёт ошибка. Допишите «@mail.ru» и отправьте снова: счётчик попыток
        растёт, потому что экшен получает предыдущее состояние первым аргументом.
      </div>

      <LogPanel store={logStore} empty="отправьте форму" />
    </Stage>
  )
}

export const useActionStateDemo: HookDemo = {
  id: 'useActionState',
  pkg: 'react',
  tagline: 'состояние формы, ожидание и результат экшена — одним хуком',
  code,
  Demo,
  notes: [
    'Сигнатура: `const [state, formAction, isPending] = useActionState(action, initialState)`. То, что экшен вернёт, и становится новым `state`.',
    'Экшен получает два аргумента: предыдущее состояние и `FormData`. Первый аргумент — главное отличие от обычного `<form action>`, он позволяет накапливать результат между отправками.',
    'React сам оборачивает вызов в transition, поэтому `isPending` есть бесплатно и форма не блокирует интерфейс.',
    'Форму не нужно контролировать через `useState`: значения приезжают в `FormData` по атрибуту `name`. После успешного экшена форма сбрасывается автоматически.',
    'Работает и без форм: `formAction` можно повесить на `<button formAction>` или вызвать вручную.',
    'С серверными экшенами третьим аргументом передают `permalink` — страницу, куда отправить форму, если JS ещё не загрузился.',
  ],
  since: '19',
}
