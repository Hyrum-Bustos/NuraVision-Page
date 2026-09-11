import type { Slot } from '../../lib/availability'

const STATUS_STYLE: Record<Slot['status'], string> = {
  disponible: 'bg-olive-50 text-ink hover:bg-olive-100 cursor-pointer',
  reservado: 'bg-olive-600 text-white cursor-not-allowed',
  bloqueado: 'placeholder-stripes text-muted-light cursor-not-allowed',
  fuera_horario: 'border border-dashed border-line text-muted-light cursor-not-allowed',
}

export function TimeSlotGrid({
  slots,
  selectedTime,
  onSelect,
}: {
  slots: Slot[]
  selectedTime?: string
  onSelect: (time: string) => void
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-x-5 gap-y-2 rounded-2xl border border-line-soft bg-paper px-5 py-3 text-xs text-muted">
        <LegendDot className="bg-olive-50" label="Disponible" />
        <LegendDot className="bg-olive-600" label="Reservado" />
        <LegendDot className="placeholder-stripes" label="Bloqueado" />
        <LegendDot className="border border-dashed border-line" label="Fuera de horario" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {slots.map((slot) => {
          const isSelected = slot.time === selectedTime
          return (
            <button
              key={slot.time}
              disabled={slot.status !== 'disponible'}
              onClick={() => onSelect(slot.time)}
              className={`rounded-xl px-3 py-3 text-center text-sm font-medium transition-colors ${
                isSelected ? 'bg-ink text-white' : STATUS_STYLE[slot.status]
              }`}
            >
              {slot.time}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  )
}
