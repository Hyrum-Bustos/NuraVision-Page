import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAppState } from '../../state/AppState'
import { TODAY_ISO } from '../../data/seed'
import { AvailabilityEditor } from '../../components/AvailabilityEditor'
import { Button } from '../../components/ui'
import { parseISODate } from '../../lib/format'
import type { WeeklyAvailability } from '../../types'

export default function ProAvailability() {
  const { currentUser, getProfessional, updateProfessional, bookings } = useAppState()
  const professional = getProfessional(currentUser?.professionalId ?? '')
  const [draft, setDraft] = useState<WeeklyAvailability | null>(professional?.availability ?? null)
  const [saved, setSaved] = useState(false)

  /** Reservas confirmadas que quedarían fuera del horario que se está editando. */
  const conflicts = useMemo(() => {
    if (!professional || !draft) return []
    return bookings.filter((b) => {
      if (b.professionalId !== professional.id) return false
      if (b.status === 'cancelada' || b.status === 'completada') return false
      if (b.dateISO < TODAY_ISO) return false

      const weekday = parseISODate(b.dateISO).getDay() as keyof WeeklyAvailability
      const day = draft[weekday]
      if (!day.enabled) return true
      return b.time < day.start || b.time >= day.end
    })
  }, [professional, draft, bookings])

  if (!professional || !draft) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <p className="text-sm text-muted">No encontramos tu ficha de profesional.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="font-serif-display text-4xl text-ink">Mi disponibilidad</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Define tus días laborales y tramos de atención. Los clientes solo podrán reservar dentro de
        estos bloques.
      </p>

      {conflicts.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#f0d9a6] bg-[#fbf1de] px-5 py-4 text-sm text-[#8a6a2a]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Tienes {conflicts.length}{' '}
            {conflicts.length === 1 ? 'reserva confirmada' : 'reservas confirmadas'} fuera de este
            horario. Si guardas los cambios deberás reprogramar
            {conflicts.length === 1 ? 'la' : 'las'}.
          </span>
        </div>
      )}

      <div className="mt-6">
        <AvailabilityEditor
          value={draft}
          onChange={(next) => {
            setDraft(next)
            setSaved(false)
          }}
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button
          onClick={() => {
            updateProfessional(professional.id, { availability: draft })
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
          }}
        >
          Guardar disponibilidad
        </Button>
        <Button variant="outline" onClick={() => setDraft(professional.availability)}>
          Descartar cambios
        </Button>
        {saved && <span className="text-sm text-olive-700">Disponibilidad guardada.</span>}
      </div>
    </div>
  )
}
