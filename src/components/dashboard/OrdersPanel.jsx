import { useEffect, useState, useCallback } from 'react'
import { useUser } from '../../context/UserContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CoffeeLoader from '../../components/Coffeeloader'

const ORDER_STATUS_LABELS = {
  PENDING:    'Pendiente',
  CONFIRMED:  'Confirmado',
  PROCESSING: 'En preparación',
  SHIPPED:    'Enviado',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
}

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const STATUS_STYLES = {
  PENDING:    'bg-yellow-50  text-yellow-700  ring-1 ring-yellow-200',
  CONFIRMED:  'bg-yellow-50  text-yellow-700  ring-1 ring-yellow-200',
  PROCESSING: 'bg-yellow-50  text-yellow-700  ring-1 ring-yellow-200',
  SHIPPED:    'bg-yellow-50  text-yellow-700  ring-1 ring-yellow-200',
  DELIVERED:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  CANCELLED:  'bg-red-50     text-red-700     ring-1 ring-red-200',
}

const STATUS_DOT = {
  PENDING:    'bg-yellow-400',
  CONFIRMED:  'bg-yellow-400',
  PROCESSING: 'bg-yellow-500',
  SHIPPED:    'bg-yellow-500',
  DELIVERED:  'bg-emerald-500',
  CANCELLED:  'bg-red-500',
}

const PAYMENT_METHOD_LABELS = {
  MERCADO_PAGO:   'MercadoPago',
  WOMPI:          'Wompi',
  TRANSFERENCIA:  'Transferencia',
  CONTRA_ENTREGA: 'Contra entrega',
}

const AUTO_APPROVE_ON_CONFIRMED = ['MERCADO_PAGO', 'WOMPI', 'TRANSFERENCIA']
const MANUAL_PAYMENT_METHODS    = ['CONTRA_ENTREGA']
const PAGE_SIZE = 10

// ─── Paginación ───────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, total, onPage }) => {
  if (totalPages <= 1) return null

  const from = (page - 1) * PAGE_SIZE + 1
  const to   = Math.min(page * PAGE_SIZE, total)

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i)
  }
  const withEllipsis = []
  pages.forEach((p, idx) => {
    if (idx > 0 && p - pages[idx - 1] > 1) withEllipsis.push('…')
    withEllipsis.push(p)
  })

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-stone-100">
      <p className="text-xs text-stone-400 font-medium">
        Mostrando{' '}
        <span className="text-neutral-700 font-semibold">{from}–{to}</span>
        {' '}de{' '}
        <span className="text-neutral-700 font-semibold">{total}</span>
        {' '}pedidos
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border-2 border-stone-200 text-stone-500 hover:border-stone-400 hover:text-neutral-800 hover:bg-stone-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        <div className="flex items-center gap-1 mx-1">
          {withEllipsis.map((p, i) =>
            p === '…'
              ? <span key={`e-${i}`} className="w-7 text-center text-xs text-stone-400 select-none">…</span>
              : <button
                  key={p}
                  onClick={() => onPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    p === page
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-neutral-800'
                  }`}
                >
                  {p}
                </button>
          )}
        </div>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border-2 border-stone-200 text-stone-500 hover:border-stone-400 hover:text-neutral-800 hover:bg-stone-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Celda de estado ──────────────────────────────────────────────────────────
const StatusCell = ({ order, updatingId, handleStatusChange }) => {
  const currentIndex = STATUS_FLOW.indexOf(order.status)
  const isFinished   = ['DELIVERED', 'CANCELLED'].includes(order.status)
  const isUpdating   = updatingId === order.id
  const isManual     = MANUAL_PAYMENT_METHODS.includes(order.payment_method)
  const nextStatus   = !isFinished && currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIndex + 1] : null
  const nextBlocked  = isManual && nextStatus === 'DELIVERED' && order.payment_status !== 'APPROVED'

  return (
    <div className="flex flex-col gap-2 min-w-[160px]">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${STATUS_STYLES[order.status] || ''}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[order.status] || 'bg-stone-400'}`} />
        {ORDER_STATUS_LABELS[order.status]}
      </span>
      {nextStatus && (
        <>
          <div className="relative w-full">
            <select
              disabled={isUpdating || nextBlocked}
              value=""
              onChange={e => { if (e.target.value) handleStatusChange(order, e.target.value) }}
              title={nextBlocked ? 'Confirmar pago antes de entregar' : 'Avanzar estado'}
              className={`
                w-full appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border-2
                bg-white text-neutral-600 shadow-sm transition-all
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-300
                ${nextBlocked ? 'border-stone-200 text-stone-300 cursor-not-allowed bg-stone-50' : 'border-stone-300 hover:border-neutral-500 cursor-pointer'}
                ${isUpdating ? 'opacity-60 cursor-wait' : ''}
              `}
            >
              <option value="" disabled>Avanzar a…</option>
              <option value={nextStatus}>{ORDER_STATUS_LABELS[nextStatus]}</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400">
              {isUpdating
                ? <span className="block w-3 h-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                : <ChevronLeft size={12} className="rotate-[-90deg]" />
              }
            </span>
          </div>
          {nextBlocked && (
            <span className="text-[10px] text-stone-400 italic leading-tight">Confirmar pago primero</span>
          )}
        </>
      )}
    </div>
  )
}

// ─── Tabla ────────────────────────────────────────────────────────────────────
const OrdersTable = ({ statusGroup, updatingId, handleStatusChange, approvePayment, setSelectedOrder, token, apiBase, onOrderUpdated }) => {
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)

  const load = useCallback(async (p = 1) => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/orders?status=${statusGroup}&page=${p}&page_size=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data?.orders)) {
        setOrders(data.data.orders)
        setTotal(data.data.total ?? 0)
        setTotalPages(data.data.total_pages ?? 1)
      } else {
        setOrders([])
        setTotal(0)
        setTotalPages(1)
      }
    } catch (err) {
      console.error(err)
      setError('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }, [token, statusGroup])

  useEffect(() => { load(page) }, [page, onOrderUpdated])

  const updateLocal = (orderId, updates) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o))
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-8">
      {/* Loading: fuera de la tabla para poder usar CoffeeLoader */}
      {loading ? (
        <CoffeeLoader variant="grinder" message="Cargando pedidos..." size="sm" />
      ) : error ? (
        <p className="px-5 py-10 text-center text-red-400 text-sm">{error}</p>
      ) : orders.length === 0 ? (
        <p className="px-5 py-10 text-center text-stone-400 text-sm italic">Sin pedidos en esta sección</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 860 }}>
            <thead className="bg-neutral-900">
              <tr>
                {['Orden', 'Cliente', 'Total', 'Estado', 'Pago', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-4 text-left text-[11px] font-medium tracking-widest uppercase text-stone-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map(order => {
                const isUpdating = updatingId === order.id
                const isManual   = MANUAL_PAYMENT_METHODS.includes(order.payment_method)
                const needsPaymentApproval =
                  isManual && order.status === 'SHIPPED' && order.payment_status !== 'APPROVED'

                const dateStr = new Date(order.created_at).toLocaleDateString('es-CO', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })

                const wrappedHandleStatus = async (o, next) => {
                  await handleStatusChange(o, next, updateLocal)
                }
                const wrappedApprove = async (o) => {
                  await approvePayment(o, updateLocal)
                }

                return (
                  <tr key={order.id} className="hover:bg-stone-50/70 transition-colors align-top">
                    <td className="px-4 py-4">
                      <span className="font-mono font-semibold text-neutral-900 text-xs tracking-wider whitespace-nowrap">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-neutral-700 font-medium whitespace-nowrap">{order.customer_name || '—'}</td>
                    <td className="px-4 py-4 font-bold text-neutral-900 whitespace-nowrap">${order.total?.toLocaleString('es-CO')}</td>
                    <td className="px-4 py-4">
                      <StatusCell order={order} updatingId={updatingId} handleStatusChange={wrappedHandleStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${order.payment_status === 'APPROVED' ? 'text-emerald-700' : 'text-stone-400'}`}>
                          {order.payment_status === 'APPROVED' ? (
                            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M4.5 7l2 2L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M7 4.5v3M7 9.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )}
                          {order.payment_status === 'APPROVED' ? 'Aprobado' : 'Pendiente'}
                        </span>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider whitespace-nowrap">
                          {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-stone-400 whitespace-nowrap">{dateStr}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        {needsPaymentApproval && (
                          <button
                            disabled={isUpdating}
                            onClick={() => wrappedApprove(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {isUpdating
                              ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              : <>
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M4.5 7l2 2L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Confirmar pago
                                </>
                            }
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-800 hover:bg-stone-50 transition-all whitespace-nowrap"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && orders.length > 0 && (
        <Pagination page={page} totalPages={totalPages} total={total} onPage={p => setPage(p)} />
      )}
    </div>
  )
}

// ─── Modal detalle ────────────────────────────────────────────────────────────
const OrderModal = ({ order, onClose }) => {
  if (!order) return null
  const sc  = STATUS_STYLES[order.status] || ''
  const dot = STATUS_DOT[order.status]    || 'bg-stone-400'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="bg-neutral-900 px-6 py-5 flex items-start justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium mb-1">Pedido</p>
            <p className="text-white font-bold text-lg tracking-wide leading-none">{order.order_number}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${sc}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 mt-1 rounded-full bg-white/10 text-stone-400 hover:bg-white/20 hover:text-white transition-colors flex items-center justify-center text-sm font-medium flex-shrink-0">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3.5 border border-stone-200">
            <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">Total</span>
            <span className="text-2xl font-bold text-neutral-900">${order.total?.toLocaleString('es-CO')}</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-2.5">Cliente</p>
            <div className="bg-stone-50 rounded-xl border border-stone-100 divide-y divide-stone-100 overflow-hidden">
              {[['Nombre', order.customer_name], ['Email', order.customer_email], ['Teléfono', order.customer_phone]].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center px-4 py-3 text-sm gap-4">
                  <span className="text-stone-400 flex-shrink-0">{label}</span>
                  <span className="text-neutral-800 font-semibold text-right truncate">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-2.5">Dirección de envío</p>
            <div className="bg-stone-50 rounded-xl border border-stone-100 divide-y divide-stone-100 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 text-sm gap-4">
                <span className="text-stone-400 flex-shrink-0">Dirección</span>
                <span className="text-neutral-800 font-semibold text-right">{order.shipping_address?.street} {order.shipping_address?.number}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 text-sm gap-4">
                <span className="text-stone-400 flex-shrink-0">Ciudad</span>
                <span className="text-neutral-800 font-semibold text-right">{order.shipping_address?.city}, {order.shipping_address?.department}</span>
              </div>
              {order.shipping_address?.details && (
                <div className="flex justify-between items-start px-4 py-3 text-sm gap-4">
                  <span className="text-stone-400 flex-shrink-0">Detalles</span>
                  <span className="text-neutral-800 font-semibold text-right">{order.shipping_address.details}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-2.5">Pago</p>
            <div className="bg-stone-50 rounded-xl border border-stone-100 divide-y divide-stone-100 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 text-sm gap-4">
                <span className="text-stone-400 flex-shrink-0">Método</span>
                <span className="text-neutral-800 font-semibold">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 text-sm gap-4">
                <span className="text-stone-400 flex-shrink-0">Estado</span>
                <span className={`font-semibold inline-flex items-center gap-1.5 ${order.payment_status === 'APPROVED' ? 'text-emerald-600' : 'text-stone-400'}`}>
                  {order.payment_status === 'APPROVED' ? (<><svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M4.5 7l2 2L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Aprobado</>) : '⏳ Pendiente'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-stone-100 bg-white flex-shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function OrdersPanel() {
  const { token } = useUser()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

  const [updatingId, setUpdatingId]       = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [refreshKey, setRefreshKey]       = useState(0)

  if (!token) return <p className="text-stone-400 p-4">Debes iniciar sesión</p>

  const handleStatusChange = async (order, nextStatus, updateLocal) => {
    setUpdatingId(order.id)
    try {
      const res = await fetch(`${API_BASE}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error('Error al actualizar estado')

      const shouldAutoApprove =
        AUTO_APPROVE_ON_CONFIRMED.includes(order.payment_method) &&
        nextStatus === 'CONFIRMED' &&
        order.payment_status !== 'APPROVED'

      if (shouldAutoApprove) {
        await fetch(`${API_BASE}/orders/${order.id}/payment`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_status: 'APPROVED' }),
        })
        updateLocal(order.id, { status: nextStatus, payment_status: 'APPROVED' })
      } else {
        updateLocal(order.id, { status: nextStatus })
      }

      const movedToCompleted = nextStatus === 'DELIVERED' || nextStatus === 'CANCELLED'
      if (movedToCompleted) setRefreshKey(k => k + 1)

    } catch (err) {
      console.error(err)
      alert(`⚠️ ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const approvePayment = async (order, updateLocal) => {
    setUpdatingId(order.id)
    try {
      const res = await fetch(`${API_BASE}/orders/${order.id}/payment`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'APPROVED' }),
      })
      if (!res.ok) throw new Error('Error al confirmar pago')
      const data = await res.json()
      updateLocal(order.id, {
        payment_status: data?.data?.payment_status ?? 'APPROVED',
        status:         data?.data?.status ?? order.status,
      })
    } catch (err) {
      console.error(err)
      alert(`⚠️ ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const sharedProps = { updatingId, handleStatusChange, approvePayment, setSelectedOrder, token, apiBase: API_BASE, onOrderUpdated: refreshKey }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Gestión de pedidos</h1>
        <p className="text-xs text-stone-400 uppercase tracking-widest mt-1 font-medium">Panel administrativo</p>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 whitespace-nowrap">Pedidos activos</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>
      <OrdersTable statusGroup="active" {...sharedProps} />

      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 whitespace-nowrap">Pedidos completados</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>
      <OrdersTable statusGroup="completed" {...sharedProps} />

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  )
}