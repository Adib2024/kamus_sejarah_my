import type { ReactNode, SVGProps } from 'react'
import type { Run } from '../lib/data'

const paths: Record<string, ReactNode> = {
  book: <path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2zm0 0v13" />,
  cards: (
    <>
      <rect x="3" y="7" width="14" height="12" rx="2" />
      <path d="M7 7V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    </>
  ),
  quiz: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.2M12 16.5v.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.5v.01" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="17.5" cy="6" r="2.5" />
      <circle cx="17.5" cy="18" r="2.5" />
      <path d="m8.2 10.8 7-3.6M8.2 13.2l7 3.6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  auto: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" />
    </>
  ),
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  left: <path d="M15 5l-7 7 7 7" />,
  right: <path d="M9 5l7 7-7 7" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  refresh: <path d="M20 11a8 8 0 0 0-14.5-4M4 4v3.5h3.5M4 13a8 8 0 0 0 14.5 4M20 20v-3.5h-3.5" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  home: <path d="M4 11.5 12 4l8 7.5V20h-5.5v-5.5h-5V20H4z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />,
}

export function Icon({ name, className = 'size-5', ...rest }: { name: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}

/** teks maksud dengan italic/bold asal dari Excel + tanda carian */
export function Rich({ runs, hl }: { runs: Run[]; hl?: RegExp | null }) {
  return (
    <>
      {runs.map((r, n) => {
        const cls = (r.i ? 'italic ' : '') + (r.b ? 'font-semibold' : '')
        const body = hl ? <Marked text={r.t} hl={hl} /> : r.t
        return cls ? (
          <span key={n} className={cls}>
            {body}
          </span>
        ) : (
          <span key={n}>{body}</span>
        )
      })}
    </>
  )
}

export function Marked({ text, hl }: { text: string; hl?: RegExp | null }) {
  if (!hl) return <>{text}</>
  const parts = text.split(hl)
  return <>{parts.map((p, n) => (n % 2 ? <mark key={n}>{p}</mark> : p))}</>
}

export function Defs({ defs, hl }: { defs: Run[][]; hl?: RegExp | null }) {
  if (defs.length === 1) return <p><Rich runs={defs[0]} hl={hl} /></p>
  return (
    <ol className="list-decimal space-y-1 pl-5 marker:font-semibold marker:text-gold">
      {defs.map((d, n) => (
        <li key={n}>
          <Rich runs={d} hl={hl} />
        </li>
      ))}
    </ol>
  )
}

export const btn =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition duration-200 active:scale-[0.98] disabled:opacity-40'
export const btnPrimary = `${btn} btn-primary bg-brand text-on-brand hover:opacity-90`
export const btnGhost = `${btn} btn-ghost border border-line bg-card text-ink hover:border-gilt hover:bg-tint`

export function Chips<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-soft">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={`min-h-11 rounded-full border px-5 text-sm font-semibold transition duration-200 ${
              o.value === value
                ? 'border-brand bg-brand text-on-brand'
                : 'border-line bg-card text-ink hover:bg-tint'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function PageTitle({ title, sub, kicker }: { title: string; sub: string; kicker?: string }) {
  return (
    <header className="mb-8">
      {kicker && <p className="rubric rise">{kicker}</p>}
      <h1 className="rise d1 mt-3 font-serif text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="rise d2 mt-3 max-w-xl text-lg text-soft">{sub}</p>
    </header>
  )
}
