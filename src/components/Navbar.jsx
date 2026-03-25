import React, { useState, useEffect, useRef } from 'react'
import { ShoppingCart, User, Menu, X, ArrowRight, ChevronRight, Bell, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { useNotifications } from '../hooks/useNotifications'
import ModalLoginRegister from './ModalLoginRegister'
import UserManagementModal from './UserManagementModal'
import GalleryManagementModal from './GalleryManagementModal'
import CarouselEditorModal from './CarouselEditorModal'
import DiscountManagementModal from './DiscountManagementModal'
import ProfileModal from './ProfileModal'
import { TypeAnimation } from 'react-type-animation'
import { Link, useNavigate } from 'react-router-dom'

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'Ahora mismo'
  if (m < 60) return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h}h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Ayer' : `Hace ${d} días`
}

const ICON_MAP = {
  confirmed:  { emoji: '☕', bg: 'bg-amber-50'   },
  processing: { emoji: '🫘', bg: 'bg-orange-50'  },
  shipped:    { emoji: '🚚', bg: 'bg-blue-50'    },
  delivered:  { emoji: '✓',  bg: 'bg-emerald-50' },
  cancelled:  { emoji: '✕',  bg: 'bg-red-50'     },
}

function NotificationPanel({ notifications, unreadCount, onMarkAllRead, onMarkRead, onClose }) {
  const panelRef = useRef(null)

  useEffect(() => {
    const fn = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [onClose])

  // Estilo Facebook: marcar todas como leídas 2s después de abrir el panel
  useEffect(() => {
    if (unreadCount === 0) return
    const t = setTimeout(() => onMarkAllRead(), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      style={{ animation: 'npIn 0.2s cubic-bezier(.34,1.56,.64,1) both' }}
    >
      <style>{`
        @keyframes npIn { from{opacity:0;transform:scale(0.93) translateY(-6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes npItemIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes npDotPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.6);opacity:.7} }
      `}</style>

      <div className="flex items-center justify-between px-4 py-3.5 bg-neutral-900">
        <div className="flex items-center gap-2.5">
          <Bell size={14} className="text-[#C9A84C]"/>
          <span className="text-white font-semibold text-sm">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="bg-[#C9A84C] text-[#1a0d04] text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button onClick={onMarkAllRead} className="flex items-center gap-1 text-[11px] text-[#C9A84C] hover:text-amber-300 font-semibold transition-colors">
            <Check size={11}/> Marcar leídas
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto overscroll-contain divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <Bell size={20} className="text-neutral-300"/>
            </div>
            <p className="text-sm text-neutral-400 font-medium">Sin notificaciones</p>
            <p className="text-xs text-neutral-300 text-center px-6">Te avisaremos cada vez que tu pedido se actualice</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const isUnread  = n.status === 'UNREAD'
            const iconData  = ICON_MAP[n.icon] ?? { emoji: '📦', bg: 'bg-gray-50' }
            const parts     = n.body.split(n.order_number)
            return (
              <div
                key={n.id}
                onClick={() => isUnread && onMarkRead(n.id)}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors duration-150 select-none ${isUnread ? 'bg-amber-50/70 hover:bg-amber-50' : 'bg-white hover:bg-gray-50'}`}
                style={{ animation: `npItemIn 0.2s ease-out ${i * 0.035}s both` }}
              >
                <div className="flex-shrink-0 flex items-center mt-1.5">
                  {isUnread
                    ? <div className="w-2 h-2 rounded-full bg-[#C9A84C]" style={{ animation: 'npDotPulse 2s ease-in-out infinite' }}/>
                    : <div className="w-2 h-2"/>}
                </div>
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${iconData.bg} flex items-center justify-center text-base`}>
                  {iconData.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-tight ${isUnread ? 'text-neutral-900' : 'text-neutral-600'}`}>{n.title}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    {parts.map((part, idx) => (
                      <span key={idx}>{part}{idx < parts.length - 1 && <span className="font-bold text-[#C9A84C]">{n.order_number}</span>}</span>
                    ))}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] text-neutral-400 text-center">Las notificaciones se marcan como leídas al abrir este panel</p>
        </div>
      )}
    </div>
  )
}

function IncompleteProfileBanner({ onComplete, onDismiss }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t) }, [])
  const handleDismiss  = () => { setVisible(false); setTimeout(onDismiss,  280) }
  const handleComplete = () => { setVisible(false); setTimeout(onComplete, 200) }
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="bg-neutral-900 border-b border-[#A67C52]/40">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
          <span className="flex-shrink-0 text-sm">☕</span>
          <p className="flex-1 min-w-0 text-xs text-neutral-300 font-medium truncate">
            <span className="text-white font-semibold">Perfil incompleto</span>
            <span className="hidden sm:inline text-neutral-500 mx-1">—</span>
            <span className="hidden sm:inline">Completa tus datos para poder realizar pedidos.</span>
          </p>
          <button onClick={handleComplete} className="flex-shrink-0 flex items-center gap-1 bg-[#A67C52] text-white px-2.5 py-1 rounded-md text-xs font-bold hover:bg-[#8f6846] transition-all">
            Completar <ArrowRight size={10} />
          </button>
          <button onClick={handleDismiss} className="flex-shrink-0 text-neutral-500 hover:text-white transition-colors">
            <X size={13} />
          </button>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#A67C52]/50 to-transparent" />
      </div>
    </div>
  )
}

export default function Navbar({ onCartToggle }) {
  const { cart }    = useCart()
  const { user, token, logout, loading, profileIncomplete, dismissProfileAlert } = useUser()
  const navigate    = useNavigate()
  const count       = cart.reduce((s, i) => s + i.quantity, 0)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user, token)

  const [notifOpen,         setNotifOpen]         = useState(false)
  const [modalOpen,         setModalOpen]         = useState(false)
  const [dropdownOpen,      setDropdownOpen]      = useState(false)
  const [mobileOpen,        setMobileOpen]        = useState(false)
  const [userModalOpen,     setUserModalOpen]     = useState(false)
  const [galleryModalOpen,  setGalleryModalOpen]  = useState(false)
  const [carouselModalOpen, setCarouselModalOpen] = useState(false)
  const [discountModalOpen, setDiscountModalOpen] = useState(false)
  const [profileOpen,       setProfileOpen]       = useState(false)
  const [showCafe,          setShowCafe]          = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fn = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  useEffect(() => { document.body.style.overflow = mobileOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [mobileOpen])
  useEffect(() => { if (dropdownOpen) setNotifOpen(false) }, [dropdownOpen])
  useEffect(() => { if (notifOpen)    setDropdownOpen(false) }, [notifOpen])

  const scrollTo    = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false) }
  const openProfile = ()   => { setProfileOpen(true); setDropdownOpen(false); setMobileOpen(false) }
  const handleComplete = () => { dismissProfileAlert(); setProfileOpen(true) }
  const formatName  = (name) => {
    if (!name) return ''
    return name.toLowerCase().trim().split(' ').filter(w => w.length > 0).map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
  }

  if (loading) return null

  const isClient   = !!user
  const navLinks   = [
    { label: 'Inicio', id: 'hero' }, { label: 'Productos', id: 'products' },
    { label: 'Tiendas', id: 'locations' }, { label: 'Nosotros', id: 'about' },
  ]
  const adminLinks = [
    { label: 'Dashboard empresarial', action: () => { navigate('/admin'); setDropdownOpen(false) }, bold: true },
    { label: 'Gestión de usuarios',   action: () => { setUserModalOpen(true); setDropdownOpen(false) } },
    { label: 'Gestión de galería',    action: () => { setGalleryModalOpen(true); setDropdownOpen(false) } },
    { label: 'Editar carrusel',       action: () => { setCarouselModalOpen(true); setDropdownOpen(false) } },
    { label: 'Gestión de códigos',    action: () => { setDiscountModalOpen(true); setDropdownOpen(false) } },
  ]

  return (
    <>
      <style>{`
        @keyframes bellRing { 0%,100%{transform:rotate(0deg)} 12%{transform:rotate(18deg)} 24%{transform:rotate(-14deg)} 36%{transform:rotate(9deg)} 48%{transform:rotate(-5deg)} 60%{transform:rotate(2deg)} }
        @keyframes badgeBounce { 0%{transform:scale(0)} 65%{transform:scale(1.3)} 100%{transform:scale(1)} }
        @keyframes rippleOut  { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(2.5);opacity:0} }
        @keyframes sheetIn    { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .bell-ring   { transform-origin:50% 15%; animation:bellRing 0.9s cubic-bezier(.36,.07,.19,.97) both; }
        .notif-badge { animation:badgeBounce 0.35s cubic-bezier(.34,1.56,.64,1) both; }
        .ripple      { animation:rippleOut 1.8s ease-out infinite; }
        .ripple2     { animation:rippleOut 1.8s ease-out .7s infinite; }
      `}</style>

      {profileIncomplete && <IncompleteProfileBanner onComplete={handleComplete} onDismiss={dismissProfileAlert} />}

      <nav className={`fixed w-full z-40 bg-white shadow-sm transition-all duration-300 ${profileIncomplete ? 'top-[37px]' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">

          <div className="flex items-center gap-2">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <img src="/LogoCheos.png" alt="Logo Cheo's Café" className="w-9 h-9 object-contain" />
            </Link>
            <h1 className="text-xl font-bold flex gap-1 tracking-tight">
              <TypeAnimation sequence={["Cheo's", () => setShowCafe(true)]} speed={40} cursor={false} wrapper="span" className="text-neutral-900" />
              {showCafe && <TypeAnimation sequence={["Café"]} speed={40} cursor={false} wrapper="span" className="text-[#A67C52]" />}
            </h1>
          </div>

          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors relative group">
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#A67C52] group-hover:w-full transition-all duration-200" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">

            {/* Campana — solo clientes */}
            {isClient && (
              <div className="relative">
                <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                  {unreadCount > 0 && !notifOpen && (
                    <>
                      <span className="ripple  absolute inset-0 rounded-lg border border-[#C9A84C] pointer-events-none"/>
                      <span className="ripple2 absolute inset-0 rounded-lg border border-[#C9A84C] pointer-events-none"/>
                    </>
                  )}
                  <Bell key={`bell-${unreadCount}`} className={`w-5 h-5 ${unreadCount > 0 ? 'bell-ring' : ''}`} />
                  {unreadCount > 0 && (
                    <span key={`badge-${unreadCount}`} className="notif-badge absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-[#1a0d04] rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black px-1 border-2 border-white leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkAllRead={markAllRead} onMarkRead={markRead} onClose={() => setNotifOpen(false)} />
                )}
              </div>
            )}

            <button onClick={onCartToggle} className="relative p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#A67C52] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold px-1">{count}</span>
              )}
            </button>

            {!user ? (
              <button onClick={() => setModalOpen(true)} className="hidden sm:flex items-center gap-1.5 bg-neutral-900 text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-700 transition-colors">
                <User className="w-4 h-4" /> Iniciar Sesión
              </button>
            ) : (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(o => !o)} className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 pl-1.5 pr-3 py-1.5 rounded-lg transition-colors">
                  <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">{user.name?.[0]?.toUpperCase() || '?'}</div>
                  <span className="text-sm font-medium text-neutral-800 max-w-[90px] truncate">{formatName(user.name)}</span>
                  {profileIncomplete && <span className="w-1.5 h-1.5 rounded-full bg-[#A67C52] flex-shrink-0" />}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-100 w-56 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-neutral-900">
                      <p className="text-xs font-semibold text-white truncate">{formatName(user.name)}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={openProfile} className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 text-sm text-neutral-700 flex items-center justify-between transition-colors">
                        Mi Perfil
                        {profileIncomplete && <span className="text-[10px] bg-amber-50 text-[#A67C52] border border-[#A67C52]/30 px-1.5 py-0.5 rounded-full font-semibold">Incompleto</span>}
                      </button>
                      {user.role === 'ADMIN' && (
                        <>
                          <div className="mx-3 my-1 h-px bg-neutral-100" />
                          <p className="px-4 py-1.5 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Admin</p>
                          {adminLinks.map(({ label, action, bold }) => (
                            <button key={label} onClick={action} className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 flex items-center justify-between transition-colors ${bold ? 'font-semibold text-[#A67C52]' : 'text-neutral-700'}`}>
                              {label} <ChevronRight size={13} className="text-neutral-300" />
                            </button>
                          ))}
                        </>
                      )}
                      <div className="mx-3 my-1 h-px bg-neutral-100" />
                      <button onClick={() => { logout(); setDropdownOpen(false) }} className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 transition-colors">Cerrar sesión</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setMobileOpen(o => !o)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`md:hidden border-t border-neutral-100 overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white px-4 pt-3 pb-6 space-y-1">
            {navLinks.map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors">{label}</button>
            ))}
            <div className="h-px bg-neutral-100 my-2" />
            {!user ? (
              <button onClick={() => { setModalOpen(true); setMobileOpen(false) }} className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-700 transition-colors">
                <User size={15} /> Iniciar Sesión
              </button>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-3 bg-neutral-900 rounded-xl mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#A67C52] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{user.name?.[0]?.toUpperCase() || '?'}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{formatName(user.name)}</p>
                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button onClick={openProfile} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors">
                  Mi Perfil
                  {profileIncomplete && <span className="text-[10px] bg-amber-50 text-[#A67C52] border border-[#A67C52]/30 px-1.5 py-0.5 rounded-full font-semibold">Incompleto</span>}
                </button>
                {isClient && (
                  <button onClick={() => { setNotifOpen(true); setMobileOpen(false) }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors">
                    <span className="flex items-center gap-2"><Bell size={14} className="text-neutral-400"/> Notificaciones</span>
                    {unreadCount > 0 && <span className="bg-[#C9A84C] text-[#1a0d04] text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">{unreadCount}</span>}
                  </button>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Admin</p>
                    <button onClick={() => { navigate('/admin'); setMobileOpen(false) }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-[#A67C52] hover:bg-neutral-50 transition-colors">Dashboard empresarial</button>
                    {[
                      { label: 'Gestión de usuarios', action: () => { setUserModalOpen(true); setMobileOpen(false) } },
                      { label: 'Gestión de galería',  action: () => { setGalleryModalOpen(true); setMobileOpen(false) } },
                      { label: 'Editar carrusel',     action: () => { setCarouselModalOpen(true); setMobileOpen(false) } },
                      { label: 'Gestión de códigos',  action: () => { setDiscountModalOpen(true); setMobileOpen(false) } },
                    ].map(({ label, action }) => (
                      <button key={label} onClick={action} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">{label}</button>
                    ))}
                  </>
                )}
                <div className="h-px bg-neutral-100 my-1" />
                <button onClick={() => { logout(); setMobileOpen(false) }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sheet móvil de notificaciones */}
      {notifOpen && !mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden bg-black/30 backdrop-blur-sm" onClick={() => setNotifOpen(false)}>
          <div className="w-full bg-white rounded-t-2xl overflow-hidden max-h-[80vh]" onClick={e => e.stopPropagation()} style={{ animation: 'sheetIn 0.28s cubic-bezier(.4,0,.2,1) both' }}>
            <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mt-3 mb-1"/>
            <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkAllRead={markAllRead} onMarkRead={markRead} onClose={() => setNotifOpen(false)} />
          </div>
        </div>
      )}

      <ModalLoginRegister open={modalOpen} onClose={() => setModalOpen(false)} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      {userModalOpen      && <UserManagementModal    onClose={() => setUserModalOpen(false)} />}
      {galleryModalOpen   && <GalleryManagementModal onClose={() => setGalleryModalOpen(false)} />}
      {carouselModalOpen  && <CarouselEditorModal    onClose={() => setCarouselModalOpen(false)} />}
      {discountModalOpen  && <DiscountManagementModal open={discountModalOpen} onClose={() => setDiscountModalOpen(false)} />}
    </>
  )
}