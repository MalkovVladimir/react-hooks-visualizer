import { useEffect, useInsertionEffect, useLayoutEffect, useRef, useState } from 'react'
import { Btn, Chip, LogPanel, Panel, Row, Split, Stage, useLogStore, type LogStore } from '../ui/kit'
import { useText } from '../i18n'
import type { HookDemo } from '../types'

const text = {
  en: {
    tagline: 'insert a <style> before every other effect — the CSS-in-JS hook',
    code: `// This is how CSS-in-JS libraries (styled-components, emotion) inject styles.
function StyledBadge({ className, rule }) {
  useInsertionEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.textContent = rule            // the rule lands in the document
    document.head.append(styleTag)         // BEFORE any layout effect runs
    return () => styleTag.remove()
  }, [rule])

  return <span className={className}>badge</span>
}

// Any useLayoutEffect below now measures the element with those styles applied.
useLayoutEffect(() => {
  console.log(badge.current.offsetWidth)   // a correct width
}, [])`,
    badge: 'badge',
    mount: 'mount both variants',
    remount: 'mount them again',
    hint: 'compare the measured widths in the event timeline',
    leftTitle: 'style inserted in useInsertionEffect',
    rightTitle: 'style inserted in useEffect',
    leftChip: 'correct measurement',
    rightChip: 'measured before styling',
    leftHint: 'the style is already in the document when the layout effect measures the element.',
    rightHint: 'the style arrives later — the badge jumps and the measured width is wrong.',
    empty: 'press “mount both variants”',
    logInsertion: '1. useInsertionEffect: <style> appended to <head>',
    logLayout: (width: number, timing: string) =>
      `2. useLayoutEffect: measured width = ${width}px  [${timing}]`,
    logEffect: '3. useEffect: <style> appended — but the measurement already happened',
    notes: [
      'The earliest effect of all: it runs before React applies its changes to the DOM, and therefore before every `useLayoutEffect` and `useEffect`.',
      'It has exactly one purpose — to get style rules in early enough that later layout measurements are correct and the browser does not recalculate styles twice.',
      'You cannot update state inside it and you cannot touch refs: this render’s DOM nodes are not ready yet.',
      'This is a hook for library authors (styled-components, emotion). Application code almost never needs it — a plain `<style>` or a CSS file is better.',
      'It does not run on the server, same as the other effects.',
    ],
  },
  ru: {
    tagline: 'вставить <style> раньше всех эффектов — хук для CSS-in-JS библиотек',
    code: `// Так библиотеки CSS-in-JS (styled-components, emotion) вставляют стили.
function StyledBadge({ className, rule }) {
  useInsertionEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.textContent = rule            // правило попадает в документ
    document.head.append(styleTag)         // ДО того, как сработают layout-эффекты
    return () => styleTag.remove()
  }, [rule])

  return <span className={className}>значок</span>
}

// Любой useLayoutEffect ниже по дереву уже измерит элемент с этими стилями.
useLayoutEffect(() => {
  console.log(badge.current.offsetWidth)   // корректная ширина
}, [])`,
    badge: 'значок',
    mount: 'смонтировать оба варианта',
    remount: 'перемонтировать',
    hint: 'сравните измеренную ширину в ленте событий',
    leftTitle: 'стиль в useInsertionEffect',
    rightTitle: 'стиль в useEffect',
    leftChip: 'замер верный',
    rightChip: 'замер по неоформленному элементу',
    leftHint: 'стиль уже в документе, когда layout-эффект измеряет элемент.',
    rightHint: 'стиль приезжает позже — значок «прыгает», а измеренная ширина неверна.',
    empty: 'нажмите «смонтировать оба варианта»',
    logInsertion: '1. useInsertionEffect: <style> вставлен в <head>',
    logLayout: (width: number, timing: string) =>
      `2. useLayoutEffect: измерил ширину = ${width}px  [${timing}]`,
    logEffect: '3. useEffect: <style> вставлен — но замер уже сделан',
    notes: [
      'Самый ранний эффект: выполняется до того, как React применил изменения к DOM, и, значит, до всех `useLayoutEffect` и `useEffect`.',
      'Смысл ровно один — успеть вставить правила стилей, чтобы последующие замеры layout были корректными и не было лишнего пересчёта стилей браузером.',
      'Внутри нельзя обновлять состояние и нельзя обращаться к рефам: DOM-узлы этого рендера ещё не готовы.',
      'Это хук для авторов библиотек (styled-components, emotion). В прикладном коде он почти никогда не нужен — обычный `<style>` или CSS-файл лучше.',
      'На сервере не выполняется, как и остальные эффекты.',
    ],
  },
}

let instanceSeq = 0

const ruleFor = (className: string) =>
  `.${className} { display:inline-block; padding: 10px 44px; border-radius: 8px;
    background: linear-gradient(90deg, #4d6fe0, #59e3c8); color: #08101f; font-weight: 700; }`

type Labels = (typeof text)['en']

/** timing: когда вставляем <style> — в insertion-фазе или в обычном эффекте. */
function MeasuredBadge({
  timing,
  log,
  t,
}: {
  timing: 'insertion' | 'effect'
  log: LogStore['log']
  t: Labels
}) {
  const [className] = useState(() => `injected-badge-${instanceSeq++}`)
  const badge = useRef<HTMLSpanElement>(null)

  useInsertionEffect(() => {
    if (timing !== 'insertion') return
    const styleTag = document.createElement('style')
    styleTag.textContent = ruleFor(className)
    document.head.append(styleTag)
    log(t.logInsertion, 'render')
    return () => styleTag.remove()
  }, [className, timing, log, t])

  useLayoutEffect(() => {
    const width = Math.round(badge.current?.getBoundingClientRect().width ?? 0)
    log(t.logLayout(width, timing), width > 120 ? 'effect' : 'error')
  })

  useEffect(() => {
    if (timing !== 'effect') return
    const styleTag = document.createElement('style')
    styleTag.textContent = ruleFor(className)
    document.head.append(styleTag)
    log(t.logEffect, 'cleanup')
    return () => styleTag.remove()
  }, [className, timing, log, t])

  return (
    <span className={className} ref={badge}>
      {t.badge}
    </span>
  )
}

function Demo() {
  const t = useText(text)
  const logStore = useLogStore()
  const [tick, setTick] = useState(0)

  return (
    <Stage>
      <Row>
        <Btn
          variant="primary"
          onClick={() => {
            logStore.clear()
            setTick((value) => value + 1)
          }}
        >
          {tick === 0 ? t.mount : t.remount}
        </Btn>
        <span className="muted">{t.hint}</span>
      </Row>

      {tick > 0 && (
        <Split>
          <Panel title={t.leftTitle} tone="good">
            <MeasuredBadge key={`insertion-${tick}`} timing="insertion" log={logStore.log} t={t} />
            <div className="muted" style={{ marginTop: 10 }}>
              <Chip tone="good">{t.leftChip}</Chip> {t.leftHint}
            </div>
          </Panel>

          <Panel title={t.rightTitle} tone="bad">
            <MeasuredBadge key={`effect-${tick}`} timing="effect" log={logStore.log} t={t} />
            <div className="muted" style={{ marginTop: 10 }}>
              <Chip tone="bad">{t.rightChip}</Chip> {t.rightHint}
            </div>
          </Panel>
        </Split>
      )}

      <LogPanel store={logStore} empty={t.empty} />
    </Stage>
  )
}

export const useInsertionEffectDemo: HookDemo = {
  id: 'useInsertionEffect',
  pkg: 'react',
  since: '18',
  text,
  Demo,
}
