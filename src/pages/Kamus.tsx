import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, entries, letterCount, LETTERS, UMUM, type Entry } from '../lib/data'
import { highlighter, search } from '../lib/search'
import { EntryCard } from '../components/EntryCard'
import { Icon } from '../components/ui'

export default function Kamus({
  query,
  setQuery,
  letter,
  setLetter,
  cat,
  setCat,
}: {
  query: string
  setQuery: (q: string) => void
  letter: string
  setLetter: (l: string) => void
  cat: string
  setCat: (c: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const deferred = useDeferredValue(query)
  const result = useMemo(() => search(deferred), [deferred])
  const hl = useMemo(() => (result ? highlighter(result.tokens) : null), [result])
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const typing = ev.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)
      if (ev.key === '/' && !typing) {
        ev.preventDefault()
        input.current?.focus()
      }
    }
    const onScroll = () => setShowTop(window.scrollY > 900)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const searching = !!result
  const inCat = (e: Entry) => !cat || e.cat === cat
  const found = useMemo(() => (result ? result.items.filter(inCat) : []), [result, cat]) // eslint-disable-line

  const groups = useMemo(() => {
    const list = entries.filter((e) => (!letter || e.letter === letter) && inCat(e))
    const out: [string, Entry[]][] = []
    for (const e of list) {
      if (out.at(-1)?.[0] !== e.letter) out.push([e.letter, []])
      out.at(-1)![1].push(e)
    }
    return out
  }, [letter, cat]) // eslint-disable-line
  const total = groups.reduce((n, g) => n + g[1].length, 0)

  const pill = (active: boolean) =>
    `inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition duration-200 ${
      active ? 'border-brand bg-brand text-on-brand' : 'border-line bg-card text-ink hover:border-gilt'
    }`
  const az = (active: boolean) =>
    `grid h-9 min-w-9 shrink-0 place-items-center rounded-full px-2 font-serif text-base font-semibold transition duration-200 ${
      active ? 'bg-brand text-on-brand' : 'text-ink hover:bg-tint'
    }`

  const status = searching
    ? found.length
      ? result.fuzzy
        ? 'Tiada padanan tepat. Mungkin maksud anda:'
        : `${found.length} hasil untuk “${deferred.trim()}”${cat ? ` dalam ${cat}` : ''}`
      : ''
    : `${total} istilah${letter ? ` · huruf ${letter}` : ''}${cat ? ` · ${cat}` : ''}`

  return (
    <div className="pt-10 sm:pt-14">
      <header>
        <p className="rubric rise">Rujukan</p>
        <h1 className="rise d1 mt-3 font-serif text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">Kamus</h1>
        <p className="rise d2 mt-3 max-w-xl text-lg text-soft">Cari, tapis mengikut tema, atau semak imbas mengikut abjad.</p>
      </header>

      {/* tema */}
      <nav aria-label="Tapis ikut tema" className="rise d3 no-scrollbar -mx-5 mt-7 flex gap-2 overflow-x-auto px-5 pb-1 lg:flex-wrap">
        <button type="button" aria-pressed={!cat} onClick={() => setCat('')} className={pill(!cat)}>
          Semua tema
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.name} type="button" aria-pressed={cat === c.name} onClick={() => setCat(cat === c.name ? '' : c.name)} className={pill(cat === c.name)}>
            {c.name === UMUM ? 'Istilah Umum' : c.name}
            <span className="text-xs opacity-60 tabular-nums">{c.count}</span>
          </button>
        ))}
      </nav>

      {/* carian + abjad — melekat di atas */}
      <div className="bleed sticky top-16 z-20 mt-5 border-y border-line bg-paper/90 py-3 backdrop-blur-md">
        <div className="search flex h-12 items-center gap-3 rounded-full border border-line bg-card pr-1.5 pl-5">
          <Icon name="search" className="size-5 shrink-0 text-soft" />
          <input
            ref={input}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            onKeyDown={(ev) => ev.key === 'Escape' && setQuery('')}
            placeholder={`Cari ${entries.length} istilah atau maksud…`}
            aria-label="Cari istilah atau maksud"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-soft [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Kosongkan carian"
              onClick={() => {
                setQuery('')
                input.current?.focus()
              }}
              className="grid size-9 shrink-0 place-items-center rounded-full text-soft hover:bg-tint hover:text-ink"
            >
              <Icon name="x" />
            </button>
          )}
        </div>
        {!searching && (
          <nav aria-label="Tapis ikut huruf" className="no-scrollbar -mx-5 mt-2.5 flex gap-0.5 overflow-x-auto px-5 xl:justify-between">
            <button type="button" aria-pressed={!letter} onClick={() => setLetter('')} className={`${az(!letter)} !px-4 !font-sans !text-sm`}>
              Semua
            </button>
            {LETTERS.map((l) => (
              <button
                key={l}
                type="button"
                disabled={!letterCount[l]}
                aria-pressed={letter === l}
                aria-label={`Huruf ${l}, ${letterCount[l] ?? 0} istilah`}
                onClick={() => setLetter(letter === l ? '' : l)}
                className={`${az(letter === l)} disabled:opacity-25`}
              >
                {l}
              </button>
            ))}
          </nav>
        )}
      </div>

      <p role="status" className="mt-6 mb-4 text-sm font-medium text-soft">
        {status}
      </p>

      {searching ? (
        found.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {found.map((e) => (
              <EntryCard key={e.id} e={e} hl={hl} />
            ))}
          </div>
        ) : (
          <Empty title={`Tiada hasil untuk “${deferred.trim()}”`} sub={cat ? 'Cuba buang tapisan tema, atau semak ejaan.' : 'Semak ejaan, atau cuba perkataan yang lebih pendek.'} />
        )
      ) : total ? (
        <div className="space-y-14">
          {groups.map(([l, list]) => (
            <section key={l} aria-labelledby={`huruf-${l}`} className="grid gap-x-10 gap-y-4 lg:grid-cols-[7rem_1fr]">
              <h2 id={`huruf-${l}`} aria-label={`Huruf ${l}, ${list.length} istilah`} className="flex items-baseline gap-3 border-b border-line pb-2 lg:sticky lg:top-48 lg:block lg:self-start lg:border-0 lg:pb-0">
                <span className="font-serif text-6xl leading-none font-semibold text-brand lg:text-8xl">{l}</span>
                <span className="text-sm text-soft lg:mt-2 lg:block">{list.length} istilah</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {list.map((e) => (
                  <EntryCard key={e.id} e={e} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Empty title="Tiada istilah dalam tapisan ini" sub="Cuba pilih huruf atau tema yang lain." />
      )}

      {showTop && (
        <button
          type="button"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0 })}
          className="rise fixed right-4 bottom-24 z-30 grid size-12 place-items-center rounded-full bg-brand text-on-brand shadow-lg sm:right-6 sm:bottom-6"
        >
          <Icon name="up" />
        </button>
      )}
    </div>
  )
}

function Empty({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-[14px] border border-dashed border-line px-6 py-16 text-center">
      <p className="font-serif text-2xl font-semibold">{title}</p>
      <p className="mt-2 text-soft">{sub}</p>
    </div>
  )
}
