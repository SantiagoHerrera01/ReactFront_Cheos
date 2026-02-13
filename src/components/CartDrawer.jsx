import React, { useMemo, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { createOrder } from "../routes/orders";
import { X, Trash2, Minus, Plus } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export default function CartDrawer({ open, onClose }) {
  const { cart = [], removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, token } = useUser();

  const [discountCode, setDiscountCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validating, setValidating] = useState(false);
  const [discountMessage, setDiscountMessage] = useState(null);

  const formatPrice = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const subtotal = useMemo(() => {
    return cart.reduce(
      (s, i) => s + (Number(i.price) || 0) * (i.quantity || 0),
      0
    );
  }, [cart]);

  const total = Math.max(0, subtotal - discountAmount);

  const translateMessage = (message) => {
    if (!message) return null;
    if (message.includes("minimum requirement"))
      return "El monto mínimo para aplicar este descuento no se cumple.";
    if (message.includes("expired"))
      return "Este código de descuento ya venció.";
    if (message.includes("not found"))
      return "El código de descuento no existe.";
    if (message.includes("inactive"))
      return "Este código de descuento no está activo.";
    if (message.includes("maximum uses"))
      return "Este código ya alcanzó el máximo de usos permitidos.";
    return "No se pudo aplicar el código de descuento.";
  };

  const validateDiscount = async (codeToValidate = discountCode) => {
    if (!codeToValidate.trim() || cart.length === 0) return;

    setValidating(true);
    setDiscountMessage(null);

    try {
      const res = await fetch(`${API_BASE}/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToValidate.trim(),
          purchase_total: subtotal,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.data.valid) {
        setDiscountMessage(translateMessage(data.data?.message));
        setDiscountAmount(0);
        setDiscountData(null);
        return;
      }

      setDiscountData(data.data.discount_code);
      setDiscountAmount(data.data.discount_amount);
      setDiscountMessage("Código aplicado correctamente ✅");
    } catch (err) {
      console.error(err);
      setDiscountMessage("Error al validar descuento.");
      setDiscountAmount(0);
      setDiscountData(null);
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    if (!discountData?.code) return;

    if (subtotal <= 0) {
      setDiscountAmount(0);
      setDiscountData(null);
      setDiscountMessage(null);
      return;
    }

    const revalidate = async () => {
      try {
        const res = await fetch(`${API_BASE}/discounts/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: discountData.code,
            purchase_total: subtotal,
          }),
        });

        const data = await res.json();

        if (!data.success || !data.data.valid) {
          setDiscountAmount(0);
          setDiscountData(null);
          setDiscountMessage(
            "El descuento fue removido porque ya no cumple las condiciones."
          );
          return;
        }

        setDiscountAmount(data.data.discount_amount);
      } catch (err) {
        console.error(err);
      }
    };

    revalidate();
  }, [subtotal]);

  async function checkout() {
    const payload = {
      customer_name: user?.name || "Invitado",
      customer_email: user?.email || "guest@example.com",
      customer_phone: user?.phone || "",
      items: cart.map((i) => ({
        product_id: i.id,
        product_name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal,
      discount_code: discountData?.code || null,
      discount_amount: discountAmount,
      total,
      payment_method: "CONTRA_ENTREGA",
    };

    try {
      await createOrder(payload, token || null);
      clearCart();
      setDiscountAmount(0);
      setDiscountData(null);
      setDiscountCode("");
      alert("✅ Pedido creado correctamente.");
      onClose();
    } catch (e) {
      console.error(e);
      alert("❌ Error al crear el pedido.");
    }
  }

  const discountDisabled = cart.length === 0;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-coffee">Tu Carrito</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-600 text-center mt-10">
              🛒 Tu carrito está vacío
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-50 rounded-lg p-3 shadow-sm"
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-gray-600">
                    {item.quantity} × {formatPrice(item.price)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="bg-gray-200 p-1 rounded"
                  >
                    <Minus size={14} />
                  </button>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-200 p-1 rounded"
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Código de descuento"
              value={discountCode}
              disabled={discountDisabled}
              onChange={(e) => setDiscountCode(e.target.value)}
              className={`flex-1 border px-2 py-1 rounded ${
                discountDisabled ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            <button
              onClick={() => validateDiscount()}
              disabled={discountDisabled || validating}
              className={`px-3 rounded text-white ${
                discountDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-coffee"
              }`}
            >
              {validating ? "..." : "Aplicar"}
            </button>
          </div>

          {discountMessage && (
            <p
              className={`text-sm ${
                discountAmount > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {discountMessage}
            </p>
          )}

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                Descuento{" "}
                {discountData?.type === "PERCENTAGE"
                  ? `(${discountData?.value}%)`
                  : ""}
              </span>
              <span>- {formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button
            onClick={checkout}
            disabled={!cart.length}
            className={`w-full py-2 rounded text-white ${
              cart.length
                ? "bg-coffee hover:bg-coffee/80"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Finalizar compra
          </button>
        </div>
      </div>
    </>
  );
}
