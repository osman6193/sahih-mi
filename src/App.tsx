import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabaseHazir } from '@/lib/supabase'
import { OturumSaglayici } from '@/lib/oturum'
import { Layout } from '@/components/Layout'
import AnaSayfa from '@/pages/AnaSayfa'
import Konular from '@/pages/Konular'
import KonuDetay from '@/pages/KonuDetay'
import HadisDetay from '@/pages/HadisDetay'
import Sor from '@/pages/Sor'
import Hakkinda from '@/pages/Hakkinda'

// Panel kodu kullanıcı uygulamasına yük olmasın diye ayrı yüklenir.
const AdminGiris = lazy(() => import('@/admin/AdminGiris'))
const AdminLayout = lazy(() => import('@/admin/AdminLayout'))
const AdminHadisler = lazy(() => import('@/admin/AdminHadisler'))
const HadisFormu = lazy(() => import('@/admin/HadisFormu'))
const AdminSorular = lazy(() => import('@/admin/AdminSorular'))
const AdminAlimler = lazy(() => import('@/admin/AdminAlimler'))
const AdminKonular = lazy(() => import('@/admin/AdminKonular'))

export default function App() {
  if (!supabaseHazir) return <KurulumEksik />
  return (
    <OturumSaglayici>
      <BrowserRouter>
        <Suspense fallback={<Loader2 className="mx-auto mt-24 h-6 w-6 animate-spin text-stone-400" />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<AnaSayfa />} />
              <Route path="konular" element={<Konular />} />
              <Route path="konu/:slug" element={<KonuDetay />} />
              <Route path="hadis/:id" element={<HadisDetay />} />
              <Route path="sor" element={<Sor />} />
              <Route path="hakkinda" element={<Hakkinda />} />
            </Route>
            <Route path="admin/giris" element={<AdminGiris />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminHadisler />} />
              <Route path="hadis/:id" element={<HadisFormu />} />
              <Route path="sorular" element={<AdminSorular />} />
              <Route path="alimler" element={<AdminAlimler />} />
              <Route path="konular" element={<AdminKonular />} />
            </Route>
            <Route path="*" element={<Layout />}>
              <Route path="*" element={<AnaSayfa />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </OturumSaglayici>
  )
}

function KurulumEksik() {
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <img src="/icon.svg" alt="" className="mx-auto h-14 w-14" />
      <h1 className="mt-4 font-serif text-2xl font-bold">Supabase bağlantısı eksik</h1>
      <p className="mt-2 text-sm text-stone-600">
        Proje köküne <code>.env</code> dosyası oluşturup <code>VITE_SUPABASE_URL</code> ve{' '}
        <code>VITE_SUPABASE_ANON_KEY</code> değerlerini girin. Ayrıntılar README’de.
      </p>
    </div>
  )
}
