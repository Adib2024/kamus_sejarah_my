import { useEffect, useMemo } from 'react'
import { byId, entries, entryText, related, UMUM } from '../lib/data'
import { copyText, pushRecent, shareEntry } from '../lib/store'
import { MiniCard } from '../components/EntryCard'
import { btnGhost, btnPrimary, Icon, Rich } from '../components/ui'

export default function Istilah({ id, openCategory, openLetter }: { id: string; openCategory: (c: string) => void; openLetter: (l: string) => void }) {
  const e = byId.get(id)
  const idx = e ? entries.indexOf(e) : -1
  const prev = entries[idx - 1]
  const next = idx >= 0 ? entries[idx + 1] : undefined
  const rel = useMemo(() => (e ? related(e) : []), [e])

  useEffect(() => {
    if (e) pushRecent(e.id)
  }, [e])

  if (!e)
    return (
      <div className="pt-14 text-center">
        <p className="font-serif text-3xl font-semibold">Istilah ini tidak ditemui</p>
        <a href="#/kamus" className={`${btnPrimary} mt-6`}>
          Kembali ke kamus
        </a>
      </div>
    )

  const fact = 'flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-0'
  return (
    <article className="pt-8 sm:pt-12">
      <nav aria-label="Lokasi" className="rise flex flex-wrap items-center gap-2 text-sm text-soft">
        <a href="#/kamus" className="font-semibold hover:text-ink hover:underline">
          Kamus
        </a>
        <Icon name="right" className="size-3.5" />
        <button type="button" onClick={() => openLetter(e.letter)} className="font-semibold hover:text-ink hover:underline">
          Huruf {e.letter}
        </button>
      </nav>

      <header className="mt-7 border-b border-line pb-9">
        <p className="rubric rise d1">{e.cat === UMUM ? 'Istilah Sejarah' : e.cat}</p>
        <h1 className="rise d2 mt-4 font-serif text-[2.5rem] leading-[1.03] font-semibold tracking-tight text-brand sm:text-7xl">{e.term}</h1>
        <div className="rise d3 mt-6 flex flex-wrap items-center gap-2">
          {e.period && <span className="badge badge-era">{e.period}</span>}
          {e.cat !== UMUM && <span className="badge">{e.cat}</span>}
          {e.defs.length > 1 && <span className="badge">{e.defs.length} maksud</span>}
        </div>
      </header>

      <div className="rise d4 mt-10 grid gap-x-14 gap-y-10 lg:grid-cols-[1fr_19rem]">
        {/* definisi */}
        <section aria-labelledby="definisi">
          <h2 id="definisi" className="rubric">
            Definisi
          </h2>
          {e.defs.length === 1 ? (
            <p className="mt-5 border-l-2 border-gilt pl-5 font-serif text-2xl leading-[1.5] sm:pl-7 sm:text-[1.75rem]">
              <Rich runs={e.defs[0]} />
            </p>
          ) : (
            <ol className="mt-5 space-y-6">
              {e.defs.map((d, n) => (
                <li key={n} className="grid grid-cols-[2.5rem_1fr] border-l-2 border-gilt pl-5 sm:pl-7">
                  <span className="font-serif text-2xl font-semibold text-gilt tabular-nums">{n + 1}</span>
                  <p className="font-serif text-xl leading-[1.55] sm:text-2xl">
                    <Rich runs={d} />
                  </p>
                </li>
              ))}
            </ol>
          )}

          {e.years.length > 0 && (
            <section aria-labelledby="tahun" className="mt-12">
              <h2 id="tahun" className="rubric">
                Tahun yang disebut
              </h2>
              <ol className="mt-5 flex flex-wrap gap-3">
                {e.years.map((y) => (
                  <li key={y} className="folio px-5 py-3">
                    <span className="block font-serif text-3xl leading-none font-semibold text-brand tabular-nums">{y}</span>
                    <span className="mt-1.5 block text-xs font-semibold text-soft">Abad ke-{Math.ceil(y / 100)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </section>

        {/* sepintas lalu */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="folio p-5">
            <h2 className="rubric">Sepintas lalu</h2>
            <dl className="mt-3 text-sm">
              <div className={fact}>
                <dt className="text-soft">Tema</dt>
                <dd className="text-right font-semibold">
                  <button type="button" onClick={() => openCategory(e.cat)} className="underline decoration-gilt underline-offset-4 hover:text-gold">
                    {e.cat === UMUM ? 'Istilah Umum' : e.cat}
                  </button>
                </dd>
              </div>
              {e.period && (
                <div className={fact}>
                  <dt className="text-soft">Zaman</dt>
                  <dd className="text-right font-semibold">{e.period}</dd>
                </div>
              )}
              <div className={fact}>
                <dt className="text-soft">Indeks</dt>
                <dd className="text-right font-semibold">
                  Huruf {e.letter} · {idx + 1} / {entries.length}
                </dd>
              </div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => copyText(entryText(e))} className={`${btnGhost} !px-3`}>
                <Icon name="copy" className="size-4" /> Salin
              </button>
              <button type="button" onClick={() => shareEntry(e.term, entryText(e), e.id)} className={`${btnPrimary} !px-3`}>
                <Icon name="share" className="size-4" /> Kongsi
              </button>
            </div>
          </div>
          <p className="mt-3 px-1 text-xs leading-relaxed text-soft">Tema dan zaman dikesan secara automatik daripada kata kunci dan tahun dalam maksud.</p>
        </aside>
      </div>

      {rel.length > 0 && (
        <section aria-labelledby="berkaitan" className="mt-16 border-t border-line pt-10">
          <p className="rubric">Teruskan membaca</p>
          <h2 id="berkaitan" className="mt-3 font-serif text-3xl font-semibold tracking-tight">
            Istilah berkaitan
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rel.map((r) => (
              <li key={r.id}>
                <MiniCard e={r} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Istilah bersebelahan" className="mt-12 grid grid-cols-2 gap-3 border-t border-line pt-6">
        {prev ? (
          <a href={`#/istilah/${prev.id}`} className="group min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-soft uppercase">
              <Icon name="left" className="size-3.5 transition group-hover:-translate-x-1" /> Sebelum
            </span>
            <span className="mt-1.5 block truncate font-serif text-lg font-semibold text-brand group-hover:underline">{prev.term}</span>
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={`#/istilah/${next.id}`} className="group min-w-0 text-right">
            <span className="flex items-center justify-end gap-1.5 text-xs font-bold tracking-widest text-soft uppercase">
              Seterusnya <Icon name="right" className="size-3.5 transition group-hover:translate-x-1" />
            </span>
            <span className="mt-1.5 block truncate font-serif text-lg font-semibold text-brand group-hover:underline">{next.term}</span>
          </a>
        )}
      </nav>
    </article>
  )
}
