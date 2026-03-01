import { useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import CoffeeLoader from '../../components/Coffeeloader'

const API_BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const MONTHS    = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const fmt       = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0)
const PM_LABELS = { CONTRA_ENTREGA: 'Contra entrega', TRANSFERENCIA: 'Transferencia', MERCADO_PAGO: 'MercadoPago', WOMPI: 'Wompi' }

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-coffee font-semibold mb-1">{label}</p>
      <p className="text-gray-700">{fmt(payload[0]?.value)}</p>
    </div>
  )
}

export default function SalesPanel() {
  const { token } = useUser()
  const [monthly, setMonthly] = useState(null)
  const [yearly,  setYearly]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!token) return
    const now = new Date()
    ;(async () => {
      try {
        const [mr, yr] = await Promise.all([
          fetch(`${API_BASE}/dashboard/sales/monthly?year=${now.getFullYear()}&month=${now.getMonth()+1}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/dashboard/sales/yearly?year=${now.getFullYear()}`,                            { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const md = await mr.json(), yd = await yr.json()
        if (!mr.ok) throw new Error(md.message)
        if (!yr.ok) throw new Error(yd.message)
        setMonthly(md.data); setYearly(yd.data)
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    })()
  }, [token])

  if (loading) return <CoffeeLoader variant="pour" message="Cargando ventas..." />
  if (error)   return <p className="text-red-500 p-4">❌ {error}</p>

  const chartData = yearly?.monthly_breakdown
    ? Object.entries(yearly.monthly_breakdown).sort(([a], [b]) => +a - +b)
        .map(([m, v]) => ({ name: MONTHS[+m - 1], ingresos: v.revenue ?? 0 }))
    : []

  const monthName = MONTHS[(monthly?.month ?? 1) - 1]

  const kpis = [
    { label: 'Ingresos del mes',    value: fmt(monthly?.total_revenue),  sub: `${monthly?.total_orders ?? 0} pedidos`,        cls: 'text-emerald-600' },
    { label: 'Ticket promedio',     value: fmt(monthly?.average_ticket), sub: 'por pedido',                                   cls: 'text-amber-600' },
    { label: 'Ingresos del año',    value: fmt(yearly?.total_revenue),   sub: `${yearly?.total_orders ?? 0} pedidos`,         cls: 'text-blue-600' },
    { label: 'Completados / Canc.', value: monthly?.completed_orders ?? '—', sub: `${monthly?.cancelled_orders ?? 0} cancelados`, cls: 'text-coffee' },
  ]

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map(({ label, value, sub, cls }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all">
            <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">{label}</p>
            <p className={`font-display font-bold text-2xl leading-tight mb-1 ${cls}`}>{value}</p>
            <p className="text-[11px] text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="font-display font-bold text-base text-gray-900">Ingresos por mes — {yearly?.year}</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          {chartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={38} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(120,80,40,0.04)' }} />
                  <Bar dataKey="ingresos" fill="url(#salesGrad)" radius={[4,4,0,0]} maxBarSize={36} />
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#7c4a1e" />
                      <stop offset="100%" stopColor="#c8956c" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-300 text-center py-14 text-sm italic">Sin datos anuales aún</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="font-display font-bold text-base text-gray-900">Resumen — {monthName} {monthly?.year}</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {monthly?.payment_methods && (
            <>
              <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-3">Métodos de pago</p>
              <div className="divide-y divide-gray-100 mb-5">
                {Object.entries(monthly.payment_methods).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-gray-500">{PM_LABELS[k] ?? k}</span>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{v.count ?? 0} pedidos</span>
                      <span className="font-semibold text-gray-800">{fmt(v.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-3">Otros indicadores</p>
          <div className="divide-y divide-gray-100">
            <div className="flex justify-between items-center py-2.5 text-sm">
              <span className="text-gray-500">Pedidos con descuento</span>
              <span className="font-semibold text-gray-800">{monthly?.orders_with_discount ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 text-sm">
              <span className="text-gray-500">Total descuentos</span>
              <span className="font-semibold text-gray-800">{fmt(monthly?.total_discount_given)}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 text-sm">
              <span className="text-gray-500">Pedidos pendientes</span>
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5">
                ⏳ {Math.max(0, monthly?.pending_orders ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}