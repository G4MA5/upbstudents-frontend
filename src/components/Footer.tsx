import React from "react";
import { NavLink } from "react-router-dom";

interface FooterProps {
  openProfileModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ openProfileModal }) => {
  const linkStyle = "hover:text-red-400 transition-colors duration-200";
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#f7f7f7] text-gray-800 pt-12">
      <div className="max-w-screen-xl mx-auto px-12 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-8 text-s">
        {/* À propos */}
        <div className="sm:col-span-3 md:col-span-1">
          <h3 className="text-base font-semibold mb-4">À PROPOS</h3>
          <p className="text-gray-600 mb-4">
            Notre plateforme vous permet de consulter, partager et ajouter des
            documents pour vos examens et TD.
          </p>
          <div className="mb-2 flex items-start gap-2">
            <span className="text-lg">📍</span>
            <p>
              Adresse : Université Polytechnique de Bingerville, Côte d’Ivoire
            </p>
          </div>
          <div className="mb-2 flex items-start gap-2">
            <span className="text-lg">✉️</span>
            <p>Email : Gamalabs2.0@gmail.com</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📞</span>
            <p>Téléphone : +225 01 72 48 93 31</p>
          </div>
        </div>

        {/* Informations */}
        <div>
          <h3 className="text-base font-semibold mb-4">INFORMATIONS</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <button onClick={openProfileModal} className={linkStyle}>
                Se connecter
              </button>
            </li>
            <li>
              <button onClick={openProfileModal} className={linkStyle}>
                S’inscrire
              </button>
            </li>
            <li>
              <NavLink
                to="/ajouter"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Ajouter un document
              </NavLink>
            </li>
            <li>
              <NavLink to="/examen" onClick={scrollToTop} className={linkStyle}>
                Accéder aux examens / TD
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                FAQ / Aide
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Liens */}
        <div>
          <h3 className="text-base font-semibold mb-4">LIENS</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <NavLink to="/" onClick={scrollToTop} className={linkStyle}>
                Accueil
              </NavLink>
            </li>
            <li>
              <NavLink to="/examen" onClick={scrollToTop} className={linkStyle}>
                Examen & TD
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/ajouter"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Ajouter document
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-base font-semibold mb-4">SUPPORT</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Contactez-nous
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Politique de confidentialité
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Conditions d’utilisation
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Signaler un problème
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={scrollToTop}
                className={linkStyle}
              >
                Assistance technique
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {/* Bas de page */}
      <div className="mt-10 bg-gray-800 text-white text-sm text-center py-4">
        Copyright 2025–2026 | Réalisé avec{" "}
        <span className="font-semibold">React</span> par Gama_Labs.
      </div>
    </footer>
  );
};

export default Footer;
