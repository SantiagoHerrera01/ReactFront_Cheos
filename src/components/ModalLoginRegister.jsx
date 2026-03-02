import React, { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useAlert } from '../context/AlertContext'

export default function ModalLoginRegister({ open, onClose }) {
  const { login, register } = useUser()
  const { successToast } = useAlert()

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

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

    if (!form.email.trim()) {
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

  /* ================= FORGOT PASSWORD ================= */

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotError('')

    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Ingresa un correo electrónico válido')
      return
    }

    setForgotLoading(true)

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setForgotSuccess(true)
      } else {
        setForgotError(data.message || 'Error al enviar el correo')
      }
    } catch {
      setForgotError('Error de conexión. Intenta de nuevo.')
    } finally {
      setForgotLoading(false)
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

        {mode === 'forgot' ? (
          <>
            <h2 className="mb-2 text-center text-2xl font-bold">
              Recuperar contraseña
            </h2>
            <p className="mb-4 text-center text-sm text-gray-500">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
            </p>

            {forgotSuccess ? (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-green-600 mb-4">
                  Si el correo está registrado, recibirás un email con instrucciones para restablecer tu contraseña.
                </p>
                <button
                  onClick={() => {
                    setMode('login')
                    setForgotSuccess(false)
                    setForgotEmail('')
                  }}
                  className="font-semibold text-coffee hover:underline text-sm"
                >
                  Volver a iniciar sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-sm">Correo electrónico</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setForgotError('') }}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee/50"
                    placeholder="tu@correo.com"
                  />
                  {forgotError && (
                    <p className="text-xs text-red-500 mt-1">{forgotError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full rounded-lg bg-coffee py-2 text-white hover:bg-coffee/90 disabled:opacity-60"
                >
                  {forgotLoading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
            )}

            {!forgotSuccess && (
              <p className="mt-4 text-center text-sm">
                <button
                  onClick={() => {
                    setMode('login')
                    setForgotError('')
                    setForgotEmail('')
                  }}
                  className="font-semibold text-coffee hover:underline"
                >
                  Volver a iniciar sesión
                </button>
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="mb-4 text-center text-2xl font-bold">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>

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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputClass('password')} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot')
                      setErrors({})
                      setForgotEmail(form.email)
                    }}
                    className="text-xs text-coffee hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

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
          </>
        )}
      </div>
    </div>
  )
}