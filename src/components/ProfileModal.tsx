import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react"; // <-- import des icônes
import ForgotPasswordModal from "./ForgotPasswordModal";

interface Props {
  closeModal: () => void;
}

// Dropdown animé réutilisable
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
    <div className="relative w-full text-left font-sen">
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full px-4 py-3 rounded-full border bg-gray-100 text-gray-600 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-orange-300"
      >
        <span className="truncate">{value || label}</span>
        <svg
          className={`h-4 w-4 transform transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 8L10 13L15 8"
            stroke="#374151"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute z-30 mt-2 w-full bg-white border rounded-md shadow-lg max-h-52 overflow-auto"
          >
            {options.map((opt) => (
              <li
                key={opt}
                onClick={() => handleSelect(opt)}
                className="px-4 py-2 hover:bg-orange-300 hover:text-white cursor-pointer text-sm"
              >
                {opt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileModal: React.FC<Props> = ({ closeModal }) => {
  const [activeView, setActiveView] = useState<"cards" | "login" | "signup">(
    "cards"
  );

  // login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // <-- login
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
  const [showSignupPassword, setShowSignupPassword] = useState(false); // <-- signup pwd
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // <-- confirm pwd

  const [alertMsg, setAlertMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const inputClass =
    "w-full px-4 py-3 border rounded-full text-gray-600 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300";

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const longinData = { email: loginEmail, password: loginPassword };
    try {
      const res = await fetch(
        "https://upbstudents-backend-1u7x.vercel.app/api/connexion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(longinData),
        }
      );
      const data = await res.json();
      if (data.user) {
        localStorage.setItem("supa_token", data.token);
        alert(`Bienvenue dans notre Bibliotèque ${data.user.email} !`);
        closeModal();
      } else alert("Erreur : " + data.message);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de connexion");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    } else setPasswordError("");

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
      const res = await fetch(
        "https://upbstudents-backend-1u7x.vercel.app/api/inscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupData),
        }
      );
      const data = await res.json();
      if (data.status === "ok") {
        setAlertMsg(
          "Votre compte a été créé avec succès ! Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte mail et confirmer votre compte et vous connecter."
        );
        alert("Bienvenue dans notre Bibliotèque !, Veuillez vous connecter.");
        setTimeout(() => {
          setAlertMsg("");
          closeModal();
        }, 6000);
      } else alert("Erreur : " + data.message);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'inscription");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={closeModal}
      ></div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-1/2 left-1/2 w-[90%] sm:w-[95%] md:w-[90%] max-w-sm md:max-w-3xl min-h-[320px] md:min-h-[500px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg md:rounded-xl shadow-lg z-50 p-6 md:p-12 flex flex-col"
      >
        {alertMsg && (
          <div className="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded text-center font-semibold">
            {alertMsg}
          </div>
        )}

        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg md:text-xl"
          onClick={closeModal}
        >
          ✕
        </button>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2">
          {activeView === "cards"
            ? "Identification"
            : activeView === "login"
            ? "Connexion"
            : "Inscription"}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-center text-gray-600 mb-4 md:mb-8">
          {activeView === "cards"
            ? "En créant votre compte vous pouvez sauvegarder votre progression et reprendre dès que vous voulez."
            : activeView === "login"
            ? "Connectez-vous avec votre email et mot de passe."
            : "Créez votre compte en renseignant vos informations."}
        </p>

        {/* CARDS */}
        {activeView === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-grow font-sen">
            <div className="bg-orange-50 rounded-2xl p-4 md:p-8 flex flex-col justify-between shadow-md h-full min-h-[220px]">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-center">
                  Vous avez déjà un compte ?
                </h3>
                <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
                  Connectez-vous pour accéder à vos documents et paramètres.
                </p>
              </div>
              <button
                className="w-full py-3 md:py-4 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition hover:scale-105 active:scale-95 transition-transform duration-150"
                onClick={() => setActiveView("login")}
              >
                Se connecter
              </button>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 md:p-8 flex flex-col justify-between shadow-md h-full min-h-[220px]">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-center">
                  Vous n’avez pas de compte ?
                </h3>
                <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
                  Créez votre compte gratuitement et profitez de tous les
                  avantages.
                </p>
              </div>
              <button
                className="w-full py-3 md:py-4 bg-white border border-gray-800 text-gray-800 font-semibold rounded-full hover:bg-gray-100 transition hover:scale-105 active:scale-95 transition-transform duration-150"
                onClick={() => setActiveView("signup")}
              >
                Créer mon compte
              </button>
            </div>
          </div>
        )}

        {/* LOGIN */}
        {activeView === "login" && (
          <form
            className="flex flex-col space-y-4 md:space-y-6 font-sen w-full max-w-md mx-auto"
            onSubmit={handleLoginSubmit}
          >
            {/* Champ Email */}
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 md:py-4 border rounded-full text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />

            {/* Champ Mot de passe avec toggle */}
            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="w-full px-4 py-3 md:py-4 border rounded-full text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowLoginPassword((prev) => !prev)}
              >
                {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Lien Mot de passe oublié */}
            <p
              className="text-right text-sm text-orange-400 hover:underline cursor-pointer"
              onClick={() => setIsForgotModalOpen(true)}
            >
              Mot de passe oublié ?
            </p>

            {/* Bouton Se connecter */}
            <button
              type="submit"
              className="w-full py-3 md:py-4 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600
       transition hover:scale-105 active:scale-95 transition-transform duration-150"
            >
              Se connecter
            </button>

            {/* Lien vers inscription */}
            <p className="text-center text-sm md:text-base">
              Pas de compte ?{" "}
              <button
                type="button"
                className="text-orange-400 font-semibold hover:underline"
                onClick={() => setActiveView("signup")}
              >
                Créez-en un
              </button>
            </p>
          </form>
        )}

        {/* SIGNUP */}
        {activeView === "signup" && (
          <form
            className="flex flex-col font-sen space-y-4"
            onSubmit={handleSignupSubmit}
          >
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

            <div className="grid grid-cols-2 gap-3">
              <AnimatedDropdown
                label="Niveau"
                options={[
                  "Licence 1",
                  "Licence 2",
                  "Licence 3",
                  "Master 1",
                  "Master 2",
                ]}
                value={niveau}
                onChange={setNiveau}
              />
              <AnimatedDropdown
                label="Filière"
                options={["MIAGE", "ASSRI", "SEA", "SEG", "3EA", "SJAP", "RIT"]}
                value={filiere}
                onChange={setFiliere}
              />
            </div>

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
                name="phone"
                placeholder="Numéro ex: 0612345678"
                className={inputClass}
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                pattern="[0-9]{10}"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showSignupPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className={inputClass}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowSignupPassword((prev) => !prev)}
              >
                {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmer Mot de passe"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {passwordError && (
              <div className="text-red-500 text-sm text-center mb-2">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-orange-300 text-white rounded-full
             hover:bg-orange-400 transition hover:scale-105 active:scale-95 transition-transform duration-150"
            >
              Créer mon compte
            </button>

            <p className="text-center text-sm">
              Déjà inscrit ?{" "}
              <button
                type="button"
                className="text-red-500 font-semibold hover:underline"
                onClick={() => setActiveView("login")}
              >
                Connectez-vous
              </button>
            </p>
          </form>
        )}
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        closeModal={() => setIsForgotModalOpen(false)}
      />
    </>
  );
};

export default ProfileModal;
