import { forwardRef } from 'react'
import { DERECELER, DERECE_HEX } from '@/lib/derece'
import type { Alim, Hadis } from '@/lib/types'
import { kaynakYazi } from '@/lib/veri'

// WhatsApp/Instagram'a gönderilecek 1080x1350 görsel. Ekranda gizli render edilir.
export const PaylasimKarti = forwardRef<HTMLDivElement, { hadis: Hadis; alim?: Alim }>(function PaylasimKarti(
  { hadis, alim },
  ref,
) {
  const d = DERECELER[hadis.derece]
  const renk = DERECE_HEX[hadis.derece]
  const metin = hadis.yaygin_versiyon || hadis.metin
  const uzun = metin.length > 220
  return (
    <div
      ref={ref}
      style={{ width: 1080, height: 1350, fontFamily: 'Inter, sans-serif' }}
      className="desen relative flex flex-col bg-parchment"
    >
      <div style={{ height: 24, background: renk }} />
      <div className="flex flex-1 flex-col px-[90px] pb-[70px] pt-[80px]">
        <div
          className="self-start rounded-full font-extrabold text-white"
          style={{ background: renk, fontSize: 52, padding: '18px 44px', letterSpacing: 2 }}
        >
          {d.isaret} {d.kisa}
        </div>
        <p className="mt-6 text-stone-500" style={{ fontSize: 30 }}>
          {d.aciklama}
        </p>

        <div className="my-auto">
          <p className="text-stone-400" style={{ fontSize: 28, marginBottom: 18 }}>
            Dolaşan söz:
          </p>
          <p
            className="font-serif text-ink"
            style={{ fontSize: uzun ? 44 : 58, lineHeight: 1.4, fontWeight: 600 }}
          >
            “{metin.length > 420 ? metin.slice(0, 420) + '…' : metin}”
          </p>
          {hadis.kaynaklar?.length > 0 && hadis.derece !== 'uydurma' && (
            <p className="mt-8 text-stone-600" style={{ fontSize: 30 }}>
              📚 {hadis.kaynaklar.slice(0, 2).map(kaynakYazi).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between border-t-2 border-sand pt-8">
          <div>
            <p className="font-serif font-bold text-emerald-950" style={{ fontSize: 46 }}>
              Sahih mi?
            </p>
            <p className="text-stone-500" style={{ fontSize: 26 }}>
              Duyduğun hadisi kontrol et
            </p>
          </div>
          {alim && (
            <p className="text-right text-stone-500" style={{ fontSize: 26 }}>
              Değerlendiren
              <br />
              <span className="font-semibold text-ink">
                {alim.unvan ? `${alim.unvan} ` : ''}
                {alim.ad}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
})
