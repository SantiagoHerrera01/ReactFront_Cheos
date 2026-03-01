import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useUser } from './UserContext'
import { useProducts } from './ProductContext'
import {
  getCart,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCartAPI,
  syncCart,
} from '../routes/cart'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart]   = useState([])
  const { user, token }   = useUser()
  const { stockMap, loadProducts } = useProducts()  // ← ProductProvider ya envuelve esto
  const prevUserRef       = useRef(null)

  // ── Login / Logout ───────────────────────────────────────────────────────
  useEffect(() => {
    if (user && token && !prevUserRef.current) {
      mergeAndSyncCart()
    } else if (!user && prevUserRef.current) {
      setCart([])
    }
    prevUserRef.current = user
  }, [user, token])

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Cruza items de la API con el stockMap. Si el mapa está vacío, lo recarga primero. */
  const enrichWithStock = async (items) => {
    let map = stockMap

    if (map.size === 0) {
      const fresh = await loadProducts()
      map = new Map(fresh.map(p => [p.id, p.stock ?? Infinity]))
    }

    return items.map(item => ({
      ...item,
      stock: map.get(item.id) ?? item.stock,
    }))
  }

  const loadCartFromAPI = async () => {
    try {
      const data  = await getCart(token)
      const raw   = (data.data?.items || []).map(mapApiItem)
      const items = await enrichWithStock(raw)
      setCart(items)
    } catch (err) {
      console.error('[CartContext] Error cargando carrito:', err)
    }
  }

  const mergeAndSyncCart = async () => {
    try {
      if (cart.length > 0) {
        const localItems = cart.map(i => ({ product_id: i.id, quantity: i.quantity }))
        const data  = await syncCart(token, localItems)
        const raw   = (data.data?.items || []).map(mapApiItem)
        const items = await enrichWithStock(raw)
        setCart(items)
      } else {
        await loadCartFromAPI()
      }
    } catch (err) {
      console.error('[CartContext] Error sincronizando carrito:', err)
    }
  }

  // ── Operaciones ──────────────────────────────────────────────────────────

  const addToCart = (product) => {
    const available = stockMap.get(product.id) ?? product.stock
    let allowed = true

    setCart(prev => {
      const existing   = prev.find(p => p.id === product.id)
      const currentQty = existing?.quantity ?? 0

      if (available !== undefined && currentQty >= available) {
        allowed = false
        return prev
      }

      if (existing) {
        return prev.map(p =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      }

      return [...prev, { ...product, stock: available, quantity: 1 }]
    })

    if (allowed && user && token) {
      addCartItem(token, product.id, 1).catch(err =>
        console.error('[CartContext] Error sync addToCart:', err)
      )
    }

    return allowed
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id))
    if (user && token) {
      removeCartItem(token, id).catch(err =>
        console.error('[CartContext] Error sync removeFromCart:', err)
      )
    }
  }

  const updateQuantity = (id, qty) => {
    setCart(prev => {
      const item = prev.find(p => p.id === id)
      if (!item) return prev

      const available = stockMap.get(id) ?? item.stock
      const clamped   = Math.max(1, available !== undefined ? Math.min(qty, available) : qty)

      if (user && token) {
        updateCartItemQuantity(token, id, clamped).catch(err =>
          console.error('[CartContext] Error sync updateQuantity:', err)
        )
      }

      return prev.map(p => p.id === id ? { ...p, quantity: clamped } : p)
    })
  }

  const clearCart = () => {
    setCart([])
    if (user && token) {
      clearCartAPI(token).catch(err =>
        console.error('[CartContext] Error sync clearCart:', err)
      )
    }
  }

  /** Llamar tras orden exitosa: limpia carrito + refresca stocks del catálogo. */
  const onOrderSuccess = () => {
    clearCart()
    loadProducts()
  }

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      onOrderSuccess,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

// ── Utilidad interna ─────────────────────────────────────────────────────────
function mapApiItem(item) {
  return {
    id:       item.product_id,
    name:     item.product_name,
    price:    item.product_price,
    image:    item.product_image,
    quantity: item.quantity,
    // stock se inyecta después via enrichWithStock
  }
}