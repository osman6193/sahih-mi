import { Link } from 'react-router-dom'
import { useKonular } from '@/lib/veri'
import { SayfaBasligi } from '@/components/Layout'

export default function Konular() {
  const konular = useKonular()
  return (
    <div>
      <SayfaBasligi baslik="Konular" alt="Hadisleri konusuna göre incele" />
      <div className="grid grid-cols-2 gap-3 p-5">
        {konular.map((k) => (
          <Link
            key={k.id}
            to={`/konu/${k.slug}`}
            className="kart flex flex-col gap-3 p-4 transition hover:shadow-md active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand/70 text-2xl">
              {k.ikon || '📌'}
            </span>
            <span className="font-medium leading-tight">{k.ad}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
