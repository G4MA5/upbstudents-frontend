import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ isOpen, closeModal }) => {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  async function handleSend() {
    const res = await fetch(
      "https://upbstudents-backend-1u7x.vercel.app/api/forgot",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      alert(
        "Vérifie ton email nous vous avons envoyé un mail pour la récupération de votre mot de passe !"
      );
      closeModal();
    } else {
      alert("Erreur : " + data.error);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={closeModal}
      ></div>

      <div
        className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Mot de passe oublié</h2>
        <p className="text-gray-600 mb-4">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 border rounded-full text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 mb-4"
        />
        <button
          className="w-full py-3 bg-orange-300 text-white font-semibold rounded-full hover:bg-orange-400 transition hover:scale-105 active:scale-95 transition-transform duration-150"
          onClick={handleSend}
        >
          Envoyer
        </button>
        <button
          className="w-full py-3 mt-3 bg-red-300 text-white font-semibold rounded-full hover:bg-red-400 transition hover:scale-105 active:scale-95 transition-transform duration-150"
          onClick={closeModal}
        >
          Annuler
        </button>
      </div>
    </>
  );
};

export default ForgotPasswordModal;
