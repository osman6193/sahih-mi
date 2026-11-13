import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Alim, Konu } from './types'

// Konular ve âlimler az değişir: bir kez çekip bellekte tutuyoruz.
let konuCache: Konu[] | null = null
let alimCache: Alim[] | null = null

export function cacheTemizle() {
  konuCache = null
  alimCache = null
}

export function useKonular() {
  const [konular, setKonular] = useState<Konu[]>(konuCache ?? [])
  useEffect(() => {
    if (konuCache) return
    supabase
      .from('konular')
      .select('*')
      .order('sira')
      .then(({ data }) => {
        konuCache = (data as Konu[]) ?? []
        setKonular(konuCache)
      })
  }, [])
  return konular
}

export function useAlimler() {
  const [alimler, setAlimler] = useState<Alim[]>(alimCache ?? [])
  useEffect(() => {
    if (alimCache) return
    supabase
      .from('alimler')
      .select('*')
      .order('ad')
      .then(({ data }) => {
        alimCache = (data as Alim[]) ?? []
        setAlimler(alimCache)
      })
  }, [])
  return alimler
}

export function kaynakYazi(k: { kitap: string; bolum?: string; numara?: string }) {
  return [k.kitap, k.bolum, k.numara].filter(Boolean).join(', ')
}
