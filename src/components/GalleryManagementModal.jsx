import React, { useState, useEffect } from 'react'
import { Upload, Trash2, X } from 'lucide-react'
import { useUser } from '../context/UserContext'

export default function GalleryManagementModal({ onClose }) {
  const API_BASE = 'http://localhost:8080/api/v1'
  const { token } = useUser()
  const [galleryImages, setGalleryImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Upload form state
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    image_type: 'GENERAL',
    tags: '',
    is_active: true
  })

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/gallery`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Error al cargar imágenes')
      const data = await res.json()
      setGalleryImages(data.data || [])
    } catch (err) {
      console.error(err)
      alert('❌ No se pudieron cargar las imágenes')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('⚠️ Solo se permiten imágenes (JPG, PNG, WEBP, GIF)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('⚠️ La imagen es demasiado grande. Máximo 10MB')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('⚠️ Selecciona una imagen primero')
      return
    }

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('title', uploadForm.title)
    formData.append('description', uploadForm.description)
    formData.append('image_type', uploadForm.image_type)
    formData.append('is_active', uploadForm.is_active)

    if (uploadForm.tags) {
      const tagsArray = uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      tagsArray.forEach(tag => formData.append('tags', tag))
    }

    setUploading(true)
    try {
      const res = await fetch(`${API_BASE}/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al subir imagen')
      }

      alert('✅ Imagen subida exitosamente')

      // Reset form
      setSelectedFile(null)
      setPreviewUrl(null)
      setUploadForm({
        title: '',
        description: '',
        image_type: 'GENERAL',
        tags: '',
        is_active: true
      })

      // Reload gallery
      fetchGalleryImages()
    } catch (err) {
      console.error(err)
      alert(`❌ ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return

    try {
      const res = await fetch(`${API_BASE}/gallery/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Error al eliminar')

      alert('✅ Imagen eliminada')
      fetchGalleryImages()
    } catch (err) {
      console.error(err)
      alert('❌ No se pudo eliminar la imagen')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-coffee">Gestión de Galería</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" /> Subir Nueva Imagen
              </h3>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Seleccionar Imagen</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: JPG, PNG, WEBP, GIF | Máximo: 10MB
                  </p>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null) }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full p-2 border rounded-lg h-20"
                  />
                </div>

                {/* Image Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Imagen</label>
                  <select
                    value={uploadForm.image_type}
                    onChange={(e) => setUploadForm({ ...uploadForm, image_type: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="GENERAL">General</option>
                    <option value="PRODUCT">Producto</option>
                    <option value="CAROUSEL">Carrusel</option>
                    <option value="BACKGROUND">Fondo</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-1">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    placeholder="cafe, colombiano, premium"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                {/* Active */}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={uploadForm.is_active}
                    onChange={(e) => setUploadForm({ ...uploadForm, is_active: e.target.checked })}
                  />
                  Imagen activa
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full bg-coffee text-white py-2 rounded-lg hover:bg-coffee/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Subiendo...' : 'Subir Imagen'}
                </button>
              </form>
            </div>

            {/* Gallery List */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Imágenes en Galería ({galleryImages.length})</h3>

              {loading && <p className="text-center text-gray-500">Cargando...</p>}

              {!loading && galleryImages.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay imágenes en la galería</p>
              )}

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {galleryImages.map((image) => (
                  <div key={image.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex gap-3">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{image.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{image.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-coffee/10 text-coffee px-2 py-1 rounded">
                            {image.image_type}
                          </span>
                          {!image.is_active && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                              Inactiva
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 h-fit"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
