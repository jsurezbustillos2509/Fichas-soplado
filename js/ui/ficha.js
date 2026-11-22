import { SHARE_BASE } from "../config.js";
import { renderHmiBody } from "../hmis/index.js";
import { $, esc, num, dateEs, moldesTxt, toast } from "./bloques.js";
import { renderOperador, bindOperador, renderMolinero, bindMolinero } from "./calculadora.js";
import { renderCronoPanel, bindCronoPanel } from "./cronometro.js";
import { renderAvanceTurno, bindAvanceTurno } from "./avance.js";
import { saveImage } from "./exportar.js";

const ROLES = [
  { id: "operador", label: "Operador" },
  { id: "mecanico", label: "Mecánico" },
  { id: "molinero", label: "Molinero" },
  { id: "todo",     label: "Ver todo" }
];

function qrSvg(text) {
  if (!window.qrcode) return "";
  try {
    const qr = window.qrcode(0, "Q");
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ scalable: true, margin: 2 });
  } catch (e) {
    return "";
  }
}

export function renderFicha(f, hmiRow) {
  const url = `${SHARE_BASE}#${f.id}`;
  let activeRole = localStorage.getItem("fp-role") || "operador";
  if (!ROLES.some((r) => r.id === activeRole)) activeRole = "operador";

  $("#app").innerHTML = `
    <div class="nav" data-nav>
      <button class="btn" id="back" type="button">← Catálogo</button>
      <span class="sp"></span>
      <button class="btn" id="copy" type="button">Copiar link</button>
      <button class="btn solid" id="img" type="button">Guardar imagen</button>
    </div>

    <article class="sheet" id="sheet" aria-label="Ficha de proceso ${esc(f.sku)}">
      <div class="stripe"></div>

      <div class="plate">
        ${f.foto
          ? `<div class="foto"><img src="${esc(f.foto)}" alt="Envase ${esc(f.desc)}" fetchpriority="high" decoding="async"></div>`
          : `<div class="foto ph-empty"><span>Sin foto</span></div>`}
        <div class="info">
          <div class="kicker">Ficha de proceso · Soplado PEAD · <span class="role-badge" id="role-badge"></span></div>
          <div class="sku-big">${esc(f.sku)}</div>
          <div class="desc-big">${esc(f.desc)}</div>
          <div class="chips">
            <span class="chip">MÁQUINA ${esc(f.maquina)}</span>
            <span class="chip out" style="color:var(--plate-fg);border-color:var(--plate-mute)">${moldesTxt(f)}</span>
          </div>
        </div>
        <div class="lcds">
          <div class="lcd" id="lcd-meta">
            <small>Meta</small>
            <span class="dig">${f.bolsas > 0 ? Math.floor(f.bolsas) : "—"}</span>
            <span class="u">bolsas</span>
          </div>
          <div class="lcd">
            <small>${esc(f.cicloTipo || "Ciclo real")}</small>
            <span class="dig">${num(f.ciclo)}</span>
            <span class="u">segundos</span>
          </div>
        </div>
      </div>

      <!-- Barra de roles (no aparece en la foto exportada para WhatsApp) -->
      <nav class="role-bar" id="role-bar" data-no-export="true" aria-label="Filtrar ficha por rol">
        ${ROLES.map((r) => `<button class="role-btn" type="button" data-role="${r.id}">${r.label}</button>`).join("")}
      </nav>

      <!-- Contenido dinámico según el rol seleccionado -->
      <div class="sec" id="role-content"></div>

      <div class="legend">${(f.leyenda || []).map((t) => `<p>${esc(t)}</p>`).join("")}</div>

      <div class="foot">
        <div class="qr">${qrSvg(url)}</div>
        <div>
          <h2>Escanea para abrir esta ficha</h2>
          <code id="url">${esc(url)}</code>
          <div class="meta">Ficha ${esc(f.version)} · ${dateEs(f.fecha)} · ${esc(f.maquina)} · SKU ${esc(f.sku)}</div>
        </div>
      </div>

      <div class="stripe"></div>
    </article>`;

  const fotoImg = $("#sheet .foto img");
  if (fotoImg) {
    fotoImg.addEventListener("error", () => {
      const box = fotoImg.parentElement;
      if (box) {
        box.classList.add("ph-empty");
        box.innerHTML = "<span>Sin foto</span>";
      }
    });
  }

  const paintRole = (role) => {
    activeRole = role;
    try { localStorage.setItem("fp-role", role); } catch (e) {}

    const label = ROLES.find((r) => r.id === role)?.label || "Operador";
    $("#role-badge").textContent = `Vista: ${label}`;
    document.querySelectorAll("#role-bar .role-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.role === role);
    });
    const showMeta = role === "operador" || role === "todo";
    $("#lcd-meta").hidden = !showMeta;

    const box = $("#role-content");
    if (role === "operador") {
      box.innerHTML = renderCronoPanel(f) + renderOperador(f) + renderAvanceTurno(f);
      bindCronoPanel(f);
      bindOperador(f);
      bindAvanceTurno(f);
    } else if (role === "mecanico") {
      box.innerHTML = renderHmiBody(f, hmiRow);
    } else if (role === "molinero") {
      box.innerHTML = renderMolinero(f);
      bindMolinero(f);
    } else {
      box.innerHTML = renderOperador(f) + renderMolinero(f) + renderHmiBody(f, hmiRow);
      bindOperador(f);
      bindMolinero(f);
    }

    box.classList.remove("role-anim");
    void box.offsetWidth;
    box.classList.add("role-anim");
  };

  $("#role-bar").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-role]");
    if (btn) paintRole(btn.dataset.role);
  });

  $("#back").addEventListener("click", () => { location.hash = ""; });
  $("#copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copiado");
    } catch (e) {
      toast("Toca el link de abajo y cópialo");
    }
  });
  $("#img").addEventListener("click", () => saveImage(f, activeRole));

  paintRole(activeRole);
}