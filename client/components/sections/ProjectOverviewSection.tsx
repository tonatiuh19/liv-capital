import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Building2, Lightbulb, MapPin } from "lucide-react";

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

  return (
    <section
      id="proyecto"
      ref={ref}
      className="py-20 md:py-32 px-6 bg-white"
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
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="relative h-96 md:h-full rounded-sm overflow-hidden bg-gradient-to-br from-navy/20 to-sand/10 border border-stone-warm/30"
          >
            {/* Architectural visualization placeholder */}
            <svg
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
              viewBox="0 0 600 400"
            >
              <defs>
                <linearGradient id="projGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2E3447" />
                  <stop offset="50%" stopColor="#D9B99B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2E3447" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Building silhouette */}
              <rect width="600" height="400" fill="url(#projGrad)" />

              {/* Building structure */}
              <g opacity="0.6">
                <rect x="50" y="80" width="500" height="280" fill="none" stroke="#D9B99B" strokeWidth="2" />
                {/* Floors */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <line key={`floor-${i}`} x1="50" y1={110 + i * 35} x2="550" y2={110 + i * 35} stroke="#D9B99B" strokeWidth="1" opacity="0.4" />
                ))}
                {/* Windows grid */}
                {[0, 1, 2, 3, 4, 5].map((col) =>
                  [0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
                    <rect key={`window-${col}-${row}`} x={75 + col * 80} y={95 + row * 35} width="20" height="20" fill="none" stroke="#D9B99B" opacity="0.5" />
                  ))
                )}
              </g>

              {/* Rooftop garden indication */}
              <circle cx="300" cy="60" r="40" fill="#D9B99B" opacity="0.3" />
              <text x="300" y="65" textAnchor="middle" fill="#2E3447" fontSize="12" fontWeight="bold">ROOFTOP</text>
            </svg>
          </motion.div>

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
              LIV CAPITAL es un desarrollo residencial contemporáneo que reimagina la vivienda urbana de clase mundial. Ubicado en el corazón de Guadalajara, el proyecto combina arquitectura sofisticada con espacios optimizados y amenidades de lujo.
            </p>
            <p className="text-lg text-text-secondary font-montserrat font-light leading-relaxed mb-8">
              Con ocho plantas de vivienda vertical, más de 125 departamentos disponibles y 12 amenidades premium, LIV CAPITAL ofrece una experiencia de vida integral. Cada unidad está diseñada con materiales de procedencia internacional, acabados premium y sistemas inteligentes que elevan tu estándar de calidad.
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
              Diseño de vanguardia que respeta la escala urbana, integrándose armónicamente con el entorno y elevando el perfil arquitectónico de la zona.
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
              Cada departamento está optimizado para maximizar funcionalidad, luz natural, ventilación cruzada y confort climático todo el año.
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
              Acceso inmediato a restaurantes, comercio, entretenimiento y servicios de clase mundial. Conectividad integral con toda la ciudad.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
