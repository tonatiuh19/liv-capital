import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { Instagram, X, Eye, EyeOff } from "lucide-react";
import type { SiteConfig } from "@/components/SiteGate";

// ─── Animation variants ───────────────────────────────────────────────────────

const letterVariants = {
  initial: { y: "110%", opacity: 0 },
  animate: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.65,
      ease: [0.33, 1, 0.68, 1] as [number, number, number, number],
      delay: 0.2 + i * 0.045,
    },
  }),
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.33, 1, 0.68, 1] as [number, number, number, number],
      delay,
    },
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  config: SiteConfig;
  onBypass: (token: string) => void;
}

export default function UnderConstruction({ config, onBypass }: Props) {
  const instagramUrl = (config.instagram_url as string) ?? "";
  const whatsappNumber = (config.whatsapp_number as string) ?? "";

  // Hidden 3-click password modal trigger
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdState, setPwdState] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  const handleLogoClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      setShowModal(true);
    } else {
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 1800);
    }
  };

  const handleBypassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdState("loading");
    try {
      const res = await fetch("/api/bypass.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });
      const data = await res.json();
      if (data.valid && data.token) {
        onBypass(data.token);
      } else {
        setPwdState("error");
      }
    } catch {
      setPwdState("error");
    }
  };

  const LETTERS = "LIV CAPITAL".split("");

  return (
    <div className="relative min-h-screen bg-navy overflow-hidden flex flex-col select-none">
      {/* ── Animated background grid ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full opacity-[0.07]"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="uc-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#ff9933"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#uc-grid)" />
        </svg>

        {/* Glow orb */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, #ff993322 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Top logo (hidden 3-click trigger) ────────────────────────────── */}
      <div className="relative z-10 pt-8 flex justify-center">
        <button
          onClick={handleLogoClick}
          className="opacity-60 hover:opacity-90 transition-opacity focus:outline-none"
          aria-label="LIV CAPITAL"
        >
          <img
            src="/images/logo_liv_white.png"
            alt="LIV Capital"
            className="h-20 w-auto"
          />
        </button>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Sand accent line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 48, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="h-[2px] bg-sand mb-7"
        />

        {/* PRÓXIMAMENTE label */}
        <motion.p
          {...fadeUp(0.15)}
          className="font-montserrat text-sand text-[11px] sm:text-xs uppercase tracking-[0.3em] mb-6"
        >
          Próximamente
        </motion.p>

        {/* LIV CAPITAL — letter-by-letter slot reveal */}
        <h1 className="flex flex-wrap justify-center gap-0 mb-2">
          {LETTERS.map((letter, i) =>
            letter === " " ? (
              <span key={i} className="w-3 sm:w-5" />
            ) : (
              <span key={i} className="overflow-hidden inline-block">
                <motion.span
                  className="inline-block font-montserrat font-extrabold text-white text-5xl sm:text-7xl lg:text-8xl leading-none tracking-tight"
                  custom={i}
                  variants={letterVariants}
                  initial="initial"
                  animate="animate"
                >
                  {letter}
                </motion.span>
              </span>
            ),
          )}
        </h1>

        {/* Tagline */}
        <motion.p
          {...fadeUp(0.7)}
          className="font-montserrat font-light text-white/50 text-sm sm:text-base mt-4 mb-16 tracking-wide"
        >
          Vivienda Vertical Luxury — Guadalajara, Jalisco
        </motion.p>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <motion.div
        {...fadeUp(1.2)}
        className="relative z-10 pb-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-xs font-montserrat"
      >
        <span>© {new Date().getFullYear()} LIV CAPITAL — Capital Urbano</span>
        <div className="flex items-center gap-4">
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sand transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sand transition-colors text-xs uppercase tracking-wider"
            >
              WhatsApp
            </a>
          )}
        </div>
      </motion.div>

      {/* ── Bypass password modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setPwdState("idle");
                setPassword("");
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
              className="bg-navy border border-white/10 p-8 w-full max-w-sm relative"
            >
              <button
                onClick={() => {
                  setShowModal(false);
                  setPwdState("idle");
                  setPassword("");
                }}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6">
                <h2 className="font-montserrat font-bold text-white text-base mb-1">
                  Acceso
                </h2>
                <p className="font-montserrat text-white/40 text-xs">
                  Ingresa tu clave de acceso
                </p>
              </div>

              <form
                onSubmit={handleBypassSubmit}
                className="flex flex-col gap-4"
              >
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPwdState("idle");
                    }}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 pr-10 text-white text-sm font-montserrat placeholder:text-white/20 focus:outline-none focus:border-sand/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    aria-label={showPwd ? "Ocultar" : "Mostrar"}
                  >
                    {showPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {pwdState === "error" && (
                  <p className="text-red-400 text-xs font-montserrat -mt-2">
                    Clave incorrecta
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pwdState === "loading" || !password}
                  className="w-full bg-sand text-navy font-montserrat font-semibold text-sm py-3 hover:bg-sand-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {pwdState === "loading" ? (
                    <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
