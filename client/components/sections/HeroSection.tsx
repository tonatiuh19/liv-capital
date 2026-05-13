import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

const headlines = [
  "Diseñado para vivir mejor.",
  "Arquitectura urbana contemporánea.",
  "El lugar ideal para comenzar.",
  "Espacios que elevan tu estilo de vida.",
];

const wordVariants = {
  initial: { y: "105%", opacity: 0 },
  animate: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.55,
      ease: [0.33, 1, 0.68, 1] as [number, number, number, number],
      delay: i * 0.07,
    },
  }),
  exit: (i: number) => ({
    y: "-105%",
    opacity: 0,
    transition: {
      duration: 0.35,
      ease: [0.32, 0, 0.67, 0] as [number, number, number, number],
      delay: i * 0.04,
    },
  }),
};

export default function HeroSection() {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white">
      <div className="h-full flex flex-col md:flex-row">
        {/* Left Side - Image/Visual */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex md:w-1/2 relative overflow-hidden"
        >
          {/* Architectural gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-sand/20" />

          {/* Decorative architectural elements */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            preserveAspectRatio="none"
          >
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
                  stroke="#D9B99B"
                  strokeWidth="0.5"
                />
              </pattern>
              <linearGradient
                id="accentGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#D9B99B" />
                <stop offset="100%" stopColor="#D9B99B" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid pattern */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Geometric shapes */}
            <circle
              cx="20%"
              cy="30%"
              r="150"
              fill="none"
              stroke="url(#accentGrad)"
              strokeWidth="2"
              opacity="0.4"
            />
            <circle
              cx="80%"
              cy="70%"
              r="200"
              fill="none"
              stroke="url(#accentGrad)"
              strokeWidth="2"
              opacity="0.3"
            />
            <rect
              x="15%"
              y="15%"
              width="60%"
              height="60%"
              fill="none"
              stroke="#D9B99B"
              strokeWidth="1.5"
              opacity="0.5"
            />
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="100%"
              stroke="url(#accentGrad)"
              strokeWidth="1"
              opacity="0.3"
            />
          </svg>

          {/* Floating card accent */}
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-12 left-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm p-8 md:p-6 lg:p-8 z-10"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-montserrat font-extrabold text-sand mb-2">
                125+
              </div>
              <p className="text-white font-montserrat font-light text-sm">
                Unidades de lujo disponibles
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full md:w-1/2 flex flex-col justify-center items-start px-6 md:px-12 lg:px-16 py-20 md:py-0"
        >
          {/* Accent line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1 bg-sand mb-8"
          />

          {/* Category label */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sand font-montserrat font-medium text-sm uppercase tracking-widest mb-6"
          >
            Vivienda Vertical Luxury
          </motion.span>

          {/* Rotating headline — word-by-word slot machine */}
          <div className="overflow-hidden mb-6 min-h-[7rem] md:min-h-[8rem] lg:min-h-[9.5rem] flex items-start">
            <AnimatePresence mode="wait">
              <motion.h1
                key={headlineIndex}
                className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-navy leading-tight flex flex-wrap gap-x-[0.28em] gap-y-1"
              >
                {headlines[headlineIndex].split(" ").map((word, i) => (
                  <span
                    key={`${headlineIndex}-${i}`}
                    className="overflow-hidden inline-block"
                  >
                    <motion.span
                      className="inline-block"
                      custom={i}
                      variants={wordVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-lg text-text-secondary font-montserrat font-light leading-relaxed mb-10 max-w-md"
          >
            Ubicado en el corazón de Guadalajara, LIV CAPITAL redefine la
            vivienda urbana de lujo con arquitectura contemporánea y espacios
            inteligentes.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex gap-8 md:gap-12 mb-10 pb-10 border-b border-stone-warm/30"
          >
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-extrabold text-navy">
                8
              </div>
              <p className="text-sm text-text-secondary font-montserrat font-light">
                Plantas
              </p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-extrabold text-navy">
                125+
              </div>
              <p className="text-sm text-text-secondary font-montserrat font-light">
                Departamentos
              </p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-extrabold text-navy">
                12
              </div>
              <p className="text-sm text-text-secondary font-montserrat font-light">
                Amenidades
              </p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <a
              href="#modelos"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-navy text-white font-montserrat font-medium rounded-sm hover:bg-opacity-90 transition-all duration-300 group"
            >
              Explorar Modelos
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#contacto"
              className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-navy text-navy font-montserrat font-medium rounded-sm hover:bg-navy hover:text-white transition-all duration-300"
            >
              Agendar Visita
            </a>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xs text-text-secondary font-montserrat font-light mt-8"
          >
            Por Capital Urbano • Disponible ahora
          </motion.p>
        </motion.div>
      </div>

      {/* Mobile image overlay */}
      <div className="absolute inset-0 md:hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/20 to-white" />
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="gridMobile"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#D9B99B"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridMobile)" />
        </svg>
      </div>
    </section>
  );
}
