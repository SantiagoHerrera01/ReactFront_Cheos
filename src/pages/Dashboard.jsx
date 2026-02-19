import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Package, ShoppingBag, Users, BarChart3, Home } from 'lucide-react'

import OrdersPanel from '../components/dashboard/OrdersPanel'

export default function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/')
    }
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-5 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-[#A67C52]">
          Panel Empresarial
        </h2>

        <button
          onClick={() => setTab('orders')}
          className={`flex items-center gap-2 p-2 rounded w-full transition ${
            tab === 'orders' ? 'bg-white/10 text-[#A67C52]' : 'hover:bg-white/10'
          }`}
        >
          <ShoppingBag size={18} /> Pedidos
        </button>

        <button
          onClick={() => setTab('inventory')}
          className={`flex items-center gap-2 p-2 rounded w-full transition ${
            tab === 'inventory' ? 'bg-white/10 text-[#A67C52]' : 'hover:bg-white/10'
          }`}
        >
          <Package size={18} /> Inventario
        </button>

        <button
          onClick={() => setTab('sales')}
          className={`flex items-center gap-2 p-2 rounded w-full transition ${
            tab === 'sales' ? 'bg-white/10 text-[#A67C52]' : 'hover:bg-white/10'
          }`}
        >
          <BarChart3 size={18} /> Ventas
        </button>

        <button
          onClick={() => setTab('customers')}
          className={`flex items-center gap-2 p-2 rounded w-full transition ${
            tab === 'customers' ? 'bg-white/10 text-[#A67C52]' : 'hover:bg-white/10'
          }`}
        >
          <Users size={18} /> Clientes
        </button>

        {/* Botón un poquito más abajo */}
        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#A67C52] text-white font-semibold hover:bg-[#8f6846] transition shadow-md"
        >
          <Home size={18} /> Volver a la tienda
        </button>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-8">
        {tab === 'orders' && <OrdersPanel />}
        {tab === 'inventory' && <h1 className="text-2xl font-bold">Inventario</h1>}
        {tab === 'sales' && <h1 className="text-2xl font-bold">Ventas</h1>}
        {tab === 'customers' && <h1 className="text-2xl font-bold">Clientes</h1>}
      </main>
    </div>
  )
}
