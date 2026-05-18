import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

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
        {/* Left Side - Video */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex md:w-1/2 relative overflow-hidden bg-navy"
        >
          {/* Video */}
          <video
            src="/videos/master.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Subtle dark overlay so the card stays legible */}
          <div className="absolute inset-0 bg-navy/30" />
        </motion.div>

        {/* Right Side - Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 md:flex-none w-full md:w-1/2 relative z-10 flex flex-col justify-end md:justify-center items-start px-6 md:px-12 lg:px-16 pb-12 md:pb-0 md:py-0"
        >
          {/* Accent line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1 bg-sand mb-5 md:mb-8"
          />

          {/* Category label */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sand font-montserrat font-medium text-sm uppercase tracking-widest mb-4 md:mb-6"
          >
            Vivienda Vertical Luxury
          </motion.span>

          {/* Rotating headline — word-by-word slot machine */}
          <div className="overflow-hidden mb-4 md:mb-6 min-h-[5rem] md:min-h-[8rem] lg:min-h-[9.5rem] flex items-start">
            <AnimatePresence mode="wait">
              <motion.h1
                key={headlineIndex}
                className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white md:text-navy leading-tight flex flex-wrap gap-x-[0.28em] gap-y-1"
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
            className="text-base md:text-lg text-white/80 md:text-text-secondary font-montserrat font-light leading-relaxed mb-6 md:mb-10 max-w-md"
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
            className="flex gap-8 md:gap-12 mb-6 md:mb-10 pb-6 md:pb-10 border-b border-white/20 md:border-stone-warm/30"
          >
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-extrabold text-white md:text-navy">
                8
              </div>
              <p className="text-sm text-white/70 md:text-text-secondary font-montserrat font-light">
                Plantas
              </p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-extrabold text-white md:text-navy">
                125+
              </div>
              <p className="text-sm text-white/70 md:text-text-secondary font-montserrat font-light">
                Departamentos
              </p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-montserrat font-extrabold text-white md:text-navy">
                12
              </div>
              <p className="text-sm text-white/70 md:text-text-secondary font-montserrat font-light">
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
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-navy md:bg-navy md:text-white font-montserrat font-medium rounded-sm hover:opacity-90 transition-all duration-300 group"
            >
              Explorar Modelos
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              to="/agendar-visita"
              className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white md:border-navy md:text-navy font-montserrat font-medium rounded-sm hover:bg-white hover:text-navy md:hover:bg-navy md:hover:text-white transition-all duration-300"
            >
              Agendar Visita
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xs text-white/60 md:text-text-secondary font-montserrat font-light mt-6 md:mt-8"
          >
            Por Capital Urbano • Disponible ahora
          </motion.p>
        </motion.div>
      </div>

      {/* Mobile image background */}
      <div className="absolute inset-0 md:hidden z-0">
        <img
          src="/images/Torre_Kino_Frontal_Peatonal.jpg"
          alt="Torre LIV Capital"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/65 to-navy/25" />
      </div>
    </section>
  );
}
