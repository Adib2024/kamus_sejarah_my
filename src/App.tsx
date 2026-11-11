import { useEffect, useState } from 'react'
import { go, useRoute, useStored, useToast } from './lib/store'
import { Icon } from './components/ui'
import Home from './pages/Home'
import Kamus from './pages/Kamus'
import Istilah from './pages/Istilah'
import Flashcard from './pages/Flashcard'
import Kuiz from './pages/Kuiz'
import Tentang from './pages/Tentang'
import Dasar, { DOC_LINKS, DOCS } from './pages/Dasar'

type Tema = 'sistem' | 'cerah' | 'gelap'
const TEMA: { id: Tema; icon: string; label: string }[] = [
  { id: 'sistem', icon: 'auto', label: 'Ikut peranti' },
  { id: 'cerah', icon: 'sun', label: 'Cerah' },
  { id: 'gelap', icon: 'moon', label: 'Gelap' },
]
const SAIZ = ['Biasa', 'Besar', 'Lebih besar']

const TABS = [
  { path: '', label: 'Utama', icon: 'home' },
  { path: 'kamus', label: 'Kamus', icon: 'book' },
  { path: 'flashcard', label: 'Flashcard', icon: 'cards' },
  { path: 'kuiz', label: 'Kuiz', icon: 'quiz' },
  { path: 'tentang', label: 'Tentang', icon: 'info' },
]
const KNOWN = ['', 'kamus', 'istilah', 'flashcard', 'kuiz', 'tentang']

export default function App() {
  const route = useRoute()
  const [tema, setTema] = useStored<Tema>('tema', 'sistem')
  const [saiz, setSaiz] = useStored<number>('saiz', 0)
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState('')
  const [cat, setCat] = useState('')
  const msg = useToast()

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = tema === 'gelap' || (tema === 'sistem' && mq.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#15243a' : '#101c2c')
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

  const browse = (next: { q?: string; l?: string; c?: string }) => {
    setQuery(next.q ?? '')
    setLetter(next.l ?? '')
    setCat(next.c ?? '')
    go('kamus')
    window.scrollTo(0, 0)
  }
  const openCategory = (c: string) => browse({ c })
  const openLetter = (l: string) => browse({ l })

  const section = route.split('/')[0]
  const current = section === 'istilah' ? 'kamus' : section in DOCS ? 'tentang' : section
  const t = TEMA.find((x) => x.id === tema) ?? TEMA[0]
  const nextTema = TEMA[(TEMA.indexOf(t) + 1) % TEMA.length]
  const tool = 'grid size-10 place-items-center rounded-full text-on-navy/80 transition hover:bg-white/10 hover:text-on-navy'

  return (
    <div className="flex min-h-dvh flex-col pb-20 lg:pb-0">
      <a href="#utama" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2">
        Terus ke kandungan
      </a>

      <header className="navy sticky top-0 z-40 border-b border-gilt/25">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
          <a href="#/" className="flex min-w-0 items-center gap-3">
            <img src="./favicon.svg" alt="" className="size-9 rounded-[10px]" />
            <span className="truncate font-serif text-xl font-semibold tracking-tight">
              Kamus Sejarah <span className="text-gilt">MY</span>
            </span>
          </a>

          <nav aria-label="Utama" className="ml-auto hidden items-center lg:flex">
            {TABS.map((tab) => (
              <a
                key={tab.path}
                href={`#/${tab.path}`}
                aria-current={current === tab.path ? 'page' : undefined}
                className={`navlink px-3 py-2.5 text-sm font-semibold transition ${current === tab.path ? 'text-on-navy' : 'text-on-navy/70 hover:text-on-navy'}`}
              >
                {tab.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center lg:ml-3 lg:border-l lg:border-gilt/25 lg:pl-3">
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
      </header>

      <main id="utama" key={route} className="page mx-auto w-full max-w-6xl flex-1 px-5">
        {section === '' && <Home openSearch={(q) => browse({ q })} openCategory={openCategory} openLetter={openLetter} />}
        {section === 'kamus' && <Kamus query={query} setQuery={setQuery} letter={letter} setLetter={setLetter} cat={cat} setCat={setCat} />}
        {section === 'istilah' && <Istilah id={route.slice('istilah/'.length)} openCategory={openCategory} openLetter={openLetter} />}
        {section === 'flashcard' && <Flashcard />}
        {section === 'kuiz' && <Kuiz />}
        {section === 'tentang' && <Tentang />}
        {section in DOCS && <Dasar id={section} />}
        {!KNOWN.includes(section) && !(section in DOCS) && (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl font-semibold">Halaman tidak ditemui</p>
            <a href="#/" className="mt-4 inline-block font-semibold text-gold underline underline-offset-4">
              Kembali ke halaman utama
            </a>
          </div>
        )}
      </main>

      <footer className="navy mt-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src="./favicon.svg" alt="" className="size-10 rounded-[10px]" />
              <span className="font-serif text-2xl font-semibold tracking-tight">
                Kamus Sejarah <span className="text-gilt">MY</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm leading-relaxed text-soft">Menyingkap sejarah, memahami peradaban. Rujukan istilah Sejarah untuk guru dan pelajar.</p>
          </div>
          <nav aria-label="Pautan" className="text-sm">
            <p className="rubric">Jelajah</p>
            <ul className="mt-4 space-y-2.5">
              {TABS.map((tab) => (
                <li key={tab.path}>
                  <a href={`#/${tab.path}`} className="font-semibold text-on-navy/85 transition hover:text-gilt">
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Dasar dan terma" className="text-sm">
            <p className="rubric">Dasar</p>
            <ul className="mt-4 space-y-2.5">
              {DOC_LINKS.map((d) => (
                <li key={d.path}>
                  <a href={`#/${d.path}`} className="font-semibold text-on-navy/85 transition hover:text-gilt">
                    {d.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-gilt/20">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-x-8 gap-y-2 px-5 py-5 text-sm text-soft">
            <p>© {new Date().getFullYear()} Kamus Sejarah MY. Semua hak terpelihara.</p>
            <p>
              Penulis: <span className="font-semibold text-on-navy">Cg Surina</span> · Dibangunkan oleh <span className="font-semibold text-on-navy">Adib</span>
            </p>
          </div>
        </div>
      </footer>

      {/* navigasi bawah — telefon dan tablet */}
      <nav aria-label="Utama" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {TABS.map((tab) => (
            <a
              key={tab.path}
              href={`#/${tab.path}`}
              aria-current={current === tab.path ? 'page' : undefined}
              className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[0.68rem] font-bold transition ${current === tab.path ? 'text-brand' : 'text-soft'}`}
            >
              <span className={`absolute top-0 h-0.5 w-8 rounded-full bg-gilt transition-transform duration-300 ${current === tab.path ? 'scale-x-100' : 'scale-x-0'}`} />
              <Icon name={tab.icon} />
              {tab.label}
            </a>
          ))}
        </div>
      </nav>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center lg:bottom-8">
        {msg && <div className="rise rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand shadow-lg">{msg}</div>}
      </div>
    </div>
  )
}
