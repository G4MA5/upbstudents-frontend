import React from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Compact fallback for a section instead of the whole page. */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches rendering errors so a failure (old browser, unexpected data…)
 * shows a French message instead of a blank white page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[interface]", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold">Un problème d'affichage est survenu</h1>
        <p className="mt-2 max-w-md text-ink-muted">
          Rechargez la page. Si le problème persiste, mettez à jour votre
          navigateur ou contactez-nous.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Recharger la page
        </button>
      </div>
    );
  }
}
