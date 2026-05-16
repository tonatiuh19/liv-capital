import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useState } from "react";
import { Send, MessageCircle, Phone, Mail, CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitContact, resetContact } from "@/store/slices/contactSlice";

const INTERESTS = [
  { value: "general", label: "Selecciona una opción" },
  { value: "studio", label: "Estudio" },
  { value: "1bed", label: "1 Recámara" },
  { value: "2bed", label: "2 Recámaras" },
  { value: "3bed", label: "3 Recámaras" },
  { value: "penthouse", label: "Penthouse" },
  { value: "investment", label: "Inversión" },
];

export default function ContactSection() {
  const dispatch = useAppDispatch();
  const { submitting, submitted, error } = useAppSelector((s) => s.contact);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    interest: "general",
  });

  // Reset form after successful submission
  useEffect(() => {
    if (submitted) {
      const t = setTimeout(() => {
        dispatch(resetContact());
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          interest: "general",
        });
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [submitted, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(submitContact(formData));
  };

  return (
    <section
      id="contacto"
      className="py-20 md:py-32 px-6 bg-gradient-to-br from-navy to-navy/95"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-white mb-4">
            ¿Listo para vivir mejor?
          </h2>
          <p className="text-lg text-stone-warm font-montserrat font-light">
            Contáctanos hoy y descubre por qué LIV CAPITAL es tu lugar
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Phone */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-sm bg-sand/20 border border-sand/50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-sand" />
              </div>
              <div>
                <h3 className="font-montserrat font-600 text-white mb-1">
                  Teléfono
                </h3>
                <a
                  href="tel:+523312345678"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  +52 (33) 1234 5678
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-sm bg-sand/20 border border-sand/50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-sand" />
              </div>
              <div>
                <h3 className="font-montserrat font-600 text-white mb-1">
                  Email
                </h3>
                <a
                  href="mailto:info@livcapitalgdl.mx"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  info@livcapitalgdl.mx
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-sm bg-sand/20 border border-sand/50 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-sand" />
              </div>
              <div>
                <h3 className="font-montserrat font-600 text-white mb-1">
                  WhatsApp
                </h3>
                <a
                  href="https://wa.me/523312345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-warm hover:text-sand transition-colors font-montserrat text-sm"
                >
                  +52 (33) 1234 5678
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white/10 backdrop-blur border border-white/20 p-8 rounded-sm"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <CheckCircle2 className="w-14 h-14 text-sand mb-4" />
                  <h3 className="font-montserrat font-bold text-white text-xl mb-2">
                    ¡Mensaje enviado!
                  </h3>
                  <p className="font-montserrat text-stone-warm text-sm">
                    Nos pondremos en contacto contigo muy pronto.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-montserrat font-medium text-sand mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-sm text-white placeholder-stone-warm/50 focus:outline-none focus:border-sand transition-colors font-montserrat disabled:opacity-60"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-montserrat font-medium text-sand mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-sm text-white placeholder-stone-warm/50 focus:outline-none focus:border-sand transition-colors font-montserrat disabled:opacity-60"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-montserrat font-medium text-sand mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={submitting}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-sm text-white placeholder-stone-warm/50 focus:outline-none focus:border-sand transition-colors font-montserrat disabled:opacity-60"
                        placeholder="+52 (33) 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-montserrat font-medium text-sand mb-2">
                        Me interesa
                      </label>
                      <select
                        name="interest"
                        value={formData.interest}
                        onChange={handleChange}
                        disabled={submitting}
                        className="w-full px-4 py-3 bg-navy/80 border border-white/20 rounded-sm text-white focus:outline-none focus:border-sand transition-colors font-montserrat disabled:opacity-60 appearance-none"
                      >
                        {INTERESTS.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-navy"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-montserrat font-medium text-sand mb-2">
                      Mensaje
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-sm text-white placeholder-stone-warm/50 focus:outline-none focus:border-sand transition-colors font-montserrat resize-none disabled:opacity-60"
                      placeholder="Cuéntanos más sobre ti y tus intereses"
                    />
                  </div>

                  {error && (
                    <p className="mb-4 text-sm font-montserrat text-red-300 bg-red-500/10 border border-red-400/30 px-4 py-2 rounded-sm">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-8 py-3 bg-sand text-navy font-montserrat font-medium rounded-sm hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        Enviar Mensaje
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gradient-to-r from-sand/10 to-sand/5 border border-sand/30 p-8 md:p-12 rounded-sm text-center"
        >
          <h3 className="text-2xl md:text-3xl font-montserrat font-bold text-white mb-4">
            Agendar una Visita
          </h3>
          <p className="text-stone-warm font-montserrat font-light mb-8 max-w-2xl mx-auto">
            Visita nuestro modelo de muestra y experimenta en persona la calidad
            y lujo de LIV CAPITAL
          </p>
          <a
            href="/agendar-visita"
            className="inline-flex items-center gap-2 px-8 py-3 bg-sand text-navy font-montserrat font-medium rounded-sm hover:bg-opacity-90 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            Agendar una Visita
          </a>
        </motion.div>
      </div>
    </section>
  );
}
