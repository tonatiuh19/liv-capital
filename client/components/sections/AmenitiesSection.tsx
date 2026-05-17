import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { type LucideIcon } from "lucide-react";
import { getAmenityIcon } from "@/lib/amenityIcons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAmenities,
  type PublicAmenity,
} from "@/store/slices/amenitiesSlice";

function getIcon(name: string | null): LucideIcon {
  return getAmenityIcon(name);
}

// ─── Amenity icon card ────────────────────────────────────────────────────────
function AmenityCard({ item, index }: { item: PublicAmenity; index: number }) {
  const Icon = getIcon(item.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3) }}
      className="w-[148px] sm:w-[158px] flex flex-col items-center gap-3 p-5 bg-white rounded-sm border border-stone-warm/30 hover:border-sand/50 hover:shadow-md transition-all duration-300 group cursor-default"
    >
      <div className="w-14 h-14 bg-stone-light rounded-sm flex items-center justify-center group-hover:bg-navy transition-colors duration-300 shrink-0">
        <Icon className="w-7 h-7 text-navy group-hover:text-sand transition-colors duration-300" />
      </div>
      <p className="font-montserrat text-[10px] font-semibold text-navy text-center uppercase tracking-wide leading-tight">
        {item.name}
      </p>
    </motion.div>
  );
}

// ─── Facility card ────────────────────────────────────────────────────────────
function FacilityCard({ item, index }: { item: PublicAmenity; index: number }) {
  const Icon = getIcon(item.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4) }}
      className="w-[180px] sm:w-[210px] flex flex-col items-center gap-3 p-6 bg-stone-light rounded-sm border border-stone-warm/20 hover:border-sand/40 hover:bg-white transition-all duration-300 group"
    >
      <div className="w-12 h-12 border border-stone-warm/40 rounded-sm flex items-center justify-center group-hover:border-sand/50 transition-colors shrink-0">
        <Icon className="w-6 h-6 text-navy/60 group-hover:text-navy transition-colors" />
      </div>
      <p className="font-montserrat text-xs text-text-secondary text-center leading-relaxed">
        {item.description ?? item.name}
      </p>
    </motion.div>
  );
}

// ─── Photo gallery (only when images available) ──────────────────────────────
function PhotoGallery({ photos }: { photos: PublicAmenity[] }) {
  if (photos.length === 0) return null;
  const shown = photos.slice(0, 4);
  return (
    <div className="mb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <p className="font-josefin-sans text-xs tracking-[0.25em] text-sand uppercase mb-2">
          Espacios
        </p>
        <h3 className="font-montserrat font-bold text-navy text-2xl md:text-3xl uppercase tracking-wide">
          Galería
        </h3>
        <div className="w-12 h-px bg-sand mx-auto mt-4" />
      </motion.div>

      <div
        className={`grid gap-2 ${
          shown.length === 1 ? "grid-cols-1" : "grid-cols-2"
        }`}
      >
        {shown.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className={`relative overflow-hidden rounded-sm${
              shown.length === 3 && i === 2 ? " col-span-2" : ""
            }`}
          >
            <div className="aspect-[4/3] w-full">
              <img
                src={photo.image_url!}
                alt={photo.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/70 via-navy/20 to-transparent p-4">
              <p className="font-montserrat text-xs font-semibold text-white uppercase tracking-wider">
                {photo.name}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function AmenitiesSection() {
  const dispatch = useAppDispatch();
  const {
    amenities = [],
    facilities = [],
    loading,
  } = useAppSelector((s) => s.amenities);

  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  useEffect(() => {
    dispatch(fetchAmenities());
  }, [dispatch]);

  const photos = amenities.filter(
    (a) => a.show_in_gallery === 1 && a.image_url,
  );

  return (
    <section id="amenidades" className="py-20 md:py-32 px-6 bg-stone-light">
      <div className="max-w-7xl mx-auto">
        {/* ── Section header ── */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="section-title mb-4">Amenidades</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Espacios diseñados para tu bienestar y disfrute
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6" />
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-navy border-t-sand rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* ── Amenities icon grid ── */}
            <div className="flex flex-wrap justify-center gap-4 mb-20">
              {amenities.map((item, i) => (
                <AmenityCard key={item.id} item={item} index={i} />
              ))}
            </div>

            {/* ── Photo gallery (when images available) ── */}
            <PhotoGallery photos={photos} />

            {/* ── Facilities section ── */}
            {facilities.length > 0 && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="text-center mb-10"
                >
                  <p className="font-josefin-sans text-xs font-light tracking-[0.3em] text-sand uppercase mb-2">
                    Del Edificio
                  </p>
                  <h3 className="font-montserrat font-bold text-navy text-2xl md:text-3xl uppercase tracking-wide">
                    Facilidades y Accesorios
                  </h3>
                  <div className="w-12 h-px bg-sand mx-auto mt-4" />
                </motion.div>

                <div className="flex flex-wrap justify-center gap-4">
                  {facilities.map((item, i) => (
                    <FacilityCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
