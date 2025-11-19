import React from 'react'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { useAlert } from '../context/AlertContext'
import { Pencil, Trash2 } from 'lucide-react'

export default function ProductCard({ product, onOpenCart, onEdit, onDelete }) {
  const { addToCart } = useCart()
  const { user } = useUser()
  const { confirmDelete } = useAlert()
  const isAdmin = user?.role === 'ADMIN'

  const handleAdd = () => {
    addToCart(product)
    if (onOpenCart) onOpenCart()
  }

  const handleEdit = () => {
    if (!onEdit) return
    onEdit(product)
  }

  // 🔧 Eliminar con SweetAlert global
  const handleDelete = async () => {
    const ok = await confirmDelete(product.name);

    if (!ok) return
    onDelete?.(product.id)
  }

  return (
    <div className="relative w-full md:w-[260px] h-auto md:h-[400px] bg-white rounded-2xl shadow-lg border border-gray-100 flex-shrink-0 hover:shadow-xl transition overflow-hidden">
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />

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

      <div className="p-4 flex flex-col justify-between h-[calc(100%-176px)]">
        <div className="overflow-hidden">
          <h3 className="font-semibold text-black text-base line-clamp-1">{product.name}</h3>
          <div className="text-sm text-gray-600 h-[70px] overflow-y-auto custom-scrollbar pr-1">
            {product.description}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-coffee font-bold text-lg">${product.price}</span>
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
