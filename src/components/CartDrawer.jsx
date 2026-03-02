import React, { useMemo, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useUser, getIncompleteFields } from "../context/UserContext";
import { useAlert } from "../context/AlertContext";
import { createOrder } from "../routes/orders";
import ModalLoginRegister from "./ModalLoginRegister";
import ProfileModal from "./ProfileModal";
import WompiButton from "./wompi/Wompibutton";
import {
  X, Trash2, Minus, Plus, Truck,
  Tag, ShoppingBag, ArrowRight, Coffee, Lock, AlertTriangle,
} from "lucide-react";

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

function generateWompiReference(userId) {
  const ts  = Date.now();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  const uid = userId ? userId.slice(-4).toUpperCase() : "GUST";
  return `CHEOS-${uid}-${ts}-${rnd}`;
}

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
        Completar mi perfil <ArrowRight size={15} />
      </button>
      <p className="text-xs text-neutral-400">Solo toma un minuto ☕</p>
    </div>
  );
}

/* ── Producto agotado al pagar ── */
function OutOfStockAlert({ productName, onRemove, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-300 via-red-500 to-red-800" />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
          <X size={16} />
        </button>
        <div className="px-7 pt-7 pb-8 flex flex-col items-center text-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 leading-tight tracking-tight">Producto agotado</h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              <span className="font-semibold text-neutral-700">"{productName}"</span> se agotó justo antes de procesar tu pedido.
            </p>
          </div>
          <div className="w-full space-y-2.5">
            <button onClick={onRemove} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]">
              <Trash2 size={15} /> Retirar del carrito y continuar
            </button>
            <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors">
              Volver al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer({ open, onClose, onOpenProfile }) {
  const { cart = [], removeFromCart, updateQuantity, onOrderSuccess } = useCart();
  const { user, token } = useUser();
  const { successToast, errorAlert } = useAlert();

  const [discountCode, setDiscountCode]       = useState("");
  const [discountData, setDiscountData]       = useState(null);
  const [discountAmount, setDiscountAmount]   = useState(0);
  const [validating, setValidating]           = useState(false);
  const [discountMessage, setDiscountMessage] = useState(null);
  const [paymentMethod, setPaymentMethod]     = useState("CONTRA_ENTREGA");
  const [openAuth, setOpenAuth]               = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [profileOpen, setProfileOpen]         = useState(false);
  const [loginAlert, setLoginAlert]           = useState(false);
  const [outOfStockAlert, setOutOfStockAlert] = useState(null);

  const [wompiReference, setWompiReference]   = useState(null);
  const [wompiStep, setWompiStep]             = useState(false);

  const missingFields = user ? getIncompleteFields(user) : [];
  const isBlocked     = user && missingFields.length > 0;

  const subtotal   = useMemo(() => cart.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 0), 0), [cart]);
  const total      = Math.max(0, subtotal - discountAmount);
  const totalItems = cart.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    setWompiStep(false);
    setWompiReference(null);
  }, [paymentMethod]);

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
        setDiscountAmount(0); setDiscountData(null);
        return;
      }
      setDiscountData(data.data.discount_code);
      setDiscountAmount(data.data.discount_amount);
      setDiscountMessage("Código aplicado correctamente ✅");
    } catch {
      setDiscountMessage("Error al validar descuento.");
      setDiscountAmount(0); setDiscountData(null);
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

  // ── CONTRA_ENTREGA: crea la orden de inmediato ──
  async function doCheckout() {
    const payload = {
      customer_name:  user?.name  || "",
      customer_email: user?.email || "",
      customer_phone: user?.phone || "",
      payment_method: "CONTRA_ENTREGA",
      shipping_address: {
        street:     user?.city         || "",
        number:     user?.neighborhood || "",
        city:       user?.municipality || "",
        department: "",
        zip_code:   "",
        details:    "",
      },
      items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
      ...(discountData?.code ? { discount_code: discountData.code } : {}),
    };

    setLoading(true);
    try {
      await createOrder(payload, token);
      onOrderSuccess();
      setDiscountAmount(0); setDiscountData(null); setDiscountCode("");
      setLoading(false);
      successToast("Pedido creado. Pagarás contra entrega 🚚");
      onClose();
    } catch (e) {
      setLoading(false);
      const errorMsg = e?.message || e?.error || "";
      const match = errorMsg.match(/el producto (.+?) no está disponible/i);
      if (match) {
        const name = match[1].trim();
        const item = cart.find(i => i.name.toLowerCase().trim() === name.toLowerCase().trim());
        setOutOfStockAlert({ id: item?.id ?? null, name });
        return;
      }
      errorAlert(errorMsg || "Error al crear el pedido");
    }
  }

  // ── WOMPI: guarda el pedido pendiente en sessionStorage y muestra el widget ──
  // La orden se crea en /pago-exitoso SOLO si Wompi confirma el pago
  function handleWompiCheckout() {
    if (!user || !token) { setLoginAlert(true); return; }
    if (isBlocked) return;
    if (cart.length === 0) return;

    const ref = generateWompiReference(user?.id);

    const pendingOrder = {
      customer_name:  user?.name  || "",
      customer_email: user?.email || "",
      customer_phone: user?.phone || "",
      payment_method: "WOMPI",
      shipping_address: {
        street:     user?.city         || "",
        number:     user?.neighborhood || "",
        city:       user?.municipality || "",
        department: "",
        zip_code:   "",
        details:    "",
      },
      items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
      ...(discountData?.code ? { discount_code: discountData.code } : {}),
    };

    // Persistir en sessionStorage para recuperarlo después del redirect de Wompi
    sessionStorage.setItem("wompi_pending_order", JSON.stringify(pendingOrder));
    sessionStorage.setItem("wompi_token", token);

    setWompiReference(ref);
    setWompiStep(true);
  }

  function cancelWompiStep() {
    setWompiStep(false);
    setWompiReference(null);
    sessionStorage.removeItem("wompi_pending_order");
    sessionStorage.removeItem("wompi_token");
  }

  async function checkout() {
    if (!user || !token) { setLoginAlert(true); return; }
    if (isBlocked) return;
    await doCheckout();
  }

  const handleRemoveOutOfStock = () => {
    if (outOfStockAlert?.id) removeFromCart(outOfStockAlert.id);
    setOutOfStockAlert(null);
  };

  const handleIncrement = (item) => {
    if (item.stock !== undefined && item.quantity >= item.stock) {
      errorAlert(`Solo hay ${item.stock} unidad${item.stock === 1 ? '' : 'es'} disponible${item.stock === 1 ? '' : 's'} de "${item.name}".`);
      return;
    }
    updateQuantity(item.id, item.quantity + 1);
  };

  const showDrawerBackdrop = open && !openAuth && !loginAlert && !outOfStockAlert;

  return (
    <>
      {showDrawerBackdrop && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            {wompiStep && (
              <button onClick={cancelWompiStep} className="text-neutral-400 hover:text-neutral-700 mr-1 transition-colors">
                ←
              </button>
            )}
            <h3 className="text-lg font-bold text-neutral-900">
              {wompiStep ? "Completar pago" : "Tu Carrito"}
            </h3>
            {totalItems > 0 && !wompiStep && (
              <span className="bg-neutral-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-neutral-100 transition-colors flex items-center justify-center text-neutral-400">
            <X size={17} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><CoffeeLoader /></div>
        ) : isBlocked ? (
          <SadCoffeeBlock missingFields={missingFields} onGoToProfile={() => { onClose(); setProfileOpen(true); if (onOpenProfile) onOpenProfile(); }} />

        ) : wompiStep ? (
          // ── Panel previo al redirect de Wompi ──
          // NO se crea la orden aquí. El usuario es redirigido a Wompi,
          // y al volver a /pago-exitoso se crea la orden si el pago fue aprobado.
          <div className="flex-1 flex flex-col px-5 py-6 gap-5">
            <div className="bg-neutral-50 rounded-xl border border-neutral-100 px-4 py-3 space-y-1.5">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Resumen</p>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-neutral-600">{item.quantity}× {item.name}</span>
                  <span className="font-medium text-neutral-800">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm font-medium text-emerald-600 pt-1 border-t border-dashed border-neutral-200">
                  <span>Descuento</span>
                  <span>− {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-neutral-500 text-center">
                Paga de forma segura con tarjeta, PSE, Nequi, Bancolombia y más
              </p>
              <WompiButton
                amountInCents={total * 100}
                currency="COP"
                reference={wompiReference}
                customerEmail={user?.email || ""}
              />
              <p className="text-xs text-neutral-300 flex items-center gap-1">
                🔒 Serás redirigido a Wompi para completar el pago
              </p>
            </div>
          </div>

        ) : (
          <>
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
                {cart.map(item => {
                  const atMax = item.stock !== undefined && item.quantity >= item.stock;
                  return (
                    <div key={item.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3 border border-neutral-100 hover:border-neutral-200 transition-colors">
                      <div className="w-11 h-11 rounded-lg bg-neutral-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <span className="text-lg">☕</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 truncate">{item.name}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{item.quantity} × {formatPrice(item.price)}</p>
                        {atMax && <p className="text-[10px] text-amber-600 font-medium mt-0.5">Máximo disponible ({item.stock})</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-7 h-7 rounded-md bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-neutral-800">{item.quantity}</span>
                        <button onClick={() => handleIncrement(item)} disabled={atMax} className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${atMax ? "bg-neutral-100 text-neutral-300 cursor-not-allowed" : "bg-neutral-200 hover:bg-neutral-300"}`}>
                          <Plus size={12} />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors ml-0.5">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex-shrink-0 border-t border-neutral-100 bg-neutral-50 px-4 py-4 space-y-4">
              {/* Código de descuento */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Código de descuento" value={discountCode}
                    disabled={cart.length === 0}
                    onChange={e => setDiscountCode(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && validateDiscount()}
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 disabled:bg-neutral-100 disabled:cursor-not-allowed transition"
                  />
                  <button onClick={() => validateDiscount()} disabled={cart.length === 0 || validating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors">
                    <Tag size={13} />{validating ? "..." : "Aplicar"}
                  </button>
                </div>
                {discountMessage && (
                  <p className={`text-xs px-1 ${discountAmount > 0 ? "text-emerald-600" : "text-red-500"}`}>{discountMessage}</p>
                )}
              </div>

              {/* Método de pago */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Método de pago</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "CONTRA_ENTREGA", label: "Contraentrega", icon: Truck },
                    { value: "WOMPI",          label: "Pagar online",  icon: Lock  },
                  ].map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setPaymentMethod(value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${paymentMethod === value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"}`}>
                      <Icon size={15} />
                      <span className="text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
                {paymentMethod === "WOMPI" && (
                  <p className="text-xs text-neutral-400 text-center">
                    💳 Tarjeta, PSE, Nequi, Bancolombia, transferencias y más
                  </p>
                )}
              </div>

              {/* Totales */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
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

              {/* Botón de acción */}
              {paymentMethod === "WOMPI" ? (
                <button
                  onClick={handleWompiCheckout}
                  disabled={!cart.length}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Lock size={14} /> Continuar al pago
                </button>
              ) : (
                <button
                  onClick={checkout}
                  disabled={!cart.length}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                >
                  Finalizar compra →
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {outOfStockAlert && (
        <OutOfStockAlert
          productName={outOfStockAlert.name}
          onRemove={handleRemoveOutOfStock}
          onClose={() => setOutOfStockAlert(null)}
        />
      )}

      {loginAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLoginAlert(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 via-amber-700 to-stone-900" />
            <button onClick={() => setLoginAlert(false)} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <X size={16} />
            </button>
            <div className="px-7 pt-7 pb-8 flex flex-col items-center text-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="absolute inset-0 opacity-40">
                    <path d="M30 28 Q27 22 30 16" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none">
                      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                    </path>
                    <path d="M40 28 Q37 22 40 16" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none">
                      <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.6s" repeatCount="indefinite" />
                    </path>
                    <path d="M50 28 Q47 22 50 16" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none">
                      <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.2s" repeatCount="indefinite" />
                    </path>
                  </svg>
                  <Coffee size={30} className="text-amber-800 relative z-10" />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center">
                  <Lock size={12} className="text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-900 leading-tight tracking-tight">Inicia sesión para<br />continuar</h2>
                <p className="text-sm text-neutral-500 leading-relaxed">Necesitas una cuenta para finalizar tu pedido. ¡Tu carrito te espera!</p>
              </div>
              <div className="w-full space-y-2.5">
                <button onClick={() => { setLoginAlert(false); setOpenAuth(true); }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-700 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]">
                  Iniciar sesión / Registrarme <ArrowRight size={15} />
                </button>
                <button onClick={() => setLoginAlert(false)}
                  className="w-full py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors">
                  Volver al carrito
                </button>
              </div>
              <p className="text-xs text-neutral-500">Es gratis y toma menos de un minuto ☕</p>
            </div>
          </div>
        </div>
      )}

      <ModalLoginRegister open={openAuth} onClose={() => setOpenAuth(false)} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}