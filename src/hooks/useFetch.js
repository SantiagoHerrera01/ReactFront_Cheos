import { useState, useEffect } from 'react'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
export function useFetch(endpoint){
  const [data,setData] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  useEffect(()=>{
    let cancelled=false
    async function load(){
      try{
        const res = await fetch(`${API_BASE}${endpoint}`)
        if(!res.ok) throw new Error('Error fetching')
        const json = await res.json()
        if(!cancelled) setData(json)
      }catch(e){ if(!cancelled) setError(e.message) }
      finally{ if(!cancelled) setLoading(false) }
    }
    load()
    return ()=>{ cancelled=true }
  },[endpoint])
  return { data, loading, error }
}
