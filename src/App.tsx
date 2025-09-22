import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Examen from "./pages/Examen";
import Ajouter from "./pages/Ajouter";
import ResetPassword from "./pages/ResetPassword";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProfileModal from "./components/ProfileModal";

// Composant pour gérer l'animation sur chaque page
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/contact"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Contact />
            </motion.div>
          }
        />
        <Route
          path="/examen"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Examen />
            </motion.div>
          }
        />

        <Route
          path="/ajouter"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Ajouter />
            </motion.div>
          }
        />
        <Route
          path="/mot-de-passe-oublie"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResetPassword />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const openProfileModal = () => setIsProfileOpen(true);
  const closeProfileModal = () => setIsProfileOpen(false);

  return (
    <Router>
      <Navbar />

      {/* Routes animées */}
      <AnimatedRoutes />

      <Footer openProfileModal={openProfileModal} />

      {isProfileOpen && <ProfileModal closeModal={closeProfileModal} />}
    </Router>
  );
};

export default App;
