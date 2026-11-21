import { $, esc, num, stats } from "./bloques.js";

const filt = { maq: "", q: "" };

export function renderCatalog(fichas) {
  const maqs = [...new Set(fichas.map((f) => f.maquina).filter(Boolean))].sort();
  $("#app").innerHTML = `
    <div class="page-h"><h1>Catálogo de recetas</h1><span class="count" id="count"></span></div>
    <p class="lead">Elige una máquina o busca por SKU o descripción. También puedes escanear el QR pegado en la máquina para abrir directo su ficha.</p>
    <div class="filters">
      <div class="field"><label for="f-maq">Máquina</label>
        <select id="f-maq"><option value="">Todas</option>${maqs.map((m) => `<option value="${esc(m)}"${m === filt.maq ? " selected" : ""}>${esc(m)}</option>`).join("")}</select>
      </div>
      <div class="field"><label for="f-q">Buscar SKU o descripción</label>
        <input id="f-q" type="search" placeholder="500128 o cera" value="${esc(filt.q)}" autocomplete="off">
      </div>
      <button class="btn" id="f-clear" type="button">Limpiar</button>
    </div>
    <div class="cards" id="cards"></div>`;

  const draw = () => {
    const q = filt.q.trim().toLowerCase();
    const list = fichas.filter(
      (f) => (!filt.maq || f.maquina === filt.maq) && (!q || `${f.sku} ${f.desc} ${f.maquina}`.toLowerCase().includes(q))
    );
    $("#count").textContent = `${list.length} ${list.length === 1 ? "ficha" : "fichas"} de ${fichas.length}`;
    $("#cards").innerHTML = list.length
      ? list.map((f) => {
          const s = stats(f);
          return `<a class="card" href="#${esc(f.id)}">
            <div class="ph"><img src="${esc(f.foto)}" alt="Envase ${esc(f.desc)}" loading="lazy"></div>
            <div class="body">
              <div class="sku">${esc(f.sku)}</div>
              <div class="desc">${esc(f.desc)}</div>
              <div class="chips">
                <span class="chip">${esc(f.maquina)}</span>
                <span class="chip out">${f.moldes && f.cavidades ? `${f.moldes} moldes × ${f.cavidades} cav.` : "moldes y cav. por anotar"}</span>
              </div>
              <div class="mini">
                <span><b>${num(f.ciclo)}</b> s ciclo</span>
                <span><b>${s.porCiclo || "—"}</b> env/ciclo</span>
                <span><b>${f.pesoG ? num(f.pesoG) : "—"}</b> g</span>
              </div>
            </div>
          </a>`;
        }).join("")
      : `<div class="empty">Ninguna ficha coincide con el filtro. Prueba con otra máquina o borra la búsqueda.</div>`;
  };

  $("#f-maq").addEventListener("change", (e) => { filt.maq = e.target.value; draw(); });
  $("#f-q").addEventListener("input", (e) => { filt.q = e.target.value; draw(); });
  $("#f-clear").addEventListener("click", () => {
    filt.maq = ""; filt.q = ""; $("#f-maq").value = ""; $("#f-q").value = ""; draw();
  });
  draw();
}