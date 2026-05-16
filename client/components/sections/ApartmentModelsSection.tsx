import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchModels, PublicModel } from "@/store/slices/modelsSlice";
import { Link } from "react-router-dom";

const TYPE_LABELS: Record<string, string> = {
  studio: "Estudio",
  "1bed": "1 Recámara",
  "2bed": "2 Recámaras",
  "3bed": "3 Recámaras",
  penthouse: "Penthouse",
  loft: "Loft",
};

// Building floors top→bottom. 0 = Planta Baja (no floor 1 in this building).
const ALL_FLOORS = [7, 6, 5, 4, 3, 2, 0] as const;

function floorLabel(min: number | null, max: number | null): string {
  if (min === null) return "";
  const minStr = min === 0 ? "PB" : `Planta ${min}`;
  if (max === null || max === min) return minStr;
  const maxStr = max === 0 ? "PB" : String(max);
  return `${minStr}–${maxStr}`;
}

// ─── Building diagram (visual only — highlights floors for selected model) ────
function BuildingDiagram({
  model,
  dark = false,
}: {
  model: PublicModel | null;
  dark?: boolean;
}) {
  if (!model || model.floor_min == null) return null;
  const min = model.floor_min;
  const max = model.floor_max ?? min;

  if (dark) {
    return (
      <div className="flex flex-col items-center">
        <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.25em] text-white/40 mb-4 self-start">
          Plantas del edificio
        </p>
        {/* Building silhouette */}
        <div className="flex flex-col items-stretch" style={{ width: 52 }}>
          {/* Roof peak */}
          <div className="flex justify-center mb-0.5">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "26px solid transparent",
                borderRight: "26px solid transparent",
                borderBottom: "12px solid rgba(255,255,255,0.15)",
              }}
            />
          </div>
          {/* Floor slabs */}
          {ALL_FLOORS.map((floor) => {
            const active = floor >= min && floor <= max;
            return (
              <motion.div
                key={floor}
                animate={{
                  backgroundColor: active
                    ? "#ff9933"
                    : "rgba(255,255,255,0.05)",
                  borderColor: active ? "#ff9933" : "rgba(255,255,255,0.10)",
                }}
                transition={{ duration: 0.25 }}
                className="w-full h-6 border flex items-center justify-center mb-px"
              >
                <span
                  className={`font-montserrat text-[8px] font-bold transition-colors duration-200 ${
                    active ? "text-white" : "text-white/25"
                  }`}
                >
                  {floor === 0 ? "PB" : floor}
                </span>
              </motion.div>
            );
          })}
          {/* Ground line */}
          <div
            className="w-full h-0.5 mt-1"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          />
        </div>
        {/* Label below */}
        <AnimatePresence mode="wait">
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 text-center"
          >
            <p className="font-josefin-sans text-white text-sm font-semibold tracking-wide">
              {floorLabel(model.floor_min, model.floor_max)}
            </p>
            <p className="font-montserrat text-[10px] text-white/40 mt-0.5">
              {max === min
                ? "1 planta"
                : `Plantas ${min === 0 ? "PB" : min}–${max}`}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 border-t border-stone-warm/20 bg-stone-light/50">
      <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.25em] text-stone-gray/60 mb-4">
        Plantas del edificio
      </p>
      <div className="flex gap-4 items-end">
        {/* Building silhouette */}
        <div className="flex flex-col items-stretch" style={{ width: 64 }}>
          {/* Roof peak */}
          <div className="flex justify-center mb-0.5">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "32px solid transparent",
                borderRight: "32px solid transparent",
                borderBottom: "14px solid rgba(46,52,71,0.18)",
              }}
            />
          </div>
          {/* Floor slabs */}
          {ALL_FLOORS.map((floor) => {
            const active = floor >= min && floor <= max;
            return (
              <motion.div
                key={floor}
                animate={{
                  backgroundColor: active ? "#ff9933" : "rgba(46,52,71,0.06)",
                  borderColor: active ? "#ff9933" : "rgba(46,52,71,0.15)",
                }}
                transition={{ duration: 0.25 }}
                className="w-full h-7 border flex items-center justify-center mb-px"
              >
                <span
                  className={`font-montserrat text-[9px] font-bold transition-colors duration-200 ${
                    active ? "text-white" : "text-navy/30"
                  }`}
                >
                  {floor === 0 ? "PB" : floor}
                </span>
              </motion.div>
            );
          })}
          {/* Ground line */}
          <div className="w-full h-0.5 bg-navy/20 mt-1" />
        </div>

        {/* Label beside diagram */}
        <AnimatePresence mode="wait">
          <motion.div
            key={model.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 pb-1"
          >
            <p className="font-josefin-sans text-navy text-sm font-semibold tracking-wide leading-snug">
              {floorLabel(model.floor_min, model.floor_max)}
            </p>
            <p className="font-montserrat text-[10px] text-stone-gray mt-0.5">
              {max === min
                ? "1 planta disponible"
                : `Plantas ${min === 0 ? "PB" : min}–${max}`}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-0 animate-pulse">
      <div className="lg:w-72 xl:w-80 shrink-0 space-y-2 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-stone-light rounded-sm" />
        ))}
      </div>
      <div className="flex-1 bg-stone-light min-h-[480px]" />
    </div>
  );
}

// ─── Compact selector row ─────────────────────────────────────────────────────
function SelectorRow({
  model,
  active,
  onClick,
}: {
  model: PublicModel;
  active: boolean;
  onClick: () => void;
}) {
  const thumb = model.main_image_url ?? model.images[0]?.image_url ?? null;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 border-l-2 ${
        active
          ? "border-sand bg-navy/5"
          : "border-transparent hover:border-stone-warm/50 hover:bg-stone-light/60"
      }`}
    >
      {/* Thumb */}
      <div className="shrink-0 w-14 h-14 rounded-sm overflow-hidden bg-stone-light">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-stone-warm" />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-josefin-sans tracking-wider text-sm truncate ${active ? "text-navy font-semibold" : "text-navy/70"}`}
        >
          {model.name}
        </p>
        <p className="font-montserrat text-xs text-stone-gray mt-0.5">
          {TYPE_LABELS[model.type] ?? model.type}
          {model.area_sqm
            ? ` · ${(Number(model.area_sqm) + Number(model.terrace_m2 ?? 0)).toFixed(2)} m²`
            : ""}
          {" · "}
          {model.bedrooms} rec
        </p>
        {model.floor_min != null && (
          <p className="font-montserrat text-[10px] text-sand/80 font-medium mt-0.5">
            {floorLabel(model.floor_min, model.floor_max)}
          </p>
        )}
        {model.price_from && (
          <p className="font-montserrat text-xs text-sand font-medium mt-0.5">
            Desde \${Number(model.price_from).toLocaleString("es-MX")}
          </p>
        )}
      </div>
      <ChevronRight
        className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-sand" : "text-stone-warm"}`}
      />
    </button>
  );
}

// ─── Inline gallery ───────────────────────────────────────────────────────────
function Gallery({ model }: { model: PublicModel }) {
  const allImages = [
    ...(model.main_image_url
      ? [{ image_url: model.main_image_url, caption: null }]
      : []),
    ...model.images,
  ];
  const [activeIdx, setActiveIdx] = useState(0);

  // Reset when model changes
  useEffect(() => {
    setActiveIdx(0);
  }, [model.id]);

  if (allImages.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-navy/10">
        <Building2 className="w-16 h-16 text-white/20" />
      </div>
    );
  }

  const prev = () =>
    setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length);
  const next = () => setActiveIdx((i) => (i + 1) % allImages.length);

  return (
    <div className="relative w-full h-full group">
      <AnimatePresence mode="wait">
        <motion.img
          key={`${model.id}-${activeIdx}`}
          src={allImages[activeIdx].image_url}
          alt={model.name}
          className="absolute inset-0 w-full h-full object-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent pointer-events-none" />

      {/* Nav arrows */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all pointer-events-auto ${i === activeIdx ? "bg-sand w-4" : "bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Thumbnail strip at bottom */}
      {allImages.length > 1 && (
        <div className="absolute bottom-3 left-3 right-3 flex gap-1.5 overflow-x-auto pb-0.5">
          {allImages.slice(0, 7).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`shrink-0 w-12 h-9 rounded-sm overflow-hidden border-2 transition-all ${i === activeIdx ? "border-sand" : "border-white/30 hover:border-white/70"}`}
            >
              <img
                src={img.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Detail overlay panel (bottom of the image) ───────────────────────────────
function DetailPanel({ model }: { model: PublicModel }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={model.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.35 }}
        className="p-6 lg:p-8 bg-navy text-white flex gap-8 items-start"
      >
        {/* Left: all content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <span className="text-xs font-montserrat font-medium bg-sand/20 text-sand border border-sand/30 px-2 py-0.5 rounded-sm">
                {TYPE_LABELS[model.type] ?? model.type}
              </span>
              <h3 className="font-josefin-sans text-3xl md:text-4xl font-thin tracking-widest mt-2">
                {model.name}
              </h3>
              {model.description && (
                <p className="font-montserrat text-white/60 text-sm mt-2 leading-relaxed line-clamp-2">
                  {model.description}
                </p>
              )}
            </div>
            {model.price_from && (
              <div className="text-right shrink-0">
                <p className="text-white/40 text-xs font-montserrat uppercase tracking-widest">
                  Desde
                </p>
                <p className="text-sand font-montserrat font-bold text-xl mt-0.5">
                  \${Number(model.price_from).toLocaleString("es-MX")}
                </p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-5 border-b border-white/10 mb-5">
            <div>
              <p className="text-white/40 text-xs font-montserrat uppercase tracking-widest">
                Recámaras
              </p>
              <p className="text-2xl font-montserrat font-bold">
                {model.bedrooms}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-xs font-montserrat uppercase tracking-widest">
                Baños
              </p>
              <p className="text-2xl font-montserrat font-bold">
                {model.bathrooms}
              </p>
            </div>
            {model.area_sqm && (
              <div>
                <p className="text-white/40 text-xs font-montserrat uppercase tracking-widest">
                  Interior
                </p>
                <p className="text-2xl font-montserrat font-bold">
                  {model.area_sqm} m²
                </p>
              </div>
            )}
            {model.terrace_m2 != null && model.terrace_m2 > 0 && (
              <div>
                <p className="text-white/40 text-xs font-montserrat uppercase tracking-widest">
                  Terraza
                </p>
                <p className="text-2xl font-montserrat font-bold">
                  {model.terrace_m2} m²
                </p>
              </div>
            )}
            {model.area_sqm && (
              <div>
                <p className="text-white/40 text-xs font-montserrat uppercase tracking-widest">
                  Total
                </p>
                <p className="text-2xl font-montserrat font-bold">
                  {(
                    Number(model.area_sqm) + Number(model.terrace_m2 ?? 0)
                  ).toFixed(2)}{" "}
                  m²
                </p>
              </div>
            )}
            {model.parking_spaces > 0 && (
              <div>
                <p className="text-white/40 text-xs font-montserrat uppercase tracking-widest">
                  Cajón
                </p>
                <p className="text-2xl font-montserrat font-bold">
                  {model.parking_spaces}
                </p>
              </div>
            )}
            {model.floor_min != null && (
              <div>
                <p className="text-white/40 text-xs font-montserrat uppercase tracking-widest">
                  Planta
                </p>
                <p className="text-2xl font-montserrat font-bold">
                  {model.floor_min === 0
                    ? "PB"
                    : model.floor_max && model.floor_max !== model.floor_min
                      ? `${model.floor_min}–${model.floor_max}`
                      : model.floor_min}
                </p>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/modelos/${model.slug}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-sand text-navy font-montserrat font-semibold text-sm rounded-sm hover:bg-sand/90 transition-colors"
            >
              Ver detalle completo <ArrowRight className="w-4 h-4" />
            </Link>
            {model.video_url && (
              <Link
                to={`/modelos/${model.slug}#video`}
                className="flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white font-montserrat text-sm rounded-sm hover:bg-white/10 transition-colors"
              >
                <PlayCircle className="w-4 h-4" /> Ver video
              </Link>
            )}
            <a
              href="/agendar-visita"
              className="flex items-center gap-2 px-5 py-2.5 border border-sand/40 text-sand font-montserrat text-sm rounded-sm hover:bg-sand/10 transition-colors"
            >
              Agendar Visita
            </a>
          </div>
        </div>
        {/* end left content */}

        {/* Right: building diagram (desktop only) */}
        <div className="hidden lg:flex shrink-0 border-l border-white/10 pl-8 pt-1">
          <BuildingDiagram model={model} dark />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function ApartmentModelsSection() {
  const dispatch = useAppDispatch();
  const { models, loading } = useAppSelector((s) => s.models);
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);
  useEffect(() => {
    setSelectedIdx(0);
  }, [models.length]);

  const selected = models[selectedIdx] ?? null;

  // Scroll the selector to the active item on mobile
  useEffect(() => {
    if (selectorRef.current) {
      const active = selectorRef.current.querySelectorAll("button")[
        selectedIdx
      ] as HTMLElement | undefined;
      active?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [selectedIdx]);

  return (
    <section
      id="modelos"
      className="py-20 md:py-32 bg-stone-light overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <h2 className="section-title mb-4">Modelos Disponibles</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Diseños adaptados a cada estilo de vida
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6" />
        </motion.div>
      </div>

      {loading && (
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton />
        </div>
      )}

      {!loading && models.length === 0 && (
        <div className="text-center py-16 text-text-secondary font-montserrat font-light">
          Modelos disponibles próximamente.
        </div>
      )}

      {!loading && models.length > 0 && selected && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-7xl mx-auto px-6"
        >
          {/* ── Mobile: horizontal chip tabs ── */}
          <div
            ref={selectorRef}
            className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none"
          >
            {models.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setSelectedIdx(i)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-sm border transition-all text-xs font-montserrat font-medium whitespace-nowrap ${
                  i === selectedIdx
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-navy/60 border-stone-warm/40 hover:border-navy/40"
                }`}
              >
                {m.name}
                <span
                  className={`text-xs ${i === selectedIdx ? "text-sand" : "text-stone-gray"}`}
                >
                  {m.bedrooms} rec
                </span>
              </button>
            ))}
          </div>

          {/* ── Main layout ── */}
          <div className="flex flex-col lg:flex-row rounded-sm overflow-hidden shadow-2xl border border-stone-warm/20">
            {/* Left selector — desktop only */}
            <div className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 bg-white border-r border-stone-warm/20 overflow-y-auto max-h-[680px]">
              <div className="px-4 py-4 border-b border-stone-warm/20">
                <p className="font-montserrat text-xs font-semibold text-stone-gray uppercase tracking-widest">
                  {models.length} modelos
                </p>
              </div>
              {models.map((m, i) => (
                <SelectorRow
                  key={m.id}
                  model={m}
                  active={i === selectedIdx}
                  onClick={() => setSelectedIdx(i)}
                />
              ))}
              <BuildingDiagram model={selected} />
            </div>

            {/* Right: image + detail */}
            <div className="flex-1 flex flex-col">
              {/* Image panel */}
              <div
                className="relative w-full"
                style={{
                  minHeight: "340px",
                  height: "55vh",
                  maxHeight: "520px",
                }}
              >
                <Gallery model={selected} />
              </div>
              {/* Detail panel */}
              <DetailPanel model={selected} />
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
