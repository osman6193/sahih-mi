import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Plus, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useKonular } from '@/lib/veri'
import type { Hadis } from '@/lib/types'
import { DereceRozeti } from '@/components/DereceRozeti'

type Filtre = 'hepsi' | 'yayinda' | 'taslak'

function normalize(s: string) {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/[ıi̇]/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[âà]/g, 'a')
}

export default function AdminHadisler() {
  const [hadisler, setHadisler] = useState<Hadis[] | null>(null)
  const [q, setQ] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('hepsi')
  const konular = useKonular()
  const konuMap = useMemo(() => new Map(konular.map((k) => [k.id, k])), [konular])

  useEffect(() => {
    supabase
      .from('hadisler')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1000)
      .then(({ data }) => setHadisler((data as Hadis[]) ?? []))
  }, [])

  const liste = useMemo(() => {
    const nq = normalize(q.trim())
    return (hadisler ?? []).filter(
      (h) =>
        (filtre === 'hepsi' || (filtre === 'yayinda' ? h.yayinda : !h.yayinda)) &&
        (!nq || normalize(`${h.metin} ${h.yaygin_versiyon ?? ''}`).includes(nq)),
    )
  }, [hadisler, q, filtre])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold">Hadisler</h1>
        <Link to="/admin/hadis/yeni" className="btn-ana">
          <Plus className="h-4 w-4" /> Yeni hadis
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input className="girdi pl-9" placeholder="Metinde ara…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1 rounded-xl border border-sand bg-white p-1">
          {(['hepsi', 'yayinda', 'taslak'] as Filtre[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                filtre === f ? 'bg-emerald-900 text-white' : 'text-stone-600'
              }`}
            >
              {f === 'yayinda' ? 'Yayında' : f === 'taslak' ? 'Taslak' : 'Hepsi'}
            </button>
          ))}
        </div>
      </div>

      {hadisler === null ? (
        <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-stone-400" />
      ) : liste.length === 0 ? (
        <div className="kart p-8 text-center text-stone-500">
          {hadisler.length === 0 ? 'Henüz hadis eklenmemiş. “Yeni hadis” ile başlayın.' : 'Sonuç yok.'}
        </div>
      ) : (
        <div className="kart divide-y divide-sand">
          {liste.map((h) => (
            <Link key={h.id} to={`/admin/hadis/${h.id}`} className="flex items-start gap-3 p-4 hover:bg-parchment">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <DereceRozeti derece={h.derece} />
                  {h.konu_id && <span className="text-xs text-stone-500">{konuMap.get(h.konu_id)?.ad}</span>}
                </div>
                <p className="line-clamp-2 font-serif text-[15px]">{h.yaygin_versiyon || h.metin}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-stone-400">
                {h.yayinda ? (
                  <span className="flex items-center gap-1 text-sahih">
                    <Eye className="h-3.5 w-3.5" /> Yayında
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-3.5 w-3.5" /> Taslak
                  </span>
                )}
                <span>{h.okunma} okunma</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
