import { useState } from 'react'
import { useAppState } from '../../state/AppState'
import { getProfessionalById } from '../../data/professionals'
import { Avatar, Button } from '../../components/ui'

export default function ProProfile() {
  const { currentUser } = useAppState()
  const professional = getProfessionalById(currentUser!.professionalId!)!
  const [bio, setBio] = useState(professional.bio)
  const [phone, setPhone] = useState(currentUser!.phone)
  const [saved, setSaved] = useState(false)

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Mi perfil</h1>

      <div className="mt-6 flex items-center gap-4">
        <Avatar initials={currentUser!.initials} tone="ink" />
        <div>
          <p className="font-medium text-ink">{professional.name}</p>
          <p className="text-sm text-muted">
            {professional.role} · {professional.experienceYears} años de experiencia
          </p>
        </div>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        }}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Teléfono</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Biografía visible para clientes
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit">Guardar cambios</Button>
          {saved && <span className="text-sm text-olive-700">Cambios guardados.</span>}
        </div>
      </form>
    </div>
  )
}
