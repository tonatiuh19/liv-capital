import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="bg-white">
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-light to-white pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-6"
        >
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-montserrat font-extrabold text-navy mb-4">
              404
            </h1>
            <div className="w-16 h-1 bg-sand mx-auto mb-8"></div>
          </div>

          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-navy mb-4">
            Página no encontrada
          </h2>
          <p className="text-lg text-text-secondary font-montserrat font-light max-w-md mx-auto mb-8">
            Parece que esta página no existe. Pero no te preocupes, hay mucho
            por descubrir en LIV CAPITAL.
          </p>

          <Link to="/" className="btn-sand inline-block">
            Volver al Inicio
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
