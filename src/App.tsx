import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { AuthModal } from "./components/auth/AuthModal";
import { AppShell } from "./components/layout/AppShell";
import { WelcomeGuide } from "./components/onboarding/WelcomeGuide";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Skeleton } from "./components/ui/Feedback";
import { AuthProvider } from "./context/AuthContext";
import { DocumentsProvider } from "./context/DocumentsContext";
import { PrefsProvider } from "./context/PrefsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { pageTransition, TRANSITION } from "./lib/motion";
import Documents from "./pages/Documents";
import Home from "./pages/Home";

// Secondary pages are split out of the main bundle.
const Bibliotheque = lazy(() => import("./pages/Bibliotheque"));
const Proposer = lazy(() => import("./pages/Proposer"));
const Ajouter = lazy(() => import("./pages/Ajouter"));
const Profil = lazy(() => import("./pages/Profil"));
const Propositions = lazy(() => import("./pages/Propositions"));
const Contact = lazy(() => import("./pages/Contact"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="page" role="status" aria-label="Chargement…">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-9 w-72 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

/** The former "Examen, TD & TP" page now lives at /documents. */
function LegacyExamRedirect() {
  const [params] = useSearchParams();
  const query = params.get("query");
  return <Navigate to={query ? `/documents?q=${encodeURIComponent(query)}` : "/documents"} replace />;
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="flex flex-1 flex-col" {...pageTransition}>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </ErrorBoundary>
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Home /></Page>} />
        <Route path="/documents" element={<Page><Documents /></Page>} />
        <Route path="/bibliotheque" element={<Page><Bibliotheque /></Page>} />
        <Route path="/examen" element={<LegacyExamRedirect />} />
        <Route path="/proposer" element={<Page><Proposer /></Page>} />
        <Route path="/ajouter" element={<Page><Ajouter /></Page>} />
        <Route path="/profil" element={<Page><Profil /></Page>} />
        <Route path="/propositions" element={<Page><Propositions /></Page>} />
        <Route path="/contact" element={<Page><Contact /></Page>} />
        <Route path="/mot-de-passe-oublie" element={<Page><ResetPassword /></Page>} />
        <Route path="*" element={<Page><NotFound /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      {/* Default for every animation that does not pick a preset. */}
      <MotionConfig reducedMotion="user" transition={TRANSITION.standard}>
        <BrowserRouter>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <DocumentsProvider>
                  <PrefsProvider>
                    <AppShell>
                      <AnimatedRoutes />
                    </AppShell>
                    <AuthModal />
                    <WelcomeGuide />
                  </PrefsProvider>
                </DocumentsProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}
