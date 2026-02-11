import React, { useState, useEffect } from 'react'
import { X, Save, Image } from 'lucide-react'
import { useUser } from '../context/UserContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const MAX_CAROUSEL_IMAGES = 6

export default function CarouselEditorModal({ onClose, onSave }) {
  const { token } = useUser()
  const [galleryImages, setGalleryImages] = useState([])
  const [selectedImages, setSelectedImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchGalleryImages()
    loadSavedSelection()
  }, [])

  const fetchGalleryImages = async () => {
    try {
      const res = await fetch(`${API_BASE}/gallery/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Error al cargar imágenes')

      const data = await res.json()
      const filtered = (data.data || []).filter(img =>
        img.url &&
        ['GENERAL', 'CAROUSEL'].includes(img.image_type)
      )
      setGalleryImages(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedSelection = async () => {
    try {
      const res = await fetch(`${API_BASE}/config/carousel`)
      if (!res.ok) return

      const data = await res.json()
      const images = data.data?.images || []
      setSelectedImages(images)
    } catch (err) {
      console.error('Error loading saved carousel:', err)
    }
  }

  const toggleImage = (imageUrl) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl)
      } else {
        if (prev.length >= MAX_CAROUSEL_IMAGES) {
          alert(`Máximo ${MAX_CAROUSEL_IMAGES} imágenes en el carrusel`)
          return prev
        }
        return [...prev, imageUrl]
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/config/carousel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ images: selectedImages })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Error al guardar')
      }

      // Disparar evento para actualizar el carrusel en tiempo real
      window.dispatchEvent(new Event('carouselUpdated'))

      alert('Carrusel actualizado correctamente')
      onSave?.(selectedImages)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const moveImage = (fromIndex, toIndex) => {
    const newOrder = [...selectedImages]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    setSelectedImages(newOrder)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-coffee flex items-center gap-2">
              <Image className="w-6 h-6" />
              Editar Carrusel Principal
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona hasta {MAX_CAROUSEL_IMAGES} imágenes para mostrar en el carrusel
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Imágenes seleccionadas */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">
              Imágenes en el carrusel ({selectedImages.length}/{MAX_CAROUSEL_IMAGES})
            </h3>
            {selectedImages.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center border-2 border-dashed rounded-lg">
                No hay imágenes seleccionadas. Elige de la galería abajo.
              </p>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {selectedImages.map((url, idx) => (
                  <div key={url} className="relative group">
                    <div className="absolute -top-2 -left-2 bg-coffee text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10">
                      {idx + 1}
                    </div>
                    <img
                      src={url}
                      alt={`Carrusel ${idx + 1}`}
                      className="w-32 h-20 object-cover rounded-lg border-2 border-coffee"
                    />
                    <button
                      onClick={() => toggleImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {idx > 0 && (
                        <button
                          onClick={() => moveImage(idx, idx - 1)}
                          className="bg-white/90 px-2 py-0.5 rounded text-xs"
                        >
                          ←
                        </button>
                      )}
                      {idx < selectedImages.length - 1 && (
                        <button
                          onClick={() => moveImage(idx, idx + 1)}
                          className="bg-white/90 px-2 py-0.5 rounded text-xs"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Galería disponible */}
          <div>
            <h3 className="font-semibold mb-3">Galería disponible (General y Carrusel)</h3>

            {loading && <p className="text-gray-500 text-center py-4">Cargando...</p>}

            {!loading && galleryImages.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No hay imágenes disponibles. Sube imágenes de tipo "General" o "Carrusel" en la gestión de galería.
              </p>
            )}

            {!loading && galleryImages.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {galleryImages.map((image) => {
                  const isSelected = selectedImages.includes(image.url)
                  return (
                    <div
                      key={image.id}
                      onClick={() => toggleImage(image.url)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        isSelected
                          ? 'border-coffee shadow-lg'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-24 object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-coffee/30 flex items-center justify-center">
                          <span className="text-white text-3xl">✓</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5">
                        <div className="truncate">{image.title}</div>
                        <div className="text-[8px] opacity-75">{image.image_type}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selectedImages.length === 0}
            className="px-6 py-2 bg-coffee text-white rounded-lg hover:bg-coffee/90 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Carrusel'}
          </button>
        </div>
      </div>
    </div>
  )
}
