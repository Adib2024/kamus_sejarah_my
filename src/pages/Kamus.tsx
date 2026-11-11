import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { entries, entryText, letterCount, LETTERS, type Entry } from '../lib/data'
import { highlighter, search } from '../lib/search'
import { copyText, dailyIndex, shareEntry } from '../lib/store'
import { Defs, Flourish, Icon, Marked } from '../components/ui'

export const EntryCard = memo(function EntryCard({ e, hl }: { e: Entry; hl?: RegExp | null }) {
  return (
    <article className="entry folio px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-[1.05rem] leading-snug font-bold text-brand">
          <a href={`#/istilah/${e.id}`} className="hover:underline">
            <Marked text={e.term} hl={hl} />
          </a>
        </h3>
        <div className="-mt-1.5 -mr-2 flex shrink-0 text-soft">
          <button
            type="button"
            aria-label={`Salin ${e.term}`}
            title="Salin"
            onClick={() => copyText(entryText(e))}
            className="grid size-10 place-items-center rounded-md hover:bg-tint hover:text-ink"
          >
            <Icon name="copy" className="size-[18px]" />
          </button>
          <button
            type="button"
            aria-label={`Kongsi ${e.term}`}
            title="Kongsi"
            onClick={() => shareEntry(e.term, entryText(e), e.id)}
            className="grid size-10 place-items-center rounded-md hover:bg-tint hover:text-ink"
          >
            <Icon name="share" className="size-[18px]" />
          </button>
        </div>
      </div>
      <div className="mt-1.5 leading-relaxed text-ink/90">
        <Defs defs={e.defs} hl={hl} />
      </div>
    </article>
  )
})

function Daily() {
  const e = entries[dailyIndex(entries.length)]
  return (
    <section aria-labelledby="harini" className="ornate px-7 py-8 text-center sm:px-12">
      <p id="harini" className="rubric">Istilah Hari Ini</p>
      <h2 className="mt-2 font-serif text-2xl leading-tight font-bold text-brand sm:text-3xl">
        <a href={`#/istilah/${e.id}`} className="hover:underline">
          {e.term}
        </a>
      </h2>
      <Flourish className="my-3" />
      <div className="text-lg leading-relaxed [&_ol]:inline-block [&_ol]:text-left">
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
  const chip = (active: boolean) =>
    `grid h-10 min-w-10 shrink-0 place-items-center rounded-md px-2 font-serif text-sm font-bold transition ${
      active ? 'bg-brand text-on-brand' : 'text-ink hover:bg-tint'
    }`

  return (
    <div>
      {/* carian — melekat di atas */}
      <div className="sticky top-[68px] z-20 -mx-4 border-b border-line/60 bg-paper/95 px-4 pt-4 pb-2 backdrop-blur sm:top-[76px]">
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
            className="h-13 w-full rounded-md border border-gold/60 bg-card pr-12 pl-12 text-lg shadow-sm outline-none placeholder:text-soft placeholder:italic focus:border-brand focus:ring-2 focus:ring-brand/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Kosongkan carian"
              onClick={() => {
                setQuery('')
                input.current?.focus()
              }}
              className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-md text-soft hover:bg-tint hover:text-ink"
            >
              <Icon name="x" />
            </button>
          )}
        </div>

        {!searching && (
          <nav aria-label="Tapis ikut huruf" className="no-scrollbar -mx-4 mt-2 flex gap-0.5 overflow-x-auto px-4">
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

      <p role="status" className="mt-3 mb-3 text-center text-soft italic">
        {searching
          ? result.items.length
            ? result.fuzzy
              ? `Tiada padanan tepat. Mungkin maksud anda:`
              : `${result.items.length} hasil untuk “${deferred.trim()}”`
            : ''
          : letter
            ? `${letterCount[letter]} istilah bermula dengan huruf ${letter}`
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
          <div className="rounded-md border border-dashed border-line px-6 py-14 text-center">
            <p className="font-serif text-xl font-semibold">Tiada hasil untuk “{deferred.trim()}”</p>
            <p className="mt-2 text-soft">Semak ejaan, atau cuba perkataan yang lebih pendek.</p>
          </div>
        )
      ) : (
        <div className="space-y-8">
          {!letter && (
            <>
              <div className="pt-2 text-center">
                <p lang="ms-Arab" dir="rtl" className="text-2xl text-gold">قاموس سجاره</p>
                <h1 className="font-serif text-3xl leading-tight font-bold text-brand sm:text-4xl">Kamus Sejarah</h1>
                <Flourish className="mt-3" />
              </div>
              <Daily />
            </>
          )}
          {groups.map(([l, list]) => (
            <section key={l} aria-labelledby={`huruf-${l}`}>
              <h2 id={`huruf-${l}`} className="mb-5 flex items-center gap-4" aria-label={`Huruf ${l}, ${list.length} istilah`}>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/70" />
                <span className="grid size-12 rotate-45 place-items-center border border-gold bg-brand shadow-sm ring-1 ring-gold/50 ring-offset-2 ring-offset-paper">
                  <span className="-rotate-45 font-serif text-2xl leading-none font-bold text-on-brand">{l}</span>
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
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
