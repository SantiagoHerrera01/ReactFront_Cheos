import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function LocationModal({ open, onClose, location, onSaved }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
  const { token } = useUser();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [mapIframe, setMapIframe] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location) {
      setName(location.name || "");
      setAddress(location.address || "");
      setCity(location.city || "");
      setDepartment(location.department || "");
      setPhone(location.phone || "");
      setMapIframe(location.map_iframe || "");
      setActive(location.is_active ?? true);
      setError("");
    } else {
      setName("");
      setAddress("");
      setCity("");
      setDepartment("");
      setPhone("");
      setMapIframe("");
      setActive(true);
      setError("");
    }
  }, [location, open]);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const body = { name, address, city, department, phone, map_iframe: mapIframe, is_active: active };
    const method = location ? "PUT" : "POST";
    const url = location ? `${API_BASE}/locations/${location.id}` : `${API_BASE}/locations`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((json && (json.message || json.error)) || `Error ${res.status} al guardar la ubicación`);
        setLoading(false);
        return;
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Error de red al guardar la ubicación");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-6">
      {/* Modal container con scroll interno si es necesario */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-coffee mb-4 text-center">
          {location ? "Editar Tienda" : "Agregar Tienda"}
        </h2>

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>
        )}

        <div className="flex flex-col gap-3">
          <input
            className="border p-2 rounded w-full"
            placeholder="Nombre de la tienda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Ciudad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={loading}
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Departamento"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={loading}
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />

          <label className="text-sm text-gray-600">
            Pega aquí el código <code>&lt;iframe ...&gt;&lt;/iframe&gt;</code>
          </label>
          <textarea
            className="border p-2 rounded w-full h-32"
            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..."></iframe>'
            value={mapIframe}
            onChange={(e) => setMapIframe(e.target.value)}
            disabled={loading}
          />

          <label className="flex items-center gap-2 mt-1 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={() => setActive(!active)}
              disabled={loading}
            />
            ¿Activo?
          </label>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => !loading && onClose?.()}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 w-full sm:w-auto"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded bg-coffee text-white hover:bg-coffee/90 flex items-center justify-center gap-2 w-full sm:w-auto ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
