import type { ComponentType } from 'react'

export type HookDemo = {
  /** Имя хука, оно же id секции и якорь в url. */
  id: string
  /** Пакет, из которого хук импортируется. */
  pkg: 'react' | 'react-dom'
  /** Одна строка: зачем он нужен. */
  tagline: string
  /** Минимальный пример — то, что слева. */
  code: string
  /** Живая визуализация — то, что справа. */
  Demo: ComponentType
  /** Нюансы, ради которых обычно и лезут в доку. Поддерживает `code` в бэктиках. */
  notes: string[]
  /** Версия React, начиная с которой хук доступен. */
  since?: string
}
