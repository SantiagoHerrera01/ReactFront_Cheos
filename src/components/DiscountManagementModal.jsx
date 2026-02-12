import React, { useState, useEffect } from "react";
import { Trash2, Edit3, Plus, X } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAlert } from "../context/AlertContext";
import DiscountFormModal from "./DiscountFormModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export default function DiscountManagementModal({ onClose }) {
  const { token } = useUser();
  const { confirmDelete, successToast, errorAlert } = useAlert();

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchDiscounts();
  }, [token]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/discounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar descuentos");
      const data = await res.json();
      setDiscounts(data.data.discount_codes || []);
    } catch (err) {
      setError(err.message);
      errorAlert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingDiscount(null);
    setFormOpen(true);
  };

  const openEditForm = (discount) => {
    setEditingDiscount(discount);
    setFormOpen(true);
  };

  const deleteDiscount = async (id, code) => {
    const confirmed = await confirmDelete(`el descuento "${code}"`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar descuento");

      successToast("Descuento eliminado correctamente");
      setDiscounts(discounts.filter((d) => d.id !== id));
    } catch (err) {
      errorAlert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 relative flex flex-col gap-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestión de Descuentos</h2>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-coffee text-white hover:bg-coffee/90 w-fit mb-4"
        >
          <Plus className="w-4 h-4" /> Agregar descuento
        </button>

        {loading ? (
          <p>Cargando descuentos...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : discounts.length === 0 ? (
          <p>No hay descuentos</p>
        ) : (
          <div className="overflow-auto max-h-[60vh] border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-[#f5ebe4] sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Código</th>
                  <th className="px-4 py-2 text-left">Descripción</th>
                  <th className="px-4 py-2 text-center">Tipo</th>
                  <th className="px-4 py-2 text-center">Valor</th>
                  <th className="px-4 py-2 text-center">Activo</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-[#faf6f3]">
                    <td className="px-4 py-2">{d.code}</td>
                    <td className="px-4 py-2">{d.description}</td>
                    <td className="px-4 py-2 text-center">{d.type}</td>
                    <td className="px-4 py-2 text-center">{d.value}</td>
                    <td className="px-4 py-2 text-center">{d.is_active ? "Sí" : "No"}</td>
                    <td className="px-4 py-2 text-center flex justify-center gap-2">
                      <button
                        onClick={() => openEditForm(d)}
                        className="px-2 py-1 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-800 flex items-center gap-1"
                      >
                        <Edit3 className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => deleteDiscount(d.id, d.code)}
                        className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Formulario */}
        {formOpen && (
          <DiscountFormModal
            open={formOpen}
            onClose={() => setFormOpen(false)}
            discount={editingDiscount}
            onSaved={fetchDiscounts}
          />
        )}
      </div>
    </div>
  );
}
