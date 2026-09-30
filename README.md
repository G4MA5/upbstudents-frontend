# UpB Student's — Frontend

Bibliothèque numérique de l'Université Polytechnique de Bingerville.
React 19 · Vite · Tailwind CSS · Framer Motion.

## Démarrage

```bash
npm install
npm run dev
```

L'URL de l'API se règle avec `VITE_API_URL` (voir `.env.example`).
En local, l'API de production refuse l'origine `localhost` (CORS) : lancez
le backend en local ou ajoutez l'origine à `ALLOWED_ORIGINS` côté backend.

## Organisation

- `src/context/` — état global : `AuthContext` (session, rafraîchissement,
  fenêtre de connexion unique), `DocumentsContext` (bibliothèque chargée une
  seule fois), `ToastContext` (notifications).
- `src/lib/` — client API, recherche, formats, stockage local sécurisé.
- `src/components/ui/` — primitives (boutons, champs, fenêtres, états).
- `src/components/documents/` — cartes, filtres, aperçu (PDF chargé à la demande).
- `src/components/contribute/` — formulaires d'ajout et de proposition.
- `src/pages/` — une page par route.

Routes : `/`, `/documents` (ancien `/examen`, redirigé), `/proposer`,
`/ajouter`, `/profil`, `/propositions`, `/contact`, `/mot-de-passe-oublie`.
