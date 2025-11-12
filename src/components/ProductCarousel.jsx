import React, { useEffect, useRef, useState } from 'react'
import { getProducts } from '../routes/products'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import ProductCard from './ProductCard'
import AddProductModal from './AddProductModal'
import EditProductModal from './EditProductModal'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductCarousel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const carouselRef = useRef(null)

  const { addToCart } = useCart()
  const { user, token } = useUser()
  const isAdmin = user?.role === 'ADMIN'

  // 🔁 Cargar productos
  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      let arr = []
      if (Array.isArray(data)) arr = data
      else if (Array.isArray(data.products)) arr = data.products
      else if (Array.isArray(data.data)) arr = data.data
      else if (Array.isArray(data.data?.products)) arr = data.data.products
      else if (data && typeof data === 'object') arr = Object.values(data)
      setProducts(arr)
    } catch (err) {
      console.error('❌ Error cargando productos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // 🗑️ Eliminar producto
  const handleDelete = async (id) => {
    console.log("🗑️ Intentando eliminar producto:", id)

    try {
      const response = await fetch(`http://localhost:8080/api/v1/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log("📩 Respuesta del servidor DELETE:", response.status)
      const data = await response.json().catch(() => ({}))
      console.log("📦 Data de respuesta DELETE:", data)

      if (response.status === 401) {
        alert("⚠️ No autorizado. Debes iniciar sesión como admin.")
        return
      }

      if (!response.ok) {
        console.error("❌ Error al eliminar:", data)
        alert(data.message || 'No se pudo eliminar el producto')
        return
      }

      alert('✅ Producto eliminado correctamente')
      await loadProducts()
    } catch (error) {
      console.error("🚨 Error en DELETE:", error)
      alert('Error al eliminar producto')
    }
  }

  // ✏️ Abrir modal de edición
  const handleEdit = (product) => {
    setEditProduct(product)
    setEditOpen(true)
  }

  // ⬅️➡️ Navegación del carrusel
  const scroll = (direction) => {
    const container = carouselRef.current
    if (!container) return

    const scrollAmount = 320
    const newScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    })
  }

  return (
    <section id="products" className="py-12 bg-white text-black relative">
      <div className="max-w-6xl mx-auto px-6 relative">
        <h2 className="text-3xl font-bold text-center text-coffee mb-6">
          Nuestros Productos
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Cargando...</p>
        ) : products.length > 0 ? (
          <div className="relative flex items-center">
            {/* 🔘 Botón Izquierdo */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-[-80px] top-1/2 -translate-y-1/2 
                        p-3 bg-white/90 hover:bg-coffee hover:text-white 
                        rounded-full shadow-lg transition-all duration-300"
            >
              <ChevronLeft size={26} />
            </button>

            {/* 🎠 Carrusel de productos */}
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-hidden scroll-smooth py-2 w-full"
            >
              {/* 🧩 Card para agregar producto (solo admin) */}
              {isAdmin && (
                <div
                  onClick={() => setAddOpen(true)}
                  className="w-[260px] h-[400px] flex flex-col items-center justify-center 
                             bg-[#f9f6f2] border-2 border-dashed border-coffee/50 
                             rounded-2xl cursor-pointer hover:bg-[#f1ece7] 
                             transition-all duration-200 flex-shrink-0"
                >
                  <span className="text-coffee text-5xl font-bold mb-2">+</span>
                  <p className="text-coffee font-medium">Agregar producto</p>
                </div>
              )}

              {products.map((p, i) => (
                <ProductCard
                  key={p.id || p.name || i}
                  product={p}
                  onAdd={() => addToCart(p)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* 🔘 Botón Derecho */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-[-80px] top-1/2 -translate-y-1/2 
                        p-3 bg-white/90 hover:bg-coffee hover:text-white 
                        rounded-full shadow-lg transition-all duration-300"
            >
              <ChevronRight size={26} />
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No hay productos disponibles.
          </p>
        )}
      </div>

      {/* 🪄 Modales */}
      <AddProductModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={loadProducts}
        token={token}
      />

      <EditProductModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={loadProducts}
        product={editProduct}
        token={token}
      />
    </section>
  )
}
