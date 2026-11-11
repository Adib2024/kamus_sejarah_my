import { entries } from '../lib/data'
import { PageTitle } from '../components/ui'

export default function Tentang() {
  const card = 'folio p-5 sm:p-6'
  return (
    <div className="pt-6">
      <PageTitle title="Tentang" sub="Kamus istilah Sejarah untuk guru dan pelajar." />
      <div className="space-y-4">
        <section className={card}>
          <h2 className="font-serif text-xl font-semibold">Kamus Sejarah MY</h2>
          <p className="mt-2 leading-relaxed text-ink/90">
            Kamus ini menghimpunkan {entries.length} istilah Sejarah berserta maksud ringkasnya, berdasarkan koleksi asal{' '}
            <em>MY DIC AH (My History Dictionary)</em>. Gunakan carian untuk mencari istilah dengan pantas, dan ulang kaji
            melalui Flashcard serta Kuiz.
          </p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md bg-tint p-4">
              <dt className="rubric">Penulis</dt>
              <dd className="mt-1 font-serif text-lg font-semibold">Cg Surina</dd>
            </div>
            <div className="rounded-md bg-tint p-4">
              <dt className="rubric">Dibangunkan oleh</dt>
              <dd className="mt-1 font-serif text-lg font-semibold">Adib</dd>
            </div>
          </dl>
        </section>

        <section className={card}>
          <h2 className="font-serif text-xl font-semibold">Pasang pada peranti</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-ink/90">
            <li>
              <strong>Android (Chrome):</strong> menu ⋮ → <em>Add to Home screen</em> / <em>Install app</em>.
            </li>
            <li>
              <strong>iPhone / iPad (Safari):</strong> butang Kongsi → <em>Add to Home Screen</em>.
            </li>
            <li>
              <strong>Komputer (Chrome / Edge):</strong> ikon pasang di hujung bar alamat.
            </li>
          </ul>
          <p className="mt-3 text-sm text-soft">
            Selepas dibuka sekali, kamus ini boleh digunakan tanpa Internet.
          </p>
        </section>

        <section className={card}>
          <h2 className="font-serif text-xl font-semibold">Petua</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-ink/90">
            <li>Carian meliputi istilah dan juga maksud, serta bertolak ansur dengan salah eja kecil.</li>
            <li>Ketik nama istilah untuk membuka halamannya, kemudian kongsi pautan itu kepada rakan atau pelajar.</li>
            <li>Tukar saiz tulisan dan tema cerah/gelap melalui butang di penjuru atas.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
