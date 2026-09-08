import { Plus, X } from 'lucide-react'
import { createId } from '../state/AppState'
import { timeToMinutes } from '../lib/availability'
import type { DayAvailability, Weekday, WeeklyAvailability } from '../types'

/** Lunes primero, como se lee un horario. */
const WEEK_ORDER: { weekday: Weekday; label: string }[] = [
  { weekday: 1, label: 'Lunes' },
  { weekday: 2, label: 'Martes' },
  { weekday: 3, label: 'Miércoles' },
  { weekday: 4, label: 'Jueves' },
  { weekday: 5, label: 'Viernes' },
  { weekday: 6, label: 'Sábado' },
  { weekday: 0, label: 'Domingo' },
]

export function AvailabilityEditor({
  value,
  onChange,
}: {
  value: WeeklyAvailability
  onChange: (next: WeeklyAvailability) => void
}) {
  function updateDay(weekday: Weekday, patch: Partial<DayAvailability>) {
    onChange({ ...value, [weekday]: { ...value[weekday], ...patch } })
  }

  return (
    <div className="divide-y divide-line-soft rounded-2xl border border-line-soft bg-paper">
      {WEEK_ORDER.map(({ weekday, label }) => {
        const day = value[weekday]
        const invalidRange = day.enabled && timeToMinutes(day.end) <= timeToMinutes(day.start)

        return (
          <div key={weekday} className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                role="switch"
                aria-checked={day.enabled}
                aria-label={`${label}: ${day.enabled ? 'atiende' : 'día libre'}`}
                onClick={() => updateDay(weekday, { enabled: !day.enabled })}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  day.enabled ? 'bg-olive-600' : 'bg-line'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    day.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="w-24 font-medium text-ink">{label}</span>

              {day.enabled ? (
                <>
                  <input
                    type="time"
                    value={day.start}
                    onChange={(e) => updateDay(weekday, { start: e.target.value })}
                    className="rounded-lg border border-line bg-ivory px-3 py-2 text-sm text-ink"
                  />
                  <span className="text-sm text-muted">a</span>
                  <input
                    type="time"
                    value={day.end}
                    onChange={(e) => updateDay(weekday, { end: e.target.value })}
                    className="rounded-lg border border-line bg-ivory px-3 py-2 text-sm text-ink"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateDay(weekday, {
                        breaks: [
                          ...day.breaks,
                          { id: createId('brk'), start: '13:00', end: '14:00', label: 'Colación' },
                        ],
                      })
                    }
                    className="ml-auto inline-flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-xs text-muted hover:border-ink hover:text-ink"
                  >
                    <Plus className="h-3 w-3" />
                    Bloquear tramo
                  </button>
                </>
              ) : (
                <span className="text-sm text-muted-light">
                  Día libre — no se mostrará disponibilidad
                </span>
              )}
            </div>

            {invalidRange && (
              <p className="mt-2 pl-[6.5rem] text-xs text-danger">
                La hora de término debe ser posterior a la de inicio.
              </p>
            )}

            {day.enabled && day.breaks.length > 0 && (
              <div className="mt-3 space-y-2 pl-[6.5rem]">
                {day.breaks.map((brk) => (
                  <div key={brk.id} className="flex flex-wrap items-center gap-2">
                    <input
                      value={brk.label}
                      onChange={(e) =>
                        updateDay(weekday, {
                          breaks: day.breaks.map((b) =>
                            b.id === brk.id ? { ...b, label: e.target.value } : b,
                          ),
                        })
                      }
                      placeholder="Motivo"
                      className="w-36 rounded-lg border border-line bg-ivory px-3 py-1.5 text-xs text-ink"
                    />
                    <input
                      type="time"
                      value={brk.start}
                      onChange={(e) =>
                        updateDay(weekday, {
                          breaks: day.breaks.map((b) =>
                            b.id === brk.id ? { ...b, start: e.target.value } : b,
                          ),
                        })
                      }
                      className="rounded-lg border border-line bg-ivory px-3 py-1.5 text-xs text-ink"
                    />
                    <span className="text-xs text-muted">a</span>
                    <input
                      type="time"
                      value={brk.end}
                      onChange={(e) =>
                        updateDay(weekday, {
                          breaks: day.breaks.map((b) =>
                            b.id === brk.id ? { ...b, end: e.target.value } : b,
                          ),
                        })
                      }
                      className="rounded-lg border border-line bg-ivory px-3 py-1.5 text-xs text-ink"
                    />
                    <button
                      type="button"
                      aria-label={`Quitar tramo ${brk.label}`}
                      onClick={() =>
                        updateDay(weekday, { breaks: day.breaks.filter((b) => b.id !== brk.id) })
                      }
                      className="rounded-full p-1 text-muted hover:bg-danger-soft hover:text-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
