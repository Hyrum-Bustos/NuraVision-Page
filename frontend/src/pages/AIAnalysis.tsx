import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Upload } from 'lucide-react'
import { services } from '../data/services'
import { Button, FilterPills, Kicker, Placeholder } from '../components/ui'
import { useScrollToTopOnChange } from '../components/ScrollToTop'
import { formatPrice } from '../lib/format'

type Focus = 'manos' | 'piel' | 'cuero'
type Step = 'prepare' | 'upload' | 'result'
type SimulatedError = 'imagen_invalida' | 'servicio_caido' | null

const FOCUS_OPTIONS: { value: Focus; label: string }[] = [
  { value: 'manos', label: 'Manos y uñas' },
  { value: 'piel', label: 'Tono de piel' },
  { value: 'cuero', label: 'Cuero cabelludo' },
]

const TIPS = [
  { title: 'Luz natural', desc: 'Cerca de una ventana, sin flash directo.' },
  { title: 'Fondo neutro', desc: 'Una superficie lisa y clara funciona mejor.' },
  { title: 'Encuadre completo', desc: 'Que se vean las cuatro uñas y el borde libre.' },
  { title: 'Sin esmalte', desc: 'Si es posible, retíralo antes de fotografiar.' },
]

const FOCUS_RECOMMENDATIONS: Record<Focus, string[]> = {
  manos: ['manicure-ritual-nura', 'unas-esculpidas', 'pedicure-spa'],
  piel: ['limpieza-facial-profunda'],
  cuero: ['diagnostico-capilar', 'tratamiento-capilar-reconstructivo'],
}

export default function AIAnalysis() {
  const [focus, setFocus] = useState<Focus>('manos')
  const [step, setStep] = useState<Step>('prepare')
  const [simulatedError, setSimulatedError] = useState<SimulatedError>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  useScrollToTopOnChange(step)

  const recommended = services.filter((s) => FOCUS_RECOMMENDATIONS[focus].includes(s.id))

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-olive-700">
          <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
          Nuravision IA
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-light">Estados</span>
          <button
            onClick={() => setSimulatedError('imagen_invalida')}
            className="rounded-full border border-dashed border-line px-3 py-1.5 text-xs text-muted hover:border-danger hover:text-danger"
          >
            Imagen inválida
          </button>
          <button
            onClick={() => setSimulatedError('servicio_caido')}
            className="rounded-full border border-dashed border-line px-3 py-1.5 text-xs text-muted hover:border-danger hover:text-danger"
          >
            Servicio caído
          </button>
        </div>
      </div>

      {step === 'prepare' && (
        <>
          <h1 className="mt-6 font-serif-display text-4xl text-ink">Prepara tu fotografía</h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Una buena foto mejora mucho el resultado. Toma 30 segundos para revisar estas cuatro
            cosas.
          </p>

          <Kicker className="mt-8">¿Qué quieres analizar?</Kicker>
          <div className="mt-3">
            <FilterPills options={FOCUS_OPTIONS} value={focus} onChange={setFocus} />
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TIPS.map((tip) => (
              <div key={tip.title} className="overflow-hidden rounded-2xl border border-line-soft bg-paper">
                <Placeholder className="aspect-square w-full" />
                <div className="p-4">
                  <p className="font-medium text-ink">{tip.title}</p>
                  <p className="mt-1 text-sm text-muted">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-line-soft/60 px-5 py-4 text-sm text-muted">
            Tu imagen es privada y solo tú puedes verla. NuraVision entrega una{' '}
            <strong className="text-ink">orientación estética</strong>, no un diagnóstico médico.
          </div>

          <Button className="mt-8" onClick={() => setStep('upload')}>
            Continuar
          </Button>
        </>
      )}

      {step === 'upload' && (
        <>
          <button onClick={() => setStep('prepare')} className="mt-6 text-sm text-muted hover:text-ink">
            ← Cambiar enfoque
          </button>
          <h1 className="mt-2 font-serif-display text-4xl text-ink">Sube tu fotografía</h1>
          <p className="mt-3 text-sm text-muted">
            Analizaremos{' '}
            {focus === 'manos' ? 'manos y uñas' : focus === 'piel' ? 'tono de piel' : 'cuero cabelludo'}.
          </p>

          {simulatedError && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#e6c9c0] bg-danger-soft px-5 py-4 text-sm text-danger">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {simulatedError === 'imagen_invalida'
                ? 'No pudimos leer esta imagen. Intenta con una foto en formato JPG o PNG, con buena luz.'
                : 'El servicio de análisis no está disponible en este momento. Intenta nuevamente en unos minutos.'}
            </div>
          )}

          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-paper px-6 py-16 text-center hover:border-olive-400">
            <Upload className="h-6 w-6 text-muted" />
            <span className="text-sm text-ink">
              {fileName ?? 'Arrastra tu foto aquí o haz clic para subirla'}
            </span>
            <span className="text-xs text-muted-light">JPG o PNG · máx. 10 MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setSimulatedError(null)
                setFileName(e.target.files?.[0]?.name ?? null)
              }}
            />
          </label>

          <Button
            className="mt-8"
            disabled={!fileName || !!simulatedError || analyzing}
            onClick={() => {
              setAnalyzing(true)
              setTimeout(() => {
                setAnalyzing(false)
                setStep('result')
              }, 1100)
            }}
          >
            {analyzing ? 'Analizando…' : 'Analizar fotografía'}
          </Button>
        </>
      )}

      {step === 'result' && (
        <>
          <h1 className="mt-6 font-serif-display text-4xl text-ink">Tu orientación está lista</h1>
          <p className="mt-3 max-w-xl text-sm text-muted">
            A partir de tu fotografía, esto es lo que NuraVision observó y los servicios del
            catálogo que podrían acompañarte.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <Placeholder
              variant="lavender"
              label={FOCUS_OPTIONS.find((f) => f.value === focus)?.label}
              className="aspect-square w-full rounded-2xl"
            />
            <div>
              <Kicker>Servicios recomendados</Kicker>
              <div className="mt-3 space-y-3">
                {recommended.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-line-soft bg-paper p-4"
                  >
                    <div>
                      <p className="font-medium text-ink">{s.name}</p>
                      <p className="text-xs text-muted">
                        {s.durationMin} min · {formatPrice(s.price)}
                      </p>
                    </div>
                    <Link
                      to={`/servicios/${s.id}`}
                      className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-ivory"
                    >
                      Ver servicio
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-line-soft/60 px-5 py-4 text-sm text-muted">
                Esta es una orientación estética basada en análisis visual, no un diagnóstico
                médico.
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              to="/reservar"
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink-soft"
            >
              Reservar un servicio
            </Link>
            <button
              onClick={() => {
                setStep('prepare')
                setFileName(null)
              }}
              className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink hover:bg-ivory"
            >
              Analizar otra foto
            </button>
          </div>
        </>
      )}
    </div>
  )
}
