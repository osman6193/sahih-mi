import { toPng } from 'html-to-image'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'

export async function gorselPaylas(el: HTMLElement, metin: string) {
  const dataUrl = await toPng(el, { pixelRatio: 1, cacheBust: true, width: 1080, height: 1350 })
  const dosyaAdi = `sahih-mi-${Date.now()}.png`

  if (Capacitor.isNativePlatform()) {
    const yazilan = await Filesystem.writeFile({
      path: dosyaAdi,
      data: dataUrl.split(',')[1],
      directory: Directory.Cache,
    })
    await Share.share({ text: metin, files: [yazilan.uri], dialogTitle: 'Paylaş' })
    return
  }

  const blob = await (await fetch(dataUrl)).blob()
  const dosya = new File([blob], dosyaAdi, { type: 'image/png' })
  if (navigator.canShare?.({ files: [dosya] })) {
    await navigator.share({ files: [dosya], text: metin })
    return
  }
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = dosyaAdi
  a.click()
}

export async function metinPaylas(metin: string) {
  if (Capacitor.isNativePlatform()) {
    await Share.share({ text: metin })
  } else if (navigator.share) {
    await navigator.share({ text: metin })
  } else {
    await navigator.clipboard.writeText(metin)
    alert('Panoya kopyalandı')
  }
}
