// 1. Estilos (primer filtro)
const ESTILOS = [
  { id: "ella", nombre: "Para ella" },
  { id: "el", nombre: "Para él" },
  { id: "unisex", nombre: "Unisex" }
];

// 2. Familias olfativas (segundo filtro). La pista se muestra en el buscador guiado.
const FAMILIAS = [
  { id: "ambarada", nombre: "Ambarada", pista: "Ámbar, oud, especias" },
  { id: "floral", nombre: "Floral", pista: "Rosa, jazmín, flores blancas" },
  { id: "amaderada", nombre: "Amaderada", pista: "Cedro, sándalo, cuero" },
  { id: "dulce", nombre: "Dulce", pista: "Vainilla, caramelo, frutas" },
  { id: "fresca", nombre: "Fresca", pista: "Cítricos, menta, té verde" }
];

// 3. Características que se miden del 1 al 5 en la ficha
const ATRIBUTOS = [
  { id: "duracion", nombre: "Duración" },
  { id: "estela", nombre: "Estela" },
  { id: "dulzor", nombre: "Dulzor" },
  { id: "frescura", nombre: "Frescura" }
];

// 4. Perfumes
// Los que tienen referencia EJ- son de ejemplo: bórralos cuando cargues los reales.
// ref: código único
// marca: casa del perfume (opcional)
// estilo: id de ESTILOS
// familia: id de FAMILIAS; si tiene dos, va entre corchetes: ["amaderada", "ambarada"]
// notas: salida (lo primero que se siente), corazon y fondo (lo que más dura)
// intensidad: qué tan fuerte se siente cada etapa, del 1 al 5
// perfil: duración, estela, dulzor y frescura, del 1 al 5
// etiqueta: texto corto opcional ("Nuevo", "Edición limitada") o ""
// destacado: false para mostrarlo en la sección "Perfume destacado" (solo uno)
// disponible: false lo muestra como agotado
const PRODUCTOS = [
  {
    ref: "OA-001",
    nombre: "Al Noble Ameer",
    marca: "Lattafa",
    estilo: "unisex",
    familia: ["ambarada", "amaderada"],
    presentacion: "100 ml",
    descripcion: "Especiado y amaderado, con oud y clavo sobre un toque de manzana y pimienta rosa. Elegante para la noche y las ocasiones especiales.",
    notas: { salida: "Pimienta rosa, manzana, romero", corazon: "Clavo, notas florales", fondo: "Oud, ládano, pachulí, vetiver, ciprés" },
    intensidad: { salida: 3, corazon: 4, fondo: 5 },
    perfil: { duracion: 4, estela: 4, dulzor: 2, frescura: 2 },
    imagen: "assets/img/productos/lattafa-al-noble-ameer.webp",
    etiqueta: "Nuevo",
    destacado: true,
    disponible: true
  },
  {
    ref: "EJ-001",
    nombre: "Ámbar Nocturno",
    estilo: "unisex",
    familia: "ambarada",
    presentacion: "100 ml",
    descripcion: "Cálido y envolvente, pensado para la noche. Deja una estela suave que se queda en la ropa.",
    notas: { salida: "Bergamota, azafrán", corazon: "Rosa, ámbar", fondo: "Vainilla, pachulí" },
    intensidad: { salida: 3, corazon: 4, fondo: 5 },
    perfil: { duracion: 5, estela: 4, dulzor: 3, frescura: 1 },
    imagen: "assets/img/placeholder.svg",
    etiqueta: "",
    destacado: false,
    disponible: true
  },
  {
    ref: "EJ-002",
    nombre: "Rosa de Medina",
    estilo: "ella",
    familia: "floral",
    presentacion: "100 ml",
    descripcion: "Una rosa intensa con un fondo especiado. Elegante para el día y la noche.",
    notas: { salida: "Lichi, pimienta rosa", corazon: "Rosa damascena", fondo: "Almizcle, oud" },
    intensidad: { salida: 3, corazon: 5, fondo: 3 },
    perfil: { duracion: 4, estela: 3, dulzor: 2, frescura: 2 },
    imagen: "assets/img/placeholder.svg",
    etiqueta: "",
    destacado: false,
    disponible: true
  },
  {
    ref: "EJ-003",
    nombre: "Cedro Imperial",
    estilo: "el",
    familia: "amaderada",
    presentacion: "100 ml",
    descripcion: "Seco, limpio y con carácter. Ideal para la oficina y ocasiones formales.",
    notas: { salida: "Pomelo, cardamomo", corazon: "Vetiver", fondo: "Cedro, cuero" },
    intensidad: { salida: 4, corazon: 3, fondo: 4 },
    perfil: { duracion: 4, estela: 3, dulzor: 1, frescura: 3 },
    imagen: "assets/img/placeholder.svg",
    etiqueta: "",
    destacado: false,
    disponible: true
  },
  {
    ref: "EJ-004",
    nombre: "Vainilla Dorada",
    estilo: "ella",
    familia: "dulce",
    presentacion: "80 ml",
    descripcion: "Dulce y acogedor, con un toque de caramelo. Para quienes buscan un aroma que abrace.",
    notas: { salida: "Pera, mandarina", corazon: "Caramelo, jazmín", fondo: "Vainilla, haba tonka" },
    intensidad: { salida: 2, corazon: 4, fondo: 5 },
    perfil: { duracion: 4, estela: 4, dulzor: 5, frescura: 1 },
    imagen: "assets/img/placeholder.svg",
    etiqueta: "",
    destacado: false,
    disponible: true
  },
  {
    ref: "EJ-005",
    nombre: "Brisa de Citrino",
    estilo: "unisex",
    familia: "fresca",
    presentacion: "100 ml",
    descripcion: "Luminoso y ligero para el día a día y los climas cálidos.",
    notas: { salida: "Limón, menta", corazon: "Neroli, té verde", fondo: "Almizcle blanco" },
    intensidad: { salida: 5, corazon: 3, fondo: 2 },
    perfil: { duracion: 2, estela: 2, dulzor: 1, frescura: 5 },
    imagen: "assets/img/placeholder.svg",
    etiqueta: "",
    destacado: false,
    disponible: true
  },
  {
    ref: "EJ-006",
    nombre: "Oud Real",
    estilo: "el",
    familia: ["ambarada", "amaderada"],
    presentacion: "100 ml",
    descripcion: "Profundo y ahumado, con gran presencia en la piel. Un aroma que no pasa desapercibido.",
    notas: { salida: "Canela, nuez moscada", corazon: "Oud, incienso", fondo: "Ámbar, sándalo" },
    intensidad: { salida: 3, corazon: 5, fondo: 5 },
    perfil: { duracion: 5, estela: 5, dulzor: 2, frescura: 1 },
    imagen: "assets/img/placeholder.svg",
    etiqueta: "Edición limitada",
    destacado: false,
    disponible: false
  },
  {
    ref: "EJ-007",
    nombre: "Jazmín Lunar",
    estilo: "ella",
    familia: "floral",
    presentacion: "100 ml",
    descripcion: "Floral blanco y delicado, con un fondo cremoso. Femenino sin ser empalagoso.",
    notas: { salida: "Bergamota", corazon: "Jazmín, tuberosa", fondo: "Sándalo, almizcle" },
    intensidad: { salida: 2, corazon: 4, fondo: 3 },
    perfil: { duracion: 3, estela: 3, dulzor: 2, frescura: 3 },
    imagen: "assets/img/placeholder.svg",
    etiqueta: "",
    destacado: false,
    disponible: true
  },
  {
    ref: "EJ-008",
    nombre: "Cuero Noble",
    estilo: "el",
    familia: "amaderada",
    presentacion: "100 ml",
    descripcion: "Masculino y sofisticado, con notas de cuero y tabaco suave.",
    notas: { salida: "Pimienta negra", corazon: "Tabaco, iris", fondo: "Cuero, ámbar gris" },
    intensidad: { salida: 3, corazon: 4, fondo: 4 },
    perfil: { duracion: 4, estela: 4, dulzor: 1, frescura: 1 },
    imagen: "assets/img/placeholder.svg",
    etiqueta: "",
    destacado: false,
    disponible: true
  }
];
