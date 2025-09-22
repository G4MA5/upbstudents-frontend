import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Document, Page } from "react-pdf";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
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
  openProfileModal?: () => void;
  id: number;
  filePath: string;

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

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPopupVisible(true);
  };

  const handleCloseLocalPopup = () => {
    setLocalPopupVisible(false);
    setTxtContent("");
    setDocxContent("");
    setXlsxData([]);
  };

  // Long press pour popup centralisé
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

  // Load TXT
  useEffect(() => {
    if (localPopupVisible && fileExtension === "txt") {
      fetch(file_url)
        .then((res) => res.text())
        .then((text) => setTxtContent(text))
        .catch(() => setTxtContent("Impossible de charger le contenu."));
    }
  }, [localPopupVisible, fileExtension, file_url]);

  // Load DOCX
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

  // Load XLSX
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
      {/* Carte */}
      <div
        onClick={handleClick}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className="cursor-pointer transition-shadow duration-300 shadow-sm hover:shadow-md max-w-[220px] mx-auto md:max-w-none bg-white rounded-md my-6 relative"
      >
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
                className="group bg-white text-black px-7 py-1 rounded-[6px] shadow flex items-center gap-2 transition-all duration-300 ease-out hover:bg-[#FF9E78] hover:text-white hover:scale-105 active:scale-95"
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
                className="group bg-white text-black px-7 py-1 rounded-[6px] shadow flex items-center gap-2 transition-all duration-300 ease-out hover:bg-[#FF9E78] hover:text-white hover:scale-105 active:scale-95"
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

        <div
          className={`transition-colors duration-300 ${
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

      {/* Popup */}
      {localPopupVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-auto"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white rounded-md shadow-lg max-w-4xl w-full p-4 relative"
          >
            {/* Croix fermer */}
            <button
              onClick={handleCloseLocalPopup}
              className="absolute top-2 right-2 text-gray-600 hover:text-black font-bold text-lg"
            >
              ×
            </button>

            {/* Aperçu */}
            <div className="mb-4 max-h-[700px] overflow-auto">
              {["png", "jpg", "jpeg", "gif"].includes(fileExtension || "") && (
                <img
                  src={file_url}
                  alt={title}
                  className="w-full object-contain rounded-md"
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
                      width={800}
                    />
                  ))}
                </Document>
              )}
              {fileExtension === "txt" && (
                <pre className="bg-gray-100 p-2 rounded-md">
                  {txtContent || "Chargement..."}
                </pre>
              )}
              {fileExtension === "docx" && (
                <div className="bg-gray-100 p-2 rounded-md whitespace-pre-wrap">
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
              {![
                "png",
                "jpg",
                "jpeg",
                "gif",
                "pdf",
                "txt",
                "docx",
                "xlsx",
              ].includes(fileExtension || "") && (
                <p className="text-center text-gray-500">
                  Aperçu non disponible. Cliquez sur "Télécharger".
                </p>
              )}
            </div>

            {/* Télécharger */}
            <div className="flex justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
              >
                Télécharger
                <img src={DownloadIcon} alt="Télécharger" className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ExamenDocumentCard;
