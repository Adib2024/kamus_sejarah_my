import { memo } from 'react'
import { entryText, UMUM, type Entry } from '../lib/data'
import { copyText, shareEntry } from '../lib/store'
import { Defs, Icon, Marked } from './ui'

export function Badges({ e }: { e: Entry }) {
  if (e.cat === UMUM && !e.period) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {e.cat !== UMUM && <span className="badge">{e.cat}</span>}
      {e.period && <span className="badge badge-era">{e.period}</span>}
    </div>
  )
}

/** kad istilah penuh: seluruh kad membuka halaman istilah */
export const EntryCard = memo(function EntryCard({ e, hl }: { e: Entry; hl?: RegExp | null }) {
  const act = 'relative z-10 grid size-9 place-items-center rounded-full text-soft transition hover:bg-tint hover:text-ink'
  return (
    <article className="entry folio flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl leading-snug font-semibold tracking-tight text-brand">
          <a href={`#/istilah/${e.id}`} className="outline-none after:absolute after:inset-0 after:rounded-[14px] focus-visible:after:outline-2 focus-visible:after:outline-gilt">
            <Marked text={e.term} hl={hl} />
          </a>
        </h3>
        <div className="-mt-1 -mr-2 flex shrink-0">
          <button type="button" aria-label={`Salin ${e.term}`} title="Salin" onClick={() => copyText(entryText(e))} className={act}>
            <Icon name="copy" className="size-[17px]" />
          </button>
          <button type="button" aria-label={`Kongsi ${e.term}`} title="Kongsi" onClick={() => shareEntry(e.term, entryText(e), e.id)} className={act}>
            <Icon name="share" className="size-[17px]" />
          </button>
        </div>
      </div>
      <div className="mt-2 leading-relaxed text-ink/85">
        <Defs defs={e.defs} hl={hl} />
      </div>
      <div className="mt-auto pt-4 empty:hidden">
        <Badges e={e} />
      </div>
    </article>
  )
})

/** kad ringkas untuk senarai berkaitan, pilihan dan sejarah bacaan */
export function MiniCard({ e, index }: { e: Entry; index?: number }) {
  return (
    <a href={`#/istilah/${e.id}`} className="folio lift group flex h-full gap-4 p-4">
      {index !== undefined && (
        <span className="font-serif text-2xl leading-none font-semibold text-gilt tabular-nums">{String(index + 1).padStart(2, '0')}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-lg leading-snug font-semibold tracking-tight text-brand group-hover:underline">{e.term}</span>
        <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-soft">{e.defs[0].map((r) => r.t).join('')}</span>
      </span>
    </a>
  )
}
