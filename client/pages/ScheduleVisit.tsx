import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VisitCalendar from "@/components/booking/VisitCalendar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMonthSlots,
  submitBooking,
  resetBooking,
  type TimeSlot,
} from "@/store/slices/bookingSlice";

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Fecha", icon: Calendar },
  { id: 2, label: "Horario", icon: Clock },
  { id: 3, label: "Datos", icon: User },
  { id: 4, label: "Confirmar", icon: CheckCircle2 },
] as const;

const INTERESTS = [
  { value: "studio", label: "Studio" },
  { value: "1bed", label: "Suite 1 Recámara" },
  { value: "2bed", label: "Suite 2 Recámaras" },
  { value: "3bed", label: "Suite 3 Recámaras" },
  { value: "penthouse", label: "Penthouse" },
  { value: "general", label: "Información general" },
];

const MONTHS_ES = [
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
const DAYS_LONG = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function formatDateEs(ds: string): string {
  const dt = new Date(ds + "T12:00:00");
  return `${DAYS_LONG[dt.getDay()]}, ${dt.getDate()} de ${MONTHS_ES[dt.getMonth()]} de ${dt.getFullYear()}`;
}

// ── Animation variants ────────────────────────────────────────────────────────

const stepVariants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

// ── Validation schema ─────────────────────────────────────────────────────────

const detailsSchema = Yup.object({
  visitor_name: Yup.string()
    .min(2, "Mínimo 2 caracteres")
    .required("Nombre requerido"),
  visitor_email: Yup.string()
    .email("Correo inválido")
    .required("Correo requerido"),
  visitor_phone: Yup.string()
    .matches(/^[\d\s\+\-\(\)]{7,20}$/, "Teléfono inválido")
    .nullable(),
  visitor_interest: Yup.string().required(),
  visitor_message: Yup.string().max(500, "Máximo 500 caracteres").nullable(),
});

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════

export default function ScheduleVisit() {
  const dispatch = useAppDispatch();
  const {
    monthSlots,
    loadingMonth,
    submitting,
    submitted,
    bookingId,
    submitError,
  } = useAppSelector((s) => s.booking);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [stepDir, setStepDir] = useState<1 | -1>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Fetch current month on mount
  useEffect(() => {
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    dispatch(fetchMonthSlots(month));
    return () => {
      dispatch(resetBooking());
    };
  }, [dispatch]);

  const availableDates = useMemo(
    () => new Set(Object.keys(monthSlots)),
    [monthSlots],
  );

  function handleMonthChange(month: string) {
    dispatch(fetchMonthSlots(month));
  }

  function goTo(target: 1 | 2 | 3 | 4) {
    setStepDir(target > step ? 1 : -1);
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
    goTo(2);
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot);
    goTo(3);
  }

  const formik = useFormik({
    initialValues: {
      visitor_name: "",
      visitor_email: "",
      visitor_phone: "",
      visitor_interest: "general",
      visitor_message: "",
    },
    validationSchema: detailsSchema,
    onSubmit: () => goTo(4),
  });

  async function handleConfirm() {
    if (!selectedDate || !selectedSlot) return;
    await dispatch(
      submitBooking({
        slot_template_id: selectedSlot.id,
        visit_date: selectedDate,
        time_start: selectedSlot.start,
        time_end: selectedSlot.end,
        visitor_name: formik.values.visitor_name,
        visitor_email: formik.values.visitor_email,
        visitor_phone: formik.values.visitor_phone,
        visitor_interest: formik.values.visitor_interest,
        visitor_message: formik.values.visitor_message,
      }),
    );
  }

  const slotsForDate: TimeSlot[] = selectedDate
    ? (monthSlots[selectedDate] ?? [])
    : [];

  // Success screen
  if (submitted) {
    return (
      <SuccessScreen
        bookingId={bookingId}
        date={selectedDate}
        slot={selectedSlot}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero banner */}
      <section className="bg-navy pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="block w-8 h-px bg-sand" />
              <span className="font-josefin-sans text-sand text-xs tracking-[4px] uppercase">
                Guadalajara, Jalisco
              </span>
              <span className="block w-8 h-px bg-sand" />
            </div>
            <h1 className="font-josefin-sans font-thin text-white text-4xl sm:text-5xl tracking-widest uppercase mb-4">
              Agenda tu Visita
            </h1>
            <p className="font-montserrat font-light text-stone-warm text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Descubre LIV CAPITAL de primera mano. Selecciona el día y horario
              que mejor se adapte a ti y nuestro equipo te recibirá
              personalmente.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Step indicator */}
      <div className="bg-stone-light border-b border-stone-warm/50 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <motion.div
                      animate={{
                        backgroundColor: isActive
                          ? "#2E3447"
                          : isCompleted
                            ? "#ff9933"
                            : "#D9D6D1",
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.25 }}
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </motion.div>
                    <span
                      className={[
                        "text-[10px] font-montserrat tracking-wider hidden sm:block",
                        isActive ? "text-navy font-600" : "text-text-secondary",
                      ].join(" ")}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <motion.div
                      animate={{
                        backgroundColor: step > s.id ? "#ff9933" : "#D9D6D1",
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-12 sm:w-20 h-px mx-1 mb-4 sm:mb-5"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wizard content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait" initial={false} custom={stepDir}>
            <motion.div
              key={step}
              custom={stepDir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {step === 1 && (
                <StepDate
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  loading={loadingMonth !== null}
                  onDateSelect={handleDateSelect}
                  onMonthChange={handleMonthChange}
                />
              )}
              {step === 2 && (
                <StepSlot
                  date={selectedDate!}
                  slots={slotsForDate}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                  onBack={() => goTo(1)}
                />
              )}
              {step === 3 && (
                <StepDetails formik={formik} onBack={() => goTo(2)} />
              )}
              {step === 4 && (
                <StepConfirm
                  date={selectedDate!}
                  slot={selectedSlot!}
                  values={formik.values}
                  submitting={submitting}
                  error={submitError}
                  onBack={() => goTo(3)}
                  onConfirm={handleConfirm}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Step 1 — Date
// ══════════════════════════════════════════════════════════════════════════════

function StepDate({
  availableDates,
  selectedDate,
  loading,
  onDateSelect,
  onMonthChange,
}: {
  availableDates: Set<string>;
  selectedDate: string | null;
  loading: boolean;
  onDateSelect: (d: string) => void;
  onMonthChange: (m: string) => void;
}) {
  return (
    <div>
      <StepHeading
        step={1}
        title="Selecciona una fecha"
        subtitle="Los días resaltados tienen horarios disponibles para ti."
      />
      <div className="bg-white border border-stone-warm/60 rounded-sm p-6 sm:p-8 shadow-sm">
        <VisitCalendar
          availableDates={availableDates}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onMonthChange={onMonthChange}
          loading={loading}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Step 2 — Time slot
// ══════════════════════════════════════════════════════════════════════════════

function StepSlot({
  date,
  slots,
  selectedSlot,
  onSlotSelect,
  onBack,
}: {
  date: string;
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (s: TimeSlot) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <StepHeading
        step={2}
        title="Selecciona tu horario"
        subtitle={formatDateEs(date)}
      />

      {slots.length === 0 ? (
        <div className="bg-stone-light border border-stone-warm/60 rounded-sm p-10 text-center">
          <Clock className="w-10 h-10 text-stone-gray mx-auto mb-3" />
          <p className="font-montserrat text-text-secondary text-sm">
            No hay horarios disponibles para esta fecha.
          </p>
          <button onClick={onBack} className="mt-6 btn-secondary text-sm">
            Elegir otra fecha
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((slot) => {
              const isSel = selectedSlot?.id === slot.id;
              return (
                <motion.button
                  key={slot.id}
                  onClick={() => onSlotSelect(slot)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={[
                    "relative border rounded-sm p-4 text-left transition-all duration-200 group",
                    isSel
                      ? "border-navy bg-navy text-white shadow-md"
                      : "border-stone-warm bg-white hover:border-sand hover:shadow-sm",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "font-josefin-sans text-xl font-light tracking-wide",
                      isSel ? "text-white" : "text-navy",
                    ].join(" ")}
                  >
                    {slot.start}
                  </div>
                  <div
                    className={[
                      "font-montserrat text-xs mt-1",
                      isSel ? "text-stone-warm" : "text-text-secondary",
                    ].join(" ")}
                  >
                    hasta las {slot.end}
                  </div>
                  <div
                    className={[
                      "absolute top-3 right-3 text-[10px] font-montserrat tracking-wider px-2 py-0.5 rounded-full",
                      isSel
                        ? "bg-sand text-navy"
                        : "bg-stone-light text-text-secondary group-hover:bg-sand/20",
                    ].join(" ")}
                  >
                    {slot.available}{" "}
                    {slot.available === 1 ? "lugar" : "lugares"}
                  </div>
                  {isSel && (
                    <motion.div
                      layoutId="slot-check"
                      className="absolute bottom-3 right-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sand" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <BackButton onClick={onBack} />
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Step 3 — Details form
// ══════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepDetails({ formik, onBack }: { formik: any; onBack: () => void }) {
  return (
    <div>
      <StepHeading
        step={3}
        title="Tus datos"
        subtitle="Para confirmar tu visita necesitamos un par de datos."
      />

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="bg-white border border-stone-warm/60 rounded-sm p-6 sm:p-8 shadow-sm space-y-5">
          {/* Name */}
          <FormField
            label="Nombre completo *"
            name="visitor_name"
            type="text"
            placeholder="Tu nombre"
            formik={formik}
          />

          {/* Email */}
          <FormField
            label="Correo electrónico *"
            name="visitor_email"
            type="email"
            placeholder="correo@ejemplo.com"
            formik={formik}
          />

          {/* Phone */}
          <FormField
            label="Teléfono"
            name="visitor_phone"
            type="tel"
            placeholder="+52 33 1234 5678"
            formik={formik}
          />

          {/* Interest */}
          <div>
            <label className="block font-montserrat font-500 text-navy text-sm mb-2">
              ¿Qué tipo de unidad te interesa?
            </label>
            <select
              name="visitor_interest"
              value={formik.values.visitor_interest}
              onChange={formik.handleChange}
              className="w-full border border-stone-warm rounded-sm px-4 py-3 font-montserrat text-sm text-text-dark bg-white focus:outline-none focus:border-navy transition-colors"
            >
              {INTERESTS.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block font-montserrat font-500 text-navy text-sm mb-2">
              Mensaje o preguntas{" "}
              <span className="text-text-secondary font-normal">
                (opcional)
              </span>
            </label>
            <textarea
              name="visitor_message"
              value={formik.values.visitor_message}
              onChange={formik.handleChange}
              rows={3}
              placeholder="¿Tienes alguna pregunta o comentario especial para tu visita?"
              className="w-full border border-stone-warm rounded-sm px-4 py-3 font-montserrat text-sm text-text-dark bg-white focus:outline-none focus:border-navy transition-colors resize-none"
            />
            {formik.errors.visitor_message && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.visitor_message}
              </p>
            )}
          </div>

          <p className="text-xs font-montserrat text-text-secondary">
            Al continuar aceptas nuestro{" "}
            <a href="/aviso-privacidad" className="text-sand underline">
              Aviso de Privacidad
            </a>
            . Tus datos se usarán únicamente para coordinar tu visita.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <BackButton onClick={onBack} />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 sm:flex-none btn-sand text-sm flex items-center justify-center gap-2"
          >
            Revisar y confirmar
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Step 4 — Confirmation
// ══════════════════════════════════════════════════════════════════════════════

function StepConfirm({
  date,
  slot,
  values,
  submitting,
  error,
  onBack,
  onConfirm,
}: {
  date: string;
  slot: TimeSlot;
  values: {
    visitor_name: string;
    visitor_email: string;
    visitor_phone: string;
    visitor_interest: string;
    visitor_message: string;
  };
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const interest =
    INTERESTS.find((i) => i.value === values.visitor_interest)?.label ??
    values.visitor_interest;

  return (
    <div>
      <StepHeading
        step={4}
        title="Confirma tu visita"
        subtitle="Revisa los detalles antes de agendar."
      />

      {/* Summary card */}
      <div className="bg-navy rounded-sm overflow-hidden shadow-lg mb-6">
        {/* Date + time bar */}
        <div className="bg-sand px-6 py-3">
          <span className="font-montserrat font-700 text-navy text-xs tracking-widest uppercase">
            Detalles de la visita
          </span>
        </div>
        <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
          <SummaryItem
            icon={Calendar}
            label="Fecha"
            value={formatDateEs(date)}
            light
          />
          <SummaryItem
            icon={Clock}
            label="Horario"
            value={`${slot.start} – ${slot.end} hrs`}
            light
            accent
          />
          <SummaryItem
            icon={MapPin}
            label="Lugar"
            value="LIV CAPITAL, Guadalajara, Jalisco"
            light
          />
          <SummaryItem icon={Sparkles} label="Interés" value={interest} light />
        </div>
        <div className="border-t border-white/10 px-6 sm:px-8 py-5 grid sm:grid-cols-2 gap-4">
          <SummaryItem
            icon={User}
            label="Nombre"
            value={values.visitor_name}
            light
          />
          <SummaryItem
            icon={User}
            label="Correo"
            value={values.visitor_email}
            light
          />
          {values.visitor_phone && (
            <SummaryItem
              icon={User}
              label="Teléfono"
              value={values.visitor_phone}
              light
            />
          )}
          {values.visitor_message && (
            <div className="sm:col-span-2">
              <p className="text-stone-warm/60 font-montserrat text-[10px] tracking-widest uppercase mb-1">
                Mensaje
              </p>
              <p className="font-montserrat text-stone-warm text-sm leading-relaxed">
                {values.visitor_message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-stone-light border border-stone-warm/60 rounded-sm px-5 py-4 mb-6 flex gap-3 items-start">
        <Sparkles className="w-4 h-4 text-sand mt-0.5 flex-shrink-0" />
        <p className="font-montserrat text-sm text-text-secondary leading-relaxed">
          Recibirás una confirmación por correo con un archivo de calendario
          (.ics) para agregar esta cita a tu agenda automáticamente.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm px-5 py-4 mb-6">
          <p className="font-montserrat text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <BackButton onClick={onBack} disabled={submitting} />
        <motion.button
          onClick={onConfirm}
          disabled={submitting}
          whileHover={{ scale: submitting ? 1 : 1.02 }}
          whileTap={{ scale: submitting ? 1 : 0.98 }}
          className="flex-1 sm:flex-none btn-sand text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              Agendando…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Visita
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Success screen
// ══════════════════════════════════════════════════════════════════════════════

function SuccessScreen({
  bookingId,
  date,
  slot,
}: {
  bookingId: number | null;
  date: string | null;
  slot: TimeSlot | null;
}) {
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          className="max-w-lg w-full text-center"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 className="w-10 h-10 text-navy" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <div className="font-josefin-sans text-sand text-xs tracking-[4px] uppercase mb-3">
              ¡Todo listo!
            </div>
            <h2 className="font-josefin-sans font-thin text-white text-3xl sm:text-4xl tracking-widest uppercase mb-4">
              Visita Agendada
            </h2>
            {bookingId && (
              <div className="font-montserrat text-stone-warm/60 text-sm mb-6 tracking-wider">
                Referencia #LIV-{bookingId}
              </div>
            )}

            {date && slot && (
              <div className="bg-white/5 border border-white/10 rounded-sm p-5 mb-8 text-left space-y-3">
                <div>
                  <div className="text-stone-warm/60 font-montserrat text-[10px] tracking-widest uppercase mb-1">
                    Fecha
                  </div>
                  <div className="text-white font-montserrat font-500">
                    {formatDateEs(date)}
                  </div>
                </div>
                <div>
                  <div className="text-stone-warm/60 font-montserrat text-[10px] tracking-widest uppercase mb-1">
                    Horario
                  </div>
                  <div className="text-sand font-josefin-sans text-2xl font-light">
                    {slot.start} – {slot.end} hrs
                  </div>
                </div>
                <div>
                  <div className="text-stone-warm/60 font-montserrat text-[10px] tracking-widest uppercase mb-1">
                    Ubicación
                  </div>
                  <div className="text-white font-montserrat text-sm">
                    LIV CAPITAL, Guadalajara, Jalisco
                  </div>
                </div>
              </div>
            )}

            <p className="font-montserrat font-light text-stone-warm text-sm leading-relaxed mb-8">
              Te hemos enviado un correo de confirmación con todos los detalles
              y un archivo de calendario para que no olvides tu cita.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="btn-sand text-sm inline-flex items-center justify-center gap-2"
              >
                Volver al inicio
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Small helpers
// ══════════════════════════════════════════════════════════════════════════════

function StepHeading({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-josefin-sans text-sand text-xs tracking-[3px] uppercase">
          Paso {step} de {STEPS.length}
        </span>
      </div>
      <h2 className="font-josefin-sans font-light text-navy text-2xl sm:text-3xl tracking-widest uppercase">
        {title}
      </h2>
      <p className="font-montserrat font-light text-text-secondary text-sm mt-1">
        {subtitle}
      </p>
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  light = false,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  light?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        className={[
          "font-montserrat text-[10px] tracking-widest uppercase mb-1 flex items-center gap-1.5",
          light ? "text-stone-warm/60" : "text-text-secondary",
        ].join(" ")}
      >
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div
        className={[
          "font-montserrat font-500 text-sm sm:text-base",
          light
            ? accent
              ? "text-sand text-lg sm:text-xl font-josefin-sans font-light"
              : "text-white"
            : "text-text-dark",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FormField({
  label,
  name,
  type,
  placeholder,
  formik,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  formik: any;
}) {
  const touched = formik.touched[name];
  const error = formik.errors[name];
  return (
    <div>
      <label className="block font-montserrat font-500 text-navy text-sm mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder={placeholder}
        className={[
          "w-full border rounded-sm px-4 py-3 font-montserrat text-sm text-text-dark bg-white focus:outline-none transition-colors",
          touched && error
            ? "border-red-400 focus:border-red-500"
            : "border-stone-warm focus:border-navy",
        ].join(" ")}
      />
      {touched && error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function BackButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-secondary text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ArrowLeft className="w-4 h-4" />
      Atrás
    </button>
  );
}
