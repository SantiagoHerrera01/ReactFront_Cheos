import React, { useState } from 'react'
import Navbar from './components/Navbar'
import HeroCarousel from './components/HeroCarousel'
import ProductCarousel from './components/ProductCarousel'
import LocationsSection from './components/LocationsSection'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import { CartProvider } from './context/CartContext'
import { UserProvider } from './context/UserContext' // <- IMPORTA EL PROVIDER

export default function App(){
  const [cartOpen, setCartOpen] = useState(false)
  return (
    <UserProvider>  {/* <- ENVUELVE TODO EN UserProvider */}
      <CartProvider>
        <div className="min-h-screen bg-white text-black">
          <Navbar onCartToggle={() => setCartOpen(true)} />
          <main className="pt-20">
            <HeroCarousel />
            <ProductCarousel />
            <LocationsSection />
            <AboutSection />
          </main>
          <Footer />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
      </CartProvider>
    </UserProvider>
  )
}
