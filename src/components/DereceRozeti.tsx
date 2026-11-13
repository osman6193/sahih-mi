import { DERECELER } from '@/lib/derece'
import type { Derece } from '@/lib/types'

export function DereceRozeti({ derece, buyuk = false }: { derece: Derece; buyuk?: boolean }) {
  const d = DERECELER[derece]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold tracking-wide ${d.zemin} ${d.cizgi} ${d.renk} ${
        buyuk ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-0.5 text-[11px]'
      }`}
    >
      <span aria-hidden>{d.isaret}</span>
      {d.kisa}
    </span>
  )
}
