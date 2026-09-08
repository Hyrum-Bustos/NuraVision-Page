import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAppState } from '../../state/AppState'
import { useToast } from '../../state/Toast'
import { createDefaultAvailability } from '../../data/seed'
import { ConfirmDialog, Modal } from '../../components/Modal'
import { ImageUploader } from '../../components/ImageUploader'
import { AvailabilityEditor } from '../../components/AvailabilityEditor'
import { ChipMultiSelect, NumberField, TextAreaField, TextField } from '../../components/form'
import { AppImage, Button, Card, Kicker } from '../../components/ui'
import { formatPrice } from '../../lib/format'
import type { Professional, Service } from '../../types'

type Draft = Omit<Professional, 'id'>

function emptyDraft(): Draft {
  return {
    name: '',
    role: '',
    experienceYears: 1,
    bio: '',
    specialistBadge: '',
    serviceIds: [],
    availability: createDefaultAvailability(),
  }
}

export default function AdminProfessionals() {
  const {
    professionals,
    services,
    bookings,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    updateService,
  } = useAppState()
  const { toast } = useToast()

  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null)
  const [deleting, setDeleting] = useState<Professional | null>(null)

  function openEdit(professional: Professional) {
    const { id: _id, ...draft } = professional
    setEditing({ id: professional.id, draft })
  }

  function handleSave(draft: Draft, prices: Record<string, number>, id?: string) {
    const clean: Draft = {
      ...draft,
      name: draft.name.trim(),
      role: draft.role.trim(),
      specialistBadge: draft.specialistBadge?.trim() || undefined,
    }

    // Los precios se editan desde aquí por comodidad, pero pertenecen al catálogo.
    for (const [serviceId, price] of Object.entries(prices)) {
      const service = services.find((s) => s.id === serviceId)
      if (service && service.price !== price) updateService(serviceId, { price })
    }

    if (id) {
      updateProfessional(id, clean)
      toast({ title: 'Profesional actualizado', description: clean.name })
    } else {
      addProfessional(clean)
      toast({ title: 'Profesional agregado', description: clean.name })
    }
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-4xl text-ink">Profesionales</h1>
          <p className="mt-2 text-sm text-muted">
            Equipo del estudio: ficha pública, servicios que realiza y horario de atención.
          </p>
        </div>
        <Button onClick={() => setEditing({ draft: emptyDraft() })}>
          <Plus className="h-4 w-4" />
          Nuevo profesional
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {professionals.map((p) => {
          const activeBookings = bookings.filter(
            (b) => b.professionalId === p.id && b.status !== 'cancelada',
          ).length
          const workdays = Object.values(p.availability).filter((d) => d.enabled).length

          return (
            <Card key={p.id} className="flex flex-col gap-4 p-5">
              <div className="flex gap-4">
                <AppImage
                  src={p.imageUrl}
                  label="Retrato"
                  alt={p.name}
                  className="aspect-[3/4] w-24 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif-display text-xl text-ink">{p.name}</p>
                  <p className="text-sm text-muted">{p.role}</p>
                  <p className="mt-2 line-clamp-3 text-xs text-muted-light">{p.bio}</p>
                  <p className="mt-2 text-xs text-muted">
                    {p.serviceIds.length}{' '}
                    {p.serviceIds.length === 1 ? 'servicio' : 'servicios'} · {workdays}{' '}
                    {workdays === 1 ? 'día' : 'días'} de atención · {activeBookings}{' '}
                    {activeBookings === 1 ? 'reserva' : 'reservas'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(p)}
                  aria-label={`Editar ${p.name}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors hover:bg-ivory"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => setDeleting(p)}
                  aria-label={`Eliminar ${p.name}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {professionals.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          Todavía no hay profesionales. Agrega el primero con “Nuevo profesional”.
        </p>
      )}

      {editing && (
        <ProfessionalFormModal
          initial={editing.draft}
          isNew={!editing.id}
          services={services}
          onCancel={() => setEditing(null)}
          onSave={(draft, prices) => handleSave(draft, prices, editing.id)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          open
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            deleteProfessional(deleting.id)
            toast({ title: 'Profesional eliminado', description: deleting.name, tone: 'info' })
          }}
          title={`Eliminar a ${deleting.name}`}
          confirmLabel="Eliminar profesional"
          description={
            <div className="space-y-3">
              <p>
                Dejará de aparecer en el sitio y sus horas ya no se ofrecerán a los clientes.
              </p>
              {(() => {
                const active = bookings.filter(
                  (b) =>
                    b.professionalId === deleting.id &&
                    b.status !== 'cancelada' &&
                    b.status !== 'completada',
                ).length
                return active > 0 ? (
                  <p className="rounded-lg bg-danger-soft px-4 py-3 text-danger">
                    Tiene {active} {active === 1 ? 'reserva activa' : 'reservas activas'}. Se
                    conservan en el historial, pero deberás reasignarlas.
                  </p>
                ) : null
              })()}
            </div>
          }
        />
      )}
    </div>
  )
}

function ProfessionalFormModal({
  initial,
  isNew,
  services,
  onCancel,
  onSave,
}: {
  initial: Draft
  isNew: boolean
  services: Service[]
  onCancel: () => void
  onSave: (draft: Draft, prices: Record<string, number>) => void
}) {
  const [draft, setDraft] = useState<Draft>(initial)
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(services.map((s) => [s.id, s.price])),
  )
  const [showErrors, setShowErrors] = useState(false)

  const errors = useMemo(() => {
    const next: Partial<Record<keyof Draft, string>> = {}
    if (!draft.name.trim()) next.name = 'El nombre es obligatorio.'
    if (!draft.role.trim()) next.role = 'Indica la especialidad (por ejemplo, “Nail artist”).'
    if (draft.experienceYears < 0) next.experienceYears = 'No puede ser negativo.'
    return next
  }, [draft])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const selectedServices = services.filter((s) => draft.serviceIds.includes(s.id))

  return (
    <Modal
      open
      onClose={onCancel}
      size="lg"
      title={isNew ? 'Nuevo profesional' : `Editar a ${initial.name}`}
      description="Ficha pública, servicios y horario de atención."
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (Object.keys(errors).length > 0) {
                setShowErrors(true)
                return
              }
              onSave(draft, prices)
            }}
          >
            {isNew ? 'Agregar profesional' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
          <ImageUploader
            label="Fotografía"
            value={draft.imageUrl}
            onChange={(imageUrl) => set('imageUrl', imageUrl)}
            aspectClass="aspect-[3/4]"
            placeholderLabel="Retrato"
          />
          <div className="space-y-5">
            <TextField
              label="Nombre"
              value={draft.name}
              onChange={(v) => set('name', v)}
              placeholder="Camila Reyes"
              error={showErrors ? errors.name : undefined}
            />
            <TextField
              label="Especialización"
              value={draft.role}
              onChange={(v) => set('role', v)}
              placeholder="Nail artist"
              error={showErrors ? errors.role : undefined}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label="Años de experiencia"
                value={draft.experienceYears}
                onChange={(v) => set('experienceYears', v)}
                min={0}
                suffix="años"
                error={showErrors ? errors.experienceYears : undefined}
              />
              <TextField
                label="Etiqueta destacada"
                value={draft.specialistBadge ?? ''}
                onChange={(v) => set('specialistBadge', v)}
                placeholder="Especialista"
                hint="Opcional. Se muestra junto al nombre."
              />
            </div>
          </div>
        </div>

        <TextAreaField
          label="Reseña"
          value={draft.bio}
          onChange={(v) => set('bio', v)}
          rows={4}
          hint="Breve descripción visible en el sitio público."
        />

        <div className="space-y-4 border-t border-line-soft pt-5">
          <ChipMultiSelect
            label="Servicios que realiza"
            options={services.map((s) => ({
              value: s.id,
              label: s.name,
              description: `${s.durationMin} min`,
            }))}
            selected={draft.serviceIds}
            onChange={(v) => set('serviceIds', v)}
            emptyLabel="Primero crea servicios en la sección Servicios."
          />

          {selectedServices.length > 0 && (
            <div className="rounded-xl border border-line-soft bg-ivory/60 p-4">
              <Kicker>Valor de cada servicio</Kicker>
              <p className="mt-1 text-xs text-muted-light">
                El precio pertenece al catálogo: al cambiarlo aquí se actualiza en todo el estudio.
              </p>
              <div className="mt-3 space-y-2">
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{s.name}</p>
                      <p className="text-xs text-muted">
                        {s.durationMin} min · actual {formatPrice(s.price)}
                      </p>
                    </div>
                    <div className="relative w-40 shrink-0">
                      <input
                        type="number"
                        step={1000}
                        min={0}
                        aria-label={`Precio de ${s.name}`}
                        value={prices[s.id] ?? s.price}
                        onChange={(e) =>
                          setPrices((prev) => ({ ...prev, [s.id]: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-line bg-paper px-4 py-2 pr-12 text-sm text-ink outline-none focus:border-ink"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">
                        CLP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line-soft pt-5">
          <Kicker>Disponibilidad</Kicker>
          <p className="mt-1 mb-3 text-xs text-muted-light">
            Define los días y tramos en que se pueden reservar horas con esta persona.
          </p>
          <AvailabilityEditor
            value={draft.availability}
            onChange={(availability) => set('availability', availability)}
          />
        </div>
      </div>
    </Modal>
  )
}
