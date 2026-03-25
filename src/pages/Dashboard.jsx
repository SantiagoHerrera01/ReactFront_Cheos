import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Package, ShoppingBag, Users, BarChart3, Boxes,
  Home, LayoutDashboard, Coffee, ChevronRight, Menu, X,
} from 'lucide-react'

import OrdersPanel    from '../components/dashboard/OrdersPanel'
import InventoryPanel from '../components/dashboard/Inventorypanel'
import SummaryPanel   from '../components/dashboard/SummaryPanel'
import SalesPanel     from '../components/dashboard/SalesPanel'
import BuyersPanel    from '../components/dashboard/BuyersPanel'
import ProductsPanel  from '../components/dashboard/ProductsPanel'

const NAV = [
  { id: 'summary',   label: 'Resumen',    icon: LayoutDashboard },
  { id: 'orders',    label: 'Pedidos',    icon: ShoppingBag },
  { id: 'sales',     label: 'Ventas',     icon: BarChart3 },
  { id: 'buyers',    label: 'Clientes',   icon: Users },
  { id: 'products',  label: 'Productos',  icon: Package },
  { id: 'inventory', label: 'Inventario', icon: Boxes },
]

export default function Dashboard() {
  const { user } = useUser()
  const navigate  = useNavigate()
  const [tab,         setTab]         = useState('summary')
  const [visible,     setVisible]     = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') navigate('/')
    else requestAnimationFrame(() => setVisible(true))
  }, [user, navigate])

  const handleTab = (id) => {
    setTab(id)
    setSidebarOpen(false)
  }

  if (!user) return null

  const active = NAV.find(n => n.id === tab)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#C9A84C,#8B6914)', boxShadow: '0 2px 8px rgba(201,168,76,0.25)' }}
        >
          <Coffee size={15} style={{ color: '#0a0a0a' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm text-white tracking-wide leading-tight">Cheos Café</p>
          <p className="text-[9px] font-semibold tracking-[0.18em] uppercase mt-0.5" style={{ color: 'rgba(201,168,76,0.5)' }}>
            Panel empresarial
          </p>
        </div>
        {/* Botón cerrar — solo en drawer móvil */}
        <button
          className="lg:hidden ml-auto w-7 h-7 flex items-center justify-center rounded-lg transition"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onClick={() => setSidebarOpen(false)}
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p
          className="text-[9px] font-semibold tracking-[0.22em] uppercase px-3 pb-2"
          style={{ color: 'rgba(255,255,255,0.18)' }}
        >
          Menu
        </p>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTab(id)}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all text-left"
            style={
              tab === id
                ? { color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }
                : { color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }
            }
            onMouseEnter={e => {
              if (tab !== id) {
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }
            }}
            onMouseLeave={e => {
              if (tab !== id) {
                e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <Icon size={14} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-xs font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#C9A84C'
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'
            e.currentTarget.style.background = 'rgba(201,168,76,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Home size={13} /> Volver a la tienda
        </button>
      </div>
    </>
  )

  return (
    <div
      className="flex min-h-screen bg-gray-50 text-gray-900 font-sans transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >

      {/* ── Overlay backdrop móvil ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar desktop (lg+) — sticky, siempre visible ── */}
      <aside
        className="hidden lg:flex w-56 flex-shrink-0 flex-col sticky top-0 h-screen"
        style={{ background: '#0a0a0a', borderRight: '1px solid rgba(201,168,76,0.12)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Drawer sidebar móvil/tablet (< lg) ── */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 flex flex-col lg:hidden
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: '#0a0a0a', borderRight: '1px solid rgba(201,168,76,0.12)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <div
          className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-7 bg-white"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 1px 0 rgba(201,168,76,0.08)' }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger solo en móvil/tablet */}
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="hidden sm:inline">Panel</span>
              <ChevronRight size={11} className="hidden sm:inline" />
              <span className="text-gray-700 font-semibold">{active?.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <span
              className="text-[9px] font-bold tracking-[0.14em] uppercase rounded px-2 py-0.5"
              style={{ color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}
            >
              Admin
            </span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#8B6914)', color: '#0a0a0a' }}
            >
              {user?.name?.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'AD'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-gray-50">
          <div className="mb-4 sm:mb-6">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-coffee mb-1">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 tracking-tight leading-tight">
              {active?.label}
            </h1>
          </div>

          {tab === 'summary'   && <SummaryPanel />}
          {tab === 'orders'    && <OrdersPanel />}
          {tab === 'sales'     && <SalesPanel />}
          {tab === 'buyers'    && <BuyersPanel />}
          {tab === 'products'  && <ProductsPanel />}
          {tab === 'inventory' && <InventoryPanel />}
        </div>
      </div>
    </div>
  )
}