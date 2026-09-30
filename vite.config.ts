import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: [
        // The modern pdf.js build relies on very recent browser APIs
        // (Promise.withResolvers, Uint8Array.fromBase64…) that older iOS
        // Safari and Android WebViews lack. The legacy build ships polyfills.
        { find: /^pdfjs-dist$/, replacement: "pdfjs-dist/legacy/build/pdf.mjs" },
      ],
    },
    server: {
      // In development the page calls /api on its own origin and Vite
      // forwards it to the backend: no cross-origin request, so no CORS.
      // VITE_API_PROXY can point to another backend (e.g. the Vercel one).
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY || "http://localhost:3000",
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      // The only large chunks (pdf.js, mammoth) are lazy-loaded on preview.
      chunkSizeWarningLimit: 600,
      target: ["es2020", "safari14", "chrome87", "firefox78", "edge88"],
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            motion: ["framer-motion"],
          },
        },
      },
    },
  };
});
