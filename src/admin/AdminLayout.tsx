import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Loader2, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useOturum } from '@/lib/oturum'

export default function AdminLayout() {
  const { yukleniyor, oturum, ekip, admin, benimAlim } = useOturum()
  const [bekleyen, setBekleyen] = useState(0)
  const yer = useLocation()

  useEffect(() => {
    if (!ekip) return
    supabase
      .from('kullanici_sorulari')
      .select('id', { count: 'exact', head: true })
      .eq('durum', 'bekliyor')
      .then(({ count }) => setBekleyen(count ?? 0))
  }, [ekip, yer.pathname])

  if (yukleniyor) return <Loader2 className="mx-auto mt-24 h-6 w-6 animate-spin text-stone-400" />
  if (!oturum || !ekip) return <Navigate to="/admin/giris" replace />

  const sekmeler = [
    { to: '/admin', ad: 'Hadisler', end: true },
    { to: '/admin/sorular', ad: 'Sorular', rozet: bekleyen },
    ...(admin
      ? [
          { to: '/admin/alimler', ad: 'Âlimler' },
          { to: '/admin/konular', ad: 'Konular' },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-parchment">
      <header className="pt-safe sticky top-0 z-20 border-b border-emerald-900 bg-emerald-950 text-parchment">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="" className="h-7 w-7" />
            <span className="font-serif font-bold">Âlim Paneli</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-emerald-100/70 sm:inline">{benimAlim?.ad ?? oturum.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-emerald-100/80 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" /> Çıkış
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-3">
          {sekmeler.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              end={s.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'border-gold text-white' : 'border-transparent text-emerald-100/60 hover:text-white'
                }`
              }
            >
              {s.ad}
              {!!s.rozet && (
                <span className="rounded-full bg-gold px-1.5 text-[11px] font-bold text-emerald-950">{s.rozet}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl p-5">
        <Outlet />
      </main>
    </div>
  )
}
