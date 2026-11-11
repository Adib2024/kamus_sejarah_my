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

  const sheet = useRef<HTMLDialogElement>(null)
  const active = (letter ? 1 : 0) + (cat ? 1 : 0)
  const catLabel = (c: string) => (c === UMUM ? 'Istilah Umum' : c)
  const clear = 'inline-flex h-9 items-center gap-1.5 rounded-full bg-brand pr-2 pl-3.5 text-sm font-semibold text-on-brand'

  return (
    <div className="pt-5 lg:pt-14">
      {/* tajuk: ringkas di telefon, penuh di desktop */}
      <header>
        <div className="hidden lg:block">
          <p className="rubric rise">Rujukan</p>
        </div>
        <h1 className="rise d1 font-serif text-3xl leading-[1.05] font-semibold tracking-tight lg:mt-3 lg:text-6xl">Kamus</h1>
        <p className="rise d2 mt-3 hidden max-w-xl text-lg text-soft lg:block">Cari, tapis mengikut tema, atau semak imbas mengikut abjad.</p>
      </header>

      {/* tema (desktop) */}
      <nav aria-label="Tapis ikut tema" className="rise d3 mt-7 hidden flex-wrap gap-2 lg:flex">
        <button type="button" aria-pressed={!cat} onClick={() => setCat('')} className={pill(!cat)}>
          Semua tema
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.name} type="button" aria-pressed={cat === c.name} onClick={() => setCat(cat === c.name ? '' : c.name)} className={pill(cat === c.name)}>
            {catLabel(c.name)}
            <span className="text-xs opacity-60 tabular-nums">{c.count}</span>
          </button>
        ))}
      </nav>

      {/* carian — melekat di atas */}
      <div className="bleed sticky top-16 z-20 mt-3 border-y border-line bg-paper/92 py-3 backdrop-blur-md lg:mt-5">
        <div className="flex gap-2">
          <div className="search flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-card pr-1.5 pl-4 sm:pl-5">
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
              onKeyDown={(ev) => {
                if (ev.key === 'Escape') setQuery('')
                if (ev.key === 'Enter') ev.currentTarget.blur()
              }}
              placeholder="Cari istilah atau maksud…"
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
          {/* butang tapis (telefon dan tablet) */}
          <button
            type="button"
            onClick={() => sheet.current?.showModal()}
            aria-label={`Tapis mengikut huruf dan tema${active ? `, ${active} tapisan aktif` : ''}`}
            className={`relative grid size-12 shrink-0 place-items-center rounded-full border transition lg:hidden ${
              active ? 'border-brand bg-brand text-on-brand' : 'border-line bg-card text-ink'
            }`}
          >
            <Icon name="filter" />
            {active > 0 && (
              <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-gilt text-[0.68rem] font-bold text-[#101c2c]">{active}</span>
            )}
          </button>
        </div>
        {!searching && (
          <nav aria-label="Tapis ikut huruf" className="mt-2.5 hidden gap-0.5 lg:flex xl:justify-between">
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

      {/* tapisan aktif (telefon dan tablet): ketik untuk buang */}
      {active > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
          {letter && !searching && (
            <button type="button" onClick={() => setLetter('')} aria-label={`Buang tapisan huruf ${letter}`} className={clear}>
              Huruf {letter} <Icon name="x" className="size-4" />
            </button>
          )}
          {cat && (
            <button type="button" onClick={() => setCat('')} aria-label={`Buang tapisan tema ${catLabel(cat)}`} className={clear}>
              {catLabel(cat)} <Icon name="x" className="size-4" />
            </button>
          )}
        </div>
      )}

      {/* helaian tapisan */}
      <dialog
        ref={sheet}
        className="sheet"
        aria-labelledby="tapis-tajuk"
        onClick={(ev) => ev.target === ev.currentTarget && ev.currentTarget.close()}
      >
        <div className="px-5 pt-3 pb-5">
          <div className="mx-auto h-1.5 w-11 rounded-full bg-line" />
          <div className="mt-4 flex items-center justify-between">
            <h2 id="tapis-tajuk" className="font-serif text-2xl font-semibold tracking-tight">
              Tapis
            </h2>
            <button type="button" onClick={() => sheet.current?.close()} aria-label="Tutup" className="grid size-10 place-items-center rounded-full text-soft hover:bg-tint">
              <Icon name="x" />
            </button>
          </div>

          <p className="rubric mt-4">Huruf</p>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            <button type="button" aria-pressed={!letter} onClick={() => setLetter('')} className={`col-span-2 h-11 rounded-xl text-sm font-bold ${!letter ? 'bg-brand text-on-brand' : 'bg-card text-ink ring-1 ring-line'}`}>
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
                  if (query) setQuery('')
                }}
                className={`h-11 rounded-xl font-serif text-lg font-semibold disabled:opacity-25 ${letter === l ? 'bg-brand text-on-brand' : 'bg-card text-ink ring-1 ring-line'}`}
              >
                {l}
              </button>
            ))}
          </div>

          <p className="rubric mt-6">Tema</p>
          <div className="mt-3 grid gap-1.5">
            {[{ name: '', count: entries.length }, ...CATEGORIES].map((c) => (
              <button
                key={c.name}
                type="button"
                aria-pressed={cat === c.name}
                onClick={() => setCat(c.name)}
                className={`flex min-h-12 items-center justify-between gap-3 rounded-xl px-4 text-left text-[0.95rem] font-semibold ${
                  cat === c.name ? 'bg-brand text-on-brand' : 'bg-card text-ink ring-1 ring-line'
                }`}
              >
                {c.name ? catLabel(c.name) : 'Semua tema'}
                <span className="text-sm opacity-60 tabular-nums">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 flex gap-2 border-t border-line bg-paper px-5 py-3">
          <button
            type="button"
            disabled={!active}
            onClick={() => {
              setLetter('')
              setCat('')
            }}
            className="min-h-12 rounded-full border border-line px-5 text-sm font-bold disabled:opacity-40"
          >
            Set semula
          </button>
          <button
            type="button"
            onClick={() => {
              sheet.current?.close()
              window.scrollTo({ top: 0 })
            }}
            className="min-h-12 flex-1 rounded-full bg-brand px-5 text-sm font-bold text-on-brand"
          >
            Tunjuk {searching ? found.length : total} istilah
          </button>
        </div>
      </dialog>

      <p role="status" className="mt-4 mb-3 text-sm font-medium text-soft lg:mt-6 lg:mb-4">
        {status}
      </p>

      {searching ? (
        found.length ? (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {found.map((e) => (
              <EntryCard key={e.id} e={e} hl={hl} />
            ))}
          </div>
        ) : (
          <Empty title={`Tiada hasil untuk “${deferred.trim()}”`} sub={cat ? 'Cuba buang tapisan tema, atau semak ejaan.' : 'Semak ejaan, atau cuba perkataan yang lebih pendek.'} />
        )
      ) : total ? (
        <div className="space-y-8 lg:space-y-14">
          {groups.map(([l, list]) => (
            <section key={l} aria-labelledby={`huruf-${l}`} className="grid gap-x-10 gap-y-3 lg:grid-cols-[7rem_1fr] lg:gap-y-4">
              <h2
                id={`huruf-${l}`}
                aria-label={`Huruf ${l}, ${list.length} istilah`}
                className="bleed sticky top-[calc(8.5rem+1px)] z-10 flex items-baseline gap-3 border-b border-line bg-paper/95 py-1.5 backdrop-blur lg:static lg:top-auto lg:m-0 lg:block lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
              >
                <span className="font-serif text-3xl leading-none font-semibold text-brand lg:text-8xl">{l}</span>
                <span className="text-sm text-soft lg:mt-2 lg:block">{list.length} istilah</span>
              </h2>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
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
