// src/routes/wompi.js
// Cheos Café — Wompi API calls
// Mismo patrón que src/routes/orders.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"

/**
 * Solicita al backend la firma de integridad para Wompi
 * Se llama ANTES de mostrar el widget de pago
 *
 * @param {{ reference: string, amount_in_cents: number, currency: string }} data
 * @returns {{ signature, reference, amount_in_cents, currency, public_key }}
 */
export async function getWompiSignature(data) {
  const res = await fetch(`${API_BASE}/payments/wompi/signature`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "Error generando firma de pago")
  }

  return res.json()
}

/**
 * Consulta el estado de una transacción Wompi via backend
 * Se llama en la página /pago-exitoso para mostrar el resultado
 *
 * @param {string} transactionId - ID que Wompi manda en la URL (?id=...)
 */
export async function getWompiTransaction(transactionId) {
  const res = await fetch(`${API_BASE}/payments/wompi/transaction/${transactionId}`)

  if (!res.ok) {
    throw new Error("Error consultando la transacción")
  }

  return res.json()
}