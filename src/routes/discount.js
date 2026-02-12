const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"

export async function validateDiscount(code, purchaseTotal) {
  try {
    const response = await fetch(`${API_BASE}/discounts/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code,
        purchase_total: purchaseTotal
      })
    })

    const data = await response.json()

    // 🔥 Si backend responde error HTTP (400, 404, etc)
    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Error validando el descuento."
      }
    }

    return data

  } catch (error) {
    console.error("Error en validateDiscount:", error)
    return {
      success: false,
      message: "No se pudo conectar con el servidor."
    }
  }
}
