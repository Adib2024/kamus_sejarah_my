import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { byId, CATEGORIES, dailyPicks, entries, LETTERS, letterCount, mostReferenced, UMUM } from '../lib/data'
import { search } from '../lib/search'
import { clearRecent, dailyIndex, go, useRecent, useReveal } from '../lib/store'
import { Badges, MiniCard } from '../components/EntryCard'
import { Defs, Icon } from '../components/ui'

function Section({ kicker, title, sub, children, action }: { kicker: string; title: string; sub?: string; children: ReactNode; action?: ReactNode }) {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} className="reveal mt-14 min-w-0 sm:mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-7">
        <div>
          <p className="rubric">{kicker}</p>
          <h2 className="mt-2.5 font-serif text-[1.7rem] leading-tight font-semibold tracking-tight sm:mt-3 sm:text-4xl">{title}</h2>
          {sub && <p className="mt-2 max-w-xl text-soft">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function HeroSearch({ onAll }: { onAll: (q: string) => void }) {
  const [q, setQ] = useState('')
  const result = useMemo(() => search(q), [q])
  const top = result?.items.slice(0, 5) ?? []
  return (
    <form
      role="search"
      className="relative"
      onSubmit={(ev) => {
        ev.preventDefault()
        if (q.trim()) onAll(q)
      }}
    >
      <div className="search flex h-14 items-center gap-3 rounded-full border border-white/15 bg-white pr-2 pl-5 text-[#292b2e] sm:h-16">
        <Icon name="search" className="size-5 shrink-0 text-[#66625a]" />
        <input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          onKeyDown={(ev) => ev.key === 'Escape' && setQ('')}
          placeholder="Cari istilah atau maksud…"
          aria-label="Cari dalam kamus"
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#66625a] sm:text-lg [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" className="grid h-10 shrink-0 place-items-center rounded-full bg-[#101c2c] px-5 text-sm font-bold text-[#f7f4ec] transition hover:bg-[#1b2d45] sm:h-12 sm:px-7">
          Cari
        </button>
      </div>
      {result && (
        <div className="rise absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[#e2d9c8] bg-[#fffdf8] text-left text-[#292b2e] shadow-2xl">
          {top.length ? (
            <>
              {top.map((e) => (
                <a key={e.id} href={`#/istilah/${e.id}`} className="block border-b border-[#e2d9c8] px-5 py-3 transition hover:bg-[#ede6d8]">
                  <span className="block font-serif text-lg leading-snug font-semibold text-[#101c2c]">{e.term}</span>
                  <span className="line-clamp-1 block text-sm text-[#66625a]">{e.defs[0].map((r) => r.t).join('')}</span>
                </a>
              ))}
              <button type="submit" className="flex w-full items-center justify-between px-5 py-3 text-sm font-bold text-[#7b6032] transition hover:bg-[#ede6d8]">
                {result.fuzzy ? 'Lihat padanan hampir' : `Lihat semua ${result.items.length} hasil`}
                <Icon name="arrow" className="size-4" />
              </button>
            </>
          ) : (
            <p className="px-5 py-4 text-sm text-[#66625a]">Tiada istilah sepadan. Semak ejaan atau cuba perkataan lain.</p>
          )}
        </div>
      )}
    </form>
  )
}

export default function Home({ openSearch, openCategory, openLetter }: { openSearch: (q: string) => void; openCategory: (c: string) => void; openLetter: (l: string) => void }) {
  const day = dailyIndex(1_000_000)
  const today = entries[dailyIndex(entries.length)]
  const picks = useMemo(() => dailyPicks(day, 5).filter((e) => e !== today).slice(0, 4), [day, today])
  const top = useMemo(() => mostReferenced(8), [])
  const recent = useRecent()
    .map((id) => byId.get(id))
    .filter((e) => !!e)
  const orn = useRef<SVGSVGElement>(null)

  // paralaks halus pada hiasan hero
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (orn.current && window.scrollY < 900) orn.current.style.transform = `translate3d(0, ${window.scrollY * 0.18}px, 0) rotate(${window.scrollY * 0.02}deg)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div>
      {/* ---------- hero ---------- */}
      <section className="navy bleed relative pt-8 pb-24 sm:pt-20 sm:pb-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <svg ref={orn} viewBox="0 0 600 600" className="absolute -top-10 -right-72 size-[34rem] text-gilt opacity-20 will-change-transform sm:-top-24 sm:-right-24 sm:size-[44rem] sm:opacity-40" fill="none" stroke="currentColor">
            <circle cx="300" cy="300" r="290" strokeWidth="1" />
            <circle cx="300" cy="300" r="230" strokeWidth="0.75" strokeDasharray="2 10" />
            <circle cx="300" cy="300" r="170" strokeWidth="1" />
            <circle cx="300" cy="300" r="100" strokeWidth="0.75" />
            <path d="M300 10v580M10 300h580M95 95l410 410M505 95 95 505" strokeWidth="0.5" />
            <path d="M300 130l24 146 146 24-146 24-24 146-24-146-146-24 146-24z" strokeWidth="1" />
          </svg>
        </div>
        <div className="relative max-w-3xl">
          <p className="rubric rise">Kamus Sejarah MY · {entries.length} istilah</p>
          <h1 className="rise d1 mt-4 font-serif text-[2.35rem] leading-[1.04] font-semibold tracking-tight sm:mt-5 sm:text-7xl">
            Menyingkap Sejarah, <em className="font-normal text-gilt">Memahami</em> Peradaban.
          </h1>
          <p className="rise d2 mt-4 max-w-xl text-base leading-relaxed text-soft sm:mt-6 sm:text-lg">
            Rujukan istilah Sejarah yang ringkas dan tepat untuk guru dan pelajar: daripada tamadun awal hingga pembinaan negara bangsa.
          </p>
          <div className="rise d3 mt-6 max-w-2xl sm:mt-9">
            <HeroSearch onAll={openSearch} />
          </div>
          <dl className="rise d4 mt-7 flex flex-wrap gap-x-8 gap-y-3 sm:mt-10 sm:gap-x-10">
            {[
              [entries.length, 'istilah'],
              [CATEGORIES.length - 1, 'tema'],
              [Object.keys(letterCount).length, 'huruf'],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-semibold text-gilt sm:text-3xl">{n}</span>
                  <span className="text-sm text-soft">{label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- istilah hari ini: bertindih dengan hero ---------- */}
      <section aria-labelledby="harini" className="rise d4 relative -mt-16 grid gap-3 sm:gap-5 lg:grid-cols-[1.35fr_1fr]">
        <a href={`#/istilah/${today.id}`} className="folio lift group block p-5 shadow-xl shadow-[#101c2c]/10 sm:p-9">
          <p id="harini" className="rubric">Istilah hari ini</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight font-semibold tracking-tight text-brand sm:text-5xl">{today.term}</h2>
          <div className="mt-3 leading-relaxed text-ink/85 sm:mt-4 sm:text-lg">
            <Defs defs={today.defs} />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Badges e={today} />
            <span className="inline-flex items-center gap-2 text-sm font-bold text-gold">
              Baca lanjut <Icon name="arrow" className="size-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </a>
        <div className="flex flex-col justify-between rounded-[14px] border border-line bg-tint p-5 sm:p-8 lg:shadow-xl lg:shadow-[#101c2c]/10">
          <div>
            <p className="rubric">Ulang kaji</p>
            <h2 className="mt-3 font-serif text-xl leading-snug font-semibold sm:mt-4 sm:text-3xl">Uji ingatan anda dengan Flashcard dan Kuiz.</h2>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
            <a href="#/flashcard" className="justify-center inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-on-brand transition hover:opacity-90">
              <Icon name="cards" className="size-4" /> Flashcard
            </a>
            <a href="#/kuiz" className="justify-center inline-flex min-h-11 items-center gap-2 rounded-full border border-gilt px-5 text-sm font-bold transition hover:bg-card">
              <Icon name="quiz" className="size-4" /> Kuiz
            </a>
          </div>
        </div>
      </section>

      {/* ---------- istilah pilihan ---------- */}
      <Section kicker="Pilihan hari ini" title="Istilah pilihan" sub="Empat istilah dipilih semula setiap hari untuk anda terokai.">
        <div className="rail gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {picks.map((e, n) => (
            <a
              key={e.id}
              href={`#/istilah/${e.id}`}
              className={`folio lift group flex flex-col p-6 ${n === 0 ? 'navy !border-gilt/40 sm:col-span-2 lg:row-span-2 sm:p-9' : n === 3 ? 'lg:col-span-2' : ''}`}
            >
              <span className="font-serif text-sm font-semibold text-gilt tabular-nums">{String(n + 1).padStart(2, '0')}</span>
              <h3 className={`mt-3 font-serif leading-tight font-semibold tracking-tight text-brand ${n === 0 ? 'text-2xl sm:text-5xl' : 'text-xl'}`}>{e.term}</h3>
              <div className={`mt-3 leading-relaxed text-ink/80 ${n === 0 ? 'line-clamp-6 sm:line-clamp-none sm:text-lg' : 'line-clamp-4 text-sm'}`}>
                <Defs defs={e.defs.slice(0, 1)} />
              </div>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-gold">
                Baca <Icon name="arrow" className="size-4 transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </Section>

      {/* ---------- tema ---------- */}
      <Section kicker="Terokai" title="Tema sejarah" sub="Istilah dikumpulkan mengikut tema berdasarkan kata kunci dalam maksudnya.">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line lg:grid-cols-4">
          {CATEGORIES.map((c, n) => (
            <button
              key={c.name}
              type="button"
              onClick={() => openCategory(c.name)}
              className="group flex min-h-28 flex-col justify-between gap-3 bg-card p-4 text-left transition duration-300 hover:bg-navy hover:text-on-navy active:bg-navy active:text-on-navy sm:min-h-36 sm:p-5"
            >
              <span className="flex items-center justify-between text-sm">
                <span className="font-serif font-semibold text-gilt tabular-nums">{String(n + 1).padStart(2, '0')}</span>
                <span className="text-xs text-soft transition group-hover:text-on-navy/70 group-active:text-on-navy/70 sm:text-sm">{c.count} istilah</span>
              </span>
              <span className="flex items-end justify-between gap-3">
                <span className="font-serif text-base leading-tight font-semibold tracking-tight sm:text-xl">{c.name === UMUM ? 'Istilah Umum' : c.name}</span>
                <Icon name="arrow" className="hidden size-5 shrink-0 text-gilt opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100 sm:block" />
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* ---------- paling kerap dirujuk + baru diteroka ---------- */}
      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section kicker="Dalam kamus ini" title="Paling kerap dirujuk" sub="Istilah yang paling banyak disebut dalam maksud istilah lain.">
          <ol className="rail gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {top.map((x, n) => (
              <li key={x.e.id}>
                <MiniCard e={x.e} index={n} />
              </li>
            ))}
          </ol>
        </Section>
        <Section
          kicker="Sejarah bacaan anda"
          title="Baru diteroka"
          sub="Disimpan pada peranti ini sahaja."
          action={
            recent.length > 0 && (
              <button type="button" onClick={clearRecent} className="text-sm font-semibold text-soft underline-offset-4 hover:text-ink hover:underline">
                Kosongkan
              </button>
            )
          }
        >
          {recent.length ? (
            <ul className="rail gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {recent.map((e) => (
                <li key={e.id}>
                  <MiniCard e={e} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[14px] border border-dashed border-line p-8 text-center">
              <Icon name="clock" className="mx-auto size-7 text-gilt" />
              <p className="mt-3 text-soft">Istilah yang anda buka akan muncul di sini untuk dirujuk semula.</p>
              <a href="#/kamus" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold">
                Mula meneroka <Icon name="arrow" className="size-4" />
              </a>
            </div>
          )}
        </Section>
      </div>

      {/* ---------- indeks A–Z ---------- */}
      <Section kicker="Indeks" title="Semak imbas A hingga Z">
        <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-9 sm:gap-2 lg:grid-cols-13">
          {LETTERS.map((l) => (
            <button
              key={l}
              type="button"
              disabled={!letterCount[l]}
              onClick={() => openLetter(l)}
              aria-label={`Huruf ${l}, ${letterCount[l] ?? 0} istilah`}
              className="folio lift group grid aspect-square place-items-center !rounded-xl disabled:opacity-30 sm:!rounded-[14px]"
            >
              <span className="text-center">
                <span className="block font-serif text-xl leading-none font-semibold text-brand sm:text-3xl">{l}</span>
                <span className="mt-1 block text-[0.65rem] font-semibold text-soft tabular-nums">{letterCount[l] ?? 0}</span>
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => go('kamus')} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-bold text-on-brand transition hover:opacity-90 sm:mt-8 sm:w-auto">
          Buka kamus penuh <Icon name="arrow" className="size-4" />
        </button>
      </Section>
    </div>
  )
}
