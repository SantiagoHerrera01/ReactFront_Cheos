import React, { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useAlert } from '../context/AlertContext' // 👈 IMPORTANTE

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export default function UserManagementModal({ onClose }) {
  const { token, user: currentUser } = useUser()
  const { confirmDelete, successToast, errorAlert } = useAlert() // 👈 ALERTS
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      errorAlert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Cambiar rol
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
      successToast('Rol actualizado correctamente')

    } catch (err) {
      errorAlert(err.message)
    }
  }

  // ✅ Activar / Desactivar
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
      successToast(`Usuario ${!isActive ? 'activado' : 'desactivado'} correctamente`)

    } catch (err) {
      errorAlert(err.message)
    }
  }

  // ✅ Eliminar usuario
  const deleteUser = async (userId, userName) => {

    if (currentUser && currentUser.id === userId) {
      errorAlert('No puedes eliminarte a ti mismo')
      return
    }

    const confirmed = await confirmDelete(userName)
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
      successToast('Usuario eliminado correctamente')

    } catch (err) {
      errorAlert(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start pt-20 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl p-8 relative max-h-[85vh] overflow-hidden flex flex-col border border-[#e6d5c9]">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#3b2f2f] hover:text-black transition"
        >
          <X className="w-5 h-5"/>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-[#3b2f2f] tracking-wide">
          Gestión de Usuarios
        </h2>

        {loading ? (
          <p className="text-[#3b2f2f]">Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-auto flex-1 rounded-xl border border-[#eadfd8]">

            <table className="w-full text-sm">
              <thead className="bg-[#f5ebe4] text-[#3b2f2f] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-center font-semibold">Rol</th>
                  <th className="px-4 py-3 text-center font-semibold">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {users.map(u => (
                  <tr
                    key={u.id}
                    className={`transition border-t border-[#f0e4dd] hover:bg-[#faf6f3] ${
                      !u.is_active ? 'bg-[#fff4f4]' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-[#3b2f2f] font-medium">
                      {u.name}
                    </td>

                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {u.email}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className={`border border-[#d7c2b6] rounded-lg px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-[#3b2f2f] ${
                          u.role === 'ADMIN'
                            ? 'bg-[#e8d8cc] font-semibold text-[#3b2f2f]'
                            : 'bg-white'
                        }`}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">

                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                            u.is_active
                              ? 'bg-[#e8d8cc] text-[#3b2f2f] hover:bg-[#d9c2b4]'
                              : 'bg-[#3b2f2f] text-white hover:bg-black'
                          }`}
                        >
                          {u.is_active ? 'Desactivar' : 'Activar'}
                        </button>

                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
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
              <p className="text-center text-gray-500 py-6">
                No hay usuarios registrados
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
