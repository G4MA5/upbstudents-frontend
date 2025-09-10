import React, { useEffect, useRef, useState } from "react";
import sjapImg from "../assets/sjap.png";
import assriImg from "../assets/assri.png";
import miageImg from "../assets/miage.png";
import seaImg from "../assets/sea.png";
import segImg from "../assets/seg.png";
import threeEAImg from "../assets/3A.png";

const categories = [
  { image: sjapImg, alt: "SJAP" },
  { image: assriImg, alt: "ASSRI" },
  { image: miageImg, alt: "MIAGE" },
  { image: seaImg, alt: "SEA" },
  { image: segImg, alt: "SEG" },
  { image: threeEAImg, alt: "3EA" },
];

const Categories: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollSpeed = 0.5; // pixels par frame
    let animationFrameId: number;

    const scrollStep = () => {
      if (container && isScrolling) {
        container.scrollLeft += scrollSpeed;

        // Reset fluide quand on atteint la moitié (pour boucle infinie)
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft -= container.scrollWidth / 2;
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isScrolling]);

  return (
    <div className="bg-white py-10 px-6 md:px-20 overflow-hidden">
      <div
        ref={scrollRef}
        className="flex gap-6 w-full overflow-x-auto scrollbar-hide"
        onMouseEnter={() => setIsScrolling(false)}
        onMouseLeave={() => setIsScrolling(true)}
        onTouchStart={() => setIsScrolling(false)}
        onTouchEnd={() => setIsScrolling(true)}
      >
        {[...categories, ...categories].map((cat, index) => (
          <div key={index} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/5">
            <img
              src={cat.image}
              alt={cat.alt}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <style>{`
        /* Cache la scrollbar */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Augmenter un peu la taille des images sur mobile */
        @media (max-width: 640px) {
          .flex-shrink-0 img {
            max-height: 180px; /* par exemple */
          }
        }
      `}</style>
    </div>
  );
};

export default Categories;
