import { useState } from 'react'
import { Button } from '../../components/ui'

export default function AdminSettings() {
  const [name, setName] = useState('Estudio Nura')
  const [address, setAddress] = useState('Av. Libertad 1250, Viña del Mar')
  const [phone, setPhone] = useState('+56 9 1234 5678')
  const [hours, setHours] = useState('Mar a Sáb · 10:00-19:00')
  const [saved, setSaved] = useState(false)

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Configuración</h1>
      <p className="mt-2 text-sm text-muted">Datos generales del negocio.</p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        }}
      >
        <Field label="Nombre del negocio" value={name} onChange={setName} />
        <Field label="Dirección" value={address} onChange={setAddress} />
        <Field label="Teléfono" value={phone} onChange={setPhone} />
        <Field label="Horario de atención" value={hours} onChange={setHours} />
        <div className="flex items-center gap-4">
          <Button type="submit">Guardar cambios</Button>
          {saved && <span className="text-sm text-olive-700">Cambios guardados.</span>}
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
