// Mensajes de WhatsApp con formato fijo para poder automatizarlos.
// Cada mensaje lleva un "Código:" que empieza por #PEDIDO, #CONSULTA, #AVISO, #ASESORIA o #INFO.
// Un bot o una regla de respuesta automática puede leer ese código y la línea "Referencia:".

// 1. Ajustes
const MENSAJES = {
  saludo: "Hola, Oasis de Ámbar.",
  origen: "Catálogo web"
};

// 2. Utilidades

function linkWhatsApp(texto) {
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
}

function textoEstilo(id) {
  const e = ESTILOS.find(x => x.id === id);
  return e ? e.nombre : "";
}

function textoFamilias(familia) {
  const ids = Array.isArray(familia) ? familia : [familia];
  return ids.map(id => (FAMILIAS.find(f => f.id === id) || {}).nombre).filter(Boolean).join(", ");
}

// Solo agrega el enlace cuando la página ya está publicada en internet
function enlacePerfume(ref) {
  if (!location.protocol.startsWith("http")) return "";
  return location.origin + location.pathname + "?perfume=" + ref;
}

function fichaPerfume(p) {
  return [
    `*${p.nombre}*`,
    `Referencia: ${p.ref}`,
    `Estilo: ${textoEstilo(p.estilo)}`,
    `Familia: ${textoFamilias(p.familia)}`,
    `Presentación: ${p.presentacion}`
  ].join("\n");
}

function cierre(codigo, seccion, ref) {
  const lineas = [`Código: ${codigo}`, `Origen: ${MENSAJES.origen}${seccion ? " - " + seccion : ""}`];
  const enlace = ref ? enlacePerfume(ref) : "";
  if (enlace) lineas.push(enlace);
  return lineas.join("\n");
}

// 3. Tipos de mensaje

// Quiere comprar
function mensajePedido(p, seccion) {
  return `${MENSAJES.saludo} Quiero pedir este perfume:\n\n${fichaPerfume(p)}\n\n${cierre("#PEDIDO-" + p.ref, seccion, p.ref)}`;
}

// Tiene una duda sobre un perfume
function mensajeConsulta(p, seccion) {
  return `${MENSAJES.saludo} Tengo una pregunta sobre este perfume:\n\n${fichaPerfume(p)}\n\n${cierre("#CONSULTA-" + p.ref, seccion, p.ref)}\n\nMi pregunta: `;
}

// El perfume está agotado
function mensajeAviso(p, seccion) {
  return `${MENSAJES.saludo} Quiero que me avisen cuando vuelva este perfume:\n\n${fichaPerfume(p)}\n\n${cierre("#AVISO-" + p.ref, seccion, p.ref)}`;
}

// Viene del buscador guiado: solo cuenta lo que la persona eligió, sin suponer perfumes
function mensajeAsesoria(estilo, familia) {
  const lineas = [`${MENSAJES.saludo} Quiero asesoría para elegir un perfume.`, ""];
  if (estilo) lineas.push(`Es para: ${textoEstilo(estilo).replace("Para ", "")}`);
  if (familia) lineas.push(`Aroma que me atrae: ${textoFamilias(familia)}`);
  if (!estilo && !familia) lineas.push("Todavía no sé qué aroma busco.");
  lineas.push("", cierre("#ASESORIA", "Encuentra tu aroma"));
  return lineas.join("\n");
}

// Botones generales (barra, pie, botón flotante)
function mensajeGeneral() {
  return `${MENSAJES.saludo} Vi el catálogo y quiero información sobre sus perfumes.\n\n${cierre("#INFO")}`;
}

// Elige el mensaje correcto según si el perfume está disponible
function mensajeCompra(p, seccion) {
  return p.disponible ? mensajePedido(p, seccion) : mensajeAviso(p, seccion);
}
