// Animaciones al hacer scroll. Si la persona pidió menos movimiento, todo se muestra quieto.

const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 1. Aparición de elementos al bajar

let observador = null;

function observarRevelado() {
  const pendientes = document.querySelectorAll(".revelar:not(.visible)");

  if (menosMovimiento || !("IntersectionObserver" in window)) {
    pendientes.forEach(el => el.classList.add("visible"));
    return;
  }

  if (!observador) {
    observador = new IntersectionObserver(entradas => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  }

  pendientes.forEach(el => observador.observe(el));
}

// 2. Perfume destacado: el frasco crece y el halo se enciende según el scroll

function progresoDestacado() {
  const seccion = document.getElementById("destacado");
  if (!seccion || seccion.hidden) return;
  const alto = window.innerHeight;
  const caja = seccion.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (alto - caja.top) / (alto * 0.85)));
  seccion.style.setProperty("--p", p.toFixed(3));
}

// 3. Barra superior más sólida al bajar y emblema de portada con leve profundidad

function alHacerScroll() {
  const y = window.scrollY;
  document.querySelector(".barra").classList.toggle("barra--scroll", y > 20);
  if (!menosMovimiento) {
    document.documentElement.style.setProperty("--scroll", Math.min(y, 900).toFixed(0));
    progresoDestacado();
  }
}

// 4. Arranque

document.addEventListener("DOMContentLoaded", () => {
  // Títulos y bloques que también aparecen al bajar
  document
    .querySelectorAll(".seccion__cabecera, .guia__paso, .guia__resultado, .pedir__grid > div, .pasos li")
    .forEach(el => el.classList.add("revelar"));

  observarRevelado();

  if (menosMovimiento) {
    document.getElementById("destacado")?.style.setProperty("--p", 1);
  }

  let pendiente = false;
  window.addEventListener("scroll", () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      alHacerScroll();
      pendiente = false;
    });
  }, { passive: true });

  alHacerScroll();
});
