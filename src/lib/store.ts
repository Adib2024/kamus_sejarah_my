import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

const PREFIX = 'ksm:'

export function load<T>(name: string, fallback: T): T {
  try {
    const v = localStorage.getItem(PREFIX + name)
    return v === null ? fallback : (JSON.parse(v) as T)
  } catch {
    return fallback
  }
}

export function save(name: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(value))
  } catch {
    /* storan tidak tersedia — abaikan */
  }
}

export function useStored<T>(name: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(name, fallback))
  const set = useCallback(
    (v: T) => {
      setValue(v)
      save(name, v)
    },
    [name],
  )
  return [value, set] as const
}

/* ---------- laluan (hash) ---------- */
const subscribeHash = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
export const useRoute = () =>
  useSyncExternalStore(subscribeHash, () => decodeURIComponent(location.hash.replace(/^#\/?/, '')))

/* ---------- toast ---------- */
let listener: ((msg: string) => void) | null = null
export const toast = (msg: string) => listener?.(msg)
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let timer = 0
    listener = (m) => {
      setMsg(m)
      clearTimeout(timer)
      timer = window.setTimeout(() => setMsg(null), 2200)
    }
    return () => {
      listener = null
      clearTimeout(timer)
    }
  }, [])
  return msg
}

/* ---------- utiliti ---------- */
export function shuffle<T>(list: readonly T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function copyText(text: string, done = 'Disalin') {
  try {
    await navigator.clipboard.writeText(text)
    toast(done)
  } catch {
    toast('Tidak dapat menyalin')
  }
}

export async function shareEntry(title: string, text: string, id: string) {
  const url = `${location.origin}${location.pathname}#/istilah/${id}`
  if (navigator.share) {
    try {
      await navigator.share({ title: `${title} — Kamus Sejarah MY`, text, url })
    } catch {
      /* pengguna batal */
    }
  } else {
    await copyText(`${text}\n${url}`, 'Pautan disalin')
  }
}

/** indeks istilah hari ini — sama untuk semua orang pada tarikh yang sama */
export function dailyIndex(n: number, date = new Date()) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  return (Math.imul(day, 2654435761) >>> 0) % n
}
