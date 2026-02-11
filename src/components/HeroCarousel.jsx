import React, { useEffect, useState } from 'react'
import { getCarouselImages } from './CarouselEditorModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

// Imágenes por defecto si no hay ninguna configurada
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&h=800&fit=crop'
]

export default function HeroCarousel() {
  const [images, setImages] = useState([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCarouselImages()
  }, [])

  const loadCarouselImages = async () => {
    try {
      // Primero intentar cargar desde localStorage
      const savedImages = getCarouselImages()

      if (savedImages && savedImages.length > 0) {
        setImages(savedImages)
        setLoading(false)
        return
      }

      // Si no hay guardadas, cargar imágenes tipo CAROUSEL desde API
      const res = await fetch(`${API_BASE}/gallery/type/CAROUSEL`)
      if (res.ok) {
        const data = await res.json()
        const carouselImages = (data.data || [])
          .filter(img => img.url)
          .map(img => img.url)
          .slice(0, 6)

        if (carouselImages.length > 0) {
          setImages(carouselImages)
        } else {
          setImages(DEFAULT_IMAGES)
        }
      } else {
        setImages(DEFAULT_IMAGES)
      }
    } catch (err) {
      console.error('Error loading carousel:', err)
      setImages(DEFAULT_IMAGES)
    } finally {
      setLoading(false)
    }
  }

  // Auto-rotate carousel
  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setIdx(i => (i + 1) % images.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [images.length])

  // Escuchar cambios en localStorage (cuando el admin guarda)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedImages = getCarouselImages()
      if (savedImages && savedImages.length > 0) {
        setImages(savedImages)
        setIdx(0)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // También escuchar evento personalizado para cambios en la misma pestaña
    window.addEventListener('carouselUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('carouselUpdated', handleStorageChange)
    }
  }, [])

  if (loading) {
    return (
      <section id="hero" className="relative h-[72vh] w-full overflow-hidden bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p>Cargando...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="hero" className="relative h-[72vh] w-full overflow-hidden">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Cheos Café ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === idx ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/60 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold">Cheos Café</h1>
          <p className="mt-3 text-lg md:text-2xl text-coffee">Café de especialidad 100% antioqueño</p>
          <button
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-6 bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-coffee transition-colors"
          >
            Explorar Productos
          </button>
        </div>
      </div>

      {/* Indicadores */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === idx ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
