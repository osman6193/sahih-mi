import type { Derece } from './types'

export const DERECELER: Record<
  Derece,
  { ad: string; kisa: string; aciklama: string; renk: string; zemin: string; cizgi: string; isaret: string }
> = {
  sahih: {
    ad: 'Sahih',
    kisa: 'SAHİH',
    aciklama: 'Senedi ve metni sağlam, Peygamberimize (s.a.v.) aidiyeti güvenilir.',
    renk: 'text-sahih',
    zemin: 'bg-green-50',
    cizgi: 'border-green-200',
    isaret: '✓',
  },
  hasen: {
    ad: 'Hasen',
    kisa: 'HASEN',
    aciklama: 'Sahih derecesine yakın, delil olarak kabul edilen hadis.',
    renk: 'text-hasen',
    zemin: 'bg-sky-50',
    cizgi: 'border-sky-200',
    isaret: '✓',
  },
  zayif: {
    ad: 'Zayıf',
    kisa: 'ZAYIF',
    aciklama: 'Senedinde ya da metninde zaaf var; Peygamberimize nispeti kesin değil.',
    renk: 'text-zayif',
    zemin: 'bg-amber-50',
    cizgi: 'border-amber-200',
    isaret: '!',
  },
  uydurma: {
    ad: 'Uydurma (Mevzû)',
    kisa: 'UYDURMA',
    aciklama: 'Peygamberimize (s.a.v.) ait değil; ona nispet edilmesi caiz değildir.',
    renk: 'text-uydurma',
    zemin: 'bg-red-50',
    cizgi: 'border-red-200',
    isaret: '✕',
  },
}

export const DERECE_SIRASI: Derece[] = ['sahih', 'hasen', 'zayif', 'uydurma']

export const DERECE_HEX: Record<Derece, string> = {
  sahih: '#15803d',
  hasen: '#0369a1',
  zayif: '#b45309',
  uydurma: '#b91c1c',
}
