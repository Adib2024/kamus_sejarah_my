import { useCallback, useEffect, useState } from 'react'
import { entries, letterCount, LETTERS, type Entry } from '../lib/data'
import { shuffle, useStored } from '../lib/store'
import { btnGhost, btnPrimary, Chips, Defs, Icon, PageTitle } from '../components/ui'

type Session = { deck: Entry[]; pos: number; flipped: boolean; known: Entry[]; unknown: Entry[] }

const start = (deck: Entry[]): Session => ({ deck, pos: 0, flipped: false, known: [], unknown: [] })

export default function Flashcard() {
  const [size, setSize] = useStored<number>('fc-saiz', 10)
  const [letter, setLetter] = useStored<string>('fc-huruf', '')
  const [s, setS] = useState<Session | null>(null)

  const pool = letter ? entries.filter((e) => e.letter === letter) : entries
  const begin = () => setS(start(shuffle(pool).slice(0, size || pool.length)))

  const flip = useCallback(() => setS((v) => v && { ...v, flipped: !v.flipped }), [])
  const mark = useCallback(
    (ok: boolean) =>
      setS((v) => {
        if (!v || v.pos >= v.deck.length) return v
        const card = v.deck[v.pos]
        return {
          ...v,
          pos: v.pos + 1,
          flipped: false,
          known: ok ? [...v.known, card] : v.known,
          unknown: ok ? v.unknown : [...v.unknown, card],
        }
      }),
    [],
  )

  const active = !!s && s.pos < s.deck.length
  useEffect(() => {
    if (!active) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === ' ' || ev.key === 'Enter') {
        ev.preventDefault()
        flip()
      } else if (ev.key === 'ArrowRight') mark(true)
      else if (ev.key === 'ArrowLeft') mark(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, flip, mark])

  if (!s)
    return (
      <div className="mx-auto max-w-2xl pt-10 sm:pt-14">
        <PageTitle kicker="Ulang kaji" title="Flashcard" sub="Lihat istilah, cuba ingat maksudnya, kemudian ketik kad untuk semak." />
        <div className="space-y-6 folio p-5 sm:p-6">
          <Chips
            label="Bilangan kad"
            value={size}
            onChange={setSize}
            options={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 40, label: '40' },
              { value: 0, label: 'Semua' },
            ]}
          />
          <div>
            <label htmlFor="fc-huruf" className="mb-2 block text-sm font-semibold text-soft">
              Huruf
            </label>
            <select
              id="fc-huruf"
              value={letter}
              onChange={(ev) => setLetter(ev.target.value)}
              className="h-11 w-full rounded-full border border-line bg-card px-4 text-sm font-semibold sm:w-72"
            >
              <option value="">Semua huruf ({entries.length} istilah)</option>
              {LETTERS.filter((l) => letterCount[l]).map((l) => (
                <option key={l} value={l}>
                  {l} ({letterCount[l]} istilah)
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={begin} className={`${btnPrimary} w-full sm:w-auto`}>
            Mula <Icon name="right" className="size-4" />
          </button>
        </div>
      </div>
    )

  const total = s.deck.length
  if (!active)
    return (
      <div className="rise mx-auto max-w-2xl pt-10 text-center sm:pt-14">
        <div className="ornate px-6 py-12">
          <p className="rubric">Selesai</p>
          <p className="mt-3 font-serif text-5xl font-bold text-brand">
            {s.known.length}
            <span className="text-2xl text-soft"> / {total}</span>
          </p>
          <p className="mt-2 text-soft">
            {s.unknown.length
              ? `${s.unknown.length} istilah masih perlu diulang kaji.`
              : 'Hebat! Anda ingat semua istilah dalam set ini.'}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {s.unknown.length > 0 && (
              <button type="button" onClick={() => setS(start(shuffle(s.unknown)))} className={btnPrimary}>
                <Icon name="refresh" className="size-4" /> Ulang yang belum ingat ({s.unknown.length})
              </button>
            )}
            <button type="button" onClick={begin} className={s.unknown.length ? btnGhost : btnPrimary}>
              Set baharu
            </button>
            <button type="button" onClick={() => setS(null)} className={btnGhost}>
              Tukar tetapan
            </button>
          </div>
        </div>
      </div>
    )

  const card = s.deck[s.pos]
  return (
    <div className="mx-auto max-w-2xl pt-10 sm:pt-14">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={() => setS(null)} aria-label="Tamatkan sesi" className="grid size-10 place-items-center rounded-full text-soft hover:bg-tint">
          <Icon name="x" />
        </button>
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={s.pos}
          aria-label="Kemajuan"
        >
          <div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${(s.pos / total) * 100}%` }} />
        </div>
        <span className="text-sm font-semibold text-soft tabular-nums">
          {s.pos + 1} / {total}
        </span>
      </div>

      <button
        key={card.id}
        type="button"
        onClick={flip}
        aria-label={s.flipped ? 'Kad menunjukkan maksud. Ketik untuk lihat istilah.' : 'Kad menunjukkan istilah. Ketik untuk lihat maksud.'}
        className="flip rise block w-full text-left"
      >
        <div className={`flip-inner ${s.flipped ? 'is-flipped' : ''}`}>
          <div className="flip-face folio flex min-h-96 flex-col items-center justify-center !rounded-[22px] p-8 text-center shadow-xl shadow-[#101c2c]/10">
            <p className="rubric">Istilah</p>
            <p className="mt-4 font-serif text-4xl leading-tight font-semibold tracking-tight text-brand sm:text-5xl">{card.term}</p>
            <p className="mt-6 text-sm text-soft">Ketik untuk lihat maksud</p>
          </div>
          <div
            aria-hidden={!s.flipped}
            className="flip-face flip-back ornate flex min-h-96 flex-col justify-center !rounded-[22px] px-8 py-10 text-center"
          >
            <p className="rubric">{card.term}</p>
            <div className="mt-5 font-serif text-xl leading-relaxed sm:text-2xl [&_ol]:inline-block [&_ol]:text-left">
              <Defs defs={card.defs} />
            </div>
          </div>
        </div>
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => mark(false)} className={`${btnGhost} min-h-13 text-bad`}>
          <Icon name="x" className="size-4" /> Belum ingat
        </button>
        <button type="button" onClick={() => mark(true)} className={`${btnGhost} min-h-13 text-ok`}>
          <Icon name="check" className="size-4" /> Sudah ingat
        </button>
      </div>
      <p className="mt-4 hidden text-center text-xs text-soft sm:block">
        Papan kekunci: <kbd>Space</kbd> pusing kad · <kbd>←</kbd> belum ingat · <kbd>→</kbd> sudah ingat
      </p>
    </div>
  )
}
