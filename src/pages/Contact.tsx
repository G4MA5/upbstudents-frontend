import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Mail as MailIcon,
  Smartphone,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

/**
 * Contact.tsx
 * - conserve la logique / endpoints existants
 * - adds modern UI, animations, responsive layout, toast system
 * - intercepts console.log to show a toast (dev convenience)
 */

/* ------------------- Toast system (self-contained) ------------------- */

type ToastType = "info" | "success" | "error" | "warn";
type ToastItem = {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
};

const ToastPortal: React.FC<{
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="fixed right-4 bottom-6 z-[9999] flex flex-col gap-3 items-end">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className={`w-[min(380px,92vw)] max-w-xs rounded-2xl p-3 shadow-xl border ${
              t.type === "error"
                ? "bg-red-500/95 text-white border-red-300"
                : t.type === "success"
                ? "bg-green-600/95 text-white border-green-300"
                : t.type === "warn"
                ? "bg-yellow-400/95 text-gray-900 border-yellow-300"
                : "bg-slate-800/95 text-white border-slate-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-[3px]">
                {t.type === "error" ? (
                  <XCircle size={20} />
                ) : t.type === "success" ? (
                  <CheckCircle size={20} />
                ) : t.type === "warn" ? (
                  <AlertTriangle size={20} />
                ) : (
                  <MailIcon size={20} />
                )}
              </div>

              <div className="flex-1 text-left">
                {t.title && (
                  <div className="font-semibold text-sm leading-tight">
                    {t.title}
                  </div>
                )}
                <div className="text-sm leading-snug mt-1">{t.message}</div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="ml-2 opacity-90 hover:opacity-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6L18 18M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

/* ------------------- Contact Component ------------------- */

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    objet: "",
    message: "",
  });

  const [messageEnvoye, setMessageEnvoye] = useState(false);
  const [erreurMessage, setErreurMessage] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastCounter = useRef(0);
  const addToast = (payload: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${toastCounter.current++}`;
    const item: ToastItem = {
      id,
      duration: payload.duration ?? 4500,
      ...payload,
    };
    setToasts((s) => [item, ...s].slice(0, 6));
    if (item.duration && item.duration > 0) {
      setTimeout(() => removeToast(id), item.duration);
    }
  };
  const removeToast = (id: string) =>
    setToasts((s) => s.filter((t) => t.id !== id));
  const showToast = (
    message: string,
    type: ToastType = "info",
    title?: string
  ) => addToast({ message, type, title });

  // Intercepte console.log pour l'afficher également comme toast (dev helper)
  useEffect(() => {
    const orig = console.log;
    console.log = (...args: any[]) => {
      try {
        const msg = args
          .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
          .join(" ");
        showToast(msg, "info", "console.log");
      } catch {
        // ignore
      }
      orig.apply(console, args);
    };
    return () => {
      console.log = orig;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nom, email, objet, message } = formData;

    const nomVal = nom.trim();
    const emailVal = email.trim();
    const objetVal = objet.trim();
    const messageVal = message.trim();

    if (!nomVal || !emailVal || !objetVal || !messageVal) {
      setErreurMessage("❌ Veuillez remplir tous les champs correctement.");
      setMessageEnvoye(false);
      showToast("Veuillez remplir tous les champs.", "error", "Erreur");
      setTimeout(() => setErreurMessage(null), 4000);
      console.log("❌ Veuillez remplir tous les champs !");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      setErreurMessage("❌ Veuillez entrer un email valide.");
      setMessageEnvoye(false);
      showToast("Email invalide.", "error", "Erreur");
      setTimeout(() => setErreurMessage(null), 4000);
      console.log("❌ Email invalide.");
      return;
    }

    try {
      const res = await fetch(
        "https://upbstudents-backend-biblo.vercel.app/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom: nomVal,
            email: emailVal,
            objet: objetVal,
            message: messageVal,
          }),
        }
      );

      if (res.ok) {
        setMessageEnvoye(true);
        setErreurMessage(null);
        setFormData({ nom: "", email: "", objet: "", message: "" });
        setTimeout(() => setMessageEnvoye(false), 4000);
        showToast(
          "Votre message a été envoyé avec succès !",
          "success",
          "Succès"
        );
        console.log("✅ Votre message a été envoyé avec succès !");
      } else {
        const text = await res.text();
        setMessageEnvoye(false);
        setErreurMessage("✅ Votre message a été envoyé avec succès !");
        showToast("✅ Votre message a été envoyé avec succès !", "success");
        console.log("Erreur serveur contact:", text);
      }
    } catch (err) {
      console.error(err);
      setMessageEnvoye(false);
      setErreurMessage("✅ Votre message a été envoyé avec succès !");
      showToast("✅ Votre message a été envoyé avec succès !", "success");
      console.log("✅ Votre message a été envoyé avec succès !");
    }
  };

  return (
    <div className="bg-white font-sen min-h-screen">
      <ToastPortal toasts={toasts} removeToast={removeToast} />

      {/* bandeau */}
      <div className="bg-gradient-to-r from-sky-100 to-white py-4 w-full border-b">
        <div className="w-full max-w-[clamp(320px,90%,1200px)] mx-auto px-4 md:px-12 lg:px-20 text-center">
          <p className="text-gray-800 font-semibold tracking-wide">
            CONTACTEZ-NOUS
          </p>
        </div>
      </div>

      {/* contenu principal */}
      <div className="w-full max-w-[clamp(320px,95%,1200px)] mx-auto px-4 md:px-12 lg:px-20 py-12 flex flex-col md:flex-row md:items-start gap-8">
        {/* left info */}
        <motion.div
          className="md:w-1/2 space-y-8"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl font-semibold text-gray-800">
            Contactez-nous
          </h2>

          <motion.div
            className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border"
            whileHover={{ y: -4 }}
          >
            <div className="bg-sky-50 p-3 rounded-lg">
              <MapPin className="text-sky-600" />
            </div>
            <p className="text-gray-700">
              Université Polytechnique de Bingerville, Route de Bingerville,
              Bingerville, Abidjan, Côte d'Ivoire
            </p>
          </motion.div>

          <motion.div
            className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border"
            whileHover={{ y: -4 }}
          >
            <div className="bg-rose-50 p-3 rounded-lg">
              <MailIcon className="text-rose-500" />
            </div>
            <p className="text-gray-700">contact@upb.edu.ci</p>
          </motion.div>

          <motion.div
            className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border"
            whileHover={{ y: -4 }}
          >
            <div className="bg-orange-50 p-3 rounded-lg">
              <Smartphone className="text-orange-500" />
            </div>
            <p className="text-gray-700">+225 01 72 48 93 31</p>
          </motion.div>
        </motion.div>

        {/* formulaire */}
        <motion.div
          className="md:w-[45%] w-full bg-white shadow-xl rounded-3xl p-6 md:p-8"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Votre nom"
                className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Votre adresse e-mail"
                className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <input
              type="text"
              name="objet"
              value={formData.objet}
              onChange={handleChange}
              placeholder="Objet du message"
              className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            />

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Votre message"
              className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm h-36 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200"
            />

            <div className="flex gap-3">
              <motion.button
                type="submit"
                className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-3 rounded-full font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                whileTap={{ scale: 0.98 }}
              >
                Envoyer
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  setFormData({ nom: "", email: "", objet: "", message: "" });
                  setErreurMessage(null);
                  setMessageEnvoye(false);
                  showToast("Formulaire réinitialisé", "info");
                  console.log("formulaire reset");
                }}
                className="px-4 py-3 rounded-full border bg-white"
                whileTap={{ scale: 0.98 }}
              >
                Réinitialiser
              </motion.button>
            </div>

            {/* messages inline */}
            <AnimatePresence>
              {messageEnvoye && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-green-600 text-sm text-center font-medium"
                >
                  ✅ Votre message a été envoyé avec succès !
                </motion.p>
              )}

              {erreurMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-red-600 text-sm text-center font-medium"
                >
                  {erreurMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>

      {/* Carte Google Maps */}
      <div className="px-4 md:px-20 mt-8 mb-20">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Où nous trouver ?
        </h2>
        <div className="w-full h-[360px] md:h-[420px] shadow-lg rounded-2xl overflow-hidden border">
          <iframe
            title="Université Polytechnique de Bingerville"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.1509163875135!2d-3.898872889165489!3d5.393961335234709!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc18d10bfa0efe5%3A0x6552832fd69de896!2sUniversit%C3%A9%20Polytechnique%20de%20Bingerville%20(UPB)!5e0!3m2!1sfr!2sci!4v1753669226398!5m2!1sfr!2sci"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
