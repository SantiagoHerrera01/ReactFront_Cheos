const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
export async function getProducts(){
  const res = await fetch(`${API}/products`)
  if(!res.ok) throw new Error('Error')
  return res.json()
}
export async function getProduct(id){
  const res = await fetch(`${API}/products/${id}`)
  if(!res.ok) throw new Error('Error')
  return res.json()
}
