import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react'
import { getProducts } from '../routes/products'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const fetchedRef              = useRef(false)

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await getProducts()

      let arr = []
      if (Array.isArray(data))                    arr = data
      else if (Array.isArray(data.products))       arr = data.products
      else if (Array.isArray(data.data))           arr = data.data
      else if (Array.isArray(data.data?.products)) arr = data.data.products
      else if (data && typeof data === 'object')   arr = Object.values(data)

      // Mostramos todos los productos — los agotados se muestran como tal
      // basándonos en stock === 0, no en is_active
      setProducts(arr)
      return arr
    } catch (err) {
      console.error('[ProductContext] Error:', err)
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    loadProducts()
  }, [])

  const stockMap = useMemo(
    () => new Map(products.map(p => [p.id, p.stock ?? Infinity])),
    [products]
  )

  return (
    <ProductContext.Provider value={{ products, loading, loadProducts, stockMap }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts debe usarse dentro de <ProductProvider>')
  return ctx
}