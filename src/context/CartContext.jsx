import React, { createContext, useContext, useState } from 'react'
const CartContext = createContext()
export function CartProvider({children}){
  const [cart,setCart] = useState([])
  const addToCart = (product)=>{
    setCart(prev=>{
      const ex = prev.find(p=>p.id===product.id)
      if(ex) return prev.map(p=>p.id===product.id?{...p,quantity:p.quantity+1}:p)
      return [...prev,{...product,quantity:1}]
    })
  }
  const removeFromCart = (id)=> setCart(prev=>prev.filter(p=>p.id!==id))
  const updateQuantity = (id,qty)=> setCart(prev=>prev.map(p=>p.id===id?{...p,quantity:qty}:p))
  const clearCart = ()=> setCart([])
  return <CartContext.Provider value={{cart,addToCart,removeFromCart,updateQuantity,clearCart}}>{children}</CartContext.Provider>
}
export const useCart = ()=> useContext(CartContext)
