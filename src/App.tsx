import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Examen from "./pages/Examen";
import Ajouter from "./pages/Ajouter";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProfileModal from "./components/ProfileModal";

const App: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const openProfileModal = () => setIsProfileOpen(true);
  const closeProfileModal = () => setIsProfileOpen(false);

  return (
    <Router>
      {/* Navbar avec ouverture du modal */}
      <Navbar />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/examen" element={<Examen />} />
        <Route path="/ajouter" element={<Ajouter />} />
      </Routes>

      {/* Footer avec ouverture du modal */}
      <Footer openProfileModal={openProfileModal} />

      {/* Modal du profil */}
      {isProfileOpen && <ProfileModal closeModal={closeProfileModal} />}
    </Router>
  );
};

export default App;
