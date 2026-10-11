// 1. Utilidades

// Evita que un texto con < o > rompa el HTML
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

// Quita tildes y mayúsculas para que la búsqueda sea flexible
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// La familia puede ser un texto ("floral") o una lista (["amaderada", "ambarada"])
function familiasDe(p) {
  return Array.isArray(p.familia) ? p.familia : [p.familia];
}

function buscarPerfume(ref) {
  return PRODUCTOS.find(p => p.ref === ref);
}

// Estilo y familia del perfume, sin los que estén vacíos
function etiquetas(p) {
  return [textoEstilo(p.estilo), textoFamilias(p.familia)].filter(Boolean);
}

function spans(textos) {
  return textos.filter(Boolean).map(t => `<span>${escapar(t)}</span>`).join("");
}

const ESCALA_PERFIL = ["", "Muy baja", "Baja", "Media", "Alta", "Muy alta"];
const ESCALA_INTENSIDAD = ["", "Suave", "Ligera", "Media", "Intensa", "Muy intensa"];

// Barra de 5 segmentos para valores del 1 al 5
function medidor(nombre, valor, escala, detalle) {
  const v = Math.max(0, Math.min(5, Number(valor) || 0));
  const segmentos = [1, 2, 3, 4, 5]
    .map(n => `<i class="${n <= v ? "on" : ""}" style="--s:${n}"></i>`)
    .join("");
  return `
    <div class="medidor" role="img" aria-label="${escapar(nombre)}: ${v} de 5">
      <div class="medidor__texto">
        <span class="medidor__nombre">${escapar(nombre)}</span>
        ${detalle ? `<span class="medidor__detalle">${escapar(detalle)}</span>` : ""}
      </div>
      <span class="medidor__barra" aria-hidden="true">${segmentos}</span>
      <span class="medidor__valor">${escala[v] || ""}</span>
    </div>
  `;
}

// 2. Estado de los filtros (se guarda en la URL para poder compartirla)

const estado = { estilo: "todos", familia: "todas", texto: "" };

function leerUrl() {
  const params = new URLSearchParams(location.search);
  if (ESTILOS.some(e => e.id === params.get("estilo"))) estado.estilo = params.get("estilo");
  if (FAMILIAS.some(f => f.id === params.get("familia"))) estado.familia = params.get("familia");
  return params.get("perfume");
}

function guardarUrl(refAbierta) {
  const params = new URLSearchParams();
  if (estado.estilo !== "todos") params.set("estilo", estado.estilo);
  if (estado.familia !== "todas") params.set("familia", estado.familia);
  if (refAbierta) params.set("perfume", refAbierta);
  const query = params.toString();
  history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + location.hash);
}

// 3. Filtros de la colección

function pintarFiltros() {
  const estilos = [{ id: "todos", nombre: "Todos" }, ...ESTILOS];
  document.getElementById("filtro-estilo").innerHTML = estilos.map(e => `
    <button type="button" data-estilo="${e.id}" aria-pressed="${e.id === estado.estilo}">${escapar(e.nombre)}</button>
  `).join("");

  const familias = [{ id: "todas", nombre: "Todas las familias" }, ...FAMILIAS];
  document.getElementById("filtro-familia").innerHTML = familias.map(f => `
    <button type="button" class="chip" data-familia="${f.id}" aria-pressed="${f.id === estado.familia}">${escapar(f.nombre)}</button>
  `).join("");
}

function filtrar(estilo, familia, texto) {
  const t = normalizar((texto || "").trim());
  return PRODUCTOS.filter(p => {
    const okEstilo = !estilo || estilo === "todos" || p.estilo === estilo;
    const okFamilia = !familia || familia === "todas" || familiasDe(p).includes(familia);
    const notas = Object.values(p.notas || {}).join(" ");
    const okTexto = !t || normalizar(`${p.nombre} ${p.ref} ${p.descripcion} ${notas}`).includes(t);
    return okEstilo && okFamilia && okTexto;
  });
}

// 4. Tarjetas

function tarjeta(p, i) {
  const etiqueta = !p.disponible
    ? `<span class="perfume__etiqueta perfume__etiqueta--agotado">Agotado</span>`
    : p.etiqueta ? `<span class="perfume__etiqueta">${escapar(p.etiqueta)}</span>` : "";

  const duracion = p.perfil && p.perfil.duracion
    ? `<p class="perfume__duracion" aria-label="Duración ${p.perfil.duracion} de 5">
         <span>Duración</span>
         <span class="puntos">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= p.perfil.duracion ? "on" : ""}"></i>`).join("")}</span>
       </p>`
    : "";

  return `
    <article class="perfume revelar${p.disponible ? "" : " perfume--agotado"}" style="--orden:${i % 4}">
      <div class="perfume__foto">
        <img src="${p.imagen}" alt="Perfume ${escapar(p.nombre)}" width="600" height="750" loading="lazy">
        ${etiqueta}
      </div>
      <div class="perfume__info">
        ${etiquetas(p).length ? `<p class="perfume__meta">${spans(etiquetas(p))}</p>` : ""}
        <h3 class="perfume__nombre">
          <button type="button" data-ref="${p.ref}">${escapar(p.nombre)}</button>
        </h3>
        ${duracion}
      </div>
      <a class="perfume__wa" href="${linkWhatsApp(mensajeCompra(p, "Tarjeta"))}" target="_blank" rel="noopener"
        aria-label="${p.disponible ? "Pedir" : "Avisarme cuando llegue"} ${escapar(p.nombre)} por WhatsApp">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><use href="#icono-chat"/></svg>
        ${p.disponible ? "Lo quiero" : "Avísame"}
      </a>
    </article>
  `;
}

function pintarProductos() {
  const lista = filtrar(estado.estilo, estado.familia, estado.texto);
  document.getElementById("productos").innerHTML = lista.map(tarjeta).join("");
  document.getElementById("vacio").hidden = lista.length > 0;
  document.getElementById("contador").textContent =
    lista.length === 1 ? "1 perfume" : lista.length + " perfumes";
  if (window.observarRevelado) observarRevelado();
}

// 5. Ficha del perfume con barras del 1 al 5

const dialogo = document.getElementById("detalle");

function abrirDetalle(ref) {
  const p = buscarPerfume(ref);
  if (!p) return;

  const etapas = [
    { id: "salida", nombre: "Salida" },
    { id: "corazon", nombre: "Corazón" },
    { id: "fondo", nombre: "Fondo" }
  ];
  const notas = etapas
    .filter(e => (p.notas || {})[e.id])
    .map(e => medidor(e.nombre, (p.intensidad || {})[e.id], ESCALA_INTENSIDAD, (p.notas || {})[e.id]))
    .join("");
  const perfil = ATRIBUTOS
    .filter(a => p.perfil && p.perfil[a.id])
    .map(a => medidor(a.nombre, p.perfil[a.id], ESCALA_PERFIL))
    .join("");

  document.getElementById("detalle-contenido").innerHTML = `
    <div class="detalle__foto">
      <img src="${p.imagen}" alt="Perfume ${escapar(p.nombre)}" width="600" height="750">
    </div>
    <div class="detalle__info">
      <p class="detalle__tags">${spans([...etiquetas(p), p.presentacion])}</p>
      <h2 id="detalle-nombre">${escapar(p.nombre)}</h2>
      <p class="detalle__ref">Ref. ${escapar(p.ref)}</p>
      <p class="detalle__desc">${escapar(p.descripcion || "Escríbenos por WhatsApp y te contamos sus notas, su duración y su presentación.")}</p>

      ${notas ? `<div class="detalle__bloque"><h3>Notas e intensidad</h3>${notas}</div>` : ""}

      ${perfil ? `<div class="detalle__bloque"><h3>Cómo se comporta</h3>${perfil}</div>` : ""}

      <div class="detalle__acciones">
        <a class="boton boton--ambar boton--ancho" href="${linkWhatsApp(mensajeCompra(p, "Ficha"))}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><use href="#icono-chat"/></svg>
          ${p.disponible ? "Lo quiero" : "Avísame cuando llegue"}
        </a>
        <a class="boton boton--linea boton--ancho" href="${linkWhatsApp(mensajeConsulta(p, "Ficha"))}" target="_blank" rel="noopener">Tengo una pregunta</a>
      </div>
      <p class="detalle__ayuda">${p.disponible
        ? "Te respondemos por WhatsApp con disponibilidad y forma de entrega."
        : "Este perfume está agotado. Escríbenos y te avisamos cuando vuelva."}</p>
    </div>
  `;

  if (!dialogo.open) dialogo.showModal();
  dialogo.scrollTop = 0;

  // Las barras se llenan una tras otra después de abrir
  const contenido = document.getElementById("detalle-contenido");
  contenido.querySelectorAll(".medidor").forEach((m, i) => m.style.setProperty("--fila", i));
  requestAnimationFrame(() => requestAnimationFrame(() => contenido.classList.add("cargado")));

  guardarUrl(p.ref);
}

function cerrarDetalle() {
  dialogo.close();
}

// 6. Buscador guiado "Encuentra tu aroma"

const guia = { estilo: "", familia: "" };

function pintarGuia() {
  document.getElementById("guia-estilo").innerHTML = ESTILOS.map(e => `
    <label class="opcion">
      <input type="radio" name="guia-estilo" value="${e.id}">
      <span class="opcion__titulo">${escapar(e.nombre)}</span>
    </label>
  `).join("");

  const familias = [...FAMILIAS, { id: "", nombre: "Sorpréndeme", pista: "Muéstrame de todo" }];
  document.getElementById("guia-familia").innerHTML = familias.map(f => `
    <label class="opcion">
      <input type="radio" name="guia-familia" value="${f.id}">
      <span class="opcion__titulo">${escapar(f.nombre)}</span>
      <span class="opcion__pista">${escapar(f.pista || "")}</span>
    </label>
  `).join("");
}

function actualizarGuia() {
  const lista = filtrar(guia.estilo, guia.familia);
  const conteo = document.getElementById("guia-conteo");

  if (!guia.estilo && !guia.familia) {
    conteo.textContent = "Elige una opción en cada paso.";
  } else if (lista.length === 0) {
    conteo.textContent = "Aún no tenemos esa combinación en el catálogo, pero podemos asesorarte.";
  } else {
    conteo.innerHTML = `<strong>${lista.length}</strong> ${lista.length === 1 ? "perfume va" : "perfumes van"} contigo.`;
  }

  document.getElementById("guia-asesoria").href =
    linkWhatsApp(mensajeAsesoria(guia.estilo, guia.familia));
}

// 7. Perfume destacado

function pintarDestacado() {
  const p = PRODUCTOS.find(x => x.destacado) || PRODUCTOS[0];
  const seccion = document.getElementById("destacado");
  if (!p) return;

  seccion.innerHTML = `
    <div class="contenedor destacado__grid">
      <div class="destacado__foto">
        <span class="destacado__halo" aria-hidden="true"></span>
        <img src="${p.imagen}" alt="Perfume ${escapar(p.nombre)}" width="600" height="750" loading="lazy">
      </div>
      <div class="destacado__texto">
        <p class="destacado__pre">Perfume destacado</p>
        <h2 id="destacado-nombre">${escapar(p.nombre)}</h2>
        <p class="destacado__meta">${escapar(textoEstilo(p.estilo))}, ${escapar(textoFamilias(p.familia).toLowerCase())}</p>
        <p class="destacado__desc">${escapar(p.descripcion)}</p>
        ${p.notas && p.notas.salida ? `<dl class="destacado__notas">
          <div><dt>Salida</dt><dd>${escapar(p.notas.salida)}</dd></div>
          <div><dt>Corazón</dt><dd>${escapar(p.notas.corazon)}</dd></div>
          <div><dt>Fondo</dt><dd>${escapar(p.notas.fondo)}</dd></div>
        </dl>` : ""}
        <div class="destacado__acciones">
          <a class="boton boton--ambar" href="${linkWhatsApp(mensajeCompra(p, "Destacado"))}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><use href="#icono-chat"/></svg>
            ${p.disponible ? "Lo quiero" : "Avísame cuando llegue"}
          </a>
          <button type="button" class="boton boton--linea" data-ref="${p.ref}">Ver ficha completa</button>
        </div>
      </div>
    </div>
  `;
  seccion.hidden = false;
}

// 8. Cinta con las notas de todos los perfumes

function pintarCinta() {
  const notas = new Set();
  PRODUCTOS.forEach(p => Object.values(p.notas || {}).forEach(t =>
    t.split(",").map(n => n.trim()).filter(Boolean)
      .forEach(n => notas.add(n.charAt(0).toUpperCase() + n.slice(1)))
  ));
  const fila = [...notas].map(n => `<span>${escapar(n)}</span>`).join("");
  // Se repite dos veces para que el movimiento no tenga cortes
  document.getElementById("cinta").innerHTML = fila + fila;
}

// 9. Datos estructurados de los perfumes (SEO)

function datosEstructurados() {
  const datos = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Catálogo de perfumes " + CONFIG.nombre,
    "itemListElement": PRODUCTOS.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Product",
        "name": p.nombre,
        "sku": p.ref,
        "description": p.descripcion || undefined,
        "category": "Perfumes " + textoEstilo(p.estilo).toLowerCase(),
        "image": new URL(p.imagen, CONFIG.urlSitio).href,
        "url": CONFIG.urlSitio + "?perfume=" + p.ref,
        "brand": { "@type": "Brand", "name": CONFIG.nombre }
      }
    }))
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(datos);
  document.head.appendChild(script);
}

// 10. Perfumes del Excel y fotos automáticas
// datos.js se genera solo al publicar. Trae EXCEL (las filas de perfumes.xlsx)
// y FOTOS (los archivos de assets/img/productos/).
// Si la foto se llama igual que un perfume, se le asigna a ese perfume.
// Si no es de ninguno, entra al catálogo como un perfume nuevo que toma el nombre del archivo.

const CARPETA_FOTOS = "assets/img/productos/";
const SIN_FOTO = "assets/img/placeholder.svg";

// "Al_Noble-Ameer" y "al noble ameer" dan la misma clave
function clave(texto) {
  return normalizar(texto).replace(/[^a-z0-9]+/g, " ").trim();
}

function nombreDeFoto(archivo) {
  const nombre = archivo.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  // Si el archivo viene todo en minúsculas, pone mayúscula inicial a cada palabra
  return nombre === nombre.toLowerCase() ? nombre.replace(/(^|\s)\S/g, l => l.toUpperCase()) : nombre;
}

function refDeNombre(nombre) {
  return clave(nombre).replace(/ /g, "-").toUpperCase();
}

// Convierte una fila del Excel ("Para él", "Ambarada, Amaderada", "Sí") en un perfume del catálogo
function perfumeDeExcel(fila) {
  const idDe = (lista, texto) =>
    (lista.find(x => clave(x.nombre) === clave(texto) || x.id === clave(texto)) || {}).id;
  const numero = valor => Math.max(0, Math.min(5, Math.round(Number(valor)) || 0));
  const es = (valor, opciones) => opciones.includes(clave(valor || ""));

  return {
    ref: fila.ref || refDeNombre(fila.nombre),
    nombre: fila.nombre,
    marca: fila.marca || "",
    estilo: idDe(ESTILOS, fila.estilo || "") || "",
    familia: (fila.familia || "").split(/[,;/]/).map(t => idDe(FAMILIAS, t)).filter(Boolean),
    presentacion: fila.presentacion || "",
    descripcion: fila.descripcion || "",
    notas: { salida: fila.salida || "", corazon: fila.corazon || "", fondo: fila.fondo || "" },
    intensidad: {
      salida: numero(fila.intensidadSalida),
      corazon: numero(fila.intensidadCorazon),
      fondo: numero(fila.intensidadFondo)
    },
    perfil: {
      duracion: numero(fila.duracion),
      estela: numero(fila.estela),
      dulzor: numero(fila.dulzor),
      frescura: numero(fila.frescura)
    },
    imagen: fila.foto ? CARPETA_FOTOS + fila.foto : "",
    etiqueta: fila.etiqueta || "",
    destacado: es(fila.destacado, ["si", "x", "1"]),
    // Vacío cuenta como disponible
    disponible: !es(fila.disponible, ["no", "agotado", "0"])
  };
}

// Los perfumes del Excel van primero y reemplazan a los de productos.js con la misma referencia o nombre
function sumarExcel() {
  if (typeof EXCEL === "undefined") return;
  const nuevos = EXCEL.map(perfumeDeExcel);
  const repetido = p => nuevos.some(n => n.ref === p.ref || clave(n.nombre) === clave(p.nombre));
  const propios = PRODUCTOS.filter(p => !repetido(p));
  PRODUCTOS.splice(0, PRODUCTOS.length, ...nuevos, ...propios);
}

function sumarFotos() {
  if (typeof FOTOS === "undefined") return;
  const ruta = archivo => CARPETA_FOTOS + encodeURIComponent(archivo);
  const usadas = new Set();

  PRODUCTOS.forEach(p => {
    const marca = p.marca || "";
    const nombres = [p.nombre, marca + " " + p.nombre, p.nombre + " " + marca].map(clave);
    const propias = FOTOS.filter(f => nombres.includes(clave(nombreDeFoto(f))));
    propias.forEach(f => usadas.add(f));

    const enCarpeta = (p.imagen || "").startsWith(CARPETA_FOTOS);
    const actual = enCarpeta ? decodeURIComponent(p.imagen.slice(CARPETA_FOTOS.length)) : "";
    if (FOTOS.includes(actual)) {
      usadas.add(actual);
      p.imagen = ruta(actual);
    } else if (propias.length) {
      p.imagen = ruta(propias[0]);
    } else if (enCarpeta || !p.imagen) {
      // La foto se borró o nunca se puso
      p.imagen = SIN_FOTO;
    }
  });

  const refs = new Set(PRODUCTOS.map(p => p.ref));
  FOTOS.filter(f => !usadas.has(f)).forEach(f => {
    const nombre = nombreDeFoto(f);
    const ref = refDeNombre(nombre);
    // La misma foto en dos formatos cuenta como un solo perfume
    if (!ref || refs.has(ref)) return;
    refs.add(ref);
    PRODUCTOS.push({
      ref,
      nombre,
      estilo: "",
      familia: [],
      presentacion: "",
      descripcion: "",
      notas: {},
      imagen: ruta(f),
      etiqueta: "",
      destacado: false,
      disponible: true
    });
  });
}

// 11. Eventos y arranque

document.addEventListener("DOMContentLoaded", () => {
  sumarExcel();
  sumarFotos();
  const refInicial = leerUrl();
  pintarCinta();
  pintarGuia();
  actualizarGuia();
  pintarDestacado();
  pintarFiltros();
  pintarProductos();
  datosEstructurados();

  // Filtros de la colección
  document.getElementById("filtro-estilo").addEventListener("click", e => {
    const btn = e.target.closest("[data-estilo]");
    if (!btn) return;
    estado.estilo = btn.dataset.estilo;
    pintarFiltros();
    pintarProductos();
    guardarUrl();
  });

  document.getElementById("filtro-familia").addEventListener("click", e => {
    const btn = e.target.closest("[data-familia]");
    if (!btn) return;
    estado.familia = btn.dataset.familia;
    pintarFiltros();
    pintarProductos();
    guardarUrl();
  });

  document.getElementById("buscar").addEventListener("input", e => {
    estado.texto = e.target.value;
    pintarProductos();
  });

  document.getElementById("limpiar").addEventListener("click", () => {
    estado.estilo = "todos";
    estado.familia = "todas";
    estado.texto = "";
    document.getElementById("buscar").value = "";
    pintarFiltros();
    pintarProductos();
    guardarUrl();
  });

  // Buscador guiado
  const formGuia = document.getElementById("buscador-guiado");
  formGuia.addEventListener("change", e => {
    if (e.target.name === "guia-estilo") guia.estilo = e.target.value;
    if (e.target.name === "guia-familia") guia.familia = e.target.value;
    actualizarGuia();
  });
  formGuia.addEventListener("submit", e => {
    e.preventDefault();
    estado.estilo = guia.estilo || "todos";
    estado.familia = guia.familia || "todas";
    estado.texto = "";
    document.getElementById("buscar").value = "";
    pintarFiltros();
    pintarProductos();
    guardarUrl();
    document.getElementById("coleccion").scrollIntoView();
  });

  // Abrir la ficha desde una tarjeta o desde el destacado
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-ref]");
    if (btn && !dialogo.contains(btn)) abrirDetalle(btn.dataset.ref);
  });

  // Cerrar con la X o tocando fuera de la ficha
  dialogo.addEventListener("click", e => {
    if (e.target === dialogo || e.target.closest("[data-cerrar]")) cerrarDetalle();
  });
  dialogo.addEventListener("close", () => {
    document.getElementById("detalle-contenido").classList.remove("cargado");
    guardarUrl();
  });

  // Enlaces generales
  document.querySelectorAll("[data-whatsapp]").forEach(a => {
    a.href = linkWhatsApp(mensajeGeneral());
  });
  document.querySelectorAll("[data-instagram]").forEach(a => {
    a.href = CONFIG.instagram;
  });
  document.getElementById("anio").textContent = new Date().getFullYear();

  // Si el enlace trae ?perfume=OA-001, abre esa ficha
  if (refInicial) abrirDetalle(refInicial);
});
