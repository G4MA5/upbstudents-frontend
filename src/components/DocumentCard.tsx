import React, { useState } from "react";
import DownloadIcon from "../assets/Docs/telechargement.png";
import { motion } from "framer-motion";
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

  const handleClick = () => {
    setClicked(!clicked);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("supa_token");
    if (!token) {
      if (openProfileModal) openProfileModal();
      return;
    }
    window.open(file_url, "_blank");
    const link = document.createElement("a");
    link.href = file_url;
    link.download = file_url.split("/").pop() || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={handleClick}
      className="w-full sm:w-[230px] bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
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

      {/* Bouton téléchargement visible au clic */}
      {clicked && (
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-3 p-4">
          <motion.button
            onClick={handleDownload}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 md:px-6 md:py-2 rounded-md font-medium shadow 
                         hover:bg-[#FF9E78] hover:text-white transition-all duration-300"
          >
            Télécharger
            <img src={DownloadIcon} alt="Télécharger" className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
