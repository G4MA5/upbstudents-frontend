import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import DownloadIcon from "../assets/Docs/telechargement.png";
import EyeIcon from "../assets/Docs/Eye.png";

export interface ExamenDocumentCardProps {
  title: string;
  year: string;
  level: string;
  cover: string;
  type: string;
  filiere: string;
  file_url: string;
  session: string;
  openGlobalPopup?: (doc: ExamenDocumentCardProps) => void; // popup centralisé
}

const ExamenDocumentCard: React.FC<ExamenDocumentCardProps> = ({
  title,
  year,
  level,
  cover,
  type,
  filiere,
  file_url,
  session,
  openGlobalPopup,
}) => {
  const [clicked, setClicked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => setClicked(!clicked);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();

    window.open(file_url, "_blank");
    const link = document.createElement("a");
    link.href = file_url;
    link.download = file_url.split("/").pop() || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(file_url, "_blank");
  };

  // Long press pour popup centralisé
  const handlePressStart = () => {
    timerRef.current = setTimeout(() => {
      if (openGlobalPopup)
        openGlobalPopup({
          title,
          year,
          level,
          cover,
          type,
          filiere,
          file_url,
          session,
        });
    }, 600);
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      className="cursor-pointer transition-shadow duration-300 shadow-sm hover:shadow-md max-w-[220px] mx-auto md:max-w-none bg-white rounded-md my-6 relative"
    >
      {/* Image + boutons */}
      <div className="relative">
        <img
          src={cover}
          alt={title}
          className="w-full h-48 md:h-64 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center mt-0 items-start">
          <span className="text-white text font-bold px-4 py-2 mb-5">
            <p className="mt-0 mb-5 text-sm">
              {type} <br /> {filiere}
            </p>
          </span>
        </div>

        {clicked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 mt-4">
            <motion.button
              onClick={handleDownload}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group bg-white text-black px-7 py-1 rounded-[6px] shadow flex items-center gap-2 transition-all duration-300 ease-out hover:bg-[#FF9E78] hover:text-white"
            >
              Télécharger
              <img
                src={DownloadIcon}
                alt="Télécharger"
                className="w-4 h-4 transition duration-200 group-hover:brightness-0 group-hover:invert"
              />
            </motion.button>

            <motion.button
              onClick={handleView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="group bg-white text-black px-7 py-1 rounded-[6px] shadow flex items-center gap-2 transition-all duration-300 ease-out hover:bg-[#FF9E78] hover:text-white"
            >
              Voir
              <img
                src={EyeIcon}
                alt="Voir"
                className="w-4 h-4 transition duration-200 group-hover:brightness-0 group-hover:invert"
              />
            </motion.button>
          </div>
        )}
      </div>

      {/* Zone texte */}
      <div
        className={`p-4 transition-colors duration-300 ${
          clicked ? "bg-orange-500 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="uppercase font-medium">{type}</span>
          <span className="italic">{level}</span>
        </div>
        <h3 className="text-sm font-semibold line-clamp-2">{title}</h3>
        <p
          className={`text-sm mt-1 font-bold ${
            clicked ? "text-[#032541]" : "text-[#F44344]"
          }`}
        >
          {session} / {year}
        </p>
      </div>
    </div>
  );
};

export default ExamenDocumentCard;
