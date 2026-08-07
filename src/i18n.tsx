import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'ru'

export const LANGS: { id: Lang; label: string; title: string }[] = [
  { id: 'en', label: 'EN', title: 'English' },
  { id: 'ru', label: 'RU', title: 'Русский' },
]

const STORAGE_KEY = 'hooks-visualizer-lang'

const LangContext = createContext<Lang>('en')

export const useLang = () => useContext(LangContext)

/** Достаёт из словаря вариант на текущем языке. */
export function useText<T>(dictionary: Record<Lang, T>): T {
  return dictionary[useLang()]
}

export function useLangState() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'ru' || saved === 'en' ? saved : 'en'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  return [lang, setLang] as const
}

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext value={lang}>{children}</LangContext>
}

/* ------------------------------------------------------ тексты самой страницы */

export const uiText: Record<Lang, Record<string, string>> = {
  en: {
    titleBefore: 'Every ',
    titleHighlight: 'React',
    titleAfter: ' hook, made visible',
    lead: 'A minimal code sample on the left, the live result on the right. Hooks about caching or responsiveness get two panels — “without” and “with”. Hooks about the lifecycle get an animated timeline of real events.',
    chipHooks: 'hooks',
    chipHint: 'click a name to scroll to its demo',
    codeTitle: 'example',
    next: 'Next',
    last: 'Last hook in the list 🎉',
    since: 'available since React',
    sinceAny: 'available in every version with hooks',
    footerOpen: 'Open',
    footerOf: 'of',
    footerTail:
      'Every demo is a working component: the code on the left is what runs on the right.',
    langLabel: 'Language',
  },
  ru: {
    titleBefore: 'Все хуки ',
    titleHighlight: 'React',
    titleAfter: ' — наглядно',
    lead: 'Слева — минимальный пример кода, справа — живой результат. Где хук про кеш или про отзывчивость, стоят две панели: «без хука» и «с хуком». Где про жизненный цикл — события показаны анимированной лентой.',
    chipHooks: 'хуков',
    chipHint: 'клик по названию — плавный скролл к демо',
    codeTitle: 'пример',
    next: 'Далее',
    last: 'Это последний хук в списке 🎉',
    since: 'доступен с React',
    sinceAny: 'доступен во всех версиях с хуками',
    footerOpen: 'Открыт',
    footerOf: 'из',
    footerTail:
      'Каждое демо — рабочий компонент: код в панели слева и есть то, что выполняется справа.',
    langLabel: 'Язык',
  },
}
