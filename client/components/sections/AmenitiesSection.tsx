import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useRef, useEffect } from "react";
import {
  Leaf,
  Dumbbell,
  Wine,
  Users,
  Zap,
  Wifi,
  ParkingCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const amenities = [
  {
    icon: Leaf,
    title: "Rooftop Garden",
    description: "Espacio verde de 1,200 m² con vistas panorámicas de la ciudad",
  },
  {
    icon: Dumbbell,
    title: "Gymnasium Premium",
    description: "Equipamiento de última generación con personal entrenador",
  },
  {
    icon: Wine,
    title: "Wine & Lounge",
    description: "Área de estar y degustación con capacidad para eventos",
  },
  {
    icon: Users,
    title: "Coworking",
    description: "Espacios de trabajo colaborativo equipados con fibra óptica",
  },
  {
    icon: Zap,
    title: "Smart Building",
    description: "Automatización inteligente de temperatura, iluminación y seguridad",
  },
  {
    icon: Wifi,
    title: "Conectividad Total",
    description: "Fibra óptica de ultra velocidad en todas las unidades",
  },
  {
    icon: ParkingCircle,
    title: "Estacionamiento Privado",
    description: "Plazas de estacionamiento con sistema de entrada automática",
  },
  {
    icon: Shield,
    title: "Seguridad 24/7",
    description: "Vigilancia integral con tecnología de monitoreo avanzada",
  },
];

export default function AmenitiesSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Update items per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, amenities.length - itemsPerView);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section
      id="amenidades"
      className="py-20 md:py-32 px-6 bg-stone-light"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Amenidades</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Espacios diseñados para tu bienestar y disfrute
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6"></div>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel Wrapper */}
          <div className="overflow-hidden" ref={carouselRef}>
            <motion.div
              className="flex gap-8"
              animate={{ x: `-${currentIndex * (100 / itemsPerView)}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <div
                    key={index}
                    className={`flex-shrink-0 ${
                      itemsPerView === 1
                        ? "w-full"
                        : itemsPerView === 2
                          ? "w-1/2"
                          : "w-1/3"
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3) }}
                      className="bg-white p-8 rounded-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 border border-stone-warm/30 group cursor-pointer h-full flex flex-col"
                    >
                      <div className="w-14 h-14 bg-navy rounded-sm flex items-center justify-center mb-6 group-hover:bg-sand transition-colors duration-300">
                        <Icon className="w-7 h-7 text-sand group-hover:text-navy transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg font-montserrat font-bold text-navy mb-3">
                        {amenity.title}
                      </h3>
                      <p className="text-sm text-text-secondary font-montserrat font-light flex-grow">
                        {amenity.description}
                      </p>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrev}
              className="p-3 rounded-sm border-2 border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 group"
              aria-label="Previous amenity"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {Array.from({ length: Math.max(1, amenities.length - itemsPerView + 1) }).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-sand w-8"
                        : "bg-stone-warm/40 w-2 hover:bg-stone-warm/60"
                    }`}
                    aria-label={`Go to amenity ${index + 1}`}
                  />
                )
              )}
            </div>

            <button
              onClick={handleNext}
              className="p-3 rounded-sm border-2 border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 group"
              aria-label="Next amenity"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 bg-white p-12 rounded-sm border border-stone-warm/30"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-montserrat font-bold text-navy mb-6">
              Una experiencia de vida única
            </h3>
            <p className="text-text-secondary font-montserrat font-light leading-relaxed mb-6">
              Nuestras amenidades están diseñadas como una extensión natural de tu hogar, creando una comunidad exclusiva donde cada espacio ha sido cuidadosamente pensado para facilitar la vida contemporánea.
            </p>
            <p className="text-text-secondary font-montserrat font-light leading-relaxed">
              Desde el rooftop garden para relajación, hasta espacios colaborativos para el trabajo moderno, LIV CAPITAL ofrece todo lo que necesitas bajo un mismo techo.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
