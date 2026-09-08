import { services } from '../../data/services'
import { formatPrice } from '../../lib/format'

export default function AdminServices() {
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
              <th className="px-6 py-4 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {services.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 font-medium text-ink">{s.name}</td>
                <td className="px-6 py-4 text-ink">{s.categoryLabel}</td>
                <td className="px-6 py-4 text-ink">{s.durationMin} min</td>
                <td className="px-6 py-4 text-ink">{formatPrice(s.price)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink hover:bg-ivory">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
