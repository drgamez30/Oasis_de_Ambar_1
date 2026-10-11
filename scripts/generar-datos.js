// Crea assets/js/datos.js con dos listas:
//   FOTOS  las fotos que hay en assets/img/productos/
//   EXCEL  los perfumes escritos en perfumes.xlsx (hoja "Perfumes")
// GitHub lo ejecuta solo cada vez que se sube un cambio (ver .github/workflows/publicar.yml).
// Para probar en tu computador: node scripts/generar-datos.js

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const raiz = path.join(__dirname, "..");
const carpetaFotos = path.join(raiz, "assets", "img", "productos");
const archivoExcel = path.join(raiz, "perfumes.xlsx");
const salida = path.join(raiz, "assets", "js", "datos.js");

// 1. Fotos

const FORMATOS = [".webp", ".jpg", ".jpeg", ".png", ".avif"];

const fotos = fs.readdirSync(carpetaFotos)
  .filter(archivo => FORMATOS.includes(path.extname(archivo).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, "es"));

// 2. Lectura del Excel
// Un .xlsx es un zip con archivos XML adentro. Se lee aquí mismo para no depender de programas externos.

function abrirZip(buffer) {
  const fin = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (fin < 0) throw new Error("no es un archivo de Excel (.xlsx) válido");
  const total = buffer.readUInt16LE(fin + 10);
  let pos = buffer.readUInt32LE(fin + 16);
  const archivos = {};

  for (let i = 0; i < total; i++) {
    const metodo = buffer.readUInt16LE(pos + 10);
    const comprimido = buffer.readUInt32LE(pos + 20);
    const largoNombre = buffer.readUInt16LE(pos + 28);
    const largoExtra = buffer.readUInt16LE(pos + 30);
    const largoComentario = buffer.readUInt16LE(pos + 32);
    const cabecera = buffer.readUInt32LE(pos + 42);
    const nombre = buffer.toString("utf8", pos + 46, pos + 46 + largoNombre);

    const inicio = cabecera + 30 + buffer.readUInt16LE(cabecera + 26) + buffer.readUInt16LE(cabecera + 28);
    const datos = buffer.subarray(inicio, inicio + comprimido);
    archivos[nombre] = () => (metodo === 0 ? datos : zlib.inflateRawSync(datos)).toString("utf8");

    pos += 46 + largoNombre + largoExtra + largoComentario;
  }
  return archivos;
}

function texto(xml) {
  return xml
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/_x000D_/g, "");
}

function atributo(etiqueta, nombre) {
  const m = etiqueta.match(new RegExp('\\b' + nombre + '="([^"]*)"'));
  return m ? texto(m[1]) : "";
}

// Junta todos los <t>...</t> de un bloque (un texto con formato viene partido en varios)
function textoDe(bloque) {
  const partes = bloque.replace(/<rPh\b[\s\S]*?<\/rPh>/g, "").match(/<t\b[^>]*>[\s\S]*?<\/t>/g) || [];
  return partes.map(t => texto(t.replace(/<[^>]+>/g, ""))).join("");
}

// Devuelve la hoja "Perfumes" (o la primera) como una lista de filas, cada una con sus celdas
function leerHoja(archivos) {
  const libro = archivos["xl/workbook.xml"]();
  const hojas = libro.match(/<sheet\b[^>]*>/g) || [];
  const elegida = hojas.find(h => clave(atributo(h, "name")) === "perfumes") || hojas[0];
  const relaciones = archivos["xl/_rels/workbook.xml.rels"]().match(/<Relationship\b[^>]*>/g) || [];
  const relacion = relaciones.find(r => atributo(r, "Id") === atributo(elegida, "r:id"));
  const destino = atributo(relacion, "Target").replace(/^\/?(xl\/)?/, "xl/");

  const compartidos = archivos["xl/sharedStrings.xml"]
    ? (archivos["xl/sharedStrings.xml"]().match(/<si\b[^>]*>[\s\S]*?<\/si>|<si\/>/g) || []).map(textoDe)
    : [];

  const filas = [];
  for (const [, contenido] of archivos[destino]().matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const fila = [];
    for (const [, atributos, interior = ""] of contenido.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const letras = atributo(atributos, "r").replace(/\d/g, "");
      const columna = [...letras].reduce((n, l) => n * 26 + l.charCodeAt(0) - 64, 0) - 1;
      const tipo = atributo(atributos, "t");
      const valor = (interior.match(/<v\b[^>]*>([\s\S]*?)<\/v>/) || [])[1];

      let celda = "";
      if (tipo === "inlineStr") celda = textoDe(interior);
      else if (valor === undefined) celda = "";
      else if (tipo === "s") celda = compartidos[Number(valor)] || "";
      else if (tipo === "b") celda = valor === "1" ? "Sí" : "No";
      else celda = texto(valor);
      fila[columna] = celda.trim();
    }
    filas.push(fila);
  }
  return filas;
}

// 3. De filas a perfumes

// "Notas de Corazón" y "notas de corazon" dan la misma clave
function clave(valor) {
  return String(valor || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

// Título de la columna en el Excel -> nombre del dato
const COLUMNAS = {
  "referencia": "ref",
  "nombre": "nombre",
  "marca": "marca",
  "estilo": "estilo",
  "familia": "familia",
  "presentacion": "presentacion",
  "descripcion": "descripcion",
  "notas de salida": "salida",
  "notas de corazon": "corazon",
  "notas de fondo": "fondo",
  "intensidad salida": "intensidadSalida",
  "intensidad corazon": "intensidadCorazon",
  "intensidad fondo": "intensidadFondo",
  "duracion": "duracion",
  "estela": "estela",
  "dulzor": "dulzor",
  "frescura": "frescura",
  "etiqueta": "etiqueta",
  "destacado": "destacado",
  "disponible": "disponible",
  "foto": "foto"
};

function leerPerfumes() {
  if (!fs.existsSync(archivoExcel)) {
    console.log("No hay perfumes.xlsx: el catálogo usa solo productos.js y las fotos.");
    return [];
  }

  const filas = leerHoja(abrirZip(fs.readFileSync(archivoExcel)));
  const inicio = filas.findIndex(f => f.some(c => clave(c) === "nombre"));
  if (inicio < 0) throw new Error('perfumes.xlsx no tiene la columna "Nombre"');

  const titulos = filas[inicio].map(t => COLUMNAS[clave(t)]);
  filas[inicio].forEach((t, i) => {
    if (t && !titulos[i]) console.log(`Aviso: la columna "${t}" no se reconoce y se ignora.`);
  });

  const perfumes = [];
  filas.slice(inicio + 1).forEach((fila, i) => {
    const perfume = {};
    titulos.forEach((dato, columna) => {
      if (dato && fila[columna]) perfume[dato] = fila[columna];
    });
    if (perfume.nombre) perfumes.push(perfume);
    else if (Object.keys(perfume).length) console.log(`Aviso: la fila ${inicio + i + 2} no tiene nombre y se ignora.`);
  });
  return perfumes;
}

const perfumes = leerPerfumes();

// 4. Archivo final

fs.writeFileSync(
  salida,
  "// Archivo generado automáticamente. No lo edites: se reescribe al publicar.\n" +
  "const FOTOS = " + JSON.stringify(fotos, null, 2) + ";\n\n" +
  "const EXCEL = " + JSON.stringify(perfumes, null, 2) + ";\n"
);

console.log(fotos.length + " fotos:");
fotos.forEach(f => console.log("  " + f));
console.log(perfumes.length + " perfumes en perfumes.xlsx:");
perfumes.forEach(p => console.log("  " + p.nombre));
