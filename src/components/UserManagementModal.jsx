import React, { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useUser } from '../context/UserContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export default function UserManagementModal({ onClose }) {
  const { token, user: currentUser } = useUser()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar usuarios al abrir el modal
  useEffect(() => {
    if (!token) return
    fetchUsers()
  }, [token])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Error al cargar usuarios')
      const data = await res.json()
      setUsers(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Cambiar rol
  const updateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Error al actualizar rol')
      }
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      alert('✅ Rol actualizado correctamente')
    } catch (err) {
      alert('❌ ' + err.message)
    }
  }

  // Activar/desactivar usuario
  const toggleActive = async (userId, isActive) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !isActive })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Error al actualizar estado')
      }
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !isActive } : u))
      alert(`✅ Usuario ${!isActive ? 'activado' : 'desactivado'} correctamente`)
    } catch (err) {
      alert('❌ ' + err.message)
    }
  }

  // Eliminar usuario
  const deleteUser = async (userId, userName) => {
    // No permitir eliminarse a sí mismo
    if (currentUser && currentUser.id === userId) {
      alert('❌ No puedes eliminarte a ti mismo')
      return
    }

    const confirmed = window.confirm(`¿Estás seguro de eliminar al usuario "${userName}"?\n\nEsta acción NO se puede deshacer.`)
    if (!confirmed) return

    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Error al eliminar usuario')
      }
      setUsers(users.filter(u => u.id !== userId))
      alert('✅ Usuario eliminado correctamente')
    } catch (err) {
      alert('❌ ' + err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-4xl p-6 relative max-h-[80vh] overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5"/>
        </button>
        <h2 className="text-xl font-bold mb-4">Gestión de Usuarios</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full table-auto border border-gray-200">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Rol</th>
                  <th className="px-4 py-2 border">Estado</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={`text-center ${!u.is_active ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-2 border">{u.name}</td>
                    <td className="px-4 py-2 border text-sm">{u.email}</td>
                    <td className="px-4 py-2 border">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className={`border rounded px-2 py-1 ${u.role === 'ADMIN' ? 'bg-amber-100 font-semibold' : ''}`}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-sm ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className={`px-3 py-1 rounded text-sm ${u.is_active ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}
                        >
                          {u.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay usuarios registrados</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
