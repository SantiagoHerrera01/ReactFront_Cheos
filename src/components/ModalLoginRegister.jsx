import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useAlert } from '../context/AlertContext'

export default function ModalLoginRegister({ open, onClose }) {
  const { login, register } = useUser()
  const { successToast } = useAlert()

  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  if (!open) return null

  /* ================= VALIDACIONES ================= */

  const validate = (serverError = '') => {
    const newErrors = {}

    if (mode === 'register') {
      if (!form.name.trim()) {
        newErrors.name = 'El nombre es obligatorio'
      } else if (/\d/.test(form.name)) {
        newErrors.name = 'El nombre no puede contener números'
      }

      if (!form.phone) {
        newErrors.phone = 'El teléfono es obligatorio'
      } else if (!/^3\d{9}$/.test(form.phone)) {
        newErrors.phone = 'Teléfono inválido (10 dígitos en Colombia)'
      }
    }

    if (!form.email) {
      newErrors.email = 'El correo es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Correo electrónico inválido'
    } else if (serverError === 'EMAIL_EXISTS') {
      newErrors.email = 'Este correo ya está registrado'
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (mode === 'register') {
      if (form.password.length < 8)
        newErrors.password = 'Debe tener mínimo 8 caracteres'
      else if (!/[A-Z]/.test(form.password))
        newErrors.password = 'Debe tener al menos una mayúscula'
      else if (!/[0-9]/.test(form.password))
        newErrors.password = 'Debe tener al menos un número'
      else if (!/[!@#$%^&*]/.test(form.password))
        newErrors.password = 'Debe tener un carácter especial'
    } else if (serverError === 'INVALID_PASSWORD') {
      newErrors.password = 'La contraseña es incorrecta'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ================= HANDLERS ================= */

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      if (mode === 'login') {
        const res = await login({
          email: form.email,
          password: form.password,
        })

        if (!res?.success) {
          validate('INVALID_PASSWORD')
          return
        }

        successToast('Inicio de sesión exitoso')
        onClose()
      } else {
        const res = await register(form)

        if (!res?.success) {
          validate('EMAIL_EXISTS')
          return
        }

        // ✅ MENSAJE SIMPLE EN EL FORM (NO ALERTA)
        setSuccessMessage('Usuario registrado correctamente. Inicia sesión.')

        setMode('login')
        setForm({
          name: '',
          email: form.email,
          password: form.password,
          phone: '',
        })
        setErrors({})
      }
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  const inputClass = field =>
    `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-300'
        : 'focus:ring-coffee/50'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-center text-2xl font-bold">
          {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>

        {/* ✅ MENSAJE DE ÉXITO EN FORM */}
        {successMessage && mode === 'login' && (
          <p className="mb-4 text-center text-sm text-green-600">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-sm">Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass('name')}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass('phone')}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="text-sm">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={inputClass('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-coffee py-2 text-white hover:bg-coffee/90 disabled:opacity-60"
          >
            {loading
              ? 'Procesando...'
              : mode === 'login'
              ? 'Iniciar sesión'
              : 'Registrarse'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => {
                  setMode('register')
                  setErrors({})
                  setSuccessMessage('')
                }}
                className="font-semibold text-coffee hover:underline"
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => {
                  setMode('login')
                  setErrors({})
                }}
                className="font-semibold text-coffee hover:underline"
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
