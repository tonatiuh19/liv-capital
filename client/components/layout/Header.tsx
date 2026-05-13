import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-warm/30"
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <img
            src="/images/logo_liv_color.png"
            alt="LIV Capital"
            className="h-20 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="nav-link">
            Inicio
          </Link>
          <a href="#proyecto" className="nav-link">
            El Proyecto
          </a>
          <a href="#amenidades" className="nav-link">
            Amenidades
          </a>
          <a href="#modelos" className="nav-link">
            Modelos
          </a>
          <a href="#ubicacion" className="nav-link">
            Ubicación
          </a>
          <a href="#contacto" className="nav-link">
            Contacto
          </a>
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link to="/agendar-visita" className="btn-sand text-sm">
            Agendar Visita
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-stone-light rounded-sm transition-colors"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-navy" />
          ) : (
            <Menu className="w-6 h-6 text-navy" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white border-t border-stone-warm/30"
        >
          <div className="px-6 py-4 space-y-4">
            <Link
              to="/"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <a
              href="#proyecto"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              El Proyecto
            </a>
            <a
              href="#amenidades"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Amenidades
            </a>
            <a
              href="#modelos"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Modelos
            </a>
            <a
              href="#ubicacion"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Ubicación
            </a>
            <a
              href="#contacto"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </a>
            <Link
              to="/agendar-visita"
              className="block btn-sand text-sm w-full text-center"
              onClick={() => setIsOpen(false)}
            >
              Agendar Visita
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
