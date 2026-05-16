import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  BedDouble,
  Bath,
  Maximize2,
  Images,
  Upload,
  Link2,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { assetUrl } from "@/lib/assetUrl";
import {
  fetchAdminModels,
  createModel,
  updateModel,
  deleteModel,
  fetchModelImages,
  uploadModelFile,
  addModelImage,
  deleteModelImage,
  BuildingModel,
} from "@/store/slices/adminModelsSlice";

const TYPE_LABELS: Record<string, string> = {
  studio: "Estudio",
  "1bed": "1 Recámara",
  "2bed": "2 Recámaras",
  "3bed": "3 Recámaras",
  penthouse: "Penthouse",
  loft: "Loft",
};

interface ModelForm {
  name: string;
  type: string;
  area_sqm: string;
  terrace_m2: string;
  bedrooms: string;
  bathrooms: string;
  parking_spaces: string;
  storage_units: string;
  price_from: string;
  description: string;
  floor_plan_url: string;
  floor_min: string;
  floor_max: string;
  main_image_url: string;
  video_url: string;
  is_available: boolean;
  display_order: string;
}

const emptyForm: ModelForm = {
  name: "",
  type: "1bed",
  area_sqm: "",
  terrace_m2: "",
  bedrooms: "1",
  bathrooms: "1",
  parking_spaces: "0",
  storage_units: "1",
  price_from: "",
  description: "",
  floor_plan_url: "",
  floor_min: "",
  floor_max: "",
  main_image_url: "",
  video_url: "",
  is_available: true,
  display_order: "0",
};

export default function AdminModels() {
  const dispatch = useAppDispatch();
  const { models, loading, saving, imagesByModel, imagesLoading } =
    useAppSelector((s) => s.adminModels);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BuildingModel | null>(null);
  const [form, setForm] = useState<ModelForm>(emptyForm);

  // Image manager state
  const [imgModelId, setImgModelId] = useState<number | null>(null);
  const [imgUrlInput, setImgUrlInput] = useState("");
  const [imgUploading, setImgUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminModels());
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (m: BuildingModel) => {
    setEditTarget(m);
    setForm({
      name: m.name,
      type: m.type,
      area_sqm: String(m.area_sqm ?? ""),
      bedrooms: String(m.bedrooms),
      bathrooms: String(m.bathrooms),
      price_from: String(m.price_from ?? ""),
      description: m.description ?? "",
      floor_plan_url: m.floor_plan_url ?? "",
      terrace_m2: String(m.terrace_m2 ?? ""),
      parking_spaces: String(m.parking_spaces ?? 0),
      storage_units: String(m.storage_units ?? 1),
      floor_min: m.floor_min != null ? String(m.floor_min) : "",
      floor_max: m.floor_max != null ? String(m.floor_max) : "",
      main_image_url: m.main_image_url ?? "",
      video_url: m.video_url ?? "",
      is_available:
        m.is_available === 1 || (m.is_available as unknown as boolean),
      display_order: String(m.display_order ?? 0),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      area_sqm: form.area_sqm ? parseFloat(form.area_sqm) : null,
      terrace_m2: form.terrace_m2 ? parseFloat(form.terrace_m2) : null,
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseFloat(form.bathrooms),
      parking_spaces: parseInt(form.parking_spaces) || 0,
      storage_units: parseInt(form.storage_units) || 1,
      price_from: form.price_from ? parseFloat(form.price_from) : null,
      display_order: parseInt(form.display_order) || 0,
      floor_min: form.floor_min !== "" ? parseInt(form.floor_min) : null,
      floor_max: form.floor_max !== "" ? parseInt(form.floor_max) : null,
      is_available: form.is_available ? 1 : 0,
      main_image_url: form.main_image_url || null,
      video_url: form.video_url || null,
    };
    if (editTarget) {
      await dispatch(updateModel({ id: editTarget.id, ...payload }));
    } else {
      await dispatch(createModel(payload));
    }
    setModalOpen(false);
  };

  const openImageManager = (m: BuildingModel) => {
    setImgModelId(m.id);
    setImgUrlInput("");
    if (!imagesByModel[m.id]) {
      dispatch(fetchModelImages(m.id));
    }
  };

  const handleAddImageByUrl = async () => {
    if (!imgModelId || !imgUrlInput.trim()) return;
    await dispatch(
      addModelImage({ model_id: imgModelId, image_url: imgUrlInput.trim() }),
    );
    setImgUrlInput("");
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imgModelId) return;
    setImgUploading(true);
    const result = await dispatch(
      uploadModelFile({ modelId: imgModelId, file }),
    );
    if (uploadModelFile.fulfilled.match(result)) {
      await dispatch(
        addModelImage({ model_id: imgModelId, image_url: result.payload.url }),
      );
    }
    setImgUploading(false);
    e.target.value = "";
  };

  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // We need a model_id to upload — use editTarget if available, else temp upload
    const modelId = editTarget?.id ?? 0;
    const result = await dispatch(uploadModelFile({ modelId, file }));
    if (uploadModelFile.fulfilled.match(result)) {
      setForm((f) => ({ ...f, main_image_url: result.payload.url }));
    }
    e.target.value = "";
  };

  const handleDelete = (m: BuildingModel) => {
    if (
      confirm(
        `¿Eliminar el modelo "${m.name}"? Esta acción no se puede deshacer.`,
      )
    ) {
      dispatch(deleteModel(m.id));
    }
  };

  const toggleAvailable = (m: BuildingModel) => {
    dispatch(updateModel({ id: m.id, is_available: m.is_available ? 0 : 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-navy text-2xl">
            Modelos
          </h1>
          <p className="font-montserrat text-stone-gray text-sm mt-0.5">
            Tipologías y disponibilidad
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-navy text-white font-montserrat text-sm px-4 py-2 rounded-sm hover:bg-opacity-90"
        >
          <Plus className="w-4 h-4" /> Nuevo modelo
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-navy border-t-sand rounded-full animate-spin" />
        </div>
      )}

      {!loading && models.length === 0 && (
        <div className="bg-white rounded-sm border border-stone-warm/30 p-12 text-center">
          <Building2 className="w-10 h-10 text-stone-warm mx-auto mb-3" />
          <p className="font-montserrat text-stone-gray">
            No hay modelos. Crea el primero.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {models.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-sm border border-stone-warm/30 overflow-hidden group"
          >
            {/* Main image or floor plan thumbnail */}
            {m.main_image_url || m.floor_plan_url ? (
              <img
                src={assetUrl(m.main_image_url ?? m.floor_plan_url)}
                alt={m.name}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-stone-light flex items-center justify-center">
                <Building2 className="w-10 h-10 text-stone-warm" />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-montserrat font-semibold text-navy">
                    {m.name}
                  </p>
                  <p className="font-montserrat text-xs text-stone-gray">
                    {TYPE_LABELS[m.type] ?? m.type}
                  </p>
                </div>
                <button
                  onClick={() => toggleAvailable(m)}
                  className={`shrink-0 text-xs font-montserrat px-2 py-0.5 rounded-full border transition-colors ${
                    m.is_available
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      : "bg-red-50 text-red-500 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                  }`}
                >
                  {m.is_available ? "Disponible" : "No disponible"}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-3 text-stone-gray">
                {m.area_sqm && (
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="font-montserrat text-xs">
                      {m.area_sqm} m²
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5" />
                  <span className="font-montserrat text-xs">{m.bedrooms}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" />
                  <span className="font-montserrat text-xs">{m.bathrooms}</span>
                </div>
              </div>

              {m.price_from && (
                <p className="font-montserrat text-sm font-semibold text-sand mb-3">
                  Desde ${Number(m.price_from).toLocaleString("es-MX")}
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t border-stone-warm/20">
                <button
                  onClick={() => openEdit(m)}
                  className="flex-1 text-xs font-montserrat text-navy/60 hover:text-navy flex items-center justify-center gap-1 py-1.5 rounded-sm hover:bg-stone-light"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => openImageManager(m)}
                  className="flex-1 text-xs font-montserrat text-sand/80 hover:text-sand flex items-center justify-center gap-1 py-1.5 rounded-sm hover:bg-orange-50"
                >
                  <Images className="w-3 h-3" /> Fotos
                </button>
                <button
                  onClick={() => handleDelete(m)}
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
                  {editTarget ? "Editar modelo" : "Nuevo modelo"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-stone-gray hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="label-admin">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="input-admin"
                    placeholder="Ej. Suite A1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-admin">Tipo</label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className="input-admin"
                    >
                      {Object.entries(TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-admin">Interior (m²)</label>
                    <input
                      type="number"
                      value={form.area_sqm}
                      onChange={(e) =>
                        setForm({ ...form, area_sqm: e.target.value })
                      }
                      className="input-admin"
                      placeholder="49.5"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Terraza (m²)</label>
                    <input
                      type="number"
                      value={form.terrace_m2}
                      onChange={(e) =>
                        setForm({ ...form, terrace_m2: e.target.value })
                      }
                      className="input-admin"
                      placeholder="15.0"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Recámaras</label>
                    <input
                      type="number"
                      value={form.bedrooms}
                      onChange={(e) =>
                        setForm({ ...form, bedrooms: e.target.value })
                      }
                      min="0"
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Baños</label>
                    <input
                      type="number"
                      value={form.bathrooms}
                      onChange={(e) =>
                        setForm({ ...form, bathrooms: e.target.value })
                      }
                      min="0"
                      step="0.5"
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="label-admin">
                      Cajón (estacionamiento)
                    </label>
                    <input
                      type="number"
                      value={form.parking_spaces}
                      onChange={(e) =>
                        setForm({ ...form, parking_spaces: e.target.value })
                      }
                      min="0"
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Bodega</label>
                    <input
                      type="number"
                      value={form.storage_units}
                      onChange={(e) =>
                        setForm({ ...form, storage_units: e.target.value })
                      }
                      min="0"
                      className="input-admin"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-admin">Precio desde (MXN)</label>
                  <input
                    type="number"
                    value={form.price_from}
                    onChange={(e) =>
                      setForm({ ...form, price_from: e.target.value })
                    }
                    className="input-admin"
                    placeholder="3500000"
                  />
                </div>

                <div>
                  <label className="label-admin">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    className="input-admin resize-none"
                  />
                </div>

                <div>
                  <label className="label-admin">URL plano de planta</label>
                  <input
                    type="url"
                    value={form.floor_plan_url}
                    onChange={(e) =>
                      setForm({ ...form, floor_plan_url: e.target.value })
                    }
                    className="input-admin"
                    placeholder="https://…"
                  />
                </div>

                <div>
                  <label className="label-admin">Imagen principal</label>
                  {form.main_image_url && (
                    <div className="relative mb-2">
                      <img
                        src={assetUrl(form.main_image_url)}
                        alt="Imagen principal"
                        className="w-full h-32 object-cover rounded-sm border border-stone-warm/30"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, main_image_url: "" })}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={form.main_image_url}
                      onChange={(e) =>
                        setForm({ ...form, main_image_url: e.target.value })
                      }
                      className="input-admin flex-1"
                      placeholder="https://… o sube un archivo"
                    />
                    <label className="shrink-0 cursor-pointer flex items-center gap-1 px-3 py-2 border border-stone-warm rounded-sm text-xs font-montserrat text-navy/70 hover:bg-stone-light">
                      <Upload className="w-3.5 h-3.5" />
                      Subir
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleMainImageUpload}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label-admin">
                    URL de video (YouTube embed)
                  </label>
                  <input
                    type="url"
                    value={form.video_url}
                    onChange={(e) =>
                      setForm({ ...form, video_url: e.target.value })
                    }
                    className="input-admin"
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  />
                </div>

                {/* Floor range */}
                <div>
                  <label className="label-admin">
                    Plantas (rango de pisos)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={form.floor_min}
                        onChange={(e) =>
                          setForm({ ...form, floor_min: e.target.value })
                        }
                        min="0"
                        max="99"
                        className="input-admin"
                        placeholder="Planta desde (0=PB)"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={form.floor_max}
                        onChange={(e) =>
                          setForm({ ...form, floor_max: e.target.value })
                        }
                        min="0"
                        max="99"
                        className="input-admin"
                        placeholder="Planta hasta"
                      />
                    </div>
                  </div>
                  <p className="font-montserrat text-[10px] text-stone-gray/60 mt-1">
                    0 = Planta Baja. Deja vacío si no aplica.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-admin">Orden</label>
                    <input
                      type="number"
                      value={form.display_order}
                      onChange={(e) =>
                        setForm({ ...form, display_order: e.target.value })
                      }
                      min="0"
                      className="input-admin"
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_available}
                        onChange={(e) =>
                          setForm({ ...form, is_available: e.target.checked })
                        }
                        className="w-4 h-4 accent-navy"
                      />
                      <span className="font-montserrat text-sm text-navy">
                        Disponible
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 border border-stone-warm text-navy font-montserrat text-sm py-2 rounded-sm hover:bg-stone-light"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-navy text-white font-montserrat text-sm py-2 rounded-sm hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Manager Modal */}
      <AnimatePresence>
        {imgModelId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setImgModelId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-sm w-full max-w-lg max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-warm/20">
                <h3 className="font-montserrat font-semibold text-navy">
                  Galería de imágenes —{" "}
                  {models.find((m) => m.id === imgModelId)?.name}
                </h3>
                <button
                  onClick={() => setImgModelId(null)}
                  className="text-stone-gray hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Loading */}
                {imagesLoading === imgModelId && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-navy animate-spin" />
                  </div>
                )}

                {/* Images grid */}
                {imagesLoading !== imgModelId && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(imagesByModel[imgModelId] ?? []).map((img) => (
                      <div
                        key={img.id}
                        className="relative group rounded-sm overflow-hidden border border-stone-warm/30"
                      >
                        <img
                          src={assetUrl(img.image_url)}
                          alt={img.caption ?? ""}
                          className="w-full aspect-[4/3] object-cover"
                        />
                        <button
                          onClick={() =>
                            dispatch(
                              deleteModelImage({
                                id: img.id,
                                modelId: imgModelId,
                              }),
                            )
                          }
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {img.caption && (
                          <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                            {img.caption}
                          </p>
                        )}
                      </div>
                    ))}

                    {(imagesByModel[imgModelId] ?? []).length === 0 &&
                      imagesLoading !== imgModelId && (
                        <div className="col-span-3 text-center py-8 text-stone-gray font-montserrat text-sm">
                          No hay imágenes aún
                        </div>
                      )}
                  </div>
                )}

                {/* Add image — URL */}
                <div className="pt-2 border-t border-stone-warm/20">
                  <p className="label-admin mb-2">Agregar por URL</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imgUrlInput}
                      onChange={(e) => setImgUrlInput(e.target.value)}
                      className="input-admin flex-1"
                      placeholder="https://…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageByUrl();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddImageByUrl}
                      disabled={!imgUrlInput.trim()}
                      className="flex items-center gap-1 px-3 py-2 bg-navy text-white text-xs font-montserrat rounded-sm hover:bg-opacity-90 disabled:opacity-40"
                    >
                      <Link2 className="w-3.5 h-3.5" /> Agregar
                    </button>
                  </div>
                </div>

                {/* Add image — file upload */}
                <div>
                  <p className="label-admin mb-2">Subir archivo</p>
                  <label
                    className={`flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-stone-warm/40 rounded-sm cursor-pointer hover:border-sand/60 hover:bg-orange-50/30 transition-colors ${imgUploading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {imgUploading ? (
                      <Loader2 className="w-5 h-5 text-sand animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-stone-gray" />
                    )}
                    <span className="font-montserrat text-sm text-stone-gray">
                      {imgUploading
                        ? "Subiendo…"
                        : "Haz clic o arrastra una imagen (JPG/PNG/WebP, máx. 5 MB)"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleUploadFile}
                      disabled={imgUploading}
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .label-admin { display:block; font-family:var(--font-montserrat,sans-serif); font-size:11px; font-weight:500; color:#2E3447; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px; }
        .input-admin { width:100%; border:1px solid #D9D6D1; border-radius:2px; padding:8px 12px; font-family:var(--font-montserrat,sans-serif); font-size:13px; color:#2E3447; background:#fff; outline:none; transition:border-color 0.15s; }
        .input-admin:focus { border-color:#2E3447; }
      `}</style>
    </div>
  );
}
