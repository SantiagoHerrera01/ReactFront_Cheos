import { useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext'
import CoffeeLoader from '../../components/Coffeeloader'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value || 0)

export default function SummaryPanel() {
  const { token, logout } = useUser()
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) logout()
        return res.json()
      })
      .then(res => setData(res.data))
  }, [token])

  if (!data) return <CoffeeLoader variant="pour" message="Cargando resumen..." />

  const { current_month, current_year, top_products } = data

  return (
    <div className="space-y-6">

      {/* KPIs principales */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Card
          title="Ingresos del mes"
          value={formatCOP(current_month?.revenue)}
          sub={`${current_month?.orders ?? 0} pedidos`}
          color="text-emerald-600"
        />
        <Card
          title="Ticket promedio"
          value={formatCOP(current_month?.average_ticket)}
          sub="por pedido este mes"
        />
        <Card
          title="Ingresos del año"
          value={formatCOP(current_year?.revenue)}
          sub={`${current_year?.orders ?? 0} pedidos`}
          color="text-blue-600"
        />
        <Card
          title="Nuevos compradores"
          value={current_month?.new_buyers ?? 0}
          sub="este mes"
          color="text-coffee"
        />
      </div>

      {/* Top productos */}
      {top_products?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h3 className="font-bold text-neutral-800 text-sm sm:text-base mb-4">
            🏆 Productos más vendidos
          </h3>
          <div className="space-y-3">
            {top_products.map((product, i) => {
              const maxQty = top_products[0]?.quantity ?? 1
              const pct = Math.round((product.quantity / maxQty) * 100)
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">#{i + 1}</span>
                      <span className="text-neutral-700 font-medium truncate">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400">{product.quantity} uds</span>
                      <span className="font-semibold text-neutral-900">{formatCOP(product.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-coffee h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

function Card({ title, value, sub, color = "text-neutral-900" }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 leading-tight">{title}</p>
      <h2 className={`text-lg sm:text-2xl font-bold mt-1 ${color}`}>{value}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}