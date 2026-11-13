// Kullanıcının gönderdiği soruların ID'leri cihazda saklanır (hesap gerekmez).
const ANAHTAR = 'sahihmi.sorularim'

export function sorularimiOku(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(ANAHTAR) || '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function soruEkle(id: string) {
  try {
    const liste = [id, ...sorularimiOku().filter((x) => x !== id)].slice(0, 50)
    localStorage.setItem(ANAHTAR, JSON.stringify(liste))
  } catch {
    /* depolama yoksa sessizce geç */
  }
}
