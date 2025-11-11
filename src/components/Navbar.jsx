import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
export default function Navbar({onCartToggle}){
  const {cart} = useCart()
  const count = cart.reduce((s,i)=>s+i.quantity,0)
  const scrollTo = id=> document.getElementById(id)?.scrollIntoView({behavior:'smooth'})
  return (
    <nav className="fixed w-full z-40 bg-white text-black shadow">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-black">Cheos <span className="text-coffee">Café</span></div>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <button onClick={()=>scrollTo('hero')} className="hover:text-coffee">Inicio</button>
          <button onClick={()=>scrollTo('products')} className="hover:text-coffee">Productos</button>
          <button onClick={()=>scrollTo('locations')} className="hover:text-coffee">Tiendas</button>
          <button onClick={()=>scrollTo('about')} className="hover:text-coffee">Nosotros</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCartToggle} className="relative p-2 bg-black text-white rounded-lg"> <ShoppingCart className="w-5 h-5"/> {count>0 && <span className="absolute -top-2 -right-2 bg-coffee text-white rounded-full px-2 text-xs">{count}</span>}</button>
        </div>
      </div>
    </nav>
  )
}
