import { useImperativeHandle, useRef } from 'react'
import { Btn, Chip, LogPanel, Row, Stage, useLogStore } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `// В React 19 ref приходит обычным пропом — forwardRef не нужен.
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
}`

type SearchFieldHandle = {
  focus: () => void
  clear: () => void
  shake: () => void
}

function SearchField({ ref }: { ref: React.Ref<SearchFieldHandle> }) {
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

  return <input className="input" ref={inputElement} placeholder="поиск по документации" />
}

function Demo() {
  const searchField = useRef<SearchFieldHandle>(null)
  const logStore = useLogStore()

  const call = (method: keyof SearchFieldHandle) => {
    logStore.log(`searchField.current.${method}()`, 'effect')
    searchField.current?.[method]()
  }

  const peek = () => {
    const handle = searchField.current as unknown as Record<string, unknown> | null
    logStore.log(`Object.keys(ref.current) = [${handle ? Object.keys(handle).join(', ') : ''}]`, 'render')
    logStore.log(`ref.current.style → ${String(handle?.style)} (DOM наружу не отдан)`, 'cleanup')
  }

  return (
    <Stage>
      <SearchField ref={searchField} />

      <Row>
        <Btn variant="primary" onClick={() => call('focus')}>
          focus()
        </Btn>
        <Btn onClick={() => call('clear')}>clear()</Btn>
        <Btn onClick={() => call('shake')}>shake()</Btn>
        <Btn variant="ghost" onClick={peek}>
          что внутри ref?
        </Btn>
      </Row>

      <Row>
        <span className="label">публичный API дочернего компонента:</span>
        <Chip tone="good">focus</Chip>
        <Chip tone="good">clear</Chip>
        <Chip tone="good">shake</Chip>
        <Chip tone="bad">style ✕</Chip>
        <Chip tone="bad">value ✕</Chip>
      </Row>

      <LogPanel store={logStore} empty="вызовите метод «пульта»" />
    </Stage>
  )
}

export const useImperativeHandleDemo: HookDemo = {
  id: 'useImperativeHandle',
  pkg: 'react',
  tagline: 'отдать родителю ограниченный «пульт» вместо DOM-узла',
  code,
  Demo,
  notes: [
    'Хук подменяет то, что окажется в `ref.current` у родителя: вместо DOM-узла — объект, который вы сами собрали.',
    'Смысл — инкапсуляция: родитель может вызвать `focus()`, но не может залезть в `style`, `value` или удалить узел.',
    'Второй аргумент — массив зависимостей. С `[]` объект-handle создаётся один раз; если внутри замыкаются пропсы, их надо перечислить.',
    'Это аварийный люк. Сначала попробуйте пропсы: «сфокусироваться при открытии» обычно решается пропом `autoFocus`, а не императивным вызовом.',
    'В React 19 `ref` — обычный проп функционального компонента, `forwardRef` не требуется (и постепенно устаревает).',
  ],
  since: '16.8',
}
