import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { DereceRozeti } from './DereceRozeti'
import { DERECE_HEX } from '@/lib/derece'
import type { Hadis, Konu } from '@/lib/types'

export function HadisKarti({ hadis, konu }: { hadis: Hadis; konu?: Konu }) {
  const gosterilen = hadis.yaygin_versiyon || hadis.metin
  return (
    <Link
      to={`/hadis/${hadis.id}`}
      className="kart group relative flex items-start gap-3 overflow-hidden p-4 pl-5 transition hover:shadow-md active:scale-[0.99]"
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: DERECE_HEX[hadis.derece] }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <DereceRozeti derece={hadis.derece} />
          {konu && <span className="text-xs text-stone-500">{konu.ikon} {konu.ad}</span>}
        </div>
        <p className="line-clamp-3 font-serif text-[15.5px] leading-relaxed text-ink">“{gosterilen}”</p>
      </div>
      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-stone-300 transition group-hover:text-stone-500" />
    </Link>
  )
}
