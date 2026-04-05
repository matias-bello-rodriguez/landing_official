/**
 * Genera AVIF + WebP responsivos (varios anchos) desde SVG en assets/ → public/assets/.
 * Ejecutar antes del deploy: npm run assets:images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assetsDir = path.join(root, "assets");
const outDir = path.join(root, "public", "assets");

/** Anchos alineados al layout (hero 2 cols ~45vw; about ancho de contenido) */
const jobs = [
  { src: "primera_imagen.svg", base: "primera_imagen", widths: [560, 840, 1120, 1400] },
  { src: "segunda_imagen.svg", base: "segunda_imagen", widths: [480, 720, 960, 1200] },
];

function removeLegacyRaster(base) {
  for (const ext of [".avif", ".webp"]) {
    const p = path.join(outDir, base + ext);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

async function main() {
  if (!fs.existsSync(assetsDir)) {
    console.warn("optimize-hero-images: no existe la carpeta assets/. Omisión.");
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });

  for (const { src, base, widths } of jobs) {
    const input = path.join(assetsDir, src);
    if (!fs.existsSync(input)) {
      console.warn(`optimize-hero-images: falta ${src}, se omite ${base}-*.`);
      continue;
    }

    removeLegacyRaster(base);

    for (const width of widths) {
      const resized = sharp(input).resize({ width, withoutEnlargement: true });

      const avifPath = path.join(outDir, `${base}-${width}.avif`);
      await resized.clone().avif({ quality: 65, effort: 6 }).toFile(avifPath);
      console.log(`OK ${base}-${width}.avif (${Math.round(fs.statSync(avifPath).size / 1024)} KB)`);

      const webpPath = path.join(outDir, `${base}-${width}.webp`);
      await resized.clone().webp({ quality: 82, effort: 6 }).toFile(webpPath);
      console.log(`OK ${base}-${width}.webp (${Math.round(fs.statSync(webpPath).size / 1024)} KB)`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
