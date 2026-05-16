import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const interiors = [
  {
    name: "Sala de Estar",
    image: "🛋️",
    description:
      "Amplios espacios con ventanales que inundan de luz natural cada rincón",
  },
  {
    name: "Cocina Gourmet",
    image: "👨‍🍳",
    description:
      "Equipada con electrodomésticos de marca premium alemana e italiana",
  },
  {
    name: "Recámara Principal",
    image: "🛏️",
    description:
      "Suite máster con terrazas privadas y vistas panorámicas de la ciudad",
  },
  {
    name: "Baño Spa",
    image: "🚿",
    description:
      "Con acabados de lujo, productos de marca y sistemas de múltiples chorros",
  },
  {
    name: "Área de Trabajo",
    image: "💻",
    description:
      "Espacios dedicados con conectividad de fibra óptica ultra-rápida",
  },
  {
    name: "Terrazas Privadas",
    image: "🌿",
    description:
      "Espacios exteriores propios con vistas de la ciudad y zonas verdes",
  },
];

export default function InteriorShowcaseSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="py-10 md:py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        {/*         <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Interiores de Lujo</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Cada espacio diseñado para tu comodidad y disfrute
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6"></div>
        </motion.div> */}

        {/* Interior Showcase Grid */}
        {/*         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {interiors.map((interior, index) => (
            <motion.div
              key={index}
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="group overflow-hidden rounded-sm border border-stone-warm/30 hover:border-sand transition-all duration-300"
            >
              <div className="relative h-64 bg-gradient-to-br from-navy/10 to-sand/5 flex items-center justify-center overflow-hidden group-hover:bg-gradient-to-br group-hover:from-navy/20 group-hover:to-sand/10 transition-all duration-300">
                <svg
                  className="absolute inset-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <pattern id={`pattern-${index}`} width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D9B99B" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#pattern-${index})`} />
                </svg>

                <div className="relative z-10 text-8xl group-hover:scale-110 transition-transform duration-300">
                  {interior.image}
                </div>
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-montserrat font-bold text-navy mb-3">
                  {interior.name}
                </h3>
                <p className="text-text-secondary font-montserrat font-light text-sm">
                  {interior.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div> */}

        {/* Living Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gradient-to-r from-navy to-navy/90 text-white p-12 md:p-16 rounded-sm"
        >
          <div className="max-w-3xl">
            <h3 className="text-3xl md:text-4xl font-montserrat font-bold text-sand mb-6">
              Una Experiencia de Vida Completa
            </h3>
            <p className="text-lg text-stone-warm font-montserrat font-light leading-relaxed mb-8">
              Cada departamento en LIV CAPITAL está meticulosamente diseñado con
              los más altos estándares de lujo y funcionalidad. Desde la cocina
              gourmet hasta los baños tipo spa, cada espacio refleja nuestro
              compromiso con la excelencia.
            </p>
            <p className="text-lg text-stone-warm font-montserrat font-light leading-relaxed mb-8">
              Los interiores combinan materiales de procedencia internacional
              con una distribución inteligente que maximiza la luz natural y la
              ventilación. Cada unidad es un sanctuary donde forma y función se
              encuentran en perfecta armonía.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#modelos"
                className="px-8 py-3 bg-sand text-navy font-montserrat font-medium rounded-sm hover:bg-opacity-90 transition-all duration-300 text-center"
              >
                Conocer Modelos
              </a>
              <a
                href="#contacto"
                className="px-8 py-3 border-2 border-sand text-sand font-montserrat font-medium rounded-sm hover:bg-sand/10 transition-all duration-300 text-center"
              >
                Visita Virtual
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
