import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useUser } from './UserContext'
import { getCart, addCartItem, updateCartItemQuantity, removeCartItem, clearCartAPI, syncCart } from '../routes/cart'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const { user, token } = useUser()
  const prevUserRef = useRef(null)

  // Detectar login/logout
  useEffect(() => {
    if (user && token && !prevUserRef.current) {
      // Usuario acaba de loguearse: fusionar carrito
      mergeAndSyncCart()
    } else if (!user && prevUserRef.current) {
      // Usuario cerró sesión: limpiar
      setCart([])
    }
    prevUserRef.current = user
  }, [user, token])

  // Cargar carrito desde API
  const loadCartFromAPI = async () => {
    try {
      const data = await getCart(token)
      const items = (data.data?.items || []).map(item => ({
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        image: item.product_image,
        quantity: item.quantity
      }))
      setCart(items)
    } catch (err) {
      console.error('Error cargando carrito:', err)
    }
  }

  // Fusionar carrito local con el guardado al hacer login
  const mergeAndSyncCart = async () => {
    try {
      if (cart.length > 0) {
        // Hay items locales: sincronizar con la API
        const localItems = cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
        const data = await syncCart(token, localItems)
        const items = (data.data?.items || []).map(item => ({
          id: item.product_id,
          name: item.product_name,
          price: item.product_price,
          image: item.product_image,
          quantity: item.quantity
        }))
        setCart(items)
      } else {
        // Sin items locales: cargar el guardado
        await loadCartFromAPI()
      }
    } catch (err) {
      console.error('Error sincronizando carrito:', err)
    }
  }

  const addToCart = (product) => {
    // Optimistic update local
    setCart(prev => {
      const ex = prev.find(p => p.id === product.id)
      if (ex) return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
      return [...prev, { ...product, quantity: 1 }]
    })

    // Sync con API en background si está logueado
    if (user && token) {
      addCartItem(token, product.id, 1).catch(err => console.error('Error sync addToCart:', err))
    }
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id))

    if (user && token) {
      removeCartItem(token, id).catch(err => console.error('Error sync removeFromCart:', err))
    }
  }

  const updateQuantity = (id, qty) => {
    setCart(prev => prev.map(p => p.id === id ? { ...p, quantity: qty } : p))

    if (user && token) {
      updateCartItemQuantity(token, id, qty).catch(err => console.error('Error sync updateQuantity:', err))
    }
  }

  const clearCart = () => {
    setCart([])

    if (user && token) {
      clearCartAPI(token).catch(err => console.error('Error sync clearCart:', err))
    }
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
