import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Loader2,
  ImageOff,
  Images,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminGallery,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  uploadGalleryFile,
  AdminGalleryImage,
} from "@/store/slices/adminGallerySlice";
import { assetUrl } from "@/lib/assetUrl";

interface GalleryForm {
  title: string;
  description: string;
  image_url: string;
  display_order: string;
  is_active: boolean;
}

const emptyForm: GalleryForm = {
  title: "",
  description: "",
  image_url: "",
  display_order: "0",
  is_active: true,
};

export default function AdminGallery() {
  const dispatch = useAppDispatch();
  const { images, loading, saving } = useAppSelector((s) => s.adminGallery);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminGalleryImage | null>(null);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState("");

  useEffect(() => {
    dispatch(fetchAdminGallery());
  }, []);

  const clearPending = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setPendingFile(null);
    setLocalPreview("");
  };

  const closeModal = () => {
    clearPending();
    setModalOpen(false);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    clearPending();
    setModalOpen(true);
  };

  const openEdit = (img: AdminGalleryImage) => {
    setEditTarget(img);
    setForm({
      title: img.title,
      description: img.description ?? "",
      image_url: img.image_url,
      display_order: String(img.display_order ?? 0),
      is_active: img.is_active === 1,
    });
    clearPending();
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = form.image_url;
    if (pendingFile) {
      const result = await dispatch(uploadGalleryFile(pendingFile));
      if (uploadGalleryFile.fulfilled.match(result)) {
        imageUrl = result.payload;
        clearPending();
      } else {
        return; // upload failed — don’t save
      }
    }
    const payload = {
      ...form,
      image_url: imageUrl,
      is_active: form.is_active ? 1 : 0,
      display_order: parseInt(form.display_order) || 0,
      description: form.description || null,
    };
    if (editTarget) {
      await dispatch(updateGalleryImage({ id: editTarget.id, ...payload }));
    } else {
      await dispatch(createGalleryImage(payload));
    }
    closeModal();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localPreview) URL.revokeObjectURL(localPreview);
    setPendingFile(file);
    setLocalPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleDelete = (img: AdminGalleryImage) => {
    if (
      confirm(`¿Eliminar "${img.title}"? Esta acción no se puede deshacer.`)
    ) {
      dispatch(deleteGalleryImage(img.id));
    }
  };

  const toggleActive = (img: AdminGalleryImage) => {
    dispatch(
      updateGalleryImage({ id: img.id, is_active: img.is_active ? 0 : 1 }),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-navy text-2xl">
            Galería
          </h1>
          <p className="font-montserrat text-stone-gray text-sm mt-0.5">
            Gestión de imágenes de la galería pública
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-navy text-white font-montserrat text-sm px-4 py-2 rounded-sm hover:bg-opacity-90"
        >
          <Plus className="w-4 h-4" /> Nueva imagen
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-navy border-t-sand rounded-full animate-spin" />
        </div>
      )}

      {!loading && images.length === 0 && (
        <div className="bg-white rounded-sm border border-stone-warm/30 p-12 text-center">
          <Images className="w-10 h-10 text-stone-warm mx-auto mb-3" />
          <p className="font-montserrat text-stone-gray">
            No hay imágenes. Agrega la primera.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-sm border border-stone-warm/30 overflow-hidden"
          >
            {/* Thumbnail */}
            {img.image_url ? (
              <img
                src={assetUrl(img.image_url)}
                alt={img.title}
                className="w-full h-44 object-cover"
              />
            ) : (
              <div className="w-full h-44 bg-stone-light flex items-center justify-center">
                <ImageOff className="w-8 h-8 text-stone-warm" />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="font-montserrat font-semibold text-navy truncate">
                    {img.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-montserrat text-xs text-stone-gray">
                      Orden: {img.display_order}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(img)}
                  className={`shrink-0 text-xs font-montserrat px-2 py-0.5 rounded-full border transition-colors ${
                    img.is_active
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      : "bg-red-50 text-red-500 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                  }`}
                >
                  {img.is_active ? "Activa" : "Inactiva"}
                </button>
              </div>

              {img.description && (
                <p className="font-montserrat text-xs text-stone-gray line-clamp-2 mb-2">
                  {img.description}
                </p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEdit(img)}
                  className="flex items-center gap-1.5 text-navy border border-navy/30 font-montserrat text-xs px-3 py-1.5 rounded-sm hover:bg-navy/5 transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(img)}
                  className="flex items-center gap-1.5 text-red-500 border border-red-200 font-montserrat text-xs px-3 py-1.5 rounded-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-warm/30">
                <h2 className="font-montserrat font-semibold text-navy">
                  {editTarget ? "Editar imagen" : "Nueva imagen"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-stone-gray hover:text-navy transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block font-montserrat text-xs font-semibold text-navy mb-1">
                    Título *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full border border-stone-warm/50 rounded-sm px-3 py-2 font-montserrat text-sm text-navy focus:outline-none focus:border-navy"
                    placeholder="Ej. Fachada principal"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-montserrat text-xs font-semibold text-navy mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="w-full border border-stone-warm/50 rounded-sm px-3 py-2 font-montserrat text-sm text-navy focus:outline-none focus:border-navy resize-none"
                    placeholder="Descripción breve (opcional)"
                  />
                </div>

                {/* Display order */}
                <div>
                  <label className="block font-montserrat text-xs font-semibold text-navy mb-1">
                    Orden de visualización
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.display_order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, display_order: e.target.value }))
                    }
                    className="w-full border border-stone-warm/50 rounded-sm px-3 py-2 font-montserrat text-sm text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                {/* Image upload / URL */}
                <div>
                  <label className="block font-montserrat text-xs font-semibold text-navy mb-1">
                    Imagen *
                  </label>

                  {/* Preview */}
                  {(localPreview || form.image_url) && (
                    <div className="mb-2 rounded-sm overflow-hidden border border-stone-warm/30 h-36 relative group">
                      <img
                        src={localPreview || assetUrl(form.image_url)}
                        alt="preview"
                        className="w-full h-full object-contain bg-stone-light"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          clearPending();
                          setForm((f) => ({ ...f, image_url: "" }));
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Upload */}
                  <label className="flex items-center gap-2 w-full justify-center border-2 border-dashed border-stone-warm/50 hover:border-navy/40 rounded-sm py-3 font-montserrat text-sm text-stone-gray hover:text-navy transition-colors mb-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {pendingFile ? pendingFile.name : "Subir imagen"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>

                  {/* URL input */}
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image_url: e.target.value }))
                    }
                    className="w-full border border-stone-warm/50 rounded-sm px-3 py-2 font-montserrat text-xs text-navy focus:outline-none focus:border-navy"
                    placeholder="O pega una URL externa"
                  />
                </div>

                {/* is_active */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_active: e.target.checked }))
                    }
                    className="w-4 h-4 accent-navy"
                  />
                  <span className="font-montserrat text-sm text-navy">
                    Visible en la galería pública
                  </span>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 border border-stone-warm/50 font-montserrat text-sm text-navy py-2 rounded-sm hover:bg-stone-light transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || (!pendingFile && !form.image_url)}
                    className="flex-1 bg-navy text-white font-montserrat text-sm py-2 rounded-sm hover:bg-opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editTarget ? "Guardar cambios" : "Crear imagen"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
