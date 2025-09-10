import doc1 from "../assets/Docs/doc1.png";
import doc2 from "../assets/Docs/doc2.png";
import doc3 from "../assets/Docs/doc3.png";
import doc4 from "../assets/Docs/doc4.png";
import doc5 from "../assets/Docs/doc5.png";
import doc6 from "../assets/Docs/doc6.png";
import doc7 from "../assets/Docs/doc7.png";
import doc8 from "../assets/Docs/doc8.png";

export const documents = [
  {
    title: "TD Analyse de donnée",
    year: "2024",
    level: "Licence 2",
    cover: doc1,
  },
  {
    title: "Examen Micro économie",
    year: "Session1 / 2023",
    level: "Licence 2",
    cover: doc2,
  },
  {
    title: "TD Réseaux des ordinateurs",
    year: "2022",
    level: "Licence 1",
    cover: doc3,
  },
  {
    title: "Maths du signal",
    year: "2024",
    level: "Licence 3",
    cover: doc4,
  },
  {
    title: "TD Droit public",
    year: "2023",
    level: "Licence 2",
    cover: doc5,
  },
  {
    title: "Examen Macro économie",
    year: "Session1 / 2021",
    level: "Licence 1",
    cover: doc6,
  },
  {
    title: "Examen Droit romain",
    year: "Session2 / 2025",
    level: "Licence 3",
    cover: doc7,
  },
  {
    title: "TD RIT",
    year: "...",
    level: "Licence 1",
    cover: doc8,
  },
];

// On réutilise les images et on crée des listes pour Featured et Latest
export const featuredDocs = documents.slice(0, 6); // 6 documents
export const latestDocs = documents.slice(0, 4); // 4 documents
