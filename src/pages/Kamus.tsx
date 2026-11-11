import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { entries, entryText, letterCount, LETTERS, type Entry } from '../lib/data'
import { highlighter, search } from '../lib/search'
import { copyText, dailyIndex, shareEntry } from '../lib/store'
import { Defs, Icon, Marked } from '../components/ui'

export const EntryCard = memo(function EntryCard({ e, hl }: { e: Entry; hl?: RegExp | null }) {
  const act = 'grid size-9 place-items-center rounded-lg hover:bg-tint hover:text-ink'
  return (
    <article className="entry folio flex gap-3 p-3.5 sm:gap-4 sm:p-4">
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-tint font-serif text-lg font-bold text-brand">
        {e.letter}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="pt-1.5 leading-snug font-extrabold tracking-tight">
            <a href={`#/istilah/${e.id}`} className="hover:underline">
              <Marked text={e.term} hl={hl} />
            </a>
          </h3>
          <div className="-mr-1.5 flex shrink-0 text-soft">
            <button type="button" aria-label={`Salin ${e.term}`} title="Salin" onClick={() => copyText(entryText(e))} className={act}>
              <Icon name="copy" className="size-[17px]" />
            </button>
            <button type="button" aria-label={`Kongsi ${e.term}`} title="Kongsi" onClick={() => shareEntry(e.term, entryText(e), e.id)} className={act}>
              <Icon name="share" className="size-[17px]" />
            </button>
          </div>
        </div>
        <div className="mt-0.5 leading-relaxed text-ink/85">
          <Defs defs={e.defs} hl={hl} />
        </div>
      </div>
    </article>
  )
})

function Daily() {
  const e = entries[dailyIndex(entries.length)]
  return (
    <section aria-labelledby="harini" className="ornate p-5 sm:p-6">
      <p id="harini" className="rubric">★ Istilah Hari Ini</p>
      <h2 className="mt-3 font-serif text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
        <a href={`#/istilah/${e.id}`} className="hover:underline">
          {e.term}
        </a>
      </h2>
      <div className="mt-2 leading-relaxed text-ink/85">
        <Defs defs={e.defs} />
      </div>
    </section>
  )
}

export default function Kamus({
  query,
  setQuery,
  letter,
  setLetter,
}: {
  query: string
  setQuery: (q: string) => void
  letter: string
  setLetter: (l: string) => void
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

  const groups = useMemo(() => {
    const list = letter ? entries.filter((e) => e.letter === letter) : entries
    const out: [string, Entry[]][] = []
    for (const e of list) {
      if (out.at(-1)?.[0] !== e.letter) out.push([e.letter, []])
      out.at(-1)![1].push(e)
    }
    return out
  }, [letter])

  const searching = !!result
  const home = !searching && !letter
  const chip = (active: boolean) =>
    `grid h-9 min-w-9 shrink-0 place-items-center rounded-lg px-2.5 text-sm font-bold transition ${
      active ? 'bg-chip text-on-chip' : 'opacity-80 hover:bg-white/10 hover:opacity-100'
    }`

  return (
    <div>
      {home && (
        <div className="bar bleed pt-4 pb-1">
          <h1 className="font-serif text-4xl leading-none font-bold tracking-tight sm:text-5xl">Kamus Sejarah</h1>
          <p className="mt-2 text-sm opacity-80">{entries.length} istilah untuk guru &amp; pelajar · oleh Cg Surina</p>
        </div>
      )}
      {/* carian — melekat di atas */}
      <div className="bar bleed sticky top-14 z-20 rounded-b-3xl pt-3 pb-3 shadow-sm sm:top-16 dark:border-b dark:border-line">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-soft" />
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
            className="h-12 w-full rounded-xl border border-transparent bg-card pr-12 pl-12 text-base text-ink outline-none placeholder:text-soft focus:ring-2 focus:ring-chip/70 dark:border-line dark:bg-tint [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Kosongkan carian"
              onClick={() => {
                setQuery('')
                input.current?.focus()
              }}
              className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-soft hover:bg-tint hover:text-ink"
            >
              <Icon name="x" />
            </button>
          )}
        </div>

        {!searching && (
          <nav aria-label="Tapis ikut huruf" className="no-scrollbar -mx-4 mt-2.5 flex gap-1 overflow-x-auto px-4">
            <button type="button" aria-pressed={!letter} onClick={() => setLetter('')} className={chip(!letter)}>
              Semua
            </button>
            {LETTERS.map((l) => (
              <button
                key={l}
                type="button"
                disabled={!letterCount[l]}
                aria-pressed={letter === l}
                aria-label={`Huruf ${l}, ${letterCount[l] ?? 0} istilah`}
                onClick={() => {
                  setLetter(letter === l ? '' : l)
                  window.scrollTo({ top: 0 })
                }}
                className={`${chip(letter === l)} disabled:opacity-25`}
              >
                {l}
              </button>
            ))}
          </nav>
        )}
      </div>

      <p role="status" className="mt-4 mb-3 text-sm text-soft empty:mb-5">
        {searching
          ? result.items.length
            ? result.fuzzy
              ? `Tiada padanan tepat. Mungkin maksud anda:`
              : `${result.items.length} hasil untuk “${deferred.trim()}”`
            : ''
          : ''}
      </p>

      {searching ? (
        result.items.length ? (
          <div className="space-y-2.5">
            {result.items.map((e) => (
              <EntryCard key={e.id} e={e} hl={hl} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
            <p className="font-serif text-xl font-semibold">Tiada hasil untuk “{deferred.trim()}”</p>
            <p className="mt-2 text-soft">Semak ejaan, atau cuba perkataan yang lebih pendek.</p>
          </div>
        )
      ) : (
        <div className="space-y-7">
          {!letter && <Daily />}
          {groups.map(([l, list]) => (
            <section key={l} aria-labelledby={`huruf-${l}`}>
              <h2 id={`huruf-${l}`} className="mb-3 flex items-baseline gap-3" aria-label={`Huruf ${l}, ${list.length} istilah`}>
                <span className="font-serif text-4xl leading-none font-bold text-brand">{l}</span>
                <span className="text-sm text-soft">{list.length} istilah</span>
                <span className="h-px flex-1 self-center bg-line" />
              </h2>
              <div className="space-y-2.5">
                {list.map((e) => (
                  <EntryCard key={e.id} e={e} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {showTop && (
        <button
          type="button"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0 })}
          className="rise fixed right-4 bottom-20 z-30 grid size-12 place-items-center rounded-full bg-brand text-on-brand shadow-lg sm:right-6 sm:bottom-6"
        >
          <Icon name="up" />
        </button>
      )}
    </div>
  )
}
