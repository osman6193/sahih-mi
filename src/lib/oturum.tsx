import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Alim, Rol } from './types'

interface OturumDurumu {
  yukleniyor: boolean
  oturum: Session | null
  roller: Rol[]
  benimAlim: Alim | null
  admin: boolean
  ekip: boolean
}

const Ctx = createContext<OturumDurumu>({
  yukleniyor: true,
  oturum: null,
  roller: [],
  benimAlim: null,
  admin: false,
  ekip: false,
})

export function OturumSaglayici({ children }: { children: React.ReactNode }) {
  const [durum, setDurum] = useState<OturumDurumu>({
    yukleniyor: true,
    oturum: null,
    roller: [],
    benimAlim: null,
    admin: false,
    ekip: false,
  })

  useEffect(() => {
    async function yukle(oturum: Session | null) {
      if (!oturum) {
        setDurum({ yukleniyor: false, oturum: null, roller: [], benimAlim: null, admin: false, ekip: false })
        return
      }
      const uid = oturum.user.id
      const [{ data: r }, { data: a }] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', uid),
        supabase.from('alimler').select('*').eq('user_id', uid).maybeSingle(),
      ])
      const roller = ((r as { role: Rol }[]) ?? []).map((x) => x.role)
      setDurum({
        yukleniyor: false,
        oturum,
        roller,
        benimAlim: (a as Alim) ?? null,
        admin: roller.includes('admin'),
        ekip: roller.length > 0,
      })
    }
    supabase.auth.getSession().then(({ data }) => yukle(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => yukle(s), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return <Ctx.Provider value={durum}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOturum = () => useContext(Ctx)
