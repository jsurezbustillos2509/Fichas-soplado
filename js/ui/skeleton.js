import { esc } from "./bloques.js";

// Siluetas de envases (botella y bidón). La capa amarilla "infla" como en el soplado.
const BOTELLA = `<svg class="sk-svg" viewBox="0 0 60 120" aria-hidden="true">
  <path class="sk-sil" d="M23 3h14v9h-3v6c0 5 18 9 18 24v62a9 9 0 0 1-9 9H17a9 9 0 0 1-9-9V42c0-15 18-19 18-24v-6h-3z"/>
  <path class="sk-lvl" d="M23 3h14v9h-3v6c0 5 18 9 18 24v62a9 9 0 0 1-9 9H17a9 9 0 0 1-9-9V42c0-15 18-19 18-24v-6h-3z"/>
</svg>`;

const BIDON = `<svg class="sk-svg" viewBox="0 0 60 120" aria-hidden="true">
  <path class="sk-sil" d="M17 14h12v14H17zM13 28h26l13 11v69a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8V36a8 8 0 0 1 8-8z"/>
  <path class="sk-lvl" d="M17 14h12v14H17zM13 28h26l13 11v69a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8V36a8 8 0 0 1 8-8z"/>
</svg>`;

// Placa de estado tipo HMI con barra de nivel (como el nivel de un tanque)
export function loaderPlate(texto) {
  return `<div class="sk-status">
    <span class="sk-tag">HMI</span>
    <span class="sk-status-txt">${esc(texto)}<span class="sk-dots">...</span></span>
    <div class="sk-level"><div class="sk-level-fill"></div></div>
  </div>`;
}

// Esqueleto del catálogo (misma forma que las tarjetas reales)
export function skeletonCatalog(n = 8) {
  const cards = Array.from({ length: n }, (_, i) => `
    <div class="card sk-card" style="--d:${i * 90}ms">
      <div class="ph">${i % 2 ? BIDON : BOTELLA}</div>
      <div class="body">
        <div class="sk-b sk-sku"></div>
        <div class="sk-b sk-desc"></div>
        <div class="sk-b sk-desc s"></div>
        <div class="chips"><span class="sk-b sk-chip"></span><span class="sk-b sk-chip w"></span></div>
        <div class="mini"><span class="sk-b sk-mini"></span><span class="sk-b sk-mini"></span><span class="sk-b sk-mini"></span></div>
      </div>
    </div>`).join("");

  return `<div class="sk" role="status" aria-live="polite" aria-busy="true">
    ${loaderPlate("Cargando catálogo")}
    <div class="page-h"><div class="sk-b sk-title"></div></div>
    <div class="filters">
      <div class="sk-b sk-input"></div>
      <div class="sk-b sk-input"></div>
      <div class="sk-b sk-btn"></div>
    </div>
    <div class="cards">${cards}</div>
  </div>`;
}

// Esqueleto de la ficha de una máquina
export function skeletonFicha(maquina) {
  const rows = (k) => Array.from({ length: k }, () => `
    <div class="prow">
      <div class="nm"><div class="sk-b sk-line"></div></div>
      <div class="sk-b sk-v"></div><div class="sk-b sk-v"></div>
    </div>`).join("");

  const sec = `<div class="sec-h"><span class="sk-b sk-tagb"></span><span class="sk-b sk-h2"></span></div>
    <div class="cols">
      <div class="ptab">${rows(5)}</div>
      <div class="ptab">${rows(5)}</div>
    </div>`;

  return `<div class="sk" role="status" aria-live="polite" aria-busy="true">
    ${loaderPlate("Cargando parámetros · " + (maquina || ""))}
    <div class="nav"><div class="sk-b sk-btn"></div></div>
    <div class="sheet">
      <div class="plate">
        <div class="foto">${BOTELLA}</div>
        <div class="info">
          <div class="sk-b sk-line s"></div>
          <div class="sk-b sk-big"></div>
          <div class="sk-b sk-line"></div>
        </div>
        <div class="lcds"><div class="lcd"><div class="sk-b sk-lcd"></div></div></div>
      </div>
      <div class="role-bar">
        ${Array.from({ length: 4 }, () => `<div class="role-btn"><div class="sk-b sk-role"></div></div>`).join("")}
      </div>
      <div class="stats">
        ${Array.from({ length: 4 }, () => `<div class="stat"><div class="sk-b sk-n"></div><div class="sk-b sk-l"></div></div>`).join("")}
      </div>
      <div class="sec">${sec}${sec}</div>
    </div>
  </div>`;
}

// Mensaje de error con botón para reintentar
export function errorBox(mensaje, idBoton) {
  return `<div class="empty sk-err">
    <p>${esc(mensaje)}</p>
    <button class="btn solid" id="${idBoton}" type="button">Reintentar</button>
  </div>`;
}