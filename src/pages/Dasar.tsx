import type { ReactNode } from 'react'
import { Icon, PageTitle } from '../components/ui'

const KEMAS_KINI = '11 November 2026'

type Doc = { title: string; sub: string; sections: { h: string; body: ReactNode }[] }

const ul = 'list-disc space-y-1.5 pl-5'

export const DOCS: Record<string, Doc> = {
  privasi: {
    title: 'Dasar Privasi',
    sub: 'Ringkasnya: Kamus Sejarah MY tidak mengumpul sebarang data peribadi anda.',
    sections: [
      {
        h: 'Maklumat yang kami kumpul',
        body: (
          <>
            <p>Tiada. Kamus Sejarah MY:</p>
            <ul className={`${ul} mt-2`}>
              <li>tidak memerlukan akaun, pendaftaran atau log masuk;</li>
              <li>tidak meminta nama, e-mel, nombor telefon atau lokasi;</li>
              <li>tidak memaparkan iklan;</li>
              <li>tidak menggunakan kuki penjejak atau perisian analitik.</li>
            </ul>
          </>
        ),
      },
      {
        h: 'Maklumat yang disimpan pada peranti anda',
        body: (
          <>
            <p>Supaya app berfungsi dengan baik, beberapa perkara disimpan dalam pelayar pada peranti anda sendiri:</p>
            <ul className={`${ul} mt-2`}>
              <li>pilihan tema (cerah atau gelap) dan saiz tulisan;</li>
              <li>tetapan Flashcard dan Kuiz, serta markah terbaik Kuiz;</li>
              <li>senarai istilah yang baru anda buka (bahagian “Baru diteroka”), yang boleh dikosongkan di halaman utama;</li>
              <li>salinan app dan data kamus, supaya ia boleh dibuka tanpa Internet.</li>
            </ul>
            <p className="mt-2">
              Maklumat ini tidak dihantar kepada kami atau kepada sesiapa. Anda boleh memadamnya pada bila-bila masa dengan
              mengosongkan data laman dalam tetapan pelayar, atau dengan menyahpasang app.
            </p>
          </>
        ),
      },
      {
        h: 'Carian, salin dan kongsi',
        body: (
          <p>
            Carian diproses sepenuhnya pada peranti anda; apa yang anda taip tidak dihantar ke mana-mana pelayan. Butang
            Salin dan Kongsi menggunakan fungsi peranti anda sendiri, dan kandungan hanya dihantar ke aplikasi yang anda
            pilih.
          </p>
        ),
      },
      {
        h: 'Pengehosan',
        body: (
          <p>
            App ini dihoskan di GitHub Pages. Seperti mana-mana laman web, penyedia hos mungkin merekodkan maklumat teknikal
            seperti alamat IP bagi tujuan keselamatan dan operasi. Rekod itu dikendalikan oleh GitHub mengikut dasar privasi
            mereka; kami tidak mempunyai akses kepadanya.
          </p>
        ),
      },
      {
        h: 'Pelajar dan kanak-kanak',
        body: (
          <p>
            App ini sesuai digunakan oleh pelajar sekolah. Oleh sebab tiada data peribadi dikumpul, tiada maklumat pelajar
            disimpan atau dikongsi oleh app ini.
          </p>
        ),
      },
      {
        h: 'Perubahan dasar',
        body: (
          <p>
            Jika cara app ini berfungsi berubah, dasar ini akan dikemas kini di halaman ini bersama tarikh kemas kini yang
            baharu.
          </p>
        ),
      },
    ],
  },
  terma: {
    title: 'Terma Penggunaan',
    sub: 'Dengan menggunakan Kamus Sejarah MY, anda bersetuju dengan terma berikut.',
    sections: [
      {
        h: 'Tujuan',
        body: (
          <p>
            Kamus Sejarah MY disediakan secara percuma untuk tujuan pendidikan, iaitu membantu guru dan pelajar merujuk serta
            mengulang kaji istilah Sejarah.
          </p>
        ),
      },
      {
        h: 'Hak cipta',
        body: (
          <p>
            Kandungan kamus (istilah dan maksud) ialah hasil kerja Cg Surina. App ini dibangunkan oleh Adib. Semua hak
            terpelihara.
          </p>
        ),
      },
      {
        h: 'Penggunaan yang dibenarkan',
        body: (
          <ul className={ul}>
            <li>Menggunakan app untuk pembelajaran dan pengajaran, di dalam atau di luar bilik darjah.</li>
            <li>Menyalin atau berkongsi istilah untuk tujuan pendidikan bukan komersial, dengan menyebut sumbernya.</li>
          </ul>
        ),
      },
      {
        h: 'Penggunaan yang tidak dibenarkan',
        body: (
          <ul className={ul}>
            <li>Menjual kandungan kamus, atau menggunakannya untuk tujuan komersial, tanpa kebenaran bertulis penulis.</li>
            <li>Menerbitkan semula keseluruhan atau sebahagian besar kandungan sebagai hasil kerja sendiri.</li>
          </ul>
        ),
      },
      {
        h: 'Tiada jaminan',
        body: (
          <p>
            App ini disediakan seadanya. Kami berusaha memastikan kandungan tepat dan app sentiasa boleh digunakan, tetapi
            tidak memberi jaminan ia bebas daripada kesilapan atau gangguan. Sila baca juga halaman{' '}
            <a href="#/penafian" className="font-semibold text-brand underline">
              Penafian
            </a>
            .
          </p>
        ),
      },
      {
        h: 'Perubahan terma',
        body: <p>Terma ini boleh dikemas kini dari semasa ke semasa. Versi terkini sentiasa dipaparkan di halaman ini.</p>,
      },
    ],
  },
  penafian: {
    title: 'Penafian',
    sub: 'Perkara yang perlu anda tahu tentang kandungan kamus ini.',
    sections: [
      {
        h: 'Nota ringkas, bukan buku teks',
        body: (
          <p>
            Maksud setiap istilah ditulis secara ringkas sebagai nota ulang kaji, dan ada yang menggunakan singkatan. Kamus
            ini bukan pengganti buku teks, dan tidak menggantikan penerangan guru anda.
          </p>
        ),
      },
      {
        h: 'Bukan terbitan rasmi',
        body: (
          <p>
            Kamus Sejarah MY ialah inisiatif persendirian dan bukan terbitan rasmi mana-mana kementerian, jabatan atau
            lembaga peperiksaan. Untuk peperiksaan, sentiasa rujuk buku teks dan sumber rasmi yang terkini.
          </p>
        ),
      },
      {
        h: 'Ketepatan kandungan',
        body: (
          <p>
            Walaupun kandungan disemak dengan teliti, kesilapan ejaan atau fakta mungkin masih ada. Jika sesuatu maksud
            berbeza daripada buku teks, ikut buku teks dan tanya guru anda.
          </p>
        ),
      },
      {
        h: 'Maklum balas',
        body: (
          <p>
            Jika anda menemui kesilapan atau mempunyai cadangan istilah baharu, sampaikan kepada guru Sejarah anda supaya
            ia boleh dimaklumkan kepada penulis. Setiap pembetulan membantu pengguna lain.
          </p>
        ),
      },
    ],
  },
}

export const DOC_LINKS = [
  { path: 'privasi', label: 'Dasar Privasi' },
  { path: 'terma', label: 'Terma Penggunaan' },
  { path: 'penafian', label: 'Penafian' },
]

export default function Dasar({ id }: { id: string }) {
  const doc = DOCS[id]
  return (
    <div className="mx-auto max-w-3xl pt-4 sm:pt-12">
      <a href="#/tentang" className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-gold hover:underline">
        <Icon name="left" className="size-4" /> Tentang
      </a>
      <PageTitle kicker="Dasar" title={doc.title} sub={doc.sub} />
      <div className="folio divide-y divide-line">
        {doc.sections.map((s, n) => (
          <section key={s.h} className="p-5 sm:p-6">
            <h2 className="flex items-baseline gap-2.5 font-serif text-2xl font-semibold tracking-tight">
              <span className="text-sm font-bold text-gold tabular-nums">{n + 1}</span>
              {s.h}
            </h2>
            <div className="mt-2 leading-relaxed text-ink/85">{s.body}</div>
          </section>
        ))}
      </div>
      <p className="mt-4 text-sm text-soft">Kemas kini terakhir: {KEMAS_KINI}</p>
    </div>
  )
}
