import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Package, ShoppingBag, Users, BarChart3, Home, LayoutDashboard } from 'lucide-react'

import OrdersPanel from '../components/dashboard/OrdersPanel'
import SummaryPanel from '../components/dashboard/SummaryPanel'
import SalesPanel from '../components/dashboard/SalesPanel'
import BuyersPanel from '../components/dashboard/BuyersPanel'
import ProductsPanel from '../components/dashboard/ProductsPanel'

export default function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState('summary')

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') navigate('/')
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-black text-white p-5 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-[#A67C52]">
          Panel Empresarial
        </h2>

        <SidebarButton icon={<LayoutDashboard size={18} />} label="Resumen" active={tab === 'summary'} onClick={() => setTab('summary')} />
        <SidebarButton icon={<ShoppingBag size={18} />} label="Pedidos" active={tab === 'orders'} onClick={() => setTab('orders')} />
        <SidebarButton icon={<BarChart3 size={18} />} label="Ventas" active={tab === 'sales'} onClick={() => setTab('sales')} />
        <SidebarButton icon={<Users size={18} />} label="Clientes" active={tab === 'buyers'} onClick={() => setTab('buyers')} />
        <SidebarButton icon={<Package size={18} />} label="Productos" active={tab === 'products'} onClick={() => setTab('products')} />

        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#A67C52] text-white font-semibold hover:bg-[#8f6846] transition shadow-md"
        >
          <Home size={18} /> Volver a la tienda
        </button>
      </aside>

      <main className="flex-1 p-8">
        {tab === 'summary' && <SummaryPanel />}
        {tab === 'orders' && <OrdersPanel />}
        {tab === 'sales' && <SalesPanel />}
        {tab === 'buyers' && <BuyersPanel />}
        {tab === 'products' && <ProductsPanel />}
      </main>
    </div>
  )
}

function SidebarButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 p-2 rounded w-full transition ${
        active ? 'bg-white/10 text-[#A67C52]' : 'hover:bg-white/10'
      }`}
    >
      {icon} {label}
    </button>
  )
}