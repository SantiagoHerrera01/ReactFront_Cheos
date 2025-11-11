import React from 'react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product, onOpenCart }) {
  const { addToCart } = useCart()

  const handleAdd = () => {
    addToCart(product)
    if (onOpenCart) onOpenCart() // ✅ abre el carrito después de agregar
  }

  return (
    <div className="min-w-[260px] bg-white rounded-2xl shadow overflow-hidden flex-shrink-0 hover:scale-[1.02] transition-transform duration-200 border border-gray-100">
      <img
        src={product.images?.[0] || product.image}
        alt={product.name}
        className="w-full h-44 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-black">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-coffee font-bold">${product.price}</span>
          <button
            onClick={handleAdd}
            className="bg-[#3b2f2f] hover:bg-[#5a4332] text-white px-3 py-1.5 rounded-lg shadow-md transition-colors duration-200"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
