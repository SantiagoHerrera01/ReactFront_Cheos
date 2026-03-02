import { useState, useEffect } from "react"
import { getWompiSignature } from "../../routes/wompi"
import { Lock } from "lucide-react"

const CHECKOUT_URL = "https://checkout.wompi.co/p"

export default function WompiButton({
  amountInCents,
  currency = "COP",
  reference,
  customerEmail = "",
  onError,
}) {
  const [signature, setSignature] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // ✅ Leídas dentro del componente para evitar que queden
  // congeladas como undefined en el bundle de Netlify
  const wompiEnv  = import.meta.env.VITE_WOMPI_ENV || "sandbox"
  const publicKey = wompiEnv === "production"
    ? import.meta.env.VITE_WOMPI_PUBLIC_KEY_PROD
    : import.meta.env.VITE_WOMPI_PUBLIC_KEY_SANDBOX

  const finalRedirectUrl = "https://cheoscafe.netlify.app/pago-exitoso"

  useEffect(() => {
    // Guard: si no hay llave, mostrar error inmediatamente
    if (!publicKey) {
      setError("Llave pública de Wompi no configurada. Contacta al administrador.")
      setLoading(false)
      return
    }

    if (!amountInCents || !reference) return

    setLoading(true)
    setError(null)

    const safeAmount = Math.round(Number(amountInCents))

    getWompiSignature({ reference, amount_in_cents: safeAmount, currency })
      .then((data) => { setSignature(data.signature); setLoading(false) })
      .catch((err)  => { setError(err.message || "Error generando firma"); setLoading(false); onError?.(err) })
  }, [amountInCents, reference, currency, publicKey])

  const handlePay = () => {
    if (!signature || !publicKey) return

    const safeAmount = Math.round(Number(amountInCents))

    const params = new URLSearchParams({
      "public-key":          publicKey,
      "currency":            currency,
      "amount-in-cents":     String(safeAmount),
      "reference":           reference,
      "signature:integrity": signature,
      "redirect-url":        finalRedirectUrl,
    })

    if (customerEmail) {
      params.set("customer-data:email", customerEmail)
    }

    window.location.href = `${CHECKOUT_URL}?${params.toString()}`
  }

  if (error) {
    return (
      <div className="w-full text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
        ⚠️ {error}
      </div>
    )
  }

  if (loading || !signature) {
    return (
      <button disabled className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-neutral-100 text-neutral-400 rounded-xl font-medium cursor-not-allowed">
        <span className="h-4 w-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        Preparando pago...
      </button>
    )
  }

  return (
    <button
      onClick={handlePay}
      className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-neutral-900 hover:bg-neutral-700 text-white rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
    >
      <Lock size={14} />
      Ir a pagar con Wompi
    </button>
  )
}