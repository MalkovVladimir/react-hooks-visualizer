import { useReducer } from 'react'
import { Btn, Chip, Label, LogPanel, Row, Stage, useLogStore } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `const initialCart = { itemCount: 0, priceTotal: 0 }

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
}`

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
  const [cartState, dispatch] = useReducer(cartReducer, initialCart)
  const logStore = useLogStore()
  const log = logStore.log

  const send = (action: CartAction) => {
    const next = cartReducer(cartState, action)
    log(`dispatch(${JSON.stringify(action)})`, 'render')
    log(
      next === cartState
        ? '  reducer вернул тот же объект → React пропускает ре-рендер'
        : `  state: {${cartState.itemCount}, ${cartState.priceTotal}} → {${next.itemCount}, ${next.priceTotal}}`,
      next === cartState ? 'cleanup' : 'effect',
    )
    dispatch(action)
  }

  return (
    <Stage>
      <Row>
        <div>
          <Label>товаров</Label>
          <div className="big-num">{cartState.itemCount}</div>
        </div>
        <div>
          <Label>сумма</Label>
          <div className="big-num">{cartState.priceTotal} ₽</div>
        </div>
      </Row>

      <Row>
        <Btn variant="primary" onClick={() => send({ type: 'added', price: 990 })}>
          added · 990 ₽
        </Btn>
        <Btn onClick={() => send({ type: 'removed', price: 990 })}>removed</Btn>
        <Btn variant="ghost" onClick={() => send({ type: 'cleared' })}>
          cleared
        </Btn>
      </Row>

      <Row>
        <Chip>action</Chip>
        <span className="muted">→</span>
        <Chip tone="accent">cartReducer(state, action)</Chip>
        <span className="muted">→</span>
        <Chip tone="good">новый state</Chip>
      </Row>

      <LogPanel store={logStore} empty="отправьте action" />
    </Stage>
  )
}

export const useReducerDemo: HookDemo = {
  id: 'useReducer',
  pkg: 'react',
  tagline: 'состояние с переходами, описанными в одном reducer',
  code,
  Demo,
  notes: [
    'Тот же `useState`, но переходы собраны в чистую функцию `(state, action) => nextState` — её удобно тестировать и читать целиком.',
    'Reducer обязан быть чистым: никаких запросов, таймеров и мутаций аргументов. Возвращайте новый объект, а не меняйте старый.',
    'Вернуть из reducer тот же объект (`return cartState`) — легальный способ сказать «ничего не изменилось»: ре-рендера не будет.',
    '`dispatch` стабилен между рендерами — его можно смело класть в зависимости эффектов и в контекст.',
    'Третий аргумент — ленивая инициализация: `useReducer(reducer, initialArg, init)`, `init(initialArg)` вызовется один раз.',
    'Берите его вместо `useState`, когда несколько полей состояния меняются вместе или следующее значение зависит от предыдущего в нескольких местах.',
  ],
}
