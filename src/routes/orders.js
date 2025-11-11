const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
export async function createOrder(payload, token){
  const res = await fetch(`${API}/orders`,{method:'POST',headers:{'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}: {})},body:JSON.stringify(payload)})
  if(!res.ok) throw new Error('Error')
  return res.json()
}
