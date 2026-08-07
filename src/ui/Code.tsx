const ESCAPE: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }
const escapeHtml = (source: string) => source.replace(/[&<>]/g, (ch) => ESCAPE[ch])

const KEYWORDS =
  'const|let|var|function|return|if|else|for|while|import|from|export|default|async|await|new|typeof|instanceof|null|undefined|true|false|class|extends|try|catch|finally|throw|switch|case|break|continue|of|in|delete|void|do|yield'

const TOKENS = new RegExp(
  [
    '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)', // 1 comment
    '(`(?:\\\\.|[^`\\\\])*`|\'(?:\\\\.|[^\'\\\\])*\'|"(?:\\\\.|[^"\\\\])*")', // 2 string
    `\\b(${KEYWORDS})\\b`, // 3 keyword
    '(&lt;\\/?[A-Z][\\w.]*|&lt;\\/?[a-z][\\w-]*(?=[\\s/&]))', // 4 jsx tag
    '\\b(use[A-Z]\\w*)\\b', // 5 hook
    '\\b(\\d+(?:\\.\\d+)?)\\b', // 6 number
    '([A-Za-z_$][\\w$]*)(?=\\()', // 7 call
  ].join('|'),
  'g',
)

/** Небольшая подсветка JS/JSX — без внешних зависимостей. */
function highlight(source: string) {
  return escapeHtml(source).replace(
    TOKENS,
    (match, comment, str, keyword, jsx, hook, num, call) => {
      if (comment) return `<span class="tok-com">${comment}</span>`
      if (str) return `<span class="tok-str">${str}</span>`
      if (keyword) return `<span class="tok-key">${keyword}</span>`
      if (jsx) return `<span class="tok-jsx">${jsx}</span>`
      if (hook) return `<span class="tok-hook">${hook}</span>`
      if (num) return `<span class="tok-num">${num}</span>`
      if (call) return `<span class="tok-fn">${call}</span>`
      return match
    },
  )
}

export function Code({ children, title }: { children: string; title?: string }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="dot" />
        {title ?? 'code'}
      </div>
      <pre className="code" dangerouslySetInnerHTML={{ __html: highlight(children.trim()) }} />
    </div>
  )
}
