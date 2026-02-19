import { useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext'

export default function OrdersPanel() {
  const { token, logout } = useUser()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return

    fetch(`${API_BASE}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        if (res.status === 401) {
          logout()
          throw new Error('No autorizado')
        }

        const data = await res.json()

        // ✅ TU ESTRUCTURA REAL
        if (data.success && Array.isArray(data.data?.orders)) {
          setOrders(data.data.orders)
        } else {
          setOrders([])
        }
      })
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar los pedidos')
        setOrders([])
      })
      .finally(() => setLoading(false))
  }, [token])

  if (!token) return <p className="text-gray-500">Debes iniciar sesión</p>
  if (loading) return <p className="text-gray-500">Cargando pedidos...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No hay pedidos registrados.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3 text-left">Orden</th>
                <th className="p-3 text-left">Cliente</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{order.order_number}</td>
                  <td className="p-3">{order.customer_name || '—'}</td>
                  <td className="p-3">{order.customer_email || '—'}</td>
                  <td className="p-3 font-semibold">
                    ${order.total?.toLocaleString()}
                  </td>
                  <td className="p-3 text-[#A67C52] font-bold">
                    {order.status}
                  </td>
                  <td className="p-3">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
