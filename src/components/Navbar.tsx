import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/upb-logo.png";
import profilePic from "../assets/profile3.png";
import searchIcon from "../assets/Icon.png";
import ProfileModal from "./ProfileModal";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, PlusSquare, Phone } from "lucide-react";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConnectedPopup, setShowConnectedPopup] = useState(false); // Ajout popup
  const navigate = useNavigate();

  const linkStyle = "hover:text-red-400 transition-colors duration-200";
  const getActiveClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-red-500 font-semibold" : "text-[#5B5B5B]";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/examen?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
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
          <img
            src={profilePic}
            alt="Profil"
            className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover cursor-pointer"
            onClick={handleProfileClick}
          />
        </div>

        {/* Desktop */}
        <div className="hidden md:flex justify-between items-center w-full">
          <img
            src={logo}
            alt="UpB Logo"
            className="w-36 md:w-48 h-auto w-28 md:w-36 lg:w-25 h-auto d-none md:block"
          />

          <ul className="flex items-center space-x-4 sm:space-x-6 md:space-x-8 font-worksans font-normal pb-[1px] text-[clamp(12px,1.2vw,18px)]">
            <li>
              <NavLink
                to="/"
                className={(props) => `${getActiveClass(props)} ${linkStyle}`}
              >
                Accueil
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/examen"
                className={(props) => `${getActiveClass(props)} ${linkStyle}`}
              >
                Examen , TD & TP
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/ajouter"
                className={(props) => `${getActiveClass(props)} ${linkStyle}`}
              >
                Ajouter document
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={(props) => `${getActiveClass(props)} ${linkStyle}`}
              >
                Contact
              </NavLink>
            </li>
          </ul>

          <form
            onSubmit={handleSearch}
            className="flex items-center space-x-3 sm:space-x-4 md:space-x-5"
          >
            <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 lg:py-1.5 bg-gray-100 rounded-full border border-[#5B5B5B]">
              <img
                src={searchIcon}
                alt="Rechercher"
                className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5 mr-1 sm:mr-2"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="bg-transparent outline-none w-[clamp(100px,20vw,240px)] text-[clamp(12px,1vw,16px)] placeholder:text-gray-500"
              />
            </div>
            <img
              src={profilePic}
              alt="Profil"
              className="w-[clamp(36px,3vw,56px)] h-[clamp(36px,3vw,56px)] rounded-full border-2 border-white shadow-sm object-cover cursor-pointer"
              onClick={handleProfileClick}
            />
          </form>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden mt-6">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-gray-100 px-3 py-2 rounded-full border border-gray-300"
        >
          <img src={searchIcon} alt="Rechercher" className="w-5 h-5 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-gray-500"
          />
        </form>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay sombre */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer menu */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 z-50 text-gray-800 shadow-xl border-r border-gray-200 rounded-t-2xl pt-16 md:pt-0 bg-gray-100"
              style={{ fontFamily: "var(--font-worksans)" }}
            >
              {/* Bouton fermer */}
              <motion.button
                className="absolute top-7 right-5 text-xl text-gray-600 hover:text-red-500 transition"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer le menu"
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>

              {/* Liens animés */}
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
                        `flex items-center gap-3 px-3 py-2 rounded-md transition
                   ${
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      {isProfileOpen && (
        <ProfileModal closeModal={() => setIsProfileOpen(false)} />
      )}

      {/* Popup connecté */}
      {showConnectedPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-4 text-green-600">
              Vous êtes bien sur la bibliothèque d'UPB !
            </h2>
            <button
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full font-semibold"
              onClick={() => setShowConnectedPopup(false)}
            >
              OK
            </button>
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
