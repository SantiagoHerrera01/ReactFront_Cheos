import { useEffect, useState } from "react"
import { useUser } from "../../context/UserContext"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import CoffeeLoader from "../../components/Coffeeloader"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

const formatCOP = (value) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value || 0)

const PAYMENT_LABELS = {
  CONTRA_ENTREGA: "Contra entrega",
  TRANSFERENCIA: "Transferencia",
  MERCADO_PAGO: "MercadoPago",
  WOMPI: "Wompi",
}

export default function SalesPanel() {
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

    const loadSales = async () => {
      try {
        const [monthlyRes, yearlyRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/sales/monthly?year=${year}&month=${month}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/dashboard/sales/yearly?year=${year}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const monthlyData = await monthlyRes.json()
        const yearlyData  = await yearlyRes.json()

        if (!monthlyRes.ok) throw new Error(monthlyData.message || "Error ventas mensuales")
        if (!yearlyRes.ok)  throw new Error(yearlyData.message  || "Error ventas anuales")

        setMonthly(monthlyData.data)
        setYearly(yearlyData.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [token])

  if (loading) return <CoffeeLoader variant="pour" message="Cargando analítica de ventas..." />
  if (error)   return <p className="text-red-500 p-4">❌ {error}</p>

  // monthly_breakdown: { "02": { revenue, orders } } → array para Recharts
  const chartData = yearly?.monthly_breakdown
    ? Object.entries(yearly.monthly_breakdown)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([monthNum, values]) => ({
          name:     MONTH_NAMES[Number(monthNum) - 1] ?? `Mes ${monthNum}`,
          ingresos: values.revenue ?? 0,
          pedidos:  values.orders  ?? 0,
        }))
    : []

    console.log("monthly completo:", monthly)
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">📈 Panel de Ventas</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <KPI
          title="Ingresos del mes"
          value={formatCOP(monthly?.total_revenue)}
          sub={`${monthly?.total_orders ?? 0} pedidos`}
          color="text-emerald-600"
        />
        <KPI
          title="Ticket promedio"
          value={formatCOP(monthly?.average_ticket)}
          sub="por pedido"
        />
        <KPI
          title="Ingresos del año"
          value={formatCOP(yearly?.total_revenue)}
          sub={`${yearly?.total_orders ?? 0} pedidos`}
          color="text-blue-600"
        />
        <KPI
          title="Completados / Cancelados"
          value={monthly?.completed_orders ?? "—"}
          sub={`${monthly?.cancelled_orders ?? 0} cancelados`}
          color="text-coffee"
        />
      </div>

      {/* Gráfica + desglose */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Gráfica anual */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4 text-neutral-800 text-sm sm:text-base">
            Ingresos por mes ({yearly?.year})
          </h3>
          {chartData.length > 0 ? (
            <div className="h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={48} />
                  <Tooltip
                    formatter={(v) => formatCOP(v)}
                    labelStyle={{ fontWeight: 600 }}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="ingresos" fill="#7c4a1e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos anuales aún</p>
          )}
        </div>

        {/* Desglose del mes */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow space-y-4">
          <h3 className="font-bold text-neutral-800 text-sm sm:text-base">
            Resumen de {MONTH_NAMES[(monthly?.month ?? 1) - 1]} {monthly?.year}
          </h3>

          {/* Métodos de pago */}
          {monthly?.payment_methods && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Métodos de pago
              </p>
              <div className="space-y-2">
                {Object.entries(monthly.payment_methods).map(([method, values]) => (
                  <div key={method} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-gray-600 truncate">
                      {PAYMENT_LABELS[method] ?? method}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {values.count ?? 0} pedidos
                      </span>
                      <span className="font-semibold text-neutral-800 whitespace-nowrap">
                        {formatCOP(values.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
            <Row label="Pedidos con descuento"  value={monthly?.orders_with_discount ?? 0} />
            <Row label="Total descuentos dados" value={formatCOP(monthly?.total_discount_given)} />
            <Row label="Pedidos pendientes"     value={Math.max(0, monthly?.pending_orders ?? 0)} />
          </div>
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

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm gap-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-neutral-800 flex-shrink-0">{value}</span>
    </div>
  )
}