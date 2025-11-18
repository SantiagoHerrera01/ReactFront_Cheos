const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export async function getLocations() {
  const res = await fetch(`${API}/locations/all`)
  if (!res.ok) throw new Error('Error obteniendo locations')

  const data = await res.json()

  // Extraemos correctamente: data.data.locations
  return data?.data?.locations || []
}
