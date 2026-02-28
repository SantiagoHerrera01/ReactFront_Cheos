import React, { useMemo, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { useAlert } from "../context/AlertContext";
import { createOrder } from "../routes/orders";
import ModalLoginRegister from "./ModalLoginRegister";
import { X, Trash2, Minus, Plus, CreditCard, Truck, Tag, ShoppingBag } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const formatPrice = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

const translateMessage = (message) => {
  if (!message) return null;
  if (message.includes("minimum requirement")) return "El monto mínimo para aplicar este descuento no se cumple.";
  if (message.includes("expired")) return "Este código de descuento ya venció.";
  if (message.includes("not found")) return "El código de descuento no existe.";
  if (message.includes("inactive")) return "Este código de descuento no está activo.";
  if (message.includes("maximum uses")) return "Este código ya alcanzó el máximo de usos permitidos.";
  return "No se pudo aplicar el código de descuento.";
};

/* ── Taza de café animada 100% SVG nativo ── */
function CoffeeLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10">
      <svg width="110" height="130" viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg">

        {/* ── Vapor izquierda ── */}
        <path d="M32 36 Q28 26 32 16 Q36 6 32 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0s" repeatCount="indefinite" />
          <animate attributeName="d"
            values="M32 36 Q28 26 32 16 Q36 6 32 0;M32 36 Q36 26 32 16 Q28 6 32 0;M32 36 Q28 26 32 16 Q36 6 32 0"
            dur="2s" begin="0s" repeatCount="indefinite" />
        </path>

        {/* ── Vapor centro ── */}
        <path d="M50 36 Q46 24 50 14 Q54 4 50 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0.4s" repeatCount="indefinite" />
          <animate attributeName="d"
            values="M50 36 Q46 24 50 14 Q54 4 50 0;M50 36 Q54 24 50 14 Q46 4 50 0;M50 36 Q46 24 50 14 Q54 4 50 0"
            dur="2s" begin="0.4s" repeatCount="indefinite" />
        </path>

        {/* ── Vapor derecha ── */}
        <path d="M68 36 Q64 26 68 16 Q72 6 68 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="d"
            values="M68 36 Q64 26 68 16 Q72 6 68 0;M68 36 Q72 26 68 16 Q64 6 68 0;M68 36 Q64 26 68 16 Q72 6 68 0"
            dur="2s" begin="0.8s" repeatCount="indefinite" />
        </path>

        {/* ── Taza: cuerpo exterior ── */}
        <path d="M15 42 L20 100 Q20 106 26 106 L74 106 Q80 106 80 100 L85 42 Z"
          fill="white" stroke="#e5e7eb" strokeWidth="2" />

        {/* ── Café llenándose (clipPath para que no salga de la taza) ── */}
        <clipPath id="cupClip">
          <path d="M16 42 L21 100 Q21 105 26 105 L74 105 Q79 105 79 100 L84 42 Z" />
        </clipPath>

        <rect x="15" y="42" width="70" height="64" fill="#7c4a1e" clipPathUnits="userSpaceOnUse" clipPath="url(#cupClip)">
          <animate attributeName="y" values="106;52;58;52" dur="2.5s" begin="0s" repeatCount="indefinite" calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1" />
        </rect>

        {/* ── Espuma encima del café ── */}
        <ellipse cx="50" cy="52" rx="30" ry="5" fill="#c8956c" opacity="0.85">
          <animate attributeName="cy" values="106;52;58;52" dur="2.5s" begin="0s" repeatCount="indefinite" calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1" />
          <animate attributeName="opacity" values="0;0.85;0.85;0.85" dur="2.5s" begin="0s" repeatCount="indefinite" />
        </ellipse>

        {/* ── Asa ── */}
        <path d="M80 58 Q98 58 98 78 Q98 98 80 98" fill="none" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" />

        {/* ── Plato ── */}
        <ellipse cx="50" cy="112" rx="48" ry="7" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />

      </svg>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-gray-700">Procesando tu pedido...</p>
        <p className="text-xs text-gray-400">Preparando tu café ☕</p>
      </div>
    </div>
  );
}

export default function CartDrawer({ open, onClose }) {
  const { cart = [], removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, token } = useUser();
  const { successToast, errorAlert } = useAlert();

  const [discountCode, setDiscountCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validating, setValidating] = useState(false);
  const [discountMessage, setDiscountMessage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CONTRA_ENTREGA");
  const [openAuth, setOpenAuth] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 0), 0),
    [cart]
  );
  const total = Math.max(0, subtotal - discountAmount);
  const totalItems = cart.reduce((n, i) => n + i.quantity, 0);

  const validateDiscount = async (code = discountCode) => {
    if (!code.trim() || cart.length === 0) return;
    setValidating(true);
    setDiscountMessage(null);
    try {
      const res = await fetch(`${API_BASE}/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), purchase_total: subtotal }),
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
    } catch {
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
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/discounts/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: discountData.code, purchase_total: subtotal }),
        });
        const data = await res.json();
        if (!data.success || !data.data.valid) {
          setDiscountAmount(0);
          setDiscountData(null);
          setDiscountMessage("El descuento fue removido porque ya no cumple las condiciones.");
          return;
        }
        setDiscountAmount(data.data.discount_amount);
      } catch { /* silent */ }
    })();
  }, [subtotal]);

  async function doCheckout() {
    const payload = {
      customer_name: user?.name || "",
      customer_email: user?.email || "",
      customer_phone: user?.phone || "",
      payment_method: paymentMethod,
      shipping_address: {
        street: "Calle 50", number: "#25-30", city: "Medellín",
        department: "Antioquia", zip_code: "050001", details: "Entrega estándar",
      },
      items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      ...(discountData?.code ? { discount_code: discountData.code } : {}),
    };

    setLoading(true);
    try {
      await createOrder(payload, token);
      clearCart();
      setDiscountAmount(0);
      setDiscountData(null);
      setDiscountCode("");
      setLoading(false);
      successToast(
        paymentMethod === "TRANSFERENCIA"
          ? "Pedido creado. Envíanos el comprobante 📎"
          : "Pedido creado. Pagarás contra entrega 🚚"
      );
      onClose();
    } catch (e) {
      setLoading(false);
      errorAlert(e.message || "Error al crear el pedido");
    }
  }

  async function checkout() {
    if (!user || !token) {
      setPendingCheckout(true);
      setOpenAuth(true);
      return;
    }
    await doCheckout();
  }

  useEffect(() => {
    if (user && token && pendingCheckout) {
      setPendingCheckout(false);
      setOpenAuth(false);
      doCheckout();
    }
  }, [user, token, pendingCheckout]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-coffee">Tu Carrito</h3>
            {totalItems > 0 && (
              <span className="bg-coffee text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <CoffeeLoader />
          </div>
        ) : (
          <>
            {/* Items */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingBag size={28} className="text-gray-300" />
                </div>
                <p className="text-sm">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-11 h-11 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="text-lg">☕</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-4 py-4 space-y-4">

              {/* Discount */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de descuento"
                    value={discountCode}
                    disabled={cart.length === 0}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && validateDiscount()}
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee/30 focus:border-coffee disabled:bg-gray-200 disabled:cursor-not-allowed transition"
                  />
                  <button
                    onClick={() => validateDiscount()}
                    disabled={cart.length === 0 || validating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-coffee hover:bg-coffee/80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Tag size={13} />
                    {validating ? "..." : "Aplicar"}
                  </button>
                </div>
                {discountMessage && (
                  <p className={`text-xs px-1 ${discountAmount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {discountMessage}
                  </p>
                )}
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Método de pago</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("CONTRA_ENTREGA")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      paymentMethod === "CONTRA_ENTREGA"
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Truck size={15} />
                    Contra entrega
                  </button>
                  <button
                    onClick={() => setPaymentMethod("TRANSFERENCIA")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      paymentMethod === "TRANSFERENCIA"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <CreditCard size={15} />
                    Transferencia
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-green-600">
                    <span>
                      Descuento{" "}
                      {discountData?.type === "PERCENTAGE" ? `(${discountData?.value}%)` : ""}
                    </span>
                    <span>− {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-300">
                  <span className="font-bold text-gray-800 text-base">Total</span>
                  <span className="font-bold text-gray-800 text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout */}
              <button
                onClick={checkout}
                disabled={!cart.length}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-coffee hover:bg-coffee/80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                Finalizar compra →
              </button>
            </div>
          </>
        )}
      </div>

      <ModalLoginRegister open={openAuth} onClose={() => setOpenAuth(false)} />
    </>
  );
}