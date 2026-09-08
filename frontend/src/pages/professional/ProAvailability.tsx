import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button, Kicker } from '../../components/ui'

interface DayConfig {
  day: string
  enabled: boolean
  start: string
  end: string
  note?: string
}

const INITIAL: DayConfig[] = [
  { day: 'Lunes', enabled: false, start: '10:00', end: '19:00' },
  { day: 'Martes', enabled: true, start: '10:00', end: '19:00', note: '13:00-14:00 · Colación' },
  { day: 'Miércoles', enabled: true, start: '10:00', end: '19:00', note: '13:00-14:00 · Colación' },
  { day: 'Jueves', enabled: true, start: '10:00', end: '19:00', note: '13:00-14:00 · Colación' },
  { day: 'Viernes', enabled: true, start: '10:00', end: '19:00', note: '13:00-14:00 · Colación' },
  { day: 'Sábado', enabled: true, start: '10:00', end: '15:00', note: '13:00-15:00 · Bloqueado' },
  { day: 'Domingo', enabled: false, start: '10:00', end: '19:00' },
]

export default function ProAvailability() {
  const [days, setDays] = useState(INITIAL)
  const [saved, setSaved] = useState(false)

  function toggleDay(index: number) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, enabled: !d.enabled } : d)))
  }

  function updateTime(index: number, field: 'start' | 'end', value: string) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)))
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Mi disponibilidad</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Define tus días laborales y tramos de atención. Los clientes solo podrán reservar dentro de
        estos bloques.
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#f0d9a6] bg-[#fbf1de] px-5 py-4 text-sm text-[#8a6a2a]">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Tienes 2 reservas confirmadas el jueves entre 16:00 y 18:00. Si cierras ese tramo deberás
        reprogramarlas.
      </div>

      <div className="mt-6 divide-y divide-line-soft rounded-2xl border border-line-soft bg-paper">
        {days.map((d, i) => (
          <div key={d.day} className="flex flex-wrap items-center gap-4 p-5">
            <button
              onClick={() => toggleDay(i)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                d.enabled ? 'bg-olive-600' : 'bg-line'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  d.enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="w-24 font-medium text-ink">{d.day}</span>
            {d.enabled ? (
              <>
                <input
                  value={d.start}
                  onChange={(e) => updateTime(i, 'start', e.target.value)}
                  className="w-24 rounded-lg border border-line bg-ivory px-3 py-2 text-sm text-ink"
                />
                <span className="text-sm text-muted">a</span>
                <input
                  value={d.end}
                  onChange={(e) => updateTime(i, 'end', e.target.value)}
                  className="w-24 rounded-lg border border-line bg-ivory px-3 py-2 text-sm text-ink"
                />
                {d.note && (
                  <span className="rounded-full bg-line-soft px-3 py-1 text-xs text-muted">{d.note}</span>
                )}
                <button className="ml-auto rounded-full border border-dashed border-line px-3 py-1.5 text-xs text-muted hover:border-ink hover:text-ink">
                  + Bloquear tramo
                </button>
              </>
            ) : (
              <span className="text-sm text-muted-light">Día libre — no se mostrará disponibilidad</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button
          onClick={() => {
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
          }}
        >
          Guardar disponibilidad
        </Button>
        <Button variant="outline">Cancelar</Button>
        {saved && <Kicker className="text-olive-700">Disponibilidad guardada.</Kicker>}
      </div>
    </div>
  )
}
