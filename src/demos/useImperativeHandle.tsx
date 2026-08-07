import { useImperativeHandle, useRef } from 'react'
import { Btn, Chip, LogPanel, Row, Stage, useLogStore } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'hand the parent a limited remote control instead of a DOM node',
    code: `// In React 19 ref arrives as an ordinary prop — no forwardRef needed.
function SearchField({ ref }) {
  const inputElement = useRef(null)

  // We expose a small three-method remote, not the DOM node.
  useImperativeHandle(ref, () => ({
    focus:  () => inputElement.current.focus(),
    clear:  () => { inputElement.current.value = '' },
    shake:  () => inputElement.current.animate(
      [{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }],
      { duration: 90, iterations: 4 },
    ),
  }), [])

  return <input ref={inputElement} placeholder="search" />
}

function Toolbar() {
  const searchField = useRef(null)

  // searchField.current.style is undefined: the DOM never leaked out.
  return (
    <>
      <SearchField ref={searchField} />
      <button onClick={() => searchField.current.focus()}>focus it</button>
      <button onClick={() => searchField.current.shake()}>shake it</button>
    </>
  )
}`,
    placeholder: 'search the docs',
    peek: 'what is inside the ref?',
    apiLabel: 'public API of the child component:',
    empty: 'call a method on the remote',
    logDom: (value: string) => `ref.current.style → ${value} (the DOM never leaked out)`,
    notes: [
      'The hook replaces what lands in the parent’s `ref.current`: instead of a DOM node, an object you assembled yourself.',
      'The point is encapsulation: the parent can call `focus()` but cannot touch `style`, `value`, or remove the node.',
      'The second argument is a dependency array. With `[]` the handle object is created once; if it closes over props, list them.',
      'It is an escape hatch. Try props first: “focus when opened” is usually an `autoFocus` prop, not an imperative call.',
      'In React 19 `ref` is an ordinary prop of a function component, so `forwardRef` is not required (and is on its way out).',
    ],
  },
  ru: {
    tagline: 'отдать родителю ограниченный «пульт» вместо DOM-узла',
    code: `// В React 19 ref приходит обычным пропом — forwardRef не нужен.
function SearchField({ ref }) {
  const inputElement = useRef(null)

  // Наружу отдаём не DOM-узел, а маленький «пульт» из трёх методов.
  useImperativeHandle(ref, () => ({
    focus:  () => inputElement.current.focus(),
    clear:  () => { inputElement.current.value = '' },
    shake:  () => inputElement.current.animate(
      [{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }],
      { duration: 90, iterations: 4 },
    ),
  }), [])

  return <input ref={inputElement} placeholder="поиск" />
}

function Toolbar() {
  const searchField = useRef(null)

  // searchField.current.style — undefined: DOM наружу не утёк.
  return (
    <>
      <SearchField ref={searchField} />
      <button onClick={() => searchField.current.focus()}>сфокусировать</button>
      <button onClick={() => searchField.current.shake()}>потрясти</button>
    </>
  )
}`,
    placeholder: 'поиск по документации',
    peek: 'что внутри ref?',
    apiLabel: 'публичный API дочернего компонента:',
    empty: 'вызовите метод «пульта»',
    logDom: (value: string) => `ref.current.style → ${value} (DOM наружу не отдан)`,
    notes: [
      'Хук подменяет то, что окажется в `ref.current` у родителя: вместо DOM-узла — объект, который вы сами собрали.',
      'Смысл — инкапсуляция: родитель может вызвать `focus()`, но не может залезть в `style`, `value` или удалить узел.',
      'Второй аргумент — массив зависимостей. С `[]` объект-handle создаётся один раз; если внутри замыкаются пропсы, их надо перечислить.',
      'Это аварийный люк. Сначала попробуйте пропсы: «сфокусироваться при открытии» обычно решается пропом `autoFocus`, а не императивным вызовом.',
      'В React 19 `ref` — обычный проп функционального компонента, `forwardRef` не требуется (и постепенно устаревает).',
    ],
  },
}

type SearchFieldHandle = {
  focus: () => void
  clear: () => void
  shake: () => void
}

function SearchField({ ref, placeholder }: { ref: React.Ref<SearchFieldHandle>; placeholder: string }) {
  const inputElement = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => {
    return {
      focus: () => inputElement.current?.focus(),
      clear: () => {
        if (inputElement.current) inputElement.current.value = ''
      },
      shake: () =>
        inputElement.current?.animate(
          [
            { transform: 'translateX(-6px)' },
            { transform: 'translateX(6px)' },
            { transform: 'translateX(0)' },
          ],
          { duration: 110, iterations: 3 },
        ),
    }
  }, [])

  return <input className="input" ref={inputElement} placeholder={placeholder} />
}

function Demo() {
  const t = useText(text)
  const searchField = useRef<SearchFieldHandle>(null)
  const logStore = useLogStore()

  const call = (method: keyof SearchFieldHandle) => {
    logStore.log(`searchField.current.${method}()`, 'effect')
    searchField.current?.[method]()
  }

  const peek = () => {
    const handle = searchField.current as unknown as Record<string, unknown> | null
    logStore.log(
      `Object.keys(ref.current) = [${handle ? Object.keys(handle).join(', ') : ''}]`,
      'render',
    )
    logStore.log(t.logDom(String(handle?.style)), 'cleanup')
  }

  return (
    <Stage>
      <SearchField ref={searchField} placeholder={t.placeholder} />

      <Row>
        <Btn variant="primary" onClick={() => call('focus')}>
          focus()
        </Btn>
        <Btn onClick={() => call('clear')}>clear()</Btn>
        <Btn onClick={() => call('shake')}>shake()</Btn>
        <Btn variant="ghost" onClick={peek}>
          {t.peek}
        </Btn>
      </Row>

      <Row>
        <span className="label">{t.apiLabel}</span>
        <Chip tone="good">focus</Chip>
        <Chip tone="good">clear</Chip>
        <Chip tone="good">shake</Chip>
        <Chip tone="bad">style ✕</Chip>
        <Chip tone="bad">value ✕</Chip>
      </Row>

      <LogPanel store={logStore} empty={t.empty} />
    </Stage>
  )
}

export const useImperativeHandleDemo: HookDemo = {
  id: 'useImperativeHandle',
  pkg: 'react',
  since: '16.8',
  text,
  Demo,
}
