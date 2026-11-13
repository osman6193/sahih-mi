import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useOturum } from '@/lib/oturum'

export default function AdminGiris() {
  const { oturum, ekip, yukleniyor } = useOturum()
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [hata, setHata] = useState('')
  const [bekle, setBekle] = useState(false)

  if (!yukleniyor && oturum && ekip) return <Navigate to="/admin" replace />

  async function giris(e: React.FormEvent) {
    e.preventDefault()
    setHata('')
    setBekle(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: sifre })
    setBekle(false)
    if (error) setHata('E-posta veya şifre hatalı.')
  }

  return (
    <div className="desen flex min-h-screen items-center justify-center bg-emerald-950 p-5">
      <form onSubmit={giris} className="kart w-full max-w-sm space-y-4 p-6">
        <div className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="" className="h-10 w-10" />
          <div>
            <p className="font-serif text-xl font-bold leading-tight">Sahih mi?</p>
            <p className="text-sm text-stone-500">Âlim paneli</p>
          </div>
        </div>
        {oturum && !ekip && !yukleniyor && (
          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Bu hesaba henüz yetki verilmemiş. Yöneticiden âlim yetkisi isteyin.
            <button type="button" className="mt-2 block font-semibold underline" onClick={() => supabase.auth.signOut()}>
              Çıkış yap
            </button>
          </div>
        )}
        <div>
          <label className="etiket">E-posta</label>
          <input className="girdi" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="etiket">Şifre</label>
          <input className="girdi" type="password" autoComplete="current-password" value={sifre} onChange={(e) => setSifre(e.target.value)} required />
        </div>
        {hata && <p className="text-sm text-red-600">{hata}</p>}
        <button className="btn-ana w-full py-3" disabled={bekle}>
          {bekle ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Giriş yap
        </button>
      </form>
    </div>
  )
}
