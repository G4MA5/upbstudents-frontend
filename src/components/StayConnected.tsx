import React from "react";
import bookImage from "../assets/book-cover.png";
import backgroundImage from "../assets/Background2.jpg";
import gamaImage from "../assets/gama.png"; // Assure-toi que le fichier existe

const StayConnected: React.FC = () => {
  return (
    <>
      {/* Section Stay Connected */}
      <section className="py-12 px-4 md:px-20 bg-white mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Image du livre */}
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={bookImage}
              alt="Livre"
              className="w-[300px] md:w-[600px]" // Image un peu plus grande sur Windows
            />
          </div>

          {/* Texte et compteur */}
          <div className="w-full md:w-1/2">
            <p className="text-gray-700 text-lg mb-2">Pour vous !!!</p>
            <h2 className="text-red-500 text-3xl md:text-4xl font-bold leading-snug mb-4">
              RESTEZ CONNECTÉE
              <br />
              POUR ÊTRE À JOUR SUR LES SORTIES
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Si vous voulez atteindre vos objectifs et demeurer au sommet,
              alors consultez régulièrement cette page.
            </p>

            {/* Compteur statique */}
            <div className="flex space-x-6 text-center text-gray-800 font-medium">
              <div>
                <p className="text-2xl">00</p>
                <span className="text-sm">Jours</span>
              </div>
              <div>
                <p className="text-2xl">00</p>
                <span className="text-sm">Heures</span>
              </div>
              <div>
                <p className="text-2xl">00</p>
                <span className="text-sm">Min</span>
              </div>
              <div>
                <p className="text-2xl">00</p>
                <span className="text-sm">Sec</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nouvelle section Objectifs */}
      <section
        className="relative bg-cover bg-center text-white min-h-[500px] py-24 px-4 md:px-20"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Objectifs</h2>

          <p className="text-white text-base mb-4">
            Nous espérons que notre bibliothèque vous aidera
          </p>

          {/* Image arrondie juste en dessous */}
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
    </>
  );
};

export default StayConnected;
