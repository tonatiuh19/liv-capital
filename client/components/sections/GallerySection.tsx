import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { X } from "lucide-react";

const gallery = [
  {
    title: "Render Arquitectónico",
    description: "Fachada principal con iluminación nocturna",
    category: "arquitectura",
  },
  {
    title: "Rooftop Garden",
    description: "Área verde con vistas a la ciudad",
    category: "amenidades",
  },
  {
    title: "Lobby Ejecutivo",
    description: "Acceso principal de lujo",
    category: "interiores",
  },
  {
    title: "Gymnasium",
    description: "Área de entrenamiento premium",
    category: "amenidades",
  },
  {
    title: "Departamento Modelo",
    description: "Interior de lujo con acabados premium",
    category: "interiores",
  },
  {
    title: "Terraza Penthouse",
    description: "Espacio exterior exclusivo",
    category: "interiores",
  },
  {
    title: "Wine & Lounge",
    description: "Zona social de elegancia",
    category: "amenidades",
  },
  {
    title: "Coworking",
    description: "Espacios de trabajo colaborativo",
    category: "amenidades",
  },
];

export default function GallerySection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filter, setFilter] = useState("todos");

  const filteredGallery =
    filter === "todos"
      ? gallery
      : gallery.filter((item) => item.category === filter);

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
          <h2 className="section-title mb-4">Galería</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            Explora cada detalle de LIV CAPITAL
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6"></div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {["todos", "arquitectura", "amenidades", "interiores"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-sm font-montserrat font-medium text-sm transition-all duration-300 ${
                filter === cat
                  ? "bg-navy text-white"
                  : "bg-white text-navy border border-navy hover:bg-navy/10"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredGallery.map((item, index) => (
            <motion.div
              key={index}
              layoutId={`gallery-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              onClick={() => setSelectedImage(index)}
              className="group relative overflow-hidden rounded-sm cursor-pointer bg-navy h-64 md:h-80"
            >
              {/* Placeholder Image with Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/80 to-sand/30 group-hover:from-navy/80 transition-all duration-500" />

              {/* Icon placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl text-sand/30 group-hover:text-sand/50 transition-colors duration-300">
                  ◆
                </div>
              </div>

              {/* Overlay with content */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white font-josefin-sans font-thin text-lg tracking-wide mb-2">
                  {item.title}
                </h3>
                <p className="text-sand text-sm font-montserrat font-light">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              layoutId={`gallery-${selectedImage}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video bg-navy rounded-sm overflow-hidden"
            >
              {/* Placeholder image */}
              <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/80 to-sand/30 flex items-center justify-center">
                <div className="text-8xl text-sand/20">◆</div>
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white font-josefin-sans font-thin text-3xl tracking-wide mb-3">
                  {filteredGallery[selectedImage]?.title}
                </h3>
                <p className="text-sand text-lg font-montserrat font-light">
                  {filteredGallery[selectedImage]?.description}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-sm transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
