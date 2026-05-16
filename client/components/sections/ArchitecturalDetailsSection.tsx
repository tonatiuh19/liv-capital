import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Waves, Wind, Sun, Apple, Zap, Trees } from "lucide-react";

const features = [
  {
    icon: Sun,
    title: "Orientación Óptima",
    description:
      "Cada departamento está posicionado para máxima iluminación natural, aprovechando la trayectoria solar durante todo el año.",
  },
  {
    icon: Wind,
    title: "Ventilación Cruzada",
    description:
      "Diseño de espacios que permite circulación de aire natural, creando ambientes frescos y saludables naturalmente.",
  },
  {
    icon: Waves,
    title: "Sistemas de Agua",
    description:
      "Tuberías de cobre con tratamiento antibacterial y sistemas de calentamiento solar eficiente.",
  },
  {
    icon: Zap,
    title: "Energía Inteligente",
    description:
      "Sistemas de iluminación LED, paneles solares en amenidades y medidores inteligentes en cada unidad.",
  },
  {
    icon: Apple,
    title: "Acabados Premium",
    description:
      "Pisos de cerámica italiana, herrería alemana, y todos los acabados de procedencia internacional.",
  },
  {
    icon: Trees,
    title: "Espacios Verdes",
    description:
      "Jardinerías integradas, plantas nativas y espacios de conexión con la naturaleza en cada nivel.",
  },
];

export default function ArchitecturalDetailsSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

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
          <h2 className="section-title mb-4">Detalles Arquitectónicos</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Cada elemento diseñado para tu confort y bienestar
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6"></div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 bg-white rounded-sm border border-stone-warm/30 hover:border-sand hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-sm bg-navy flex items-center justify-center mb-6 group-hover:bg-sand transition-colors duration-300">
                  <Icon className="w-6 h-6 text-sand group-hover:text-navy transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-montserrat font-bold text-navy mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary font-montserrat font-light">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Specification Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white p-12 md:p-16 rounded-sm border border-stone-warm/30"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-xl font-montserrat font-bold text-navy mb-6">
                Estructura & Seguridad
              </h4>
              <ul className="space-y-3 text-text-secondary font-montserrat font-light">
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Estructura de acero reforzado</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Sistemas anti-sísmicos avanzados</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Muros de concreto de alta densidad</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Protección contra incendios</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Sistemas de drenaje inteligente</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-montserrat font-bold text-navy mb-6">
                Interiores & Acabados
              </h4>
              <ul className="space-y-3 text-text-secondary font-montserrat font-light">
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Cerámica italiana importada</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Herrería alemana de lujo</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Pintura eco-amigable premium</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Puertas de madera sólida</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Iluminación integrada LED</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-montserrat font-bold text-navy mb-6">
                Tecnología Smart
              </h4>
              <ul className="space-y-3 text-text-secondary font-montserrat font-light">
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Control de temperatura inteligente</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Sistemas de seguridad integrados</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Fibra óptica en todas las unidades</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Acceso por biometría</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sand">✓</span>
                  <span>Monitoreo remoto 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
