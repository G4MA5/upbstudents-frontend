import React from "react";
import { motion } from "framer-motion";

interface CardPopupProps {
  id: number;
  filePath: string;
  onDelete: (id: number, filePath: string) => void;
  closePopup: () => void;
}

const CardPopup: React.FC<CardPopupProps> = ({
  id,
  filePath,
  onDelete,
  closePopup,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Overlay sombre */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={closePopup}
      ></div>

      {/* Popup central */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-64 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Croix pour fermer */}
        <button
          onClick={closePopup}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-lg"
        >
          ✕
        </button>

        <h2 className="text-center font-semibold text-black">OPTION DOC ?</h2>

        <div className="flex flex-col gap-2 mt-1">
          <p className="text-sm text-black ">
            Voulez-vous supprimer ce document ?
          </p>
          <button
            onClick={() => onDelete(id, filePath)}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition mt-5 hover:scale-105 active:scale-95 transition-transform duration-150"
          >
            Supprimer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CardPopup;
