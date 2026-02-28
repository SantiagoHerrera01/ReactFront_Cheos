import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

const REQUIRED_FIELDS = ['phone', 'gender', 'municipality', 'neighborhood', 'city', 'birth_date']

export const getIncompleteFields = (user) => {
  if (!user) return []
  return REQUIRED_FIELDS.filter(f => !user[f])
}

export function UserProvider({ children }) {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
  const [user, setUser]                       = useState(null)
  const [token, setToken]                     = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [profileIncomplete, setProfileIncomplete] = useState(false)

  const checkProfile = (userData) => {
    const missing = getIncompleteFields(userData)
    setProfileIncomplete(missing.length > 0)
  }

  const fetchProfile = async (savedToken) => {
    const res  = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${savedToken}`, 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    if (data.success) {
      setUser(data.data)
      checkProfile(data.data)
      return true
    }
    return false
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token')
    if (!savedToken) { setLoading(false); return }
    setToken(savedToken)
    fetchProfile(savedToken)
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [])

  const refreshUser = async () => {
    if (!token) return
    await fetchProfile(token)
  }

  const login = async ({ email, password }) => {
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }

      const accessToken = data.data.access_token
      localStorage.setItem('access_token', accessToken)
      setToken(accessToken)

      const userRes  = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const userData = await userRes.json()
      if (userRes.ok && userData.success) {
        setUser(userData.data)
        checkProfile(userData.data)
        // Devolver si el perfil está incompleto para que el caller lo sepa
        const missing = getIncompleteFields(userData.data)
        return { success: true, profileIncomplete: missing.length > 0 }
      }

      return { success: true, profileIncomplete: false }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const register = async ({ name, email, password, phone }) => {
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setProfileIncomplete(false)
    localStorage.removeItem('access_token')
  }

  // Llamar cuando el usuario cierra la alerta manualmente
  const dismissProfileAlert = () => setProfileIncomplete(false)

  return (
    <UserContext.Provider value={{
      user, setUser, token, loading,
      login, register, logout, refreshUser,
      profileIncomplete, dismissProfileAlert,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider')
  return context
}