import { CATEGORIAS } from "../config.js";
import { $, esc } from "./bloques.js";

// Ilustraciones técnicas animadas por tipo de maquinaria
export function getMachineSvg(catId) {
  if (catId === "sopladora") {
    return `
      <svg viewBox="0 0 260 150" fill="none" aria-hidden="true">
        <rect x="24" y="122" width="212" height="14" rx="2" fill="#101316" stroke="#F2F4F5" stroke-width="1.5"/>
        <rect x="38" y="68" width="16" height="54" fill="#1E262C" stroke="#F2F4F5" stroke-width="1.5"/>
        <rect x="206" y="68" width="16" height="54" fill="#1E262C" stroke="#F2F4F5" stroke-width="1.5"/>
        <polygon points="34,14 58,14 51,32 41,32" fill="#FFC400" stroke="#101316" stroke-width="1.5"/>
        <rect x="32" y="32" width="84" height="16" rx="2" fill="#2A3238" stroke="#F2F4F5" stroke-width="1.5"/>
        <rect x="116" y="26" width="28" height="30" rx="3" fill="#101316" stroke="#FFC400" stroke-width="1.8"/>
        <rect class="anim-parison" x="125" y="56" width="10" height="48" rx="3" fill="#FFC400" opacity="0.92"/>
        <g class="anim-clamp-l">
          <rect x="86" y="66" width="42" height="44" rx="2" fill="#36424A" stroke="#F2F4F5" stroke-width="1.6"/>
          <line x1="66" y1="88" x2="86" y2="88" stroke="#FFC400" stroke-width="4"/>
        </g>
        <g class="anim-clamp-r">
          <rect x="132" y="66" width="42" height="44" rx="2" fill="#36424A" stroke="#F2F4F5" stroke-width="1.6"/>
          <line x1="174" y1="88" x2="194" y2="88" stroke="#FFC400" stroke-width="4"/>
        </g>
        <rect class="anim-blow-bottle" x="120" y="72" width="20" height="32" rx="5" fill="#FFF8E7" stroke="#101316" stroke-width="1.5"/>
        <rect x="127" y="110" width="6" height="12" fill="#FFC400"/>
        <rect x="184" y="42" width="24" height="18" rx="2" fill="#07090A" stroke="#FFC400" stroke-width="1.4"/>
        <circle cx="191" cy="51" r="2.5" fill="#4CC26F"/>
      </svg>`;
  }

  if (catId === "pet") {
    return `
      <svg viewBox="0 0 260 150" fill="none" aria-hidden="true">
        <rect x="34" y="122" width="192" height="14" rx="2" fill="#101316" stroke="#F2F4F5" stroke-width="1.5"/>
        <rect x="56" y="28" width="10" height="94" fill="#2A3238" stroke="#F2F4F5" stroke-width="1.4"/>
        <rect x="194" y="28" width="10" height="94" fill="#2A3238" stroke="#F2F4F5" stroke-width="1.4"/>
        <rect x="48" y="20" width="164" height="12" rx="2" fill="#101316" stroke="#F2F4F5" stroke-width="1.5"/>
        <g class="anim-pet-rod">
          <rect x="103" y="32" width="4" height="36" fill="#FFC400"/>
          <rect x="153" y="32" width="4" height="36" fill="#FFC400"/>
          <rect x="92" y="32" width="76" height="6" rx="2" fill="#FFC400" stroke="#101316" stroke-width="1.2"/>
        </g>
        <rect x="76" y="64" width="108" height="52" rx="3" fill="#23313D" stroke="#F2F4F5" stroke-width="1.8"/>
        <line x1="130" y1="64" x2="130" y2="116" stroke="#F2F4F5" stroke-width="1.4" stroke-dasharray="3 3"/>
        <rect x="92" y="70" width="26" height="40" rx="7" fill="#0B1924" stroke="#93C5FD" stroke-width="1.2"/>
        <rect x="142" y="70" width="26" height="40" rx="7" fill="#0B1924" stroke="#93C5FD" stroke-width="1.2"/>
        <rect class="anim-pet-bottle" x="95" y="72" width="20" height="36" rx="6" fill="#E0F2FE" stroke="#FFC400" stroke-width="1.5"/>
        <rect class="anim-pet-bottle" x="145" y="72" width="20" height="36" rx="6" fill="#E0F2FE" stroke="#FFC400" stroke-width="1.5"/>
        <rect x="100" y="60" width="10" height="5" fill="#FFC400"/>
        <rect x="150" y="60" width="10" height="5" fill="#FFC400"/>
      </svg>`;
  }

  if (catId === "inyeccion") {
    return `
      <svg viewBox="0 0 260 150" fill="none" aria-hidden="true">
        <rect x="20" y="116" width="220" height="18" rx="2" fill="#101316" stroke="#F2F4F5" stroke-width="1.5"/>
        <rect x="34" y="54" width="14" height="62" rx="2" fill="#2A3238" stroke="#F2F4F5" stroke-width="1.5"/>
        <rect x="98" y="54" width="14" height="62" rx="2" fill="#2A3238" stroke="#F2F4F5" stroke-width="1.5"/>
        <line x1="48" y1="64" x2="98" y2="64" stroke="#CBD5E1" stroke-width="3"/>
        <line x1="48" y1="106" x2="98" y2="106" stroke="#CBD5E1" stroke-width="3"/>
        <g class="anim-clamp-l">
          <rect x="64" y="58" width="12" height="54" fill="#475569" stroke="#F2F4F5" stroke-width="1.4"/>
          <rect x="76" y="68" width="10" height="34" fill="#FFC400" stroke="#101316" stroke-width="1.3"/>
        </g>
        <rect x="88" y="68" width="10" height="34" fill="#FFC400" stroke="#101316" stroke-width="1.3"/>
        <rect class="anim-inj-part" x="81" y="84" width="10" height="8" rx="2" fill="#FFFFFF" stroke="#101316" stroke-width="1.3"/>
        <polygon points="154,28 182,28 174,56 162,56" fill="#FFC400" stroke="#101316" stroke-width="1.5"/>
        <rect x="112" y="76" width="82" height="18" rx="2" fill="#1E293B" stroke="#F2F4F5" stroke-width="1.5"/>
        <rect class="anim-heater" x="124" y="73" width="10" height="24" rx="1" fill="#FF6B63"/>
        <rect class="anim-heater" x="140" y="73" width="10" height="24" rx="1" fill="#FF6B63"/>
        <rect class="anim-heater" x="156" y="73" width="10" height="24" rx="1" fill="#FF6B63"/>
        <g class="anim-inj-screw">
          <rect x="194" y="72" width="32" height="26" rx="3" fill="#334155" stroke="#FFC400" stroke-width="1.6"/>
          <line x1="176" y1="85" x2="194" y2="85" stroke="#FFC400" stroke-width="4"/>
        </g>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 260 150" fill="none" aria-hidden="true">
      <rect x="22" y="118" width="216" height="16" rx="2" fill="#101316" stroke="#F2F4F5" stroke-width="1.5"/>
      <rect x="38" y="88" width="44" height="30" fill="#1E262C" stroke="#F2F4F5" stroke-width="1.5"/>
      <rect x="156" y="88" width="16" height="30" fill="#1E262C" stroke="#F2F4F5" stroke-width="1.5"/>
      <rect x="28" y="56" width="34" height="32" rx="3" fill="#334155" stroke="#F2F4F5" stroke-width="1.5"/>
      <line x1="33" y1="63" x2="57" y2="63" stroke="#94A3B8" stroke-width="2"/>
      <line x1="33" y1="71" x2="57" y2="71" stroke="#94A3B8" stroke-width="2"/>
      <line x1="33" y1="79" x2="57" y2="79" stroke="#94A3B8" stroke-width="2"/>
      <rect x="62" y="52" width="22" height="36" rx="2" fill="#FFC400" stroke="#101316" stroke-width="1.5"/>
      <polygon points="84,24 112,24 104,56 92,56" fill="#FFC400" stroke="#101316" stroke-width="1.5"/>
      <rect x="84" y="62" width="88" height="18" rx="2" fill="#1E293B" stroke="#F2F4F5" stroke-width="1.5"/>
      <rect class="anim-heater" x="110" y="59" width="11" height="24" rx="1" fill="#FF6B63"/>
      <rect class="anim-heater" x="126" y="59" width="11" height="24" rx="1" fill="#FF6B63"/>
      <rect class="anim-heater" x="142" y="59" width="11" height="24" rx="1" fill="#FF6B63"/>
      <polygon points="172,60 188,65 188,77 172,82" fill="#FFC400" stroke="#101316" stroke-width="1.5"/>
      <line class="anim-ext-flow" x1="188" y1="71" x2="242" y2="71" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
      <circle cx="204" cy="80" r="5" fill="#FFC400" stroke="#101316" stroke-width="1.4"/>
      <circle cx="226" cy="80" r="5" fill="#FFC400" stroke="#101316" stroke-width="1.4"/>
      <rect x="196" y="85" width="38" height="33" fill="#2A3238" stroke="#F2F4F5" stroke-width="1.4"/>
    </svg>`;
}

export function renderCategorias(fichas) {
  const cardsHtml = CATEGORIAS.map((cat) => {
    const count = fichas.filter((f) => cat.layouts.includes(f.layout)).length;
    const countTxt = count > 0
      ? `${count} ${count === 1 ? "FICHA" : "FICHAS"}`
      : "-- FICHAS";

    return `
      <a class="cat-card" href="#cat-${esc(cat.id)}" style="--cat-bg:${esc(cat.color)}">
        <div class="cat-stage">
          ${getMachineSvg(cat.id)}
        </div>
        <div class="cat-foot">
          <div class="cat-info">
            <h2>${esc(cat.titulo)}</h2>
            <span class="cat-count">${countTxt}</span>
          </div>
          <span class="cat-arrow" aria-hidden="true">→</span>
        </div>
      </a>`;
  }).join("");

  $("#app").innerHTML = `
    <div class="page-h">
      <div>
        <h1>Elige una categoría</h1>
      </div>
    </div>
    <p class="lead">Toca una tarjeta para abrir su catálogo de fichas. También puedes escanear el QR pegado en la máquina.</p>
    <div class="cat-grid">
      ${cardsHtml}
    </div>
    <footer class="app-foot">FICHAS DE PROCESO · SOPLADO</footer>`;
}