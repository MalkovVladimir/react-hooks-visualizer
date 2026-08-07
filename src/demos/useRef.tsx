import { useRef, useState } from 'react'
import { Btn, Chip, Label, Panel, Row, Split, Stage } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'a value that survives renders and never triggers one',
    code: `function Counters() {
  const clicksInRef = useRef(0)        // a mutable box, untouched by rendering
  const [clicksInState, setClicks] = useState(0)

  const inputElement = useRef(null)    // same hook, now for DOM access

  return (
    <>
      {/* change the ref: the value grows, the screen keeps the old one */}
      <button onClick={() => { clicksInRef.current += 1 }}>
        ref: {clicksInRef.current}
      </button>

      {/* change the state: React re-renders the component */}
      <button onClick={() => setClicks(clicksInState + 1)}>
        state: {clicksInState}
      </button>

      <input ref={inputElement} />
      <button onClick={() => inputElement.current.focus()}>focus</button>
    </>
  )
}`,
    refTitle: 'useRef — no re-render',
    stateTitle: 'useState — re-renders',
    refLabel: 'clicksInRef.current (on screen)',
    stateLabel: 'clicksInState',
    plusRef: '+1 to the ref',
    plusState: '+1 to the state',
    forceRender: 'force render',
    refHint:
      'The number stays put: the value grows, but React never hears about it. Press “force render” to reveal the real one.',
    stateHint: 'Every click schedules a re-render, so the markup always matches the state.',
    domTitle: 'second use: a handle on a DOM node',
    placeholder: 'a plain input',
    clear: 'clear',
    notes: [
      'A ref is `{ current: value }` — the very same object for the whole life of the component. Changing `.current` re-renders nothing.',
      'Do not read or write `ref.current` during rendering: the result is not reproducible. Handlers and effects only.',
      'If the value has to appear on screen, it is `useState`, not `useRef`. Refs are for timer ids, instances, “the previous value”, “already done” flags.',
      'The second use is the DOM: `<input ref={inputElement} />` puts the node into `.current` on commit and `null` on unmount.',
      'In React 19 function components take `ref` as an ordinary prop — `forwardRef` is no longer needed.',
      'To react to a node appearing, use a ref callback `<div ref={node => {...}} />` — in React 19 it may return a cleanup function.',
    ],
  },
  ru: {
    tagline: 'значение, которое переживает рендеры и не вызывает их',
    code: `function Counters() {
  const clicksInRef = useRef(0)        // мутируемая «коробка», рендер не трогает
  const [clicksInState, setClicks] = useState(0)

  const inputElement = useRef(null)    // тот же хук — для доступа к DOM

  return (
    <>
      {/* меняем ref: значение растёт, но на экране остаётся старое */}
      <button onClick={() => { clicksInRef.current += 1 }}>
        ref: {clicksInRef.current}
      </button>

      {/* меняем state: React перерисовывает компонент */}
      <button onClick={() => setClicks(clicksInState + 1)}>
        state: {clicksInState}
      </button>

      <input ref={inputElement} />
      <button onClick={() => inputElement.current.focus()}>фокус</button>
    </>
  )
}`,
    refTitle: 'useRef — без ре-рендера',
    stateTitle: 'useState — с ре-рендером',
    refLabel: 'clicksInRef.current (на экране)',
    stateLabel: 'clicksInState',
    plusRef: '+1 в ref',
    plusState: '+1 в state',
    forceRender: 'форс-рендер',
    refHint:
      'Цифра не двигается: значение растёт, но React об этом не знает. Нажмите «форс-рендер» — и увидите настоящее значение.',
    stateHint: 'Каждый клик планирует ре-рендер, и разметка сразу совпадает с состоянием.',
    domTitle: 'второе применение: ссылка на DOM-узел',
    placeholder: 'обычный input',
    clear: 'очистить',
    notes: [
      'Ref — это `{ current: value }`, один и тот же объект на всю жизнь компонента. Меняете `.current` — React ничего не перерисовывает.',
      'Не читайте и не пишите `ref.current` во время рендера — результат не воспроизводим. Только в обработчиках и эффектах.',
      'Если значение должно попасть на экран — это `useState`, а не `useRef`. Ref хорош для id таймеров, инстансов, «предыдущего значения», флага «уже сделано».',
      'Второе применение — DOM: `<input ref={inputElement} />` кладёт узел в `.current` на коммите и `null` при размонтировании.',
      'В React 19 функциональные компоненты принимают `ref` обычным пропом — `forwardRef` больше не нужен.',
      'Нужна реакция на появление узла — используйте ref-колбэк `<div ref={node => {...}} />` (в React 19 из неё можно вернуть функцию очистки).',
    ],
  },
}

function Demo() {
  const t = useText(text)
  const clicksInRef = useRef(0)
  const [clicksInState, setClicksInState] = useState(0)
  const [, forceRender] = useState(0)
  const inputElement = useRef<HTMLInputElement>(null)

  return (
    <Stage>
      <Split>
        <Panel title={t.refTitle} tone="bad">
          <Label>{t.refLabel}</Label>
          <div className="big-num">{clicksInRef.current}</div>
          <Row>
            <Btn
              onClick={() => {
                clicksInRef.current += 1
              }}
            >
              {t.plusRef}
            </Btn>
            <Btn variant="ghost" onClick={() => forceRender((n) => n + 1)}>
              {t.forceRender}
            </Btn>
          </Row>
          <div className="muted" style={{ marginTop: 8 }}>
            {t.refHint}
          </div>
        </Panel>

        <Panel title={t.stateTitle} tone="good">
          <Label>{t.stateLabel}</Label>
          <div className="big-num">{clicksInState}</div>
          <Row>
            <Btn variant="primary" onClick={() => setClicksInState((n) => n + 1)}>
              {t.plusState}
            </Btn>
          </Row>
          <div className="muted" style={{ marginTop: 8 }}>
            {t.stateHint}
          </div>
        </Panel>
      </Split>

      <Panel title={t.domTitle}>
        <Row>
          <input className="input" ref={inputElement} placeholder={t.placeholder} />
          <Btn onClick={() => inputElement.current?.focus()}>focus()</Btn>
          <Btn
            onClick={() => {
              if (inputElement.current) inputElement.current.value = ''
            }}
          >
            {t.clear}
          </Btn>
          <Chip>ref.current = HTMLInputElement</Chip>
        </Row>
      </Panel>
    </Stage>
  )
}

export const useRefDemo: HookDemo = { id: 'useRef', pkg: 'react', text, Demo }
