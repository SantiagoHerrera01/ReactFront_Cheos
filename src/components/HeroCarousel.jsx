import React, { useEffect, useState } from 'react'
export default function HeroCarousel(){
  const imgs = [
    'https://picsum.photos/1600/800?coffee1',
    'https://picsum.photos/1600/800?coffee2',
    'https://picsum.photos/1600/800?coffee3'
  ]
  const [idx,setIdx]=useState(0)
  useEffect(()=>{const t=setInterval(()=>setIdx(i=> (i+1)%imgs.length),5000);return ()=>clearInterval(t)},[])
  return (
    <section id="hero" className="relative h-[72vh] w-full overflow-hidden">
      {imgs.map((s,i)=> (
        <img key={i} src={s} alt="hero" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i===idx? 'opacity-100':'opacity-0'}`} />
      ))}
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/60 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold">Cheos Café</h1>
        <p className="mt-3 text-lg md:text-2xl text-coffee">Café de especialidad 100% antioqueño</p>
        <button onClick={()=>document.getElementById('products')?.scrollIntoView({behavior:'smooth'})} className="mt-6 bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-coffee">Explorar Productos</button>
      </div>
    </div>
    </section>
  )
}
