import { useEffect, useState, useRef, useCallback } from 'react'
import { useUser } from '../../context/UserContext'
import { useAlert } from '../../context/AlertContext'
import CoffeeLoader from '../../components/Coffeeloader'
import {
  Plus, Search, Package, TrendingDown, AlertTriangle,
  CheckCircle, Edit3, Trash2, X, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, Eye, EyeOff, Star, StarOff, Save, RotateCcw
} from 'lucide-react'
import GalleryImageSelector from '../GalleryImageSelector'

const API_BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const PAGE_SIZE = 12
const fmt       = v => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0)

const CATEGORIES = ['Café molido', 'Café en grano', 'Café instantáneo', 'Accesorios', 'Filtros', 'Otro']

const STOCK_STATUS = (stock) => {
  if (stock === 0)  return { label: 'Agotado',   cls: 'text-red-500 bg-red-50 border-red-200',     dot: 'bg-red-500' }
  if (stock <= 5)   return { label: 'Crítico',   cls: 'text-orange-500 bg-orange-50 border-orange-200', dot: 'bg-orange-500' }
  if (stock <= 20)  return { label: 'Bajo',      cls: 'text-amber-600 bg-amber-50 border-amber-200',  dot: 'bg-amber-500' }
  return              { label: 'Disponible', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' }
}

/* ── Input base ── */
const Input = ({ label, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
    <input
      className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white text-gray-800
        focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800
        transition-all placeholder:text-gray-300
        ${error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'}`}
      {...props}
    />
    {error && <p className="text-[11px] text-red-500">{error}</p>}
  </div>
)

const Textarea = ({ label, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
    <textarea
      rows={3}
      className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white text-gray-800
        focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800
        transition-all placeholder:text-gray-300 resize-none
        ${error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'}`}
      {...props}
    />
    {error && <p className="text-[11px] text-red-500">{error}</p>}
  </div>
)

/* ── Stock badge ── */
const StockBadge = ({ stock }) => {
  const s = STOCK_STATUS(stock)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

/* ── Confirm delete dialog ── */
const DeleteDialog = ({ product, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="px-5 pt-5 pb-4">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <h3 className="font-semibold text-gray-900 text-base mb-1">Eliminar producto</h3>
        <p className="text-sm text-gray-500">
          ¿Eliminar <span className="font-semibold text-gray-800">"{product.name}"</span>? Esta acción no se puede deshacer.
        </p>
      </div>
      <div className="flex gap-2 px-5 pb-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition">
          Eliminar
        </button>
      </div>
    </div>
  </div>
)

/* ── Quick stock editor ── */
const StockEditor = ({ product, onSave, onClose }) => {
  const [val, setVal] = useState(product.stock)
  const [loading, setLoading] = useState(false)
  const { token } = useUser()
  const { successToast, errorAlert } = useAlert()

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/products/${product.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: val })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al actualizar stock')
      successToast(`Stock de "${product.name}" actualizado`)
      onSave({ ...product, stock: val })
    } catch (e) { errorAlert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-3">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Actualizar stock</p>
          <p className="font-semibold text-gray-900 text-sm mb-4 truncate">{product.name}</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setVal(v => Math.max(0, v - 1))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition font-bold text-lg">−</button>
            <input
              type="number" min="0" value={val}
              onChange={e => setVal(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 text-center text-2xl font-bold text-gray-900 border border-gray-200 rounded-lg py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
            />
            <button onClick={() => setVal(v => v + 1)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition font-bold text-lg">+</button>
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-2">Stock actual: {product.stock} unidades</p>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={save} disabled={loading || val === product.stock} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Product form (create / edit) ── */
const EMPTY_FORM = { name: '', description: '', price: '', weight: '', stock: '', category: '', is_featured: false, is_active: true }

const ProductForm = ({ product, onSave, onClose }) => {
  const { token } = useUser()
  const { successToast, errorAlert } = useAlert()
  const isEdit = !!product
  const [form, setForm] = useState(isEdit ? {
    name:        product.name,
    description: product.description,
    price:       product.price,
    weight:      product.weight,
    stock:       product.stock,
    category:    product.category,
    is_featured: product.is_featured,
    is_active:   product.is_active,
  } : EMPTY_FORM)
  const [selectedImages, setSelectedImages] = useState(
    isEdit ? (product.images || []) : []
  )
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name?.trim())        e.name = 'Requerido'
    if (!form.description?.trim()) e.description = 'Requerido'
    if (!form.price || +form.price <= 0) e.price = 'Debe ser mayor a 0'
    if (!form.weight || +form.weight <= 0) e.weight = 'Debe ser mayor a 0'
    if (form.stock === '' || +form.stock < 0) e.stock = 'Debe ser 0 o más'
    if (!form.category) e.category = 'Requerido'
    if (!selectedImages.length) e.images = 'Debes seleccionar una imagen'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       parseFloat(form.price),
        weight:      parseInt(form.weight),
        stock:       parseInt(form.stock),
        category:    form.category,
        images:      selectedImages,
        is_featured: form.is_featured,
        ...(isEdit && { is_active: form.is_active }),
      }
      const url    = isEdit ? `${API_BASE}/products/${product.id}` : `${API_BASE}/products`
      const method = isEdit ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al guardar')
      successToast(isEdit ? 'Producto actualizado' : 'Producto creado')
      onSave(data.data)
    } catch (e) { errorAlert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-gray-100"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{isEdit ? 'Editar' : 'Nuevo'} producto</p>
            <h2 className="font-semibold text-gray-900 text-base mt-0.5">{isEdit ? product.name : 'Agregar al inventario'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Nombre del producto" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Café Especial Huila 250g" error={errors.name} />
            </div>

            <div className="sm:col-span-2">
              <Textarea label="Descripción" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe el producto..." error={errors.description} />
            </div>

            <Input label="Precio (COP)" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25000" error={errors.price} />
            <Input label="Peso (gramos)" type="number" min="1" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="250" error={errors.weight} />
            <Input label="Stock inicial" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="100" error={errors.stock} />

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Categoría</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-all ${errors.category ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <option value="">Seleccionar categoría</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-[11px] text-red-500">{errors.category}</p>}
            </div>
          </div>

          {/* Imágenes - GalleryImageSelector */}
          <div>
            <GalleryImageSelector
              selectedImages={selectedImages}
              onImagesChange={setSelectedImages}
              token={token}
              singleSelect={false}
            />
            {errors.images && <p className="text-[11px] text-red-500 mt-1">{errors.images}</p>}
          </div>

          {/* Toggles */}
          <div className="flex gap-3">
            {[
              { key: 'is_featured', label: 'Destacado', icon: Star },
              ...(isEdit ? [{ key: 'is_active', label: 'Activo', icon: Eye }] : []),
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => set(key, !form[key])}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all
                  ${form[key] ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={submit} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <><RotateCcw size={13} className="animate-spin" /> Guardando...</> : <><Save size={13} /> {isEdit ? 'Guardar cambios' : 'Crear producto'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Product card ── */
const ProductCard = ({ product, onEdit, onDelete, onStockEdit, onToggleActive, onToggleFeatured }) => {
  const s      = STOCK_STATUS(product.stock)
  const img    = product.images?.[0]
  const isLow  = product.stock <= 5

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all hover:shadow-md hover:-translate-y-px group ${!product.is_active ? 'opacity-60' : 'border-gray-200'}`}>

      {/* Imagen - mismo tratamiento que ProductCard de la tienda */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className={`w-full h-full object-cover transition duration-300 group-hover:scale-105 ${!product.is_active ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Package size={32} className="text-gray-200" />
          </div>
        )}

        {/* Agotado overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-widest">AGOTADO</span>
          </div>
        )}

        {/* Inactivo overlay */}
        {product.stock > 0 && !product.is_active && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-widest">INACTIVO</span>
          </div>
        )}

        {/* Stock bajo badge */}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
              Pocas unidades
            </span>
          </div>
        )}

        {/* Destacado badge */}
        {product.is_featured && (
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-900 shadow">
              <Star size={9} fill="currentColor" /> Destacado
            </span>
          </div>
        )}

        {/* Acciones top-right - siempre visibles en admin */}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(product)} className="bg-white/90 hover:bg-white p-1.5 rounded-lg shadow transition" title="Editar">
            <Edit3 size={15} className="text-gray-700" />
          </button>
          <button onClick={() => onStockEdit(product)} className="bg-white/90 hover:bg-white p-1.5 rounded-lg shadow transition" title="Editar stock">
            <Package size={15} className="text-gray-700" />
          </button>
          <button onClick={() => onDelete(product)} className="bg-white/90 hover:bg-red-500 p-1.5 rounded-lg shadow transition" title="Eliminar">
            <Trash2 size={15} className="text-gray-700 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-[9px] font-bold tracking-widest uppercase text-gray-300 mb-0.5">{product.category}</p>
        <p className="text-sm font-semibold text-gray-900 leading-tight truncate mb-1">{product.name}</p>
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-900">{fmt(product.price)}</p>
          <button
            onClick={() => onStockEdit(product)}
            className={`text-[12px] font-semibold px-2 py-0.5 rounded-md transition ${isLow ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
          >
            {product.stock} uds
          </button>
        </div>

        {/* Acciones bottom */}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onToggleActive(product)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium border transition
              ${product.is_active ? 'border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
          >
            {product.is_active ? <EyeOff size={11} /> : <Eye size={11} />}
            {product.is_active ? 'Desactivar' : 'Activar'}
          </button>
          <button
            onClick={() => onToggleFeatured(product)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium border transition
              ${product.is_featured ? 'border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100' : 'border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50'}`}
          >
            {product.is_featured ? <StarOff size={11} /> : <Star size={11} />}
            {product.is_featured ? 'Quitar' : 'Destacar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Stats bar ── */
const StatsBar = ({ products }) => {
  const total    = products.length
  const active   = products.filter(p => p.is_active).length
  const agotados = products.filter(p => p.stock === 0).length
  const criticos = products.filter(p => p.stock > 0 && p.stock <= 5).length
  const featured = products.filter(p => p.is_featured).length

  const stats = [
    { label: 'Total productos', value: total,    icon: Package,       color: 'text-gray-700',    bg: 'bg-gray-100' },
    { label: 'Activos',         value: active,   icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Agotados',        value: agotados, icon: AlertTriangle, color: 'text-red-500',     bg: 'bg-red-50' },
    { label: 'Stock crítico',   value: criticos, icon: TrendingDown,  color: 'text-orange-500',  bg: 'bg-orange-50' },
    { label: 'Destacados',      value: featured, icon: Star,          color: 'text-amber-600',   bg: 'bg-amber-50' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={14} className={color} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
            <p className="text-[10px] text-gray-400 truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main ── */
export default function InventoryPanel() {
  const { token } = useUser()
  const { successToast, errorAlert } = useAlert()

  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [total,       setTotal]       = useState(0)
  const [search,      setSearch]      = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterCat,   setFilterCat]   = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [sortBy,      setSortBy]      = useState('name')
  const [sortDir,     setSortDir]     = useState('asc')

  const [editProduct,  setEditProduct]  = useState(null)  // null=closed, false=new, object=edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [stockTarget,  setStockTarget]  = useState(null)

  const searchRef = useRef()

  const load = useCallback(async (p = 1) => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, page_size: PAGE_SIZE })
      if (search) params.set('search', search)
      const res  = await fetch(`${API_BASE}/products?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setProducts(data.data?.products || data.data || [])
      setTotal(data.data?.total || 0)
      setTotalPages(data.data?.total_pages || 1)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [token, search])

  useEffect(() => { load(page) }, [page, search])

  // filtrado y ordenado local
  const filtered = products
    .filter(p => {
      if (filterCat && p.category !== filterCat) return false
      if (filterStock === 'agotado'  && p.stock !== 0)          return false
      if (filterStock === 'critico'  && !(p.stock > 0 && p.stock <= 5)) return false
      if (filterStock === 'bajo'     && !(p.stock > 5 && p.stock <= 20)) return false
      if (filterStock === 'activo'   && !p.is_active)           return false
      if (filterStock === 'inactivo' && p.is_active)            return false
      return true
    })
    .sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUp size={10} className="text-gray-300" />
    return sortDir === 'asc' ? <ArrowUp size={10} className="text-gray-600" /> : <ArrowDown size={10} className="text-gray-600" />
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/${deleteTarget.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Error al eliminar')
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      successToast(`"${deleteTarget.name}" eliminado`)
      setDeleteTarget(null)
    } catch (e) { errorAlert(e.message) }
  }

  const handleToggleActive = async (product) => {
    try {
      const newVal = !product.is_active
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: newVal })
      })
      if (!res.ok) throw new Error('Error')
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: newVal } : p))
      successToast(newVal ? 'Producto activado' : 'Producto desactivado')
    } catch (e) { errorAlert(e.message) }
  }

  const handleToggleFeatured = async (product) => {
    try {
      const newVal = !product.is_featured
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_featured: newVal })
      })
      if (!res.ok) throw new Error('Error')
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: newVal } : p))
      successToast(newVal ? 'Marcado como destacado' : 'Quitado de destacados')
    } catch (e) { errorAlert(e.message) }
  }

  const handleSaveProduct = (saved) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === saved?.id)
      if (exists) return prev.map(p => p.id === saved.id ? saved : p)
      return [saved, ...prev]
    })
    setEditProduct(null)
    if (!saved?.id) load(1) // nueva creación: recargar
  }

  const handleSaveStock = (updated) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
    setStockTarget(null)
  }

  const handleSearchSubmit = e => { e.preventDefault(); setSearch(searchInput); setPage(1) }

  if (error) return <p className="text-red-500 p-4">❌ {error}</p>

  return (
    <div className="space-y-5">

      {/* Stats */}
      <StatsBar products={products} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          {/* Búsqueda */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Buscar producto..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 w-52 transition-all"
            />
          </form>

          {/* Filtro categoría */}
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Filtro stock */}
          <select
            value={filterStock}
            onChange={e => setFilterStock(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white"
          >
            <option value="">Todo el stock</option>
            <option value="agotado">Agotados</option>
            <option value="critico">Stock crítico (≤5)</option>
            <option value="bajo">Stock bajo (≤20)</option>
            <option value="activo">Solo activos</option>
            <option value="inactivo">Solo inactivos</option>
          </select>

          {(filterCat || filterStock || search) && (
            <button onClick={() => { setFilterCat(''); setFilterStock(''); setSearch(''); setSearchInput('') }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800 border border-dashed border-gray-300 hover:border-gray-400 transition">
              <X size={12} /> Limpiar
            </button>
          )}
        </div>

        <button
          onClick={() => setEditProduct(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition shadow-sm flex-shrink-0"
        >
          <Plus size={14} /> Nuevo producto
        </button>
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-1 text-[11px] text-gray-400">
        <span className="mr-1">Ordenar:</span>
        {[['name','Nombre'],['price','Precio'],['stock','Stock'],['category','Categoría']].map(([f, l]) => (
          <button key={f} onClick={() => handleSort(f)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border transition ${sortBy === f ? 'border-gray-300 text-gray-700 bg-gray-50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {l} <SortIcon field={f} />
          </button>
        ))}
        <span className="ml-auto text-gray-400">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          {(filterCat || filterStock) && ` · filtrado de ${products.length}`}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16">
          <CoffeeLoader variant="grinder" message="Cargando inventario..." size="sm" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <Package size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Sin productos</p>
          <p className="text-gray-300 text-xs mt-1">Prueba con otros filtros o crea uno nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={setEditProduct}
              onDelete={setDeleteTarget}
              onStockEdit={setStockTarget}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-gray-400">Página {page} de {totalPages} · {total} productos totales</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={12} /> Anterior
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed">
              Siguiente <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editProduct !== null && (
        <ProductForm
          product={editProduct || null}
          onSave={handleSaveProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          product={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {stockTarget && (
        <StockEditor
          product={stockTarget}
          onSave={handleSaveStock}
          onClose={() => setStockTarget(null)}
        />
      )}
    </div>
  )
}