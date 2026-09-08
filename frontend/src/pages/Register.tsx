import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { Button } from '../components/ui'

export default function Register() {
  const { login } = useAppState()
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="min-h-screen bg-ivory px-6 py-16">
      <div className="mx-auto max-w-xl">
      <Link to="/login" className="mb-10 flex items-center gap-2 text-sm text-muted hover:text-ink">
        ← Iniciar sesión
      </Link>

      <h1 className="font-serif-display text-4xl text-ink">Crea tu cuenta</h1>
      <p className="mt-3 text-sm text-muted">Reserva más rápido y guarda tu historial.</p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          login('cliente')
          navigate('/')
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre" defaultValue="Camila" />
          <Field label="Apellido" defaultValue="Torres" />
        </div>
        <Field label="Correo electrónico" defaultValue="camila.torres@correo.cl" />
        <Field label="Teléfono" defaultValue="+56 9 8765 4321" />
        <div>
          <Field label="Contraseña" type="password" defaultValue="Nura2026!" />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span>• Mínimo 8 caracteres</span>
            <span>• Una mayúscula</span>
            <span>• Un número</span>
          </div>
        </div>
        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-line"
          />
          Acepto los términos y la política de privacidad. Entiendo que las imágenes que suba al
          análisis serán privadas y visibles solo para mí.
        </label>
        <Button type="submit" full disabled={!accepted}>
          Crear cuenta
        </Button>
      </form>
      </div>
    </div>
  )
}

function Field({
  label,
  type = 'text',
  defaultValue,
}: {
  label: string
  type?: string
  defaultValue?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-ink"
      />
    </div>
  )
}
