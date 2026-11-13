export type Derece = 'sahih' | 'hasen' | 'zayif' | 'uydurma'
export type SoruDurum = 'bekliyor' | 'cevaplandi' | 'reddedildi'
export type Rol = 'admin' | 'alim'

export interface Kaynak {
  kitap: string
  bolum?: string
  numara?: string
}

export interface Alim {
  id: string
  user_id: string | null
  ad: string
  unvan: string | null
  biyografi: string | null
  foto_url: string | null
  aktif: boolean
  created_at: string
}

export interface Konu {
  id: string
  ad: string
  slug: string
  ikon: string | null
  sira: number
}

export interface Hadis {
  id: string
  metin: string
  yaygin_versiyon: string | null
  arapca_metin: string | null
  derece: Derece
  kaynaklar: Kaynak[]
  aciklama: string | null
  konu_id: string | null
  alim_id: string | null
  yayinda: boolean
  okunma: number
  created_at: string
  updated_at: string
}

export interface KullaniciSorusu {
  id: string
  metin: string
  nerede_gordu: string | null
  durum: SoruDurum
  hadis_id: string | null
  cevap_notu: string | null
  created_at: string
}
