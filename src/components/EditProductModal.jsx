import React, { useState, useEffect } from "react";
import GalleryImageSelector from "./GalleryImageSelector";
import { useAlert } from "../context/AlertContext";
import { X } from "lucide-react";

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

  const [originalForm, setOriginalForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatPrice = (value) => {
    if (!value) return "";
    const clean = value.toString().replace(/\D/g, "");
    return new Intl.NumberFormat("es-CO").format(clean);
  };

  useEffect(() => {
    if (product) {
      const initialForm = {
        name: product.name || "",
        description: product.description || "",
        price: formatPrice(product.price) || "",
        stock: product.stock?.toString() || "",
        category: product.category || "",
        weight: product.weight?.toString() || "",
        is_featured: product.is_featured || false,
      };

      setForm(initialForm);
      setOriginalForm(initialForm);
      setSelectedImages(product.images || []);
      setOriginalImages(product.images || []);
      setErrors({});
    }
  }, [product]);

  if (!open || !product) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "price") {
      const cleanValue = value.replace(/\D/g, "");
      setForm({
        ...form,
        price: formatPrice(cleanValue),
      });
    } 
    else if (name === "stock") {
      if (value === "" || parseInt(value) >= 0) {
        setForm({
          ...form,
          stock: value,
        });
      }
    }
    else {
      setForm({
        ...form,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    if (value !== "") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Campo obligatorio";
    if (!form.description.trim()) newErrors.description = "Campo obligatorio";
    if (!form.price) newErrors.price = "Campo obligatorio";
    if (form.stock === "" || parseInt(form.stock) < 0)
      newErrors.stock = "Stock inválido";
    if (!form.category.trim()) newErrors.category = "Campo obligatorio";
    if (!form.weight) newErrors.weight = "Campo obligatorio";
    if (selectedImages.length === 0)
      newErrors.images = "Debe seleccionar una imagen";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 Detectar si hay cambios reales
  const hasChanges = () => {
    if (!originalForm) return false;

    const formChanged =
      JSON.stringify(form) !== JSON.stringify(originalForm);

    const imagesChanged =
      JSON.stringify(selectedImages) !== JSON.stringify(originalImages);

    return formChanged || imagesChanged;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ...form,
      price: parseFloat(form.price.replace(/\./g, "")),
      stock: parseInt(form.stock),
      weight: parseInt(form.weight),
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

  const inputClass = (field) =>
    `w-full p-2 border rounded-lg ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fadeIn">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-coffee mb-4">
          Editar producto
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
        >
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={inputClass("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Precio */}
            <div>
              <label className="block text-sm font-medium">Precio</label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handleChange}
                className={inputClass("price")}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input
                type="number"
                name="stock"
                min="0"
                value={form.stock}
                onChange={handleChange}
                className={inputClass("stock")}
              />
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium">Categoría</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass("category")}
              />
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium">Peso (g)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className={inputClass("weight")}
              />
              {errors.weight && (
                <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
              )}
            </div>
          </div>

          {errors.images && (
            <p className="text-red-500 text-xs">{errors.images}</p>
          )}

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
              disabled={loading || !hasChanges()}
              className="px-4 py-2 rounded-lg bg-coffee text-white hover:bg-coffee/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Actualizando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
