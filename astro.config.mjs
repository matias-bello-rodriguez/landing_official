import { defineConfig } from "astro/config";

export default defineConfig({
  compressHTML: true,
  devToolbar: { enabled: false },
  vite: {
    build: {
      minify: "esbuild",
      cssMinify: true,
    },
  },
});
