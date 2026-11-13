import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useKonular } from '@/lib/veri'
import type { Hadis } from '@/lib/types'
import { SayfaBasligi } from '@/components/Layout'
import { HadisKarti } from '@/components/HadisKarti'

export default function KonuDetay() {
  const { slug } = useParams()
  const nav = useNavigate()
  const konular = useKonular()
  const konu = konular.find((k) => k.slug === slug)
  const [hadisler, setHadisler] = useState<Hadis[] | null>(null)

  useEffect(() => {
    if (!konu) return
    supabase
      .from('hadisler')
      .select('*')
      .eq('konu_id', konu.id)
      .eq('yayinda', true)
      .order('okunma', { ascending: false })
      .limit(100)
      .then(({ data }) => setHadisler((data as Hadis[]) ?? []))
  }, [konu])

  return (
    <div>
      <SayfaBasligi
        baslik={konu ? `${konu.ikon ?? ''} ${konu.ad}` : 'Konu'}
        geri={
          <button onClick={() => nav(-1)} className="mb-3 -ml-1 flex items-center gap-1 text-sm text-emerald-100/80">
            <ArrowLeft className="h-4 w-4" /> Geri
          </button>
        }
      />
      <div className="space-y-3 p-5">
        {hadisler === null ? (
          <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-stone-400" />
        ) : hadisler.length === 0 ? (
          <p className="kart p-6 text-center text-sm text-stone-500">Bu konuda henüz hadis yok.</p>
        ) : (
          hadisler.map((h) => <HadisKarti key={h.id} hadis={h} />)
        )}
      </div>
    </div>
  )
}
