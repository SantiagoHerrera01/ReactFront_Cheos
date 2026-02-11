import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAlert } from "../context/AlertContext";
import { createLocation, updateLocation } from "../routes/locations";

export default function LocationModal({ open, onClose, location, onSaved }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
  const { token } = useUser();
  const { successToast } = useAlert();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [mapIframe, setMapIframe] = useState("");
  const [active, setActive] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  /* ================= DEPARTAMENTOS ================= */

  useEffect(() => {
    if (!open) return;

    fetch("https://api-colombia.com/api/v1/Department")
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(() => setError("Error cargando departamentos"));
  }, [open]);

  /* ================= CIUDADES ================= */

  useEffect(() => {
    if (!department || !departments.length) {
      setCities([]);
      return;
    }

    const dept = departments.find(d => d.name === department);
    if (!dept) return;

    fetch(`https://api-colombia.com/api/v1/Department/${dept.id}/cities`)
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(() => setError("Error cargando ciudades"));
  }, [department, departments]);

  /* ================= CARGAR DATA ================= */

  useEffect(() => {
    if (!open) return;

    if (location) {
      setName(location.name || "");
      setAddress(location.address || "");
      setDepartment(location.department || "");
      setCity(location.city || "");
      setPhone(location.phone || "");
      setMapIframe(location.map_iframe || "");
      setActive(location.is_active ?? true);
      setError("");
      setErrors({});
    } else {
      setName("");
      setAddress("");
      setDepartment("");
      setCity("");
      setPhone("");
      setMapIframe("");
      setActive(true);
      setError("");
      setErrors({});
    }
  }, [location, open]);

  /* ================= GUARDAR ================= */

  const handleSubmit = async () => {
    setError("");

    const phoneIsValid =
      phone &&
      /^\d+$/.test(phone) &&
      phone.length >= 10 &&
      phone.length <= 15;

    const iframeIsValid =
      mapIframe &&
      /^<iframe[\s\S]*<\/iframe>$/.test(mapIframe.trim());

    const newErrors = {
      name: !name,
      address: !address,
      department: !department,
      city: !city,
      phone: !phone || !phoneIsValid,
      mapIframe: !mapIframe || !iframeIsValid,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      setError("Todos los campos obligatorios deben estar completos");
      return;
    }

    setLoading(true);

    const body = {
      name,
      address,
      department,
      city,
      phone,
      map_iframe: mapIframe,
      is_active: active,
    };

    try {
      let json;

      if (location) {
        json = await updateLocation(API_BASE, location.id, body, token);
      } else {
        json = await createLocation(API_BASE, body, token);
      }

      if (!json || json.error) {
        setError(json?.message || "Error al guardar la tienda");
        return;
      }

      successToast(
        location
          ? "Tienda actualizada correctamente"
          : "Tienda creada correctamente"
      );

      onSaved?.();
      onClose?.();
    } catch {
      setError("Error de red al guardar la tienda");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        
        {/* ❌ BOTÓN CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-center mb-4 text-coffee">
          {location ? "Editar Tienda" : "Agregar Tienda"}
        </h2>

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* NOMBRE */}
          <div>
            <input
              className={`border p-2 rounded w-full ${
                errors.name ? "border-red-500" : ""
              }`}
              placeholder="Nombre de la tienda"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                Este campo es obligatorio
              </p>
            )}
          </div>

          {/* DIRECCIÓN */}
          <div>
            <input
              className={`border p-2 rounded w-full ${
                errors.address ? "border-red-500" : ""
              }`}
              placeholder="Dirección"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">
                Este campo es obligatorio
              </p>
            )}
          </div>

          {/* DEPARTAMENTO */}
          <div>
            <input
              className={`border p-2 rounded w-full ${
                errors.department ? "border-red-500" : ""
              }`}
              list="departments-list"
              placeholder="Seleccione un departamento"
              value={department}
              onChange={e => {
                setDepartment(e.target.value);
                setCity("");
              }}
            />
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">
                Este campo es obligatorio
              </p>
            )}
          </div>

          <datalist id="departments-list">
            {departments.map(dep => (
              <option key={dep.id} value={dep.name} />
            ))}
          </datalist>

          {/* CIUDAD */}
          <div>
            <input
              className={`border p-2 rounded w-full ${
                errors.city ? "border-red-500" : ""
              }`}
              list="cities-list"
              placeholder="Seleccione una ciudad"
              value={city}
              onChange={e => setCity(e.target.value)}
              disabled={!cities.length}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">
                Este campo es obligatorio
              </p>
            )}
          </div>

          <datalist id="cities-list">
            {cities.map(c => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>

          {/* TELÉFONO */}
          <div>
            <input
              className={`border p-2 rounded w-full ${
                errors.phone ? "border-red-500" : ""
              }`}
              placeholder="Teléfono"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                Debe tener entre 10 y 15 dígitos numéricos
              </p>
            )}
          </div>

          {/* IFRAME */}
          <div>
            <textarea
              className={`border p-2 rounded w-full h-28 ${
                errors.mapIframe ? "border-red-500" : ""
              }`}
              placeholder={`<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`}
              value={mapIframe}
              onChange={e => setMapIframe(e.target.value)}
            />
            {errors.mapIframe && (
              <p className="text-red-500 text-xs mt-1">
                El iframe de Google Maps no es válido
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={() => setActive(!active)}
            />
            ¿Activo?
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-coffee text-white rounded hover:bg-coffee/90"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
