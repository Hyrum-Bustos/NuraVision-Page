import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { categoryLabel, serviceCategories } from '../data/seed'
import { AppImage, Button, FilterPills, Kicker } from '../components/ui'
import { formatPrice } from '../lib/format'
import type { ServiceCategoryId } from '../types'

type Filter = 'todos' | ServiceCategoryId

export default function Services() {
  const { services, setBookingDraft } = useAppState()
  const [category, setCategory] = useState<Filter>('todos')
  const navigate = useNavigate()

  // Solo se ofrecen los filtros que tienen servicios en el catálogo.
  const filters = useMemo(
    () => [
      { value: 'todos' as const, label: 'Todos' },
      ...serviceCategories
        .filter((c) => services.some((s) => s.category === c.id))
        .map((c) => ({ value: c.id, label: c.label })),
    ],
    [services],
  )

  const filtered = useMemo(
    () => (category === 'todos' ? services : services.filter((s) => s.category === category)),
    [services, category],
  )

  function handleReservar(serviceId: string) {
    setBookingDraft(() => ({ serviceId }))
    navigate('/reservar')
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Kicker>Catálogo</Kicker>
      <h1 className="mt-2 font-serif-display text-5xl text-ink">Servicios</h1>
      <p className="mt-3 max-w-xl text-base text-muted">
        Precios y duraciones referenciales. La disponibilidad se confirma al reservar.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <FilterPills options={filters} value={category} onChange={setCategory} />
        <span className="text-sm text-muted">
          {filtered.length} {filtered.length === 1 ? 'servicio' : 'servicios'}
        </span>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-line-soft bg-paper"
          >
            <Link to={`/servicios/${s.id}`}>
              <AppImage
                src={s.imageUrl}
                label={s.name.split(' ')[0].toUpperCase()}
                alt={s.name}
                className="aspect-[4/3] w-full"
              />
            </Link>
            <div className="flex flex-1 flex-col p-6">
              <Kicker>{categoryLabel(s.category)}</Kicker>
              <Link to={`/servicios/${s.id}`}>
                <h3 className="mt-1 font-serif-display text-xl text-ink hover:text-olive-700">
                  {s.name}
                </h3>
              </Link>
              <p className="mt-2 flex-1 text-sm text-muted">{s.shortDescription}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-4 text-sm text-ink">
                <span>{s.durationMin} min</span>
                <span className="font-medium">{formatPrice(s.price)}</span>
              </div>
              <div className="mt-4 flex gap-3">
                <Button onClick={() => handleReservar(s.id)} className="flex-1">
                  Reservar
                </Button>
                <Link
                  to={`/servicios/${s.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-medium text-ink hover:bg-ivory"
                >
                  Detalle
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          Todavía no hay servicios en esta categoría.
        </p>
      )}
    </div>
  )
}
