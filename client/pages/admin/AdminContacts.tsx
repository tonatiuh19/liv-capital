import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminContacts,
  updateContact,
  ContactSubmission,
} from "@/store/slices/adminContactsSlice";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "new", label: "Nuevos" },
  { value: "read", label: "Leídos" },
  { value: "in_progress", label: "En proceso" },
  { value: "replied", label: "Contactados" },
  { value: "archived", label: "Archivados" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-sand/20 text-sand border-sand/30",
  read: "bg-gray-100 text-gray-500 border-gray-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  replied: "bg-green-100 text-green-700 border-green-200",
  archived: "bg-gray-100 text-gray-400 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nuevo",
  read: "Leído",
  in_progress: "En proceso",
  replied: "Contactado",
  archived: "Archivado",
};

const INTERESTS: Record<string, string> = {
  studio: "Estudio",
  "1bed": "1 Rec.",
  "2bed": "2 Rec.",
  "3bed": "3 Rec.",
  penthouse: "Penthouse",
  investment: "Inversión",
  general: "General",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function AdminContacts() {
  const dispatch = useAppDispatch();
  const { contacts, total, page, totalPages, loading, saving } = useAppSelector(
    (s) => s.adminContacts,
  );

  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    dispatch(fetchAdminContacts({ status: statusFilter, page: 1 }));
  }, [statusFilter]);

  const handleStatusChange = (id: number, newStatus: string) => {
    dispatch(updateContact({ id, status: newStatus }));
  };

  const handleNoteSave = (id: number) => {
    dispatch(updateContact({ id, notes: notes[id] }));
  };

  const handleExpand = (c: ContactSubmission) => {
    const isOpening = expandedId !== c.id;
    setExpandedId(isOpening ? c.id : null);
    if (isOpening) {
      setNotes((prev) => ({ ...prev, [c.id]: c.notes ?? "" }));
      // Auto-mark as read when first opened
      if (c.status === "new") {
        dispatch(updateContact({ id: c.id, status: "read" }));
      }
    }
  };

  const expanded = contacts.find((c) => c.id === expandedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-navy text-2xl">
            Contactos
          </h1>
          <p className="font-montserrat text-stone-gray text-sm mt-0.5">
            {total} solicitud{total !== 1 ? "es" : ""} en total
          </p>
        </div>
        <button
          onClick={() =>
            dispatch(fetchAdminContacts({ status: statusFilter, page }))
          }
          className="p-2 text-stone-gray hover:text-navy hover:bg-stone-light rounded-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-sm font-montserrat text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-navy text-white"
                : "bg-white border border-stone-warm text-stone-gray hover:text-navy"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm border border-stone-warm/30 overflow-hidden">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-navy border-t-sand rounded-full animate-spin" />
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <p className="text-center text-stone-gray font-montserrat text-sm py-12">
            Sin contactos
          </p>
        )}

        {!loading &&
          contacts.map((c) => (
            <div
              key={c.id}
              className="border-b border-stone-warm/20 last:border-0"
            >
              {/* Row */}
              <div
                className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-stone-light/50 transition-colors"
                onClick={() => handleExpand(c)}
              >
                {/* Status dot */}
                {c.status === "new" && (
                  <div className="w-2 h-2 bg-sand rounded-full flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-medium text-navy text-sm truncate">
                    {c.name}
                  </p>
                  <p className="font-montserrat text-xs text-stone-gray truncate">
                    {c.email}
                  </p>
                </div>

                <div className="hidden sm:block text-xs font-montserrat text-stone-gray flex-shrink-0">
                  {INTERESTS[c.interest] ?? c.interest ?? "—"}
                </div>

                <div className="flex-shrink-0">
                  <span
                    className={`text-xs font-montserrat px-2 py-0.5 rounded-full border ${STATUS_COLORS[c.status] ?? ""}`}
                  >
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </div>

                <div className="hidden md:block text-xs font-montserrat text-stone-gray flex-shrink-0">
                  {timeAgo(c.created_at)}
                </div>

                <div className="flex-shrink-0 text-stone-gray">
                  {expandedId === c.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {expandedId === c.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-2 bg-stone-light/50 border-t border-stone-warm/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="font-montserrat text-xs text-stone-gray uppercase tracking-wide mb-1">
                            Teléfono
                          </p>
                          <p className="font-montserrat text-sm text-navy">
                            {c.phone || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="font-montserrat text-xs text-stone-gray uppercase tracking-wide mb-1">
                            Interés
                          </p>
                          <p className="font-montserrat text-sm text-navy">
                            {INTERESTS[c.interest] ?? c.interest ?? "—"}
                          </p>
                        </div>
                        {c.subject && (
                          <div className="sm:col-span-2">
                            <p className="font-montserrat text-xs text-stone-gray uppercase tracking-wide mb-1">
                              Asunto
                            </p>
                            <p className="font-montserrat text-sm text-navy">
                              {c.subject}
                            </p>
                          </div>
                        )}
                        <div className="sm:col-span-2">
                          <p className="font-montserrat text-xs text-stone-gray uppercase tracking-wide mb-1">
                            Mensaje
                          </p>
                          <p className="font-montserrat text-sm text-navy leading-relaxed">
                            {c.message}
                          </p>
                        </div>
                        {c.source && c.source !== "contact_form" && (
                          <div>
                            <p className="font-montserrat text-xs text-stone-gray uppercase tracking-wide mb-1">
                              Origen
                            </p>
                            <p className="font-montserrat text-sm text-navy capitalize">
                              {c.source.replace(/_/g, " ")}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="font-montserrat text-xs text-stone-gray uppercase tracking-wide mb-1">
                            Fecha
                          </p>
                          <p className="font-montserrat text-sm text-navy">
                            {new Date(c.created_at).toLocaleDateString(
                              "es-MX",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mb-4">
                        <p className="font-montserrat text-xs text-stone-gray uppercase tracking-wide mb-1">
                          Notas internas
                        </p>
                        <textarea
                          value={notes[c.id] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          rows={2}
                          placeholder="Escribe notas sobre este contacto…"
                          className="w-full border border-stone-warm rounded-sm px-3 py-2 font-montserrat text-sm text-navy bg-white resize-none focus:outline-none focus:border-navy"
                        />
                        <button
                          onClick={() => handleNoteSave(c.id)}
                          disabled={saving}
                          className="mt-1 text-xs font-montserrat text-navy/60 hover:text-navy underline"
                        >
                          Guardar nota
                        </button>
                      </div>

                      {/* Status actions */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="font-montserrat text-xs text-stone-gray self-center">
                          Cambiar estado:
                        </span>
                        {["read", "in_progress", "replied", "archived"]
                          .filter((s) => s !== c.status)
                          .map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(c.id, s)}
                              disabled={saving}
                              className="text-xs font-montserrat px-2.5 py-1 rounded-sm border border-stone-warm text-navy hover:bg-stone-light disabled:opacity-50"
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() =>
                dispatch(
                  fetchAdminContacts({ status: statusFilter, page: i + 1 }),
                )
              }
              className={`w-8 h-8 rounded-sm font-montserrat text-sm ${
                page === i + 1
                  ? "bg-navy text-white"
                  : "border border-stone-warm text-navy hover:bg-stone-light"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
