import { useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext'
import CoffeeLoader from '../../components/Coffeeloader'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const MONTHS   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function BuyersPanel() {
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
          fetch(`${API_BASE}/dashboard/buyers/monthly?year=${now.getFullYear()}&month=${now.getMonth()+1}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/dashboard/buyers/yearly?year=${now.getFullYear()}`,                            { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const md = await mr.json(), yd = await yr.json()
        if (!mr.ok) throw new Error(md.message)
        if (!yr.ok) throw new Error(yd.message)
        setMonthly(md.data); setYearly(yd.data)
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    })()
  }, [token])

  if (loading) return <CoffeeLoader variant="cup" message="Cargando compradores..." />
  if (error)   return <p className="text-red-500 p-4">❌ {error}</p>

  const monthName = MONTHS[(monthly?.month ?? 1) - 1]

  const kpis = [
    { label: 'Compradores del mes',  value: monthly?.total_buyers ?? '—',             sub: monthName,              cls: 'text-amber-600' },
    { label: 'Compradores del año',  value: yearly?.total_unique_buyers ?? '—',        sub: yearly?.year,           cls: 'text-blue-600' },
    { label: 'Recurrentes',          value: monthly?.returning_buyers ?? '—',          sub: 'volvieron este mes',   cls: 'text-gray-800' },
    { label: 'Nuevos registrados',   value: monthly?.new_registered_this_month ?? '—', sub: 'este mes',             cls: 'text-emerald-600' },
  ]

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map(({ label, value, sub, cls }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all">
            <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">{label}</p>
            <p className={`font-display font-bold text-3xl leading-tight mb-1 ${cls}`}>{value}</p>
            <p className="text-[11px] text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="font-display font-bold text-base text-gray-900">Desglose — {monthName} {monthly?.year}</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="divide-y divide-gray-100">
            {[
              ['Total compradores',  monthly?.total_buyers ?? 0],
              ['Registrados',        monthly?.registered_buyers ?? 0],
              ['Invitados (guest)',  monthly?.guest_buyers ?? 0],
              ['Recurrentes',        monthly?.returning_buyers ?? 0],
              ['Nuevos registrados', monthly?.new_registered_this_month ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2.5 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="font-display font-bold text-base text-gray-900">Resumen del año {yearly?.year}</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="divide-y divide-gray-100">
            {[
              ['Total únicos',      yearly?.total_unique_buyers ?? 0],
              ['Registrados',       yearly?.registered_buyers ?? 0],
              ['Invitados (guest)', yearly?.guest_buyers ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2.5 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>

          {yearly?.buyer_ids?.length > 0 && (
            <div className="mt-4">
              <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
                Compradores ({yearly.buyer_ids.length})
              </p>
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                {yearly.buyer_ids.map((e, i) => (
                  <div key={i} className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-2.5 py-1.5 truncate hover:text-gray-700 transition-colors">
                    {e}
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