import React, { useEffect, useState } from 'react'
import { getLocations } from '../routes/locations'
export default function LocationsSection(){
  const [locs,setLocs]=useState([])
  useEffect(()=>{ let m=true; getLocations().then(d=>{ if(m){ const arr = Array.isArray(d)? d: d.locations|| d.data||[]; setLocs(arr)}}).catch(console.error); return ()=> m=false },[])
  return (
    <section id="locations" className="py-12 bg-gray-50 text-black"> <div className="max-w-6xl mx-auto px-6"> <h2 className="text-3xl font-bold text-center text-coffee mb-6">Nuestras Tiendas</h2>
      <div className="grid md:grid-cols-2 gap-6"> {locs.map(l=> (
        <div key={l.id} className="bg-white p-4 rounded-lg shadow"> <h3 className="font-semibold">{l.name}</h3>
        <p className="text-sm text-gray-600">{l.address}, {l.city}</p>
        <p className="text-sm text-gray-600">Tel: {l.phone}</p>
        </div>
      ))}</div></div></section>
  )
}
