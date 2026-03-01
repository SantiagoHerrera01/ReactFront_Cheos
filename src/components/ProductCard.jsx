import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { useAlert } from '../context/AlertContext'
import { Pencil, Trash2, Star } from 'lucide-react'

export default function ProductCard({ product, onOpenCart, onEdit, onDelete }) {
  const { addToCart, cart } = useCart()
  const { user } = useUser()
  const { confirmDelete, successToast, errorAlert } = useAlert()
  const isAdmin = user?.role === 'ADMIN'

  const [rating, setRating] = useState(0)

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock !== undefined && product.stock <= 10 && product.stock > 0

  // Unidades que el usuario ya tiene en el carrito para este producto
  const inCart = cart.find(i => i.id === product.id)?.quantity ?? 0
  const isMaxReached = product.stock !== undefined && inCart >= product.stock

  const formatPrice = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)

  const handleAdd = () => {
    if (isOutOfStock) return

    if (isMaxReached) {
      errorAlert(
        `Solo hay ${product.stock} unidad${product.stock === 1 ? '' : 'es'} disponible${product.stock === 1 ? '' : 's'} de "${product.name}" y ya las tienes todas en tu carrito.`
      )
      return
    }

    const added = addToCart(product)
    if (added) {
      successToast(`${product.name} agregado al carrito 🛒`)
      if (onOpenCart) onOpenCart()
    }
  }

  const handleEdit = () => onEdit?.(product)

  const handleDelete = async () => {
    const ok = await confirmDelete(product.name)
    if (!ok) return
    onDelete?.(product.id)
  }

  const buttonDisabled = isOutOfStock || isMaxReached

  return (
    <div
      className={`relative w-full md:w-[260px] h-auto md:h-[400px] bg-white rounded-2xl shadow-lg border border-gray-100 flex-shrink-0 hover:shadow-xl transition overflow-hidden ${
        isOutOfStock ? 'order-last' : ''
      }`}
    >
      {/* Imagen */}
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition ${isOutOfStock ? 'grayscale' : ''}`}
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-wider">PRODUCTO AGOTADO</span>
          </div>
        )}

        {!isOutOfStock && isMaxReached && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center px-3 text-center">
            <span className="text-white font-bold text-xs tracking-wide leading-snug">
              YA TIENES EL MÁXIMO DISPONIBLE EN TU CARRITO
            </span>
          </div>
        )}

        {isLowStock && !isMaxReached && (
          <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow">
            Pocas unidades
          </div>
        )}

        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleEdit}
              className="bg-white/90 hover:bg-coffee hover:text-white p-1.5 rounded-lg shadow transition-colors"
              title="Editar producto"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="bg-white/90 hover:bg-red-500 hover:text-white p-1.5 rounded-lg shadow transition-colors"
              title="Eliminar producto"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col justify-between h-[calc(100%-176px)]">
        <div className="overflow-hidden">
          <h3 className="font-bold text-black text-lg tracking-wide line-clamp-1 uppercase">
            {product.name}
          </h3>

          {(product.weight || product.category) && (
            <div className="flex justify-between text-base text-gray-700 mt-1">
              {product.weight && (
                <p><span className="font-semibold">Peso:</span> {product.weight} g</p>
              )}
              {product.category && (
                <p><span className="font-semibold">Tipo:</span> {product.category}</p>
              )}
            </div>
          )}

          <div className="text-sm text-gray-600 h-[50px] overflow-y-auto custom-scrollbar pr-1 mt-2">
            {product.description}
          </div>

          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                onClick={() => setRating(star)}
                className={`cursor-pointer transition ${
                  star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-coffee font-bold text-lg">{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            disabled={buttonDisabled}
            className={`px-3 py-1.5 rounded-lg shadow-md transition-colors duration-200 text-white ${
              buttonDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#3b2f2f] hover:bg-[#5a4332]'
            }`}
          >
            {isMaxReached && !isOutOfStock ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}