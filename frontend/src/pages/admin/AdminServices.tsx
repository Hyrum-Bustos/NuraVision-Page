import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAppState } from '../../state/AppState'
import { useToast } from '../../state/Toast'
import { categoryLabel, serviceCategories } from '../../data/seed'
import { Modal, ConfirmDialog } from '../../shared/ui/Modal'
import { ImageUploader } from '../../shared/components/ImageUploader'
import {
  NumberField,
  SelectField,
  StringListField,
  TextAreaField,
  TextField,
} from '../../shared/ui/form'
import { AppImage, Button } from '../../shared/ui/ui'
import { formatPrice } from '../../lib/format'
import type { Service, ServiceCategoryId } from '../../shared/types'

type Draft = Omit<Service, 'id'>

const EMPTY_DRAFT: Draft = {
  name: '',
  category: 'unas',
  shortDescription: '',
  longDescription: '',
  durationMin: 60,
  price: 20000,
  includes: [],
}

export default function AdminServices() {
  const { services, professionals, bookings, addService, updateService, deleteService } =
    useAppState()
  const { toast } = useToast()

  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null)
  const [deleting, setDeleting] = useState<Service | null>(null)

  function openNew() {
    setEditing({ draft: { ...EMPTY_DRAFT } })
  }

  function openEdit(service: Service) {
    const { id: _id, ...draft } = service
    setEditing({ id: service.id, draft })
  }

  function handleSave(draft: Draft, id?: string) {
    if (id) {
      updateService(id, draft)
      toast({ title: 'Servicio actualizado', description: draft.name })
    } else {
      addService(draft)
      toast({ title: 'Servicio creado', description: draft.name })
    }
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-4xl text-ink">Servicios</h1>
          <p className="mt-2 text-sm text-muted">
            Catálogo del estudio: lo que se publica aquí es lo que ven y reservan los clientes.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nuevo servicio
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line-soft bg-paper">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line-soft bg-ivory/60 text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-4 font-medium">Servicio</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium">Duración</th>
              <th className="px-6 py-4 font-medium">Precio</th>
              <th className="px-6 py-4 font-medium">Profesionales</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {services.map((s) => {
              const offeredBy = professionals.filter((p) => p.serviceIds.includes(s.id)).length
              return (
                <tr key={s.id} className="transition-colors hover:bg-ivory/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <AppImage
                        src={s.imageUrl}
                        label={s.name.slice(0, 1)}
                        alt={s.name}
                        className="h-11 w-11 shrink-0 rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-ink">{s.name}</p>
                        <p className="text-xs text-muted">{s.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ink">{categoryLabel(s.category)}</td>
                  <td className="px-6 py-4 text-ink">{s.durationMin} min</td>
                  <td className="px-6 py-4 text-ink">{formatPrice(s.price)}</td>
                  <td className="px-6 py-4 text-muted">
                    {offeredBy > 0 ? offeredBy : <span className="text-danger">Sin asignar</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        aria-label={`Editar ${s.name}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ivory"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleting(s)}
                        aria-label={`Eliminar ${s.name}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {services.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted">
                  Todavía no hay servicios. Crea el primero con “Nuevo servicio”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ServiceFormModal
          initial={editing.draft}
          isNew={!editing.id}
          onCancel={() => setEditing(null)}
          onSave={(draft) => handleSave(draft, editing.id)}
        />
      )}

      {deleting && (
        <DeleteServiceDialog
          service={deleting}
          professionalCount={
            professionals.filter((p) => p.serviceIds.includes(deleting.id)).length
          }
          activeBookings={
            bookings.filter(
              (b) => b.serviceId === deleting.id && b.status !== 'cancelada' && b.status !== 'completada',
            ).length
          }
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            deleteService(deleting.id)
            toast({ title: 'Servicio eliminado', description: deleting.name, tone: 'info' })
          }}
        />
      )}
    </div>
  )
}

function ServiceFormModal({
  initial,
  isNew,
  onCancel,
  onSave,
}: {
  initial: Draft
  isNew: boolean
  onCancel: () => void
  onSave: (draft: Draft) => void
}) {
  const [draft, setDraft] = useState<Draft>(initial)
  const [showErrors, setShowErrors] = useState(false)

  const errors = useMemo(() => {
    const next: Partial<Record<keyof Draft, string>> = {}
    if (!draft.name.trim()) next.name = 'El nombre es obligatorio.'
    if (!draft.shortDescription.trim()) next.shortDescription = 'Escribe una descripción breve.'
    if (draft.durationMin <= 0) next.durationMin = 'La duración debe ser mayor a 0.'
    if (draft.price < 0) next.price = 'El precio no puede ser negativo.'
    return next
  }, [draft])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal
      open
      onClose={onCancel}
      title={isNew ? 'Nuevo servicio' : 'Editar servicio'}
      description="Los cambios se reflejan de inmediato en el catálogo público."
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
              onSave({
                ...draft,
                name: draft.name.trim(),
                includes: draft.includes.map((i) => i.trim()).filter(Boolean),
              })
            }}
          >
            {isNew ? 'Crear servicio' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <ImageUploader
          label="Fotografía"
          value={draft.imageUrl}
          onChange={(imageUrl) => set('imageUrl', imageUrl)}
          hint="Se muestra en el catálogo, el detalle del servicio y el resumen de la reserva."
        />

        <TextField
          label="Nombre"
          value={draft.name}
          onChange={(v) => set('name', v)}
          placeholder="Manicure Ritual Nura"
          error={showErrors ? errors.name : undefined}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            label="Categoría"
            value={draft.category}
            onChange={(v) => set('category', v as ServiceCategoryId)}
            options={serviceCategories.map((c) => ({ value: c.id, label: c.label }))}
          />
          <NumberField
            label="Duración"
            value={draft.durationMin}
            onChange={(v) => set('durationMin', v)}
            min={15}
            step={15}
            suffix="min"
            error={showErrors ? errors.durationMin : undefined}
          />
          <NumberField
            label="Precio"
            value={draft.price}
            onChange={(v) => set('price', v)}
            step={1000}
            suffix="CLP"
            error={showErrors ? errors.price : undefined}
          />
        </div>

        <TextField
          label="Descripción breve"
          value={draft.shortDescription}
          onChange={(v) => set('shortDescription', v)}
          placeholder="Limado, cutículas, hidratación profunda y esmaltado a elección."
          hint="Se muestra en las tarjetas del catálogo."
          error={showErrors ? errors.shortDescription : undefined}
        />

        <TextAreaField
          label="Descripción completa"
          value={draft.longDescription}
          onChange={(v) => set('longDescription', v)}
          rows={4}
          hint="Aparece en la página de detalle del servicio."
        />

        <StringListField
          label="Incluye"
          values={draft.includes}
          onChange={(v) => set('includes', v)}
          placeholder="Agregar ítem"
          hint="Lista de lo que contempla el servicio."
        />
      </div>
    </Modal>
  )
}

function DeleteServiceDialog({
  service,
  professionalCount,
  activeBookings,
  onClose,
  onConfirm,
}: {
  service: Service
  professionalCount: number
  activeBookings: number
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Eliminar “${service.name}”`}
      confirmLabel="Eliminar servicio"
      description={
        <div className="space-y-3">
          <p>
            El servicio dejará de aparecer en el catálogo y se quitará de los profesionales que lo
            realizan.
          </p>
          {professionalCount > 0 && (
            <p>
              Lo realizan{' '}
              <strong className="text-ink">
                {professionalCount} {professionalCount === 1 ? 'profesional' : 'profesionales'}
              </strong>
              .
            </p>
          )}
          {activeBookings > 0 && (
            <p className="rounded-lg bg-danger-soft px-4 py-3 text-danger">
              Hay {activeBookings} {activeBookings === 1 ? 'reserva activa' : 'reservas activas'} con
              este servicio. Se conservan en el historial, pero conviene reprogramarlas.
            </p>
          )}
        </div>
      }
    />
  )
}
