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
  /** tema (dikesan daripada kata kunci dalam istilah dan maksud) */
  cat: string
  /** tahun yang disebut dalam istilah atau maksud, tertib menaik */
  years: number[]
  /** abad bagi tahun terawal yang disebut, cth. "Abad ke-19" */
  period: string
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

/* ---------- tema ----------
   Fail Excel tiada lajur kategori, jadi tema dikesan daripada kata kunci.
   Istilah yang tidak sepadan dengan mana-mana tema masuk ke "Umum". */
export const UMUM = 'Umum'
const THEMES: [string, RegExp][] = [
  ['Tamadun Awal', /\b(tamadun|mesir|mesopotamia|yunani|rom|indus|hwang|athens|sparta|firaun|polis|zaman (batu|logam|gangsa))\b/g],
  ['Tamadun Islam', /\b(islam|nabi|khalifah|khulafa|quran|masjid|hijrah|zakat|jizyah|makkah|madinah|wahyu|rasulullah|umaiyah|abbasiyah|uthmaniyah)\b/g],
  ['Kerajaan Melayu & Asia Tenggara', /\b(melaka|srivijaya|angkor|funan|majapahit|kedah tua|sultan|pembesar|bendahara|laksamana|temenggung|adat|hikayat|istana|johor|champa)\b/g],
  ['Penjajahan & Nasionalisme', /\b(british|belanda|portugis|residen|jepun|sepanyol|penjajah\w*|imperialis\w*|nasionalis\w*|malayan union|komunis|darurat|kolonial\w*|kemerdekaan|negeri selat)\b/g],
  ['Pentadbiran & Perlembagaan', /\b(perlembagaan|parlimen|persekutuan|pilihan ?raya|demokrasi|agong|kabinet|senarai|akta|undang|majlis|dewan|kehakiman|mahkamah|menteri)\b/g],
  ['Ekonomi', /\b(ekonomi|perdagangan|cukai|pertanian|industri|perindustrian|bijih|getah|modal|pasaran|pedagang|mata wang|saham|kastam|dagang\w*)\b/g],
  ['Dunia & Hubungan Antarabangsa', /\b(perang dunia|pbb|asean|komanwel|oic|nam|blok|liga bangsa|perang dingin|revolusi|antarabangsa|soviet|amerika|eropah)\b/g],
]

function themeOf(k: string, dk: string): string {
  let best = UMUM
  let score = 0
  for (const [name, re] of THEMES) {
    // padanan dalam istilah lebih berat daripada padanan dalam maksud
    const s = (k.match(re)?.length ?? 0) * 3 + (dk.match(re)?.length ?? 0)
    if (s > score) {
      score = s
      best = name
    }
  }
  return best
}

function yearsOf(text: string): number[] {
  const found = text.match(/(?<![\d.,])(1[0-9]{3}|20[0-2][0-9])(?![\d,])/g) ?? []
  return [...new Set(found.map(Number))].sort((a, b) => a - b)
}

export const entries: Entry[] = (raw as { id: string; term: string; defs: Run[][] }[]).map((e) => {
  const k = key(e.term)
  const dk = key(e.defs.map(plain).join(' '))
  const years = yearsOf(`${e.term} ${e.defs.map(plain).join(' ')}`)
  return {
    ...e,
    k,
    dk,
    letter: /^[A-Z]/i.test(e.term) ? e.term[0].toUpperCase() : '#',
    cat: themeOf(k, dk),
    years,
    period: years.length ? `Abad ke-${Math.ceil(years[0] / 100)}` : '',
  }
})

export const byId = new Map(entries.map((e) => [e.id, e]))

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
export const letterCount = entries.reduce<Record<string, number>>((m, e) => {
  m[e.letter] = (m[e.letter] ?? 0) + 1
  return m
}, {})

export const entryText = (e: Entry) =>
  `${e.term}\n${e.defs.map((d, i) => (e.defs.length > 1 ? `${i + 1}. ` : '') + plain(d)).join('\n')}`

/* ---------- tema, kaitan dan pilihan ---------- */
export const CATEGORIES: { name: string; count: number }[] = [...THEMES.map((x) => x[0]), UMUM].map((name) => ({
  name,
  count: entries.filter((e) => e.cat === name).length,
}))

const mentions = (hay: string, needle: string) => needle.length >= 4 && ` ${hay} `.includes(` ${needle} `)

/** istilah lain yang disebut dalam maksud ini, yang menyebut istilah ini, atau berkongsi kata pertama */
export function related(e: Entry, limit = 6): Entry[] {
  const first = e.k.split(' ')[0]
  const scored: [number, Entry][] = []
  for (const o of entries) {
    if (o === e) continue
    let s = 0
    if (mentions(e.dk, o.k)) s += 3
    if (mentions(o.dk, e.k)) s += 3
    if (first.length >= 4 && o.k.split(' ')[0] === first) s += 2
    if (s && o.cat === e.cat) s += 1
    if (s) scored.push([s, o])
  }
  scored.sort((a, b) => b[0] - a[0] || a[1].term.localeCompare(b[1].term))
  const out = scored.slice(0, limit).map((x) => x[1])
  // lengkapkan dengan istilah setema yang berdekatan mengikut abjad
  if (out.length < limit && e.cat !== UMUM) {
    const same = entries.filter((o) => o !== e && o.cat === e.cat && !out.includes(o))
    const at = same.findIndex((o) => o.term > e.term)
    const start = Math.max(0, (at < 0 ? same.length : at) - 2)
    out.push(...same.slice(start, start + limit - out.length))
  }
  return out
}

let _top: { e: Entry; n: number }[] | null = null
/** istilah yang paling kerap disebut dalam maksud istilah lain */
export function mostReferenced(limit = 8) {
  _top ??= entries
    .filter((e) => e.k.length >= 5)
    .map((e) => ({ e, n: entries.reduce((n, o) => n + (o !== e && mentions(o.dk, e.k) ? 1 : 0), 0) }))
    .filter((x) => x.n >= 2)
    .sort((a, b) => b.n - a.n || a.e.term.localeCompare(b.e.term))
  return _top.slice(0, limit)
}

/** pilihan harian: sama untuk semua pengguna pada tarikh yang sama */
export function dailyPicks(seed: number, count: number): Entry[] {
  const pool = entries.filter((e) => e.dk.length >= 60)
  const out: Entry[] = []
  let x = (seed * 2654435761) >>> 0
  while (out.length < count && out.length < pool.length) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0
    const pick = pool[x % pool.length]
    if (!out.includes(pick)) out.push(pick)
  }
  return out
}
