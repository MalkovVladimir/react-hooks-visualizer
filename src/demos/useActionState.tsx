import { useActionState } from 'react'
import { Chip, LogPanel, Row, Stage, sleep, useLogStore } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'form state, pending flag and action result in a single hook',
    code: `const initialState = { status: 'idle', message: '', attempts: 0 }

function SubscribeForm() {
  // The action's first argument is the previous state, the second is FormData.
  // The hook wraps the call in a transition and hands you isPending.
  const [formState, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const email = formData.get('email')
      await api.subscribe(email)                       // wait for the server

      if (!email.includes('@')) {
        return { status: 'error', message: 'That is not a real email',
                 attempts: previousState.attempts + 1 }
      }
      return { status: 'ok', message: 'Subscribed: ' + email,
               attempts: previousState.attempts + 1 }
    },
    initialState,
  )

  return (
    <form action={submitAction}>
      <input name="email" disabled={isPending} />
      <button disabled={isPending}>{isPending ? 'Sending…' : 'Subscribe'}</button>
      {formState.message && <p>{formState.message}</p>}
    </form>
  )
}`,
    defaultEmail: 'address-without-at-sign',
    sending: 'Sending…',
    subscribe: 'Subscribe',
    attempts: (count: number) => `attempts: ${count}`,
    errorMessage: 'That is not a real email — it needs an @',
    okMessage: (email: string) => `Subscribed: ${email}`,
    hint: 'Send it as is and you get an error. Append “@mail.com” and send again: the attempt counter keeps growing, because the action receives the previous state as its first argument.',
    empty: 'submit the form',
    logStart: (attempt: number, email: string) =>
      `action started, attempt #${attempt}: "${email}"`,
    logError: 'the server replied with a validation error',
    logOk: 'the server confirmed the subscription',
    notes: [
      'The signature is `const [state, formAction, isPending] = useActionState(action, initialState)`. Whatever the action returns becomes the new `state`.',
      'The action takes two arguments: the previous state and `FormData`. That first argument is the main difference from a plain `<form action>` — it lets you accumulate results across submissions.',
      'React wraps the call in a transition itself, so `isPending` comes for free and the form never blocks the interface.',
      'The form does not need to be controlled with `useState`: values arrive in `FormData` keyed by the `name` attribute. After a successful action the form resets automatically.',
      'It works without forms too: `formAction` can go on a `<button formAction>` or be called by hand.',
      'With server actions, the third argument is a `permalink` — the page to submit the form to if JavaScript has not loaded yet.',
    ],
  },
  ru: {
    tagline: 'состояние формы, ожидание и результат экшена — одним хуком',
    code: `const initialState = { status: 'idle', message: '', attempts: 0 }

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
}`,
    defaultEmail: 'почта-без-собаки',
    sending: 'Отправляем…',
    subscribe: 'Подписаться',
    attempts: (count: number) => `попыток: ${count}`,
    errorMessage: 'Нужен настоящий email — со знаком @',
    okMessage: (email: string) => `Подписка оформлена: ${email}`,
    hint: 'Отправьте как есть — придёт ошибка. Допишите «@mail.ru» и отправьте снова: счётчик попыток растёт, потому что экшен получает предыдущее состояние первым аргументом.',
    empty: 'отправьте форму',
    logStart: (attempt: number, email: string) =>
      `экшен запущен, попытка №${attempt}: "${email}"`,
    logError: 'сервер ответил ошибкой валидации',
    logOk: 'сервер подтвердил подписку',
    notes: [
      'Сигнатура: `const [state, formAction, isPending] = useActionState(action, initialState)`. То, что экшен вернёт, и становится новым `state`.',
      'Экшен получает два аргумента: предыдущее состояние и `FormData`. Первый аргумент — главное отличие от обычного `<form action>`, он позволяет накапливать результат между отправками.',
      'React сам оборачивает вызов в transition, поэтому `isPending` есть бесплатно и форма не блокирует интерфейс.',
      'Форму не нужно контролировать через `useState`: значения приезжают в `FormData` по атрибуту `name`. После успешного экшена форма сбрасывается автоматически.',
      'Работает и без форм: `formAction` можно повесить на `<button formAction>` или вызвать вручную.',
      'С серверными экшенами третьим аргументом передают `permalink` — страницу, куда отправить форму, если JS ещё не загрузился.',
    ],
  },
}

type FormState = { status: 'idle' | 'ok' | 'error'; message: string; attempts: number }

const initialState: FormState = { status: 'idle', message: '', attempts: 0 }

function Demo() {
  const t = useText(text)
  const logStore = useLogStore()

  const [formState, submitAction, isPending] = useActionState<FormState, FormData>(
    async (previousState, formData) => {
      const email = String(formData.get('email') ?? '')
      logStore.log(t.logStart(previousState.attempts + 1, email), 'render')
      await sleep(1100)

      if (!email.includes('@')) {
        logStore.log(t.logError, 'error')
        return {
          status: 'error',
          message: t.errorMessage,
          attempts: previousState.attempts + 1,
        }
      }

      logStore.log(t.logOk, 'effect')
      return {
        status: 'ok',
        message: t.okMessage(email),
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
            defaultValue={t.defaultEmail}
            disabled={isPending}
            style={{ flex: 1 }}
            placeholder="email"
          />
          <button className="btn primary" type="submit" disabled={isPending}>
            {isPending ? t.sending : t.subscribe}
          </button>
        </Row>
      </form>

      <Row>
        <Chip tone={isPending ? 'warn' : undefined}>isPending: {String(isPending)}</Chip>
        <Chip tone="accent">{t.attempts(formState.attempts)}</Chip>
        {formState.status !== 'idle' && (
          <Chip tone={formState.status === 'ok' ? 'good' : 'bad'}>{formState.status}</Chip>
        )}
      </Row>

      {formState.message && (
        <div
          className="box"
          style={{ borderColor: formState.status === 'ok' ? '#2f6b48' : '#5a2d38' }}
        >
          {formState.message}
        </div>
      )}

      <div className="muted">{t.hint}</div>

      <LogPanel store={logStore} empty={t.empty} />
    </Stage>
  )
}

export const useActionStateDemo: HookDemo = {
  id: 'useActionState',
  pkg: 'react',
  since: '19',
  text,
  Demo,
}
