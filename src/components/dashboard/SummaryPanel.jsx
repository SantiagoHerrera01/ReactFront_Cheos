import { useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext'
import CoffeeLoader from '../../components/Coffeeloader'
import { TrendingUp, ShoppingBag, Calendar, Users } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const fmt = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0)

function KpiCard({ icon: Icon, label, value, sub, iconBg, iconColor, valueClass }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-1 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${iconBg}`}>
        <Icon size={14} className={iconColor} />
      </div>
      <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400">{label}</p>
      <p className={`font-display font-bold text-2xl leading-tight ${valueClass}`}>{value}</p>
      <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  )
}

export default function SummaryPanel() {
  const { token, logout } = useUser()
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.status === 401) logout(); return r.json() })
      .then(r => setData(r.data))
  }, [token])

  if (!data) return <CoffeeLoader variant="pour" message="Cargando resumen..." />

  const { current_month, current_year, top_products } = data

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard icon={TrendingUp}  label="Ingresos del mes"    value={fmt(current_month?.revenue)}        sub={`${current_month?.orders ?? 0} pedidos`}  iconBg="bg-emerald-50" iconColor="text-emerald-600" valueClass="text-emerald-600" />
        <KpiCard icon={ShoppingBag} label="Ticket promedio"     value={fmt(current_month?.average_ticket)} sub="por pedido este mes"                       iconBg="bg-amber-50"   iconColor="text-amber-600"   valueClass="text-amber-600" />
        <KpiCard icon={Calendar}    label="Ingresos del año"    value={fmt(current_year?.revenue)}         sub={`${current_year?.orders ?? 0} pedidos`}    iconBg="bg-blue-50"    iconColor="text-blue-600"    valueClass="text-blue-600" />
        <KpiCard icon={Users}       label="Nuevos compradores"  value={current_month?.new_buyers ?? 0}     sub="este mes"                                  iconBg="bg-coffee/10"  iconColor="text-coffee"      valueClass="text-coffee" />
      </div>

      {top_products?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="font-display font-bold text-base text-gray-900">Productos más vendidos</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="space-y-4">
            {top_products.map((p, i) => {
              const pct = Math.round((p.quantity / (top_products[0]?.quantity ?? 1)) * 100)
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-gray-300 w-5 flex-shrink-0">#{i + 1}</span>
                      <span className="text-gray-700 font-medium truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[11px] text-gray-400">{p.quantity} uds</span>
                      <span className="font-semibold text-gray-900">{fmt(p.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-1 bg-coffee rounded-full transition-all" style={{ width: `${pct}%` }} />
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