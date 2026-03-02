// src/pages/PaymentSuccess.jsx
// Cheos Café — Página de resultado de pago Wompi
// ✅ Verifica el pago con Wompi y, si es APPROVED, crea la orden en el backend

import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { getWompiTransaction } from "../../routes/wompi"
import { createOrder } from "../../routes/orders"
import { useCart } from "../../context/CartContext"
import CoffeeLoader from "../Coffeeloader"

const WOMPI_SANDBOX_URL    = "https://sandbox.wompi.co/v1"
const WOMPI_PRODUCTION_URL = "https://production.wompi.co/v1"
const WOMPI_ENV            = import.meta.env.VITE_WOMPI_ENV || "sandbox"
const WOMPI_BASE_URL       = WOMPI_ENV === "production" ? WOMPI_PRODUCTION_URL : WOMPI_SANDBOX_URL
const PUBLIC_KEY           = WOMPI_ENV === "production"
  ? import.meta.env.VITE_WOMPI_PUBLIC_KEY_PROD
  : import.meta.env.VITE_WOMPI_PUBLIC_KEY_SANDBOX

const STATUS_INFO = {
  APPROVED: {
    emoji: "✅",
    title: "¡Pago aprobado!",
    msg: "Tu pedido ha sido recibido y está en preparación.",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  PENDING: {
    emoji: "⏳",
    title: "Pago en proceso",
    msg: "Tu pago está siendo verificado. Te notificaremos pronto.",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
  },
  DECLINED: {
    emoji: "❌",
    title: "Pago rechazado",
    msg: "Tu pago no pudo procesarse. Intenta con otro método.",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  VOIDED: {
    emoji: "🚫",
    title: "Pago anulado",
    msg: "La transacción fue cancelada.",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  },
  ERROR: {
    emoji: "⚠️",
    title: "No se pudo verificar",
    msg: "No pudimos obtener el estado de tu pago. Si ya pagaste, revisa tu email de confirmación.",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
  },
}

// Busca transacción directamente en la API de Wompi por referencia
async function fetchByReference(reference) {
  const res = await fetch(
    `${WOMPI_BASE_URL}/transactions?reference=${reference}`,
    { headers: { Authorization: `Bearer ${PUBLIC_KEY}` } }
  )
  if (!res.ok) throw new Error("No se encontró la transacción")
  const data = await res.json()
  const transactions = data?.data || []
  if (transactions.length === 0) throw new Error("Sin transacciones para esta referencia")
  transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data: transactions[0] }
}

// Intenta crear la orden si el pago fue aprobado.
// Usa sessionStorage para recuperar el pedido pendiente guardado en CartDrawer.
// Es idempotente: si ya se creó (orderCreated flag), no vuelve a intentarlo.
async function tryCreateOrder(onOrderSuccess) {
  const rawOrder = sessionStorage.getItem("wompi_pending_order")
  const token    = sessionStorage.getItem("wompi_token")

  if (!rawOrder || !token) return // No hay pedido pendiente (quizás ya se procesó)

  const pendingOrder = JSON.parse(rawOrder)
  await createOrder(pendingOrder, token)

  // Limpiar sessionStorage y carrito
  sessionStorage.removeItem("wompi_pending_order")
  sessionStorage.removeItem("wompi_token")
  onOrderSuccess()
}

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const { onOrderSuccess } = useCart()

  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [orderError, setOrderError]   = useState(null) // error al crear la orden
  const [searchRef, setSearchRef]     = useState("")
  const [searching, setSearching]     = useState(false)
  const [searchError, setSearchError] = useState(null)

  const transactionId = params.get("id")
  const reference     = params.get("reference")

  useEffect(() => {
    async function handleReturn() {
      let txData = null

      // ── Caso 1: hay ID en la URL ──
      if (transactionId) {
        try {
          txData = await getWompiTransaction(transactionId)
        } catch {
          // Fallback directo a Wompi si el backend falla
          try {
            const r = await fetch(`${WOMPI_BASE_URL}/transactions/${transactionId}`, {
              headers: { Authorization: `Bearer ${PUBLIC_KEY}` }
            })
            txData = await r.json()
          } catch {
            txData = { data: { status: "ERROR" } }
          }
        }
      }

      // ── Caso 2: hay referencia en la URL ──
      else if (reference) {
        try {
          txData = await fetchByReference(reference)
        } catch {
          txData = { data: { status: "ERROR" } }
        }
      }

      // ── Caso 3: nada en la URL — mostrar buscador manual ──
      else {
        setLoading(false)
        return
      }

      setTransaction(txData)

      // ── Si el pago fue APPROVED → crear la orden ──
      if (txData?.data?.status === "APPROVED") {
        try {
          await tryCreateOrder(onOrderSuccess)
        } catch (err) {
          console.error("Error creando la orden tras pago aprobado:", err)
          // Mostramos aviso pero NO ocultamos el APPROVED — el pago sí se hizo
          setOrderError(
            "El pago fue aprobado pero hubo un problema al registrar tu pedido. " +
            "Contáctanos con tu referencia de pago y lo solucionamos de inmediato."
          )
        }
      } else {
        // Si el pago no fue aprobado, limpiar el pedido pendiente de todas formas
        sessionStorage.removeItem("wompi_pending_order")
        sessionStorage.removeItem("wompi_token")
      }

      setLoading(false)
    }

    handleReturn()
  }, [transactionId, reference])

  // Búsqueda manual por referencia (para desarrollo en localhost)
  const handleManualSearch = async () => {
    if (!searchRef.trim()) return
    setSearching(true)
    setSearchError(null)
    try {
      const data = await fetchByReference(searchRef.trim())
      setTransaction(data)

      if (data?.data?.status === "APPROVED") {
        try {
          await tryCreateOrder(onOrderSuccess)
        } catch {
          setOrderError(
            "El pago fue aprobado pero hubo un problema al registrar tu pedido. " +
            "Contáctanos con tu referencia de pago."
          )
        }
      } else {
        sessionStorage.removeItem("wompi_pending_order")
        sessionStorage.removeItem("wompi_token")
      }
    } catch {
      setSearchError("No se encontró ninguna transacción con esa referencia.")
    } finally {
      setSearching(false)
    }
  }

  const status = transaction?.data?.status
  const info   = STATUS_INFO[status] || STATUS_INFO["PENDING"]

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

        <h1 className="text-2xl font-bold text-amber-900 mb-1">☕ Cheos Café</h1>
        <p className="text-gray-400 text-sm mb-6">Resultado de tu pago</p>

        {loading ? (
          <div className="py-8">
            <CoffeeLoader variant="pour" message="Verificando tu pago..." />
          </div>
        ) : transaction ? (
          <>
            {/* Estado del pago */}
            <div className={`rounded-xl border p-5 mb-4 ${info.bg}`}>
              <p className="text-4xl mb-2">{info.emoji}</p>
              <p className={`text-lg font-bold ${info.color}`}>{info.title}</p>
              <p className="text-sm text-gray-500 mt-1">{info.msg}</p>
            </div>

            {/* Aviso si la orden no se pudo crear pese al pago aprobado */}
            {orderError && (
              <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 text-left">
                <p className="font-semibold mb-0.5">⚠️ Atención</p>
                <p>{orderError}</p>
              </div>
            )}

            {/* Detalle de la transacción */}
            {transaction?.data && status !== "ERROR" && (
              <div className="text-sm text-left space-y-2 bg-gray-50 rounded-xl p-4 mb-6">
                {transaction.data.reference && (
                  <Row label="Referencia" value={transaction.data.reference} />
                )}
                {transaction.data.amount_in_cents && (
                  <Row
                    label="Total pagado"
                    value={`$${(transaction.data.amount_in_cents / 100).toLocaleString("es-CO")} COP`}
                  />
                )}
                {transaction.data.payment_method_type && (
                  <Row label="Método" value={transaction.data.payment_method_type} />
                )}
                {transaction.data.id && (
                  <Row label="ID transacción" value={transaction.data.id} mono />
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="block bg-amber-700 hover:bg-amber-800 text-white py-3 px-6 rounded-xl font-medium transition-colors"
              >
                Volver al inicio
              </Link>
              {status === "DECLINED" && (
                <button
                  onClick={() => window.history.back()}
                  className="border border-amber-700 text-amber-700 hover:bg-amber-50 py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  Intentar de nuevo
                </button>
              )}
            </div>
          </>
        ) : (
          // Buscador manual — útil en desarrollo cuando el redirect no trae parámetros
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              <p className="font-semibold mb-1">¿Ya realizaste el pago?</p>
              <p className="text-xs text-amber-600">
                Ingresa tu referencia de pago (ej: CHEOS-XXXX-...) para verificar el estado.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CHEOS-XXXX-1234567890-ABCD"
                value={searchRef}
                onChange={e => setSearchRef(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleManualSearch()}
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={handleManualSearch}
                disabled={searching || !searchRef.trim()}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium rounded-lg disabled:bg-amber-200 transition-colors"
              >
                {searching ? "..." : "Buscar"}
              </button>
            </div>

            {searchError && (
              <p className="text-sm text-red-500">{searchError}</p>
            )}

            <Link to="/" className="block text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium text-gray-700 text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  )
}