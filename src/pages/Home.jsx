import React, { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <Navbar />
      <header className="mt-20">
        <h1 className="text-5xl font-bold text-amber-400">Bienvenido a Cheos Café</h1>
        <p className="text-lg text-stone-300 mt-4 max-w-2xl">
          Disfruta del mejor café antioqueño, con aroma, sabor y tradición. Conoce nuestros productos y ubicaciones.
        </p>
      </header>
      <section className="mt-16 grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="bg-stone-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-amber-300 mb-2">Café Molido</h3>
          <p>Café molido premium 100% de origen antioqueño.</p>
        </div>
        <div className="bg-stone-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-amber-300 mb-2">Café en Grano</h3>
          <p>Seleccionado cuidadosamente para un sabor intenso y natural.</p>
        </div>
        <div className="bg-stone-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-amber-300 mb-2">Cápsulas</h3>
          <p>Compatibles con máquinas Nespresso®, listas para disfrutar.</p>
        </div>
      </section>
    </div>
  );
}
