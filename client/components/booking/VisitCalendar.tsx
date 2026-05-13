import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  /** Set of available date strings "YYYY-MM-DD" */
  availableDates: Set<string>;
  /** Currently selected date or null */
  selectedDate: string | null;
  /** Called when user picks an available date */
  onDateSelect: (date: string) => void;
  /** Called when the visible month changes — lets parent pre-fetch slots */
  onMonthChange?: (month: string) => void;
  /** Whether the current month's data is loading */
  loading?: boolean;
}

const DAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
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

function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export default function VisitCalendar({
  availableDates,
  selectedDate,
  onDateSelect,
  onMonthChange,
  loading = false,
}: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [dir, setDir] = useState<1 | -1>(1);

  // Notify parent of initial month
  useEffect(() => {
    onMonthChange?.(getMonthKey(year, month));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function navigate(direction: 1 | -1) {
    setDir(direction);
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setMonth(newMonth);
    setYear(newYear);
    onMonthChange?.(getMonthKey(newYear, newMonth));
  }

  // First day of the month (0=Sun…6=Sat). Convert to Mon-first (0=Mon)
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Can we go back? Don't allow navigating before current month
  const canGoBack = !(
    year === today.getFullYear() && month === today.getMonth()
  );

  function isToday(d: number) {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      d === today.getDate()
    );
  }

  function dateStr(d: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function isPast(d: number): boolean {
    const dt = new Date(year, month, d);
    return dt < today;
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          disabled={!canGoBack}
          className="w-9 h-9 flex items-center justify-center rounded-sm border border-stone-warm hover:border-navy hover:bg-navy hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={`${year}-${month}`}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-center"
          >
            <span className="font-josefin-sans text-navy font-light tracking-widest text-lg uppercase">
              {MONTHS_ES[month]}
            </span>
            <span className="text-text-secondary font-montserrat text-sm ml-2">
              {year}
            </span>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => navigate(1)}
          className="w-9 h-9 flex items-center justify-center rounded-sm border border-stone-warm hover:border-navy hover:bg-navy hover:text-white transition-all duration-200"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_ES.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-montserrat font-600 text-text-secondary tracking-widest uppercase py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={`grid-${year}-${month}`}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid grid-cols-7 gap-y-1"
        >
          {/* Empty cells before month start */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const ds = dateStr(day);
            const past = isPast(day);
            const avail = availableDates.has(ds);
            const sel = selectedDate === ds;
            const todayFlag = isToday(day);

            return (
              <div key={day} className="flex items-center justify-center p-0.5">
                <button
                  onClick={() => avail && !past && onDateSelect(ds)}
                  disabled={past || !avail || loading}
                  aria-label={ds}
                  aria-pressed={sel}
                  className={[
                    "relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm text-sm font-montserrat transition-all duration-200",
                    sel
                      ? "bg-navy text-white font-700 shadow-md"
                      : avail && !past
                        ? "border border-sand text-navy hover:bg-sand hover:text-navy font-500 cursor-pointer"
                        : "text-stone-gray cursor-not-allowed opacity-40",
                    loading && !past && "animate-pulse",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {day}
                  {todayFlag && (
                    <span
                      className={[
                        "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        sel ? "bg-white" : "bg-sand",
                      ].join(" ")}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-sand rounded-sm" />
          <span className="text-xs font-montserrat text-text-secondary">
            Disponible
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-navy rounded-sm" />
          <span className="text-xs font-montserrat text-text-secondary">
            Seleccionado
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-stone-warm/40 rounded-sm" />
          <span className="text-xs font-montserrat text-text-secondary">
            No disponible
          </span>
        </div>
      </div>
    </div>
  );
}
