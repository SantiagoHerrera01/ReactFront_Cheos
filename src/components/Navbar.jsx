import React, { useState } from 'react'
import { ShoppingCart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import ModalLoginRegister from './ModalLoginRegister'
import UserManagementModal from './UserManagementModal'
import GalleryManagementModal from './GalleryManagementModal'
import CarouselEditorModal from './CarouselEditorModal'

export default function Navbar({ onCartToggle }) {
  const { cart } = useCart()
  const { user, logout, loading } = useUser()
  const count = cart.reduce((s,i)=>s+i.quantity,0)
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({behavior:'smooth'})

  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [carouselModalOpen, setCarouselModalOpen] = useState(false)

  // Mientras carga el contexto, podemos mostrar un spinner o placeholder
  if (loading) return null

  const handleCarouselSave = () => {
    // Disparar evento para que el HeroCarousel se actualice
    window.dispatchEvent(new Event('carouselUpdated'))
  }

  return (
    <>
      <nav className="fixed w-full z-40 bg-white text-black shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-black">
              Cheos <span className="text-coffee">Café</span>
            </div>
          </div>

          <div className="hidden md:flex gap-6 items-center">
            <button onClick={()=>scrollTo('hero')} className="hover:text-coffee">Inicio</button>
            <button onClick={()=>scrollTo('products')} className="hover:text-coffee">Productos</button>
            <button onClick={()=>scrollTo('locations')} className="hover:text-coffee">Tiendas</button>
            <button onClick={()=>scrollTo('about')} className="hover:text-coffee">Nosotros</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onCartToggle} className="relative p-2 bg-black text-white rounded-lg">
              <ShoppingCart className="w-5 h-5"/>
              {count>0 && (
                <span className="absolute -top-2 -right-2 bg-coffee text-white rounded-full px-2 text-xs">{count}</span>
              )}
            </button>

            {!user ? (
              <button
                onClick={()=>setModalOpen(true)}
                className="flex items-center gap-1 bg-coffee text-white px-3 py-2 rounded-lg hover:bg-coffee/90"
              >
                <User className="w-4 h-4"/> Iniciar Sesión
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={()=>setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
                >
                  <User className="w-4 h-4"/> {user.name}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg py-2 w-48 flex flex-col">
                    <button className="px-4 py-2 text-left hover:bg-gray-100">Perfil</button>

                    {user.role === 'ADMIN' && (
                      <>
                        <div className="border-t my-1"></div>
                        <p className="px-4 py-1 text-xs text-gray-500 font-semibold">Admin</p>
                        <button
                          onClick={() => { setUserModalOpen(true); setDropdownOpen(false) }}
                          className="px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Gestión de usuarios
                        </button>
                        <button
                          onClick={() => { setGalleryModalOpen(true); setDropdownOpen(false) }}
                          className="px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Gestión de galería
                        </button>
                        <button
                          onClick={() => { setCarouselModalOpen(true); setDropdownOpen(false) }}
                          className="px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Editar carrusel
                        </button>
                      </>
                    )}

                    <div className="border-t my-1"></div>
                    <button
                      onClick={() => { logout(); setDropdownOpen(false) }}
                      className="px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modal de login/registro */}
      <ModalLoginRegister open={modalOpen} onClose={()=>setModalOpen(false)} />

      {/* Modal de gestión de usuarios */}
      {userModalOpen && <UserManagementModal onClose={()=>setUserModalOpen(false)} />}

      {/* Modal de gestión de galería */}
      {galleryModalOpen && <GalleryManagementModal onClose={()=>setGalleryModalOpen(false)} />}

      {/* Modal de edición de carrusel */}
      {carouselModalOpen && (
        <CarouselEditorModal
          onClose={() => setCarouselModalOpen(false)}
          onSave={handleCarouselSave}
        />
      )}
    </>
  )
}
