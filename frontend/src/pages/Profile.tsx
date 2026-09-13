import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/shared/state/AppState'
import { useToast } from '@/shared/state/Toast'
import { Avatar, Button, Card, Kicker } from '@/shared/ui/ui'
import { loyaltySummary } from '@/shared/lib/loyalty'

export default function Profile() {
  const { currentUser, bookings } = useAppState()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '')
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [phone, setPhone] = useState(currentUser?.phone ?? '')

  const loyalty = useMemo(
    () => loyaltySummary(bookings.filter((b) => b.clientName === currentUser?.name)),
    [bookings, currentUser],
  )

  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [currentUser, navigate])

  if (!currentUser) return null

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-serif-display text-5xl text-ink">Mi perfil</h1>

      <div className="mt-8 flex items-center gap-4">
        <Avatar initials={currentUser.initials} />
        <div>
          <p className="font-medium text-ink">{currentUser.name}</p>
          {currentUser.clientSince && (
            <p className="text-sm text-muted">Cliente desde {currentUser.clientSince}</p>
          )}
        </div>
      </div>

      {currentUser.role === 'cliente' && (
        <Card className="mt-8 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Kicker>Cliente registrado</Kicker>
              <p className="mt-2 font-serif-display text-4xl text-ink">
                {loyalty.points.toLocaleString('es-CL')}{' '}
                <span className="font-sans text-base font-normal text-muted">puntos</span>
              </p>
            </div>
            <p className="text-sm text-muted">
              {loyalty.completed === 0
                ? 'Acumulas puntos con cada atención completada.'
                : `De ${loyalty.completed} ${loyalty.completed === 1 ? 'atención' : 'atenciones'} completadas.`}
            </p>
          </div>
          {loyalty.missed > 0 && (
            <p className="mt-4 border-t border-line-soft pt-4 text-sm text-muted">
              Dejaste de sumar <span className="text-ink">{loyalty.missed} puntos</span> en reservas
              hechas sin iniciar sesión. Reserva con tu cuenta para que cuenten.
            </p>
          )}
        </Card>
      )}

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          toast({ title: 'Perfil actualizado' })
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre" value={firstName} onChange={setFirstName} />
          <Field label="Apellido" value={lastName} onChange={setLastName} />
        </div>
        <Field label="Correo" value={email} onChange={setEmail} />
        <Field label="Teléfono" value={phone} onChange={setPhone} />

        <div className="rounded-2xl bg-line-soft/60 p-6">
          <Kicker>Privacidad de imágenes</Kicker>
          <p className="mt-2 text-sm text-muted">
            Las fotografías que subes al análisis con IA son privadas: solo tú puedes verlas. No se
            muestran a profesionales ni a otros clientes, y puedes eliminarlas en cualquier
            momento.
          </p>
          <button
            type="button"
            className="mt-3 rounded-full border border-[#e6c9c0] px-4 py-2 text-sm text-danger hover:bg-danger-soft"
          >
            Eliminar mis imágenes
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-ink"
      />
    </div>
  )
}
