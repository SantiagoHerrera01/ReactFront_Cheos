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
    min_purchase: "",
    max_uses: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (discount) {
      setForm({
        code: discount.code || "",
        description: discount.description || "",
        type: discount.type || "PERCENTAGE",
        value: discount.value || "",
        min_purchase: discount.min_purchase ?? "",
        max_uses: discount.max_uses ?? "",
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
        min_purchase: "",
        max_uses: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
    }
    setErrors({});
  }, [discount]);

  if (!open) return null;

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // 🚫 Bloquear fechas pasadas en fecha inicio
    if (name === "start_date" && value < today) {
      errorAlert("No se pueden seleccionar fechas pasadas");
      setErrors((prev) => ({ ...prev, start_date: true }));
      return;
    }

    // 🚫 Bloquear fechas pasadas en fecha fin
    if (name === "end_date" && value < today) {
      errorAlert("No se pueden seleccionar fechas pasadas");
      setErrors((prev) => ({ ...prev, end_date: true }));
      return;
    }

    setForm({
      ...form,
      [name]: newValue,
    });

    // 🔴 Validación visual max_uses
    if (name === "max_uses" && Number(newValue) < 1) {
      setErrors((prev) => ({ ...prev, max_uses: true }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.code) newErrors.code = true;
    if (!form.value) newErrors.value = true;
    if (!form.start_date) newErrors.start_date = true;
    if (!form.end_date) newErrors.end_date = true;

    if (form.type === "PERCENTAGE") {
      const value = Number(form.value);
      if (value < 0.1 || value > 100) {
        errorAlert("Solo se permite un porcentaje entre 0.1% y 100%");
        newErrors.value = true;
      }
    }

    if (Number(form.max_uses) < 1) {
      newErrors.max_uses = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const startDate = new Date(form.start_date + "T00:00:00Z").toISOString();
      const endDate = new Date(form.end_date + "T23:59:59Z").toISOString();

      const payload = {
        code: form.code,
        description: form.description,
        type: form.type,
        value: Number(form.value),
        min_purchase: Number(form.min_purchase),
        max_uses: Number(form.max_uses),
        start_date: startDate,
        end_date: endDate,
        is_active: form.is_active,
      };

      const url = discount
        ? `${API_BASE}/discounts/${discount.id}`
        : `${API_BASE}/discounts`;
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

  const inputClass = (field) =>
    `p-2 border rounded-lg w-full ${
      errors[field] ? "border-red-500" : ""
    }`;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {discount ? "Editar Descuento" : "Agregar Descuento"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium">Código</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className={inputClass("code")}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Tipo de descuento</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="p-2 border rounded-lg w-full"
              >
                <option value="PERCENTAGE">Porcentaje</option>
                <option value="FIXED">Fijo</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Valor del descuento</label>
              <input
                type="number"
                name="value"
                value={form.value}
                onChange={handleChange}
                className={inputClass("value")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Monto mínimo de compra</label>
              <input
                type="number"
                name="min_purchase"
                value={form.min_purchase}
                onChange={handleChange}
                className="p-2 border rounded-lg w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Máximo de usos</label>
              <input
                type="number"
                name="max_uses"
                value={form.max_uses}
                onChange={handleChange}
                className={inputClass("max_uses")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Fecha inicio</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className={inputClass("start_date")}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fecha fin</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className={inputClass("end_date")}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            Descuento activo
          </label>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-coffee text-white"
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
