import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLocked, BYPASS_KEY } from "@/store/slices/siteConfigSlice";

export default function Footer() {
  const dispatch = useAppDispatch();
  const { config } = useAppSelector((s) => s.siteConfig);
  const [clicks, setClicks] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoClick() {
    if (!config.under_construction) return;
    const next = clicks + 1;
    setClicks(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (next >= 3) {
      setClicks(0);
      localStorage.removeItem(BYPASS_KEY);
      dispatch(setLocked());
      return;
    }
    timerRef.current = setTimeout(() => setClicks(0), 1500);
  }
  return (
    <footer className="bg-navy text-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div
              className="mb-4 cursor-default select-none"
              onClick={handleLogoClick}
            >
              <img
                src="/images/logo_liv_white.png"
                alt="LIV Capital"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-stone-warm text-sm font-montserrat font-light">
              Arquitectura urbana contemporánea
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-montserrat font-600 text-sand mb-4">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#proyecto"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  El Proyecto
                </a>
              </li>
              <li>
                <a
                  href="#amenidades"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  Amenidades
                </a>
              </li>
              <li>
                <a
                  href="#modelos"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  Modelos
                </a>
              </li>
              <li>
                <a
                  href="#ubicacion"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  Ubicación
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-montserrat font-600 text-sand mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-sand flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+523312345678"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  +52 (33) 1234 5678
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sand flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:info@livcapitalgdl.mx"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  info@livcapitalgdl.mx
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sand flex-shrink-0 mt-0.5" />
                <span className="text-stone-warm font-montserrat text-sm">
                  Guadalajara, Jalisco
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-montserrat font-600 text-sand mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  Privacidad
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  Términos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  Aviso de Privacidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-warm/20 pt-8">
          <p className="text-center text-stone-warm text-sm font-montserrat font-light">
            © 2024 LIV CAPITAL por Capital Urbano. Todos los derechos
            reservados.
          </p>
          <div className="text-center mt-3">
            <Link
              to="/admin/login"
              className="text-white/10 hover:text-white/20 text-xs font-montserrat transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
