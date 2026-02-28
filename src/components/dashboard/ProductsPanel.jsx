import { useEffect, useState } from "react"
import { useUser } from "../../context/UserContext"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import CoffeeLoader from "../../components/Coffeeloader"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value || 0)

export default function ProductsPanel() {
  const { token } = useUser()
  const [monthly, setMonthly] = useState(null)
  const [yearly, setYearly]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!token) return

    const now   = new Date()
    const year  = now.getFullYear()
    const month = now.getMonth() + 1

    const loadProducts = async () => {
      try {
        const [monthlyRes, yearlyRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/products/monthly?year=${year}&month=${month}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/dashboard/products/yearly?year=${year}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const monthlyData = await monthlyRes.json()
        const yearlyData  = await yearlyRes.json()

        if (!monthlyRes.ok) throw new Error(monthlyData.message || "Error productos mes")
        if (!yearlyRes.ok)  throw new Error(yearlyData.message  || "Error productos año")

        setMonthly(monthlyData.data)
        setYearly(yearlyData.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [token])

  if (loading) return <CoffeeLoader variant="grinder" message="Cargando productos..." />
  if (error)   return <p className="text-red-500 p-4">❌ {error}</p>

  const monthName = MONTH_NAMES[(monthly?.month ?? 1) - 1]

  // all_products: { uuid: { name, quantity, revenue, orders } } → array
  const allProductsArray = monthly?.all_products
    ? Object.values(monthly.all_products).sort((a, b) => b.quantity - a.quantity)
    : []

  const allProductsYearly = yearly?.all_products
    ? Object.values(yearly.all_products).sort((a, b) => b.quantity - a.quantity)
    : []

  // Gráfica: comparar productos entre sí en el mes
  const chartData = allProductsArray.map(p => ({
    name: p.name?.trim().slice(0, 14) || "Producto",
    unidades: p.quantity ?? 0,
    ingresos: p.revenue ?? 0,
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">📦 Productos</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <KPI
          title="Unidades vendidas (mes)"
          value={allProductsArray.reduce((s, p) => s + (p.quantity ?? 0), 0)}
          sub={monthName}
          color="text-coffee"
        />
        <KPI
          title="Ingresos (mes)"
          value={formatCOP(allProductsArray.reduce((s, p) => s + (p.revenue ?? 0), 0))}
          sub={monthName}
          color="text-emerald-600"
        />
        <KPI
          title="Unidades vendidas (año)"
          value={allProductsYearly.reduce((s, p) => s + (p.quantity ?? 0), 0)}
          sub={`${yearly?.year}`}
          color="text-blue-600"
        />
        <KPI
          title="Ingresos (año)"
          value={formatCOP(allProductsYearly.reduce((s, p) => s + (p.revenue ?? 0), 0))}
          sub={`${yearly?.year}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Gráfica de barras por producto */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <h3 className="font-bold text-neutral-800 text-sm sm:text-base mb-4">
            Unidades vendidas por producto — {monthName}
          </h3>
          {chartData.length > 0 ? (
            <div className="h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={32} />
                  <Tooltip
                    formatter={(v, name) => [name === "ingresos" ? formatCOP(v) : v, name]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="unidades" fill="#7c4a1e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos este mes</p>
          )}
        </div>

        {/* Top productos del mes */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow space-y-4">
          <h3 className="font-bold text-neutral-800 text-sm sm:text-base">
            🏆 Más vendidos — {monthName} {monthly?.year}
          </h3>
          {allProductsArray.length > 0 ? (
            <div className="space-y-3">
              {allProductsArray.map((p, i) => {
                const max = allProductsArray[0]?.quantity ?? 1
                const pct = Math.round((p.quantity / max) * 100)
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">#{i + 1}</span>
                        <span className="text-neutral-700 font-medium truncate">{p.name?.trim()}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-400">{p.quantity} uds</span>
                        <span className="font-semibold text-neutral-900">{formatCOP(p.revenue)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-coffee h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin productos este mes</p>
          )}

          {/* Menos vendidos */}
          {monthly?.least_sold?.length > 0 && (
            <div className="pt-3 border-t border-dashed border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Menos vendidos
              </p>
              <div className="space-y-1">
                {monthly.least_sold.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate">{p.product_name?.trim()}</span>
                    <span className="text-gray-400 flex-shrink-0 ml-2">{p.total_quantity} uds</span>
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

function KPI({ title, value, sub, color = "text-neutral-900" }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 leading-tight">{title}</p>
      <p className={`text-lg sm:text-xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}