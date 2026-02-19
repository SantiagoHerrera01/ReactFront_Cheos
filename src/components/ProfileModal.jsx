import { useEffect, useState } from 'react'
import { X, User, Lock, Mail } from 'lucide-react'
import { useUser } from '../context/UserContext'

export default function ProfileModal({ open, onClose }) {
  const { user, token } = useUser()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

  const [tab, setTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  const [originalProfile, setOriginalProfile] = useState(null)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })

  const [passwordError, setPasswordError] = useState(null)

  useEffect(() => {
    if (user) {
      const base = {
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }

      setForm(f => ({ ...f, ...base }))
      setOriginalProfile(base)
    }
  }, [user])

  useEffect(() => {
    setMsg(null)
    setPasswordError(null)
  }, [tab])

  if (!open) return null

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const hasProfileChanges =
    originalProfile &&
    (form.name !== originalProfile.name ||
     form.phone !== originalProfile.phone)

  const handleUpdate = async payload => {
    setLoading(true)
    setMsg(null)

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al actualizar')

      setMsg({ type: 'ok', text: 'Cambios guardados correctamente' })
      setShowPasswordForm(false)
      setShowEmailForm(false)
      setPasswordError(null)

      setForm(f => ({
        ...f,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }))
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl overflow-hidden shadow-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 z-10">
          <X />
        </button>

        <div className="flex flex-col md:flex-row min-h-[480px]">

          {/* Sidebar */}
          <aside className="md:w-64 border-r bg-gray-50 p-4 space-y-2">
            <button
              onClick={() => setTab('profile')}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left ${
                tab === 'profile' ? 'bg-black text-white' : 'hover:bg-gray-200'
              }`}
            >
              <User size={18} /> Perfil
            </button>

            <button
              onClick={() => setTab('security')}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left ${
                tab === 'security' ? 'bg-black text-white' : 'hover:bg-gray-200'
              }`}
            >
              <Lock size={18} /> Seguridad
            </button>

            <button
              onClick={() => setTab('email')}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left ${
                tab === 'email' ? 'bg-black text-white' : 'hover:bg-gray-200'
              }`}
            >
              <Mail size={18} /> Correo
            </button>
          </aside>

          {/* Contenido */}
          <section className="flex-1 p-6">

            {/* PERFIL */}
            {tab === 'profile' && (
              <>
                <h2 className="text-xl font-bold mb-4">Datos personales</h2>

                <div className="space-y-3 max-w-sm">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                    className="w-full border p-2 rounded"
                  />

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Teléfono"
                    className="w-full border p-2 rounded"
                  />

                  <button
                    disabled={loading || !hasProfileChanges}
                    onClick={() => handleUpdate({ name: form.name, phone: form.phone })}
                    className={`px-4 py-2 rounded ${
                      loading || !hasProfileChanges
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-black/90'
                    }`}
                  >
                    Guardar cambios
                  </button>
                </div>
              </>
            )}

            {/* SEGURIDAD */}
            {tab === 'security' && (
              <>
                <h2 className="text-xl font-bold mb-4">Seguridad</h2>

                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="border px-4 py-2 rounded hover:bg-gray-100"
                  >
                    Cambiar contraseña
                  </button>
                ) : (
                  <div className="space-y-3 max-w-sm">
                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Contraseña actual"
                      className="w-full border p-2 rounded"
                    />

                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="Nueva contraseña"
                      className="w-full border p-2 rounded"
                    />

                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={form.confirmNewPassword}
                      onChange={handleChange}
                      placeholder="Confirmar nueva contraseña"
                      className="w-full border p-2 rounded"
                    />

                    {passwordError && (
                      <p className="text-red-600 text-sm">{passwordError}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        disabled={loading}
                        onClick={() => {
                          if (!form.newPassword) {
                            setPasswordError('La nueva contraseña es obligatoria')
                            return
                          }

                          if (form.newPassword !== form.confirmNewPassword) {
                            setPasswordError('Las contraseñas no coinciden')
                            return
                          }

                          handleUpdate({
                            current_password: form.currentPassword,
                            new_password: form.newPassword
                          })
                        }}
                        className="bg-black text-white px-4 py-2 rounded"
                      >
                        Confirmar
                      </button>

                      <button
                        onClick={() => setShowPasswordForm(false)}
                        className="border px-4 py-2 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* EMAIL */}
            {tab === 'email' && (
              <>
                <h2 className="text-xl font-bold mb-4">Correo electrónico</h2>

                {!showEmailForm ? (
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="border px-4 py-2 rounded hover:bg-gray-100"
                  >
                    Cambiar correo
                  </button>
                ) : (
                  <div className="space-y-3 max-w-sm">
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Nuevo correo"
                      className="w-full border p-2 rounded"
                    />

                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Contraseña actual"
                      className="w-full border p-2 rounded"
                    />

                    <div className="flex gap-2">
                      <button
                        disabled={loading}
                        onClick={() => {
                          if (form.email === user.email) {
                            setMsg({ type: 'error', text: 'El correo es el mismo, no hay cambios' })
                            return
                          }

                          handleUpdate({
                            email: form.email,
                            current_password: form.currentPassword
                          })
                        }}
                        className="bg-black text-white px-4 py-2 rounded"
                      >
                        Confirmar
                      </button>

                      <button
                        onClick={() => setShowEmailForm(false)}
                        className="border px-4 py-2 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {msg && (
              <p className={`mt-4 ${msg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                {msg.text}
              </p>
            )}

            {user?.role === 'ADMIN' && (
              <p className="mt-6 text-xs text-gray-400">Rol: ADMIN</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
