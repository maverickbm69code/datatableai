import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { enterDevPlugin, enterProdPlugin } from 'vite-plugin-enter-dev';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // The site loads its own three font families in index.html, so the plugin's
  // catalogue of ~20 Google Fonts is not injected.
  const plugins: PluginOption[] = [
    ...enterProdPlugin({ injectGoogleFonts: false }),
  ];
  if (mode === 'development') {
    // The Enter dev plugin bundles its own React plugin.
    plugins.push(...enterDevPlugin());
  } else {
    plugins.push(react());
  }
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: plugins.filter(Boolean) as PluginOption[],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: '/',
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          // Long-lived vendor chunks stay cached between deploys.
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            motion: ["framer-motion"],
          },
        },
      },
    },
  };
});
