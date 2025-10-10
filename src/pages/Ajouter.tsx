// Ajouter.tsx
import React, { useEffect, useRef, useState } from "react";
import upbLogo from "../assets/upblogo.png";
import {
  Upload,
  Trash,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import DropdownMenu from "../components/DropdownMenu";
import ProfileModal from "../components/ProfileModal";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

/**
 * Ajouts :
 * - Toast system local (ToastContainer + showToast)
 * - Zone d'upload améliorée + preview filename
 * - Animations framer-motion
 * - font-sen appliqué (assurez-vous d'importer la police Sen dans index.html et tailwind.config.js)
 */

/* --------------------- Toast system (simple, self-contained) --------------------- */

type ToastType = "info" | "success" | "error" | "warn";
type ToastItem = {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  // Rendu via portal pour s'affranchir du z-index de la page
  return createPortal(
    <div className="fixed right-4 bottom-6 z-[9999] flex flex-col gap-3 items-end">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className={`w-[min(380px,92vw)] max-w-xs rounded-2xl p-3 shadow-xl border ${
              t.type === "error"
                ? "bg-red-500/95 text-white border-red-300"
                : t.type === "success"
                ? "bg-green-500/95 text-white border-green-300"
                : t.type === "warn"
                ? "bg-yellow-400/95 text-gray-900 border-yellow-300"
                : "bg-slate-800/95 text-white border-slate-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-[3px]">
                {t.type === "error" ? (
                  <XCircle size={22} />
                ) : t.type === "success" ? (
                  <CheckCircle size={22} />
                ) : t.type === "warn" ? (
                  <AlertTriangle size={22} />
                ) : (
                  <Upload size={22} />
                )}
              </div>
              <div className="flex-1 text-left">
                {t.title && (
                  <div className="font-semibold leading-tight text-sm">
                    {t.title}
                  </div>
                )}
                <div className="text-sm leading-snug mt-1">{t.message}</div>
              </div>

              <button
                aria-label="close"
                onClick={() => removeToast(t.id)}
                className="ml-2 opacity-90 hover:opacity-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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

/* --------------------- Component main --------------------- */

const Ajouter: React.FC = () => {
  const [formData, setFormData] = useState({
    filiere: "",
    session: "",
    annee: "",
    type: "",
    matiere: "",
    password: "",
    niveau: "",
    document: null as File | null,
  });

  // Profile modal if not authenticated
  const [showProfileModal, setShowProfileModal] = useState(false);

  /* Toast state & helper */
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);
  const addToast = (t: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${toastIdRef.current++}`;
    const item: ToastItem = { id, duration: t.duration ?? 5000, ...t };
    setToasts((s) => [item, ...s].slice(0, 6)); // keep small stack
    if (item.duration && item.duration > 0) {
      setTimeout(() => removeToast(id), item.duration);
    }
  };
  const removeToast = (id: string) =>
    setToasts((s) => s.filter((x) => x.id !== id));
  const showToast = (
    message: string,
    type: ToastType = "info",
    title?: string
  ) => addToast({ message, type, title });

  /* Intercepte console.log pour afficher un toast (comme demandé).
     Attention : en dev cela crée beaucoup de toasts si tu log beaucoup.
     Tu peux commenter ce useEffect pour désactiver. */
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

  /* handlers */
  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, document: e.target.files[0] });
      showToast(`Fichier sélectionné: ${e.target.files[0].name}`, "success");
    }
  };

  const removeSelectedFile = () => {
    setFormData({ ...formData, document: null });
    showToast("Fichier retiré", "warn");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validation client
    if (!formData.document) {
      // Remplace alert par toast et console.log redirigé vers toast aussi
      showToast("Veuillez sélectionner un fichier !", "error", "Erreur");
      console.log("❌ Veuillez sélectionner un fichier !");
      return;
    }
    if (
      !formData.filiere ||
      !formData.annee ||
      !formData.type ||
      !formData.matiere ||
      !formData.niveau ||
      !formData.password
    ) {
      showToast("Veuillez remplir tous les champs !", "error", "Erreur");
      console.log("❌ Veuillez remplir tous les champs !");
      return;
    }

    const token = localStorage.getItem("supa_token");
    if (!token) {
      setShowProfileModal(true);
      return;
    }

    try {
      const body = new FormData();
      body.append("filiere", formData.filiere);
      body.append("session", formData.session);
      body.append("annee", formData.annee);
      body.append("type", formData.type);
      body.append("matiere", formData.matiere);
      body.append("password", formData.password);
      body.append("niveau", formData.niveau);
      if (formData.document) body.append("document", formData.document);

      const res = await fetch(
        "https://upbstudents-backend-1u7x.vercel.app/api/document",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        }
      );

      const data = await res.json();

      if (res && data.status === "ok") {
        showToast("Document ajouté avec succès !", "success", "Succès");
        // reset form (conserve structure)
        setFormData({
          filiere: "",
          session: "",
          annee: "",
          type: "",
          matiere: "",
          password: "",
          niveau: "",
          document: null,
        });
        console.log("✅ Document ajouté avec succès !");
      } else {
        // si échec côté server -> ouvrir modal connexion
        setShowProfileModal(true);
        showToast(data?.message || "Erreur serveur. Connectez-vous.", "error");
        console.log("Erreur serveur", data);
      }
    } catch (err) {
      showToast("Une erreur est survenue lors de l'envoi.", "error");
      console.log("❌ Une erreur est survenue : ", err);
    }
  };

  /* animated gradients & layout */
  return (
    <div className="min-h-screen bg-white font-sen">
      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {showProfileModal && (
        <ProfileModal closeModal={() => setShowProfileModal(false)} />
      )}

      {/* top small header */}
      <div className="bg-gradient-to-r from-sky-100 to-white py-4 w-full border-b">
        <div className="w-full max-w-[clamp(320px,90%,1200px)] mx-auto px-4 md:px-12 lg:px-20 text-center">
          <p className="text-2sm text-slate-700 semibold text-center">
            <strong>FORMULAIRE D'ENREGISTREMENT</strong>
          </p>
        </div>
      </div>

      {/* central card */}
      <div className="flex justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[1100px] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-white"
          style={{
            // subtle border gradient
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* LEFT: form */}
          <div className="p-[clamp(18px,2.2vw,48px)] bg-white flex flex-col justify-center">
            {/* logo + heading */}
            <div className="flex flex-col items-center mb-6">
              <motion.img
                src={upbLogo}
                alt="UPB Logo"
                className="w-[clamp(72px,12vw,112px)] h-auto"
                initial={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
              />
              <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-800">
                Le Register
              </h1>
              <p className="text-sm text-slate-500 mt-2 text-center max-w-[520px]">
                Partagez vos ressources pour illuminer la communauté. (rapide,
                sûr et gratuit)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropdownMenu
                  label="Filière"
                  options={[
                    "MIAGE",
                    "ASSRI",
                    "SEA",
                    "SEG",
                    "3EA",
                    "SJAP",
                    "RIT",
                  ]}
                  onSelect={(value) => handleChange("filiere", value)}
                />
                <DropdownMenu
                  label="Type de doc"
                  options={["Examen", "TD", "TP"]}
                  onSelect={(value) => handleChange("type", value)}
                />
                <DropdownMenu
                  label="Session"
                  options={["Session 1", "Session 2"]}
                  onSelect={(value) => handleChange("session", value)}
                  disabled={formData.type === "TD" || formData.type === "TP"}
                />
                <DropdownMenu
                  label="Année"
                  options={["2025", "2024", "2023", "2022"]}
                  onSelect={(value) => handleChange("annee", value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropdownMenu
                  label="Niveau"
                  options={[
                    "Licence 1",
                    "Licence 2",
                    "Licence 3",
                    "Master 1",
                    "Master 2",
                  ]}
                  onSelect={(value) => handleChange("niveau", value)}
                />
                <input
                  type="text"
                  name="matiere"
                  placeholder="Nom matière"
                  value={formData.matiere}
                  onChange={(e) => handleChange("matiere", e.target.value)}
                  className="border rounded-full px-4 py-3 w-full text-sm focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="border rounded-full px-4 py-3 w-full text-sm focus:ring-2 focus:ring-orange-100"
                />

                {/* File control: clickable label */}
                <div className="relative">
                  <label
                    htmlFor="fileinput"
                    className="flex items-center justify-between gap-3 border rounded-full px-4 py-3 cursor-pointer hover:shadow-md bg-gray-50"
                    title="Cliquez pour sélectionner un fichier"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-2">
                        <Upload size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-700 truncate">
                          {formData.document
                            ? formData.document.name
                            : "Ajouter document"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formData.document
                            ? `${(formData.document.size / 1024).toFixed(1)} KB`
                            : "pdf, docx, 20MB max"}
                        </div>
                      </div>
                    </div>

                    {/* actions: remove X if present */}
                    <div className="flex items-center gap-2">
                      {formData.document && (
                        <button
                          type="button"
                          onClick={removeSelectedFile}
                          className="p-2 rounded-full hover:bg-red-50"
                          aria-label="retirer fichier"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>

                    <input
                      id="fileinput"
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-3 rounded-full font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                  whileTap={{ scale: 0.98 }}
                >
                  Valider
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => {
                    setFormData({
                      filiere: "",
                      session: "",
                      annee: "",
                      type: "",
                      matiere: "",
                      password: "",
                      niveau: "",
                      document: null,
                    });
                    showToast("Formulaire réinitialisé", "info");
                  }}
                  className="px-4 py-3 rounded-full border bg-white"
                >
                  Réinitialiser
                </motion.button>
              </div>
            </form>
          </div>

          {/* RIGHT: hero / illustration */}
          <div
            className="hidden md:flex flex-col justify-center items-center p-[clamp(18px,2.2vw,48px)] text-center"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,130,90,0.95) 0%, rgba(255,175,102,0.95) 60%)",
            }}
          >
            <motion.h2 className="text-white font-extrabold text-[clamp(22px,4vw,36px)]">
              BIENVENUE SUR
            </motion.h2>
            <motion.h1
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.06 }}
              className="text-white font-extrabold text-[clamp(30px,5vw,52px)] my-3"
            >
              UPB STUDENT’S
            </motion.h1>
            <motion.p className="text-white/90 max-w-[420px] text-[clamp(13px,2.2vw,18px)]">
              Sur cet espace vous pourrez enregistrer d’autres documents encore
              et encore pour aider les étudiants à se préparer au mieux aux
              examens et TD.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Ajouter;
