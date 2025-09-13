import React, { useState } from "react";
import upbLogo from "../assets/upblogo.png";
import { Upload } from "lucide-react";
import DropdownMenu from "../components/DropdownMenu";
import ProfileModal from "../components/ProfileModal"; // Ajout import

const Ajouter: React.FC = () => {
  const [formData, setFormData] = useState({
    filiere: "",
    session: "",
    annee: "",
    type: "",
    matiere: "",
    password: "",
    niveau: "",
    document: null as File | null,
  });

  const [showProfileModal, setShowProfileModal] = useState(false); // Ajout état

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, document: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.document) {
      alert("❌ Veuillez sélectionner un fichier !");
      return;
    }
    if (
      !formData.filiere ||
      !formData.session ||
      !formData.annee ||
      !formData.type ||
      !formData.matiere ||
      !formData.niveau ||
      !formData.password
    ) {
      alert("❌ Veuillez remplir tous les champs !");
      return;
    }

    const token = localStorage.getItem("supa_token");
    if (!token) {
      setShowProfileModal(true); // Affiche le modal
      return;
    }

    try {
      const body = new FormData();
      body.append("filiere", formData.filiere);
      body.append("session", formData.session);
      body.append("annee", formData.annee);
      body.append("type", formData.type);
      body.append("matiere", formData.matiere);
      body.append("password", formData.password);
      body.append("niveau", formData.niveau);
      body.append("document", formData.document);

      const res = await fetch(
        "https://upbstudents-backend-bibliotheque.vercel.app/api/document",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        }
      );

      const data = await res.json();

      if (res && data.status === "ok") {
        alert("✅ Document ajouté avec succès !");
        setFormData({
          filiere: "",
          session: "",
          annee: "",
          type: "",
          matiere: "",
          password: "",
          niveau: "",
          document: null,
        });
      } else {
        alert("❌ Erreur : " + data.message);
      }
    } catch (err) {
      alert("❌ Une erreur est survenue : " + err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white font-sen">
      {showProfileModal && (
        <ProfileModal closeModal={() => setShowProfileModal(false)} />
      )}
      {/* Bande grise pleine largeur */}
      <div className="w-full bg-gray-100 py-4 px-6 mb-6">
        <h1 className="text-center font-bold text-lg md:text-2xl">
          FORMULAIRE D'ENREGISTREMENT
        </h1>
      </div>

      {/* Carte principale */}
      <div className="flex flex-col md:flex-row w-full max-w-[1200px] min-h-[650px] rounded-2xl shadow-2xl overflow-hidden mb-10">
        {/* Partie gauche : formulaire blanc */}
        <div className="w-full md:w-1/2 bg-white p-12 flex flex-col justify-center items-center order-2 md:order-1">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={upbLogo} alt="UPB Logo" className="w-24 h-24" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropdownMenu
                label="Filière"
                options={["MIAGE", "ASSRI", "SEA", "SEG", "3EA", "SJAP", "RIT"]}
                onSelect={(value) => handleChange("filiere", value)}
              />
              <DropdownMenu
                label="Session"
                options={["Session 1", "Session 2"]}
                onSelect={(value) => handleChange("session", value)}
              />
              <DropdownMenu
                label="Année"
                options={["2025", "2024", "2023", "2022"]}
                onSelect={(value) => handleChange("annee", value)}
              />
              <DropdownMenu
                label="Type de doc"
                options={["Examen", "TD", "TP"]}
                onSelect={(value) => handleChange("type", value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DropdownMenu
                label="Niveau"
                options={[
                  "Licence 1",
                  "Licence 2",
                  "Licence 3",
                  "Master 1",
                  "Master 2",
                ]}
                onSelect={(value) => handleChange("niveau", value)}
              />
              <input
                type="text"
                name="matiere"
                placeholder="Nom matière"
                value={formData.matiere}
                onChange={(e) => handleChange("matiere", e.target.value)}
                className="border rounded-full px-4 py-2 w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="border rounded-full px-4 py-2 w-full"
              />
              <label className="flex items-center justify-between border rounded-full px-4 py-2 cursor-pointer bg-gray-50 hover:bg-gray-100">
                <span>
                  {formData.document
                    ? formData.document.name
                    : "Ajouter document"}
                </span>
                <Upload size={18} />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-1/2 mx-auto bg-blue-900 text-white py-2 rounded-full hover:bg-blue-800 block"
            >
              Valider
            </button>
          </form>
        </div>

        {/* Partie droite : texte orange */}
        <div
          className="hidden md:flex w-full md:w-1/2 flex-col justify-center items-center p-12 text-center order-1 md:order-2"
          style={{ backgroundColor: "#FFA766" }}
        >
          <h2 className="text-[36px] font-bold text-white mb-2">
            BIENVENUE SUR
          </h2>
          <h2 className="text-[49px] font-bold text-white mb-6">
            UPB STUDENT’S
          </h2>
          <p className="text-[20px] font-medium text-gray-100">
            Sur cet espace vous pourrez enregistrer d’autres documents encore et
            encore pour aider les étudiants à se préparer au mieux aux examens
            et TD. <br />
            Nous comptons sur la véracité de vos infos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Ajouter;
