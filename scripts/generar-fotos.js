// Crea assets/js/fotos.js con la lista de fotos que hay en assets/img/productos/.
// GitHub lo ejecuta solo cada vez que se sube un cambio (ver .github/workflows/publicar.yml).
// Para probar en tu computador: node scripts/generar-fotos.js

const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const carpeta = path.join(raiz, "assets", "img", "productos");
const salida = path.join(raiz, "assets", "js", "fotos.js");

const FORMATOS = [".webp", ".jpg", ".jpeg", ".png", ".avif"];

const fotos = fs.readdirSync(carpeta)
  .filter(archivo => FORMATOS.includes(path.extname(archivo).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, "es"));

fs.writeFileSync(
  salida,
  "// Archivo generado automáticamente. No lo edites: se reescribe al publicar.\n" +
  "const FOTOS = " + JSON.stringify(fotos, null, 2) + ";\n"
);

console.log(fotos.length + " fotos en el catálogo:");
fotos.forEach(f => console.log("  " + f));
