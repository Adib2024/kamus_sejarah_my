import { byId, entries } from '../lib/data'
import { btnGhost, Icon } from '../components/ui'
import { EntryCard } from './Kamus'

export default function Istilah({ id }: { id: string }) {
  const e = byId.get(id)
  const idx = e ? entries.indexOf(e) : -1
  const prev = entries[idx - 1]
  const next = idx >= 0 ? entries[idx + 1] : undefined

  return (
    <div className="pt-6">
      <a href="#/" className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand hover:underline">
        <Icon name="left" className="size-4" /> Kembali ke kamus
      </a>
      {e ? (
        <>
          <div className="text-lg">
            <EntryCard e={e} />
          </div>
          <nav aria-label="Istilah bersebelahan" className="mt-4 grid grid-cols-2 gap-3">
            {prev ? (
              <a href={`#/istilah/${prev.id}`} className={`${btnGhost} justify-start truncate`}>
                <Icon name="left" className="size-4 shrink-0" />
                <span className="truncate">{prev.term}</span>
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a href={`#/istilah/${next.id}`} className={`${btnGhost} justify-end truncate`}>
                <span className="truncate">{next.term}</span>
                <Icon name="right" className="size-4 shrink-0" />
              </a>
            )}
          </nav>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-line px-6 py-14 text-center text-soft">
          Istilah ini tidak ditemui.
        </p>
      )}
    </div>
  )
}
