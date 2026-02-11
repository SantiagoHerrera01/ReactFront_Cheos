import React, { useState, useEffect } from "react";
import GalleryImageSelector from "./GalleryImageSelector";
import { useAlert } from "../context/AlertContext";

export default function EditProductModal({
  open,
  onClose,
  product,
  onUpdated,
  token,
}) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

  const { successToast, errorAlert } = useAlert();

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        category: product.category || "",
        weight: product.weight || "",
        is_featured: product.is_featured || false,
      });
      setSelectedImages(product.images || []);
    }
  }, [product]);

  if (!open || !product) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock || "0"),
      weight: parseInt(form.weight || "0"),
      images: selectedImages,
    };

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al actualizar producto");
      }

      // ✅ ALERTA UNIFICADA DE ÉXITO
      successToast("Producto actualizado");

      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      errorAlert("No se pudo actualizar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fadeIn">
        <h2 className="text-2xl font-semibold text-coffee mb-4">
          Editar producto
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
        >
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Precio</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Categoría</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Peso (g)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <GalleryImageSelector
            selectedImages={selectedImages}
            onImagesChange={setSelectedImages}
            token={token}
            singleSelect={true}
          />

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
              {loading ? "Actualizando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
