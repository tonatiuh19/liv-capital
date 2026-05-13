import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { MapPin, Utensils, ShoppingBag, Bus, Music } from "lucide-react";

const pointsOfInterest = [
  {
    icon: Utensils,
    title: "Restaurantes & Cafés",
    description: "Gastronomía de clase mundial a pasos de distancia",
    distance: "< 500m",
  },
  {
    icon: ShoppingBag,
    title: "Centros Comerciales",
    description: "Acceso a las principales opciones de compra y lujo",
    distance: "< 1km",
  },
  {
    icon: Bus,
    title: "Transporte Público",
    description: "Conectividad integral con toda la ciudad",
    distance: "< 300m",
  },
  {
    icon: Music,
    title: "Entretenimiento",
    description: "Vida nocturna vibrante y espacios culturales",
    distance: "< 1.5km",
  },
];

export default function LocationSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section id="ubicacion" className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Ubicación Estratégica</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            En el corazón de Guadalajara, conectado con lo mejor de la ciudad
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Map Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-96 rounded-sm overflow-hidden bg-gradient-to-br from-navy/10 to-sand/10 border border-stone-warm/30"
          >
            {/* Map placeholder with architectural grid */}
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#D9D6D1"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Center point */}
              <circle cx="50%" cy="50%" r="8" fill="#D9B99B" />
              <circle cx="50%" cy="50%" r="20" fill="none" stroke="#D9B99B" strokeWidth="1" opacity="0.5" />
              <circle cx="50%" cy="50%" r="35" fill="none" stroke="#D9B99B" strokeWidth="1" opacity="0.25" />

              {/* POI markers */}
              <circle cx="35%" cy="30%" r="5" fill="#2E3447" opacity="0.7" />
              <circle cx="70%" cy="45%" r="5" fill="#2E3447" opacity="0.7" />
              <circle cx="45%" cy="75%" r="5" fill="#2E3447" opacity="0.7" />
              <circle cx="75%" cy="65%" r="5" fill="#2E3447" opacity="0.7" />
            </svg>

            {/* Location Label */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-sm">
              <p className="font-montserrat font-600 text-navy text-sm">
                Guadalajara, Jalisco
              </p>
              <p className="font-montserrat font-light text-text-secondary text-xs">
                Centro Urbano Premium
              </p>
            </div>
          </motion.div>

          {/* Points of Interest */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {pointsOfInterest.map((poi, index) => {
              const Icon = poi.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="flex gap-4 p-4 rounded-sm border border-stone-warm/30 hover:border-sand hover:bg-stone-light/50 transition-all duration-300 group"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-sm bg-navy flex items-center justify-center group-hover:bg-sand transition-colors duration-300">
                      <Icon className="w-6 h-6 text-sand group-hover:text-navy transition-colors duration-300" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-montserrat font-600 text-navy mb-1">
                      {poi.title}
                    </h3>
                    <p className="text-sm text-text-secondary font-montserrat font-light">
                      {poi.description}
                    </p>
                    <span className="text-xs font-montserrat font-medium text-sand mt-2 inline-block">
                      {poi.distance}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center p-8 bg-stone-light rounded-sm border border-stone-warm/30">
            <MapPin className="w-8 h-8 text-sand mx-auto mb-4" />
            <h3 className="font-montserrat font-600 text-navy mb-2">Conectividad</h3>
            <p className="text-sm text-text-secondary font-montserrat font-light">
              Acceso directo a principales avenidas y sistema de transporte público
            </p>
          </div>
          <div className="text-center p-8 bg-stone-light rounded-sm border border-stone-warm/30">
            <MapPin className="w-8 h-8 text-sand mx-auto mb-4" />
            <h3 className="font-montserrat font-600 text-navy mb-2">Servicios</h3>
            <p className="text-sm text-text-secondary font-montserrat font-light">
              Proximidad a escuelas, hospitales, comercio y espacios de ocio
            </p>
          </div>
          <div className="text-center p-8 bg-stone-light rounded-sm border border-stone-warm/30">
            <MapPin className="w-8 h-8 text-sand mx-auto mb-4" />
            <h3 className="font-montserrat font-600 text-navy mb-2">Lifestyle</h3>
            <p className="text-sm text-text-secondary font-montserrat font-light">
              Restaurantes, cafés, entretenimiento y cultura a tu alcance
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
