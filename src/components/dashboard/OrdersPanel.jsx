import { useEffect, useState, useCallback } from 'react'
import { useUser } from '../../context/UserContext'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import CoffeeLoader from '../../components/Coffeeloader'

const STATUS_LABELS = { PENDING:'Pendiente', CONFIRMED:'Confirmado', PROCESSING:'En preparación', SHIPPED:'Enviado', DELIVERED:'Entregado', CANCELLED:'Cancelado' }
const STATUS_FLOW   = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED']
const PM_LABELS     = { MERCADO_PAGO:'MercadoPago', WOMPI:'Wompi', TRANSFERENCIA:'Transferencia', CONTRA_ENTREGA:'Contra entrega' }
const AUTO_APPROVE  = ['MERCADO_PAGO','WOMPI','TRANSFERENCIA']
const MANUAL        = ['CONTRA_ENTREGA']
const PAGE_SIZE     = 10
const CANCELLABLE   = ['PENDING','CONFIRMED','PROCESSING']

const STATUS_CLS = {
  PENDING:    'text-amber-600   bg-amber-50    border-amber-200',
  CONFIRMED:  'text-blue-600    bg-blue-50     border-blue-200',
  PROCESSING: 'text-violet-600  bg-violet-50   border-violet-200',
  SHIPPED:    'text-sky-600     bg-sky-50      border-sky-200',
  DELIVERED:  'text-emerald-600 bg-emerald-50  border-emerald-200',
  CANCELLED:  'text-red-500     bg-red-50      border-red-200',
}
const STATUS_DOT = {
  PENDING:    'bg-amber-400',
  CONFIRMED:  'bg-blue-500',
  PROCESSING: 'bg-violet-500',
  SHIPPED:    'bg-sky-500',
  DELIVERED:  'bg-emerald-500',
  CANCELLED:  'bg-red-400',
}

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${STATUS_CLS[status] || 'text-gray-500 bg-gray-100 border-gray-200'}`}>
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[status] || 'bg-gray-400'}`} />
    {STATUS_LABELS[status] || status}
  </span>
)

const CancelDialog = ({ order, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="px-5 pt-5 pb-4">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <h3 className="font-semibold text-gray-900 text-base mb-1">Cancelar pedido</h3>
        <p className="text-sm text-gray-500">
          ¿Confirmas la cancelación del pedido{' '}
          <span className="font-mono font-bold text-gray-800">{order.order_number}</span>?
          Esta acción no se puede deshacer.
        </p>
      </div>
      <div className="flex gap-2 px-5 pb-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">No, mantener</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition">Sí, cancelar</button>
      </div>
    </div>
  </div>
)

const Pagination = ({ page, totalPages, total, onPage }) => {
  if (totalPages <= 1) return null
  const from = (page - 1) * PAGE_SIZE + 1
  const to   = Math.min(page * PAGE_SIZE, total)
  const pages = []
  for (let i = 1; i <= totalPages; i++)
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i)
  const list = []
  pages.forEach((p, i) => { if (i > 0 && p - pages[i-1] > 1) list.push('…'); list.push(p) })
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-5 py-3.5 border-t border-gray-100">
      <p className="text-[11px] text-gray-400">
        <span className="text-gray-700 font-semibold">{from}–{to}</span> de <span className="text-gray-700 font-semibold">{total}</span> pedidos
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page-1)} disabled={page===1} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={12}/> Ant.</button>
        {list.map((p,i) => p==='…' ? <span key={`e${i}`} className="w-7 text-center text-[11px] text-gray-400">…</span> : <button key={p} onClick={()=>onPage(p)} className={`w-7 h-7 rounded-md text-[11px] font-bold transition-all ${p===page?'bg-coffee text-white':'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>{p}</button>)}
        <button onClick={() => onPage(page+1)} disabled={page===totalPages} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Sig. <ChevronRight size={12}/></button>
      </div>
    </div>
  )
}

const OrdersTable = ({ statusGroup, updatingId, handleStatusChange, approvePayment, cancelOrder, setSelectedOrder, token, apiBase, onOrderUpdated }) => {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [total,       setTotal]       = useState(0)
  const [cancelTarget, setCancelTarget] = useState(null)

  const load = useCallback(async (p=1) => {
    if (!token) return
    setLoading(true)
    try {
      const res  = await fetch(`${apiBase}/orders?status=${statusGroup}&page=${p}&page_size=${PAGE_SIZE}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success && Array.isArray(data.data?.orders)) { setOrders(data.data.orders); setTotal(data.data.total??0); setTotalPages(data.data.total_pages??1) }
      else { setOrders([]); setTotal(0); setTotalPages(1) }
    } catch { setError('Error al cargar pedidos') }
    finally   { setLoading(false) }
  }, [token, statusGroup])

  useEffect(() => { load(page) }, [page, onOrderUpdated])

  const updateLocal = (id, u) => setOrders(prev => prev.map(o => o.id===id ? {...o,...u} : o))
  const handleCancel = async () => { if (!cancelTarget) return; await cancelOrder(cancelTarget, updateLocal); setCancelTarget(null) }

  if (loading) return <div className="bg-white border border-gray-200 rounded-xl py-10 mb-5"><CoffeeLoader variant="grinder" message="Cargando pedidos..." size="sm" /></div>
  if (error)   return <p className="text-red-500 p-4">{error}</p>
  if (!orders.length) return <div className="bg-white border border-gray-200 rounded-xl py-12 text-center text-gray-400 text-sm italic mb-5">Sin pedidos en esta sección</div>

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 700 }}>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Orden','Cliente','Total','Estado','Pago','Fecha','Acciones'].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-3 text-left text-[9px] font-bold tracking-[0.14em] uppercase text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => {
                const isUpdating    = updatingId === order.id
                const isManual      = MANUAL.includes(order.payment_method)
                const idx           = STATUS_FLOW.indexOf(order.status)
                const isFinished    = ['DELIVERED','CANCELLED'].includes(order.status)
                const nextStatus    = !isFinished && idx !== -1 && idx < STATUS_FLOW.length-1 ? STATUS_FLOW[idx+1] : null
                const nextBlocked   = isManual && nextStatus === 'DELIVERED' && order.payment_status !== 'APPROVED'
                const needsApproval = isManual && order.status === 'SHIPPED' && order.payment_status !== 'APPROVED'
                const canCancel     = CANCELLABLE.includes(order.status)
                const dateStr       = new Date(order.created_at).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })
                return (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors align-top">
                    <td className="px-3 sm:px-4 py-3.5"><span className="font-mono font-bold text-[11px] text-coffee tracking-wider whitespace-nowrap">{order.order_number}</span></td>
                    <td className="px-3 sm:px-4 py-3.5 text-gray-700 font-medium whitespace-nowrap max-w-[120px] truncate">{order.customer_name||'—'}</td>
                    <td className="px-3 sm:px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">${order.total?.toLocaleString('es-CO')}</td>
                    <td className="px-3 sm:px-4 py-3.5 min-w-[160px]">
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={order.status} />
                        {nextStatus && !isFinished && (
                          <div className="relative">
                            <select disabled={isUpdating||nextBlocked} value="" onChange={e=>{if(e.target.value) handleStatusChange(order,e.target.value,updateLocal)}}
                              className={['w-full appearance-none pl-2.5 pr-7 py-1.5 rounded-md border text-[11px] font-medium outline-none transition-all bg-white', nextBlocked?'border-gray-200 text-gray-300 cursor-not-allowed':'border-gray-300 text-gray-600 hover:border-gray-400 cursor-pointer', isUpdating?'opacity-50':''].join(' ')}>
                              <option value="" disabled>Avanzar a…</option>
                              <option value={nextStatus}>{STATUS_LABELS[nextStatus]}</option>
                            </select>
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▾</span>
                          </div>
                        )}
                        {nextBlocked && <span className="text-[10px] text-gray-400 italic">Confirmar pago primero</span>}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold whitespace-nowrap ${order.payment_status==='APPROVED'?'text-emerald-600':'text-gray-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${order.payment_status==='APPROVED'?'bg-emerald-500':'bg-gray-300'}`} />
                          {order.payment_status==='APPROVED'?'Aprobado':'Pendiente'}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider whitespace-nowrap">{PM_LABELS[order.payment_method]||order.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3.5 text-[11px] text-gray-400 whitespace-nowrap">{dateStr}</td>
                    <td className="px-3 sm:px-4 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        {needsApproval && <button disabled={isUpdating} onClick={()=>approvePayment(order,updateLocal)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all disabled:opacity-40 whitespace-nowrap">✓ Confirmar pago</button>}
                        <button onClick={()=>setSelectedOrder(order)} className="inline-flex items-center px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all whitespace-nowrap">Ver detalles</button>
                        {canCancel && <button disabled={isUpdating} onClick={()=>setCancelTarget(order)} className="inline-flex items-center px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-40 whitespace-nowrap">Cancelar</button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
      </div>
      {cancelTarget && <CancelDialog order={cancelTarget} onConfirm={handleCancel} onClose={()=>setCancelTarget(null)} />}
    </>
  )
}

const OrderModal = ({ order, onClose }) => {
  if (!order) return null
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col border border-gray-200 shadow-2xl" style={{ maxHeight:'90vh' }} onClick={e=>e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div>
            <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-gray-400 mb-1">Pedido</p>
            <p className="font-mono font-bold text-lg text-coffee tracking-wider mb-2">{order.order_number}</p>
            <StatusBadge status={order.status} />
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors flex items-center justify-center text-xs flex-shrink-0">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-400">Total</span>
            <span className="font-bold text-2xl text-gray-900">${order.total?.toLocaleString('es-CO')}</span>
          </div>
          {[
            { title:'Cliente',   rows:[['Nombre',order.customer_name],['Email',order.customer_email],['Teléfono',order.customer_phone]] },
            { title:'Dirección', rows:[['Calle',`${order.shipping_address?.street||''} ${order.shipping_address?.number||''}`],['Ciudad',`${order.shipping_address?.city||''}, ${order.shipping_address?.department||''}`],order.shipping_address?.details?['Detalles',order.shipping_address.details]:null].filter(Boolean) },
            { title:'Pago',      rows:[['Método',PM_LABELS[order.payment_method]||order.payment_method],['Estado',order.payment_status==='APPROVED'?'✓ Aprobado':'⏳ Pendiente']] },
          ].map(({ title, rows }) => (
            <div key={title}>
              <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-gray-400 mb-2">{title}</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {rows.map(([label,value]) => (
                  <div key={label} className="flex justify-between items-center px-3.5 py-2.5 text-sm gap-4">
                    <span className="text-gray-400 flex-shrink-0">{label}</span>
                    <span className={`font-semibold text-right truncate ${label==='Estado'&&order.payment_status==='APPROVED'?'text-emerald-600':'text-gray-800'}`}>{value||'—'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3.5 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  )
}

const SectionDivider = ({ children }) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-gray-400 whitespace-nowrap">{children}</span>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
)

export default function OrdersPanel() {
  const { token } = useUser()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
  const [updatingId,    setUpdatingId]    = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [refreshKey,    setRefreshKey]    = useState(0)

  if (!token) return <p className="text-gray-400 p-4">Debes iniciar sesión</p>

  const handleStatusChange = async (order, nextStatus, updateLocal) => {
    setUpdatingId(order.id)
    try {
      const res = await fetch(`${API_BASE}/orders/${order.id}/status`, { method:'PATCH', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify({ status:nextStatus }) })
      if (!res.ok) throw new Error('Error al actualizar estado')
      const shouldAutoApprove = AUTO_APPROVE.includes(order.payment_method) && nextStatus==='CONFIRMED' && order.payment_status!=='APPROVED'
      if (shouldAutoApprove) {
        await fetch(`${API_BASE}/orders/${order.id}/payment`, { method:'PATCH', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify({ payment_status:'APPROVED' }) })
        updateLocal(order.id, { status:nextStatus, payment_status:'APPROVED' })
      } else { updateLocal(order.id, { status:nextStatus }) }
      if (['DELIVERED','CANCELLED'].includes(nextStatus)) setRefreshKey(k=>k+1)
    } catch(err) { alert(`⚠️ ${err.message}`) }
    finally { setUpdatingId(null) }
  }

  const approvePayment = async (order, updateLocal) => {
    setUpdatingId(order.id)
    try {
      const res = await fetch(`${API_BASE}/orders/${order.id}/payment`, { method:'PATCH', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify({ payment_status:'APPROVED' }) })
      if (!res.ok) throw new Error('Error al confirmar pago')
      const data = await res.json()
      updateLocal(order.id, { payment_status:data?.data?.payment_status??'APPROVED', status:data?.data?.status??order.status })
    } catch(err) { alert(`⚠️ ${err.message}`) }
    finally { setUpdatingId(null) }
  }

  const cancelOrder = async (order, updateLocal) => {
    setUpdatingId(order.id)
    try {
      const res = await fetch(`${API_BASE}/orders/${order.id}/status`, { method:'PATCH', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify({ status:'CANCELLED' }) })
      if (!res.ok) throw new Error('Error al cancelar pedido')
      updateLocal(order.id, { status:'CANCELLED' })
      setRefreshKey(k=>k+1)
    } catch(err) { alert(`⚠️ ${err.message}`) }
    finally { setUpdatingId(null) }
  }

  const shared = { updatingId, handleStatusChange, approvePayment, cancelOrder, setSelectedOrder, token, apiBase:API_BASE, onOrderUpdated:refreshKey }

  return (
    <div>
      <SectionDivider>Pedidos activos</SectionDivider>
      <OrdersTable statusGroup="active"    {...shared} />
      <SectionDivider>Pedidos completados</SectionDivider>
      <OrdersTable statusGroup="completed" {...shared} />
      <OrderModal order={selectedOrder} onClose={()=>setSelectedOrder(null)} />
    </div>
  )
}