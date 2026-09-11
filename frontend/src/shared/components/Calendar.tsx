import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DayStatus } from '@/shared/types'
import { parseISODate } from '@/shared/lib/format'

const WEEKDAY_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function Calendar({
  monthLabel,
  days,
  selectedDateISO,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: {
  monthLabel: string
  days: DayStatus[]
  selectedDateISO?: string
  onSelectDate: (dateISO: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}) {
  const firstWeekday = days.length > 0 ? (parseISODate(days[0].dateISO).getDay() + 6) % 7 : 0
  const leadingBlanks = Array.from({ length: firstWeekday })

  return (
    <div className="rounded-2xl border border-line-soft bg-paper p-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:bg-ivory"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-serif-display text-2xl text-ink">{monthLabel}</h3>
        <button
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:bg-ivory"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-muted">
        {WEEKDAY_HEADERS.map((w, i) => (
          <div key={`${w}-${i}`}>{w}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const isSelected = day.dateISO === selectedDateISO
          const disabled = day.status === 'cerrado' || day.status === 'sin_cupos'

          let cellClass = ''
          if (isSelected) {
            cellClass = 'bg-ink text-white'
          } else if (day.status === 'cerrado') {
            cellClass = 'border border-dashed border-line text-muted-light'
          } else if (day.status === 'sin_cupos') {
            cellClass = 'bg-line-soft text-muted-light'
          } else {
            cellClass = 'bg-olive-50 text-ink hover:bg-olive-100'
          }

          return (
            <button
              key={day.dateISO}
              disabled={disabled}
              onClick={() => onSelectDate(day.dateISO)}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition-colors disabled:cursor-not-allowed ${cellClass}`}
            >
              <span>{day.day}</span>
              {day.status === 'con_cupos' && !isSelected && (
                <span className="h-1 w-1 rounded-full bg-olive-600" />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-line-soft pt-4 text-xs text-muted">
        <LegendDot className="bg-olive-50" label="Con cupos" />
        <LegendDot className="bg-line-soft" label="Sin cupos" />
        <LegendDot className="border border-dashed border-line" label="Cerrado" />
        <LegendDot className="bg-ink" label="Seleccionado" />
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
