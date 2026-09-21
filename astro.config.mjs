import { defineConfig } from "astro/config";

export default defineConfig({
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  devToolbar: { enabled: false },
  vite: {
    build: {
      minify: "esbuild",
      cssMinify: true,
    },
  },
});
