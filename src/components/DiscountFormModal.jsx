import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAlert } from "../context/AlertContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export default function DiscountFormModal({ open, onClose, discount, onSaved }) {
  const { token } = useUser();
  const { successToast, errorAlert } = useAlert();

  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    min_purchase: 0,
    max_uses: 1,
    start_date: "",
    end_date: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (discount) {
      setForm({
        code: discount.code || "",
        description: discount.description || "",
        type: discount.type || "PERCENTAGE",
        value: discount.value || 0,
        min_purchase: discount.min_purchase || 0,
        max_uses: discount.max_uses || 1,
        start_date: discount.start_date?.slice(0, 10) || "",
        end_date: discount.end_date?.slice(0, 10) || "",
        is_active: discount.is_active || false,
      });
    } else {
      setForm({
        code: "",
        description: "",
        type: "PERCENTAGE",
        value: "",
        min_purchase: 0,
        max_uses: 1,
        start_date: "",
        end_date: "",
        is_active: true,
      });
    }
  }, [discount]);

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
    if (!token) return;

    setLoading(true);
    try {
      const startDate = form.start_date
        ? new Date(form.start_date + "T00:00:00Z").toISOString()
        : new Date().toISOString();
      const endDate = form.end_date
        ? new Date(form.end_date + "T23:59:59Z").toISOString()
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

      const payload = {
        code: form.code,
        description: form.description,
        type: form.type,
        value: Number(form.value),
        min_purchase: Number(form.min_purchase || 0),
        max_uses: Number(form.max_uses || 1),
        start_date: startDate,
        end_date: endDate,
        is_active: form.is_active,
      };

      const url = discount ? `${API_BASE}/discounts/${discount.id}` : `${API_BASE}/discounts`;
      const method = discount ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al guardar descuento");
      }

      successToast(discount ? "Descuento actualizado" : "Descuento creado");
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      errorAlert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">{discount ? "Editar Descuento" : "Agregar Descuento"}</h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            required
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Código"
            className="p-2 border rounded-lg w-full"
          />
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            className="p-2 border rounded-lg w-full"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            >
              <option value="PERCENTAGE">Porcentaje</option>
              <option value="FIXED">Fijo</option>
            </select>
            <input
              required
              type="number"
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder="Valor"
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="min_purchase"
              value={form.min_purchase}
              onChange={handleChange}
              placeholder="Mínimo compra"
              className="p-2 border rounded-lg w-full"
            />
            <input
              type="number"
              name="max_uses"
              value={form.max_uses}
              onChange={handleChange}
              placeholder="Máximo usos"
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            />
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            Activo
          </label>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-coffee text-white hover:bg-coffee/90"
              disabled={loading}
            >
              {loading ? "Guardando..." : discount ? "Actualizar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
