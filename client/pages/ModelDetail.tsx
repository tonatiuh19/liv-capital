import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Bath,
  Maximize2,
  PlayCircle,
  Building2,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchModels, PublicModel } from "@/store/slices/modelsSlice";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MetaTags from "@/components/seo/MetaTags";

const TYPE_LABELS: Record<string, string> = {
  studio: "Estudio",
  "1bed": "1 Recámara",
  "2bed": "2 Recámaras",
  "3bed": "3 Recámaras",
  penthouse: "Penthouse",
  loft: "Loft",
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  images,
  startIdx,
  onClose,
}: {
  images: { image_url: string; caption: string | null }[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
      >
        <X className="w-7 h-7" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <motion.img
        key={idx}
        src={images[idx].image_url}
        alt={images[idx].caption ?? ""}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      />
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm font-montserrat">
        {idx + 1} / {images.length}
      </p>
    </motion.div>
  );
}

// ─── Gallery grid ─────────────────────────────────────────────────────────────
function GalleryGrid({ model }: { model: PublicModel }) {
  const allImages = [
    ...(model.main_image_url
      ? [{ image_url: model.main_image_url, caption: null }]
      : []),
    ...model.images,
  ];
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (allImages.length === 0) return null;

  // Hero + up to 4 side images
  const hero = allImages[0];
  const sides = allImages.slice(1, 5);
  const remaining = allImages.length - 5;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-sm overflow-hidden">
        {/* Hero — spans 2 rows on md+ */}
        <div
          className="col-span-2 md:row-span-2 relative cursor-pointer group"
          style={{ minHeight: 300 }}
          onClick={() => setLightbox(0)}
        >
          <img
            src={hero.image_url}
            alt={model.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ minHeight: 300 }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>

        {/* Side images */}
        {sides.map((img, i) => (
          <div
            key={i}
            className="relative cursor-pointer group overflow-hidden aspect-[4/3] md:aspect-auto"
            onClick={() => setLightbox(i + 1)}
          >
            <img
              src={img.image_url}
              alt={img.caption ?? ""}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* "Ver todas" overlay on last visible */}
            {i === 3 && remaining > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <p className="text-white font-montserrat font-semibold text-lg">
                  +{remaining + 1} fotos
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            images={allImages}
            startIdx={lightbox}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Video embed ──────────────────────────────────────────────────────────────
function VideoSection(_props: { url: string }) {
  return (
    <section id="video" className="py-20 bg-navy">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PlayCircle className="w-6 h-6 text-sand" />
            <h2 className="font-josefin-sans text-3xl font-thin tracking-widest text-white">
              Recorrido Virtual
            </h2>
          </div>
          <div className="w-12 h-px bg-sand mx-auto" />
        </div>

        <div className="relative w-full rounded-sm overflow-hidden shadow-2xl">
          <video
            src="/videos/recorrido.mp4"
            controls
            playsInline
            className="w-full"
            style={{ maxHeight: "70vh" }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Other models nav ─────────────────────────────────────────────────────────
function OtherModels({
  models,
  currentId,
}: {
  models: PublicModel[];
  currentId: number;
}) {
  const others = models.filter((m) => m.id !== currentId).slice(0, 3);
  if (others.length === 0) return null;
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-josefin-sans text-3xl font-thin tracking-widest text-navy">
            Otros Modelos
          </h2>
          <div className="w-12 h-px bg-sand mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {others.map((m) => {
            const thumb = m.main_image_url ?? m.images[0]?.image_url ?? null;
            return (
              <Link
                key={m.id}
                to={`/modelos/${m.slug}`}
                className="group border border-stone-warm/30 rounded-sm overflow-hidden hover:border-sand/50 hover:shadow-lg transition-all"
              >
                <div className="w-full h-48 overflow-hidden bg-stone-light">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={m.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-stone-warm" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-josefin-sans tracking-wider text-navy text-xl mb-1">
                    {m.name}
                  </p>
                  <p className="font-montserrat text-xs text-stone-gray">
                    {TYPE_LABELS[m.type] ?? m.type}
                    {m.area_sqm ? ` · ${m.area_sqm} m²` : ""}
                  </p>
                  {m.price_from && (
                    <p className="font-montserrat text-sm text-sand font-semibold mt-2">
                      Desde ${Number(m.price_from).toLocaleString("es-MX")}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ModelDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { models, loading } = useAppSelector((s) => s.models);

  useEffect(() => {
    if (models.length === 0) dispatch(fetchModels());
  }, [dispatch, models.length]);

  const model: PublicModel | undefined = models.find((m) => m.slug === slug);

  // Redirect to 404 once we have data and still no match
  useEffect(() => {
    if (!loading && models.length > 0 && !model) {
      navigate("/", { replace: true });
    }
  }, [loading, models.length, model, navigate]);

  if (loading || !model) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-navy border-t-sand rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const allImages = [
    ...(model.main_image_url
      ? [{ image_url: model.main_image_url, caption: null }]
      : []),
    ...model.images,
  ];

  return (
    <div className="bg-white">
      <MetaTags
        title={`${model.name} — LIV Capital`}
        description={
          model.description ??
          `Conoce el ${model.name}: ${model.bedrooms} recámaras, ${model.bathrooms} baños${model.area_sqm ? `, ${model.area_sqm} m²` : ""}. LIV Capital Guadalajara.`
        }
        keywords={`${model.name}, departamentos Guadalajara, LIV Capital, ${TYPE_LABELS[model.type] ?? model.type}`}
      />
      <Header />

      <main className="pt-16">
        {/* ── Hero ── */}
        <div
          className="relative w-full bg-navy overflow-hidden"
          style={{ minHeight: "55vh" }}
        >
          {allImages[0] ? (
            <img
              src={allImages[0].image_url}
              alt={model.name}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="absolute inset-0 bg-navy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />

          <div
            className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 flex flex-col justify-end h-full"
            style={{ minHeight: "55vh" }}
          >
            {/* Back */}
            <Link
              to="/#modelos"
              className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white font-montserrat text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Todos los modelos
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block text-xs font-montserrat font-medium bg-sand/20 text-sand border border-sand/30 px-2 py-0.5 rounded-sm mb-4">
                {TYPE_LABELS[model.type] ?? model.type}
              </span>
              <h1 className="font-josefin-sans text-5xl md:text-7xl font-thin tracking-widest text-white mb-4">
                {model.name}
              </h1>
              {model.description && (
                <p className="font-montserrat text-white/60 text-lg max-w-xl leading-relaxed">
                  {model.description}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Key stats bar ── */}
        <div className="bg-navy border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center gap-x-10 gap-y-3">
            <div className="flex items-center gap-2 text-white">
              <BedDouble className="w-4 h-4 text-sand" />
              <span className="font-montserrat text-sm">
                <strong>{model.bedrooms}</strong> Recámaras
              </span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Bath className="w-4 h-4 text-sand" />
              <span className="font-montserrat text-sm">
                <strong>{model.bathrooms}</strong> Baños
              </span>
            </div>
            {model.area_sqm && (
              <div className="flex items-center gap-2 text-white">
                <Maximize2 className="w-4 h-4 text-sand" />
                <span className="font-montserrat text-sm">
                  <strong>{model.area_sqm}</strong> m² totales
                </span>
              </div>
            )}
            {model.price_from && (
              <div className="ml-auto">
                <span className="font-montserrat text-xs text-white/40 uppercase tracking-widest block">
                  Precio desde
                </span>
                <span className="font-montserrat font-bold text-sand text-xl">
                  ${Number(model.price_from).toLocaleString("es-MX")} MXN
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Gallery ── */}
        {allImages.length > 0 && (
          <section className="py-16 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="font-josefin-sans text-3xl font-thin tracking-widest text-navy">
                    Galería
                  </h2>
                  <div className="w-10 h-px bg-sand mt-3" />
                </div>
                <p className="font-montserrat text-sm text-stone-gray">
                  {allImages.length}{" "}
                  {allImages.length === 1 ? "imagen" : "imágenes"}
                </p>
              </div>
              <GalleryGrid model={model} />
            </div>
          </section>
        )}

        {/* ── Floor plan ── */}
        {model.floor_plan_url && (
          <section className="py-16 px-6 bg-stone-light/40">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-josefin-sans text-3xl font-thin tracking-widest text-navy mb-2">
                Plano de Planta
              </h2>
              <div className="w-10 h-px bg-sand mx-auto mb-10" />
              <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-warm/20">
                <img
                  src={model.floor_plan_url}
                  alt={`Plano ${model.name}`}
                  className="w-full object-contain max-h-[600px]"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Video ── */}
        {model.video_url && <VideoSection url={model.video_url} />}

        {/* ── CTA ── */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-josefin-sans text-4xl md:text-5xl font-thin tracking-widest text-navy mb-6">
              ¿Te interesa este modelo?
            </h2>
            <p className="font-montserrat text-text-secondary font-light text-lg mb-10 leading-relaxed">
              Agenda una visita y conoce el proyecto en persona. Nuestro equipo
              te recibirá y resolverá todas tus dudas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/agendar-visita" className="btn-sand text-center">
                Agendar Visita
              </a>
              <a href="/#contacto" className="btn-secondary text-center">
                Más Información
              </a>
            </div>
          </div>
        </section>

        {/* ── Other models ── */}
        <OtherModels models={models} currentId={model.id} />
      </main>

      <Footer />
    </div>
  );
}
