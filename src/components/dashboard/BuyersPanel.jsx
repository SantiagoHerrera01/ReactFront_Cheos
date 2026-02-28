import { useEffect, useState } from "react"
import { useUser } from "../../context/UserContext"
import CoffeeLoader from "../../components/Coffeeloader"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

export default function BuyersPanel() {
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

    const loadBuyers = async () => {
      try {
        const [monthlyRes, yearlyRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/buyers/monthly?year=${year}&month=${month}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/dashboard/buyers/yearly?year=${year}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const monthlyData = await monthlyRes.json()
        const yearlyData  = await yearlyRes.json()

        if (!monthlyRes.ok) throw new Error(monthlyData.message || "Error compradores mes")
        if (!yearlyRes.ok)  throw new Error(yearlyData.message  || "Error compradores año")

        setMonthly(monthlyData.data)
        setYearly(yearlyData.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadBuyers()
  }, [token])

  if (loading) return <CoffeeLoader variant="cup" message="Cargando compradores..." />
  if (error)   return <p className="text-red-500 p-4">❌ {error}</p>

  const monthName = MONTH_NAMES[(monthly?.month ?? 1) - 1]

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">🧑‍🤝‍🧑 Compradores</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <KPI
          title="Compradores del mes"
          value={monthly?.total_buyers ?? "—"}
          sub={monthName}
          color="text-coffee"
        />
        <KPI
          title="Compradores del año"
          value={yearly?.total_unique_buyers ?? "—"}
          sub={`${yearly?.year}`}
          color="text-blue-600"
        />
        <KPI
          title="Compradores recurrentes"
          value={monthly?.returning_buyers ?? "—"}
          sub="volvieron este mes"
        />
        <KPI
          title="Nuevos registrados"
          value={monthly?.new_registered_this_month ?? "—"}
          sub="este mes"
          color="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Desglose del mes */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow space-y-4">
          <h3 className="font-bold text-neutral-800 text-sm sm:text-base">
            Desglose de {monthName} {monthly?.year}
          </h3>
          <div className="space-y-2">
            <Row label="Total compradores"    value={monthly?.total_buyers ?? 0} />
            <Row label="Registrados"          value={monthly?.registered_buyers ?? 0} />
            <Row label="Invitados (guest)"    value={monthly?.guest_buyers ?? 0} />
            <Row label="Recurrentes"          value={monthly?.returning_buyers ?? 0} />
            <Row label="Nuevos registrados"   value={monthly?.new_registered_this_month ?? 0} />
          </div>
        </div>

        {/* Compradores del año */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow space-y-4">
          <h3 className="font-bold text-neutral-800 text-sm sm:text-base">
            Resumen del año {yearly?.year}
          </h3>
          <div className="space-y-2">
            <Row label="Total únicos"         value={yearly?.total_unique_buyers ?? 0} />
            <Row label="Registrados"          value={yearly?.registered_buyers ?? 0} />
            <Row label="Invitados (guest)"    value={yearly?.guest_buyers ?? 0} />
          </div>

          {/* Lista de compradores */}
          {yearly?.buyer_ids?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Compradores ({yearly.buyer_ids.length})
              </p>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {yearly.buyer_ids.map((email, i) => (
                  <li key={i} className="text-xs text-gray-600 truncate bg-gray-50 rounded px-2 py-1">
                    {email}
                  </li>
                ))}
              </ul>
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
      <p className={`text-lg sm:text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm gap-2 border-b border-gray-50 pb-1.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-neutral-800">{value}</span>
    </div>
  )
}