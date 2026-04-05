/**
 * Genera AVIF + WebP desde SVG en assets/ hacia public/assets/.
 * Ejecutar antes del deploy: npm run assets:images
 * (Los SVG con bitmap embebido pesan varios MB; el sitio debe servir estos formatos en producción.)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assetsDir = path.join(root, "assets");
const outDir = path.join(root, "public", "assets");

const jobs = [
  { src: "primera_imagen.svg", base: "primera_imagen", width: 1400 },
  { src: "segunda_imagen.svg", base: "segunda_imagen", width: 1400 },
];

async function main() {
  if (!fs.existsSync(assetsDir)) {
    console.warn("optimize-hero-images: no existe la carpeta assets/. Omisión.");
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });

  for (const { src, base, width } of jobs) {
    const input = path.join(assetsDir, src);
    if (!fs.existsSync(input)) {
      console.warn(`optimize-hero-images: falta ${src}, se omite ${base}.*`);
      continue;
    }

    const resized = sharp(input).resize({ width, withoutEnlargement: true });

    const avifPath = path.join(outDir, `${base}.avif`);
    await resized.clone().avif({ quality: 65, effort: 6 }).toFile(avifPath);
    console.log(`OK ${base}.avif (${Math.round(fs.statSync(avifPath).size / 1024)} KB)`);

    const webpPath = path.join(outDir, `${base}.webp`);
    await resized.clone().webp({ quality: 82, effort: 6 }).toFile(webpPath);
    console.log(`OK ${base}.webp (${Math.round(fs.statSync(webpPath).size / 1024)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
