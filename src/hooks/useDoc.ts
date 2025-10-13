// src/hooks/useDocuments.ts
import { useState, useEffect } from "react";

export interface DocumentType {
  title: string;
  image: string;
  annee: string;
  licence: string;
  filiere: string;
  session: string;
  type: string;
  file_url: string;

  id: number;
  filePath: string;
}

export function useDocuments() {
  const [document, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch(
          "https://upbstudents-backend-6.vercel.app/api/afficher",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );
        const data = await res.json();
        setDocuments(data.document || []);
      } catch (err) {
        console.error("Erreur de fetch documents:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDocs();
  }, []);

  return { document, loading, setDocuments };
}
