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

export default function Index() {
  const { config } = useAppSelector((s) => s.siteConfig);
  const title =
    (config.site_title as string | undefined) ??
    "Departamentos de lujo en Guadalajara";

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
        <InteriorShowcaseSection />
        <AmenitiesSection />
        <ApartmentModelsSection />
        <GallerySection />
        <LocationSection />
        <QualitySection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
