import { useMemo, useState } from 'react'
import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useAppState } from '../../state/AppState'
import { useToast } from '../../state/Toast'
import { Modal, ConfirmDialog } from '../../components/Modal'
import { Button, FilterPills } from '../../components/ui'
import { SelectField, TextField } from '../../components/form'
import { formatLongDate } from '../../lib/format'
import type { AppUser, Role } from '../../types'

type Draft = Omit<AppUser, 'id' | 'createdAt'>

/** Los únicos roles que NuraVision reconoce (EP01-HU04 CA02). */
const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'administrador', label: 'Administrador' },
]

const ROLE_STYLES: Record<Role, string> = {
  cliente: 'border-line bg-ivory text-muted',
  profesional: 'border-olive-300 bg-olive-50 text-olive-700',
  administrador: 'border-[#d9c7b2] bg-[#f6efe4] text-[#8a6a3d]',
}

const EMPTY_DRAFT: Draft = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'cliente',
  active: true,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AdminUsers() {
  const { users, professionals, addUser, updateUser, deleteUser, findUserByEmail } = useAppState()
  const { toast } = useToast()
  const [filter, setFilter] = useState<Role | 'todos'>('todos')
  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null)
  const [deleting, setDeleting] = useState<AppUser | null>(null)

  const visible = useMemo(
    () => (filter === 'todos' ? users : users.filter((u) => u.role === filter)),
    [users, filter],
  )

  const counts = useMemo(
    () => ({
      todos: users.length,
      ...Object.fromEntries(
        ROLE_OPTIONS.map((r) => [r.value, users.filter((u) => u.role === r.value).length]),
      ),
    }),
    [users],
  ) as Record<Role | 'todos', number>

  function openNew() {
    setEditing({ draft: { ...EMPTY_DRAFT } })
  }

  function openEdit(user: AppUser) {
    const { id: _id, createdAt: _createdAt, ...draft } = user
    setEditing({ id: user.id, draft })
  }

  function handleSave(draft: Draft, id?: string) {
    if (id) {
      updateUser(id, draft)
      toast({ title: 'Usuario actualizado', description: `${draft.firstName} ${draft.lastName}` })
    } else {
      addUser(draft)
      toast({ title: 'Usuario creado', description: `${draft.firstName} ${draft.lastName}` })
    }
    setEditing(null)
  }

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl text-ink">Usuarios y roles</h1>
          <p className="mt-1 text-sm text-muted">
            Administra quién accede a NuraVision y con qué permisos.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <div className="mt-6">
        <FilterPills
          options={[
            { value: 'todos', label: `Todos (${counts.todos})` },
            ...ROLE_OPTIONS.map((r) => ({
              value: r.value,
              label: `${r.label} (${counts[r.value] ?? 0})`,
            })),
          ]}
          value={filter}
          onChange={(v) => setFilter(v as Role | 'todos')}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line-soft bg-paper">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line-soft bg-ivory/60 text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-4 font-medium">Usuario</th>
              <th className="px-6 py-4 font-medium">Contacto</th>
              <th className="px-6 py-4 font-medium">Rol</th>
              <th className="px-6 py-4 font-medium">Registro</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {visible.map((u) => (
              <tr
                key={u.id}
                className={`transition-colors hover:bg-ivory/70 ${u.active ? '' : 'opacity-55'}`}
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-ink">
                    {u.firstName} {u.lastName}
                  </p>
                  {u.professionalId && (
                    <p className="text-xs text-muted">
                      Ficha: {professionals.find((p) => p.id === u.professionalId)?.name ?? '—'}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-ink">{u.email}</p>
                  <p className="text-xs text-muted">{u.phone || '—'}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${ROLE_STYLES[u.role]}`}
                  >
                    {u.role === 'administrador' && <ShieldCheck className="h-3.5 w-3.5" />}
                    {ROLE_OPTIONS.find((r) => r.value === u.role)?.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted first-letter:uppercase">
                  {formatLongDate(u.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      updateUser(u.id, { active: !u.active })
                      toast({
                        title: u.active ? 'Usuario desactivado' : 'Usuario activado',
                        description: `${u.firstName} ${u.lastName}`,
                        tone: u.active ? 'info' : 'success',
                      })
                    }}
                    aria-pressed={u.active}
                    aria-label={`${u.active ? 'Desactivar' : 'Activar'} a ${u.firstName} ${u.lastName}`}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      u.active
                        ? 'border-olive-300 bg-olive-50 text-olive-700 hover:bg-olive-100'
                        : 'border-line bg-ivory text-muted hover:bg-line-soft'
                    }`}
                  >
                    {u.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      aria-label={`Editar a ${u.firstName} ${u.lastName}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ivory"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleting(u)}
                      aria-label={`Eliminar a ${u.firstName} ${u.lastName}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted">
                  No hay usuarios con este rol.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <UserFormModal
          key={editing.id ?? 'nuevo'}
          initial={editing.draft}
          title={editing.id ? 'Editar usuario' : 'Nuevo usuario'}
          emailTaken={(email) => Boolean(findUserByEmail(email, editing.id))}
          onClose={() => setEditing(null)}
          onSave={(draft) => handleSave(draft, editing.id)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return
          deleteUser(deleting.id)
          toast({
            title: 'Usuario eliminado',
            description: `${deleting.firstName} ${deleting.lastName}`,
            tone: 'info',
          })
        }}
        title="Eliminar usuario"
        confirmLabel="Eliminar"
        description={
          <>
            Se eliminará la cuenta de{' '}
            <strong className="text-ink">
              {deleting?.firstName} {deleting?.lastName}
            </strong>
            . Sus reservas anteriores se conservan. Si solo quieres impedirle el acceso, desactívalo
            en vez de eliminarlo.
          </>
        }
      />
    </div>
  )
}

function UserFormModal({
  initial,
  title,
  emailTaken,
  onClose,
  onSave,
}: {
  initial: Draft
  title: string
  emailTaken: (email: string) => boolean
  onClose: () => void
  onSave: (draft: Draft) => void
}) {
  const [draft, setDraft] = useState<Draft>(initial)
  const [showErrors, setShowErrors] = useState(false)

  const errors = useMemo(() => {
    const next: Partial<Record<keyof Draft, string>> = {}
    if (!draft.firstName.trim()) next.firstName = 'El nombre es obligatorio.'
    if (!draft.lastName.trim()) next.lastName = 'El apellido es obligatorio.'
    if (!draft.email.trim()) next.email = 'El correo es obligatorio.'
    else if (!EMAIL_RE.test(draft.email.trim())) next.email = 'El formato del correo no es válido.'
    else if (emailTaken(draft.email)) next.email = 'Ya existe una cuenta con este correo.'
    return next
  }, [draft, emailTaken])

  const hasErrors = Object.keys(errors).length > 0

  return (
    <Modal open title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nombre"
            value={draft.firstName}
            onChange={(firstName) => setDraft({ ...draft, firstName })}
            error={showErrors ? errors.firstName : undefined}
          />
          <TextField
            label="Apellido"
            value={draft.lastName}
            onChange={(lastName) => setDraft({ ...draft, lastName })}
            error={showErrors ? errors.lastName : undefined}
          />
        </div>
        <TextField
          label="Correo electrónico"
          value={draft.email}
          onChange={(email) => setDraft({ ...draft, email })}
          error={showErrors ? errors.email : undefined}
        />
        <TextField
          label="Teléfono"
          value={draft.phone}
          onChange={(phone) => setDraft({ ...draft, phone })}
        />
        <SelectField
          label="Rol"
          value={draft.role}
          onChange={(role) => setDraft({ ...draft, role })}
          options={ROLE_OPTIONS}
          hint="Define a qué funcionalidades puede acceder."
        />
        <label className="flex items-center gap-3 rounded-xl border border-line-soft bg-ivory px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            className="h-4 w-4 accent-olive-600"
          />
          <span className="text-ink">Cuenta activa</span>
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            setShowErrors(true)
            if (hasErrors) return
            onSave({
              ...draft,
              firstName: draft.firstName.trim(),
              lastName: draft.lastName.trim(),
              email: draft.email.trim(),
              phone: draft.phone.trim(),
            })
          }}
        >
          Guardar
        </Button>
      </div>
    </Modal>
  )
}
