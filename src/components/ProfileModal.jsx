import { useEffect, useState, useRef } from 'react'
import { X, User, Lock, Mail } from 'lucide-react'
import { useUser } from '../context/UserContext'

function SearchableSelect({ value, onChange, options, placeholder }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const filtered = options.filter(opt =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedLabel = options.find(o => o.name === value)?.name || ''

  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className="w-full border p-2 rounded cursor-pointer flex justify-between items-center bg-white"
        onClick={() => setOpen(o => !o)}
      >
        <span className={selectedLabel ? 'text-black' : 'text-gray-400'}>
          {selectedLabel || placeholder}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>

      {open && (
        <div className="absolute z-50 w-full bg-white border rounded shadow-lg mt-1">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full p-2 border-b text-sm outline-none"
          />
          <ul className="max-h-48 overflow-y-auto">
            <li
              className="p-2 hover:bg-gray-100 cursor-pointer text-gray-400 text-sm"
              onClick={() => { onChange(''); setSearch(''); setOpen(false) }}
            >
              {placeholder}
            </li>
            {filtered.length > 0 ? filtered.map(opt => (
              <li
                key={opt.id}
                className={`p-2 hover:bg-gray-100 cursor-pointer text-sm ${value === opt.name ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => { onChange(opt.name); setSearch(''); setOpen(false) }}
              >
                {opt.name}
              </li>
            )) : (
              <li className="p-2 text-gray-400 text-sm">Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ProfileModal({ open, onClose }) {
  const { user, token } = useUser()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

  const [tab, setTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  const [originalProfile, setOriginalProfile] = useState(null)

  const [departments, setDepartments] = useState([])
  const [cities, setCities] = useState([])

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    department: '',
    city: '',
    address: '',
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
        email: user.email || '',
        gender: user.gender || '',
        department: user.department || '',
        city: user.city || '',
        address: user.address || ''
      }
      setForm(f => ({ ...f, ...base }))
      setOriginalProfile(base)
    }
  }, [user])

  useEffect(() => {
    fetch('https://api-colombia.com/api/v1/Department')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.department) return
    const selectedDept = departments.find(d => d.name === form.department)
    if (!selectedDept) return
    fetch(`https://api-colombia.com/api/v1/Department/${selectedDept.id}/cities`)
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(() => {})
  }, [form.department, departments])

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
     form.phone !== originalProfile.phone ||
     form.gender !== originalProfile.gender ||
     form.department !== originalProfile.department ||
     form.city !== originalProfile.city ||
     form.address !== originalProfile.address)

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
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 z-10">
          <X />
        </button>

        <div className="flex flex-col md:flex-row min-h-[480px]">

          {/* Sidebar */}
          <aside className="md:w-64 border-r bg-gray-50 p-4 space-y-2 shrink-0">
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
          <section className="flex-1 p-6 overflow-y-auto max-h-[480px]">

            {/* PERFIL */}
            {tab === 'profile' && (
              <>
                <h2 className="text-xl font-bold mb-4">Datos personales</h2>

                {(!form.gender || !form.department || !form.city || !form.address) && (
                  <p className="text-sm text-yellow-600 mb-3">
                    Por favor rellenar estos datos
                  </p>
                )}

                <div className="space-y-3 max-w-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nombre completo"
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono:</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Teléfono"
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Género:</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Seleccionar género</option>
                      <option value="Hombre">Hombre</option>
                      <option value="Mujer">Mujer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento:</label>
                    <SearchableSelect
                      value={form.department}
                      onChange={val => setForm(f => ({ ...f, department: val, city: '' }))}
                      options={departments}
                      placeholder="Seleccionar departamento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad:</label>
                    <SearchableSelect
                      value={form.city}
                      onChange={val => setForm(f => ({ ...f, city: val }))}
                      options={cities}
                      placeholder="Seleccionar ciudad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección:</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Ej: Calle 10 #15-25 Barrio Centro"
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <button
                    disabled={loading || !hasProfileChanges}
                    onClick={() =>
                      handleUpdate({
                        name: form.name,
                        phone: form.phone,
                        gender: form.gender,
                        department: form.department,
                        city: form.city,
                        address: form.address
                      })
                    }
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

            {/* 🔒 SEGURIDAD */}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual:</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        placeholder="Contraseña actual"
                        className="w-full border p-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña:</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="Nueva contraseña"
                        className="w-full border p-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña:</label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={form.confirmNewPassword}
                        onChange={handleChange}
                        placeholder="Confirmar nueva contraseña"
                        className="w-full border p-2 rounded"
                      />
                    </div>

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

            {/* 📧 EMAIL */}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo correo:</label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Nuevo correo"
                        className="w-full border p-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual:</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        placeholder="Contraseña actual"
                        className="w-full border p-2 rounded"
                      />
                    </div>

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