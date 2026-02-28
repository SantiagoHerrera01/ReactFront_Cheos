import React, { useEffect, useRef, useState } from 'react'
import { getProducts } from '../routes/products'
import { useUser } from '../context/UserContext'
import { useAlert } from '../context/AlertContext'
import ProductCard from './ProductCard'
import AddProductModal from './AddProductModal'
import EditProductModal from './EditProductModal'
import CoffeeLoader from './Coffeeloader'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductCarousel() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [canScroll, setCanScroll] = useState(false)

  const carouselRef = useRef(null)

  const { user, token } = useUser()
  const { successToast, errorAlert } = useAlert()
  const isAdmin = user?.role === 'ADMIN'

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
      console.error('Error cargando productos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const container = carouselRef.current
    if (!container) return

    const checkOverflow = () => {
      setCanScroll(container.scrollWidth > container.clientWidth)
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [products, isAdmin])

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        errorAlert('Error eliminando el producto')
        return
      }

      successToast('Producto eliminado')
      loadProducts()
    } catch (e) {
      errorAlert('No se pudo eliminar')
    }
  }

  const scroll = (dir) => {
    if (!canScroll) return
    const container = carouselRef.current
    if (!container) return
    container.scrollTo({
      left: dir === 'left'
        ? container.scrollLeft - 280
        : container.scrollLeft + 280,
      behavior: 'smooth'
    })
  }

  return (
    <section id="products" className="py-12 bg-white text-black">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-coffee mb-8">
          Nuestros Productos
        </h2>

        {loading ? (
          <CoffeeLoader variant="grinder" message="Cargando productos..." />
        ) : (
          <>
            {/* 📱 MOBILE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
              {isAdmin && (
                <div
                  onClick={() => setAddOpen(true)}
                  className="w-full h-[240px] flex flex-col items-center justify-center
                             bg-[#f9f6f2] border-2 border-dashed border-coffee/50
                             rounded-2xl cursor-pointer hover:bg-[#f1ece7]"
                >
                  <span className="text-coffee text-5xl font-bold mb-2">+</span>
                  <p className="text-coffee font-medium">Agregar producto</p>
                </div>
              )}
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={setEditProduct}
                  onDelete={handleDelete}
                  onOpenCart={() => {}}
                />
              ))}
            </div>

            {/* 🖥️ DESKTOP */}
            <div className="hidden md:flex items-center relative">
              {canScroll && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-[-50px] top-1/2 -translate-y-1/2
                             p-3 bg-white/90 hover:bg-coffee hover:text-white
                             rounded-full shadow-lg transition"
                >
                  <ChevronLeft size={26} />
                </button>
              )}

              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-hidden w-full py-2"
              >
                {isAdmin && (
                  <div
                    onClick={() => setAddOpen(true)}
                    className="w-[260px] h-[400px] flex-shrink-0
                               flex flex-col items-center justify-center
                               bg-[#f9f6f2] border-2 border-dashed border-coffee/50
                               rounded-2xl cursor-pointer hover:bg-[#f1ece7]"
                  >
                    <span className="text-coffee text-5xl font-bold mb-2">+</span>
                    <p className="text-coffee font-medium">Agregar producto</p>
                  </div>
                )}
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onEdit={setEditProduct}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {canScroll && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-[-50px] top-1/2 -translate-y-1/2
                             p-3 bg-white/90 hover:bg-coffee hover:text-white
                             rounded-full shadow-lg transition"
                >
                  <ChevronRight size={26} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <AddProductModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={loadProducts}
        token={token}
      />

      <EditProductModal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        onUpdated={loadProducts}
        token={token}
      />
    </section>
  )
}