import React, { useState } from "react";
import DownloadIcon from "../assets/Docs/telechargement.png"; // Ton icône PNG noire

interface DocumentCardProps {
  title: string;
  year: string;
  level: string;
  cover: string;
  type: string;
  filiere: string;
  file_url: string;
  session: string;
  openProfileModal?: () => void; // Ajouté
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  year,
  level,
  cover,
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
    if (e) e.stopPropagation();
    window.open(file_url, "_blank");
    const link = document.createElement("a");
    link.href = file_url;
    link.download = file_url.split("/").pop() || "document";
    // optionnel, mais utile pour certains navigateurs
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer transition-shadow duration-300 shadow-sm hover:shadow-md max-w-[220px] mx-auto md:max-w-none bg-white"
    >
      {/* Image + bouton de téléchargement */}
      <div className="relative">
        <img
          src={cover}
          alt={title}
          className="w-full h-48 md:h-64 object-cover"
        />

        <div className="absolute inset-0 flex items-center justify-center mt-0 items-start">
          <span className="text-white text font-bold px-4 py-2 mb-5 ">
            <p className="mt-0 mb-5 text-sm">
              {type} <br /> {filiere}
            </p>
          </span>
        </div>

        {clicked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={handleDownload}
              className="group bg-white text-black px-7 py-1 rounded-[6px] shadow flex items-center gap-2 
                         transition-all duration-300 ease-out hover:bg-[#FF9E78] hover:text-white
                         animate-fade-in-up"
            >
              Télécharger
              <img
                src={DownloadIcon}
                alt="Télécharger"
                className="w-4 h-4 transition duration-200 group-hover:brightness-0 group-hover:invert"
              />
            </button>
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

export default DocumentCard;
