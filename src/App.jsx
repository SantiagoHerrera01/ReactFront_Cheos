import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HeroCarousel from './components/HeroCarousel'
import ProductCarousel from './components/ProductCarousel'
import LocationsSection from './components/LocationsSection'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Dashboard from './pages/Dashboard'
import ResetPassword from './pages/ResetPassword'
import { ProductProvider } from './context/Productcontext' // ← nuevo
import { CartProvider } from './context/CartContext'
import { UserProvider } from './context/UserContext'
import FloatingSocialMenu from './components/FloatingSocialMenu'
import CoffeeLoader from './components/Coffeeloader'

export default function App() {
  const [cartOpen, setCartOpen]     = useState(false)
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    const done = () => setAppLoading(false)
    if (document.readyState === 'complete') {
      const t = setTimeout(done, 800)
      return () => clearTimeout(t)
    }
    window.addEventListener('load', done)
    return () => window.removeEventListener('load', done)
  }, [])

  if (appLoading) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center gap-2">
        <CoffeeLoader variant="pour" message="Preparando tu experiencia..." />
      </div>
    )
  }

  return (
    <UserProvider>
      <ProductProvider>      {/* ← envuelve CartProvider para que CartContext acceda al stockMap */}
        <CartProvider>
          <div className="min-h-screen bg-white text-black">
            <Routes>

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
                      <FloatingSocialMenu
                        whatsapp="573156643243"
                        facebook="https://www.facebook.com/share/1HYt3R7zfo/?mibextid=wwXIfr"
                        instagram="https://www.instagram.com/omarcarvajal.coffee?igsh=MThpZHhjb2Uxa202YQ=="
                        tiktok="https://www.tiktok.com/@cheos_cafe?_r=1&_t=ZS-94CPj2kyOHN"
                      />
                    </main>
                    <Footer />
                    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
                  </>
                }
              />

              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<Dashboard />} />

            </Routes>
          </div>
        </CartProvider>
      </ProductProvider>
    </UserProvider>
  )
}