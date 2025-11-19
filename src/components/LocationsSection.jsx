import React, { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "../context/UserContext";
import LocationModal from "./LocationModal";

export default function LocationsSection() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
  const [locs, setLocs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const carouselRef = useRef(null);
  const { user, token } = useUser();
  const isAdmin = user?.role === "ADMIN";

  const loadLocations = async () => {
    try {
      const res = await fetch(`${API_BASE}/locations/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      const locations = json?.data?.locations ?? [];
      setLocs(locations);
    } catch (err) {
      console.error("Error al cargar ubicaciones:", err);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (location) => {
    setEditing(location);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro de eliminar esta ubicación?")) return;

    try {
      const res = await fetch(`${API_BASE}/locations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        alert("Error eliminando ubicación");
        return;
      }

      loadLocations();
    } catch (err) {
      console.error(err);
      alert("Error de red al eliminar la ubicación");
    }
  };

  const scroll = (dir) => {
    const container = carouselRef.current;
    if (!container) return;

    const amount = 320; // ancho del card + gap
    container.scrollTo({
      left: dir === "left" ? container.scrollLeft - amount : container.scrollLeft + amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="locations" className="py-12 bg-gray-50 text-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-coffee">Nuestras Tiendas</h2>
        </div>

        {/* 📱 MOBILE — Grid vertical */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
          {isAdmin && (
            <div
              onClick={handleAdd}
              className="w-full h-[280px] flex flex-col items-center justify-center 
                         bg-[#f9f6f2] border-2 border-dashed border-coffee/50 
                         rounded-2xl cursor-pointer hover:bg-[#f1ece7]"
            >
              <span className="text-coffee text-5xl font-bold mb-2">+</span>
              <p className="text-coffee font-medium">Agregar tienda</p>
            </div>
          )}

          {locs.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative"
            >
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    onClick={() => handleEdit(l)}
                    className="bg-white/90 hover:bg-coffee hover:text-white p-2 rounded-lg shadow transition"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="bg-white/90 hover:bg-red-500 hover:text-white p-2 rounded-lg shadow transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              <div className="p-5">
                <h3 className="text-xl font-bold text-coffee-dark">{l.name}</h3>
                <p className="text-gray-700">{l.address}</p>
                <p className="text-gray-700">
                  {l.city}, {l.department}
                </p>
                <p className="text-gray-600 mt-1">📞 {l.phone}</p>
                {l.is_active ? (
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Abierto
                  </span>
                ) : (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    Cerrado temporalmente
                  </span>
                )}
              </div>

              <div className="h-56 w-full">
                {l.map_iframe ? (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: l.map_iframe }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Sin mapa disponible
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 🖥️ DESKTOP — Carrusel */}
        <div className="hidden md:flex items-center relative">
          <button
            onClick={() => scroll("left")}
            className="absolute left-[-50px] top-1/2 -translate-y-1/2 
                      p-3 bg-white/90 hover:bg-coffee hover:text-white 
                      rounded-full shadow-lg transition"
          >
            <ChevronLeft size={26} />
          </button>

          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-hidden w-full py-2"
          >
            {isAdmin && (
              <div
                onClick={handleAdd}
                className="min-w-[300px] h-[400px] flex flex-col items-center justify-center 
                           bg-[#f9f6f2] border-2 border-dashed border-coffee/50 
                           rounded-2xl cursor-pointer hover:bg-[#f1ece7]"
              >
                <span className="text-coffee text-5xl font-bold mb-2">+</span>
                <p className="text-coffee font-medium">Agregar tienda</p>
              </div>
            )}

            {locs.map((l) => (
              <div
                key={l.id}
                className="min-w-[300px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative"
              >
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <button
                      onClick={() => handleEdit(l)}
                      className="bg-white/90 hover:bg-coffee hover:text-white p-2 rounded-lg shadow transition"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="bg-white/90 hover:bg-red-500 hover:text-white p-2 rounded-lg shadow transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-xl font-bold text-coffee-dark">{l.name}</h3>
                  <p className="text-gray-700">{l.address}</p>
                  <p className="text-gray-700">
                    {l.city}, {l.department}
                  </p>
                  <p className="text-gray-600 mt-1">📞 {l.phone}</p>
                  {l.is_active ? (
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Abierto
                    </span>
                  ) : (
                    <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      Cerrado temporalmente
                    </span>
                  )}
                </div>

                <div className="h-56 w-full">
                  {l.map_iframe ? (
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: l.map_iframe }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Sin mapa disponible
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-[-50px] top-1/2 -translate-y-1/2 
                      p-3 bg-white/90 hover:bg-coffee hover:text-white 
                      rounded-full shadow-lg transition"
          >
            <ChevronRight size={26} />
          </button>
        </div>
      </div>

      {modalOpen && (
        <LocationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          location={editing}
          onSaved={() => {
            setModalOpen(false);
            setEditing(null);
            loadLocations();
          }}
        />
      )}
    </section>
  );
}
