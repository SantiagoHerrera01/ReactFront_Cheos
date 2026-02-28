import { useEffect, useState, useRef } from 'react'
import { X, User, Lock, Mail, AlertCircle, ChevronDown, Check } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useAlert } from '../context/AlertContext'
import CoffeeLoader from './Coffeeloader'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const ANTIOQUIA_ID = 2

// ─── Helpers para campos nullable del backend ─────────────────────────────────
// El backend devuelve *string → puede llegar como null en JSON
// Al leer: null/undefined → ''
// Al enviar: '' → null, string con valor → string
const fromNullable = (v) => v ?? ''
const toNullable   = (v) => (v && v.trim() !== '') ? v.trim() : null

/* ─── SearchableSelect ────────────────────────────────────────────────────── */
function SearchableSelect({ value, onChange, options, placeholder, disabled, loading: loadingOpts }) {
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(false)
  const ref = useRef(null)

  const filtered      = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
  const selectedLabel = value || ''

  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled || loadingOpts}
        onClick={() => !(disabled || loadingOpts) && setOpen(o => !o)}
        className={[
          'w-full border rounded-lg px-3 py-2.5 flex justify-between items-center bg-white text-sm transition-all',
          disabled || loadingOpts
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
            : 'hover:border-gray-400 cursor-pointer border-gray-300',
          open ? 'border-gray-800 ring-1 ring-gray-800' : ''
        ].join(' ')}
      >
        <span className={selectedLabel ? 'text-gray-800' : 'text-gray-400'}>
          {loadingOpts ? 'Cargando...' : (selectedLabel || placeholder)}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 overflow-hidden">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full px-3 py-2 border-b border-gray-100 text-sm outline-none"
          />
          <ul className="max-h-48 overflow-y-auto">
            <li
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-400 text-sm"
              onClick={() => { onChange(''); setSearch(''); setOpen(false) }}
            >
              {placeholder}
            </li>
            {filtered.length > 0 ? filtered.map((opt, i) => (
              <li
                key={i}
                className={`px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between gap-2
                  ${value === opt ? 'font-medium text-gray-900' : 'text-gray-700'}`}
                onClick={() => { onChange(opt); setSearch(''); setOpen(false) }}
              >
                <span>{opt}</span>
                {value === opt && <Check size={13} className="flex-shrink-0 text-gray-700" />}
              </li>
            )) : (
              <li className="px-3 py-3 text-gray-400 text-sm text-center">Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ─── Field ───────────────────────────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} className="flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}

function TextInput({ hasError, ...props }) {
  return (
    <input
      className={[
        'w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white',
        'focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800',
        'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
        'transition-all placeholder:text-gray-400',
        hasError ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
      ].join(' ')}
      {...props}
    />
  )
}

/* ─── Password strength ───────────────────────────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*]/.test(password),
  ].filter(Boolean).length

  const colors  = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']
  const labels  = ['Muy debil', 'Debil', 'Regular', 'Fuerte']
  const txColor = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-emerald-600']

  return (
    <div className="space-y-1.5 mt-1.5">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score-1] : 'bg-gray-200'}`} />
        ))}
      </div>
      {score > 0 && <p className={`text-xs font-medium ${txColor[score-1]}`}>{labels[score-1]}</p>}
    </div>
  )
}

/* ─── Profile completion ──────────────────────────────────────────────────── */
function ProfileCompletion({ form }) {
  const fields = [form.name, form.phone, form.gender, form.municipality, form.neighborhood, form.city, form.birth_date]
  const filled = fields.filter(Boolean).length
  const pct    = Math.round((filled / fields.length) * 100)
  const color  = pct < 50 ? 'bg-red-400' : pct < 100 ? 'bg-yellow-400' : 'bg-emerald-500'

  return (
    <div className="rounded-lg border border-gray-200 px-4 py-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Perfil completado</span>
        <span className="text-xs font-semibold text-gray-700">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {pct < 100 && (
        <p className="text-xs text-gray-400">Completa tu perfil para una mejor experiencia de compra</p>
      )}
    </div>
  )
}

const TABS = [
  { id: 'profile',  label: 'Perfil',    icon: User },
  { id: 'security', label: 'Seguridad', icon: Lock },
  { id: 'email',    label: 'Correo',    icon: Mail },
]

/* ─── ProfileModal ────────────────────────────────────────────────────────── */
export default function ProfileModal({ open, onClose }) {
  const { user, token, refreshUser } = useUser()
  const { successToast, errorAlert }  = useAlert()

  const [tab, setTab]                           = useState('profile')
  const [loading, setLoading]                   = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEmailForm, setShowEmailForm]       = useState(false)
  const [originalProfile, setOriginalProfile]   = useState(null)
  const [passwordError, setPasswordError]       = useState(null)

  const [municipios, setMunicipios]             = useState([])
  const [barrios, setBarrios]                   = useState([])
  const [loadingMunicipios, setLoadingMunicipios] = useState(false)
  const [loadingBarrios, setLoadingBarrios]       = useState(false)

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    gender: '', municipality: '', neighborhood: '', city: '',
    birth_date: '',
    // campos de seguridad (no se guardan en perfil)
    currentPassword: '', newPassword: '', confirmNewPassword: '',
  })

  // ── Poblar form desde user ─────────────────────────────────────────────────
  // CLAVE: los campos nullable del backend vienen como null en JSON.
  // fromNullable los convierte a '' para que los inputs sean controlados.
  const buildFormFromUser = (u) => ({
    name:         u.name                   || '',
    phone:        u.phone                  || '',
    email:        u.email                  || '',
    gender:       fromNullable(u.gender),        // *Gender → string | ''
    municipality: fromNullable(u.municipality),  // *string → string | ''
    neighborhood: fromNullable(u.neighborhood),  // *string → string | ''
    city:         fromNullable(u.city),          // *string → string | ''
    birth_date:   fromNullable(u.birth_date),    // *string → string | ''
  })

  useEffect(() => {
    if (!user) return
    const base = buildFormFromUser(user)
    setForm(f => ({ ...f, ...base }))
    setOriginalProfile(base)
  }, [user])

  // ── Municipios de Antioquia ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    setLoadingMunicipios(true)
    fetch(`https://api-colombia.com/api/v1/Department/${ANTIOQUIA_ID}/cities`)
      .then(r => r.json())
      .then(data => setMunicipios(data.map(c => c.name).sort()))
      .catch(() => {})
      .finally(() => setLoadingMunicipios(false))
  }, [open])

  // ── Barrios según municipio ────────────────────────────────────────────────
  useEffect(() => {
    if (!form.municipality) { setBarrios([]); return }
    setLoadingBarrios(true)
    fetch(`https://api-colombia.com/api/v1/Department/${ANTIOQUIA_ID}/cities`)
      .then(r => r.json())
      .then(data => {
        const city = data.find(c => c.name === form.municipality)
        if (!city) { setBarrios([]); return }
        return fetch(`https://api-colombia.com/api/v1/City/${city.id}/neighborhoods`)
          .then(r => r.ok ? r.json() : [])
          .then(neighborhoods => {
            if (Array.isArray(neighborhoods) && neighborhoods.length > 0) {
              setBarrios(neighborhoods.map(n => n.name || n).sort())
            } else {
              setBarrios([])
            }
          })
      })
      .catch(() => setBarrios([]))
      .finally(() => setLoadingBarrios(false))
  }, [form.municipality])

  // ── Scroll lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => { setPasswordError(null) }, [tab])

  if (!open) return null

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const hasProfileChanges = originalProfile && (
    form.name         !== originalProfile.name         ||
    form.phone        !== originalProfile.phone        ||
    form.gender       !== originalProfile.gender       ||
    form.municipality !== originalProfile.municipality ||
    form.neighborhood !== originalProfile.neighborhood ||
    form.city         !== originalProfile.city         ||
    form.birth_date   !== originalProfile.birth_date
  )

  // ── PUT /users/me ──────────────────────────────────────────────────────────
  const handleUpdate = async (payload) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al actualizar')

      await refreshUser()
      successToast('Cambios guardados correctamente')
      setShowPasswordForm(false)
      setShowEmailForm(false)
      setPasswordError(null)
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmNewPassword: '' }))

      // Actualizar originalProfile para que hasProfileChanges se resetee
      if ('name' in payload || 'municipality' in payload) {
        const updated = buildFormFromUser({
          ...user,
          name:         form.name,
          phone:        form.phone,
          gender:       payload.gender,          // ya viene como null o string
          municipality: payload.municipality,
          neighborhood: payload.neighborhood,
          city:         payload.city,
          birth_date:   payload.birth_date,
        })
        setOriginalProfile(updated)
      }
    } catch (err) {
      errorAlert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Guardar perfil ─────────────────────────────────────────────────────────
  // CLAVE: toNullable convierte '' → null para que el backend reciba *string correctamente
  const handleSaveProfile = () => {
    handleUpdate({
      name:         form.name         || undefined,
      phone:        form.phone        || undefined,
      gender:       toNullable(form.gender),        // '' → null, 'MALE' → 'MALE'
      municipality: toNullable(form.municipality),  // '' → null, 'Medellín' → 'Medellín'
      neighborhood: toNullable(form.neighborhood),
      city:         toNullable(form.city),
      birth_date:   toNullable(form.birth_date),
    })
  }

  const handleSavePassword = () => {
    if (!form.currentPassword)                              { setPasswordError('Ingresa tu contrasena actual'); return }
    if (!form.newPassword)                                  { setPasswordError('Ingresa la nueva contrasena'); return }
    if (form.newPassword !== form.confirmNewPassword)       { setPasswordError('Las contrasenas no coinciden'); return }
    setPasswordError(null)
    handleUpdate({ current_password: form.currentPassword, new_password: form.newPassword })
  }

  const handleSaveEmail = () => {
    if (form.email === user?.email) { errorAlert('El correo es el mismo'); return }
    if (!form.currentPassword)      { errorAlert('Ingresa tu contrasena actual para confirmar'); return }
    handleUpdate({ email: form.email, current_password: form.currentPassword })
  }

  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col sm:flex-row overflow-hidden relative"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >

        {/* X esquina superior derecha */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition shadow-sm border border-gray-200"
        >
          <X size={15} />
        </button>

        {/* Sidebar */}
        <aside className="w-full sm:w-52 border-b sm:border-b-0 sm:border-r border-gray-100 flex sm:flex-col flex-row flex-shrink-0 bg-gray-50">
          <div className="hidden sm:block px-4 pt-5 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm mb-3">
              {initials}
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate pr-8">{user?.name || 'Mi cuenta'}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
            {user?.role === 'ADMIN' && (
              <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-600 tracking-widest uppercase">
                Admin
              </span>
            )}
          </div>

          <nav className="flex sm:flex-col flex-row w-full sm:p-2 sm:gap-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={[
                  'flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all text-left flex-1 sm:flex-none sm:rounded-md',
                  tab === id
                    ? 'text-gray-900 bg-white border-b-2 sm:border-b-0 border-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                ].join(' ')}
              >
                <Icon size={14} className="flex-shrink-0" />
                <span className="text-xs sm:text-sm">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <section className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          <div className="flex-1 p-5 sm:p-7">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[220px]">
                <CoffeeLoader variant="cup" message="Guardando cambios..." size="sm" />
              </div>
            ) : (
              <>

                {/* ── PERFIL ── */}
                {tab === 'profile' && (
                  <div className="space-y-4 max-w-sm">
                    <h2 className="text-base font-semibold text-gray-900">Datos personales</h2>
                    <ProfileCompletion form={form} />

                    <Field label="Nombre completo">
                      <TextInput name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre completo" autoComplete="name" />
                    </Field>

                    <Field label="Telefono">
                      <TextInput name="phone" value={form.phone} onChange={handleChange} placeholder="3XX XXX XXXX" type="tel" autoComplete="tel" />
                    </Field>

                    <Field label="Fecha de nacimiento">
                      <TextInput name="birth_date" value={form.birth_date} onChange={handleChange} type="date" />
                    </Field>

                    <Field label="Genero">
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full border border-gray-300 hover:border-gray-400 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-all"
                      >
                        <option value="">Seleccionar genero</option>
                        <option value="MALE">Hombre</option>
                        <option value="FEMALE">Mujer</option>
                        <option value="OTHER">Otro</option>
                      </select>
                    </Field>

                    <Field label="Municipio (Antioquia)">
                      <SearchableSelect
                        value={form.municipality}
                        onChange={val => setForm(f => ({ ...f, municipality: val, neighborhood: '' }))}
                        options={municipios}
                        placeholder="Seleccionar municipio"
                        loading={loadingMunicipios}
                      />
                    </Field>

                    <Field label="Barrio">
                      {barrios.length > 0 ? (
                        <SearchableSelect
                          value={form.neighborhood}
                          onChange={val => setForm(f => ({ ...f, neighborhood: val }))}
                          options={barrios}
                          placeholder="Seleccionar barrio"
                          disabled={!form.municipality}
                          loading={loadingBarrios}
                        />
                      ) : (
                        <TextInput
                          name="neighborhood"
                          value={form.neighborhood}
                          onChange={handleChange}
                          placeholder={form.municipality ? 'Escribe tu barrio' : 'Primero selecciona municipio'}
                          disabled={!form.municipality}
                        />
                      )}
                    </Field>

                    <Field label="Direccion">
                      <TextInput
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Ej: Calle 10 #15-25"
                        autoComplete="street-address"
                      />
                    </Field>

                    <button
                      disabled={!hasProfileChanges}
                      onClick={handleSaveProfile}
                      className={[
                        'w-full py-2.5 rounded-lg text-sm font-semibold transition-all',
                        hasProfileChanges
                          ? 'bg-gray-900 text-white hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      ].join(' ')}
                    >
                      {hasProfileChanges ? 'Guardar cambios' : 'Sin cambios pendientes'}
                    </button>
                  </div>
                )}

                {/* ── SEGURIDAD ── */}
                {tab === 'security' && (
                  <div className="space-y-4 max-w-sm">
                    <h2 className="text-base font-semibold text-gray-900">Seguridad</h2>

                    {!showPasswordForm ? (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="w-full border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:border-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all font-medium"
                      >
                        Cambiar contrasena
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <Field label="Contrasena actual">
                          <TextInput type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} placeholder="..." autoComplete="current-password" />
                        </Field>
                        <Field label="Nueva contrasena">
                          <TextInput type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="..." autoComplete="new-password" />
                          <PasswordStrength password={form.newPassword} />
                        </Field>
                        <Field label="Confirmar contrasena" error={passwordError}>
                          <TextInput type="password" name="confirmNewPassword" value={form.confirmNewPassword} onChange={handleChange} placeholder="..." autoComplete="new-password" hasError={!!passwordError} />
                        </Field>
                        <div className="flex gap-2 pt-1">
                          <button onClick={handleSavePassword} className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition">
                            Confirmar
                          </button>
                          <button onClick={() => { setShowPasswordForm(false); setPasswordError(null) }} className="px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── EMAIL ── */}
                {tab === 'email' && (
                  <div className="space-y-4 max-w-sm">
                    <h2 className="text-base font-semibold text-gray-900">Correo electronico</h2>

                    <div className="rounded-lg border border-gray-200 px-4 py-3">
                      <p className="text-xs text-gray-400 mb-0.5">Correo actual</p>
                      <p className="text-sm font-medium text-gray-800 break-all">{user?.email}</p>
                    </div>

                    {!showEmailForm ? (
                      <button
                        onClick={() => setShowEmailForm(true)}
                        className="w-full border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:border-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all font-medium"
                      >
                        Cambiar correo
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                          <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700">Necesitas tu contrasena actual para confirmar el cambio.</p>
                        </div>
                        <Field label="Nuevo correo">
                          <TextInput name="email" value={form.email} onChange={handleChange} placeholder="nuevo@correo.com" type="email" autoComplete="email" />
                        </Field>
                        <Field label="Contrasena actual">
                          <TextInput type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} placeholder="..." autoComplete="current-password" />
                        </Field>
                        <div className="flex gap-2 pt-1">
                          <button onClick={handleSaveEmail} className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition">
                            Confirmar
                          </button>
                          <button onClick={() => { setShowEmailForm(false); setForm(f => ({ ...f, currentPassword: '' })) }} className="px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </>
            )}
          </div>

          {/* Footer solo mobile */}
          <div className="sm:hidden border-t border-gray-100 px-5 py-3 bg-white flex-shrink-0">
            <button onClick={onClose} className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
              Cerrar
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}