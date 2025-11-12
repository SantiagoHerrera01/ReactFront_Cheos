import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export function UserProvider({ children }) {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🧩 Reconstruir usuario desde cookie
  useEffect(() => {
    const savedToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1]

    if (!savedToken) {
      setLoading(false)
      return
    }

    setToken(savedToken)

    fetch(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${savedToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.data)
        else {
          setUser(null)
          setToken(null)
          document.cookie = 'access_token=; Max-Age=0; path=/'
        }
      })
      .catch(() => {
        setUser(null)
        setToken(null)
        document.cookie = 'access_token=; Max-Age=0; path=/'
      })
      .finally(() => setLoading(false))
  }, [])

  // 🔐 Login
  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }

      setToken(data.data.access_token)
      document.cookie = `access_token=${data.data.access_token}; path=/; samesite=lax`

      const userRes = await fetch(`${API_BASE}/users/me`, {
        headers: { 'Authorization': `Bearer ${data.data.access_token}` }
      })
      const userData = await userRes.json()
      if (userRes.ok && userData.success) setUser(userData.data)

      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // 🆕 Register (agregado)
  const register = async ({ name, email, password, phone }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
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

  // 🚪 Logout
  const logout = () => {
    setUser(null)
    setToken(null)
    document.cookie = 'access_token=; Max-Age=0; path=/'
  }

  // 📦 Contexto completo
  return (
    <UserContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider')
  return context
}
