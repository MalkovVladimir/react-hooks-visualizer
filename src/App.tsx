import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { demos } from './demos'
import { Code } from './ui/Code'
import type { HookDemo } from './types'

/** Превращает `code` в бэктиках в <code>. */
function renderNote(text: string): ReactNode[] {
  return text.split(/`([^`]+)`/g).map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="inline-code">
        {part}
      </code>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

function Chevron() {
  return (
    <svg className="chevron" width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function HookCard({
  demo,
  index,
  isOpen,
  onToggle,
  onNext,
  isLast,
  cardRef,
}: {
  demo: HookDemo
  index: number
  isOpen: boolean
  onToggle: () => void
  onNext: () => void
  isLast: boolean
  cardRef: (node: HTMLElement | null) => void
}) {
  const { Demo } = demo

  return (
    <section className={`card${isOpen ? ' open' : ''}`} id={demo.id} ref={cardRef}>
      <button className="card-head" onClick={onToggle} aria-expanded={isOpen}>
        <Chevron />
        <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="card-title">{demo.id}</span>
        <span className="card-tagline">{demo.tagline}</span>
        <span className="chip">{demo.pkg}</span>
      </button>

      {isOpen && (
        <div className="card-body">
          <div className="split">
            <Code title={`${demo.id} — пример`}>{demo.code}</Code>
            {/* ключ по id — при переключении хука демо монтируется заново */}
            <Demo key={demo.id} />
          </div>

          <div className="notes">
            <ul>
              {demo.notes.map((note, noteIndex) => (
                <li key={noteIndex}>{renderNote(note)}</li>
              ))}
            </ul>
          </div>

          <div className="card-foot">
            <span className="muted">
              {demo.since ? `доступен с React ${demo.since}` : 'доступен во всех версиях с хуками'}
            </span>
            {!isLast ? (
              <button className="btn primary" onClick={onNext}>
                Далее: {demos[index + 1].id} →
              </button>
            ) : (
              <span className="muted">Это последний хук в списке 🎉</span>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default function App() {
  const initialId = demos.some((demo) => demo.id === window.location.hash.slice(1))
    ? window.location.hash.slice(1)
    : demos[0].id

  const [openId, setOpenId] = useState(initialId)
  const cards = useRef(new Map<string, HTMLElement>())
  const shouldScroll = useRef(false)

  const open = useCallback((id: string) => {
    shouldScroll.current = true
    setOpenId(id)
    history.replaceState(null, '', `#${id}`)
  }, [])

  const toggle = useCallback((id: string) => {
    shouldScroll.current = true
    setOpenId((current) => (current === id ? '' : id))
    history.replaceState(null, '', `#${id}`)
  }, [])

  // Эффект выполняется после коммита, поэтому высота документа уже пересчитана
  // с учётом раскрытия и схлопывания карточек — можно скроллить сразу.
  useEffect(() => {
    if (!shouldScroll.current) return
    shouldScroll.current = false
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    cards.current.get(openId)?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [openId])

  const openIndex = demos.findIndex((demo) => demo.id === openId)
  const reactHooks = demos.filter((demo) => demo.pkg === 'react')
  const domHooks = demos.filter((demo) => demo.pkg === 'react-dom')

  const tocItem = (demo: HookDemo) => (
    <button
      key={demo.id}
      className={`toc-item${demo.id === openId ? ' active' : ''}`}
      onClick={() => open(demo.id)}
    >
      <span className="toc-num">{demos.indexOf(demo) + 1}</span>
      {demo.id}
    </button>
  )

  return (
    <div className="shell">
      <header className="masthead">
        <h1>
          Все хуки <span>React</span> — наглядно
        </h1>
        <p>
          Слева — минимальный пример кода, справа — живой результат. Где хук про кеш или про
          отзывчивость, стоят две панели: «без хука» и «с хуком». Где про жизненный цикл — события
          показаны анимированной лентой.
        </p>
        <div className="meta">
          <span className="chip accent">React 19.2</span>
          <span className="chip">{demos.length} хуков</span>
          <span className="chip">клик по названию — плавный скролл к демо</span>
        </div>
      </header>

      <div className="layout">
        <nav className="toc">
          <div className="toc-group">react</div>
          {reactHooks.map(tocItem)}
          <div className="toc-group">react-dom</div>
          {domHooks.map(tocItem)}
        </nav>

        <main>
          {demos.map((demo, index) => (
            <HookCard
              key={demo.id}
              demo={demo}
              index={index}
              isOpen={demo.id === openId}
              isLast={index === demos.length - 1}
              onToggle={() => toggle(demo.id)}
              onNext={() => open(demos[index + 1].id)}
              cardRef={(node) => {
                if (node) cards.current.set(demo.id, node)
                else cards.current.delete(demo.id)
              }}
            />
          ))}

          <div className="footer">
            {openIndex >= 0 ? `Открыт ${openIndex + 1} из ${demos.length}. ` : ''}
            Каждое демо — рабочий компонент: код в панели слева и есть то, что выполняется справа.
          </div>
        </main>
      </div>
    </div>
  )
}
