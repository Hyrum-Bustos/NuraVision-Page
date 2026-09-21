import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAppState } from '@/shared/state/AppState'
import { useToast } from '@/shared/state/Toast'
import { TODAY_ISO } from '@/shared/data/seed'
import { AvailabilityEditor } from '@/shared/components/AvailabilityEditor'
import { Button } from '@/shared/ui/ui'
import { parseISODate } from '@/shared/lib/format'
import type { WeeklyAvailability } from '@/shared/types'
import { useMiFichaProfesional } from '@/modules/profesionales/ui/useMiFichaProfesional'
import { FichaActiva, SelectorDeFicha } from '@/modules/profesionales/ui/SelectorDeFicha'

export default function ProAvailability() {
  const { updateProfessional, bookings } = useAppState()
  const { toast } = useToast()
  // La ficha sale de la base: antes se buscaba en los datos de ejemplo con el
  // `professionalId` del usuario de demostracion y, con el modo "solo
  // Supabase" activo, no habia nada que encontrar.
  const mia = useMiFichaProfesional()
  const professional = mia.ficha
  const [draft, setDraft] = useState<WeeklyAvailability | null>(null)

  /**
   * El horario llega despues que la ficha: son dos consultas. Si el borrador
   * se inicializara solo en el primer render se quedaria vacio para siempre,
   * que es justo lo que pasaba.
   *
   * La clave incluye el horario y no solo el id, porque el id ya esta resuelto
   * cuando la agenda todavia no ha llegado. Se ajusta durante el render, que
   * es el patron que recomienda React, en vez de en un efecto.
   */
  const claveFicha = professional
    ? `${professional.id}|${JSON.stringify(professional.availability)}`
    : ''
  const [claveprevia, setClavePrevia] = useState('')
  if (claveFicha !== claveprevia) {
    setClavePrevia(claveFicha)
    setDraft(professional?.availability ?? null)
  }

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
      <SelectorDeFicha
        equipo={mia.equipo}
        cargando={mia.cargando}
        error={mia.error}
        onElegir={mia.elegir}
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      {!mia.vinculoDeclarado && mia.profesional && (
        <FichaActiva nombre={mia.profesional.nombre} onCambiar={() => mia.elegir(null)} />
      )}

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
          }}
        />
      </div>

      {/* El horario que se muestra viene de `disponibilidad`, pero editarlo NO
          llega a la base: no existe una politica de UPDATE sobre esa tabla, y
          `updateProfessional` solo toca el estado local. Decirlo es preferible
          a un "Guardada" que no es cierto. */}
      <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-3 text-xs text-muted">
        Los cambios se quedan en este navegador. Guardar tu horario en la base de datos necesita
        una política de escritura sobre <code>disponibilidad</code>, que todavía no existe.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <Button
          onClick={() => {
            updateProfessional(professional.id, { availability: draft })
            toast({
              title: 'Cambios aplicados solo aquí',
              description: 'Todavía no se guardan en la base de datos.',
              tone: 'info',
            })
          }}
        >
          Aplicar en este navegador
        </Button>
        <Button variant="outline" onClick={() => setDraft(professional.availability)}>
          Descartar cambios
        </Button>
      </div>
    </div>
  )
}
