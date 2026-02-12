import React, { useState, useEffect } from 'react';
import { Upload, Trash2, X, Pencil, Save } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAlert } from '../context/AlertContext';

export default function GalleryManagementModal({ onClose }) {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
  const { token } = useUser();
  const { confirmDelete, successToast, errorAlert } = useAlert();

  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    image_type: 'GENERAL',
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    image_type: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) fetchGalleryImages();
  }, [token]);

  const fetchGalleryImages = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gallery`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error ${res.status}`);
      }

      const data = await res.json();
      setGalleryImages(data.data || []);
    } catch (err) {
      console.error('Error al cargar galería:', err);
      errorAlert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      errorAlert('Solo se permiten imágenes (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      errorAlert('La imagen es demasiado grande. Máximo 10MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      errorAlert('Selecciona una imagen primero');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('image_type', uploadForm.image_type);
    formData.append('is_active', 'true');

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/gallery/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Error al subir imagen');
      }

      successToast('Imagen subida exitosamente');
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadForm({ title: '', description: '', image_type: 'GENERAL' });
      fetchGalleryImages();
    } catch (err) {
      console.error(err);
      errorAlert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    const confirmed = await confirmDelete('esta imagen');
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/gallery/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al eliminar imagen');

      successToast('Imagen eliminada correctamente');
      fetchGalleryImages();
    } catch (err) {
      console.error(err);
      errorAlert('No se pudo eliminar la imagen');
    }
  };

  const startEdit = (image) => {
    setEditingId(image.id);
    setEditForm({
      title: image.title || '',
      description: image.description || '',
      image_type: image.image_type || 'GENERAL',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', image_type: '' });
  };

  const saveEdit = async (imageId) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/gallery/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          image_type: editForm.image_type,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al actualizar imagen');
      }

      successToast('Imagen actualizada');
      setEditingId(null);
      fetchGalleryImages();
    } catch (err) {
      console.error(err);
      errorAlert(err.message);
    } finally {
      setSaving(false);
    }
  };

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

                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Título"
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Descripción"
                  className="w-full p-2 border rounded-lg h-20"
                />
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
                    {editingId === image.id ? (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <img src={image.url} alt={image.title} className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full p-2 border rounded text-sm"
                              placeholder="Título"
                            />
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full p-2 border rounded text-sm h-16"
                              placeholder="Descripción"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={editForm.image_type}
                            onChange={(e) => setEditForm({ ...editForm, image_type: e.target.value })}
                            className="flex-1 p-2 border rounded text-sm"
                          >
                            <option value="GENERAL">General</option>
                            <option value="PRODUCT">Producto</option>
                            <option value="CAROUSEL">Carrusel</option>
                            <option value="BACKGROUND">Fondo</option>
                          </select>
                          <button
                            onClick={() => saveEdit(image.id)}
                            disabled={saving}
                            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" /> {saving ? '...' : 'Guardar'}
                          </button>
                          <button onClick={cancelEdit} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <img src={image.url} alt={image.title} className="w-24 h-24 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{image.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">{image.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-coffee/10 text-coffee px-2 py-1 rounded">{image.image_type}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => startEdit(image)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(image.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
