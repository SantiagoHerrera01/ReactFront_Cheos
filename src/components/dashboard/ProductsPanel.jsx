import { useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import CoffeeLoader from '../../components/Coffeeloader'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const MONTHS   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const fmt      = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0)

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-coffee font-semibold mb-1">{label}</p>
      <p className="text-gray-700">{payload[0]?.value} uds</p>
    </div>
  )
}

export default function ProductsPanel() {
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
          fetch(`${API_BASE}/dashboard/products/monthly?year=${now.getFullYear()}&month=${now.getMonth()+1}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/dashboard/products/yearly?year=${now.getFullYear()}`,                            { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const md = await mr.json(), yd = await yr.json()
        if (!mr.ok) throw new Error(md.message)
        if (!yr.ok) throw new Error(yd.message)
        setMonthly(md.data); setYearly(yd.data)
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    })()
  }, [token])

  if (loading) return <CoffeeLoader variant="grinder" message="Cargando productos..." />
  if (error)   return <p className="text-red-500 p-4">❌ {error}</p>

  const monthName = MONTHS[(monthly?.month ?? 1) - 1]
  const allM = monthly?.all_products ? Object.values(monthly.all_products).sort((a, b) => b.quantity - a.quantity) : []
  const allY = yearly?.all_products  ? Object.values(yearly.all_products).sort((a, b) => b.quantity - a.quantity)  : []
  const chartData = allM.map(p => ({ name: (p.name?.trim() || '').slice(0, 12), unidades: p.quantity ?? 0 }))

  const kpis = [
    { label: 'Unidades (mes)',  value: allM.reduce((s, p) => s + (p.quantity ?? 0), 0),      sub: monthName,    cls: 'text-amber-600' },
    { label: 'Ingresos (mes)',  value: fmt(allM.reduce((s, p) => s + (p.revenue ?? 0), 0)),   sub: monthName,    cls: 'text-emerald-600' },
    { label: 'Unidades (año)', value: allY.reduce((s, p) => s + (p.quantity ?? 0), 0),       sub: yearly?.year, cls: 'text-blue-600' },
    { label: 'Ingresos (año)', value: fmt(allY.reduce((s, p) => s + (p.revenue ?? 0), 0)),   sub: yearly?.year, cls: 'text-coffee' },
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
            <h3 className="font-display font-bold text-base text-gray-900">Unidades por producto — {monthName}</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          {chartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={26} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(120,80,40,0.04)' }} />
                  <Bar dataKey="unidades" fill="url(#prodGrad)" radius={[4,4,0,0]} maxBarSize={36} />
                  <defs>
                    <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#7c4a1e" />
                      <stop offset="100%" stopColor="#c8956c" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-300 text-center py-14 text-sm italic">Sin datos este mes</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="font-display font-bold text-base text-gray-900">Más vendidos — {monthName}</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {allM.length > 0 ? (
            <div className="space-y-4">
              {allM.map((p, i) => {
                const pct = Math.round((p.quantity / (allM[0]?.quantity ?? 1)) * 100)
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold text-gray-300 w-5 flex-shrink-0">#{i + 1}</span>
                        <span className="text-gray-700 font-medium truncate">{p.name?.trim()}</span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="text-[11px] text-gray-400">{p.quantity} uds</span>
                        <span className="font-semibold text-gray-900">{fmt(p.revenue)}</span>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1 bg-coffee rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-300 text-sm italic">Sin productos este mes</p>
          )}

          {monthly?.least_sold?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
              <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">Menos vendidos</p>
              <div className="space-y-1.5">
                {monthly.least_sold.map((p, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-400 truncate">{p.product_name?.trim()}</span>
                    <span className="text-gray-300 flex-shrink-0 ml-2">{p.total_quantity} uds</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}