import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export function UserProvider({ children }) {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🧩 Reconstruir usuario desde localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("access_token")

    if (!savedToken) {
      setLoading(false)
      return
    }

    setToken(savedToken)

    fetch(`${API_BASE}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${savedToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data)
        } else {
          logout()
        }
      })
      .catch(() => logout())
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

      // Guardar token en localStorage
      const accessToken = data.data.access_token
      localStorage.setItem("access_token", accessToken)
      setToken(accessToken)

      // Obtener perfil del usuario
      const userRes = await fetch(`${API_BASE}/users/me`, {
        method: "GET",
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })

      const userData = await userRes.json()
      if (userRes.ok && userData.success) setUser(userData.data)

      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // 🆕 Register
  const register = async ({ name, email, password, phone }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
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
    localStorage.removeItem("access_token")
  }

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
