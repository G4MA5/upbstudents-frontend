import React, { useState, useMemo } from "react";
import DocumentCard from "./DocumentCard";
import ProfileModal from "./ProfileModal"; // Ajoute l'import
import { useDocuments } from "../hooks/useDoc";
import carte from "../assets/Docs/carte.jpg";

function getRandomDocs(docs: any[], count: number) {
  const shuffled = [...docs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const PopularDocuments: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("best");
  const [animationKey, setAnimationKey] = useState(0);
  const { document, loading } = useDocuments();
  const [showProfileModal, setShowProfileModal] = useState(false); // Ajoute l'état

  // Sélectionne aléatoirement des docs pour chaque rubrique
  const bestSellerDocs = useMemo(() => getRandomDocs(document, 8), [document]);
  const featuredDocs = useMemo(() => getRandomDocs(document, 6), [document]);
  const latestDocs = useMemo(() => getRandomDocs(document, 4), [document]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setAnimationKey((prev) => prev + 1);
  };

  const getDocuments = () => {
    if (selectedCategory === "featured") return featuredDocs;
    if (selectedCategory === "latest") return latestDocs;
    return bestSellerDocs;
  };

  return (
    <div className="bg-white py-12 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Documents les plus populaires
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Consultez les documents afin de réussir au mieux <br />
          votre année universitaire
        </p>

        {/* BOUTONS */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button
            onClick={() => handleCategoryChange("best")}
            className={`px-4 py-1 rounded-full text-sm transition ${
              selectedCategory === "best"
                ? "bg-[#ff4b4b] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Les plus demandés
          </button>
          <button
            onClick={() => handleCategoryChange("featured")}
            className={`px-4 py-1 rounded-full text-sm transition ${
              selectedCategory === "featured"
                ? "bg-[#ff4b4b] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            À la une
          </button>
          <button
            onClick={() => handleCategoryChange("latest")}
            className={`px-4 py-1 rounded-full text-sm transition ${
              selectedCategory === "latest"
                ? "bg-[#ff4b4b] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Derniers ajoutés
          </button>
        </div>
      </div>

      {/* LISTE DES DOCUMENTS AVEC ANIMATION */}
      <div
        key={animationKey}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-screen-xl mx-auto animate-fade-in-up"
      >
        {loading ? (
          <div className="col-span-full text-center text-gray-500">
            Chargement...
          </div>
        ) : (
          getDocuments().map((doc, index) => (
            <div key={index} className="flex justify-center">
              <DocumentCard
                title={doc.title}
                cover={carte}
                year={doc.annee}
                level={doc.licence}
                type={doc.type}
                filiere={doc.filiere}
                file_url={doc.file_url}
                session={doc.session}
                openProfileModal={() => setShowProfileModal(true)} // Passe la prop ici
              />
            </div>
          ))
        )}
      </div>
      {showProfileModal && (
        <ProfileModal closeModal={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

export default PopularDocuments;
