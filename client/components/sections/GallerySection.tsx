import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGallery, GalleryImage } from "@/store/slices/gallerySlice";
import { assetUrl } from "@/lib/assetUrl";

const CATEGORIES = [
  { key: "todos", label: "Todos" },
  { key: "arquitectura", label: "Arquitectura" },
  { key: "amenidades", label: "Amenidades" },
  { key: "interiores", label: "Interiores" },
];

export default function GallerySection() {
  const dispatch = useAppDispatch();
  const { images, loading } = useAppSelector((s) => s.gallery);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const [filter, setFilter] = useState("todos");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  const filtered =
    filter === "todos"
      ? images
      : images.filter((img) => img.category === filter);

  const lbIdx = lightbox ? filtered.findIndex((i) => i.id === lightbox.id) : -1;
  const lbPrev = () => lbIdx > 0 && setLightbox(filtered[lbIdx - 1]);
  const lbNext = () =>
    lbIdx < filtered.length - 1 && setLightbox(filtered[lbIdx + 1]);

  return (
    <section className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Galería</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Explora cada detalle de LIV CAPITAL
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6" />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-6 py-2 rounded-sm font-montserrat font-medium text-sm transition-all duration-300 ${
                filter === cat.key
                  ? "bg-navy text-white"
                  : "bg-white text-navy border border-navy hover:bg-navy/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 md:h-72 bg-stone-warm/20 rounded-sm"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-stone-gray">
            <Images className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-montserrat font-light text-sm">
              No hay imágenes en esta categoría aún.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filtered.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={
                  inView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.95 }
                }
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => setLightbox(img)}
                className="group relative overflow-hidden rounded-sm cursor-pointer h-64 md:h-72 bg-navy"
              >
                <img
                  src={assetUrl(img.image_url)}
                  alt={img.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <h3 className="text-white font-josefin-sans font-thin text-base tracking-wide leading-snug">
                    {img.title}
                  </h3>
                  {img.description && (
                    <p className="text-sand text-xs font-montserrat mt-1 line-clamp-2">
                      {img.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl"
            >
              <img
                src={assetUrl(lightbox.image_url)}
                alt={lightbox.title}
                className="w-full max-h-[80vh] object-contain rounded-sm"
              />
              <div className="mt-4 text-center">
                <p className="text-white font-josefin-sans font-thin text-xl tracking-wide">
                  {lightbox.title}
                </p>
                {lightbox.description && (
                  <p className="text-sand/70 font-montserrat text-sm mt-1">
                    {lightbox.description}
                  </p>
                )}
              </div>
              {lbIdx > 0 && (
                <button
                  onClick={lbPrev}
                  className="absolute left-0 top-[40%] -translate-x-14 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {lbIdx < filtered.length - 1 && (
                <button
                  onClick={lbNext}
                  className="absolute right-0 top-[40%] translate-x-14 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
