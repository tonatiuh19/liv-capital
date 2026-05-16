import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  MapPin,
  Save,
  ShoppingBag,
  Bike,
  GraduationCap,
  HeartPulse,
  Trees,
  Star,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminPOIs,
  createPOI,
  updatePOI,
  deletePOI,
  updateProjectCenter,
  type AdminPOI,
  type POICategory,
} from "@/store/slices/adminPOISlice";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: {
  value: POICategory;
  label: string;
  Icon: React.ElementType;
}[] = [
  {
    value: "mercados",
    label: "Mercados y Centros Comerciales",
    Icon: ShoppingBag,
  },
  { value: "transporte", label: "Transporte No Motorizado", Icon: Bike },
  {
    value: "universidades",
    label: "Centros Universitarios",
    Icon: GraduationCap,
  },
  { value: "hospitales", label: "Hospitales", Icon: HeartPulse },
  { value: "parques", label: "Parques", Icon: Trees },
  { value: "otros", label: "Otros Puntos Importantes", Icon: Star },
];

const CATEGORY_COLORS: Record<POICategory, string> = {
  mercados: "#f5a623",
  transporte: "#4caf50",
  universidades: "#2196f3",
  hospitales: "#e53935",
  parques: "#43a047",
  otros: "#9c27b0",
};

function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

// ─── Form interface ───────────────────────────────────────────────────────────
interface POIForm {
  category: POICategory;
  name: string;
  distance_meters: string;
  description: string;
  lat: string;
  lng: string;
  display_order: string;
  is_active: boolean;
}

const emptyForm: POIForm = {
  category: "mercados",
  name: "",
  distance_meters: "",
  description: "",
  lat: "",
  lng: "",
  display_order: "0",
  is_active: true,
};

function poiToForm(poi: AdminPOI): POIForm {
  return {
    category: poi.category,
    name: poi.name,
    distance_meters: String(poi.distance_meters),
    description: poi.description ?? "",
    lat: poi.lat !== null ? String(poi.lat) : "",
    lng: poi.lng !== null ? String(poi.lng) : "",
    display_order: String(poi.display_order),
    is_active: poi.is_active,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPOI() {
  const dispatch = useAppDispatch();
  const { pois, center, loading, saving } = useAppSelector((s) => s.adminPOI);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminPOI | null>(null);
  const [form, setForm] = useState<POIForm>(emptyForm);

  // Center edit state
  const [centerLat, setCenterLat] = useState("");
  const [centerLng, setCenterLng] = useState("");
  const [centerSaving, setCenterSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminPOIs());
  }, [dispatch]);

  useEffect(() => {
    setCenterLat(String(center.lat));
    setCenterLng(String(center.lng));
  }, [center]);

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (poi: AdminPOI) => {
    setEditTarget(poi);
    setForm(poiToForm(poi));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      category: form.category,
      name: form.name,
      distance_meters: parseInt(form.distance_meters) || 0,
      description: form.description || null,
      lat: form.lat !== "" ? parseFloat(form.lat) : null,
      lng: form.lng !== "" ? parseFloat(form.lng) : null,
      display_order: parseInt(form.display_order) || 0,
      is_active: form.is_active,
    };
    if (editTarget) {
      await dispatch(updatePOI({ id: editTarget.id, ...payload }));
    } else {
      await dispatch(createPOI(payload));
    }
    setModalOpen(false);
  };

  const handleDelete = (poi: AdminPOI) => {
    if (confirm(`¿Eliminar "${poi.name}"? Esta acción no se puede deshacer.`)) {
      dispatch(deletePOI(poi.id));
    }
  };

  const toggleActive = (poi: AdminPOI) => {
    dispatch(updatePOI({ id: poi.id, is_active: !poi.is_active }));
  };

  const handleCenterSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setCenterSaving(true);
    await dispatch(
      updateProjectCenter({
        lat: parseFloat(centerLat),
        lng: parseFloat(centerLng),
      }),
    );
    setCenterSaving(false);
  };

  // Group by category for display
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: pois.filter((p) => p.category === cat.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-montserrat font-bold text-navy text-2xl">
            Puntos de Interés
          </h1>
          <p className="font-montserrat text-stone-gray text-sm mt-0.5">
            Gestión del mapa y ubicaciones del proyecto
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-navy text-white font-montserrat text-sm px-4 py-2 rounded-sm hover:bg-opacity-90"
        >
          <Plus className="w-4 h-4" /> Nuevo punto
        </button>
      </div>

      {/* Project centre card */}
      <div className="bg-white rounded-sm border border-stone-warm/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-sm bg-navy flex items-center justify-center shrink-0">
            <img
              src="/images/logo_liv_white.png"
              alt="LIV"
              className="h-4 w-auto"
            />
          </div>
          <div>
            <h2 className="font-montserrat font-semibold text-navy">
              Ubicación del Proyecto (LIV Capital)
            </h2>
            <p className="font-montserrat text-xs text-stone-gray">
              Coordenadas del marcador central en el mapa
            </p>
          </div>
        </div>
        <form
          onSubmit={handleCenterSave}
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="label-admin">Latitud</label>
            <input
              type="number"
              step="0.0000001"
              value={centerLat}
              onChange={(e) => setCenterLat(e.target.value)}
              required
              className="input-admin w-44"
              placeholder="20.6900000"
            />
          </div>
          <div>
            <label className="label-admin">Longitud</label>
            <input
              type="number"
              step="0.0000001"
              value={centerLng}
              onChange={(e) => setCenterLng(e.target.value)}
              required
              className="input-admin w-44"
              placeholder="-103.3490000"
            />
          </div>
          <button
            type="submit"
            disabled={centerSaving || saving}
            className="flex items-center gap-2 bg-sand text-navy font-montserrat text-sm font-semibold px-4 py-2 rounded-sm hover:bg-sand/90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {centerSaving ? "Guardando…" : "Guardar"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-navy border-t-sand rounded-full animate-spin" />
        </div>
      )}

      {!loading && pois.length === 0 && (
        <div className="bg-white rounded-sm border border-stone-warm/30 p-12 text-center">
          <MapPin className="w-10 h-10 text-stone-warm mx-auto mb-3" />
          <p className="font-montserrat text-stone-gray">
            No hay puntos de interés.
          </p>
        </div>
      )}

      {/* POI list by category */}
      {grouped.map(({ value: cat, label, Icon, items }) => (
        <div
          key={cat}
          className="bg-white rounded-sm border border-stone-warm/30 overflow-hidden"
        >
          {/* Category header */}
          <div
            className="flex items-center gap-2 px-5 py-3 border-l-4"
            style={{ borderColor: CATEGORY_COLORS[cat] }}
          >
            <Icon
              className="w-4 h-4 shrink-0"
              style={{ color: CATEGORY_COLORS[cat] }}
            />
            <span className="font-montserrat text-sm font-semibold text-navy/70 uppercase tracking-wider">
              {label}
            </span>
            <span className="ml-auto font-montserrat text-xs text-stone-gray">
              {items.length} {items.length === 1 ? "punto" : "puntos"}
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-stone-warm/10">
            {items.map((poi) => (
              <motion.div
                key={poi.id}
                layout
                className="flex items-center gap-4 px-5 py-3 hover:bg-stone-light/40 transition-colors"
              >
                {/* Number badge */}
                <div
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold font-montserrat"
                  style={{ background: CATEGORY_COLORS[cat] }}
                >
                  {poi.display_order}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat text-sm font-medium text-navy truncate">
                    {poi.name}
                  </p>
                  <p className="font-montserrat text-xs text-stone-gray">
                    {formatDistance(poi.distance_meters)}
                    {poi.lat !== null && poi.lng !== null
                      ? ` · ${poi.lat.toFixed(4)}, ${poi.lng.toFixed(4)}`
                      : " · Sin coordenadas"}
                  </p>
                </div>

                {/* Active badge */}
                <button
                  onClick={() => toggleActive(poi)}
                  className={`shrink-0 text-xs font-montserrat px-2 py-0.5 rounded-full border transition-colors ${
                    poi.is_active
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      : "bg-red-50 text-red-500 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                  }`}
                >
                  {poi.is_active ? "Activo" : "Inactivo"}
                </button>

                {/* Actions */}
                <button
                  onClick={() => openEdit(poi)}
                  className="p-1.5 rounded-sm text-stone-gray hover:text-navy hover:bg-stone-light transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(poi)}
                  className="p-1.5 rounded-sm text-stone-gray hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Modal ── */}
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
                  {editTarget
                    ? "Editar punto de interés"
                    : "Nuevo punto de interés"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-stone-gray hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Category */}
                <div>
                  <label className="label-admin">Categoría *</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as POICategory,
                      })
                    }
                    className="input-admin"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="label-admin">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="input-admin"
                    placeholder="Ej. Hospital Civil de Guadalajara"
                  />
                </div>

                {/* Distance */}
                <div>
                  <label className="label-admin">Distancia (metros) *</label>
                  <input
                    type="number"
                    value={form.distance_meters}
                    onChange={(e) =>
                      setForm({ ...form, distance_meters: e.target.value })
                    }
                    required
                    min="1"
                    className="input-admin"
                    placeholder="400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="label-admin">Descripción</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="input-admin"
                    placeholder="Opcional"
                  />
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-admin">Latitud</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={form.lat}
                      onChange={(e) =>
                        setForm({ ...form, lat: e.target.value })
                      }
                      className="input-admin"
                      placeholder="20.6857000"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Longitud</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={form.lng}
                      onChange={(e) =>
                        setForm({ ...form, lng: e.target.value })
                      }
                      className="input-admin"
                      placeholder="-103.3423000"
                    />
                  </div>
                </div>

                {/* Order + Active */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-admin">
                      Orden (número en mapa)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.display_order}
                      onChange={(e) =>
                        setForm({ ...form, display_order: e.target.value })
                      }
                      className="input-admin"
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) =>
                          setForm({ ...form, is_active: e.target.checked })
                        }
                        className="w-4 h-4 accent-navy"
                      />
                      <span className="font-montserrat text-sm text-navy">
                        Visible en mapa
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
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

      <style>{`
        .label-admin { display:block; font-family:'Montserrat',sans-serif; font-size:0.7rem; font-weight:600; color:#6b6b6b; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.25rem; }
        .input-admin { width:100%; padding:0.45rem 0.6rem; border:1px solid #D9D6D1; border-radius:2px; font-family:'Montserrat',sans-serif; font-size:0.85rem; color:#2E3447; background:#fff; outline:none; }
        .input-admin:focus { border-color:#2E3447; }
      `}</style>
    </div>
  );
}
