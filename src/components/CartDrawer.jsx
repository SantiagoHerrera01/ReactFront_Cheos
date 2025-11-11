import React from 'react'
import { useCart } from '../context/CartContext'
import { createOrder } from '../routes/orders'
import { X, Trash2, Minus, Plus } from 'lucide-react'

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const subtotal = cart.reduce((s, i) => s + (i.price || 0) * i.quantity, 0)

  async function checkout() {
    const payload = {
      customer_name: 'Invitado',
      customer_email: 'guest@example.com',
      items: cart.map(i => ({
        product_id: i.id,
        product_name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      subtotal,
      total: subtotal,
      payment_method: 'CONTRA_ENTREGA'
    }

    try {
      await createOrder(payload)
      clearCart()
      alert('✅ Pedido creado correctamente.')
      onClose()
    } catch (e) {
      console.error(e)
      alert('❌ Error al crear el pedido.')
    }
  }

  return (
    <>
      {/* Fondo oscuro al abrir */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-coffee">Tu Carrito</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-600 text-center mt-10">🛒 Tu carrito está vacío</p>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-50 rounded-lg p-3 shadow-sm"
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-gray-600">
                    {item.quantity} × ${item.price}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between mb-3">
            <span className="font-semibold">Subtotal</span>
            <span className="font-bold text-coffee">${subtotal}</span>
          </div>
          <button
            onClick={checkout}
            disabled={!cart.length}
            className={`w-full py-2 rounded text-white ${
              cart.length
                ? 'bg-coffee hover:bg-coffee/80'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Finalizar compra
          </button>
        </div>
      </div>
    </>
  )
}
