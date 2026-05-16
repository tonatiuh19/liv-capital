import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Building2, Lightbulb, MapPin, Play, X } from "lucide-react";
import { useRef, useState } from "react";

const stats = [
  { number: "8", label: "Plantas", suffix: "" },
  { number: "125+", label: "Departamentos", suffix: "" },
  { number: "15,000", label: "m² de construcción", suffix: "" },
  { number: "12", label: "Amenidades", suffix: "" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
} as const;

export default function ProjectOverviewSection() {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);

  const openLightbox = () => {
    setLightboxOpen(true);
    // Let the DOM render before playing
    setTimeout(() => lightboxVideoRef.current?.play(), 50);
  };

  const closeLightbox = () => {
    lightboxVideoRef.current?.pause();
    setLightboxOpen(false);
  };

  return (
    <section
      id="proyecto"
      ref={ref}
      className="py-20 md:py-32 px-6 bg-stone-light"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">El Proyecto</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Arquitectura urbana que redefine la vivienda de lujo
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6"></div>
        </motion.div>

        {/* Image and Description Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          {/* Video thumbnail */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="relative h-96 md:h-full min-h-[380px] rounded-sm overflow-hidden bg-navy cursor-pointer group"
            onClick={openLightbox}
          >
            <video
              src="/videos/recorrido.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-navy/30 group-hover:bg-navy/20 transition-colors duration-300" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.97 }}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center"
              >
                <Play className="w-7 h-7 text-white fill-white translate-x-0.5" />
              </motion.div>
            </div>
          </motion.div>

          {/* Lightbox */}
          <AnimatePresence>
            {lightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeLightbox}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.93, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.93, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-5xl"
                >
                  <video
                    ref={lightboxVideoRef}
                    src="/videos/recorrido.mp4"
                    controls
                    playsInline
                    className="w-full rounded-sm"
                  />
                  <button
                    onClick={closeLightbox}
                    className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white p-2 rounded-sm transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-3xl md:text-4xl font-montserrat font-bold text-navy mb-6">
              Vivienda Vertical de Lujo
            </h3>
            <p className="text-lg text-text-secondary font-montserrat font-light leading-relaxed mb-6">
              LIV CAPITAL es un desarrollo residencial contemporáneo que
              reimagina la vivienda urbana de clase mundial. Ubicado en el
              corazón de Guadalajara, el proyecto combina arquitectura
              sofisticada con espacios optimizados y amenidades de lujo.
            </p>
            <p className="text-lg text-text-secondary font-montserrat font-light leading-relaxed mb-8">
              Con ocho plantas de vivienda vertical, más de 125 departamentos
              disponibles y 12 amenidades premium, LIV CAPITAL ofrece una
              experiencia de vida integral. Cada unidad está diseñada con
              materiales de procedencia internacional, acabados premium y
              sistemas inteligentes que elevan tu estándar de calidad.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#modelos" className="btn-primary">
                Ver Modelos
              </a>
              <a href="#ubicacion" className="btn-secondary">
                Ubicación
              </a>
            </div>
          </motion.div>
        </div>

        {/* Statistics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20 py-12 border-y-2 border-stone-warm/30"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-montserrat font-extrabold text-navy mb-2">
                {stat.number}
                <span className="text-sand">{stat.suffix}</span>
              </div>
              <p className="text-text-secondary font-montserrat font-light text-sm md:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="p-8 bg-stone-light rounded-sm border border-stone-warm/30 hover:border-sand hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 bg-navy rounded-sm mb-6 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-sand" />
            </div>
            <h3 className="text-xl font-montserrat font-bold text-navy mb-4">
              Arquitectura Contemporánea
            </h3>
            <p className="text-text-secondary font-montserrat font-light">
              Diseño de vanguardia que respeta la escala urbana, integrándose
              armónicamente con el entorno y elevando el perfil arquitectónico
              de la zona.
            </p>
          </div>

          <div className="p-8 bg-stone-light rounded-sm border border-stone-warm/30 hover:border-sand hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 bg-sand rounded-sm mb-6 flex items-center justify-center">
              <Lightbulb className="w-7 h-7 text-navy" />
            </div>
            <h3 className="text-xl font-montserrat font-bold text-navy mb-4">
              Espacios Inteligentes
            </h3>
            <p className="text-text-secondary font-montserrat font-light">
              Cada departamento está optimizado para maximizar funcionalidad,
              luz natural, ventilación cruzada y confort climático todo el año.
            </p>
          </div>

          <div className="p-8 bg-stone-light rounded-sm border border-stone-warm/30 hover:border-sand hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 bg-navy rounded-sm mb-6 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-sand" />
            </div>
            <h3 className="text-xl font-montserrat font-bold text-navy mb-4">
              Ubicación Privilegiada
            </h3>
            <p className="text-text-secondary font-montserrat font-light">
              Acceso inmediato a restaurantes, comercio, entretenimiento y
              servicios de clase mundial. Conectividad integral con toda la
              ciudad.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
