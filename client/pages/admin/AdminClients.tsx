import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  RefreshCw,
  Download,
  User,
  Calendar,
  MessageSquare,
  ChevronRight,
  Save,
  Phone,
  Mail,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminClients,
  fetchClientDetail,
  updateClient,
  clearDetail,
  Client,
} from "@/store/slices/adminClientsSlice";

const TAGS = [
  {
    value: "hot_lead",
    label: "Hot Lead",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "cold_lead",
    label: "Cold Lead",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "investor",
    label: "Inversor",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    value: "vip",
    label: "VIP",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "needs_followup",
    label: "Seguimiento",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "no_contact",
    label: "No contactar",
    color: "bg-gray-100 text-gray-500 border-gray-200",
  },
];

const INTERESTS: Record<string, string> = {
  studio: "Estudio",
  "1bed": "1 Rec.",
  "2bed": "2 Rec.",
  "3bed": "3 Rec.",
  penthouse: "Penthouse",
  investment: "Inversión",
  general: "General",
  other: "Otro",
};

const VISIT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  rescheduled: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-navy/10 text-navy",
  no_show: "bg-gray-100 text-gray-500",
};

const VISIT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  rescheduled: "Reprogramada",
  cancelled: "Cancelada",
  completed: "Completada",
  no_show: "No asistió",
};

function TagBadge({ tag }: { tag: string }) {
  const t = TAGS.find((t) => t.value === tag);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${t?.color ?? "bg-gray-100 text-gray-500 border-gray-200"}`}
    >
      {t?.label ?? tag}
    </span>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(date).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminClients() {
  const dispatch = useAppDispatch();
  const {
    clients,
    total,
    page,
    totalPages,
    loading,
    detail,
    detailLoading,
    saving,
  } = useAppSelector((s) => s.adminClients);

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [notesDirty, setNotesDirty] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    dispatch(fetchAdminClients({ search, tag: activeTag, page: 1 }));
  }, [activeTag]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      dispatch(fetchAdminClients({ search, tag: activeTag, page: 1 }));
    }, 350);
  }, [search]);

  useEffect(() => {
    if (selectedId !== null) {
      dispatch(fetchClientDetail(selectedId));
    }
  }, [selectedId]);

  useEffect(() => {
    if (detail) {
      setNotes(detail.client.admin_notes ?? "");
      setPendingTags(detail.client.tags ?? []);
      setNotesDirty(false);
    }
  }, [detail?.client.id]);

  const openDetail = (c: Client) => setSelectedId(c.id);
  const closeDetail = () => {
    setSelectedId(null);
    dispatch(clearDetail());
  };

  const toggleTag = (tag: string) => {
    setPendingTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const saveChanges = () => {
    if (!detail) return;
    dispatch(
      updateClient({
        id: detail.client.id,
        admin_notes: notes,
        tags: pendingTags,
      }),
    );
    setNotesDirty(false);
  };

  const handleExport = () => {
    const params = new URLSearchParams({ export: "csv" });
    if (search) params.set("search", search);
    if (activeTag) params.set("tag", activeTag);
    window.open(`/api/admin/clients.php?${params}`, "_blank");
  };

  return (
    <div className="flex h-full min-h-screen bg-[#F5F5F3]">
      {/* ── Main list ─────────────────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedId ? "hidden lg:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-montserrat text-xl font-bold text-navy">
                Clientes
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">{total} registros</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  dispatch(fetchAdminClients({ search, tag: activeTag, page }))
                }
                className="p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={13} /> CSV
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-navy"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag("")}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${activeTag === "" ? "bg-navy text-white border-navy" : "bg-white text-gray-500 border-gray-200 hover:border-navy"}`}
            >
              Todos
            </button>
            {TAGS.map((t) => (
              <button
                key={t.value}
                onClick={() =>
                  setActiveTag(activeTag === t.value ? "" : t.value)
                }
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${activeTag === t.value ? "bg-navy text-white border-navy" : `${t.color} hover:opacity-80`}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Cargando...
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <User size={40} className="mb-3 opacity-30" />
              <p className="text-sm">No se encontraron clientes</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openDetail(c)}
                  className={`w-full text-left px-6 py-4 hover:bg-white transition-colors flex items-center gap-4 ${selectedId === c.id ? "bg-white border-l-2 border-l-sand" : ""}`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-navy font-bold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-navy">
                        {c.name}
                      </span>
                      {c.tags.slice(0, 2).map((t) => (
                        <TagBadge key={t} tag={t} />
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">
                      {c.email}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {c.total_visits} visita{c.total_visits !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={10} />
                        {c.total_contacts} consulta
                        {c.total_contacts !== 1 ? "s" : ""}
                      </span>
                      <span>{INTERESTS[c.interest] ?? c.interest}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="text-[11px] text-gray-400">
                      {c.last_contact_at ? timeAgo(c.last_contact_at) : "—"}
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 mt-1 ml-auto"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() =>
                  dispatch(
                    fetchAdminClients({
                      search,
                      tag: activeTag,
                      page: page - 1,
                    }),
                  )
                }
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() =>
                  dispatch(
                    fetchAdminClients({
                      search,
                      tag: activeTag,
                      page: page + 1,
                    }),
                  )
                }
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedId !== null && (
          <motion.div
            key="detail"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "tween", duration: 0.22 }}
            className="w-full lg:w-[440px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0 overflow-hidden"
          >
            {detailLoading || !detail ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Cargando...
              </div>
            ) : (
              <>
                {/* Panel header */}
                <div className="bg-navy px-6 py-5 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {detail.client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-white font-semibold font-montserrat">
                          {detail.client.name}
                        </h2>
                        <p className="text-white/50 text-xs mt-0.5">
                          Cliente desde{" "}
                          {new Date(
                            detail.client.created_at,
                          ).toLocaleDateString("es-MX", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeDetail}
                      className="text-white/50 hover:text-white p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-4 flex gap-4 text-xs text-white/60">
                    <a
                      href={`mailto:${detail.client.email}`}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      <Mail size={11} />
                      {detail.client.email}
                    </a>
                    {detail.client.phone && (
                      <a
                        href={`tel:${detail.client.phone}`}
                        className="flex items-center gap-1 hover:text-white"
                      >
                        <Phone size={11} />
                        {detail.client.phone}
                      </a>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                    <span className="bg-white/10 px-2 py-0.5 rounded">
                      {INTERESTS[detail.client.interest] ??
                        detail.client.interest}
                    </span>
                    <span className="bg-white/10 px-2 py-0.5 rounded">
                      {detail.client.first_source === "booking"
                        ? "Reserva"
                        : "Formulario"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {detail.visits.length} visita
                      {detail.visits.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={10} />
                      {detail.contacts.length} consulta
                      {detail.contacts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Tags */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Etiquetas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => toggleTag(t.value)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-all ${pendingTags.includes(t.value) ? t.color : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Notas internas
                    </p>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        setNotesDirty(true);
                      }}
                      placeholder="Añade notas sobre este cliente..."
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-navy text-gray-700 placeholder:text-gray-300"
                    />
                  </div>

                  {/* Save button */}
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-navy text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-navy/90 disabled:opacity-50 transition-colors"
                  >
                    <Save size={14} />
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>

                  {/* Timeline */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Historial
                    </p>

                    {detail.visits.length === 0 &&
                    detail.contacts.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Sin actividad registrada
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {/* Merge and sort by date descending */}
                        {[
                          ...detail.visits.map((v) => ({
                            type: "visit" as const,
                            date: v.visit_date,
                            data: v,
                          })),
                          ...detail.contacts.map((c) => ({
                            type: "contact" as const,
                            date: c.created_at,
                            data: c,
                          })),
                        ]
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime(),
                          )
                          .map((item, i) =>
                            item.type === "visit" ? (
                              <div
                                key={`v-${item.data.id}`}
                                className="flex gap-3"
                              >
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center mt-0.5">
                                  <Calendar size={13} className="text-navy" />
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-navy">
                                      Visita agendada
                                    </span>
                                    <span
                                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${VISIT_STATUS_COLORS[item.data.status] ?? "bg-gray-100 text-gray-500"}`}
                                    >
                                      {VISIT_STATUS_LABELS[item.data.status] ??
                                        item.data.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {formatDate(item.data.visit_date)} ·{" "}
                                    {item.data.time_start.slice(0, 5)}–
                                    {item.data.time_end.slice(0, 5)} hrs
                                  </p>
                                  {item.data.admin_notes && (
                                    <p className="text-[11px] text-gray-400 mt-1 italic">
                                      {item.data.admin_notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div
                                key={`c-${item.data.id}`}
                                className="flex gap-3"
                              >
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-sand/10 flex items-center justify-center mt-0.5">
                                  <MessageSquare
                                    size={13}
                                    className="text-sand"
                                  />
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-navy">
                                      Consulta
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {timeAgo(item.data.created_at)}
                                    </span>
                                  </div>
                                  {item.data.subject && (
                                    <p className="text-xs font-medium text-gray-700 mb-0.5">
                                      {item.data.subject}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {item.data.message}
                                  </p>
                                </div>
                              </div>
                            ),
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
