import { useEffect, useState } from 'react'
import { useRoute, useStored, useToast } from './lib/store'
import { Flourish, Icon } from './components/ui'
import Kamus from './pages/Kamus'
import Istilah from './pages/Istilah'
import Flashcard from './pages/Flashcard'
import Kuiz from './pages/Kuiz'
import Tentang from './pages/Tentang'

type Tema = 'sistem' | 'cerah' | 'gelap'
const TEMA: { id: Tema; icon: string; label: string }[] = [
  { id: 'sistem', icon: 'auto', label: 'Ikut peranti' },
  { id: 'cerah', icon: 'sun', label: 'Cerah' },
  { id: 'gelap', icon: 'moon', label: 'Gelap' },
]
const SAIZ = ['Biasa', 'Besar', 'Lebih besar']

const TABS = [
  { path: '', label: 'Kamus', icon: 'book' },
  { path: 'flashcard', label: 'Flashcard', icon: 'cards' },
  { path: 'kuiz', label: 'Kuiz', icon: 'quiz' },
  { path: 'tentang', label: 'Tentang', icon: 'info' },
]

export default function App() {
  const route = useRoute()
  const [tema, setTema] = useStored<Tema>('tema', 'sistem')
  const [saiz, setSaiz] = useStored<number>('saiz', 0)
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState('')
  const msg = useToast()

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = tema === 'gelap' || (tema === 'sistem' && mq.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#4a1212' : '#6a1717')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [tema])

  useEffect(() => {
    document.documentElement.dataset.fs = String(saiz)
  }, [saiz])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  const section = route.split('/')[0]
  const current = section === 'istilah' ? '' : section
  const t = TEMA.find((x) => x.id === tema) ?? TEMA[0]
  const nextTema = TEMA[(TEMA.indexOf(t) + 1) % TEMA.length]
  const tool = 'grid size-10 place-items-center rounded-md text-white/85 hover:bg-white/10 hover:text-white'

  return (
    <div className="min-h-dvh pb-24 sm:pb-10">
      <a href="#utama" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2">
        Terus ke kandungan
      </a>

      <header className="sticky top-0 z-30 bg-bar text-white shadow-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4 sm:h-16">
          <a href="#/" className="flex min-w-0 items-center gap-2.5" onClick={() => { setQuery(''); setLetter('') }}>
            <img src="./favicon.svg" alt="" className="size-9 rounded-md" />
            <span className="truncate font-serif text-2xl font-bold tracking-wide text-[#f6e3b0]">Kamus Sejarah MY</span>
          </a>

          <nav aria-label="Utama" className="ml-auto hidden items-center gap-1 sm:flex">
            {TABS.map((tab) => (
              <a
                key={tab.path}
                href={`#/${tab.path}`}
                aria-current={current === tab.path ? 'page' : undefined}
                className={`rounded-md px-3 py-1.5 font-serif text-lg font-semibold tracking-wide transition ${
                  current === tab.path ? 'bg-black/25 text-[#f6e3b0] ring-1 ring-[#b08a2e]/60' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center sm:ml-2">
            <button
              type="button"
              onClick={() => setSaiz((saiz + 1) % SAIZ.length)}
              aria-label={`Saiz tulisan: ${SAIZ[saiz]}. Ketik untuk tukar.`}
              title={`Saiz tulisan: ${SAIZ[saiz]}`}
              className={`${tool} font-serif font-semibold`}
            >
              <span aria-hidden="true">
                <span className="text-xs">A</span>
                <span className="text-lg">A</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTema(nextTema.id)}
              aria-label={`Tema: ${t.label}. Ketik untuk tukar kepada ${nextTema.label}.`}
              title={`Tema: ${t.label}`}
              className={tool}
            >
              <Icon name={t.icon} />
            </button>
          </div>
        </div>
        <div className="songket" />
      </header>

      <main id="utama" className="mx-auto max-w-3xl px-4">
        {section === '' && <Kamus query={query} setQuery={setQuery} letter={letter} setLetter={setLetter} />}
        {section === 'istilah' && <Istilah id={route.slice('istilah/'.length)} />}
        {section === 'flashcard' && <Flashcard />}
        {section === 'kuiz' && <Kuiz />}
        {section === 'tentang' && <Tentang />}
        {!['', 'istilah', 'flashcard', 'kuiz', 'tentang'].includes(section) && (
          <p className="py-16 text-center text-soft">
            Halaman tidak ditemui. <a href="#/" className="font-semibold text-brand underline">Kembali ke kamus</a>
          </p>
        )}
        <footer className="mt-14 text-center text-soft">
          <Flourish className="mb-3" />
          Penulis: <span className="font-semibold text-ink">Cg Surina</span> · Dibangunkan oleh{' '}
          <span className="font-semibold text-ink">Adib</span>
        </footer>
      </main>

      {/* navigasi bawah — telefon */}
      <nav
        aria-label="Utama"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/70 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgb(60_35_10/0.12)] backdrop-blur sm:hidden"
      >
        <div className="grid grid-cols-4">
          {TABS.map((tab) => (
            <a
              key={tab.path}
              href={`#/${tab.path}`}
              aria-current={current === tab.path ? 'page' : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-0.5 font-serif text-sm font-bold tracking-wide ${
                current === tab.path ? 'text-brand' : 'text-soft'
              }`}
            >
              <span className={`grid h-7 w-14 place-items-center rounded-full transition ${current === tab.path ? 'bg-tint' : ''}`}>
                <Icon name={tab.icon} />
              </span>
              {tab.label}
            </a>
          ))}
        </div>
      </nav>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center sm:bottom-8">
        {msg && <div className="rise rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-lg">{msg}</div>}
      </div>
    </div>
  )
}
