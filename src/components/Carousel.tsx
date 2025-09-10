import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";
import linkIcon from "../assets/Link1.png";

const slides = [
  {
    image: slide1,
    titleRed: "L’intellectuel est",
    titleBlack: "Dominant.",
    description:
      "Celui qui s’instruit ne se contente pas de savoir, il se donne le pouvoir de choisir, de bâtir, d’élever les autres et de valider.",
  },
  {
    image: slide2,
    titleRed: "Partagez",
    titleBlack: "vos ressources.",
    description:
      "Contribuez à la bibliothèque en partageant vos cours, examens, et bien plus encore avec la communauté.",
  },
  {
    image: slide3,
    titleRed: "Rejoignez",
    titleBlack: "la communauté UPB.",
    description:
      "Accédez à des milliers de documents et collaborez avec des étudiants de toutes filières.",
  },
];

const Carousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-[500px] md:h-[650px] relative overflow-hidden bg-white">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center flex items-center justify-start px-4 md:px-24"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div
              className="bg-white/30 backdrop-blur-[1px] p-4 rounded 
                         md:bg-transparent md:backdrop-blur-0 md:p-0 md:rounded-none 
                         max-w-[90%] md:max-w-xl min-h-[300px] 
                         flex flex-col justify-center text-left transition-all duration-500"
            >
              <h1 className="text-xl md:text-6xl font-bold leading-tight text-[#ff4b4b] font-['Open_Sans']">
                {slide.titleRed}
                <br />
                <span className="text-black">{slide.titleBlack}</span>
              </h1>

              <div className="w-14 md:w-20 h-1 bg-[#ff4b4b] my-3" />

              <p className="text-sm md:text-lg text-black mb-5 max-w-sm font-['Work_Sans']">
                {slide.description}
              </p>

              <div className="flex items-center space-x-4 mt-2 font-['Work_Sans']">
                <button
                  onClick={() => navigate("/examen")}
                  className="bg-black text-white px-6 py-3 rounded-full text-base md:text-lg font-medium hover:scale-105 transition-transform"
                >
                  Consulter
                </button>

                {/* Bouton TikTok */}
                <div
                  className="w-12 h-12 md:w-14 md:h-14 border border-[#ff4b4b] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_8px_rgba(255,75,75,0.25)] cursor-pointer"
                  onClick={() =>
                    window.open(
                      "https://www.tiktok.com/@upb_students",
                      "_blank"
                    )
                  }
                >
                  <img
                    src={linkIcon}
                    alt="Lien TikTok"
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Indicateurs stylisés */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              current === index
                ? "bg-[#ff4b4b] border-[#ff4b4b]"
                : "bg-transparent border-[#ff4b4b]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
