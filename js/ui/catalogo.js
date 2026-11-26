import { isFichaIncompleta } from "../datos.js";
import { CATEGORIAS } from "../config.js";
import { $, esc, num, stats } from "./bloques.js";
import { openNewSkuFlow } from "./nuevo-sku.js";
import { getMachineSvg } from "./categorias.js";

const filt = { maq: "", q: "" };

export function renderCatalog(fichas, catId = "sopladora") {
  const cat = CATEGORIAS.find((c) => c.id === catId) || CATEGORIAS[0];
  const catFichas = fichas.filter((f) => cat.layouts.includes(f.layout));
  const maqs = [...new Set(catFichas.map((f) => f.maquina).filter(Boolean))].sort();

  if (filt.maq && !maqs.includes(filt.maq)) filt.maq = "";

  $("#app").innerHTML = `
    <div class="nav">
      <a class="btn" href="#">← Categorías</a>
      <span class="sp"></span>
      ${cat.layouts.length ? `<button class="btn solid" id="btn-new-sku" type="button">+ Agregar SKU</button>` : ""}
    </div>
    <div class="page-h">
      <div>
        <h1>Catálogo · ${esc(cat.titulo)}</h1>
        <span class="count" id="count"></span>
      </div>
    </div>
    <p class="lead">${esc(cat.subtitulo)}</p>
    ${cat.layouts.length ? `
      <div class="filters">
        <div class="field"><label for="f-maq">Máquina</label>
          <select id="f-maq"><option value="">Todas</option>${maqs.map((m) => `<option value="${esc(m)}"${m === filt.maq ? " selected" : ""}>${esc(m)}</option>`).join("")}</select>
        </div>
        <div class="field"><label for="f-q">Buscar SKU o descripción</label>
          <input id="f-q" type="search" placeholder="500128 o cera" value="${esc(filt.q)}" autocomplete="off">
        </div>
        <button class="btn" id="f-clear" type="button">Limpiar</button>
      </div>
    ` : ""}
    <div class="cards" id="cards"></div>
    <footer class="app-foot">FICHAS DE PROCESO · SOPLADO</footer>`;

  const draw = () => {
    if (!cat.layouts.length || !catFichas.length) {
      $("#count").textContent = "0 fichas registradas";
      $("#cards").innerHTML = `
        <div class="empty-machine-box">
          <div class="empty-machine-stage" style="--cat-bg:${esc(cat.color)}">
            ${getMachineSvg(cat.id)}
          </div>
          <h3>Categoría ${esc(cat.titulo)} sin máquinas aún</h3>
          <p>Todavía no hay máquinas ni SKUs registrados en <b>${esc(cat.titulo)}</b>. Cuando incorpores este equipo en planta, aparecerán aquí sus recetas técnicas.</p>
          <a class="btn solid" href="#">← Volver a categorías</a>
        </div>`;
      return;
    }

    const q = filt.q.trim().toLowerCase();
    const list = catFichas.filter(
      (f) => (!filt.maq || f.maquina === filt.maq) && (!q || `${f.sku} ${f.desc} ${f.maquina}`.toLowerCase().includes(q))
    );
    $("#count").textContent = `${list.length} ${list.length === 1 ? "ficha" : "fichas"} de ${catFichas.length}`;
    $("#cards").innerHTML = list.length
      ? list.map((f, idx) => {
          const s = stats(f);
          const incompleta = isFichaIncompleta(f);
          const fotoHtml = f.foto
            ? `<div class="ph"><img src="${esc(f.foto)}" alt="Envase ${esc(f.desc)}" loading="${idx < 4 ? "eager" : "lazy"}"${idx < 2 ? ' fetchpriority="high"' : ""} decoding="async"></div>`
            : `<div class="ph ph-empty"><span>Sin foto</span></div>`;
          return `<a class="card" href="#${esc(f.id)}">
            ${fotoHtml}
            <div class="body">
              <div class="sku">${esc(f.sku)}</div>
              <div class="desc">${f.desc ? esc(f.desc) : '<span class="pend-inline">Por registrar</span>'}</div>
              <div class="chips">
                <span class="chip">${esc(f.maquina)}</span>
                ${incompleta ? `<span class="chip warn">Incompleta</span>` : ""}
                <span class="chip out">${f.moldes && f.cavidades ? `${f.moldes} moldes × ${f.cavidades} cav.` : "Por registrar"}</span>
              </div>
              <div class="mini">
                <span><b>${f.ciclo !== null ? num(f.ciclo) + " s" : "Por reg."}</b> ciclo</span>
                <span><b>${s.porCiclo !== null ? s.porCiclo : "Por reg."}</b> env/ciclo</span>
                <span><b>${f.pesoG !== null ? num(f.pesoG) + " g" : "Por reg."}</b></span>
              </div>
            </div>
          </a>`;
        }).join("")
      : `<div class="empty">Ninguna ficha coincide con el filtro. Prueba con otra máquina o borra la búsqueda.</div>`;
  };

  // Poka-Yoke: si una URL de foto falla o no existe, muestra "SIN FOTO"
  $("#cards").addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName !== "IMG") return;
    const ph = img.parentElement;
    if (ph) {
      ph.classList.add("ph-empty");
      ph.innerHTML = "<span>Sin foto</span>";
    }
  }, true);

  const btnNew = $("#btn-new-sku");
  if (btnNew) {
    btnNew.addEventListener("click", () => {
      openNewSkuFlow(fichas, () => renderCatalog(fichas, cat.id));
    });
  }

  const selMaq = $("#f-maq");
  const inQ = $("#f-q");
  const btnClear = $("#f-clear");
  if (selMaq) selMaq.addEventListener("change", (e) => { filt.maq = e.target.value; draw(); });
  if (inQ) inQ.addEventListener("input", (e) => { filt.q = e.target.value; draw(); });
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      filt.maq = ""; filt.q = ""; if (selMaq) selMaq.value = ""; if (inQ) inQ.value = ""; draw();
    });
  }
  draw();
}