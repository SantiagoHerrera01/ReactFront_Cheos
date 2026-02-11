import React, { useState, useEffect } from 'react'

export default function GalleryImageSelector({ selectedImages = [], onImagesChange, token, singleSelect = false }) {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
  const [galleryImages, setGalleryImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    if (showGallery && galleryImages.length === 0) {
      fetchGalleryImages()
    }
  }, [showGallery])

  const fetchGalleryImages = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/gallery/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al cargar las imágenes de la galería')
      }

      const data = await res.json()
      // Filter out images without valid URLs
      const validImages = (data.data || []).filter(img => img.url && img.url.trim() !== '')
      setGalleryImages(validImages)
    } catch (err) {
      console.error('Error cargando galería:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleImageSelection = (imageUrl) => {
    if (singleSelect) {
      // Modo selección única: si ya está seleccionada, la deselecciona; si no, reemplaza la selección
      const newSelection = selectedImages.includes(imageUrl) ? [] : [imageUrl]
      onImagesChange(newSelection)
    } else {
      // Modo selección múltiple
      const newSelection = selectedImages.includes(imageUrl)
        ? selectedImages.filter(url => url !== imageUrl)
        : [...selectedImages, imageUrl]
      onImagesChange(newSelection)
    }
  }

  const removeImage = (imageUrl) => {
    const newSelection = selectedImages.filter(url => url !== imageUrl)
    onImagesChange(newSelection)
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {singleSelect ? 'Imagen del producto' : 'Imágenes del producto'}
      </label>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">
            {singleSelect ? 'Imagen seleccionada:' : `Imágenes seleccionadas (${selectedImages.length}):`}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedImages.filter(url => url && url.trim() !== '').map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Seleccionada ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-coffee"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Gallery Button */}
      <button
        type="button"
        onClick={() => setShowGallery(!showGallery)}
        className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-coffee hover:bg-coffee/5 transition-colors text-sm text-gray-600"
      >
        {showGallery ? '▼ Ocultar galería' : '▶ Seleccionar de la galería'}
      </button>

      {/* Gallery Grid */}
      {showGallery && (
        <div className="mt-3 border rounded-lg p-3 bg-gray-50 max-h-64 overflow-y-auto">
          {loading && <p className="text-sm text-gray-500 text-center py-4">Cargando imágenes...</p>}

          {error && (
            <div className="text-sm text-red-500 text-center py-4">
              <p>{error}</p>
              <button
                type="button"
                onClick={fetchGalleryImages}
                className="mt-2 text-coffee underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && galleryImages.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay imágenes en la galería. Sube imágenes primero.
            </p>
          )}

          {!loading && !error && galleryImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => toggleImageSelection(image.url)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedImages.includes(image.url)
                      ? 'border-coffee shadow-md'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  title={image.title || 'Sin título'}
                >
                  <img
                    src={image.url || ''}
                    alt={image.title || 'Imagen de galería'}
                    className="w-full h-20 object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  {selectedImages.includes(image.url) && (
                    <div className="absolute inset-0 bg-coffee/20 flex items-center justify-center">
                      <span className="text-white text-2xl">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual URL Input (fallback) */}
      <details className="mt-3">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-coffee">
          O agregar URLs manualmente
        </summary>
        <input
          type="text"
          placeholder="URLs separadas por coma"
          value={selectedImages.join(', ')}
          onChange={(e) => {
            const urls = e.target.value.split(',').map(u => u.trim()).filter(Boolean)
            onImagesChange(urls)
          }}
          className="w-full mt-2 p-2 border rounded-lg text-sm"
        />
      </details>
    </div>
  )
}
