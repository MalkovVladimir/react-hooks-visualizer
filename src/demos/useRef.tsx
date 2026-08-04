import { useRef, useState } from 'react'
import { Btn, Chip, Label, Panel, Row, Split, Stage } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `function Counters() {
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
}`

function Demo() {
  const clicksInRef = useRef(0)
  const [clicksInState, setClicksInState] = useState(0)
  const [, forceRender] = useState(0)
  const inputElement = useRef<HTMLInputElement>(null)

  return (
    <Stage>
      <Split>
        <Panel title="useRef — без ре-рендера" tone="bad">
          <Label>clicksInRef.current (на экране)</Label>
          <div className="big-num">{clicksInRef.current}</div>
          <Row>
            <Btn
              onClick={() => {
                clicksInRef.current += 1
              }}
            >
              +1 в ref
            </Btn>
            <Btn variant="ghost" onClick={() => forceRender((n) => n + 1)}>
              форс-рендер
            </Btn>
          </Row>
          <div className="muted" style={{ marginTop: 8 }}>
            Цифра не двигается: значение растёт, но React об этом не знает. Нажмите «форс-рендер» —
            и увидите настоящее значение.
          </div>
        </Panel>

        <Panel title="useState — с ре-рендером" tone="good">
          <Label>clicksInState</Label>
          <div className="big-num">{clicksInState}</div>
          <Row>
            <Btn variant="primary" onClick={() => setClicksInState((n) => n + 1)}>
              +1 в state
            </Btn>
          </Row>
          <div className="muted" style={{ marginTop: 8 }}>
            Каждый клик планирует ре-рендер, и разметка сразу совпадает с состоянием.
          </div>
        </Panel>
      </Split>

      <Panel title="второе применение: ссылка на DOM-узел">
        <Row>
          <input className="input" ref={inputElement} placeholder="обычный input" />
          <Btn onClick={() => inputElement.current?.focus()}>focus()</Btn>
          <Btn
            onClick={() => {
              if (inputElement.current) inputElement.current.value = ''
            }}
          >
            очистить
          </Btn>
          <Chip>ref.current = HTMLInputElement</Chip>
        </Row>
      </Panel>
    </Stage>
  )
}

export const useRefDemo: HookDemo = {
  id: 'useRef',
  pkg: 'react',
  tagline: 'значение, которое переживает рендеры и не вызывает их',
  code,
  Demo,
  notes: [
    'Ref — это `{ current: value }`, один и тот же объект на всю жизнь компонента. Меняете `.current` — React ничего не перерисовывает.',
    'Не читайте и не пишите `ref.current` во время рендера — результат не воспроизводим. Только в обработчиках и эффектах.',
    'Если значение должно попасть на экран — это `useState`, а не `useRef`. Ref хорош для id таймеров, инстансов, «предыдущего значения», флага «уже сделано».',
    'Второе применение — DOM: `<input ref={inputElement} />` кладёт узел в `.current` на коммите и `null` при размонтировании.',
    'В React 19 функциональные компоненты принимают `ref` обычным пропом — `forwardRef` больше не нужен.',
    'Нужна реакция на появление узла — используйте ref-колбэк `<div ref={node => {...}} />` (в React 19 из неё можно вернуть функцию очистки).',
  ],
}
