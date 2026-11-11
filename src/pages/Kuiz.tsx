import { useState } from 'react'
import { entries, type Entry } from '../lib/data'
import { shuffle, useStored } from '../lib/store'
import { btnGhost, btnPrimary, Chips, Defs, Icon, PageTitle, Rich } from '../components/ui'

type Mode = 'campur' | 'istilah' | 'maksud'
/** kind 'istilah' = diberi maksud, teka istilah; 'maksud' = diberi istilah, teka maksud */
type Question = { answer: Entry; kind: 'istilah' | 'maksud'; options: Entry[]; picked?: Entry }

function build(count: number, mode: Mode): Question[] {
  return shuffle(entries)
    .slice(0, count)
    .map((answer) => {
      const others = new Set<Entry>()
      while (others.size < 3) {
        const o = entries[Math.floor(Math.random() * entries.length)]
        if (o !== answer) others.add(o)
      }
      return {
        answer,
        kind: mode === 'campur' ? (Math.random() < 0.5 ? 'istilah' : 'maksud') : mode,
        options: shuffle([answer, ...others]),
      }
    })
}

export default function Kuiz() {
  const [count, setCount] = useStored<number>('kz-bil', 10)
  const [mode, setMode] = useStored<Mode>('kz-mod', 'campur')
  const [best, setBest] = useStored<Record<string, number>>('kz-terbaik', {})
  const [qs, setQs] = useState<Question[] | null>(null)
  const [pos, setPos] = useState(0)

  const begin = () => {
    setQs(build(count, mode))
    setPos(0)
  }

  if (!qs)
    return (
      <div className="pt-6">
        <PageTitle title="Kuiz" sub="Uji kefahaman anda. Soalan dipilih secara rawak daripada kamus." />
        <div className="space-y-6 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <Chips
            label="Bilangan soalan"
            value={count}
            onChange={setCount}
            options={[
              { value: 5, label: '5' },
              { value: 10, label: '10' },
              { value: 20, label: '20' },
            ]}
          />
          <Chips
            label="Jenis soalan"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'campur', label: 'Campuran' },
              { value: 'istilah', label: 'Teka istilah' },
              { value: 'maksud', label: 'Teka maksud' },
            ]}
          />
          <button type="button" onClick={begin} className={`${btnPrimary} w-full sm:w-auto`}>
            Mula kuiz <Icon name="right" className="size-4" />
          </button>
        </div>
      </div>
    )

  const total = qs.length
  const score = qs.filter((q) => q.picked === q.answer).length

  if (pos >= total) {
    const pct = Math.round((score / total) * 100)
    const wrong = qs.filter((q) => q.picked !== q.answer)
    const record = best[`${mode}-${total}`] ?? 0
    return (
      <div className="rise pt-6">
        <div className="rounded-2xl border border-line bg-card px-6 py-10 text-center">
          <p className="text-xs font-bold tracking-widest text-gold uppercase">Keputusan</p>
          <p className="mt-3 font-serif text-6xl font-semibold text-brand">
            {score}
            <span className="text-2xl text-soft"> / {total}</span>
          </p>
          <p className="mt-2 text-lg font-semibold">
            {pct === 100 ? 'Cemerlang!' : pct >= 80 ? 'Syabas!' : pct >= 50 ? 'Bagus, teruskan usaha.' : 'Jangan putus asa — cuba lagi.'}
          </p>
          <p className="mt-1 text-sm text-soft">Markah terbaik untuk tetapan ini: {record} / {total}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={begin} className={btnPrimary}>
              <Icon name="refresh" className="size-4" /> Cuba lagi
            </button>
            <button type="button" onClick={() => setQs(null)} className={btnGhost}>
              Tukar tetapan
            </button>
          </div>
        </div>
        {wrong.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-serif text-xl font-semibold">Semak jawapan yang salah</h2>
            <div className="space-y-2.5">
              {wrong.map((q) => (
                <article key={q.answer.id} className="rounded-2xl border border-line bg-card p-4">
                  <h3 className="font-serif text-lg font-semibold text-brand">{q.answer.term}</h3>
                  <div className="mt-1 leading-relaxed">
                    <Defs defs={q.answer.defs} />
                  </div>
                  <p className="mt-2 text-sm text-bad">
                    Jawapan anda: {q.kind === 'istilah' ? q.picked?.term : q.picked && <Rich runs={q.picked.defs[0]} />}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  const q = qs[pos]
  const answered = !!q.picked
  const pick = (o: Entry) => {
    if (answered) return
    const next = qs.map((x, n) => (n === pos ? { ...x, picked: o } : x))
    setQs(next)
    if (pos === total - 1) {
      const final = next.filter((x) => x.picked === x.answer).length
      const k = `${mode}-${total}`
      if (final > (best[k] ?? 0)) setBest({ ...best, [k]: final })
    }
  }

  return (
    <div className="pt-6">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={() => setQs(null)} aria-label="Tamatkan kuiz" className="grid size-10 place-items-center rounded-lg text-soft hover:bg-tint">
          <Icon name="x" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={pos} aria-label="Kemajuan">
          <div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${((pos + (answered ? 1 : 0)) / total) * 100}%` }} />
        </div>
        <span className="text-sm font-semibold text-soft tabular-nums">
          {pos + 1} / {total}
        </span>
      </div>

      <div key={pos} className="rise">
        <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <p className="text-xs font-bold tracking-widest text-gold uppercase">
            {q.kind === 'istilah' ? 'Apakah istilah bagi maksud ini?' : 'Apakah maksud istilah ini?'}
          </p>
          {q.kind === 'istilah' ? (
            <p className="mt-3 text-lg leading-relaxed sm:text-xl">
              <Rich runs={q.answer.defs[0]} />
            </p>
          ) : (
            <p className="mt-3 font-serif text-3xl font-semibold text-brand">{q.answer.term}</p>
          )}
        </div>

        <div className="mt-4 grid gap-2.5">
          {q.options.map((o, n) => {
            const right = answered && o === q.answer
            const wrong = answered && o === q.picked && o !== q.answer
            return (
              <button
                key={o.id}
                type="button"
                disabled={answered}
                onClick={() => pick(o)}
                className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition disabled:cursor-default ${
                  right
                    ? 'border-ok bg-ok/10'
                    : wrong
                      ? 'border-bad bg-bad/10'
                      : answered
                        ? 'border-line bg-card opacity-55'
                        : 'border-line bg-card hover:border-brand hover:bg-tint'
                }`}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    right ? 'bg-ok text-paper' : wrong ? 'bg-bad text-paper' : 'bg-tint text-brand'
                  }`}
                >
                  {right ? <Icon name="check" className="size-4" /> : wrong ? <Icon name="x" className="size-4" /> : 'ABCD'[n]}
                </span>
                <span className={q.kind === 'istilah' ? 'font-semibold' : 'leading-snug'}>
                  {q.kind === 'istilah' ? o.term : <Rich runs={o.defs[0]} />}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex min-h-13 items-center justify-between gap-4" aria-live="polite">
          {answered && (
            <>
              <p className={`font-semibold ${q.picked === q.answer ? 'text-ok' : 'text-bad'}`}>
                {q.picked === q.answer ? 'Betul!' : 'Kurang tepat.'}
              </p>
              <button type="button" autoFocus onClick={() => setPos(pos + 1)} className={btnPrimary}>
                {pos === total - 1 ? 'Lihat keputusan' : 'Seterusnya'} <Icon name="right" className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
