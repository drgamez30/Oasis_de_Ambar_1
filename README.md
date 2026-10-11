# Oasis de Ámbar · Catálogo de perfumes

*El aroma de lo que no se olvida.*

Catálogo web de perfumes con SEO, buscador guiado, filtros por estilo y familia olfativa, ficha con barras del 1 al 5 y pedidos por WhatsApp.
No muestra precios. Es un sitio estático (HTML, CSS y JavaScript): se abre con doble clic en `index.html`.

## Estructura

```
Oasis de Ambar/
├── index.html                  Página del catálogo (estructura y SEO)
├── robots.txt                  Permite a Google recorrer el sitio
├── sitemap.xml                 Mapa del sitio para buscadores
├── site.webmanifest            Nombre, colores e iconos del sitio
├── README.md                   Este archivo
└── assets/
    ├── css/
    │   └── styles.css          Diseño esmeralda y ámbar, animaciones, celular y tablet
    ├── fonts/                  Marcellus y Jost (locales, no dependen de internet)
    ├── js/
    │   ├── config.js           Datos del negocio: WhatsApp, Instagram, dominio
    │   ├── productos.js        Estilos, familias, características y perfumes
    │   ├── whatsapp.js         Plantillas de los mensajes de WhatsApp
    │   ├── catalogo.js         Filtros, buscador guiado, tarjetas, ficha y SEO
    │   └── animaciones.js      Animaciones al hacer scroll
    └── img/
        ├── logo.jpeg           Logo original
        ├── logo.svg            Logo rediseñado (vector, para web e impresión)
        ├── logo.png            Logo rediseñado en imagen (para Google)
        ├── emblema.svg         Solo el frasco (barra superior)
        ├── favicon.svg / .png  Icono de la pestaña
        ├── icono-192.png       Icono al guardar en el celular
        ├── icono-512.png
        ├── og-imagen.jpg       Imagen al compartir el enlace (1200 x 630)
        ├── placeholder.svg     Imagen temporal mientras no haya fotos
        └── productos/          Fotos de los perfumes
```

## Cómo se usa

| Quiero...                                  | Dónde                    |
|--------------------------------------------|--------------------------|
| Agregar, quitar o editar perfumes          | `assets/js/productos.js` |
| Cambiar las barras de un perfume (1 a 5)   | `intensidad` y `perfil` del perfume |
| Elegir el perfume destacado                | `destacado: true` (solo uno) |
| Marcar un perfume como agotado             | `disponible: false`      |
| Poner una etiqueta ("Nuevo", "Edición limitada") | `etiqueta`         |
| Cambiar el texto de los mensajes           | `assets/js/whatsapp.js`  |
| Cambiar colores                            | `assets/css/styles.css` (sección 2) |
| Cambiar título y descripción en Google     | `index.html` (bloque SEO) |

## Mensajes de WhatsApp

Todos los mensajes tienen el mismo formato y terminan con un código, para poder automatizarlos:

```
Hola, Oasis de Ámbar. Quiero pedir este perfume:

*Rosa de Medina*
Referencia: OA-002
Estilo: Para ella
Familia: Floral
Presentación: 100 ml

Código: #PEDIDO-OA-002
Origen: Catálogo web - Ficha
```

| Código            | Cuándo se envía                                 |
|-------------------|-------------------------------------------------|
| `#PEDIDO-OA-###`  | Botón "Lo quiero"                               |
| `#CONSULTA-OA-###`| Botón "Tengo una pregunta"                      |
| `#AVISO-OA-###`   | Perfume agotado, botón "Avísame"                |
| `#ASESORIA`       | Buscador guiado, "Prefiero que me asesoren"     |
| `#INFO`           | Botones generales (barra, pie, botón flotante)  |

`Origen` dice desde qué parte de la página llegó el mensaje (Tarjeta, Ficha, Destacado, Encuentra tu aroma).
Cuando la página esté publicada, el mensaje incluye también el enlace directo al perfume.

## Enlaces que se pueden compartir

- Un estilo: `index.html?estilo=ella` (también `el`, `unisex`)
- Una familia: `index.html?familia=floral`
- Un perfume abierto: `index.html?perfume=OA-002`

## Antes de publicar

- [ ] Reemplazar los perfumes de ejemplo por los reales
- [ ] Subir fotos a `assets/img/productos/` (ver `LEEME.txt`)
- [ ] Cambiar `https://www.oasisdeambar.com/` por el dominio real en `index.html`, `config.js`, `robots.txt` y `sitemap.xml`
- [ ] Confirmar la ciudad en el bloque `application/ld+json` de `index.html`
- [ ] Borrar `assets/img/emblema.png` y `assets/img/logo-completo.png` (de la versión anterior, ya no se usan)
