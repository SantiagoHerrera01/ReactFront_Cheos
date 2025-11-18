import React, { useEffect, useState } from "react";
import { getLocations } from "../routes/locations";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Pencil, Trash2 } from "lucide-react";
import { useUser } from "../context/UserContext";

// Icono de Leaflet
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 🟩 Función para geocodificar dirección → coordenadas
async function geocodeAddress(address, city, department) {
  const full = `${address}, ${city}, ${department}, Colombia`;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    full
  )}&addressdetails=1&limit=5`;

  const res = await fetch(url, {
    headers: { "User-Agent": "cheoscafe-app" },
  });

  const data = await res.json();

  // Filtrar SOLO Colombia
  const place = data.find((d) => d.address?.country_code === "co");

  if (!place) return null;

  return {
    lat: parseFloat(place.lat),
    lng: parseFloat(place.lon),
  };
}

export default function LocationsSection() {
  const [locs, setLocs] = useState([]);
  const [coords, setCoords] = useState({});
  const { user } = useUser();
  const isAdmin = user?.role === "ADMIN";

  // 🔁 Cargar ubicaciones
  useEffect(() => {
    let active = true;

    getLocations()
      .then(async (locations) => {
        if (!active) return;

        setLocs(locations);

        // Obtener coordenadas de cada ubicación
        const mapped = {};
        for (const l of locations) {
          const c = await geocodeAddress(l.address, l.city, l.department);
          if (c) mapped[l.id] = c;
        }

        if (active) setCoords(mapped);
      })
      .catch(console.error);

    return () => (active = false);
  }, []);

  // 🛠 Acciones admin (solo placeholders, puedes conectar tus modales)
  const handleEdit = (location) => {
    console.log("Editar:", location);
  };

  const handleDelete = (id) => {
    if (!window.confirm("¿Seguro de eliminar esta ubicación?")) return;
    console.log("Eliminar:", id);
  };

  return (
    <section id="locations" className="py-12 bg-gray-50 text-black">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-coffee mb-8">
          Nuestras Tiendas
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {locs.map((l) => {
            const c = coords[l.id];

            return (
              <div
                key={l.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative"
              >
                {/* Botones Admin */}
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

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-coffee-dark">
                    {l.name}
                  </h3>
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

                {/* Mapa */}
                <div className="h-56 w-full">
                  {c ? (
                    <MapContainer
                      center={[c.lat, c.lng]}
                      zoom={17}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />

                      <Marker position={[c.lat, c.lng]} icon={icon}>
                        <Popup>{l.name}</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Ubicación no encontrada
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
