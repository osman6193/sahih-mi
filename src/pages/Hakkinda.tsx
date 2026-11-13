import { useAlimler } from '@/lib/veri'
import { DERECELER, DERECE_SIRASI, DERECE_HEX } from '@/lib/derece'
import { SayfaBasligi } from '@/components/Layout'
import { UserRound } from 'lucide-react'

export default function Hakkinda() {
  const alimler = useAlimler().filter((a) => a.aktif)
  return (
    <div>
      <SayfaBasligi baslik="Hakkında" alt="Bu uygulama neden var?" />
      <div className="space-y-5 p-5">
        <section className="kart p-5 text-[15px] leading-relaxed text-stone-700">
          <p className="font-serif text-lg italic text-emerald-950">
            “Kim bilerek benim adıma yalan söylerse, cehennemdeki yerine hazırlansın.”
          </p>
          <p className="mt-1 text-sm text-stone-500">Buhârî, İlim; Müslim, Mukaddime</p>
          <p className="mt-4">
            Sosyal medyada Peygamberimize (s.a.v.) ait olmayan pek çok söz “hadis” diye dolaşıyor. Sahih mi?, bu
            sözlerin kaynağını ve sıhhatini ehil âlimlerin değerlendirmesiyle sade bir şekilde sunmak için hazırlandı.
          </p>
          <p className="mt-3">
            Uygulama tamamen ücretsizdir; reklam yoktur, hesap istemez, kişisel veri toplamaz. Allah rızası için.
          </p>
        </section>

        <section className="kart p-5">
          <h2 className="mb-3 font-serif text-lg font-semibold">Dereceler ne anlama geliyor?</h2>
          <div className="space-y-3">
            {DERECE_SIRASI.map((d) => (
              <div key={d} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: DERECE_HEX[d] }}
                >
                  {DERECELER[d].isaret}
                </span>
                <div>
                  <p className="font-semibold">{DERECELER[d].ad}</p>
                  <p className="text-sm text-stone-500">{DERECELER[d].aciklama}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {alimler.length > 0 && (
          <section className="kart p-5">
            <h2 className="mb-3 font-serif text-lg font-semibold">Değerlendirme heyeti</h2>
            <div className="space-y-3">
              {alimler.map((a) => (
                <div key={a.id} className="flex gap-3">
                  {a.foto_url ? (
                    <img src={a.foto_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-900/10">
                      <UserRound className="h-5 w-5 text-emerald-900" />
                    </span>
                  )}
                  <div>
                    <p className="font-semibold">
                      {a.unvan ? `${a.unvan} ` : ''}
                      {a.ad}
                    </p>
                    {a.biyografi && <p className="text-sm text-stone-500">{a.biyografi}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="px-2 text-center text-xs leading-relaxed text-stone-400">
          Değerlendirmeler, isimleri belirtilen âlimlere aittir. Hata fark ederseniz “Sor” bölümünden bildirebilirsiniz.
          <br />© ŞAH BİLİŞİM
        </p>
      </div>
    </div>
  )
}
