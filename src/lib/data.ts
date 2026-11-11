import raw from '../data/kamus.json'

export type Run = { t: string; i?: number; b?: number }
export type Entry = {
  id: string
  term: string
  defs: Run[][]
  /** kunci carian istilah */
  k: string
  /** kunci carian maksud */
  dk: string
  letter: string
}

/** huruf kecil, tanpa tanda baca/diakritik — untuk padanan carian */
export const key = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export const plain = (runs: Run[]) => runs.map((r) => r.t).join('')

export const entries: Entry[] = (raw as { id: string; term: string; defs: Run[][] }[]).map((e) => ({
  ...e,
  k: key(e.term),
  dk: key(e.defs.map(plain).join(' ')),
  letter: /^[A-Z]/i.test(e.term) ? e.term[0].toUpperCase() : '#',
}))

export const byId = new Map(entries.map((e) => [e.id, e]))

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
export const letterCount = entries.reduce<Record<string, number>>((m, e) => {
  m[e.letter] = (m[e.letter] ?? 0) + 1
  return m
}, {})

export const entryText = (e: Entry) =>
  `${e.term}\n${e.defs.map((d, i) => (e.defs.length > 1 ? `${i + 1}. ` : '') + plain(d)).join('\n')}`
