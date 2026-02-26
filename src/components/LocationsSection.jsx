import React, { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useUser } from "../context/UserContext"
import { useAlert } from "../context/AlertContext"
import { getLocations, deleteLocation } from "../routes/locations"
import LocationModal from "./LocationModal"
import LocationCard from "./LocationCard"

export default function LocationsSection() {
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"

  const [locs, setLocs] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [canScroll, setCanScroll] = useState(false)

  const [search, setSearch] = useState("")

  const carouselRef = useRef(null)

  const { user, token } = useUser()
  const { confirmDelete, successToast, errorAlert } = useAlert()

  const isAdmin = user?.role === "ADMIN"

  const filteredLocs = locs.filter((l) => {
    const value = search.toLowerCase()

    return (
      l.name?.toLowerCase().includes(value) ||
      l.department?.toLowerCase().includes(value) ||
      l.city?.toLowerCase().includes(value) ||
      l.address?.toLowerCase().includes(value) ||
      l.sector?.toLowerCase().includes(value)
    )
  })

  const loadLocations = async () => {
    try {
      const json = await getLocations(API_BASE, token)

      let arr = []
      if (Array.isArray(json)) arr = json
      else if (Array.isArray(json.locations)) arr = json.locations
      else if (Array.isArray(json.data)) arr = json.data
      else if (Array.isArray(json.data?.locations))
        arr = json.data.locations

      setLocs(arr)
    } catch (err) {
      console.error("Error cargando ubicaciones:", err)
    }
  }

  useEffect(() => {
    loadLocations()
  }, [])

  useEffect(() => {
    const container = carouselRef.current
    if (!container) return

    const checkOverflow = () => {
      setCanScroll(container.scrollWidth > container.clientWidth)
    }

    checkOverflow()
    window.addEventListener("resize", checkOverflow)

    return () => window.removeEventListener("resize", checkOverflow)
  }, [locs, isAdmin, filteredLocs])

  const scroll = (dir) => {
    if (!canScroll) return
    const container = carouselRef.current
    if (!container) return

    const amount = 280

    container.scrollTo({
      left:
        dir === "left"
          ? container.scrollLeft - amount
          : container.scrollLeft + amount,
      behavior: "smooth",
    })
  }

  const handleDelete = async (id) => {
    const ok = await confirmDelete("ubicación")
    if (!ok) return

    try {
      const res = await deleteLocation(API_BASE, id, token)
      if (!res.ok) {
        errorAlert("Error eliminando ubicación")
        return
      }

      successToast("Ubicación eliminada")
      loadLocations()
    } catch {
      errorAlert("Error de red")
    }
  }

  return (
    <section id="locations" className="py-12 bg-white text-black">
      <div className="max-w-6xl mx-auto px-4">

        <h2 className="text-3xl font-bold text-center text-coffee mb-8">
          Nuestras Tiendas
        </h2>

        {/* 🔍 BUSCADOR */}
        <div className="mb-6">
          <div className="relative w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Departamento, Ciudad o Dirección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg 
                         border border-gray-300 
                         focus:outline-none focus:ring-1 focus:ring-coffee/40"
            />
          </div>
        </div>

        {/* 📱 MOBILE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
          {isAdmin && (
            <div
              onClick={() => {
                setEditing(null)
                setModalOpen(true)
              }}
              className="w-full h-[240px] flex flex-col items-center justify-center 
                         bg-[#f9f6f2] border-2 border-dashed border-coffee/50 
                         rounded-2xl cursor-pointer hover:bg-[#f1ece7]"
            >
              <span className="text-coffee text-5xl font-bold mb-2">+</span>
              <p className="text-coffee font-medium">Agregar tienda</p>
            </div>
          )}

          {filteredLocs.length === 0 && search.trim() !== "" && (
            <div className="col-span-full text-center text-gray-500 py-10">
              No se encontró ninguna tienda en este lugar.
            </div>
          )}

          {filteredLocs.map((l) => (
            <LocationCard
              key={l.id}
              location={l}
              isAdmin={isAdmin}
              onEdit={() => {
                setEditing(l)
                setModalOpen(true)
              }}
              onDelete={() => handleDelete(l.id)}
            />
          ))}
        </div>

        {/* 🖥️ DESKTOP */}
        <div className="hidden md:flex items-center relative">
          {canScroll && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-[-50px] top-1/2 -translate-y-1/2 
                         p-3 bg-white/90 hover:bg-coffee hover:text-white 
                         rounded-full shadow-lg transition"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-hidden w-full py-2"
          >
            {isAdmin && (
              <div
                onClick={() => {
                  setEditing(null)
                  setModalOpen(true)
                }}
                className="w-[260px] h-[400px] flex-shrink-0 
                           flex flex-col items-center justify-center 
                           bg-[#f9f6f2] border-2 border-dashed border-coffee/50 
                           rounded-2xl cursor-pointer hover:bg-[#f1ece7]"
              >
                <span className="text-coffee text-5xl font-bold mb-2">+</span>
                <p className="text-coffee font-medium">Agregar tienda</p>
              </div>
            )}

            {filteredLocs.length === 0 && search.trim() !== "" && (
              <div className="w-full text-center text-gray-500 py-10">
                No se encontró ninguna tienda en este lugar.
              </div>
            )}

            {filteredLocs.map((l) => (
              <LocationCard
                key={l.id}
                location={l}
                isAdmin={isAdmin}
                desktop
                onEdit={() => {
                  setEditing(l)
                  setModalOpen(true)
                }}
                onDelete={() => handleDelete(l.id)}
              />
            ))}
          </div>

          {canScroll && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-[-50px] top-1/2 -translate-y-1/2 
                         p-3 bg-white/90 hover:bg-coffee hover:text-white 
                         rounded-full shadow-lg transition"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </div>
      </div>

      <LocationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        location={editing}
        onSaved={() => {
          setModalOpen(false)
          setEditing(null)
          loadLocations()
        }}
      />
    </section>
  )
}
