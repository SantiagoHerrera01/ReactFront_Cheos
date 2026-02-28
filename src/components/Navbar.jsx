import React, { useState } from 'react'
import { ShoppingCart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import ModalLoginRegister from './ModalLoginRegister'
import UserManagementModal from './UserManagementModal'
import GalleryManagementModal from './GalleryManagementModal'
import CarouselEditorModal from './CarouselEditorModal'
import DiscountManagementModal from './DiscountManagementModal'
import ProfileModal from './ProfileModal'
import { TypeAnimation } from 'react-type-animation'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ onCartToggle }) {
  const { cart } = useCart()
  const { user, logout, loading } = useUser()
  const navigate = useNavigate()

  const count = cart.reduce((s, i) => s + i.quantity, 0)

  const scrollTo = id =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [carouselModalOpen, setCarouselModalOpen] = useState(false)
  const [discountModalOpen, setDiscountModalOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [showCafe, setShowCafe] = useState(false)

  const formatName = (name) => {
    if (!name) return ''
    return name
      .toLowerCase()
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) return null

  return (
    <>
      <nav className="fixed w-full z-40 bg-white text-black shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-2">
            <Link to="/">
              <img
                src="/LogoCheos.png"
                alt="Logo Cheo's Café"
                className="w-10 h-10 object-contain"
              />
            </Link>

            <h1 className="text-2xl font-bold flex gap-1">
              <TypeAnimation
                sequence={["Cheo's", () => setShowCafe(true)]}
                speed={40}
                cursor={false}
                wrapper="span"
                className="text-black"
              />
              {showCafe && (
                <TypeAnimation
                  sequence={["Café"]}
                  speed={40}
                  cursor={false}
                  wrapper="span"
                  className="text-[#A67C52]"
                />
              )}
            </h1>
          </div>

          <div className="hidden md:flex gap-6 items-center">
            <button onClick={() => scrollTo('hero')}>Inicio</button>
            <button onClick={() => scrollTo('products')}>Productos</button>
            <button onClick={() => scrollTo('locations')}>Tiendas</button>
            <button onClick={() => scrollTo('about')}>Nosotros</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onCartToggle} className="relative p-2 bg-black text-white rounded-lg">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#A67C52] text-white rounded-full px-2 text-xs">
                  {count}
                </span>
              )}
            </button>

            {!user ? (
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#A67C52] text-white px-3 py-2 rounded-lg"
              >
                <User className="w-4 h-4 inline" /> Iniciar Sesión
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-gray-200 px-3 py-2 rounded-lg"
                >
                  <User className="w-4 h-4 inline" /> {formatName(user.name)}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white shadow rounded-lg w-56">

                    {/* PERFIL RÁPIDO */}
                    <button
                      onClick={() => { setProfileOpen(true); setDropdownOpen(false) }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Mi Perfil
                    </button>

                    {/* DASHBOARD EMPRESARIAL (SOLO ADMIN) */}
                    {user.role === 'ADMIN' && (
                      <>
                        <div className="border-t my-1"></div>

                        <button
                          onClick={() => { navigate('/admin'); setDropdownOpen(false) }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 font-semibold text-[#A67C52]"
                        >
                          Dashboard empresarial
                        </button>

                        {/* ESTO SE QUEDA EN NAVBAR (NO SE MUEVE) */}
                        <button
                          onClick={() => { setUserModalOpen(true); setDropdownOpen(false) }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Gestión de usuarios
                        </button>

                        <button
                          onClick={() => { setGalleryModalOpen(true); setDropdownOpen(false) }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Gestión de galería
                        </button>

                        <button
                          onClick={() => { setCarouselModalOpen(true); setDropdownOpen(false) }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Editar carrusel
                        </button>

                        <button
                          onClick={() => { setDiscountModalOpen(true); setDropdownOpen(false) }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Gestión de códigos
                        </button>
                      </>
                    )}

                    <div className="border-t my-1"></div>

                    <button
                      onClick={() => { logout(); setDropdownOpen(false) }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modales */}
      <ModalLoginRegister open={modalOpen} onClose={() => setModalOpen(false)} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      {userModalOpen && <UserManagementModal onClose={() => setUserModalOpen(false)} />}
      {galleryModalOpen && <GalleryManagementModal onClose={() => setGalleryModalOpen(false)} />}
      {carouselModalOpen && <CarouselEditorModal onClose={() => setCarouselModalOpen(false)} />}
      {discountModalOpen && (
        <DiscountManagementModal open={discountModalOpen} onClose={() => setDiscountModalOpen(false)} />
      )}
    </>
  )
}
