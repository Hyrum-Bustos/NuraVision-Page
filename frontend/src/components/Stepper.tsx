import { Check } from 'lucide-react'

const STEP_LABELS = ['Servicio', 'Profesional', 'Fecha', 'Hora', 'Confirmación']

export function Stepper({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex items-center">
      {STEP_LABELS.map((label, index) => {
        const done = index < currentIndex
        const current = index === currentIndex
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  done
                    ? 'border border-olive-400 text-olive-600'
                    : current
                      ? 'bg-ink text-white'
                      : 'border border-line text-muted-light'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  current ? 'font-medium text-ink' : done ? 'text-ink' : 'text-muted-light'
                }`}
              >
                {label}
              </span>
            </div>
            {index < STEP_LABELS.length - 1 && (
              <div className="mx-3 h-px flex-1 bg-line sm:mx-4" />
            )}
          </div>
        )
      })}
    </div>
  )
}
