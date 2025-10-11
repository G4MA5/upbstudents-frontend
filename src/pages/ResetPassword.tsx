import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// ---------------- Toast system ----------------
type ToastType = "info" | "success" | "error";
type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-3 items-end">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`w-[min(350px,90vw)] max-w-xs rounded-xl p-3 shadow-lg flex items-start gap-3 border ${
              t.type === "success"
                ? "bg-green-500 text-white border-green-300"
                : t.type === "error"
                ? "bg-red-500 text-white border-red-300"
                : "bg-blue-500 text-white border-blue-300"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle size={22} />
            ) : t.type === "error" ? (
              <XCircle size={22} />
            ) : (
              <AlertTriangle size={22} />
            )}
            <div className="flex-1 text-sm font-medium">{t.message}</div>
            <button
              className="ml-2 text-white opacity-90 hover:opacity-100"
              onClick={() => removeToast(t.id)}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ---------------- ResetPassword Component ----------------
const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Toast system
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const addToast = (
    message: string,
    type: ToastType = "info",
    duration = 4000
  ) => {
    const id = `${Date.now()}-${toastIdRef.current++}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // Redirect console.log to toast
  useEffect(() => {
    const orig = console.log;
    console.log = (...args: any[]) => {
      const msg = args
        .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
      addToast(msg, "info");
      orig.apply(console, args);
    };
    return () => {
      console.log = orig;
    };
  }, []);

  async function handleReset() {
    if (password !== confirm) {
      addToast("Les mots de passe ne correspondent pas !", "error");
      return;
    }

    const access_token = new URLSearchParams(
      window.location.hash.substring(1)
    ).get("access_token");
    if (!access_token) {
      addToast("Token manquant !", "error");
      return;
    }

    try {
      const res = await fetch(
        "https://upbstudents-backend-biblo.vercel.app/api/reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, new_password: password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        addToast("Mot de passe changé avec succès !", "success");
        setTimeout(() => (window.location.href = "/"), 1500);
      } else {
        addToast("Erreur: " + data.error, "error");
      }
    } catch (err) {
      addToast("Une erreur est survenue !", "error");
      console.log(err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-white p-6 font-sen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Réinitialiser le mot de passe
        </h2>

        <div className="mb-4 relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
          />
          <span
            className="absolute right-4 top-3 cursor-pointer text-gray-500 select-none"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? "X" : "👁"}
          </span>
        </div>

        <div className="mb-6 relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirmer le mot de passe"
            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
          />
          <span
            className="absolute right-4 top-3 cursor-pointer text-gray-500 select-none"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "X" : "👁"}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleReset}
          className="w-full py-3 bg-gradient-to-r from-orange-300 to-orange-400 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition"
        >
          Valider
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
