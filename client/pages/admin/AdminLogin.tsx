import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Eye, EyeOff, RefreshCw, Hand } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  checkAdminEmail,
  sendAdminOtp,
  verifyAdminOtp,
  resetAdminFlow,
  clearAdminError,
} from "@/store/slices/adminSlice";
import { ADMIN_TOKEN_KEY } from "@/store/axiosAdmin";

type Step = "email" | "otp";

export default function AdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, otpSent, adminName, error, admin } = useAppSelector(
    (s) => s.admin,
  );

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (localStorage.getItem(ADMIN_TOKEN_KEY)) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, []);

  useEffect(() => {
    if (admin) navigate("/admin/dashboard", { replace: true });
  }, [admin, navigate]);

  // Advance to OTP step when email is confirmed + OTP sent
  useEffect(() => {
    if (adminName && !otpSent && step === "email") {
      // Email exists → auto-send OTP
      dispatch(sendAdminOtp(email));
    }
    if (otpSent) setStep("otp");
  }, [adminName, otpSent]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAdminError());
    dispatch(checkAdminEmail(email.trim().toLowerCase()));
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAdminError());
    dispatch(verifyAdminOtp({ email, code: otp }));
  };

  const handleBackToEmail = () => {
    dispatch(resetAdminFlow());
    setStep("email");
    setOtp("");
  };

  const handleResendOtp = () => {
    setOtp("");
    dispatch(clearAdminError());
    dispatch(sendAdminOtp(email));
  };

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Left column — branding ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden md:flex md:w-1/2 bg-navy flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
          <svg width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <pattern
                id="admin-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#ff9933"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-grid)" />
          </svg>
        </div>

        {/* Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,153,51,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <img
            src="/images/logo_liv_white.png"
            alt="LIV Capital"
            className="h-12 w-auto"
          />
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div className="w-10 h-[2px] bg-sand mb-8" />
          <h1 className="font-montserrat font-bold text-white text-3xl xl:text-4xl leading-tight mb-6">
            Bienvenido al
            <br />
            <span className="text-sand">Panel Administrativo</span>
          </h1>
          <p className="font-montserrat font-light text-white/50 text-base leading-relaxed max-w-xs">
            Gestiona visitas, contactos y la información del edificio desde un
            solo lugar. Tu trabajo aquí construye experiencias extraordinarias.
          </p>

          <div className="mt-12 space-y-4">
            {[
              "Agenda y visitas en tiempo real",
              "Gestión de contactos y prospectos",
              "Modelos y disponibilidad del edificio",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-sand flex-shrink-0" />
                <span className="text-white/40 font-montserrat text-sm">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/20 font-montserrat text-xs">
          © 2026 LIV Capital — Capital Urbano
        </p>
      </motion.div>

      {/* ── Right column — form ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-stone-light px-6 py-12 md:px-12 min-h-screen md:min-h-0">
        {/* Mobile logo */}
        <div className="md:hidden mb-10">
          <img
            src="/images/logo_liv_color.png"
            alt="LIV Capital"
            className="h-10 w-auto"
          />
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Admin badge */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-navy rounded-sm flex items-center justify-center">
              <Shield className="w-4 h-4 text-sand" />
            </div>
            <span className="font-montserrat text-navy font-semibold text-sm tracking-wide">
              Acceso Administrativo
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key="email-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="font-montserrat font-bold text-navy text-2xl mb-2">
                  Inicia sesión
                </h2>
                <p className="font-montserrat font-light text-stone-gray text-sm mb-8">
                  Ingresa tu correo para continuar. Te enviaremos un código de
                  verificación.
                </p>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block font-montserrat text-xs font-medium text-navy mb-1.5 uppercase tracking-wide">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      placeholder="admin@livcapitalgdl.mx"
                      className="w-full border border-stone-warm rounded-sm px-4 py-3 font-montserrat text-sm text-navy bg-white focus:outline-none focus:border-navy transition-colors placeholder:text-stone-gray/50"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm font-montserrat">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-navy text-white font-montserrat font-medium py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="font-montserrat font-bold text-navy text-2xl mb-2 flex items-center gap-2">
                  {adminName ? (
                    <>
                      Hola, {adminName}
                      <Hand className="w-5 h-5 text-sand" />
                    </>
                  ) : (
                    "Verifica tu identidad"
                  )}
                </h2>
                <p className="font-montserrat font-light text-stone-gray text-sm mb-8">
                  Enviamos un código de 6 dígitos a{" "}
                  <span className="text-navy font-medium">{email}</span>. Revisa
                  tu bandeja de entrada.
                </p>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block font-montserrat text-xs font-medium text-navy mb-1.5 uppercase tracking-wide">
                      Código de verificación
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      required
                      autoFocus
                      placeholder="000000"
                      className="w-full border border-stone-warm rounded-sm px-4 py-3 font-montserrat text-2xl text-center tracking-[0.5em] text-navy bg-white focus:outline-none focus:border-navy transition-colors placeholder:text-stone-gray/30"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm font-montserrat">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-navy text-white font-montserrat font-medium py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Verificar acceso
                        <Shield className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm font-montserrat">
                  <button
                    onClick={handleBackToEmail}
                    className="text-stone-gray hover:text-navy transition-colors"
                  >
                    ← Cambiar correo
                  </button>
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sand hover:text-sand-light transition-colors disabled:opacity-50"
                  >
                    Reenviar código
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
