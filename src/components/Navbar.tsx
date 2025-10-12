import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/upb-logo.png";
import profilePic from "../assets/profile3.png";
import searchIcon from "../assets/Icon.png";
import ProfileModal from "./ProfileModal";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, PlusSquare, Phone } from "lucide-react";

const COLORS = {
  Orange: "#FF8C42",
  Red: "#D33A3A",
  SkyBlue: "#A7D8F5",
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConnectedPopup, setShowConnectedPopup] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const navigate = useNavigate();

  const linkStyle =
    "transition-all duration-300 px-4 py-2 cursor-pointer rounded-full";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/examen?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setSearchExpanded(false);
    }
  };

  const handleProfileClick = () => {
    const token = localStorage.getItem("supa_token");
    if (token) {
      setShowConnectedPopup(true);
    } else {
      setIsProfileOpen(true);
    }
  };

  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    const token = localStorage.getItem("supa_token");
    if (!token) {
      // nothing to do, just navigate home
      localStorage.removeItem("supa_token");
      setShowConnectedPopup(false);
      navigate("/");
      return;
    }

    setLogoutLoading(true);
    try {
      const res = await fetch(
        "https://upbstudents-backend-biblo.vercel.app/api/deconnexion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const body = await res.text().catch(() => null);
        console.warn("déconnexion ", res.status, body);
      }

      // Clear local token regardless of server response to ensure logout client-side
      localStorage.removeItem("supa_token");
      setShowConnectedPopup(false);
      navigate("/");
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
      // Clear token anyway
      localStorage.removeItem("supa_token");
      setShowConnectedPopup(false);
      navigate("/");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <nav className="bg-white px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-4 pb-2 relative z-50">
      <div className="flex justify-between items-center md:items-end h-auto md:h-20">
        {/* Mobile */}
        <div className="flex w-full items-center justify-between md:hidden relative">
          <button
            className="text-3xl sm:text-4xl"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu mobile"
          >
            {isOpen ? "✕" : "☰"}
          </button>
          <img
            src={logo}
            alt="UpB Logo"
            className="w-36 sm:w-40 h-auto absolute left-1/2 -translate-x-1/2 hidden md:block"
          />

          {/* Barre de recherche animée bleu ciel */}
          <form
            onSubmit={handleSearch}
            className="relative flex items-center space-x-4 sm:space-x-4 md:space-x-5"
          >
            <motion.div
              className="flex items-center bg-sky-100 rounded-full border border-sky-300 px-3 py-2 cursor-pointer"
              initial={{ width: 40 }}
              animate={{ width: searchExpanded ? 240 : 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <img
                src={searchIcon}
                alt="Rechercher"
                className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5 mr-1 sm:mr-2"
                onClick={() => setSearchExpanded(!searchExpanded)}
              />
              {searchExpanded && (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="bg-transparent outline-none w-[clamp(100px,20vw,240px)] text-[clamp(17px,1vw,20px)] placeholder:text-gray-500"
                  autoFocus
                />
              )}
            </motion.div>
          </form>

          {/* Profil mobile identique à desktop */}
          <motion.img
            src={profilePic}
            alt="Profil"
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 shadow-xl object-cover cursor-pointer "
            style={{ borderColor: COLORS.Orange }}
            onClick={handleProfileClick}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 0 6px ${COLORS.Orange}20`,
            }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </div>

        {/* Desktop */}
        <div className="hidden md:flex justify-between items-center w-full">
          <img
            src={logo}
            alt="UpB Logo"
            className="w-38 md:w-48 h-auto w-38 md:w-38 lg:w-25 h-auto hidden md:block "
          />

          {/* Menu desktop avec BADGRAM rond qui prend tout le lien */}
          <ul className="flex items-center space-x-4 lg:sm:space-x-4 sm:space-x-4 md:space-x-4 font-worksans font-normal pb-[1px] text-[clamp(12px,1.2vw,18px)]">
            {[
              { text: "Accueil", to: "/" },
              { text: "Examen , TD & TP", to: "/examen" },
              { text: "Ajouter document", to: "/ajouter" },
              { text: "Contact", to: "/contact" },
            ].map((item) => (
              <li key={item.text} className={linkStyle}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-center px-4 py-2 rounded-full transition-colors duration-300 ${
                      isActive
                        ? "bg-orange-400 text-white"
                        : "text-[#5B5B5B] hover:bg-orange-400 hover:text-white"
                    }`
                  }
                >
                  {item.text}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Barre de recherche animée bleu ciel */}
          <form
            onSubmit={handleSearch}
            className="relative flex items-center space-x-3 sm:space-x-4 md:space-x-5"
          >
            <motion.div
              className="flex items-center bg-sky-100 rounded-full border border-sky-300 px-3 py-2 cursor-pointer"
              initial={{ width: 40 }}
              animate={{ width: searchExpanded ? 240 : 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <img
                src={searchIcon}
                alt="Rechercher"
                className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5 mr-1 sm:mr-2"
                onClick={() => setSearchExpanded(!searchExpanded)}
              />
              {searchExpanded && (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="bg-transparent outline-none w-[clamp(100px,20vw,240px)] text-[clamp(17px,1vw,20px)] placeholder:text-gray-500"
                  autoFocus
                />
              )}
            </motion.div>
          </form>

          <motion.img
            src={profilePic}
            alt="Profil"
            className="w-[clamp(36px,3vw,56px)] h-[clamp(36px,3vw,56px)] rounded-full border-2 border-white shadow-sm object-cover cursor-pointer"
            style={{ borderColor: COLORS.Orange }}
            onClick={handleProfileClick}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 0 6px ${COLORS.Orange}20`,
            }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </div>
      </div>

      {/* Mobile search bar */}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 z-50 text-gray-800 shadow-xl border-r border-gray-200 rounded-t-2xl pt-16 md:pt-0 bg-gray-100"
            >
              <motion.button
                className="absolute top-7 right-5 text-xl text-gray-600 hover:text-red-500 transition"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer le menu"
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>

              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { staggerChildren: 0.08 },
                  },
                }}
                className="flex flex-col mt-20 px-6 space-y-2"
              >
                {[
                  {
                    text: "Accueil",
                    to: "/",
                    icon: <Home className="w-5 h-5 text-black" />,
                  },
                  {
                    text: "Examen, TD & TP",
                    to: "/examen",
                    icon: <BookOpen className="w-5 h-5 text-black" />,
                  },
                  {
                    text: "Ajouter document",
                    to: "/ajouter",
                    icon: <PlusSquare className="w-5 h-5 text-black" />,
                  },
                  {
                    text: "Contact",
                    to: "/contact",
                    icon: <Phone className="w-5 h-5 text-black" />,
                  },
                ].map((item) => (
                  <motion.div
                    key={item.text}
                    variants={{
                      hidden: { x: -20, opacity: 0 },
                      visible: { x: 0, opacity: 1 },
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                          isActive
                            ? "bg-white text-black"
                            : "text-black hover:bg-gray-200"
                        }`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon}
                      <span className="font-medium">{item.text}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </motion.div>
              {/* Bouton “Soutenir le projet” en bas avec effet de respiration */}
              <div className="absolute bottom-6 left-0 w-full px-6">
                <motion.button
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white 
               bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 
               transition-all shadow-md hover:shadow-lg"
                >
                  Soutenir le projet
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      {isProfileOpen && (
        <ProfileModal closeModal={() => setIsProfileOpen(false)} />
      )}

      {/* Popup connecté amélioré */}
      {showConnectedPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-[90%] max-w-sm mx-auto">
            <h2 className="text-xl font-bold mb-4 text-green-600">
              Vous êtes bien sur la bibliothèque d'UPB !
            </h2>
            <button
              className="mt-4 px-6 py-2 bg-sky-300 text-white rounded-full font-semibold hover:bg-sky-400 transition-colors"
              onClick={() => setShowConnectedPopup(false)}
            >
              Commencer
            </button>
            <div className="mt-3">
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="text-black underline cursor-pointer"
              >
                {logoutLoading ? "Déconnexion..." : "Déconnexion"}
              </button>
            </div>
          </div>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowConnectedPopup(false)}
          ></div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
