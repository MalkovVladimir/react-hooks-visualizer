import { createContext, useContext, useState } from 'react'
import { Btn, Chip, Row, Stage } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'read the nearest Provider without prop drilling',
    code: `const ThemeContext = createContext('light')

// Neither Layout nor Sidebar knows about the theme or passes anything down.
function Layout()  { return <Sidebar /> }
function Sidebar() { return <ThemeBadge /> }

// The leaf reads the value straight from the nearest Provider above it.
function ThemeBadge() {
  const theme = useContext(ThemeContext)
  return <span className={theme}>theme: {theme}</span>
}

function App() {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={theme}>
      <Layout />

      {/* a nested Provider overrides the value for its own subtree */}
      <ThemeContext.Provider value="contrast">
        <ThemeBadge />
      </ThemeContext.Provider>

      <button onClick={() => setTheme('dark')}>change theme</button>
    </ThemeContext.Provider>
  )
}`,
    unaware: (name: string) => `<${name} /> — knows nothing about the theme`,
    overrides: '> — overrides the parent',
    hint: 'The value teleports through two components without a single prop. The nested Provider serves only its own subtree.',
    notes: [
      'The hook looks for the nearest Provider above it. A Provider rendered by the component itself does not affect that component’s own `useContext`.',
      'With no Provider found you get the default from `createContext(default)` — a common source of “why is this undefined”.',
      'In React 19 you can render `<ThemeContext value={x}>` instead of `<ThemeContext.Provider value={x}>`.',
      'Any change of `value` re-renders every consumer. Wrap object values in `useMemo`, otherwise a fresh object on each parent render wakes the whole subtree.',
      'Context is about delivery, not performance: it is not a state manager and it does not memoise per field.',
    ],
  },
  ru: {
    tagline: 'читать значение ближайшего Provider без prop drilling',
    code: `const ThemeContext = createContext('light')

// Ни Layout, ни Sidebar не знают про тему и ничего не прокидывают.
function Layout()  { return <Sidebar /> }
function Sidebar() { return <ThemeBadge /> }

// Лист читает значение напрямую у ближайшего Provider сверху.
function ThemeBadge() {
  const theme = useContext(ThemeContext)
  return <span className={theme}>тема: {theme}</span>
}

function App() {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={theme}>
      <Layout />

      {/* вложенный Provider перекрывает значение для своего поддерева */}
      <ThemeContext.Provider value="contrast">
        <ThemeBadge />
      </ThemeContext.Provider>

      <button onClick={() => setTheme('dark')}>сменить тему</button>
    </ThemeContext.Provider>
  )
}`,
    unaware: (name: string) => `<${name} /> — про тему не знает`,
    overrides: '> — перекрывает родителя',
    hint: 'Значение «телепортируется» сквозь два компонента без единого пропа. Вложенный Provider обслуживает только своё поддерево.',
    notes: [
      'Хук ищет ближайший Provider выше по дереву. Provider, отрендеренный самим компонентом, на его собственный `useContext` не влияет.',
      'Если Provider не найден, вернётся значение по умолчанию из `createContext(default)` — частый источник «почему undefined».',
      'В React 19 можно рендерить `<ThemeContext value={x}>` вместо `<ThemeContext.Provider value={x}>`.',
      'Любое изменение `value` ре-рендерит всех потребителей. Объектный `value` заворачивайте в `useMemo`, иначе новый объект на каждом рендере родителя будит всё поддерево.',
      'Контекст — про передачу, а не про производительность: он не заменяет стейт-менеджер и не мемоизирует по полям.',
    ],
  },
}

const ThemeContext = createContext('light')

function ThemeBadge() {
  const theme = useContext(ThemeContext)
  return (
    <div className="tree-node lit">
      <Row>
        <span>&lt;ThemeBadge /&gt;</span>
        <span className="muted">useContext(ThemeContext) →</span>
        <span key={theme} className="pulse">
          <Chip tone="good">{theme}</Chip>
        </span>
      </Row>
    </div>
  )
}

function Sidebar({ label }: { label: string }) {
  return (
    <div className="tree-node">
      <span className="muted">{label}</span>
      <ThemeBadge />
    </div>
  )
}

function Layout({ labels }: { labels: [string, string] }) {
  return (
    <div className="tree-node">
      <span className="muted">{labels[0]}</span>
      <Sidebar label={labels[1]} />
    </div>
  )
}

function Demo() {
  const t = useText(text)
  const [theme, setTheme] = useState('light')

  return (
    <Stage>
      <Row>
        {['light', 'dark', 'sepia'].map((option) => (
          <Btn
            key={option}
            variant={option === theme ? 'primary' : 'default'}
            onClick={() => setTheme(option)}
          >
            {option}
          </Btn>
        ))}
      </Row>

      <div className="tree">
        <ThemeContext.Provider value={theme}>
          <div className="tree-node lit" style={{ marginLeft: 0 }}>
            <Row>
              <span>&lt;ThemeContext.Provider value=</span>
              <Chip tone="accent">{theme}</Chip>
              <span>&gt;</span>
            </Row>
            <Layout labels={[t.unaware('Layout'), t.unaware('Sidebar')]} />

            <ThemeContext.Provider value="contrast">
              <div className="tree-node lit">
                <Row>
                  <span>&lt;ThemeContext.Provider value=</span>
                  <Chip tone="warn">contrast</Chip>
                  <span>{t.overrides}</span>
                </Row>
                <ThemeBadge />
              </div>
            </ThemeContext.Provider>
          </div>
        </ThemeContext.Provider>
      </div>

      <div className="muted">{t.hint}</div>
    </Stage>
  )
}

export const useContextDemo: HookDemo = { id: 'useContext', pkg: 'react', text, Demo }
