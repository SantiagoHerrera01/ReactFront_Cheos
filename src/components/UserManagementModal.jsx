import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useUser } from '../context/UserContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export default function UserManagementModal({ onClose }) {
  const { token } = useUser()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar usuarios al abrir el modal
  useEffect(() => {
    if (!token) return

    setLoading(true)
    fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar usuarios')
        return res.json()
      })
      .then(data => setUsers(data.data || [])) // Ajusta según tu API
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  // Cambiar rol
  const updateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })
      if (!res.ok) throw new Error('Error al actualizar rol')
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      alert(err.message)
    }
  }

  // Activar/desactivar usuario
  const toggleActive = async (userId, isActive) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !isActive })
      })
      if (!res.ok) throw new Error('Error al actualizar estado')
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !isActive } : u))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-3xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5"/>
        </button>
        <h2 className="text-xl font-bold mb-4">Gestión de Usuarios</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Rol</th>
                  <th className="px-4 py-2 border">Activo</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="text-center">
                    <td className="px-4 py-2 border">{u.name}</td>
                    <td className="px-4 py-2 border">{u.email}</td>
                    <td className="px-4 py-2 border">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 border">
                      {u.is_active ? 'Sí' : 'No'}
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => toggleActive(u.id, u.is_active)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
