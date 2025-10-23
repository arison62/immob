import { join, resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type UserConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Vous pouvez utiliser 'UserConfig' pour un typage complet si vous préférez,
// ou simplement 'defineConfig' qui infère les types.
export default defineConfig(({ mode }): UserConfig => {
  // Le mode est maintenant explicitement typé par defineConfig,
  // mais loadEnv a besoin de 'mode' et du chemin pour charger les variables.
  const env = loadEnv(mode, process.cwd(), "");

  const INPUT_DIR = "./frontend";
  const OUTPUT_DIR = "./frontend/dist";

  // Assurez-vous que DJANGO_VITE_DEV_SERVER_PORT est traité comme un nombre si possible,
  // ou laissez-le comme chaîne si c'est ce que 'port' attend (Vite le gère bien).
  const devServerPort = parseInt(env.DJANGO_VITE_DEV_SERVER_PORT) || 5173;

  return {
    // Plugins
    plugins: [tailwindcss(), react()],

    // Alias de résolution
    resolve: {
      alias: {
        "@": resolve(INPUT_DIR, "js"),
      },
    },

    // Répertoire racine
    root: resolve(INPUT_DIR),

    // Base URL de déploiement
    base: "/static/",

    // Configuration du serveur de développement
    server: {
      host: "0.0.0.0",
      cors: true,
      port: devServerPort, // Utilisation de la variable typée
      watch: {
        usePolling: true,
      },
    },

    // Configuration du build (production)
    build: {
      manifest: "manifest.json",
      emptyOutDir: true,
      outDir: resolve(OUTPUT_DIR),
      rollupOptions: {
        input: {
          main: join(INPUT_DIR, "js/main.tsx"),
          css: join(INPUT_DIR, "css/main.css"),
        },
      },
    },
  };
});
