// src/pages/Examen.tsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import bgg from "../assets/bgg.jpg";
import AnimatedDropdown from "../components/AnimatedDropdown";
import ExamenDocumentCard, {
  ExamenDocumentCardProps,
} from "../components/ExamenDocumentCard";
import CardPopup from "../components/CardPopup";
import searchIcon from "../assets/Icon.png";
import backgroundImage from "../assets/Background2.jpg";
import gamaImage from "../assets/gama.png";
import { useDocuments, DocumentType } from "../hooks/useDoc";
import carte from "../assets/Docs/carte.jpg";
import ProfileModal from "../components/ProfileModal";

const Examen: React.FC = () => {
  const { document, loading, setDocuments } = useDocuments();

  const [selectedFilters, setSelectedFilters] = useState({
    filiere: "",
    annee: "",
    licence: "",
    session: "",
    type: "",
  });

  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";
  const [searchTerm, setSearchTerm] = useState(queryFromUrl);

  const resultsRef = useRef<HTMLDivElement>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Popup global
  const [popupData, setPopupData] = useState<ExamenDocumentCardProps | null>(
    null
  );

  // ✅ Flag pour afficher le popup si l'utilisateur est propriétaire
  const [isProprietaire, setIsProprietaire] = useState(false);

  // ⚡ Vérifier si l'utilisateur est propriétaire
  useEffect(() => {
    const checkProprietaire = async () => {
      try {
        const token = localStorage.getItem("supa_token");
        if (!token) {
          setShowProfileModal(true);
          return;
        }

        const res = await fetch(
          "https://upbstudents-backend-biblo.vercel.app/api/utilisateur",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (data.status === "ok") {
          setIsProprietaire(data.utilisateur.proprietaire);
        } else {
          setShowProfileModal(true);
        }
      } catch (err) {
        console.error(err);
        setShowProfileModal(true);
      }
    };
    checkProprietaire();
  }, []);

  useEffect(() => {
    setSearchTerm(queryFromUrl);
    if (queryFromUrl && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [queryFromUrl]);

  const handleFilterChange = (label: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [label.toLowerCase()]: value }));
  };

  const isSessionDisabled =
    selectedFilters.type === "TD" || selectedFilters.type === "TP";

  const filteredDocuments = document.filter((doc: DocumentType) => {
    const { filiere, annee, licence, session, type } = selectedFilters;
    const matchesFilters =
      (!filiere || doc.filiere === filiere) &&
      (!annee || doc.annee === annee) &&
      (!licence || doc.licence === licence) &&
      (!session || doc.session === session) &&
      (!type || doc.type === type);

    const matchesSearch =
      !searchTerm ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.filiere.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilters && matchesSearch;
  });

  // Supprimer un document
  const handleDelete = async (id: number, filePath: string) => {
    try {
      const token = localStorage.getItem("supa_token");
      if (!token) {
        setShowProfileModal(true);
        return;
      }

      const res = await fetch(
        "https://upbstudents-backend-biblo.vercel.app/api/supprimer",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, filePath }),
        }
      );

      if (!res.ok) {
        throw new Error("Erreur suppression ou utilisateur non connecté");
      }

      setDocuments((prevDocs: DocumentType[]) =>
        prevDocs.filter((doc) => doc.id !== id)
      );
      console.log("✅ Document supprimé avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression :", error);
      setShowProfileModal(true); // 🔥 Affiche le modal si erreur
    } finally {
      setPopupData(null);
    }
  };

  const [visibleCount, setVisibleCount] = useState(12);
  // Gérer l'ouverture d'un seul dropdown à la fois
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="w-full bg-white relative">
      {/* Bannière */}
      <div
        className="w-full h-[300px] md:h-[700px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${bgg})` }}
      >
        <h1 className="text-white text-3xl md:text-7xl font-bold uppercase text-center drop-shadow-lg">
          YOU ARE STUDENT’S
        </h1>
      </div>

      {/* Bloc recherche */}
      <div className="bg-white py-12 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          UPB examen & Td
        </h2>
        <p className="text-md md:text-lg text-gray-600 mb-8">
          Selectionner chaque champs afin d'être le plus
          <br className="hidden md:block" /> précis dans votre recherche
        </p>

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <AnimatedDropdown
            label="Filière"
            options={["MIAGE", "ASSRI", "SEA", "SEG", "3EA", "SJAP", "RIT"]}
            value={selectedFilters.filiere}
            isOpen={openDropdown === "Filière"}
            onToggle={(isOpen) => setOpenDropdown(isOpen ? "Filière" : null)}
            onSelect={(v) => handleFilterChange("filiere", v)}
          />

          <AnimatedDropdown
            label="Année"
            options={[
              "2025",
              "2024",
              "2023",
              "2022",
              "2021",
              "2020",
              "2019",
              "2018",
            ]}
            value={selectedFilters.annee}
            isOpen={openDropdown === "Année"}
            onToggle={(isOpen) => setOpenDropdown(isOpen ? "Année" : null)}
            onSelect={(v) => handleFilterChange("annee", v)}
          />

          <AnimatedDropdown
            label="Niveau"
            options={[
              "Licence 1",
              "Licence 2",
              "Licence 3",
              "Master 1",
              "Master 2",
            ]}
            value={selectedFilters.licence}
            isOpen={openDropdown === "Niveau"}
            onToggle={(isOpen) => setOpenDropdown(isOpen ? "Niveau" : null)}
            onSelect={(v) => handleFilterChange("licence", v)}
          />

          <AnimatedDropdown
            label="Session"
            options={["Session 1", "Session 2"]}
            disabled={isSessionDisabled}
            value={selectedFilters.session}
            isOpen={openDropdown === "Session"}
            onToggle={(isOpen) => setOpenDropdown(isOpen ? "Session" : null)}
            onSelect={(v) => handleFilterChange("session", v)}
          />

          <AnimatedDropdown
            label="Type"
            options={["Examen", "TD", "TP"]}
            value={selectedFilters.type}
            isOpen={openDropdown === "Type"}
            onToggle={(isOpen) => setOpenDropdown(isOpen ? "Type" : null)}
            onSelect={(v) => handleFilterChange("type", v)}
          />
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full md:w-96 mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-sky-100 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          <span className="absolute left-4 top-3.5 text-gray-500 text-lg cursor-pointer">
            <img src={searchIcon} alt="Rechercher" className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Section Cartes Documents */}
      <div ref={resultsRef} className="bg-white py-12 px-4 md:px-20">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Chargement...</p>
        ) : filteredDocuments.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-screen-xl mx-auto animate-fade-in-up">
              {filteredDocuments.slice(0, visibleCount).map((doc, index) => (
                <ExamenDocumentCard
                  key={index}
                  title={doc.title}
                  cover={carte}
                  year={doc.annee}
                  level={doc.licence}
                  type={doc.type}
                  filiere={doc.filiere}
                  file_url={doc.file_url}
                  session={doc.session}
                  openGlobalPopup={(docData) => setPopupData(docData)}
                  id={doc.id}
                  filePath={doc.filePath}
                  openProfileModal={() => setShowProfileModal(true)}
                />
              ))}
            </div>
            {/* Boutons Voir plus / Voir moins centrés */}
            <div className="flex justify-center mt-12 gap-4">
              {visibleCount < filteredDocuments.length && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 11)}
                  className="group flex items-center gap-2 px-6 py-2 md:px-6 md:py-2 rounded-md font-medium shadow
                 bg-gradient-to-r from-[#4A90E2] to-[#0074D9] text-white 
                 hover:opacity-90 transition-all duration-300"
                >
                  Voir plus
                </button>
              )}

              {visibleCount > 12 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setVisibleCount(12)}
                    className="group flex items-center gap-2 px-6 py-2 md:px-6 md:py-2 rounded-md font-medium shadow
                 bg-gradient-to-r from-[#FF9E78] to-[#FF7A4C] text-white 
                 hover:opacity-90 transition-all duration-300"
                  >
                    Voir moins
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 text-lg mt-8">
            Aucun document trouvé pour votre recherche.
          </p>
        )}
        {showProfileModal && (
          <ProfileModal closeModal={() => setShowProfileModal(false)} />
        )}
      </div>

      {/* Popup centralisé */}
      {popupData && isProprietaire && (
        <CardPopup
          id={popupData.id}
          filePath={popupData.filePath}
          onDelete={handleDelete}
          closePopup={() => setPopupData(null)}
        />
      )}

      {/* Objectifs */}
      <section
        className="relative bg-cover bg-center text-white min-h-[500px] py-24 px-4 md:px-20 hidden md:block lg:block"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Objectifs</h2>
          <p className="text-white text-base mb-4">
            Nous espérons que notre bibliothèque vous aidera
          </p>
          <div className="mb-6">
            <img
              src={gamaImage}
              alt="Gama Labs"
              className="mx-auto w-[100px] h-[100px] rounded-full object-cover"
            />
          </div>
          <p className="text-sm text-white leading-relaxed">
            La bibliothèque digitale que j’ai créée est née d’un constat simple
            : au sein de notre université, de nombreux étudiants peinent à
            retrouver les TD et sujets d’examen des années précédentes. Ce
            manque d’accès freine la révision, ralentit la progression et creuse
            parfois des inégalités. J’ai donc voulu créer un espace organisé,
            clair et accessible, où chacun peut retrouver les documents
            essentiels à sa réussite, selon sa filière, son année et ses
            matières.
            <br />
            <br />
            <strong>GAMA_LABS</strong>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Examen;
