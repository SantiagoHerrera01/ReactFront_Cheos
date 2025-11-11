import React from 'react'
export default function Footer(){
  return (<footer className="bg-black text-white py-8 mt-8"> <div className="max-w-6xl mx-auto px-6 text-center"> <div className="text-coffee font-semibold">Cheos Café</div>
  <p className="text-sm text-gray-400 mt-2">© {new Date().getFullYear()} Cheos Café. Todos los derechos reservados.</p></div></footer>)
}
