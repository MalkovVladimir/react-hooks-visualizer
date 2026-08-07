import { useCallback, useEffect, useRef, useState } from 'react'
import { demos } from './demos'
import { Code } from './ui/Code'
import { Rich } from './ui/kit'
import { LANGS, LangProvider, uiText, useLangState, type Lang } from './i18n'
import type { HookDemo } from './types'

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
  lang,
  isOpen,
  onToggle,
  onNext,
  isLast,
  cardRef,
}: {
  demo: HookDemo
  index: number
  lang: Lang
  isOpen: boolean
  onToggle: () => void
  onNext: () => void
  isLast: boolean
  cardRef: (node: HTMLElement | null) => void
}) {
  const { Demo } = demo
  const ui = uiText[lang]
  const text = demo.text[lang]

  return (
    <section className={`card${isOpen ? ' open' : ''}`} id={demo.id} ref={cardRef}>
      <button className="card-head" onClick={onToggle} aria-expanded={isOpen}>
        <Chevron />
        <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="card-title">{demo.id}</span>
        <span className="card-tagline">{text.tagline}</span>
        <span className="chip">{demo.pkg}</span>
      </button>

      {isOpen && (
        <div className="card-body">
          <div className="split">
            <Code title={`${demo.id} — ${ui.codeTitle}`}>{text.code}</Code>
            {/* ключ по языку тоже: смена языка монтирует демо заново, чтобы в лентах
                не оставалось строк на прошлом языке */}
            <Demo key={`${demo.id}-${lang}`} />
          </div>

          <div className="notes">
            <ul>
              {text.notes.map((note, noteIndex) => (
                <li key={noteIndex}>
                  <Rich>{note}</Rich>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-foot">
            <span className="muted">
              {demo.since ? `${ui.since} ${demo.since}` : ui.sinceAny}
            </span>
            {!isLast ? (
              <button className="btn primary" onClick={onNext}>
                {ui.next}: {demos[index + 1].id} →
              </button>
            ) : (
              <span className="muted">{ui.last}</span>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default function App() {
  const [lang, setLang] = useLangState()
  const ui = uiText[lang]

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

  // Ссылка вида /#useMemo должна открывать хук и тогда, когда страница уже загружена:
  // из README, из закладки или кнопкой «назад».
  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.slice(1)
      if (id === openId || !demos.some((demo) => demo.id === id)) return
      shouldScroll.current = true
      setOpenId(id)
    }
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [openId])

  // Эффект выполняется после коммита, поэтому высота документа уже пересчитана
  // с учётом раскрытия и схлопывания карточек.
  useEffect(() => {
    if (!shouldScroll.current) return
    shouldScroll.current = false
    const node = cards.current.get(openId)
    if (!node) return
    const frame = requestAnimationFrame(() =>
      node.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
    return () => cancelAnimationFrame(frame)
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
    <LangProvider lang={lang}>
      <div className="shell">
        <header className="masthead">
          <div className="masthead-top">
            <h1>
              {ui.titleBefore}
              <span>{ui.titleHighlight}</span>
              {ui.titleAfter}
            </h1>
            <div className="lang-switch" role="group" aria-label={ui.langLabel}>
              {LANGS.map((option) => (
                <button
                  key={option.id}
                  className={`lang-btn${option.id === lang ? ' active' : ''}`}
                  onClick={() => setLang(option.id)}
                  aria-pressed={option.id === lang}
                  title={option.title}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <p>{ui.lead}</p>

          <div className="meta">
            <span className="chip accent">React 19.2</span>
            <span className="chip">
              {demos.length} {ui.chipHooks}
            </span>
            <span className="chip">{ui.chipHint}</span>
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
                lang={lang}
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
              {openIndex >= 0
                ? `${ui.footerOpen} ${openIndex + 1} ${ui.footerOf} ${demos.length}. `
                : ''}
              {ui.footerTail}
            </div>
          </main>
        </div>
      </div>
    </LangProvider>
  )
}
