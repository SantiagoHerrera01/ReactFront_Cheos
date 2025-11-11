import React, { useEffect, useState } from 'react'
import { getProducts } from '../routes/products'
import { useCart } from '../context/CartContext'
import ProductCard from './ProductCard'

export default function ProductCarousel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    let mounted = true

    const loadProducts = async () => {
      try {
        const data = await getProducts()
        if (mounted) {
          let arr = []
          if (Array.isArray(data)) arr = data
          else if (Array.isArray(data.products)) arr = data.products
          else if (Array.isArray(data.data)) arr = data.data
          else if (Array.isArray(data.data?.products)) arr = data.data.products
          else if (data && typeof data === 'object') arr = Object.values(data)
          setProducts(arr)
        }
      } catch (err) {
        console.error('❌ Error cargando productos:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProducts()
    return () => { mounted = false }
  }, [])

  return (
    <section id="products" className="py-12 bg-white text-black">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-coffee mb-6">
          Nuestros Productos
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Cargando...</p>
        ) : products.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto scroll-smooth py-2">
            {products.map((p, i) => (
              <ProductCard
                key={p.id || p.name || i}
                product={p}
                onAdd={() => addToCart(p)} // ✅ Aquí lo agregamos al carrito
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No hay productos disponibles.
          </p>
        )}
      </div>
    </section>
  )
}
