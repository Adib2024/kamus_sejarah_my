import { entries, key, type Entry } from './data'

export type SearchResult = { items: Entry[]; tokens: string[]; fuzzy: boolean }

function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (cur[j] < best) best = cur[j]
    }
    if (best > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

export function search(query: string): SearchResult | null {
  const q = key(query)
  if (!q) return null
  const tokens = q.split(' ')
  const scored: [number, Entry][] = []

  for (const e of entries) {
    let s = 0
    if (e.k === q) s = 100
    else if (e.k.startsWith(q)) s = 90
    else if (` ${e.k}`.includes(` ${q}`)) s = 80
    else if (e.k.includes(q)) s = 70
    else if (tokens.every((t) => e.k.includes(t))) s = 60
    else if (e.dk.includes(q)) s = 45
    else if (tokens.every((t) => e.k.includes(t) || e.dk.includes(t))) s = 40
    if (s) scored.push([s, e])
  }

  let fuzzy = false
  if (!scored.length && q.length >= 3) {
    // tiada padanan tepat — cuba padanan hampir (salah eja)
    fuzzy = true
    for (const e of entries) {
      const words = e.k.split(' ')
      let total = 0
      let ok = true
      for (const t of tokens) {
        const max = t.length <= 4 ? 1 : 2
        let best = max + 1
        for (const w of words) {
          best = Math.min(best, distance(t, w, max), distance(t, w.slice(0, t.length), max))
          if (best === 0) break
        }
        if (best > max) {
          ok = false
          break
        }
        total += best
      }
      if (ok) scored.push([20 - total, e])
    }
  }

  scored.sort((a, b) => b[0] - a[0] || a[1].term.localeCompare(b[1].term))
  return { items: scored.map((x) => x[1]), tokens: fuzzy ? [] : tokens, fuzzy }
}

/** regex untuk tanda (highlight) perkataan carian dalam teks */
export function highlighter(tokens: string[]): RegExp | null {
  const use = tokens.filter((t) => t.length >= 2 || tokens.length === 1)
  if (!use.length) return null
  const sorted = [...use].sort((a, b) => b.length - a.length)
  return new RegExp(`(${sorted.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
}
