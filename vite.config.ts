import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Define la ruta base para que los archivos se encuentren en GitHub Pages
  base: "/BasketScore-Lovable/", 
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      // Usamos una ruta absoluta segura para el entorno de GitHub
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
}));
