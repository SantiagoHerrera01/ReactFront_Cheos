import React, { useMemo, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useUser, getIncompleteFields } from "../context/UserContext";
import { useAlert } from "../context/AlertContext";
import { createOrder } from "../routes/orders";
import ModalLoginRegister from "./ModalLoginRegister";
import ProfileModal from "./ProfileModal"; // ← importado
import { X, Trash2, Minus, Plus, CreditCard, Truck, Tag, ShoppingBag, ArrowRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const formatPrice = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value || 0);

const translateMessage = (message) => {
  if (!message) return null;
  if (message.includes("minimum requirement")) return "El monto mínimo para aplicar este descuento no se cumple.";
  if (message.includes("expired"))      return "Este código de descuento ya venció.";
  if (message.includes("not found"))    return "El código de descuento no existe.";
  if (message.includes("inactive"))     return "Este código de descuento no está activo.";
  if (message.includes("maximum uses")) return "Este código ya alcanzó el máximo de usos permitidos.";
  return "No se pudo aplicar el código de descuento.";
};

const FIELD_LABELS = {
  phone:        "Teléfono",
  gender:       "Género",
  municipality: "Municipio",
  neighborhood: "Barrio",
  city:         "Dirección",
  birth_date:   "Fecha de nacimiento",
};

/* ── Café procesando pedido ── */
function CoffeeLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10">
      <svg width="110" height="130" viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 36 Q28 26 32 16 Q36 6 32 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0s" repeatCount="indefinite" />
          <animate attributeName="d" values="M32 36 Q28 26 32 16 Q36 6 32 0;M32 36 Q36 26 32 16 Q28 6 32 0;M32 36 Q28 26 32 16 Q36 6 32 0" dur="2s" begin="0s" repeatCount="indefinite" />
        </path>
        <path d="M50 36 Q46 24 50 14 Q54 4 50 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0.4s" repeatCount="indefinite" />
          <animate attributeName="d" values="M50 36 Q46 24 50 14 Q54 4 50 0;M50 36 Q54 24 50 14 Q46 4 50 0;M50 36 Q46 24 50 14 Q54 4 50 0" dur="2s" begin="0.4s" repeatCount="indefinite" />
        </path>
        <path d="M68 36 Q64 26 68 16 Q72 6 68 0" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="d" values="M68 36 Q64 26 68 16 Q72 6 68 0;M68 36 Q72 26 68 16 Q64 6 68 0;M68 36 Q64 26 68 16 Q72 6 68 0" dur="2s" begin="0.8s" repeatCount="indefinite" />
        </path>
        <path d="M15 42 L20 100 Q20 106 26 106 L74 106 Q80 106 80 100 L85 42 Z" fill="white" stroke="#e5e7eb" strokeWidth="2" />
        <clipPath id="cupClipLoader">
          <path d="M16 42 L21 100 Q21 105 26 105 L74 105 Q79 105 79 100 L84 42 Z" />
        </clipPath>
        <rect x="15" y="42" width="70" height="64" fill="#7c4a1e" clipPath="url(#cupClipLoader)">
          <animate attributeName="y" values="106;52;58;52" dur="2.5s" begin="0s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1" />
        </rect>
        <ellipse cx="50" cy="52" rx="30" ry="5" fill="#c8956c" opacity="0.85">
          <animate attributeName="cy" values="106;52;58;52" dur="2.5s" begin="0s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1" />
          <animate attributeName="opacity" values="0;0.85;0.85;0.85" dur="2.5s" begin="0s" repeatCount="indefinite" />
        </ellipse>
        <path d="M80 58 Q98 58 98 78 Q98 98 80 98" fill="none" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="50" cy="112" rx="48" ry="7" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />
      </svg>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-neutral-700">Procesando tu pedido...</p>
        <p className="text-xs text-neutral-400">Preparando tu café ☕</p>
      </div>
    </div>
  );
}

/* ── Café triste — bloqueo por perfil incompleto ── */
function SadCoffeeBlock({ missingFields, onGoToProfile }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center gap-5">
      <svg width="120" height="140" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="122" rx="50" ry="8" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />
        <path d="M18 48 L24 108 Q24 115 31 115 L79 115 Q86 115 86 108 L92 48 Z" fill="white" stroke="#e5e7eb" strokeWidth="2" />
        <clipPath id="cupClipSad">
          <path d="M19 48 L25 107 Q25 114 31 114 L79 114 Q85 114 85 107 L91 48 Z" />
        </clipPath>
        <rect x="18" y="85" width="74" height="30" fill="#4a3728" opacity="0.6" clipPath="url(#cupClipSad)" />
        <path d="M86 65 Q106 65 106 85 Q106 105 86 105" fill="none" stroke="#e5e7eb" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="46" cy="72" rx="4" ry="5" fill="#4a3728" />
        <ellipse cx="45" cy="71" rx="1.5" ry="1.5" fill="white" opacity="0.6" />
        <ellipse cx="64" cy="72" rx="4" ry="5" fill="#4a3728" />
        <ellipse cx="63" cy="71" rx="1.5" ry="1.5" fill="white" opacity="0.6" />
        <path d="M40 64 Q46 60 52 64" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M58 64 Q64 60 70 64" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M44 90 Q55 84 66 90" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <ellipse cx="43" cy="80" rx="2.5" ry="3.5" fill="#93c5fd" opacity="0.8">
          <animate attributeName="cy" values="80;86;80" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="67" cy="80" rx="2.5" ry="3.5" fill="#93c5fd" opacity="0.8">
          <animate attributeName="cy" values="80;86;80" dur="2s" begin="0.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" begin="0.6s" repeatCount="indefinite" />
        </ellipse>
        <path d="M48 42 Q45 36 48 30" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M62 42 Q59 36 62 30" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      </svg>

      <div className="space-y-1.5">
        <p className="text-base font-bold text-neutral-900">¡Tu café no puede salir!</p>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Necesitamos algunos datos tuyos antes de procesar tu pedido.
        </p>
      </div>

      <div className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest text-left">Faltan estos datos</p>
        <div className="flex flex-wrap gap-1.5">
          {missingFields.map(f => (
            <span key={f} className="inline-flex items-center gap-1 text-xs bg-white border border-[#A67C52]/30 text-[#A67C52] px-2 py-1 rounded-full font-medium">
              <span className="w-1 h-1 rounded-full bg-[#A67C52]" />
              {FIELD_LABELS[f] || f}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onGoToProfile}
        className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-neutral-700 transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
      >
        Completar mi perfil
        <ArrowRight size={15} />
      </button>

      <p className="text-xs text-neutral-400">
        Solo toma un minuto ☕
      </p>
    </div>
  );
}

export default function CartDrawer({ open, onClose, onOpenProfile }) {
  const { cart = [], removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, token, profileIncomplete } = useUser();
  const { successToast, errorAlert } = useAlert();

  const [discountCode, setDiscountCode]       = useState("");
  const [discountData, setDiscountData]       = useState(null);
  const [discountAmount, setDiscountAmount]   = useState(0);
  const [validating, setValidating]           = useState(false);
  const [discountMessage, setDiscountMessage] = useState(null);
  const [paymentMethod, setPaymentMethod]     = useState("CONTRA_ENTREGA");
  const [openAuth, setOpenAuth]               = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [loading, setLoading]                 = useState(false);

  // ← nuevo estado para el ProfileModal
  const [profileOpen, setProfileOpen] = useState(false);

  const missingFields = user ? getIncompleteFields(user) : [];
  const isBlocked     = user && missingFields.length > 0;

  const subtotal   = useMemo(() => cart.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 0), 0), [cart]);
  const total      = Math.max(0, subtotal - discountAmount);
  const totalItems = cart.reduce((n, i) => n + i.quantity, 0);

  const validateDiscount = async (code = discountCode) => {
    if (!code.trim() || cart.length === 0) return;
    setValidating(true);
    setDiscountMessage(null);
    try {
      const res  = await fetch(`${API_BASE}/discounts/validate`, {
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
    if (subtotal <= 0) { setDiscountAmount(0); setDiscountData(null); setDiscountMessage(null); return; }
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/discounts/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: discountData.code, purchase_total: subtotal }),
        });
        const data = await res.json();
        if (!data.success || !data.data.valid) {
          setDiscountAmount(0); setDiscountData(null);
          setDiscountMessage("El descuento fue removido porque ya no cumple las condiciones.");
          return;
        }
        setDiscountAmount(data.data.discount_amount);
      } catch { /* silent */ }
    })();
  }, [subtotal]);

  async function doCheckout() {
    const payload = {
      customer_name:  user?.name  || "",
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
      setDiscountAmount(0); setDiscountData(null); setDiscountCode("");
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
    if (!user || !token) { setPendingCheckout(true); setOpenAuth(true); return; }
    if (isBlocked) return;
    await doCheckout();
  }

  useEffect(() => {
    if (user && token && pendingCheckout) {
      setPendingCheckout(false);
      setOpenAuth(false);
      if (getIncompleteFields(user).length === 0) doCheckout();
    }
  }, [user, token, pendingCheckout]);

  // ← al hacer clic en "Completar mi perfil":
  //   cierra el carrito y abre el ProfileModal
  const handleGoToProfile = () => {
    onClose();
    setProfileOpen(true);
    // También llama al prop por si el padre necesita saberlo
    if (onOpenProfile) onOpenProfile();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-neutral-900">Tu Carrito</h3>
            {totalItems > 0 && (
              <span className="bg-neutral-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-neutral-100 transition-colors flex items-center justify-center text-neutral-400">
            <X size={17} />
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <CoffeeLoader />
          </div>

        /* Bloqueo por perfil incompleto */
        ) : isBlocked ? (
          <SadCoffeeBlock missingFields={missingFields} onGoToProfile={handleGoToProfile} />

        ) : (
          <>
            {/* Items */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-neutral-400">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
                  <ShoppingBag size={26} className="text-neutral-300" />
                </div>
                <p className="text-sm font-medium">Tu carrito está vacío</p>
                <p className="text-xs text-neutral-300">Agrega productos para comenzar</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3 border border-neutral-100 hover:border-neutral-200 transition-colors">
                    <div className="w-11 h-11 rounded-lg bg-neutral-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="text-lg">☕</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-800 truncate">{item.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 rounded-md bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-neutral-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-md bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors ml-0.5">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-neutral-100 bg-neutral-50 px-4 py-4 space-y-4">

              {/* Descuento */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Código de descuento" value={discountCode}
                    disabled={cart.length === 0}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && validateDiscount()}
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 disabled:bg-neutral-100 disabled:cursor-not-allowed transition"
                  />
                  <button onClick={() => validateDiscount()} disabled={cart.length === 0 || validating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors">
                    <Tag size={13} />
                    {validating ? "..." : "Aplicar"}
                  </button>
                </div>
                {discountMessage && (
                  <p className={`text-xs px-1 ${discountAmount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {discountMessage}
                  </p>
                )}
              </div>

              {/* Método de pago */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Método de pago</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "CONTRA_ENTREGA", label: "Contra entrega", icon: Truck },
                    { value: "TRANSFERENCIA",  label: "Transferencia",  icon: CreditCard },
                  ].map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setPaymentMethod(value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        paymentMethod === value
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                      }`}>
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-emerald-600">
                    <span>Descuento {discountData?.type === "PERCENTAGE" ? `(${discountData?.value}%)` : ""}</span>
                    <span>− {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-neutral-200">
                  <span className="font-bold text-neutral-900">Total</span>
                  <span className="font-bold text-neutral-900 text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout */}
              <button
                onClick={checkout}
                disabled={!cart.length}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                Finalizar compra →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <ModalLoginRegister open={openAuth} onClose={() => setOpenAuth(false)} />

      {/* ← ProfileModal integrado directamente */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}