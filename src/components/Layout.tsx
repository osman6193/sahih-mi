import { NavLink, Outlet } from 'react-router-dom'
import { Home, LayoutGrid, MessageCircleQuestion, Info } from 'lucide-react'

const SEKMELER = [
  { to: '/', ad: 'Ara', ikon: Home, end: true },
  { to: '/konular', ad: 'Konular', ikon: LayoutGrid, end: false },
  { to: '/sor', ad: 'Sor', ikon: MessageCircleQuestion, end: false },
  { to: '/hakkinda', ad: 'Hakkında', ikon: Info, end: false },
]

export function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-parchment/95 backdrop-blur">
        <div className="mx-auto grid max-w-xl grid-cols-4">
          {SEKMELER.map(({ to, ad, ikon: Ikon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                  isActive ? 'text-emerald-900' : 'text-stone-400 hover:text-stone-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`rounded-full px-4 py-1 transition ${isActive ? 'bg-emerald-900/10' : ''}`}>
                    <Ikon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  {ad}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export function SayfaBasligi({ baslik, alt, geri }: { baslik: string; alt?: string; geri?: React.ReactNode }) {
  return (
    <header className="pt-safe desen bg-emerald-950 text-parchment">
      <div className="px-5 pb-6 pt-5">
        {geri}
        <h1 className="font-serif text-2xl font-bold">{baslik}</h1>
        {alt && <p className="mt-1 text-sm text-emerald-100/70">{alt}</p>}
      </div>
    </header>
  )
}
