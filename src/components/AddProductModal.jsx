import React, { useState } from "react";
import { X } from "lucide-react";
import GalleryImageSelector from "./GalleryImageSelector";
import { useAlert } from "../context/AlertContext";

export default function AddProductModal({ open, onClose, onAdded, token }) {
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

  const { createdToast, errorAlert } = useAlert();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    weight: "",
    is_featured: false,
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ❌ SIN ALERTA – SOLO ERRORES VISUALES
    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.stock ||
      !form.category ||
      !form.weight ||
      selectedImages.length === 0
    ) {
      setShowErrors(true);
      return;
    }

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock || "0"),
      weight: parseInt(form.weight || "0"),
      images: selectedImages,
    };

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al crear producto");

      createdToast("Producto");

      // 🔄 RESET FORMULARIO
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        weight: "",
        is_featured: false,
      });
      setSelectedImages([]);
      setShowErrors(false);

      onAdded?.();
      onClose();
    } catch (err) {
      console.error(err);
      errorAlert("No se pudo crear el producto");
    } finally {
      setLoading(false);
    }
  };

  const errorBorder = (condition) =>
    condition ? "border-red-500" : "";

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fadeIn">
        {/* ❌ CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-coffee mb-4">
          Agregar nuevo producto
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
        >
          {/* NOMBRE */}
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${errorBorder(
                showErrors && !form.name
              )}`}
            />
            {showErrors && !form.name && (
              <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>
            )}
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg h-20 ${errorBorder(
                showErrors && !form.description
              )}`}
            />
            {showErrors && !form.description && (
              <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* PRECIO */}
            <div>
              <label className="block text-sm font-medium">Precio</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errorBorder(
                  showErrors && !form.price
                )}`}
              />
              {showErrors && !form.price && (
                <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>
              )}
            </div>

            {/* STOCK */}
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errorBorder(
                  showErrors && !form.stock
                )}`}
              />
              {showErrors && !form.stock && (
                <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>
              )}
            </div>
          </div>

          {/* CATEGORÍA + PESO (MISMO RENGLÓN) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Categoría</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errorBorder(
                  showErrors && !form.category
                )}`}
              />
              {showErrors && !form.category && (
                <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Peso (g)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errorBorder(
                  showErrors && !form.weight
                )}`}
              />
              {showErrors && !form.weight && (
                <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>
              )}
            </div>
          </div>

          {/* IMÁGENES */}
          <div>
            <GalleryImageSelector
              selectedImages={selectedImages}
              onImagesChange={setSelectedImages}
              token={token}
              singleSelect={true}
            />
            {showErrors && selectedImages.length === 0 && (
              <p className="text-red-500 text-xs mt-1">
                Debes seleccionar una imagen
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_featured"
              checked={form.is_featured}
              onChange={handleChange}
            />
            Producto destacado
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-coffee text-white hover:bg-coffee/90 disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
