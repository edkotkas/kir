/// <reference types="vitest/config" />

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const tauriHost = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig(() => ({
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
    react()
  ]
}))
