import { createContext, useContext, useState } from 'react'
import { Btn, Chip, Row, Stage } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `const ThemeContext = createContext('light')

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
}`

const ThemeContext = createContext('light')

function ThemeBadge({ where }: { where: string }) {
  const theme = useContext(ThemeContext)
  return (
    <div className="tree-node lit">
      <Row>
        <span>{where}</span>
        <span className="muted">useContext(ThemeContext) →</span>
        <span key={theme} className="pulse">
          <Chip tone="good">{theme}</Chip>
        </span>
      </Row>
    </div>
  )
}

function Sidebar() {
  return (
    <div className="tree-node">
      <span className="muted">&lt;Sidebar /&gt; — про тему не знает</span>
      <ThemeBadge where="<ThemeBadge />" />
    </div>
  )
}

function Layout() {
  return (
    <div className="tree-node">
      <span className="muted">&lt;Layout /&gt; — про тему не знает</span>
      <Sidebar />
    </div>
  )
}

function Demo() {
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
            <Layout />

            <ThemeContext.Provider value="contrast">
              <div className="tree-node lit">
                <Row>
                  <span>&lt;ThemeContext.Provider value=</span>
                  <Chip tone="warn">contrast</Chip>
                  <span>&gt; — перекрывает родителя</span>
                </Row>
                <ThemeBadge where="<ThemeBadge />" />
              </div>
            </ThemeContext.Provider>
          </div>
        </ThemeContext.Provider>
      </div>

      <div className="muted">
        Значение «телепортируется» сквозь два компонента без единого пропа. Вложенный Provider
        обслуживает только своё поддерево.
      </div>
    </Stage>
  )
}

export const useContextDemo: HookDemo = {
  id: 'useContext',
  pkg: 'react',
  tagline: 'читать значение ближайшего Provider без prop drilling',
  code,
  Demo,
  notes: [
    'Хук ищет ближайший Provider выше по дереву. Provider, отрендеренный самим компонентом, на его собственный `useContext` не влияет.',
    'Если Provider не найден, вернётся значение по умолчанию из `createContext(default)` — частый источник «почему undefined».',
    'В React 19 можно рендерить `<ThemeContext value={x}>` вместо `<ThemeContext.Provider value={x}>`.',
    'Любое изменение `value` ре-рендерит всех потребителей. Объектный `value` заворачивайте в `useMemo`, иначе новый объект на каждом рендере родителя будит всё поддерево.',
    'Контекст — про передачу, а не про производительность: он не заменяет стейт-менеджер и не мемоизирует по полям.',
  ],
}
