import { useAppState } from '../../state/AppState'
import { categoryLabel } from '../../data/seed'
import { AppImage } from '../../components/ui'
import { formatPrice } from '../../lib/format'

export default function AdminServices() {
  const { services } = useAppState()

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Servicios</h1>
      <p className="mt-2 text-sm text-muted">Catálogo actual del estudio.</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line-soft bg-paper">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line-soft bg-ivory/60 text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-4 font-medium">Servicio</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium">Duración</th>
              <th className="px-6 py-4 font-medium">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {services.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <AppImage
                      src={s.imageUrl}
                      label={s.name.slice(0, 1)}
                      alt={s.name}
                      className="h-10 w-10 shrink-0 rounded-lg"
                    />
                    <span className="font-medium text-ink">{s.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-ink">{categoryLabel(s.category)}</td>
                <td className="px-6 py-4 text-ink">{s.durationMin} min</td>
                <td className="px-6 py-4 text-ink">{formatPrice(s.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
