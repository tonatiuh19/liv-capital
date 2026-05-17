import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGallery, GalleryImage } from "@/store/slices/gallerySlice";
import { assetUrl } from "@/lib/assetUrl";

export default function GallerySection() {
  const dispatch = useAppDispatch();
  const { images, loading } = useAppSelector((s) => s.gallery);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  const open = (idx: number) => setLightboxIdx(idx);
  const close = () => setLightboxIdx(null);
  const prev = () => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i));
  const next = () =>
    setLightboxIdx((i) => (i !== null && i < images.length - 1 ? i + 1 : i));

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx]);

  const activeLightbox: GalleryImage | null =
    lightboxIdx !== null ? images[lightboxIdx] : null;

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="section-title mb-4">Galería</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Explora cada detalle de LIV CAPITAL
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6" />
        </motion.div>

        {/* Skeleton */}
        {loading && (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-3 bg-stone-warm/20 rounded-sm"
                style={{ height: `${180 + (i % 3) * 60}px` }}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && images.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-stone-gray">
            <Images className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-montserrat font-light text-sm">
              No hay imágenes en la galería aún.
            </p>
          </div>
        )}

        {/* Masonry grid */}
        {!loading && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="columns-2 sm:columns-3 lg:columns-4 gap-3"
          >
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                onClick={() => open(i)}
                className="break-inside-avoid mb-3 relative group overflow-hidden rounded-sm cursor-pointer bg-stone-light"
              >
                <img
                  src={assetUrl(img.image_url)}
                  alt={img.title}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 block"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-josefin-sans font-thin text-sm tracking-wide leading-snug line-clamp-2">
                    {img.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeLightbox && lightboxIdx !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={close}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-montserrat text-sm text-white/40">
                {lightboxIdx + 1} / {images.length}
              </span>
              <button
                onClick={close}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image */}
            <div
              className="flex-1 flex items-center justify-center relative px-14 sm:px-20 min-h-0"
              onClick={close}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeLightbox.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  src={assetUrl(activeLightbox.image_url)}
                  alt={activeLightbox.title}
                  className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </AnimatePresence>

              {/* Prev */}
              {lightboxIdx > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2.5 sm:p-3 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Next */}
              {lightboxIdx < images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2.5 sm:p-3 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            {/* Caption */}
            <div
              className="shrink-0 px-6 py-5 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white font-josefin-sans font-thin text-lg sm:text-xl tracking-widest">
                {activeLightbox.title}
              </p>
              {activeLightbox.description && (
                <p className="text-white/45 font-montserrat text-sm mt-1.5">
                  {activeLightbox.description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
