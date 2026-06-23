/// <reference types="vitest/config" />

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const tauriHost = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  clearScreen: false,
  server: {
    host: tauriHost || false,
    port: 1420,
    strictPort: true,
    hmr: tauriHost
      ? {
          protocol: "ws",
          host: tauriHost,
          port: 1421
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"]
    },
    allowedHosts: ["kuro", "kuro.local"]
  },
  build: {
    chunkSizeWarningLimit: 750
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/test/**",
        "src/**/*.d.ts",
        "src/components/TitleBar.tsx",
        "src/pages/generate/GeneratePage.tsx",
        "src/pages/settings/SettingsPage.tsx",
        "src/state/QrStore.tsx"
      ]
    }
  },
  plugins: [
    tailwindcss({
      optimize: {
        minify: true
      }
    }),
    react(),
    VitePWA({
      disable: command === "serve",
      registerType: "autoUpdate",
      manifest: {
        name: "kir",
        short_name: "kir",
        description: "Offline QR generator and scanner",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      }
    })
  ]
}));
