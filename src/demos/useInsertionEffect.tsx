import { useEffect, useInsertionEffect, useLayoutEffect, useRef, useState } from 'react'
import { Btn, Chip, LogPanel, Panel, Row, Split, Stage, useLogStore, type LogStore } from '../ui/kit'
import type { HookDemo } from '../types'

const code = `// Так библиотеки CSS-in-JS (styled-components, emotion) вставляют стили.
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
}, [])`

let instanceSeq = 0

const ruleFor = (className: string) =>
  `.${className} { display:inline-block; padding: 10px 44px; border-radius: 8px;
    background: linear-gradient(90deg, #4d6fe0, #59e3c8); color: #08101f; font-weight: 700; }`

/** timing: когда вставляем <style> — в insertion-фазе или в обычном эффекте. */
function MeasuredBadge({ timing, log }: { timing: 'insertion' | 'effect'; log: LogStore['log'] }) {
  const [className] = useState(() => `injected-badge-${instanceSeq++}`)
  const badge = useRef<HTMLSpanElement>(null)

  useInsertionEffect(() => {
    if (timing !== 'insertion') return
    const styleTag = document.createElement('style')
    styleTag.textContent = ruleFor(className)
    document.head.append(styleTag)
    log('1. useInsertionEffect: <style> вставлен в <head>', 'render')
    return () => styleTag.remove()
  }, [className, timing, log])

  useLayoutEffect(() => {
    const width = Math.round(badge.current?.getBoundingClientRect().width ?? 0)
    log(`2. useLayoutEffect: измерил ширину = ${width}px  [${timing}]`, width > 120 ? 'effect' : 'error')
  })

  useEffect(() => {
    if (timing !== 'effect') return
    const styleTag = document.createElement('style')
    styleTag.textContent = ruleFor(className)
    document.head.append(styleTag)
    log('3. useEffect: <style> вставлен — но замер уже сделан', 'cleanup')
    return () => styleTag.remove()
  }, [className, timing, log])

  return (
    <span className={className} ref={badge}>
      значок
    </span>
  )
}

function Demo() {
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
          {tick === 0 ? 'смонтировать оба варианта' : 'перемонтировать'}
        </Btn>
        <span className="muted">сравните измеренную ширину в ленте событий</span>
      </Row>

      {tick > 0 && (
        <Split>
          <Panel title="стиль в useInsertionEffect" tone="good">
            <MeasuredBadge key={`insertion-${tick}`} timing="insertion" log={logStore.log} />
            <div className="muted" style={{ marginTop: 10 }}>
              <Chip tone="good">замер верный</Chip> стиль уже в документе, когда layout-эффект
              измеряет элемент.
            </div>
          </Panel>

          <Panel title="стиль в useEffect" tone="bad">
            <MeasuredBadge key={`effect-${tick}`} timing="effect" log={logStore.log} />
            <div className="muted" style={{ marginTop: 10 }}>
              <Chip tone="bad">замер по неоформленному элементу</Chip> стиль приезжает позже —
              значок «прыгает», а измеренная ширина неверна.
            </div>
          </Panel>
        </Split>
      )}

      <LogPanel store={logStore} empty="нажмите «смонтировать оба варианта»" />
    </Stage>
  )
}

export const useInsertionEffectDemo: HookDemo = {
  id: 'useInsertionEffect',
  pkg: 'react',
  tagline: 'вставить <style> раньше всех эффектов — хук для CSS-in-JS библиотек',
  code,
  Demo,
  notes: [
    'Самый ранний эффект: выполняется до того, как React применил изменения к DOM, и, значит, до всех `useLayoutEffect` и `useEffect`.',
    'Смысл ровно один — успеть вставить правила стилей, чтобы последующие замеры layout были корректными и не было лишнего пересчёта стилей браузером.',
    'Внутри нельзя обновлять состояние и нельзя обращаться к рефам: DOM-узлы этого рендера ещё не готовы.',
    'Это хук для авторов библиотек (styled-components, emotion). В прикладном коде он почти никогда не нужен — обычный `<style>` или CSS-файл лучше.',
    'На сервере не выполняется, как и остальные эффекты.',
  ],
  since: '18',
}
