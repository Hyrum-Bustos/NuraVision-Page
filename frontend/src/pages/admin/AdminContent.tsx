import { useState } from 'react'
import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAppState, createId } from '../../state/AppState'
import { useToast } from '../../state/Toast'
import { ConfirmDialog, Modal } from '../../components/Modal'
import { ImageUploader } from '../../components/ImageUploader'
import { ChipMultiSelect, TextAreaField, TextField } from '../../components/form'
import { AppImage, Button, Card, Kicker } from '../../components/ui'
import type { AiFocusOption, AiTip, SiteContent } from '../../types'

export default function AdminContent() {
  const { siteContent, updateSiteContent, services, storageWarning } = useAppState()
  const { toast } = useToast()

  const [images, setImages] = useState({
    heroImage: siteContent.heroImage,
    heroCaption: siteContent.heroCaption,
    aiTeaserImage: siteContent.aiTeaserImage,
    aiTeaserCaption: siteContent.aiTeaserCaption,
    loginImage: siteContent.loginImage,
  })

  const [editingFocus, setEditingFocus] = useState<{ isNew: boolean; value: AiFocusOption } | null>(
    null,
  )
  const [deletingFocus, setDeletingFocus] = useState<AiFocusOption | null>(null)

  function saveImages() {
    updateSiteContent(images as Partial<SiteContent>)
    toast({ title: 'Imágenes actualizadas' })
  }

  function saveFocus(option: AiFocusOption, isNew: boolean) {
    updateSiteContent({
      aiFocusOptions: isNew
        ? [...siteContent.aiFocusOptions, option]
        : siteContent.aiFocusOptions.map((o) => (o.id === option.id ? option : o)),
    })
    toast({
      title: isNew ? 'Opción de análisis creada' : 'Opción de análisis actualizada',
      description: option.label,
    })
    setEditingFocus(null)
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="font-serif-display text-4xl text-ink">Contenido del sitio</h1>
      <p className="mt-2 text-sm text-muted">
        Fotografías de la página pública y configuración del análisis con IA.
      </p>

      {storageWarning && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#e6c9c0] bg-danger-soft px-5 py-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {storageWarning}
        </div>
      )}

      {/* --- Imágenes --- */}
      <section className="mt-8">
        <Kicker>Fotografías</Kicker>
        <h2 className="mt-1 font-serif-display text-2xl text-ink">Imágenes de la página</h2>

        <div className="mt-5 grid gap-6 lg:grid-cols-3">
          <Card className="p-5">
            <ImageUploader
              label="Portada del inicio"
              value={images.heroImage}
              onChange={(heroImage) => setImages((p) => ({ ...p, heroImage }))}
              aspectClass="aspect-[4/5]"
              hint="Imagen principal de la página de inicio."
            />
            <div className="mt-4">
              <TextField
                label="Texto del marcador"
                value={images.heroCaption}
                onChange={(heroCaption) => setImages((p) => ({ ...p, heroCaption }))}
                hint="Se muestra mientras no haya fotografía."
              />
            </div>
          </Card>

          <Card className="p-5">
            <ImageUploader
              label="Sección Análisis IA (inicio)"
              value={images.aiTeaserImage}
              onChange={(aiTeaserImage) => setImages((p) => ({ ...p, aiTeaserImage }))}
              aspectClass="aspect-square"
              hint="Acompaña el bloque “Una fotografía. Una orientación clara.”"
            />
            <div className="mt-4">
              <TextField
                label="Texto del marcador"
                value={images.aiTeaserCaption}
                onChange={(aiTeaserCaption) => setImages((p) => ({ ...p, aiTeaserCaption }))}
              />
            </div>
          </Card>

          <Card className="p-5">
            <ImageUploader
              label="Inicio de sesión"
              value={images.loginImage}
              onChange={(loginImage) => setImages((p) => ({ ...p, loginImage }))}
              aspectClass="aspect-[3/4]"
              hint="Imagen lateral de la pantalla de acceso."
            />
          </Card>
        </div>

        <div className="mt-5">
          <Button onClick={saveImages}>Guardar imágenes</Button>
        </div>
      </section>

      {/* --- Análisis IA --- */}
      <section className="mt-12 border-t border-line-soft pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Kicker>Análisis IA</Kicker>
            <h2 className="mt-1 font-serif-display text-2xl text-ink">¿Qué quieres analizar?</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Cada opción define lo que el cliente puede analizar, las fotos de ejemplo de “Prepara
              tu fotografía” y los servicios que se recomiendan al terminar.
            </p>
          </div>
          <Button
            onClick={() =>
              setEditingFocus({
                isNew: true,
                value: {
                  id: createId('focus'),
                  label: '',
                  analysisLabel: '',
                  recommendedServiceIds: [],
                  tips: [],
                },
              })
            }
          >
            <Plus className="h-4 w-4" />
            Nueva opción
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {siteContent.aiFocusOptions.map((option) => (
            <Card key={option.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-serif-display text-xl text-ink">{option.label}</p>
                  <p className="mt-1 text-sm text-muted">
                    {option.tips.length}{' '}
                    {option.tips.length === 1 ? 'recomendación' : 'recomendaciones'} ·{' '}
                    {option.recommendedServiceIds.length}{' '}
                    {option.recommendedServiceIds.length === 1
                      ? 'servicio sugerido'
                      : 'servicios sugeridos'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingFocus({ isNew: false, value: option })}
                    aria-label={`Editar ${option.label}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition-colors hover:bg-ivory"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => setDeletingFocus(option)}
                    aria-label={`Eliminar ${option.label}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>

              {option.tips.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {option.tips.map((tip) => (
                    <div key={tip.id} className="overflow-hidden rounded-xl border border-line-soft">
                      <AppImage
                        src={tip.imageUrl}
                        alt={tip.title}
                        label="Ejemplo"
                        className="aspect-square w-full"
                      />
                      <p className="px-3 py-2 text-xs text-ink">{tip.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {siteContent.aiFocusOptions.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
              Sin opciones de análisis. Los clientes verán el análisis desactivado.
            </p>
          )}
        </div>
      </section>

      {editingFocus && (
        <FocusFormModal
          initial={editingFocus.value}
          isNew={editingFocus.isNew}
          serviceOptions={services.map((s) => ({
            value: s.id,
            label: s.name,
            description: `${s.durationMin} min`,
          }))}
          onCancel={() => setEditingFocus(null)}
          onSave={(value) => saveFocus(value, editingFocus.isNew)}
        />
      )}

      {deletingFocus && (
        <ConfirmDialog
          open
          onClose={() => setDeletingFocus(null)}
          onConfirm={() => {
            updateSiteContent({
              aiFocusOptions: siteContent.aiFocusOptions.filter((o) => o.id !== deletingFocus.id),
            })
            toast({
              title: 'Opción eliminada',
              description: deletingFocus.label,
              tone: 'info',
            })
          }}
          title={`Eliminar “${deletingFocus.label}”`}
          confirmLabel="Eliminar opción"
          description="Los clientes dejarán de ver este enfoque en el análisis con IA, junto con sus fotos de ejemplo."
        />
      )}
    </div>
  )
}

function FocusFormModal({
  initial,
  isNew,
  serviceOptions,
  onCancel,
  onSave,
}: {
  initial: AiFocusOption
  isNew: boolean
  serviceOptions: { value: string; label: string; description?: string }[]
  onCancel: () => void
  onSave: (value: AiFocusOption) => void
}) {
  const [draft, setDraft] = useState<AiFocusOption>(initial)
  const [showErrors, setShowErrors] = useState(false)

  const labelError = !draft.label.trim() ? 'El nombre es obligatorio.' : undefined

  const set = <K extends keyof AiFocusOption>(key: K, value: AiFocusOption[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  function updateTip(id: string, patch: Partial<AiTip>) {
    set(
      'tips',
      draft.tips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    )
  }

  return (
    <Modal
      open
      onClose={onCancel}
      size="lg"
      title={isNew ? 'Nueva opción de análisis' : `Editar “${initial.label}”`}
      description="Nombre, fotos de ejemplo y servicios recomendados."
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (labelError) {
                setShowErrors(true)
                return
              }
              onSave({
                ...draft,
                label: draft.label.trim(),
                analysisLabel: draft.analysisLabel.trim() || draft.label.trim().toLowerCase(),
                tips: draft.tips.filter((t) => t.title.trim()),
              })
            }}
          >
            {isNew ? 'Crear opción' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Nombre"
            value={draft.label}
            onChange={(v) => set('label', v)}
            placeholder="Manos y uñas"
            error={showErrors ? labelError : undefined}
          />
          <TextField
            label="Texto al subir la foto"
            value={draft.analysisLabel}
            onChange={(v) => set('analysisLabel', v)}
            placeholder="manos y uñas"
            hint="Se lee como “Analizaremos …”."
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
          <ImageUploader
            label="Imagen del resultado"
            value={draft.imageUrl}
            onChange={(imageUrl) => set('imageUrl', imageUrl)}
            aspectClass="aspect-square"
            hint="Se muestra junto a la orientación entregada."
          />
          <ChipMultiSelect
            label="Servicios recomendados"
            options={serviceOptions}
            selected={draft.recommendedServiceIds}
            onChange={(v) => set('recommendedServiceIds', v)}
            hint="Se sugieren al cliente cuando termina el análisis."
            emptyLabel="Primero crea servicios en la sección Servicios."
          />
        </div>

        <div className="border-t border-line-soft pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Kicker>Prepara tu fotografía</Kicker>
              <p className="mt-1 text-xs text-muted-light">
                Fotos de ejemplo y consejos que ve el cliente antes de subir su imagen.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                set('tips', [
                  ...draft.tips,
                  { id: createId('tip'), title: '', description: '' },
                ])
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-4 py-2 text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar ejemplo
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {draft.tips.map((tip, index) => (
              <div
                key={tip.id}
                className="grid gap-4 rounded-xl border border-line-soft p-4 sm:grid-cols-[160px_1fr]"
              >
                <ImageUploader
                  label={`Foto ${index + 1}`}
                  value={tip.imageUrl}
                  onChange={(imageUrl) => updateTip(tip.id, { imageUrl })}
                  aspectClass="aspect-square"
                  placeholderLabel="Ejemplo"
                />
                <div className="space-y-4">
                  <TextField
                    label="Título"
                    value={tip.title}
                    onChange={(v) => updateTip(tip.id, { title: v })}
                    placeholder="Luz natural"
                  />
                  <TextAreaField
                    label="Descripción"
                    value={tip.description}
                    onChange={(v) => updateTip(tip.id, { description: v })}
                    rows={2}
                    placeholder="Cerca de una ventana, sin flash directo."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        'tips',
                        draft.tips.filter((t) => t.id !== tip.id),
                      )
                    }
                    aria-label={`Quitar ejemplo ${index + 1}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Quitar ejemplo
                  </button>
                </div>
              </div>
            ))}

            {draft.tips.length === 0 && (
              <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
                Sin ejemplos todavía.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
