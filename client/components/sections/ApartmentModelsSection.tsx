import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const models = [
  {
    name: "Modelo A",
    beds: "1",
    baths: "1",
    terrace: "14 m²",
    interior: "55 m²",
    total: "69 m²",
    description: "Perfecta para profesionales y parejas jóvenes",
  },
  {
    name: "Modelo B",
    beds: "1",
    baths: "1.5",
    terrace: "18 m²",
    interior: "70 m²",
    total: "88 m²",
    description: "Amplitud y confort optimizados",
  },
  {
    name: "Modelo C",
    beds: "2",
    baths: "2",
    terrace: "22 m²",
    interior: "85 m²",
    total: "107 m²",
    description: "Espaciosidad y funcionalidad",
  },
  {
    name: "Modelo D",
    beds: "2",
    baths: "2",
    terrace: "28 m²",
    interior: "95 m²",
    total: "123 m²",
    description: "Lujo y amplitud en cada rincón",
  },
  {
    name: "Modelo E",
    beds: "3",
    baths: "2.5",
    terrace: "35 m²",
    interior: "125 m²",
    total: "160 m²",
    description: "Para familias que buscan más espacio",
  },
  {
    name: "Modelo Penthouse",
    beds: "3",
    baths: "3",
    terrace: "80 m²",
    interior: "180 m²",
    total: "260 m²",
    description: "Lujo exclusivo con vistas panorámicas",
  },
];

export default function ApartmentModelsSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [selectedModel, setSelectedModel] = useState(0);

  return (
    <section id="modelos" className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Modelos Disponibles</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Diseños adaptados a cada estilo de vida
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6"></div>
        </motion.div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {models.map((model, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => setSelectedModel(index)}
              className={`p-8 rounded-sm border-2 cursor-pointer transition-all duration-300 ${
                selectedModel === index
                  ? "border-sand bg-stone-light"
                  : "border-stone-warm/30 bg-white hover:border-stone-warm/60"
              }`}
            >
              <h3 className="font-josefin-sans text-2xl font-thin tracking-widest text-navy mb-4">
                {model.name}
              </h3>
              <p className="text-sm text-text-secondary font-montserrat font-light mb-6">
                {model.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-stone-warm/30">
                <div>
                  <span className="text-xs uppercase font-montserrat font-medium text-sand">
                    Recámaras
                  </span>
                  <p className="text-2xl font-montserrat font-700 text-navy">
                    {model.beds}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase font-montserrat font-medium text-sand">
                    Baños
                  </span>
                  <p className="text-2xl font-montserrat font-700 text-navy">
                    {model.baths}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase font-montserrat font-medium text-sand">
                    Terraza
                  </span>
                  <p className="text-sm font-montserrat font-600 text-navy">
                    {model.terrace}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase font-montserrat font-medium text-sand">
                    Interior
                  </span>
                  <p className="text-sm font-montserrat font-600 text-navy">
                    {model.interior}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-montserrat font-medium text-stone-gray">
                    Total
                  </span>
                  <p className="text-3xl font-montserrat font-extrabold text-navy">
                    {model.total}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-sand" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed View of Selected Model */}
        <motion.div
          key={selectedModel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-navy to-navy/90 text-white p-12 rounded-sm"
        >
          <div className="max-w-3xl">
            <h3 className="font-josefin-sans text-4xl font-thin tracking-widest mb-6">
              {models[selectedModel].name}
            </h3>
            <p className="text-sand text-lg font-montserrat font-light mb-8">
              {models[selectedModel].description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <span className="text-sand font-montserrat font-medium text-sm">
                  RECÁMARAS
                </span>
                <p className="text-4xl font-montserrat font-700 text-white mt-2">
                  {models[selectedModel].beds}
                </p>
              </div>
              <div>
                <span className="text-sand font-montserrat font-medium text-sm">
                  BAÑOS
                </span>
                <p className="text-4xl font-montserrat font-700 text-white mt-2">
                  {models[selectedModel].baths}
                </p>
              </div>
              <div>
                <span className="text-sand font-montserrat font-medium text-sm">
                  TERRAZA
                </span>
                <p className="text-2xl font-montserrat font-700 text-white mt-2">
                  {models[selectedModel].terrace}
                </p>
              </div>
              <div>
                <span className="text-sand font-montserrat font-medium text-sm">
                  TOTAL
                </span>
                <p className="text-2xl font-montserrat font-700 text-white mt-2">
                  {models[selectedModel].total}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <a href="#contacto" className="btn-sand">
                Más Información
              </a>
              <a href="#contacto" className="px-8 py-3 border-2 border-sand text-sand font-montserrat font-medium rounded-sm hover:bg-sand/10 transition-all duration-300">
                Agendar Visita
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
