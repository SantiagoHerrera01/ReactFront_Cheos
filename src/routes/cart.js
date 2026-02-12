const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export async function getCart(token) {
  const res = await fetch(`${API}/cart`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Error al obtener carrito')
  return res.json()
}

export async function addCartItem(token, productId, quantity) {
  const res = await fetch(`${API}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ product_id: productId, quantity })
  })
  if (!res.ok) throw new Error('Error al agregar al carrito')
  return res.json()
}

export async function updateCartItemQuantity(token, productId, quantity) {
  const res = await fetch(`${API}/cart/items/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ quantity })
  })
  if (!res.ok) throw new Error('Error al actualizar cantidad')
  return res.json()
}

export async function removeCartItem(token, productId) {
  const res = await fetch(`${API}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Error al eliminar del carrito')
  return res.json()
}

export async function clearCartAPI(token) {
  const res = await fetch(`${API}/cart`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Error al vaciar carrito')
  return res.json()
}

export async function syncCart(token, items) {
  const res = await fetch(`${API}/cart/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ items })
  })
  if (!res.ok) throw new Error('Error al sincronizar carrito')
  return res.json()
}
