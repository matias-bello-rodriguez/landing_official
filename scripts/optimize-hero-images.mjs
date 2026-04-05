/**
 * Genera AVIF optimizados desde SVG en assets/ hacia public/assets/.
 * Coloca tus ilustraciones en assets/primera_imagen.svg y assets/segunda_imagen.svg.
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
  { src: "primera_imagen.svg", dest: "primera_imagen.avif", width: 1400 },
  { src: "segunda_imagen.svg", dest: "segunda_imagen.avif", width: 1400 },
];

async function main() {
  if (!fs.existsSync(assetsDir)) {
    console.warn("optimize-hero-images: no existe la carpeta assets/. Omisión.");
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });

  for (const { src, dest, width } of jobs) {
    const input = path.join(assetsDir, src);
    const output = path.join(outDir, dest);

    if (!fs.existsSync(input)) {
      console.warn(`optimize-hero-images: falta ${src}, se omite ${dest}.`);
      continue;
    }

    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 65, effort: 6 })
      .toFile(output);

    const stat = fs.statSync(output);
    console.log(`OK ${dest} (${Math.round(stat.size / 1024)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
