import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X, Mail, LogIn, UserPlus } from "lucide-react";

// NOTE: Pour que la police 'Sen' fonctionne, vous devez vous assurer qu'elle est chargée
// dans votre document HTML. Ajoutez cette ligne dans la balise <head> :
// <link href="https://fonts.googleapis.com/css2?family=Sen:wght@400..800&display=swap" rel="stylesheet" />

// ----------------------------------------------------------------------
// COMPOSANT: ForgotPasswordModal - Modale de Mot de Passe Oublié
// ----------------------------------------------------------------------
interface ForgotModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ForgotPasswordModal: React.FC<ForgotModalProps> = ({
  isOpen,
  closeModal,
}) => {
  const [forgotEmail, setForgotEmail] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [isSent, setIsSent] = useState(false);

  // Fonction utilitaire pour afficher les messages professionnels
  const displayAlert = (message: string) => {
    setAlertMsg(message);
    setTimeout(() => setAlertMsg(""), 10000); // Masquer après 6 secondes
  };

  // Gère la soumission du formulaire de mot de passe oublié (Utilise un vrai appel fetch)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSent) return;

    // 1. Initialiser l'état d'envoi et le message de chargement
    displayAlert("Envoi du lien en cours...");
    setIsSent(true);

    try {
      // NOTE: Remplacer par la logique d'appel API réelle
      const res = await fetch(
        "https://upbstudents-backend-6.vercel.app/api/forgot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Succès: afficher le message positif
        displayAlert(
          "Un lien de réinitialisation sécurisé a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception !"
        );
        // Laisse isSent à true pour désactiver le bouton après le succès
      } else {
        // Échec côté serveur (4xx, 5xx)
        displayAlert(
          "Erreur : " +
            (data.error ||
              data.message ||
              "Email introuvable ou service indisponible.")
        ); // false pour ne pas confondre avec un succès de chargement, mais c'est une erreur logique
        setIsSent(false); // Permettre une nouvelle tentative
      }
    } catch (err) {
      // Erreur réseau/fetch (serveur non atteint)
      console.error("Forgot Password API Error:", err);
      displayAlert(
        "Erreur réseau : Impossible d'atteindre le service de réinitialisation. Réessayez plus tard."
      );
      setIsSent(false); // Permettre une nouvelle tentative
    }
  };

  // Fermer et réinitialiser l'état de la modale
  const handleClose = () => {
    setForgotEmail("");
    setAlertMsg("");
    setIsSent(false);
    closeModal();
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Overlay doux pour l'arrière-plan */}
      <div
        className="fixed inset-0 backdrop-blur-sm z-[130] transition-opacity duration-300 font-['Sen']"
        onClick={handleClose}
      ></div>

      {/* Wrapper de centrage absolu pour la modale */}
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 pointer-events-none">
        {/* Contenu de la modale */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 10 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-[90%] max-w-sm bg-white rounded-3xl shadow-2xl shadow-orange-300/50 p-8 flex flex-col items-center font-['Sen'] border border-gray-100"
            >
              {/* Bouton de fermeture élégant */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={handleClose}
              >
                <X size={24} strokeWidth={2.5} />
              </button>

              {/* En-tête Magique */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Mail size={48} className="text-red-500 mb-4 drop-shadow-md" />
              </motion.div>

              <h2 className="text-2xl font-extrabold text-gray-800 mb-2 text-center">
                Mot de passe oublié
              </h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>

              {/* Message d'alerte animé */}
              <AnimatePresence>
                {alertMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-4 w-full px-4 py-3 rounded-xl text-center font-semibold overflow-hidden transition-all duration-300 ${
                      isSent
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    } shadow-inner`}
                  >
                    {alertMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulaire de réinitialisation */}
              <form onSubmit={handleForgotSubmit} className="w-full space-y-5">
                <input
                  type="email"
                  placeholder="Votre adresse e-mail"
                  className="w-full px-4 py-3 border border-gray-200 rounded-full text-gray-700 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 shadow-sm disabled:opacity-60"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  disabled={isSent}
                />

                <motion.button
                  type="submit"
                  className={`w-full py-3 text-white font-bold rounded-full shadow-lg transition-all duration-300 ${
                    isSent
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 shadow-red-400/50"
                  }`}
                  whileHover={!isSent ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!isSent ? { scale: 0.98 } : {}}
                  disabled={isSent}
                >
                  {isSent ? "Lien Envoyé !" : "Réinitialiser le mot de passe"}
                </motion.button>
              </form>

              {/* Lien de retour */}
              <button
                className="mt-4 text-sm font-medium text-gray-500 hover:text-blue-500 transition"
                onClick={handleClose}
              >
                ← Retour à la connexion
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

// ----------------------------------------------------------------------
// COMPOSANT: AnimatedDropdown (Élément de UI)
// ----------------------------------------------------------------------

interface AnimatedDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((p) => !p);
  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full text-left font-['Sen']">
      <motion.button
        type="button"
        onClick={toggleDropdown}
        className="w-full px-4 py-3 border border-gray-200 rounded-full bg-white text-gray-700 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all duration-200"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span
          className={`truncate font-medium ${
            !value ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {value || label}
        </span>
        <motion.svg
          className={`h-5 w-5 text-gray-500`}
          viewBox="0 0 20 20"
          fill="none"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path
            d="M5 8L10 13L15 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-52 overflow-auto py-1"
          >
            {options.map((opt) => (
              <motion.li
                key={opt}
                onClick={() => handleSelect(opt)}
                className="px-4 py-3 hover:bg-blue-50 text-gray-700 cursor-pointer text-sm transition-colors duration-150 rounded-lg mx-1 my-0.5"
                whileHover={{ backgroundColor: "#fcd34d", color: "white" }}
                transition={{ duration: 0.15 }}
              >
                {opt}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// ----------------------------------------------------------------------
// COMPOSANT: ProfileModal (Modale d'identification principale)
// ----------------------------------------------------------------------

interface Props {
  closeModal: () => void;
}

const ProfileModal: React.FC<Props> = ({ closeModal }) => {
  const [activeView, setActiveView] = useState<"cards" | "login" | "signup">(
    "cards"
  );

  // login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Modale Mot de passe oublié
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // signup form state
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [niveau, setNiveau] = useState("");
  const [filiere, setFiliere] = useState("");
  const [numero, setNumero] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [alertMsg, setAlertMsg] = useState("");
  const [isError, setIsError] = useState(false); // Pour différencier succès et erreur
  const [passwordError, setPasswordError] = useState("");

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-full text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-200 shadow-sm";

  // Remplacement de alert() et des console.log() par la gestion d'état de l'alerte
  const displayAlert = (message: string, isErr: boolean = false) => {
    setAlertMsg(message);
    setIsError(isErr);
    // Masquer l'alerte après 6 secondes
    setTimeout(() => setAlertMsg(""), 6000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    displayAlert("Tentative de connexion en cours...", false);

    const longinData = { email: loginEmail, password: loginPassword };

    try {
      // Le back est conservé tel quel (fetch vers API)
      const res = await fetch(
        "https://upbstudents-backend.vercel.app/api/connexion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(longinData),
        }
      );
      const data = await res.json();

      if (data.user) {
        localStorage.setItem("supa_token", data.token);
        displayAlert(
          `Bienvenue, ${data.user.email} ! Connexion réussie.`,
          false
        );
        // Fermer la modale après un court délai
        setTimeout(() => closeModal(), 1800);
      } else {
        displayAlert(
          "Erreur de connexion : " +
            (data.message || "Email ou mot de passe incorrect."),
          true
        );
      }
    } catch (err) {
      console.error("Erreur de l'API de connexion :", err);
      displayAlert(
        "Erreur de connexion : Impossible d'atteindre le serveur.",
        true
      );
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    } else setPasswordError("");

    displayAlert("Inscription en cours...", false);

    const signupData = {
      nom,
      prenom,
      niveau,
      filiere,
      numero,
      email: signupEmail,
      password: signupPassword,
    };

    try {
      // Le back est conservé tel quel (fetch vers API)
      const res = await fetch(
        "https://upbstudents-backend.vercel.app/api/inscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupData),
        }
      );
      const data = await res.json();

      if (data.status === "ok") {
        displayAlert(
          "Compte créé ! Un e-mail de confirmation a été envoyé. Veuillez le vérifier avant de vous connecter.",
          false
        );
        // Après succès, rediriger vers la vue de connexion
        setTimeout(() => {
          setAlertMsg("");
          setActiveView("login");
        }, 5000);
      } else {
        displayAlert(
          "Erreur d'inscription : " +
            (data.message || "Une erreur est survenue."),
          true
        );
      }
    } catch (err) {
      console.error("Erreur de l'API d'inscription :", err);
      displayAlert(
        "Erreur d'inscription : Impossible d'atteindre le serveur.",
        true
      );
    }
  };

  return (
    <>
      {/* Overlay: Couleur Bleu Ciel pour l'effet 'Soft' */}
      <div
        className="fixed inset-0 bg-blue-500/10 backdrop-blur-sm z-[110]"
        onClick={closeModal}
      ></div>

      {/* Wrapper full-screen flex to center the modal without conflicting transforms */}
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 pointer-events-none font-['Sen']">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          // Enhanced responsiveness: wider on large screens, ensuring maximum utility
          className="pointer-events-auto w-[100%] sm:w-[95%] md:w-[90%] max-w-lg md:max-w-3xl min-h-[280px] sm:min-h-[300px] md:min-h-[320px] max-h-[92vh] md:max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-3xl shadow-orange-300/30 p-6 md:p-10 flex flex-col font-['Sen']"
        >
          {/* Bouton de fermeture élégant */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-lg transition-colors"
            onClick={closeModal}
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          {/* Message d'alerte animé professionnel */}
          <AnimatePresence>
            {alertMsg && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 px-4 py-3 rounded-xl text-center font-bold transition-all duration-300 shadow-md ${
                  isError
                    ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-green-100 text-green-700 border-green-300"
                } border`}
              >
                {alertMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-800 tracking-tight">
            {activeView === "cards"
              ? "Bienvenue à l'UPB Bibliothèque"
              : activeView === "login"
              ? "Connexion"
              : "Créer un Compte Étudiant"}
          </h2>
          <p className="text-md text-center text-gray-500 mb-6 md:mb-10 max-w-md mx-auto">
            {activeView === "cards"
              ? "Votre portail d'accès aux ressources académiques de l'Université."
              : activeView === "login"
              ? "Connectez-vous pour reprendre vos recherches et gérer vos emprunts."
              : "Rejoignez la communauté en quelques étapes simples et rapides."}
          </p>

          {/* CONTENU PRINCIPAL AVEC TRANSITION */}
          <AnimatePresence mode="wait">
            {/* CARDS (Choix Initial) */}
            {activeView === "cards" && (
              <motion.div
                key="cards"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex-grow"
              >
                {/* Conteneur swipe horizontal sur mobile et grille sur desktop */}
                <div
                  className="flex md:grid md:grid-cols-2 gap-5 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory"
                  style={{
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none", // IE / Edge
                  }}
                >
                  <style>
                    {`
          div::-webkit-scrollbar { display: none; }

          /* ✅ Hover desktop uniquement */
          @media (hover: hover) and (pointer: fine) {
            .card-hover-orange:hover {
              transform: scale(1.05);
              box-shadow: 0 12px 28px rgba(251, 146, 60, 0.45);
            }
            .card-hover-blue:hover {
              transform: scale(1.05);
              box-shadow: 0 12px 28px rgba(96, 165, 250, 0.45);
            }
          }

          .card-hover-orange, .card-hover-blue {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
        `}
                  </style>

                  {/* Carte Connexion (orange) */}
                  <motion.div
                    className="card-hover-orange flex-shrink-0 w-[100%] md:w-full bg-orange-50 rounded-3xl p-6 md:p-8 flex flex-col justify-between border-2 border-orange-200 h-full min-h-[220px] snap-start"
                    whileTap={{ scale: 0.97 }}
                  >
                    <div>
                      <LogIn
                        size={40}
                        className="text-orange-500 mb-3 mx-auto drop-shadow-sm"
                      />
                      <h3 className="text-xl font-extrabold mb-2 text-center text-orange-700">
                        J'ai déjà un compte
                      </h3>
                      <p className="text-sm text-gray-600 text-center mb-6">
                        Accédez rapidement à votre espace personnel.
                      </p>
                    </div>
                    <motion.button
                      className="w-full py-3 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                      onClick={() => setActiveView("login")}
                      whileTap={{ scale: 0.97 }}
                    >
                      Se connecter
                    </motion.button>
                  </motion.div>

                  {/* Carte Inscription (bleue) */}
                  <motion.div
                    className="card-hover-blue flex-shrink-0 w-[100%] md:w-full bg-blue-50 rounded-3xl p-6 md:p-8 flex flex-col justify-between border-2 border-blue-200 h-full min-h-[220px] snap-start"
                    whileTap={{ scale: 0.97 }}
                  >
                    <div>
                      <UserPlus
                        size={40}
                        className="text-blue-500 mb-3 mx-auto drop-shadow-sm"
                      />
                      <h3 className="text-xl font-extrabold mb-2 text-center text-blue-700">
                        Nouveau à l'UPB ?
                      </h3>
                      <p className="text-sm text-gray-600 text-center mb-6">
                        Créez votre compte étudiant en quelques clics.
                      </p>
                    </div>
                    <motion.button
                      className="w-full py-3 bg-blue-500 text-white font-bold rounded-full shadow-xl shadow-blue-300/50 hover:bg-blue-600 transition-all"
                      onClick={() => setActiveView("signup")}
                      whileTap={{ scale: 0.97 }}
                    >
                      Créer mon compte
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* LOGIN */}
            {activeView === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col space-y-5 md:space-y-6 w-full max-w-md mx-auto"
                onSubmit={handleLoginSubmit}
              >
                {/* Champ Email */}
                <input
                  type="email"
                  placeholder="Adresse e-mail"
                  className={inputClass}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value.toLowerCase())}
                  required
                />

                {/* Champ Mot de passe avec toggle */}
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    className={inputClass}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <motion.button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showLoginPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </motion.button>
                </div>

                {/* Lien Mot de passe oublié (Rouge/Orange pour alerte/action) */}
                <p
                  className="text-right text-sm text-red-500 font-semibold hover:text-red-600 cursor-pointer transition-colors"
                  onClick={() => setIsForgotModalOpen(true)}
                >
                  Mot de passe oublié ?
                </p>

                {/* Bouton Se connecter */}
                <motion.button
                  type="submit"
                  className="w-full py-3 bg-orange-500 text-white font-bold rounded-full shadow-xl shadow-orange-300/50 hover:bg-orange-600 transition-all"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Se connecter
                </motion.button>

                {/* Lien vers inscription */}
                <p className="text-center text-sm md:text-base text-gray-500">
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    className="text-blue-500 font-bold hover:underline transition-colors"
                    onClick={() => setActiveView("signup")}
                  >
                    Créer mon compte
                  </button>
                </p>
              </motion.form>
            )}

            {/* SIGNUP */}
            {activeView === "signup" && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col font-sen space-y-4lex flex-col space-y-4 max-w-lg mx-auto w-full"
                onSubmit={handleSignupSubmit}
              >
                {/* Nom et Prénom */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nom"
                    className={inputClass}
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    className={inputClass}
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                  />
                </div>

                {/* Niveau et Filière */}
                <div className="grid grid-cols-2 gap-3">
                  <AnimatedDropdown
                    label="Niveau"
                    options={["Licence 1", "Licence 2", "Licence 3"]}
                    value={niveau}
                    onChange={setNiveau}
                  />
                  <AnimatedDropdown
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
                    value={filiere}
                    onChange={setFiliere}
                  />
                </div>

                {/* Email et Numéro */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Email"
                    className={inputClass}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Numéro ex: 0612345678"
                    className={inputClass}
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                {/* Mot de passe */}
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    className={inputClass}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                  <motion.button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showSignupPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </motion.button>
                </div>

                {/* Confirmer mot de passe */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmer Mot de passe"
                    className={inputClass}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <motion.button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </motion.button>
                </div>

                {passwordError && (
                  <div className="text-red-500 text-sm text-center font-medium -mt-2">
                    {passwordError}
                  </div>
                )}

                {/* Bouton Créer compte */}
                <motion.button
                  type="submit"
                  className="w-full py-3 bg-blue-500 text-white font-bold rounded-full shadow-xl shadow-blue-300/50 hover:bg-blue-600 transition-all"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Créer mon compte étudiant
                </motion.button>

                {/* Lien vers login */}
                <p className="text-center text-sm text-gray-500">
                  Déjà inscrit ?{" "}
                  <button
                    type="button"
                    className="text-orange-500 font-bold hover:underline transition-colors"
                    onClick={() => setActiveView("login")}
                  >
                    Connectez-vous
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Rendu du composant séparé de mot de passe oublié */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        closeModal={() => setIsForgotModalOpen(false)}
      />
    </>
  );
};

export default ProfileModal;
