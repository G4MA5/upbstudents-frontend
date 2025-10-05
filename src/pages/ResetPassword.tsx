import React, { useState } from "react";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleReset() {
    if (password !== confirm) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    // récupère le token envoyé dans l'URL
    const access_token = new URLSearchParams(
      window.location.hash.substring(1)
    ).get("access_token");

    if (!access_token) {
      alert("Token manquant !");
      return;
    }

    const res = await fetch(
      "https://upbstudents-backend-1u7x.vercel.app/api/reset",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token, new_password: password }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      alert("Mot de passe changé !");
      window.location.href = "/"; // redirection page d’accueil
    } else {
      alert("Erreur: " + data.error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          Réinitialiser le mot de passe
        </h2>

        <div className="mb-4 relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
            className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <span
            className="absolute right-4 top-3 cursor-pointer text-gray-500"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? "X" : "👁"}
          </span>
        </div>

        <div className="mb-4 relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirmer le mot de passe"
            className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <span
            className="absolute right-4 top-3 cursor-pointer text-gray-500"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "X" : "👁"}
          </span>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 bg-orange-300 text-white font-semibold rounded-full hover:bg-orange-400 transition"
        >
          Valider
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
