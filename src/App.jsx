import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HeroCarousel from './components/HeroCarousel'
import ProductCarousel from './components/ProductCarousel'
import LocationsSection from './components/LocationsSection'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Dashboard from './pages/Dashboard'
import { CartProvider } from './context/CartContext'
import { UserProvider } from './context/UserContext'

export default function App(){
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <UserProvider>
      <CartProvider>
        <div className="min-h-screen bg-white text-black">

          <Routes>
            {/* TIENDA */}
            <Route
              path="/"
              element={
                <>
                  <Navbar onCartToggle={() => setCartOpen(true)} />
                  <main className="pt-20">
                    <HeroCarousel />
                    <ProductCarousel />
                    <LocationsSection />
                    <AboutSection />
                  </main>
                  <Footer />
                  <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
                </>
              }
            />

            {/* DASHBOARD */}
            <Route path="/admin" element={<Dashboard />} />
          </Routes>

        </div>
      </CartProvider>
    </UserProvider>
  )
}
