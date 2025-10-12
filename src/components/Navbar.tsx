import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Document, Page } from "react-pdf";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import DownloadIcon from "../assets/Docs/telechargement.png";

export interface ExamenDocumentCardProps {
  title: string;
  year: string;
  level: string;
  cover: string;
  type: string;
  filiere: string;
  file_url: string;
  session: string;
  openProfileModal?: () => void;
  id: number;
  filePath: string;
  openGlobalPopup?: (doc: ExamenDocumentCardProps) => void;
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
  id,
  filePath,
  openProfileModal,
  openGlobalPopup,
}) => {
  const [clicked, setClicked] = useState(false);
  const [localPopupVisible, setLocalPopupVisible] = useState(false);
  const [txtContent, setTxtContent] = useState<string>("");
  const [docxContent, setDocxContent] = useState<string>("");
  const [xlsxData, setXlsxData] = useState<any[][]>([]);
  const [numPages, setNumPages] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => setClicked(!clicked);

  const handleDownload = (e?: React.MouseEvent) => {
    const token = localStorage.getItem("supa_token");
    if (!token) {
      if (openProfileModal) openProfileModal();
      return;
    }

    if (e) e.stopPropagation();
    const link = document.createElement("a");
    link.href = file_url;
    link.download = file_url.split("/").pop() || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseLocalPopup = () => {
    setLocalPopupVisible(false);
    setTxtContent("");
    setDocxContent("");
    setXlsxData([]);
  };

  const handlePressStart = () => {
    timerRef.current = setTimeout(() => {
      if (openGlobalPopup) {
        openGlobalPopup({
          title,
          year,
          level,
          cover,
          type,
          filiere,
          file_url,
          session,
          id,
          filePath,
        });
      }
    }, 600);
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const fileExtension = file_url.split(".").pop()?.toLowerCase();

  useEffect(() => {
    if (localPopupVisible && fileExtension === "txt") {
      fetch(file_url)
        .then((res) => res.text())
        .then((text) => setTxtContent(text))
        .catch(() => setTxtContent("Impossible de charger le contenu."));
    }
  }, [localPopupVisible, fileExtension, file_url]);

  useEffect(() => {
    if (localPopupVisible && fileExtension === "docx") {
      fetch(file_url)
        .then((res) => res.arrayBuffer())
        .then((buffer) =>
          mammoth
            .extractRawText({ arrayBuffer: buffer })
            .then((result) => setDocxContent(result.value))
            .catch(() =>
              setDocxContent("Impossible de charger le fichier DOCX.")
            )
        );
    }
  }, [localPopupVisible, fileExtension, file_url]);

  useEffect(() => {
    if (localPopupVisible && fileExtension === "xlsx") {
      fetch(file_url)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          const workbook = XLSX.read(buffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          setXlsxData(json as any[][]);
        })
        .catch(() => setXlsxData([["Impossible de charger le fichier XLSX."]]));
    }
  }, [localPopupVisible, fileExtension, file_url]);

  return (
    <>
      {/* Carte responsive */}
      <div
        onClick={handleClick}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className="relative w-full sm:w-[220px] md:w-[240px] bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
      >
        {/* Bandeau supérieur */}
        <div className="bg-[#ffe1e1] h-24 sm:h-28 flex flex-col items-center justify-center text-center px-3">
          <p className="text-[#f44344] text-sm sm:text-base font-semibold uppercase leading-tight">
            {filiere} {type}
          </p>
        </div>

        {/* Contenu bas */}
        <div className="p-4 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 line-clamp-2">
            {title}
          </h3>

          <p className="text-gray-500 text-xs sm:text-sm">
            {level} / {year}
          </p>

          <div className="flex items-center justify-between mt-3 text-xs sm:text-sm">
            <span
              className={`px-3 py-1 rounded-full text-white font-medium ${
                type.toLowerCase() === "td" ? "bg-indigo-400" : "bg-purple-400"
              }`}
            >
              {type}
            </span>
            <span className="text-gray-600">{session}</span>
          </div>
        </div>

        {/* Overlay au clic */}
        {clicked && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 p-4">
            <motion.button
              onClick={handleDownload}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="group flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-6 py-2 rounded-full font-medium shadow-md hover:from-orange-600 hover:to-orange-500 transform hover:scale-105 transition-all duration-300"
            >
              <img
                src={DownloadIcon}
                alt="Télécharger"
                className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300"
              />
              Télécharger
            </motion.button>
          </div>
        )}
      </div>

      {/* Popup responsive */}
      {localPopupVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-2 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl shadow-lg w-full max-w-5xl p-4 sm:p-6 relative overflow-auto max-h-[90vh]"
          >
            <button
              onClick={handleCloseLocalPopup}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-2xl sm:text-3xl"
            >
              ×
            </button>

            <div className="max-h-[70vh] overflow-auto">
              {["png", "jpg", "jpeg", "gif"].includes(fileExtension || "") && (
                <img
                  src={file_url}
                  alt={title}
                  className="w-full object-contain rounded-lg"
                />
              )}
              {fileExtension === "pdf" && (
                <Document
                  file={file_url}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                  {Array.from(new Array(numPages), (_, i) => (
                    <Page
                      key={`page_${i + 1}`}
                      pageNumber={i + 1}
                      width={window.innerWidth < 640 ? 300 : 800}
                    />
                  ))}
                </Document>
              )}
              {fileExtension === "txt" && (
                <pre className="bg-gray-100 p-3 rounded-md text-sm">
                  {txtContent || "Chargement..."}
                </pre>
              )}
              {fileExtension === "docx" && (
                <div className="bg-gray-100 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {docxContent || "Chargement..."}
                </div>
              )}
              {fileExtension === "xlsx" && (
                <div className="overflow-auto">
                  <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                    <tbody>
                      {xlsxData.map((row, idx) => (
                        <tr key={idx}>
                          {row.map((cell, cidx) => (
                            <td
                              key={cidx}
                              className="border border-gray-300 px-2 py-1"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bouton de téléchargement amélioré */}
            <div className="flex justify-center mt-4">
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white px-5 py-2 rounded-full font-semibold shadow-md transition-all duration-300"
              >
                <img
                  src={DownloadIcon}
                  alt="Télécharger"
                  className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform duration-300"
                />
                Télécharger
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ExamenDocumentCard;
