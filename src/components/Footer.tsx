import React from "react";
import { NavLink } from "react-router-dom";

interface FooterProps {
  openProfileModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ openProfileModal }) => {
  const linkStyle =
    "hover:text-red-400 transition-colors duration-300 font-sen text-[15px] hover:scale-105";
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-gradient-to-t from-gray-20 to-white text-gray-800 pt-12 font-sen w-full shadow-lg">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm md:text-[15px]">
        {/* À propos */}
        <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
          <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 tracking-wider uppercase">
            À PROPOS 💡
          </h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Notre plateforme vous permet de consulter, partager et ajouter des
            documents pour vos examens et TD. 📚✨
          </p>
          <div className="mb-2 flex justify-center sm:justify-start items-start gap-2 animate-fadeIn">
            <span className="text-xl">📍</span>
            <p className="text-gray-700">
              Université Polytechnique de Bingerville, Côte d’Ivoire
            </p>
          </div>
          <div className="mb-2 flex justify-center sm:justify-start items-start gap-2 animate-fadeIn delay-75">
            <span className="text-xl">✉️</span>
            <p>
              Email :{" "}
              <span className="text-gray-700">Gamalabs2.0@gmail.com</span>
            </p>
          </div>
          <div className="flex justify-center sm:justify-start items-start gap-2 animate-fadeIn delay-150">
            <span className="text-xl">📞</span>
            <p>Téléphone : +225 01 72 48 93 31</p>
          </div>
        </div>

        {/* Informations */}
        <div className="text-center sm:text-left">
          <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 tracking-wider uppercase">
            INFORMATIONS 📌
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <button onClick={openProfileModal} className={linkStyle}>
                Se connecter 🔑
              </button>
            </li>
            <li>
              <button onClick={openProfileModal} className={linkStyle}>
                S’inscrire ✍️
              </button>
            </li>
            <li>
              <NavLink
                to="/ajouter"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Ajouter un document 📄
              </NavLink>
            </li>
            <li>
              <NavLink to="/examen" onClick={scrollToTop} className={linkStyle}>
                Accéder aux examens / TD 📝
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                FAQ / Aide 💬
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Liens */}
        <div className="text-center sm:text-left">
          <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 tracking-wider uppercase">
            LIENS 🔗
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <NavLink to="/" onClick={scrollToTop} className={linkStyle}>
                Accueil 🏠
              </NavLink>
            </li>
            <li>
              <NavLink to="/examen" onClick={scrollToTop} className={linkStyle}>
                Examen & TD 📝
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/ajouter"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Ajouter document ➕
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Contact 📞
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="text-center sm:text-left">
          <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 tracking-wider uppercase">
            SUPPORT 🛠️
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Contactez-nous 📧
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Politique de confidentialité 🔒
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Conditions d’utilisation 📜
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Signaler un problème ⚠️
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Assistance technique 🛠️
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {/* Bas de page */}
      <div className="mt-10 bg-gray-900 text-white text-[13px] md:text-sm text-center py-5 font-sen flex flex-col sm:flex-row justify-center items-center gap-2">
        <span>Copyright © 2025–2026 |</span>
        <span className="mx-1">Réalisé avec </span>
        <span className="font-semibold text-red-400">React</span>
        <span className="mx-1">par</span>
        <span className="font-semibold hover:text-red-400 cursor-pointer transition-colors">
          Gama_Labs
        </span>
      </div>
    </footer>
  );
};

export default Footer;
