import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MetaTags from "@/components/seo/MetaTags";
import HeroSection from "@/components/sections/HeroSection";
import ProjectOverviewSection from "@/components/sections/ProjectOverviewSection";
import ArchitecturalDetailsSection from "@/components/sections/ArchitecturalDetailsSection";
import InteriorShowcaseSection from "@/components/sections/InteriorShowcaseSection";
import AmenitiesSection from "@/components/sections/AmenitiesSection";
import ApartmentModelsSection from "@/components/sections/ApartmentModelsSection";
import GallerySection from "@/components/sections/GallerySection";
import LocationSection from "@/components/sections/LocationSection";
import QualitySection from "@/components/sections/QualitySection";
import ContactSection from "@/components/sections/ContactSection";
import { useAppSelector } from "@/store/hooks";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";

export default function Index() {
  const { config } = useAppSelector((s) => s.siteConfig);
  const title =
    (config.site_title as string | undefined) ??
    "Departamentos de lujo en Guadalajara";
  const [waBubbleHovered, setWaBubbleHovered] = useState(false);

  return (
    <div className="bg-white">
      <MetaTags
        title={title}
        description="LIV Capital — Arquitectura urbana contemporánea en Guadalajara. Descubre departamentos de alto nivel con amenidades exclusivas."
        keywords="departamentos Guadalajara, lujo, LIV Capital, Capital Urbano, bienes raíces"
      />
      <Header />

      <main className="pt-16">
        <HeroSection />
        <ProjectOverviewSection />
        <ArchitecturalDetailsSection />
        <AmenitiesSection />
        {/* <InteriorShowcaseSection /> */}
        <GallerySection />
        <ApartmentModelsSection />
        <LocationSection />
        <QualitySection />
        <ContactSection />
      </main>

      <Footer />

      {/* Floating WhatsApp bubble */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex items-center justify-end"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 18 }}
        onMouseEnter={() => setWaBubbleHovered(true)}
        onMouseLeave={() => setWaBubbleHovered(false)}
      >
        {/* Tooltip label */}
        <motion.span
          animate={{
            opacity: waBubbleHovered ? 1 : 0,
            x: waBubbleHovered ? 0 : 10,
            scale: waBubbleHovered ? 1 : 0.9,
          }}
          transition={{ duration: 0.2 }}
          className="mr-3 px-3 py-1.5 bg-white text-[#25D366] font-montserrat font-semibold text-xs rounded-full shadow-md pointer-events-none select-none whitespace-nowrap"
        >
          ¡Escríbenos!
        </motion.span>

        {/* Bubble wrapper — group for tooltip */}
        <motion.a
          href="https://wa.me/523312345678"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contáctanos por WhatsApp"
          className="group relative w-14 h-14 flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          {/* Pulsing ring 1 */}
          <motion.span
            className="absolute inset-0 rounded-full bg-[#25D366]"
            animate={{ scale: [1, 1.55], opacity: [0.35, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          {/* Pulsing ring 2 — offset so they alternate */}
          <motion.span
            className="absolute inset-0 rounded-full bg-[#25D366]"
            animate={{ scale: [1, 1.55], opacity: [0.2, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.6,
            }}
          />

          {/* Main button */}
          <motion.div
            className="relative w-14 h-14 bg-[#25D366] rounded-full shadow-xl flex items-center justify-center cursor-pointer"
            whileHover={{
              scale: 1.12,
              boxShadow: "0 8px 30px rgba(37,211,102,0.55)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <motion.div
              whileHover={{ rotate: [0, -12, 12, -8, 0] }}
              transition={{ duration: 0.5 }}
            >
              <FaWhatsapp className="w-7 h-7 text-white" />
            </motion.div>
          </motion.div>
        </motion.a>
      </motion.div>
    </div>
  );
}
