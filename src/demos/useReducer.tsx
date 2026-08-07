import { useReducer } from 'react'
import { Btn, Chip, Label, LogPanel, Row, Stage, useLogStore } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'state whose transitions live in a single reducer',
    code: `const initialCart = { itemCount: 0, priceTotal: 0 }

// All transition logic in one place, outside the component.
function cartReducer(cartState, action) {
  switch (action.type) {
    case 'added':
      return {
        itemCount: cartState.itemCount + 1,
        priceTotal: cartState.priceTotal + action.price,
      }
    case 'removed':
      if (cartState.itemCount === 0) return cartState // same object -> no re-render
      return {
        itemCount: cartState.itemCount - 1,
        priceTotal: cartState.priceTotal - action.price,
      }
    case 'cleared':
      return initialCart
    default:
      throw new Error('Unknown action: ' + action.type)
  }
}

function Cart() {
  const [cartState, dispatch] = useReducer(cartReducer, initialCart)

  return (
    <button onClick={() => dispatch({ type: 'added', price: 12 })}>
      Add to cart ({cartState.itemCount} pcs / \${cartState.priceTotal})
    </button>
  )
}`,
    items: 'items',
    total: 'total',
    unitPrice: 12,
    money: (value: number) => `$${value}`,
    price: (value: number) => `added · $${value}`,
    empty: 'dispatch an action',
    newState: 'new state',
    logSkip: '  reducer returned the same object → React skips the re-render',
    logChange: (from: string, to: string) => `  state: ${from} → ${to}`,
    notes: [
      'The same thing as `useState`, but transitions are collected into a pure `(state, action) => nextState` function — easy to test and to read as a whole.',
      'A reducer must be pure: no requests, no timers, no mutating its arguments. Return a new object instead of changing the old one.',
      'Returning the same object (`return cartState`) is a legitimate way to say “nothing changed”: there will be no re-render.',
      '`dispatch` is stable between renders — safe to put in effect dependencies and in context.',
      'The third argument is lazy initialisation: `useReducer(reducer, initialArg, init)` calls `init(initialArg)` once.',
      'Reach for it instead of `useState` when several fields change together, or when the next value depends on the previous one in more than one place.',
    ],
  },
  ru: {
    tagline: 'состояние с переходами, описанными в одном reducer',
    code: `const initialCart = { itemCount: 0, priceTotal: 0 }

// Вся логика переходов — в одном месте, вне компонента.
function cartReducer(cartState, action) {
  switch (action.type) {
    case 'added':
      return {
        itemCount: cartState.itemCount + 1,
        priceTotal: cartState.priceTotal + action.price,
      }
    case 'removed':
      if (cartState.itemCount === 0) return cartState // тот же объект -> нет ре-рендера
      return {
        itemCount: cartState.itemCount - 1,
        priceTotal: cartState.priceTotal - action.price,
      }
    case 'cleared':
      return initialCart
    default:
      throw new Error('Неизвестный action: ' + action.type)
  }
}

function Cart() {
  const [cartState, dispatch] = useReducer(cartReducer, initialCart)

  return (
    <button onClick={() => dispatch({ type: 'added', price: 990 })}>
      В корзину ({cartState.itemCount} шт / {cartState.priceTotal} ₽)
    </button>
  )
}`,
    items: 'товаров',
    total: 'сумма',
    unitPrice: 990,
    money: (value: number) => `${value} ₽`,
    price: (value: number) => `added · ${value} ₽`,
    empty: 'отправьте action',
    newState: 'новый state',
    logSkip: '  reducer вернул тот же объект → React пропускает ре-рендер',
    logChange: (from: string, to: string) => `  state: ${from} → ${to}`,
    notes: [
      'Тот же `useState`, но переходы собраны в чистую функцию `(state, action) => nextState` — её удобно тестировать и читать целиком.',
      'Reducer обязан быть чистым: никаких запросов, таймеров и мутаций аргументов. Возвращайте новый объект, а не меняйте старый.',
      'Вернуть из reducer тот же объект (`return cartState`) — легальный способ сказать «ничего не изменилось»: ре-рендера не будет.',
      '`dispatch` стабилен между рендерами — его можно смело класть в зависимости эффектов и в контекст.',
      'Третий аргумент — ленивая инициализация: `useReducer(reducer, initialArg, init)`, `init(initialArg)` вызовется один раз.',
      'Берите его вместо `useState`, когда несколько полей состояния меняются вместе или следующее значение зависит от предыдущего в нескольких местах.',
    ],
  },
}

type CartState = { itemCount: number; priceTotal: number }
type CartAction = { type: 'added' | 'removed'; price: number } | { type: 'cleared' }

const initialCart: CartState = { itemCount: 0, priceTotal: 0 }

function cartReducer(cartState: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'added':
      return {
        itemCount: cartState.itemCount + 1,
        priceTotal: cartState.priceTotal + action.price,
      }
    case 'removed':
      if (cartState.itemCount === 0) return cartState
      return {
        itemCount: cartState.itemCount - 1,
        priceTotal: cartState.priceTotal - action.price,
      }
    case 'cleared':
      return initialCart
  }
}

function Demo() {
  const t = useText(text)
  const [cartState, dispatch] = useReducer(cartReducer, initialCart)
  const logStore = useLogStore()

  const send = (action: CartAction) => {
    const next = cartReducer(cartState, action)
    logStore.log(`dispatch(${JSON.stringify(action)})`, 'render')
    logStore.log(
      next === cartState
        ? t.logSkip
        : t.logChange(
            `{${cartState.itemCount}, ${cartState.priceTotal}}`,
            `{${next.itemCount}, ${next.priceTotal}}`,
          ),
      next === cartState ? 'cleanup' : 'effect',
    )
    dispatch(action)
  }

  return (
    <Stage>
      <Row>
        <div>
          <Label>{t.items}</Label>
          <div className="big-num">{cartState.itemCount}</div>
        </div>
        <div>
          <Label>{t.total}</Label>
          <div className="big-num">{t.money(cartState.priceTotal)}</div>
        </div>
      </Row>

      <Row>
        <Btn variant="primary" onClick={() => send({ type: 'added', price: t.unitPrice })}>
          {t.price(t.unitPrice)}
        </Btn>
        <Btn onClick={() => send({ type: 'removed', price: t.unitPrice })}>removed</Btn>
        <Btn variant="ghost" onClick={() => send({ type: 'cleared' })}>
          cleared
        </Btn>
      </Row>

      <Row>
        <Chip>action</Chip>
        <span className="muted">→</span>
        <Chip tone="accent">cartReducer(state, action)</Chip>
        <span className="muted">→</span>
        <Chip tone="good">{t.newState}</Chip>
      </Row>

      <LogPanel store={logStore} empty={t.empty} />
    </Stage>
  )
}

export const useReducerDemo: HookDemo = { id: 'useReducer', pkg: 'react', text, Demo }
