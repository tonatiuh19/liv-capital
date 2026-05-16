import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Sparkles,
  Upload,
  Link2,
  Loader2,
  ImageOff,
  Images,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  uploadAmenityImage,
  Amenity,
} from "@/store/slices/adminAmenitiesSlice";

const CATEGORY_LABELS: Record<string, string> = {
  wellness: "Wellness",
  social: "Social",
  security: "Seguridad",
  services: "Servicios",
};

interface AmenityForm {
  name: string;
  description: string;
  icon: string;
  image_url: string;
  category: string;
  type: "amenity" | "facility";
  show_in_gallery: boolean;
  is_active: boolean;
  display_order: string;
}

const emptyForm: AmenityForm = {
  name: "",
  description: "",
  icon: "",
  image_url: "",
  category: "social",
  type: "amenity",
  show_in_gallery: false,
  is_active: true,
  display_order: "0",
};

export default function AdminAmenities() {
  const dispatch = useAppDispatch();
  const { amenities, loading, saving, uploading } = useAppSelector(
    (s) => s.adminAmenities,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Amenity | null>(null);
  const [form, setForm] = useState<AmenityForm>(emptyForm);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchAdminAmenities());
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setUrlInput("");
    setModalOpen(true);
  };

  const openEdit = (a: Amenity) => {
    setEditTarget(a);
    setForm({
      name: a.name,
      description: a.description ?? "",
      icon: a.icon ?? "",
      image_url: a.image_url ?? "",
      category: a.category ?? "social",
      type: (a.type === "facility" ? "facility" : "amenity") as
        | "amenity"
        | "facility",
      show_in_gallery: !!a.show_in_gallery,
      is_active: a.is_active === 1 || (a.is_active as unknown as boolean),
      display_order: String(a.display_order ?? 0),
    });
    setUrlInput(a.image_url ?? "");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      is_active: form.is_active ? 1 : 0,
      show_in_gallery: form.show_in_gallery ? 1 : 0,
      display_order: parseInt(form.display_order) || 0,
      image_url: form.image_url || null,
      description: form.description || null,
      icon: form.icon || null,
      category: form.category || null,
      type: form.type,
    };
    if (editTarget) {
      await dispatch(updateAmenity({ id: editTarget.id, ...payload }));
    } else {
      await dispatch(createAmenity(payload));
    }
    setModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await dispatch(uploadAmenityImage(file));
    if (uploadAmenityImage.fulfilled.match(result)) {
      setForm((f) => ({ ...f, image_url: result.payload }));
      setUrlInput(result.payload);
    }
    e.target.value = "";
  };

  const applyUrlInput = () => {
    if (urlInput.trim()) {
      setForm((f) => ({ ...f, image_url: urlInput.trim() }));
    }
  };

  const handleDelete = (a: Amenity) => {
    if (
      confirm(
        `¿Eliminar la amenidad "${a.name}"? Esta acción no se puede deshacer.`,
      )
    ) {
      dispatch(deleteAmenity(a.id));
    }
  };

  const toggleActive = (a: Amenity) => {
    dispatch(updateAmenity({ id: a.id, is_active: a.is_active ? 0 : 1 }));
  };

  const toggleGallery = (a: Amenity) => {
    dispatch(
      updateAmenity({ id: a.id, show_in_gallery: a.show_in_gallery ? 0 : 1 }),
    );
  };

  const galleryPhotos = amenities.filter(
    (a) => a.show_in_gallery && a.image_url,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-navy text-2xl">
            Amenidades
          </h1>
          <p className="font-montserrat text-stone-gray text-sm mt-0.5">
            Gestión de amenidades e imágenes
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-navy text-white font-montserrat text-sm px-4 py-2 rounded-sm hover:bg-opacity-90"
        >
          <Plus className="w-4 h-4" /> Nueva amenidad
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-navy border-t-sand rounded-full animate-spin" />
        </div>
      )}

      {/* ── Gallery preview panel ── */}
      {!loading && (
        <div className="bg-white border border-stone-warm/30 rounded-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Images className="w-4 h-4 text-sand" />
            <h2 className="font-montserrat font-semibold text-navy text-sm">
              Galería pública
            </h2>
            <span className="font-montserrat text-xs text-stone-gray ml-auto">
              {galleryPhotos.length}/4 fotos activas — usa el botón{" "}
              <span className="font-semibold">📷 Galería</span> en cada amenidad
            </span>
          </div>
          {galleryPhotos.length === 0 ? (
            <p className="font-montserrat text-xs text-stone-gray/60 italic">
              Ninguna amenidad está marcada para galería. Sube una imagen y
              activa el botón Galería.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {galleryPhotos.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="relative rounded-sm overflow-hidden aspect-[4/3]"
                >
                  <img
                    src={a.image_url!}
                    alt={a.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/70 to-transparent px-2 py-1.5">
                    <p className="font-montserrat text-[10px] font-semibold text-white truncate">
                      {a.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && amenities.length === 0 && (
        <div className="bg-white rounded-sm border border-stone-warm/30 p-12 text-center">
          <Sparkles className="w-10 h-10 text-stone-warm mx-auto mb-3" />
          <p className="font-montserrat text-stone-gray">
            No hay amenidades. Crea la primera.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {amenities.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-sm border border-stone-warm/30 overflow-hidden"
          >
            {/* Image */}
            {a.image_url ? (
              <img
                src={a.image_url}
                alt={a.name}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-stone-light flex items-center justify-center">
                <ImageOff className="w-8 h-8 text-stone-warm" />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="font-montserrat font-semibold text-navy">
                    {a.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] font-montserrat font-semibold px-1.5 py-0.5 rounded-full ${
                        a.type === "facility"
                          ? "bg-sand/15 text-sand"
                          : "bg-navy/10 text-navy"
                      }`}
                    >
                      {a.type === "facility" ? "Facilidad" : "Amenidad"}
                    </span>
                    {a.category && (
                      <p className="font-montserrat text-xs text-stone-gray">
                        {CATEGORY_LABELS[a.category] ?? a.category}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(a)}
                  className={`shrink-0 text-xs font-montserrat px-2 py-0.5 rounded-full border transition-colors ${
                    a.is_active
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      : "bg-red-50 text-red-500 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                  }`}
                >
                  {a.is_active ? "Activa" : "Inactiva"}
                </button>
              </div>

              {a.description && (
                <p className="font-montserrat text-xs text-stone-gray line-clamp-2 mb-2">
                  {a.description}
                </p>
              )}

              {a.icon && (
                <p className="font-montserrat text-xs text-stone-gray/60 mb-2">
                  Ícono: <span className="font-mono">{a.icon}</span>
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t border-stone-warm/20">
                {a.type === "amenity" && (
                  <button
                    onClick={() => toggleGallery(a)}
                    title={
                      a.show_in_gallery
                        ? "Quitar de galería"
                        : "Añadir a galería"
                    }
                    className={`text-xs font-montserrat flex items-center justify-center gap-1 py-1.5 px-2 rounded-sm transition-colors ${
                      a.show_in_gallery
                        ? "text-sand bg-sand/10 hover:bg-sand/20"
                        : "text-stone-gray hover:text-sand hover:bg-stone-light"
                    }`}
                  >
                    📷
                    {a.show_in_gallery ? "Galería" : "Galería"}
                  </button>
                )}
                <button
                  onClick={() => openEdit(a)}
                  className="flex-1 text-xs font-montserrat text-navy/60 hover:text-navy flex items-center justify-center gap-1 py-1.5 rounded-sm hover:bg-stone-light"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  className="flex-1 text-xs font-montserrat text-red-400 hover:text-red-600 flex items-center justify-center gap-1 py-1.5 rounded-sm hover:bg-red-50"
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
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-warm/20">
                <h3 className="font-montserrat font-semibold text-navy">
                  {editTarget ? "Editar amenidad" : "Nueva amenidad"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-stone-gray hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="label-admin">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="input-admin"
                    placeholder="Ej. Alberca Infinity"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="label-admin">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="input-admin resize-none"
                    rows={2}
                    placeholder="Breve descripción de la amenidad"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="label-admin">Tipo *</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as "amenity" | "facility",
                        show_in_gallery:
                          e.target.value === "facility"
                            ? false
                            : form.show_in_gallery,
                      })
                    }
                    className="input-admin"
                  >
                    <option value="amenity">Amenidad (espacio / área)</option>
                    <option value="facility">Facilidad del edificio</option>
                  </select>
                </div>

                {/* Show in gallery — only for amenity type */}
                {form.type === "amenity" && (
                  <div className="flex items-center gap-2 p-3 bg-stone-light rounded-sm border border-stone-warm/20">
                    <input
                      id="show_in_gallery"
                      type="checkbox"
                      checked={form.show_in_gallery}
                      onChange={(e) =>
                        setForm({ ...form, show_in_gallery: e.target.checked })
                      }
                      className="w-4 h-4 accent-sand"
                    />
                    <label
                      htmlFor="show_in_gallery"
                      className="font-montserrat text-sm text-navy cursor-pointer select-none"
                    >
                      📷 Mostrar foto en la galería pública
                    </label>
                  </div>
                )}

                {/* Category + Icon */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-admin">Categoría</label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="input-admin"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-admin">Ícono Lucide</label>
                    <input
                      type="text"
                      value={form.icon}
                      onChange={(e) =>
                        setForm({ ...form, icon: e.target.value })
                      }
                      className="input-admin font-mono"
                      placeholder="waves"
                    />
                  </div>
                </div>

                {/* Image upload */}
                <div>
                  <label className="label-admin">Imagen</label>

                  {/* Preview */}
                  {form.image_url && (
                    <div className="relative mb-3 group">
                      <img
                        src={form.image_url}
                        alt="Vista previa"
                        className="w-full h-36 object-cover rounded-sm border border-stone-warm/30"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, image_url: "" }));
                          setUrlInput("");
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Upload file */}
                  <div className="flex gap-2 mb-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 text-sm font-montserrat px-3 py-2 border border-stone-warm/40 rounded-sm text-stone-gray hover:text-navy hover:border-navy/30 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? "Subiendo..." : "Subir archivo"}
                    </button>
                  </div>

                  {/* URL input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="input-admin flex-1"
                      placeholder="https://... o /uploads/amenities/..."
                    />
                    <button
                      type="button"
                      onClick={applyUrlInput}
                      className="flex items-center gap-1 px-3 py-2 border border-stone-warm/40 rounded-sm text-stone-gray hover:text-navy hover:border-navy/30 transition-colors text-sm font-montserrat"
                    >
                      <Link2 className="w-4 h-4" />
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* Order + Active */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-admin">Orden</label>
                    <input
                      type="number"
                      value={form.display_order}
                      onChange={(e) =>
                        setForm({ ...form, display_order: e.target.value })
                      }
                      className="input-admin"
                      min={0}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) =>
                          setForm({ ...form, is_active: e.target.checked })
                        }
                        className="w-4 h-4 accent-navy"
                      />
                      <span className="font-montserrat text-sm text-navy">
                        Activa
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 font-montserrat text-sm py-2.5 border border-stone-warm/40 rounded-sm text-stone-gray hover:text-navy"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="flex-1 font-montserrat text-sm py-2.5 bg-navy text-white rounded-sm hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {editTarget ? "Guardar cambios" : "Crear amenidad"}
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
