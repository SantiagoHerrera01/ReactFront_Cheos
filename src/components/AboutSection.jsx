import React, { useEffect, useState } from 'react'
import { Pencil, Save, X, ChevronLeft, ChevronRight } from 'lucide-react'
import GalleryImageSelector from './GalleryImageSelector'
import { useUser } from '../context/UserContext'
import { useAlert } from '../context/AlertContext'

export default function AboutSection() {
  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1') + '/config'
  const { user, token, loading } = useUser()
  const { successToast, errorAlert } = useAlert()

  const [aboutData, setAboutData] = useState({
    description: 'En Cheos Café cultivamos la pasión por el café colombiano...',
    images: []
  })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [currentImage, setCurrentImage] = useState(0)
  const [fade, setFade] = useState(true) // Para transición suave

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    fetchAbout()
  }, [])

  // Carrusel automático cada 5 segundos
  useEffect(() => {
    if (selectedImages.length <= 1) return
    const interval = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedImages])

  // GET público
  const fetchAbout = async () => {
    try {
      const res = await fetch(`${API_BASE}/about`)
      if (!res.ok) return
      const data = await res.json()
      if (!data.success) return

      const info = data.data
      setAboutData({
        description: info.description || '',
        images: info.images || []
      })

      if (info.images && info.images.length > 0) {
        setSelectedImages(info.images)
        setCurrentImage(0)
        setFade(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // POST protegido
  const handleSave = async () => {
    if (!isAdmin) return
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/about`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          description: aboutData.description,
          images: selectedImages
        })
      })
      if (!res.ok) throw new Error('Error al guardar')
      successToast('Sección actualizada correctamente')
      setEditing(false)
      fetchAbout()
    } catch (err) {
      errorAlert(err.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const handlePrev = () => {
    setFade(false)
    setTimeout(() => {
      setCurrentImage((prev) => (prev === 0 ? selectedImages.length - 1 : prev - 1))
      setFade(true)
    }, 200)
  }

  const handleNext = () => {
    setFade(false)
    setTimeout(() => {
      setCurrentImage((prev) => (prev === selectedImages.length - 1 ? 0 : prev + 1))
      setFade(true)
    }, 200)
  }

  if (loading) {
    return (
      <section className="py-12 bg-white text-black text-center text-gray-500">
        Cargando sección...
      </section>
    )
  }

  return (
    <section id="about" className="py-16 bg-gray-50 text-black">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-start md:gap-12">

        {/* Texto principal */}
        <div className="md:w-1/2 flex flex-col items-center md:items-start space-y-6 mb-8 md:mb-0">
          <h2 className="text-4xl font-extrabold text-coffee text-center md:text-left">
            Sobre Nosotros
          </h2>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-center md:text-left text-lg">
            {aboutData.description}
          </p>

          {isAdmin && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 text-sm text-coffee hover:underline"
            >
              <Pencil className="w-4 h-4" /> Editar sección
            </button>
          )}

          {editing && isAdmin && (
            <div className="w-full flex flex-col space-y-4">
              <textarea
                value={aboutData.description}
                onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                className="w-full p-4 border rounded-lg h-36 resize-none text-gray-800"
                placeholder="Descripción"
              />

              <GalleryImageSelector
                token={token}
                singleSelect={false}
                selectedImages={selectedImages}
                onImagesChange={(imgs) => {
                  setSelectedImages(imgs)
                  setAboutData({ ...aboutData, images: imgs })
                  setCurrentImage(0)
                  setFade(true)
                }}
                allowedTypes={['GENERAL', 'BACKGROUND']}
              />

              <div className="flex gap-3 pt-2 justify-center md:justify-start">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-coffee text-white px-5 py-2 rounded-lg hover:bg-coffee/90 disabled:opacity-50 flex items-center gap-2 shadow-lg transition"
                >
                  <Save className="w-5 h-5" /> {saving ? 'Guardando...' : 'Guardar'}
                </button>

                <button
                  onClick={() => {
                    setEditing(false)
                    fetchAbout()
                  }}
                  className="px-5 py-2 rounded-lg border hover:bg-gray-100 flex items-center gap-2 shadow transition"
                >
                  <X className="w-5 h-5" /> Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Carrusel de imágenes */}
        <div className="md:w-1/2 flex justify-center relative group">
          {selectedImages.length > 0 ? (
            <>
              <img
                src={selectedImages[currentImage]}
                alt={`Imagen ${currentImage + 1}`}
                className={`w-full max-w-md h-80 md:h-96 object-cover rounded-3xl shadow-2xl transition-opacity duration-500 ${
                  fade ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Botones de navegación */}
              {selectedImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-white/70 hover:bg-white px-3 py-2 rounded-full shadow-lg opacity-70 group-hover:opacity-100 transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-coffee" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-white/70 hover:bg-white px-3 py-2 rounded-full shadow-lg opacity-70 group-hover:opacity-100 transition"
                  >
                    <ChevronRight className="w-6 h-6 text-coffee" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full max-w-md h-80 md:h-96 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400 shadow-2xl">
              No hay imagen
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
