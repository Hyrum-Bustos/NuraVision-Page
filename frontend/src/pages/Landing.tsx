import { Link } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { categoryLabel } from '../data/seed'
import { AppImage, Kicker, LinkButton } from '../components/ui'
import { Reveal } from '../components/Reveal'
import { formatPrice } from '../lib/format'

const STEPS = [
  {
    n: '01',
    title: 'Elige tu servicio',
    desc: 'Explora el catálogo con duración y precio a la vista.',
  },
  {
    n: '02',
    title: 'Elige profesional',
    desc: 'Solo verás a quienes realizan ese servicio.',
  },
  {
    n: '03',
    title: 'Selecciona horario',
    desc: 'Únicamente los bloques realmente disponibles.',
  },
  {
    n: '04',
    title: 'Confirma',
    desc: 'Revisa el resumen y recibe tu confirmación al instante.',
  },
]

export default function Landing() {
  const { activeServices: services, professionals, siteContent, nextSlotsFor } = useAppState()

  const featured = services.slice(0, 4)
  const firstProfessional = professionals[0]
  const nextSlot = firstProfessional ? nextSlotsFor(firstProfessional, { count: 1 })[0] : undefined

  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-olive-700">
            <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
            Análisis visual con IA
          </span>
          <h1 className="mt-6 font-serif-display text-5xl leading-[1.05] text-ink sm:text-6xl">
            Reserva tu próxima <em className="italic text-olive-700">experiencia</em> de belleza
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            Elige tu servicio, tu profesional y tu horario en menos de un minuto. Y si no sabes por
            dónde empezar, deja que NuraVision analice una fotografía y te oriente.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton to="/reservar">Reservar ahora</LinkButton>
            <LinkButton to="/servicios" variant="outline">
              Conocer servicios
            </LinkButton>
          </div>
          <div className="mt-12 flex gap-10 border-t border-line-soft pt-8">
            <Stat value={String(services.length)} label="servicios" />
            <Stat value={String(professionals.length)} label="profesionales" />
            <Stat value="24/7" label="agenda en línea" />
          </div>
        </div>

        <div className="animate-fade-up relative [animation-delay:120ms]">
          <AppImage
            src={siteContent.heroImage}
            label={siteContent.heroCaption}
            alt="Estudio Nura"
            className="aspect-[4/5] w-full rounded-2xl"
          />
          {firstProfessional && nextSlot && (
            <div className="animate-fade-up absolute bottom-6 left-6 w-56 rounded-xl border border-line-soft bg-paper p-4 shadow-sm [animation-delay:320ms]">
              <Kicker>Próxima hora libre</Kicker>
              <p className="mt-2 text-sm font-medium text-ink">{firstProfessional.name}</p>
              <p className="text-sm text-muted">{nextSlot.label.replace(' ', ' · ')}</p>
            </div>
          )}
        </div>
      </section>

      <Reveal>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>Servicios destacados</Kicker>
            <h2 className="mt-2 font-serif-display text-4xl text-ink">Cuidado que se nota</h2>
          </div>
          <Link
            to="/servicios"
            className="group text-sm font-medium text-ink transition-colors hover:text-olive-700"
          >
            Ver catálogo completo{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((s) => (
            <Link
              key={s.id}
              to={`/servicios/${s.id}`}
              className="card-hover overflow-hidden rounded-2xl border border-line-soft bg-paper"
            >
              <AppImage
                src={s.imageUrl}
                label={s.name.split(' ')[0].toUpperCase()}
                alt={s.name}
                className="aspect-square w-full"
              />
              <div className="p-5">
                <Kicker>{categoryLabel(s.category)}</Kicker>
                <h3 className="mt-1 font-serif-display text-xl text-ink">{s.name}</h3>
                <p className="mt-2 text-sm text-muted">
                  {s.durationMin} min · {formatPrice(s.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center">
        <AppImage
          src={siteContent.aiTeaserImage}
          label={siteContent.aiTeaserCaption}
          alt="Análisis con NuraVision IA"
          variant="lavender"
          className="aspect-square w-full rounded-2xl"
        />
        <div>
          <Kicker>NuraVision IA</Kicker>
          <h2 className="mt-3 font-serif-display text-4xl leading-tight text-ink">
            Una fotografía. Una orientación clara.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Sube o captura una imagen de tus manos, uñas, piel o cuero cabelludo. NuraVision
            identifica características visuales y te sugiere servicios de nuestro catálogo que
            podrían acompañarte.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink">
            {[
              ...siteContent.aiFocusOptions.map((option) => option.label),
              'Recomendación de servicios del catálogo',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-line-soft/60 px-5 py-4 text-sm text-muted">
            NuraVision entrega una orientación estética basada en análisis visual.{' '}
            <strong className="text-ink">No constituye un diagnóstico médico</strong> ni reemplaza la
            evaluación de un profesional de la salud.
          </div>
          <LinkButton to="/analisis-ia" variant="olive" className="mt-6">
            Probar el análisis
          </LinkButton>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <Kicker className="text-white/50">Cómo funciona</Kicker>
          <div className="stagger mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.n} className={`pl-6 ${i > 0 ? 'border-l border-white/15' : ''}`}>
                <p className="font-serif-display text-3xl text-white/30">{step.n}</p>
                <h3 className="mt-3 text-lg font-medium text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-white/55">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>El equipo</Kicker>
            <h2 className="mt-2 font-serif-display text-4xl text-ink">Quién te atiende</h2>
          </div>
          <Link
            to="/profesionales"
            className="group text-sm font-medium text-ink transition-colors hover:text-olive-700"
          >
            Ver profesionales{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {professionals.map((p) => (
            <Link key={p.id} to={`/profesionales/${p.id}`} className="zoom-media group">
              <AppImage
                src={p.imageUrl}
                label="Retrato"
                alt={p.name}
                className="aspect-[3/4] w-full rounded-2xl"
              />
              <p className="mt-3 font-serif-display text-lg text-ink">{p.name}</p>
              <p className="text-sm text-muted">{p.role}</p>
            </Link>
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-serif-display text-4xl text-ink sm:text-5xl">Tu hora te está esperando</h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted">
          Agenda en línea, confirma al instante y recibe tu recordatorio.
        </p>
        <LinkButton to="/reservar" className="mt-8">
          Reservar ahora
        </LinkButton>
      </section>
      </Reveal>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif-display text-3xl text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
