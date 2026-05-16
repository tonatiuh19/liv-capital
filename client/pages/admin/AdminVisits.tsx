import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  Ban,
  Pencil,
  AlertTriangle,
  Clock,
  Users,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  CalendarDays,
  Settings,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminVisits,
  fetchBlockedDates,
  createVisit,
  updateVisit,
  cancelVisit,
  blockDate,
  unblockDate,
  fetchSlotTemplates,
  createSlotTemplate,
  updateSlotTemplate,
  deleteSlotTemplate,
  generateDaySlots,
  fetchVisitSettings,
  saveVisitSettings,
  unblockById,
  Visit,
  SlotTemplate,
  VisitSetting,
} from "@/store/slices/adminVisitsSlice";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Completado",
};

const INTERESTS: Record<string, string> = {
  studio: "Estudio",
  "1bed": "1 Rec.",
  "2bed": "2 Rec.",
  "3bed": "3 Rec.",
  penthouse: "Penthouse",
  general: "General",
};

// day_of_week: 0=Sun … 6=Sat — displayed Mon-Sun
const DOW_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon first

interface SlotForm {
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_capacity: number;
  label: string;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type ModalMode =
  | "create"
  | "edit"
  | "block"
  | "slot-create"
  | "slot-edit"
  | "day-setup"
  | null;

interface DaySetupForm {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  max_capacity: number;
}

interface VisitForm {
  visit_date: string;
  time_start: string;
  time_end: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_interest: string;
  visitor_message: string;
  admin_notes: string;
  status: string;
}

const emptyForm: VisitForm = {
  visit_date: "",
  time_start: "10:00",
  time_end: "11:00",
  visitor_name: "",
  visitor_email: "",
  visitor_phone: "",
  visitor_interest: "general",
  visitor_message: "",
  admin_notes: "",
  status: "confirmed",
};

export default function AdminVisits() {
  const dispatch = useAppDispatch();
  const {
    visits,
    dayCounts,
    blockedDates,
    slotTemplates,
    visitSettings,
    loading,
    slotsLoading,
    settingsLoading,
    settingsSaving,
    saving,
  } = useAppSelector((s) => s.adminVisits);

  const [tab, setTab] = useState<"visitas" | "horarios" | "configuracion">(
    "visitas",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Visit | null>(null);
  const [form, setForm] = useState<VisitForm>(emptyForm);
  const [blockReason, setBlockReason] = useState("");
  const [blockDateInput, setBlockDateInput] = useState("");
  const [blockTimeStart, setBlockTimeStart] = useState("");
  const [blockTimeEnd, setBlockTimeEnd] = useState("");

  // Slot template form state
  const emptySlotForm: SlotForm = {
    day_of_week: 1,
    start_time: "10:00",
    end_time: "11:00",
    max_capacity: 1,
    label: "",
  };
  const [slotForm, setSlotForm] = useState<SlotForm>(emptySlotForm);
  const [editSlotTarget, setEditSlotTarget] = useState<SlotTemplate | null>(
    null,
  );

  // Day-setup form state (bulk generate)
  const emptyDaySetup: DaySetupForm = {
    day_of_week: 1,
    start_time: "08:00",
    end_time: "20:00",
    slot_duration_minutes: 60,
    max_capacity: 2,
  };
  const [daySetupForm, setDaySetupForm] = useState<DaySetupForm>(emptyDaySetup);

  const month = monthKey(currentDate);

  // Local editable copy of settings
  const [settingDraft, setSettingDraft] = useState<
    Record<string, number | string | boolean>
  >({});
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminVisits({ month }));
    dispatch(fetchBlockedDates(month));
    dispatch(fetchSlotTemplates());
  }, [month]);

  useEffect(() => {
    if (tab === "configuracion" && visitSettings.length === 0) {
      dispatch(fetchVisitSettings());
    }
  }, [tab]);

  // Sync draft when settings load
  useEffect(() => {
    if (visitSettings.length > 0) {
      const draft: Record<string, number | string | boolean> = {};
      visitSettings.forEach((s) => {
        draft[s.config_key] = s.config_value;
      });
      setSettingDraft(draft);
    }
  }, [visitSettings]);

  const handleSaveSettings = async () => {
    const updates = Object.entries(settingDraft).map(([key, value]) => ({
      key,
      value,
    }));
    await dispatch(saveVisitSettings(updates));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Days that have at least one active slot template
  const activeDays = new Set(
    slotTemplates.filter((s) => s.is_active).map((s) => s.day_of_week),
  );

  // Full-day blocks only — used to colour calendar cells red
  const blockedSet = new Set(
    blockedDates
      .filter((b) => b.start_time === null)
      .map((b) => b.override_date),
  );

  const selectedVisits = selectedDate
    ? visits.filter((v) => v.visit_date === selectedDate)
    : [];

  // Calendar grid
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  // Monday-first: 0=Mon … 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const openCreate = (date?: string) => {
    setForm({ ...emptyForm, visit_date: date ?? "" });
    setEditTarget(null);
    setModalMode("create");
  };

  const openEdit = (v: Visit) => {
    setEditTarget(v);
    setForm({
      visit_date: v.visit_date,
      time_start: v.time_start,
      time_end: v.time_end,
      visitor_name: v.visitor_name,
      visitor_email: v.visitor_email,
      visitor_phone: v.visitor_phone,
      visitor_interest: v.visitor_interest,
      visitor_message: v.visitor_message,
      admin_notes: v.admin_notes ?? "",
      status: v.status,
    });
    setModalMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create") {
      await dispatch(
        createVisit({ ...form, status: form.status as Visit["status"] }),
      );
    } else if (modalMode === "edit" && editTarget) {
      await dispatch(
        updateVisit({
          id: editTarget.id,
          ...form,
          status: form.status as Visit["status"],
        }),
      );
    }
    setModalMode(null);
    dispatch(fetchAdminVisits({ month }));
  };

  const handleCancel = async (id: number) => {
    if (confirm("¿Cancelar esta visita?")) {
      await dispatch(cancelVisit(id));
    }
  };

  const openBlockModal = (date?: string) => {
    setBlockDateInput(date ?? "");
    setBlockReason("");
    setBlockTimeStart("");
    setBlockTimeEnd("");
    setModalMode("block");
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDateInput) return;
    const payload: {
      date: string;
      reason: string;
      time_start?: string;
      time_end?: string;
    } = {
      date: blockDateInput,
      reason: blockReason,
    };
    if (blockTimeStart && blockTimeEnd) {
      payload.time_start = blockTimeStart;
      payload.time_end = blockTimeEnd;
    }
    await dispatch(blockDate(payload));
    setModalMode(null);
  };

  const handleUnblockById = async (id: number) => {
    if (confirm("¿Eliminar este bloqueo de horario?")) {
      await dispatch(unblockById(id));
    }
  };

  const handleUnblock = async (date: string) => {
    if (confirm(`¿Desbloquear el ${date}?`)) {
      await dispatch(unblockDate(date));
    }
  };

  const openCreateSlot = () => {
    setSlotForm(emptySlotForm);
    setEditSlotTarget(null);
    setModalMode("slot-create");
  };

  const openEditSlot = (s: SlotTemplate) => {
    setEditSlotTarget(s);
    setSlotForm({
      day_of_week: s.day_of_week,
      start_time: s.start_time.slice(0, 5),
      end_time: s.end_time.slice(0, 5),
      max_capacity: s.max_capacity,
      label: s.label ?? "",
    });
    setModalMode("slot-edit");
  };

  const handleSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "slot-create") {
      await dispatch(createSlotTemplate(slotForm));
    } else if (modalMode === "slot-edit" && editSlotTarget) {
      await dispatch(
        updateSlotTemplate({ id: editSlotTarget.id, ...slotForm }),
      );
    }
    setModalMode(null);
  };

  const handleToggleSlot = async (s: SlotTemplate) => {
    await dispatch(
      updateSlotTemplate({ id: s.id, is_active: s.is_active ? 0 : 1 }),
    );
  };

  const handleDeleteSlot = async (id: number) => {
    if (confirm("¿Eliminar este horario?")) {
      await dispatch(deleteSlotTemplate(id));
    }
  };

  const openDaySetup = (dow: number) => {
    const daySlots = slotTemplates
      .filter((s) => s.day_of_week === dow)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    // Pre-fill from existing slots if any
    setDaySetupForm({
      day_of_week: dow,
      start_time: daySlots[0]?.start_time.slice(0, 5) ?? "08:00",
      end_time: daySlots[daySlots.length - 1]?.end_time.slice(0, 5) ?? "20:00",
      slot_duration_minutes:
        daySlots.length > 1
          ? Math.round(
              (new Date(`2000-01-01T${daySlots[1].start_time}`).getTime() -
                new Date(`2000-01-01T${daySlots[0].start_time}`).getTime()) /
                60000,
            )
          : 60,
      max_capacity: daySlots[0]?.max_capacity ?? 2,
    });
    setModalMode("day-setup");
  };

  const handleDaySetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(generateDaySlots(daySetupForm));
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-navy text-2xl">
            Visitas
          </h1>
          <p className="font-montserrat text-stone-gray text-sm mt-0.5">
            Gestión de visitas al inmueble
          </p>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-warm/30">
        {(["visitas", "horarios", "configuracion"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 font-montserrat text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-navy text-navy"
                : "border-transparent text-stone-gray hover:text-navy"
            }`}
          >
            {t === "visitas"
              ? "Visitas"
              : t === "horarios"
                ? "Horarios"
                : "Configuración"}
          </button>
        ))}
      </div>
      {/* ── TAB: VISITAS ───────────────────────────────────────────────────── */}
      {tab === "visitas" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-sm border border-stone-warm/30 p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-stone-light rounded-sm transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-navy" />
              </button>
              <h2 className="font-montserrat font-semibold text-navy">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-stone-light rounded-sm transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-navy" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center font-montserrat text-xs text-stone-gray py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const count = dayCounts[key] ?? 0;
                const isBlocked = blockedSet.has(key);
                const isSelected = selectedDate === key;
                const isToday = key === dateKey(new Date());

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(isSelected ? null : key)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-sm text-sm font-montserrat transition-all
                    ${isSelected ? "bg-navy text-white" : isBlocked ? "bg-red-50 text-red-300" : "hover:bg-stone-light text-navy"}
                    ${isToday && !isSelected ? "ring-1 ring-sand" : ""}
                  `}
                  >
                    <span className="font-medium">{day}</span>
                    {count > 0 && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-sand rounded-full text-[9px] text-navy font-bold flex items-center justify-center">
                        {count}
                      </span>
                    )}
                    {isBlocked && !isSelected && (
                      <Ban className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-red-300" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-warm/20">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-sand rounded-full flex items-center justify-center text-[9px] text-navy font-bold">
                  1
                </div>
                <span className="font-montserrat text-xs text-stone-gray">
                  Visitas
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-red-50 rounded-sm border border-red-200" />
                <span className="font-montserrat text-xs text-stone-gray">
                  Bloqueado
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-sm ring-1 ring-sand" />
                <span className="font-montserrat text-xs text-stone-gray">
                  Hoy
                </span>
              </div>
            </div>
          </div>

          {/* Day panel */}
          <div className="bg-white rounded-sm border border-stone-warm/30 p-5 flex flex-col">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-montserrat font-semibold text-navy text-sm">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "es-MX",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      },
                    )}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-stone-gray hover:text-navy"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Block indicator (read-only — manage in Horarios tab) */}
                {(() => {
                  const fullDayBlock = blockedDates.find(
                    (b) =>
                      b.override_date === selectedDate && b.start_time === null,
                  );
                  const timeRangeBlocks = blockedDates.filter(
                    (b) =>
                      b.override_date === selectedDate && b.start_time !== null,
                  );
                  if (!fullDayBlock && timeRangeBlocks.length === 0)
                    return null;
                  return (
                    <div className="mb-3 space-y-1.5">
                      {fullDayBlock && (
                        <div className="bg-red-50 rounded-sm px-3 py-2 flex items-center gap-2">
                          <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <p className="font-montserrat text-xs text-red-600 flex-1">
                            Día bloqueado
                            {fullDayBlock.reason
                              ? ` · ${fullDayBlock.reason}`
                              : ""}
                          </p>
                        </div>
                      )}
                      {timeRangeBlocks.map((b) => (
                        <div
                          key={b.id}
                          className="bg-orange-50 rounded-sm px-3 py-2 flex items-center gap-2"
                        >
                          <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span className="font-montserrat text-xs text-orange-700">
                            {b.start_time?.slice(0, 5)}–
                            {b.end_time?.slice(0, 5)}
                            {b.reason ? ` · ${b.reason}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="mb-4">
                  <button
                    onClick={() => openCreate(selectedDate)}
                    className="w-full text-xs font-montserrat bg-navy text-white py-1.5 rounded-sm flex items-center justify-center gap-1 hover:bg-opacity-90"
                  >
                    <Plus className="w-3 h-3" /> Agregar visita
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {selectedVisits.length === 0 && (
                    <p className="text-center text-stone-gray font-montserrat text-sm py-6">
                      Sin visitas este día
                    </p>
                  )}
                  {selectedVisits.map((v) => (
                    <div
                      key={v.id}
                      className="border border-stone-warm/30 rounded-sm p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-montserrat font-medium text-navy text-sm">
                          {v.visitor_name}
                        </p>
                        <span
                          className={`text-xs font-montserrat px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[v.status] ?? ""}`}
                        >
                          {STATUS_LABELS[v.status] ?? v.status}
                        </span>
                      </div>
                      <p className="font-montserrat text-xs text-stone-gray">
                        {v.time_start}–{v.time_end}
                      </p>
                      <p className="font-montserrat text-xs text-stone-gray truncate">
                        {v.visitor_email}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="text-xs text-navy/60 hover:text-navy font-montserrat flex items-center gap-0.5"
                        >
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                        {v.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancel(v.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-montserrat flex items-center gap-0.5"
                          >
                            <X className="w-3 h-3" /> Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="font-montserrat text-stone-gray text-sm text-center">
                  Selecciona un día en el calendario para ver las visitas
                </p>
              </div>
            )}
          </div>
        </div>
      )}{" "}
      {/* end tab: visitas */}
      {/* ── TAB: HORARIOS ─────────────────────────────────────────────────── */}
      {tab === "horarios" && (
        <div className="space-y-5">
          {/* Weekly template */}
          <div className="bg-white rounded-sm border border-stone-warm/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-navy" />
              <h3 className="font-montserrat font-semibold text-navy text-sm">
                Plantilla semanal
              </h3>
            </div>
            {slotsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-navy border-t-sand rounded-full animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-stone-warm/20">
                {DOW_ORDER.map((dow) => {
                  const daySlots = slotTemplates
                    .filter((s) => s.day_of_week === dow)
                    .sort((a, b) => a.start_time.localeCompare(b.start_time));
                  const activeCount = daySlots.filter(
                    (s) => s.is_active,
                  ).length;
                  const firstSlot = daySlots[0];
                  const lastSlot = daySlots[daySlots.length - 1];
                  return (
                    <div
                      key={dow}
                      className="flex items-center justify-between py-3 gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-montserrat font-semibold text-navy text-sm w-8 shrink-0">
                          {DOW_LABELS[dow].slice(0, 3)}
                        </span>
                        {firstSlot ? (
                          <span className="font-montserrat text-xs text-stone-gray truncate">
                            {firstSlot.start_time.slice(0, 5)}–
                            {lastSlot.end_time.slice(0, 5)} &middot;{" "}
                            {activeCount}/{daySlots.length} slots &middot; cap{" "}
                            {firstSlot.max_capacity}
                          </span>
                        ) : (
                          <span className="font-montserrat text-xs text-stone-gray/50 italic">
                            Sin horarios
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => openDaySetup(dow)}
                        className="flex items-center gap-1 shrink-0 text-xs font-montserrat text-navy/60 hover:text-navy border border-stone-warm/40 rounded-sm px-2.5 py-1 hover:bg-stone-light transition-colors"
                      >
                        <Settings className="w-3 h-3" />
                        Configurar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Blocked dates */}
          <div className="bg-white rounded-sm border border-stone-warm/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-navy" />
                <h3 className="font-montserrat font-semibold text-navy text-sm">
                  Fechas bloqueadas
                </h3>
                {blockedDates.length > 0 && (
                  <span className="font-montserrat text-xs text-stone-gray bg-stone-light rounded-full px-2 py-0.5">
                    {blockedDates.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => openBlockModal()}
                className="flex items-center gap-1.5 text-xs font-montserrat bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-sm px-3 py-1.5 transition-colors"
              >
                <Ban className="w-3 h-3" />
                Bloquear fecha
              </button>
            </div>

            {blockedDates.length === 0 ? (
              <p className="font-montserrat text-xs text-stone-gray/60 text-center py-6">
                No hay fechas bloqueadas
              </p>
            ) : (
              <div className="space-y-2">
                {[...blockedDates]
                  .sort((a, b) =>
                    a.override_date.localeCompare(b.override_date),
                  )
                  .map((b) => (
                    <div
                      key={b.id}
                      className={`flex items-center gap-3 rounded-sm px-3 py-2 text-xs font-montserrat ${
                        b.start_time
                          ? "bg-orange-50 border border-orange-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <span
                        className={`font-medium ${b.start_time ? "text-orange-700" : "text-red-600"}`}
                      >
                        {new Date(
                          b.override_date + "T00:00:00",
                        ).toLocaleDateString("es-MX", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {b.start_time && (
                        <span className="text-orange-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {b.start_time.slice(0, 5)}–{b.end_time?.slice(0, 5)}
                        </span>
                      )}
                      {b.reason && (
                        <span className="text-stone-gray truncate flex-1">
                          {b.reason}
                        </span>
                      )}
                      <button
                        onClick={() =>
                          b.start_time
                            ? handleUnblockById(b.id)
                            : handleUnblock(b.override_date)
                        }
                        className={`ml-auto shrink-0 hover:opacity-80 transition-opacity ${b.start_time ? "text-orange-400" : "text-red-400"}`}
                        title="Eliminar bloqueo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}{" "}
      {/* end tab: horarios */}
      {/* ── TAB: CONFIGURACIÓN ─────────────────────────────────────────────── */}
      {tab === "configuracion" && (
        <div className="space-y-6">
          {settingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Days summary */}
              <div className="bg-white rounded-sm border border-stone-warm/30 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-navy" />
                  <h3 className="font-montserrat font-semibold text-navy text-sm">
                    Días con horarios activos
                  </h3>
                </div>
                <p className="font-montserrat text-xs text-stone-gray mb-4">
                  Basado en los horarios configurados en la pestaña Horarios.
                  Activa o desactiva slots individuales allí.
                </p>
                <div className="flex flex-wrap gap-2">
                  {DOW_ORDER.map((dow) => {
                    const active = activeDays.has(dow);
                    return (
                      <div
                        key={dow}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-montserrat text-xs font-medium ${
                          active
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-stone-light border-stone-warm/30 text-stone-gray"
                        }`}
                      >
                        {active ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        {DOW_LABELS[dow]}
                      </div>
                    );
                  })}
                </div>
                {slotTemplates.length === 0 && (
                  <p className="font-montserrat text-xs text-stone-gray mt-3">
                    Sin horarios configurados. Ve a la pestaña Horarios para
                    agregar slots.
                  </p>
                )}
              </div>

              {/* Booking window settings */}
              <div className="bg-white rounded-sm border border-stone-warm/30 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-navy" />
                  <h3 className="font-montserrat font-semibold text-navy text-sm">
                    Reglas de reservación
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {visitSettings.map((s) => (
                    <div key={s.config_key}>
                      <label className="label-admin">{s.label}</label>
                      {s.config_type === "integer" && (
                        <input
                          type="number"
                          min={0}
                          value={
                            (settingDraft[s.config_key] as number) ??
                            (s.config_value as number)
                          }
                          onChange={(e) =>
                            setSettingDraft({
                              ...settingDraft,
                              [s.config_key]: Math.max(0, +e.target.value),
                            })
                          }
                          className="input-admin"
                        />
                      )}
                      {s.config_type === "boolean" && (
                        <select
                          value={
                            (settingDraft[s.config_key] ?? s.config_value)
                              ? "1"
                              : "0"
                          }
                          onChange={(e) =>
                            setSettingDraft({
                              ...settingDraft,
                              [s.config_key]: e.target.value === "1",
                            })
                          }
                          className="input-admin"
                        >
                          <option value="1">Activado</option>
                          <option value="0">Desactivado</option>
                        </select>
                      )}
                      {(s.config_type === "string" ||
                        s.config_type === "email" ||
                        s.config_type === "url") && (
                        <input
                          type={
                            s.config_type === "email"
                              ? "email"
                              : s.config_type === "url"
                                ? "url"
                                : "text"
                          }
                          value={
                            (settingDraft[s.config_key] as string) ??
                            (s.config_value as string)
                          }
                          onChange={(e) =>
                            setSettingDraft({
                              ...settingDraft,
                              [s.config_key]: e.target.value,
                            })
                          }
                          className="input-admin"
                        />
                      )}
                      {s.description && (
                        <p className="font-montserrat text-xs text-stone-gray mt-1">
                          {s.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-stone-warm/20">
                  {settingsSaved && (
                    <span className="font-montserrat text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Guardado
                    </span>
                  )}
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving || settingsLoading}
                    className="flex items-center gap-2 bg-navy text-white font-montserrat text-sm px-5 py-2 rounded-sm hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                  >
                    {settingsSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar cambios
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* Visit form modal */}
      <AnimatePresence>
        {(modalMode === "create" || modalMode === "edit") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalMode(null);
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
                  {modalMode === "create" ? "Nueva visita" : "Editar visita"}
                </h3>
                <button
                  onClick={() => setModalMode(null)}
                  className="text-stone-gray hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label-admin">Fecha</label>
                    <input
                      type="date"
                      value={form.visit_date}
                      onChange={(e) =>
                        setForm({ ...form, visit_date: e.target.value })
                      }
                      required
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Inicio</label>
                    <input
                      type="time"
                      value={form.time_start}
                      onChange={(e) =>
                        setForm({ ...form, time_start: e.target.value })
                      }
                      required
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Fin</label>
                    <input
                      type="time"
                      value={form.time_end}
                      onChange={(e) =>
                        setForm({ ...form, time_end: e.target.value })
                      }
                      required
                      className="input-admin"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-admin">Nombre del visitante *</label>
                  <input
                    type="text"
                    value={form.visitor_name}
                    onChange={(e) =>
                      setForm({ ...form, visitor_name: e.target.value })
                    }
                    required
                    className="input-admin"
                  />
                </div>
                <div>
                  <label className="label-admin">Correo *</label>
                  <input
                    type="email"
                    value={form.visitor_email}
                    onChange={(e) =>
                      setForm({ ...form, visitor_email: e.target.value })
                    }
                    required
                    className="input-admin"
                  />
                </div>
                <div>
                  <label className="label-admin">Teléfono</label>
                  <input
                    type="tel"
                    value={form.visitor_phone}
                    onChange={(e) =>
                      setForm({ ...form, visitor_phone: e.target.value })
                    }
                    className="input-admin"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-admin">Interés</label>
                    <select
                      value={form.visitor_interest}
                      onChange={(e) =>
                        setForm({ ...form, visitor_interest: e.target.value })
                      }
                      className="input-admin"
                    >
                      {Object.entries(INTERESTS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-admin">Estado</label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="input-admin"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="completed">Completado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-admin">Mensaje del visitante</label>
                  <textarea
                    value={form.visitor_message}
                    onChange={(e) =>
                      setForm({ ...form, visitor_message: e.target.value })
                    }
                    rows={2}
                    className="input-admin resize-none"
                  />
                </div>
                <div>
                  <label className="label-admin">Notas internas</label>
                  <textarea
                    value={form.admin_notes}
                    onChange={(e) =>
                      setForm({ ...form, admin_notes: e.target.value })
                    }
                    rows={2}
                    className="input-admin resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
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

        {/* Block date modal */}
        {modalMode === "block" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalMode(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-sm w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-montserrat font-semibold text-navy">
                  Bloquear fecha
                </h3>
                <button
                  onClick={() => setModalMode(null)}
                  className="text-stone-gray hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBlockDate} className="space-y-3">
                <div>
                  <label className="label-admin">Fecha *</label>
                  <input
                    type="date"
                    value={blockDateInput}
                    onChange={(e) => setBlockDateInput(e.target.value)}
                    required
                    className="input-admin"
                  />
                </div>
                <div>
                  <label className="label-admin">
                    Rango de horas (opcional)
                  </label>
                  <p className="font-montserrat text-xs text-stone-gray mb-2">
                    Deja vacío para bloquear el día completo, o ingresa un rango
                    para bloquear solo esos horarios.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-admin">Desde</label>
                      <input
                        type="time"
                        value={blockTimeStart}
                        onChange={(e) => setBlockTimeStart(e.target.value)}
                        className="input-admin"
                      />
                    </div>
                    <div>
                      <label className="label-admin">Hasta</label>
                      <input
                        type="time"
                        value={blockTimeEnd}
                        onChange={(e) => setBlockTimeEnd(e.target.value)}
                        className="input-admin"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label-admin">Motivo (opcional)</label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Ej. Evento privado"
                    className="input-admin"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="flex-1 border border-stone-warm text-navy font-montserrat text-sm py-2 rounded-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-500 text-white font-montserrat text-sm py-2 rounded-sm hover:bg-red-600"
                  >
                    Bloquear
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {/* Day-setup modal — bulk generate slots for a day */}
        {modalMode === "day-setup" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalMode(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-sm w-full max-w-sm"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-warm/20">
                <div>
                  <h3 className="font-montserrat font-semibold text-navy">
                    Configurar {DOW_LABELS[daySetupForm.day_of_week]}
                  </h3>
                  <p className="font-montserrat text-xs text-stone-gray mt-0.5">
                    Reemplaza todos los slots del día con los nuevos ajustes
                  </p>
                </div>
                <button
                  onClick={() => setModalMode(null)}
                  className="text-stone-gray hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDaySetupSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-admin">Desde</label>
                    <input
                      type="time"
                      value={daySetupForm.start_time}
                      onChange={(e) =>
                        setDaySetupForm({
                          ...daySetupForm,
                          start_time: e.target.value,
                        })
                      }
                      required
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Hasta</label>
                    <input
                      type="time"
                      value={daySetupForm.end_time}
                      onChange={(e) =>
                        setDaySetupForm({
                          ...daySetupForm,
                          end_time: e.target.value,
                        })
                      }
                      required
                      className="input-admin"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-admin">Duración por slot (min)</label>
                  <select
                    value={daySetupForm.slot_duration_minutes}
                    onChange={(e) =>
                      setDaySetupForm({
                        ...daySetupForm,
                        slot_duration_minutes: +e.target.value,
                      })
                    }
                    className="input-admin"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1.5 horas</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>

                <div>
                  <label className="label-admin">
                    Capacidad máxima por slot
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={daySetupForm.max_capacity}
                    onChange={(e) =>
                      setDaySetupForm({
                        ...daySetupForm,
                        max_capacity: Math.max(1, +e.target.value),
                      })
                    }
                    required
                    className="input-admin"
                  />
                </div>

                {/* Preview */}
                {daySetupForm.start_time &&
                  daySetupForm.end_time &&
                  daySetupForm.start_time < daySetupForm.end_time && (
                    <p className="font-montserrat text-xs text-stone-gray bg-stone-light rounded-sm px-3 py-2">
                      Se generarán{" "}
                      <strong className="text-navy">
                        {Math.floor(
                          (new Date(
                            `2000-01-01T${daySetupForm.end_time}`,
                          ).getTime() -
                            new Date(
                              `2000-01-01T${daySetupForm.start_time}`,
                            ).getTime()) /
                            (daySetupForm.slot_duration_minutes * 60000),
                        )}
                      </strong>{" "}
                      slots de {daySetupForm.slot_duration_minutes} min · cap{" "}
                      {daySetupForm.max_capacity} c/u
                    </p>
                  )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="flex-1 border border-stone-warm text-navy font-montserrat text-sm py-2 rounded-sm hover:bg-stone-light"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={slotsLoading}
                    className="flex-1 bg-navy text-white font-montserrat text-sm py-2 rounded-sm hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {slotsLoading ? "Generando…" : "Generar horarios"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Slot template modal */}
        {(modalMode === "slot-create" || modalMode === "slot-edit") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalMode(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-sm w-full max-w-sm"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-warm/20">
                <h3 className="font-montserrat font-semibold text-navy">
                  {modalMode === "slot-create"
                    ? "Nuevo horario"
                    : "Editar horario"}
                </h3>
                <button
                  onClick={() => setModalMode(null)}
                  className="text-stone-gray hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSlotSubmit} className="p-6 space-y-4">
                <div>
                  <label className="label-admin">Día de la semana</label>
                  <select
                    value={slotForm.day_of_week}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, day_of_week: +e.target.value })
                    }
                    className="input-admin"
                  >
                    {DOW_ORDER.map((dow) => (
                      <option key={dow} value={dow}>
                        {DOW_LABELS[dow]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-admin">Hora inicio</label>
                    <input
                      type="time"
                      value={slotForm.start_time}
                      onChange={(e) =>
                        setSlotForm({ ...slotForm, start_time: e.target.value })
                      }
                      required
                      className="input-admin"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Hora fin</label>
                    <input
                      type="time"
                      value={slotForm.end_time}
                      onChange={(e) =>
                        setSlotForm({ ...slotForm, end_time: e.target.value })
                      }
                      required
                      className="input-admin"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-admin">
                    Capacidad máxima (personas)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={slotForm.max_capacity}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        max_capacity: Math.max(1, +e.target.value),
                      })
                    }
                    required
                    className="input-admin"
                  />
                  <p className="font-montserrat text-xs text-stone-gray mt-1">
                    Número de visitas simultáneas permitidas en este horario
                  </p>
                </div>

                <div>
                  <label className="label-admin">Etiqueta (opcional)</label>
                  <input
                    type="text"
                    value={slotForm.label}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, label: e.target.value })
                    }
                    placeholder="Ej. Mañana, Tarde…"
                    className="input-admin"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
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
        .label-admin { display:block; font-family:var(--font-montserrat,sans-serif); font-size:11px; font-weight:500; color:#2E3447; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px; }
        .input-admin { width:100%; border:1px solid #D9D6D1; border-radius:2px; padding:8px 12px; font-family:var(--font-montserrat,sans-serif); font-size:13px; color:#2E3447; background:#fff; outline:none; transition:border-color 0.15s; }
        .input-admin:focus { border-color:#2E3447; }
      `}</style>
    </div>
  );
}
