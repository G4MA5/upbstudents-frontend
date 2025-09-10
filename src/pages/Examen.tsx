import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import bgg from "../assets/bgg.jpg";
import AnimatedDropdown from "../components/AnimatedDropdown";
import ExamenDocumentCard from "../components/ExamenDocumentCard";
import searchIcon from "../assets/Icon.png";
import backgroundImage from "../assets/Background2.jpg";
import gamaImage from "../assets/gama.png";
import { useDocuments, DocumentType } from "../hooks/useDoc";
import carte from "../assets/Docs/carte.jpg";
import ProfileModal from "../components/ProfileModal"; // Ajoute l'import

const Examen: React.FC = () => {
  const { document, loading } = useDocuments();
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
  const [showProfileModal, setShowProfileModal] = useState(false); // Ajoute l'état

  // Met à jour searchTerm quand l’URL change
  useEffect(() => {
    setSearchTerm(queryFromUrl);

    // scroll vers les résultats
    if (queryFromUrl && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [queryFromUrl]);

  const handleFilterChange = (label: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [label.toLowerCase()]: value,
    }));
  };

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

  return (
    <div className="w-full bg-white">
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
          <br className="hidden md:block" />
          précis dans votre recherche
        </p>

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <AnimatedDropdown
            label="Filière"
            options={["MIAGE", "ASSRI", "SEA", "SEG", "3EA", "SJAP", "RIT"]}
            onSelect={(value) => handleFilterChange("filiere", value)}
          />
          <AnimatedDropdown
            label="Année"
            options={["2025", "2024", "2023", "2022"]}
            onSelect={(value) => handleFilterChange("annee", value)}
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
            onSelect={(value) => handleFilterChange("licence", value)}
          />
          <AnimatedDropdown
            label="Session"
            options={["Session 1", "Session 2"]}
            onSelect={(value) => handleFilterChange("session", value)}
          />
          <AnimatedDropdown
            label="Type"
            options={["Examen", "TD", "TP"]}
            onSelect={(value) => handleFilterChange("type", value)}
          />
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full md:w-96 mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-200 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4b4b]"
          />
          <span className="absolute left-4 top-3.5 text-gray-500 text-lg">
            <img src={searchIcon} alt="Rechercher" className="w-5 h-5 mr-2" />
          </span>
        </div>
      </div>

      {/* Section Cartes Documents */}
      <div ref={resultsRef} className="bg-white py-12 px-4 md:px-20">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Chargement...</p>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-screen-xl mx-auto animate-fade-in-up">
            {filteredDocuments.map((doc, index) => (
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
                openProfileModal={() => setShowProfileModal(true)} // Passe la fonction ici
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg mt-8">
            Aucun document trouvé pour votre recherche.
          </p>
        )}
        {showProfileModal && (
          <ProfileModal closeModal={() => setShowProfileModal(false)} />
        )}
      </div>

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
