import React, { useState, useRef, useEffect } from "react";
import DownloadIcon from "../assets/Docs/telechargement.png";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentCardProps {
  title: string;
  year: string;
  level: string;
  cover: string;
  type: string;
  filiere: string;
  file_url: string;
  session: string;
  openProfileModal?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  year,
  level,
  type,
  filiere,
  file_url,
  session,
  openProfileModal,
}) => {
  const [clicked, setClicked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  const handleClick = () => setClicked(!clicked);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("supa_token");
    if (!token) {
      openProfileModal?.();
      return;
    }
    window.open(file_url, "_blank");
    // Téléchargement
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        clicked &&
        cardRef.current &&
        !cardRef.current.contains(target) &&
        downloadRef.current &&
        !downloadRef.current.contains(target)
      ) {
        setClicked(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [clicked]);

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className="w-full sm:w-[230px] bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 relative"
    >
      {/* Bande supérieure rose */}
      <div className="bg-[#ffe1e1] h-24 flex flex-col items-center justify-center text-center px-2">
        <p className="text-[#f44344] text-sm font-semibold uppercase leading-tight">
          {filiere} {type}
        </p>
      </div>

      {/* Contenu principal */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-500 text-sm">
          {level} / {year}
        </p>
        <div className="flex items-center justify-between mt-3 text-sm">
          <span
            className={`px-3 py-1 rounded-full text-white ${
              type.toLowerCase() === "td" ? "bg-indigo-400" : "bg-purple-400"
            }`}
          >
            {type}
          </span>
          <span className="text-gray-600">{session}</span>
        </div>
      </div>

      {/* Popup bouton téléchargement */}
      <AnimatePresence>
        {clicked && (
          <>
            {/* Overlay indépendant */}
            <motion.div
              className="absolute inset-0 bg-black/30 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Bouton */}
            <motion.div
              ref={downloadRef}
              className="absolute inset-0 z-20 flex items-center justify-center p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <motion.button
                onClick={handleDownload}
                className="group flex items-center gap-2 bg-white text-black px-4 py-2 md:px-6 md:py-2 rounded-md font-medium shadow
                  hover:bg-indigo-500 hover:text-white transition-all duration-300"
              >
                Télécharger
                <img
                  src={DownloadIcon}
                  alt="Télécharger"
                  className="w-4 h-4 transition-all duration-300 filter group-hover:brightness-0 group-hover:invert"
                />
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentCard;
