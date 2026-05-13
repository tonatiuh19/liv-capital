import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { CheckCircle2 } from "lucide-react";

const qualityPoints = [
  {
    title: "Metodología BIM",
    description:
      "Diseño y construcción coordinados tridimensionalmente para máxima precisión",
  },
  {
    title: "Materiales Premium",
    description: "Acabados de procedencia internacional con garantía de durabilidad",
  },
  {
    title: "Control de Calidad",
    description: "Inspecciones rigurosas en cada etapa de construcción",
  },
  {
    title: "Sostenibilidad",
    description: "Certificaciones ambientales y sistemas de eficiencia energética",
  },
  {
    title: "Soporte Post-Venta",
    description: "Mantenimiento y garantía integral durante años",
  },
  {
    title: "Garantía Estructural",
    description: "Respaldo legal y seguros que protegen tu inversión",
  },
];

export default function QualitySection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="py-20 md:py-32 px-6 bg-stone-light">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Compromiso con la Calidad</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Construcción responsable pensada para el futuro
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6"></div>
        </motion.div>

        {/* Quality Points Grid */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {qualityPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-8 rounded-sm border border-stone-warm/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-4 mb-4">
                <CheckCircle2 className="w-6 h-6 text-sand flex-shrink-0" />
                <h3 className="font-montserrat font-600 text-navy">
                  {point.title}
                </h3>
              </div>
              <p className="text-text-secondary font-montserrat font-light text-sm">
                {point.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-navy text-white p-12 md:p-16 rounded-sm text-center"
        >
          <h3 className="text-3xl md:text-4xl font-montserrat font-bold text-sand mb-6">
            Confianza en cada detalle
          </h3>
          <p className="text-lg text-stone-warm font-montserrat font-light max-w-3xl mx-auto mb-8">
            LIV CAPITAL es más que un proyecto inmobiliario. Es un compromiso con tus expectativas de calidad, durabilidad y lujo. Cada departamento es construido con los más altos estándares, respaldado por profesionales comprometidos y materiales de clase mundial.
          </p>
          <p className="text-sand font-montserrat font-medium">
            Tu inversión merece el mejor cuidado. Eso es lo que ofrecemos.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
