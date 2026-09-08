import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { AppImage, Button, Kicker } from '../components/ui'
import type { Role } from '../types'

export default function Login() {
  const { login, siteContent } = useAppState()
  const navigate = useNavigate()
  const [email, setEmail] = useState('camila.torres@correo.cl')
  const [password, setPassword] = useState('••••••••••')
  const [remember, setRemember] = useState(false)

  function enterAs(role: Role) {
    login(role)
    if (role === 'profesional') navigate('/profesional')
    else if (role === 'administrador') navigate('/admin')
    else navigate('/')
  }

  return (
    <div className="grid min-h-screen bg-ivory md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <Link to="/" className="mb-10 flex items-center gap-2 text-sm text-muted hover:text-ink">
          ← Volver al inicio
        </Link>

        <h1 className="font-serif-display text-4xl text-ink">Bienvenida de vuelta</h1>
        <p className="mt-3 text-sm text-muted">Ingresa para gestionar tus reservas y tu análisis.</p>

        <form
          className="mt-8 max-w-sm space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            enterAs('cliente')
          }}
        >
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Correo electrónico
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-ink">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-line"
              />
              Recordarme
            </label>
            <button type="button" className="text-muted underline decoration-line underline-offset-4">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <Button type="submit" full>
            Iniciar sesión
          </Button>
          <p className="text-center text-sm text-muted">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-medium text-ink underline underline-offset-4">
              Regístrate
            </Link>
          </p>
        </form>

        <div className="mt-10 max-w-sm border-t border-line-soft pt-6">
          <Kicker>Prototipo · Entrar como</Kicker>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => enterAs('cliente')}
              className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-white"
            >
              Cliente
            </button>
            <button
              onClick={() => enterAs('profesional')}
              className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-white"
            >
              Profesional
            </button>
            <button
              onClick={() => enterAs('administrador')}
              className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-white"
            >
              Administrador
            </button>
            <button
              disabled
              className="rounded-full border border-dashed border-line px-4 py-2 text-sm text-muted-light"
            >
              Estado de error
            </button>
          </div>
        </div>
      </div>

      <div className="relative hidden md:block">
        <AppImage src={siteContent.loginImage} alt="" className="h-full w-full" />
        <div className="absolute bottom-10 left-10 max-w-xs rounded-xl border border-line-soft bg-paper p-5 shadow-sm">
          <p className="font-serif-display text-xl italic leading-snug text-ink">
            "Reservar dejó de ser una conversación de WhatsApp."
          </p>
          <p className="mt-3 text-xs text-muted">Estudio Nura · Viña del Mar</p>
        </div>
      </div>
    </div>
  )
}
