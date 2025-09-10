import React, { useState } from "react";
import { MapPin, Mail, Smartphone } from "lucide-react";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    objet: "",
    message: "",
  });

  // ✅ On utilise string | null pour pouvoir afficher un message spécifique
  const [messageEnvoye, setMessageEnvoye] = useState(false);
  const [erreurMessage, setErreurMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nom, email, objet, message } = formData;

    // --- 1️⃣ Vérification des champs vides ---
    const nomVal = nom.trim();
    const emailVal = email.trim();
    const objetVal = objet.trim();
    const messageVal = message.trim();

    if (!nomVal || !emailVal || !objetVal || !messageVal) {
      setErreurMessage("❌ Veuillez remplir tous les champs correctement.");
      setMessageEnvoye(false);
      setTimeout(() => setErreurMessage(null), 4000);
      return;
    }

    // --- 2️⃣ Vérification email simple ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      setErreurMessage("❌ Veuillez entrer un email valide.");
      setMessageEnvoye(false);
      setTimeout(() => setErreurMessage(null), 4000);
      return;
    }

    // --- 3️⃣ Envoi au backend ---
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nomVal,
          email: emailVal,
          objet: objetVal,
          message: messageVal,
        }),
      });

      if (res.ok) {
        setMessageEnvoye(true);
        setErreurMessage(null);
        setFormData({ nom: "", email: "", objet: "", message: "" });
        setTimeout(() => setMessageEnvoye(false), 4000);
      } else {
        setErreurMessage("❌ Erreur lors de l'envoi du message.");
      }
    } catch (err) {
      console.error(err);
      setErreurMessage("❌ Erreur lors de l'envoi du message.");
    }
  };

  return (
    <div className="bg-white">
      {/* Bandeau supérieur */}
      <div className="bg-gray-200 py-4">
        <h1 className="text-center font-bold text-lg md:text-2xl">
          CONTACTEZ-NOUS
        </h1>
      </div>

      {/* Contenu principal */}
      <div className="w-full max-w-[clamp(320px,90%,1200px)] mx-auto px-4 md:px-12 lg:px-20 py-12 flex flex-col md:flex-row md:items-start gap-1">
        {/* Infos de contact */}
        <div className="md:w-1/2 space-y-8">
          <h2 className="text-3xl font-semibold text-gray-800">
            Contactez-nous
          </h2>

          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 text-gray-700 mt-1" />
            <p className="text-gray-700">
              Université Polytechnique de Bingerville, Route de Bingerville,
              Bingerville, Abidjan, Côte d'Ivoire
            </p>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-gray-700 mt-1" />
            <p className="text-gray-700">contact@upb.edu.ci</p>
          </div>

          <div className="flex items-start gap-4">
            <Smartphone className="w-6 h-6 text-gray-700 mt-1" />
            <p className="text-gray-700">+225 27 22 49 92 22</p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="md:w-[45%] w-full bg-white shadow-lg rounded-md p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Votre nom"
              className="w-full border border-gray-300 px-4 py-3 rounded-md text-sm focus:outline-none"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Votre adresse e-mail"
              className="w-full border border-gray-300 px-4 py-3 rounded-md text-sm focus:outline-none"
            />
            <input
              type="text"
              name="objet"
              value={formData.objet}
              onChange={handleChange}
              placeholder="Objet du message"
              className="w-full border border-gray-300 px-4 py-3 rounded-md text-sm focus:outline-none"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Votre message"
              className="w-full border border-gray-300 px-4 py-3 rounded-md text-sm h-32 resize-none focus:outline-none"
            />

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-md text-sm font-semibold hover:bg-gray-800 transition"
            >
              Envoyer le message
            </button>

            {/* Affichage des messages */}
            {messageEnvoye && (
              <p className="text-green-600 text-sm text-center">
                ✅ Votre message a été envoyé avec succès !
              </p>
            )}

            {erreurMessage && (
              <p className="text-red-600 text-sm text-center">
                {erreurMessage}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Carte Google Maps */}
      <div className="px-4 md:px-20 mt-12 mb-20">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Où nous trouver ?
        </h2>
        <div className="w-full h-[400px] shadow-lg rounded-lg overflow-hidden">
          <iframe
            title="Université Polytechnique de Bingerville"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.1509163875135!2d-3.898872889165489!3d5.393961335234709!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc18d10bfa0efe5%3A0x6552832fd69de896!2sUniversit%C3%A9%20Polytechnique%20de%20Bingerville%20(UPB)!5e0!3m2!1sfr!2sci!4v1753669226398!5m2!1sfr!2sci"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
