import { defineConfig } from "astro/config"
import path from "path"

import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

// Vite proxy is only for local development
// In production (Cloudflare Pages), requests go directly to PUBLIC_API_BASE
const isDev = process.env.NODE_ENV !== 'production'
const target = process.env.PUBLIC_API_BASE || "http://localhost:8080"

export default defineConfig({
  output: "server",
  adapter: cloudflare(),

  // Vite configuration
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    ...(isDev ? {
      server: {
        proxy: {
          "/api": {
            target,
            changeOrigin: true,
            secure: false,
            cookieDomainRewrite: "localhost",
            cookiePathRewrite: "/",
          },
        },
      },
    } : {}),
  },

  integrations: [tailwind(), react()],
})