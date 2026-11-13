import { Search, X } from 'lucide-react'

export function AramaCubugu({
  deger,
  degisti,
  otomatikOdak = false,
}: {
  deger: string
  degisti: (v: string) => void
  otomatikOdak?: boolean
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        inputMode="search"
        autoFocus={otomatikOdak}
        value={deger}
        onChange={(e) => degisti(e.target.value)}
        placeholder="Duyduğun hadisi yaz… ör. “cennet annelerin”"
        className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-11 text-[15px] text-ink shadow-lg shadow-emerald-950/20 outline-none ring-1 ring-black/5 placeholder:text-stone-400 focus:ring-2 focus:ring-gold"
        aria-label="Hadis ara"
      />
      {deger && (
        <button
          onClick={() => degisti('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
          aria-label="Temizle"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
