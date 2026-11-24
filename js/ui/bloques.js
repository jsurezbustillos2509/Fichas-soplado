// Utilidades globales y formato numérico/fechas
export const $ = (s, r = document) => r.querySelector(s);

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export const num = (v) => (v === null || v === undefined ? "Por registrar" : String(v).replace(".", ","));
export const n1 = (v) => (v === null || v === undefined ? "Por registrar" : Number(v).toFixed(1).replace(".", ","));
export const secs = (v, f) => (v === null || v === undefined ? "Por registrar" : (v * f.unidad.factor).toFixed(1).replace(".", ","));
export const dateEs = (d) => (d ? d.split("-").reverse().join("/") : "");

export function stats(f) {
  const hasMolde = f.moldes !== null && f.cavidades !== null && f.moldes > 0 && f.cavidades > 0;
  const hasCiclo = f.ciclo !== null && f.ciclo > 0;
  const porCiclo = hasMolde ? f.moldes * f.cavidades : null;
  const ciclosHora = hasCiclo ? Math.round(3600 / f.ciclo) : null;
  const teorico = hasCiclo && porCiclo !== null ? Math.round((3600 / f.ciclo) * porCiclo) : null;
  const bolsasHora = teorico !== null && f.envasesPorBolsa !== null && f.envasesPorBolsa > 0
    ? teorico / f.envasesPorBolsa
    : null;
  return { porCiclo, ciclosHora, teorico, bolsasHora };
}

export const moldesTxt = (f) =>
  f.moldes !== null && f.cavidades !== null && f.moldes > 0 && f.cavidades > 0
    ? `${f.moldes} MOLDES × ${f.cavidades} ${f.cavidades === 1 ? "CAVIDAD" : "CAVIDADES"}`
    : "MOLDES × CAVIDADES: POR REGISTRAR";

let toastT;
export function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.hidden = true; }, 2800);
}

// --- PIEZAS DE LEGO REUTILIZABLES PARA CUALQUIER HMI ---

export const secH = (tag, title, sub = "") =>
  `<div class="sec-h"><span class="tag">${esc(tag)}</span><h2>${esc(title)}</h2>${sub ? `<span class="sub">${sub}</span>` : ""}</div>`;

function axisTicks(max) {
  const st = [12, 10, 8, 6, 5, 4, 3, 2, 1].find((s) => max / s >= 4) || 1;
  const t = [];
  for (let v = 0; v <= max + 1e-9; v += st) t.push(v);
  return t;
}

const axisHtml = (max) =>
  `<div class="axis"><span></span><div class="ticks">${axisTicks(max).map((t) => `<span style="left:${(t / max) * 100}%">${t} s</span>`).join("")}</div><span></span></div>`;

const gridLines = (max) =>
  axisTicks(max).slice(1).map((t) => `<i class="gl" style="left:${(t / max) * 100}%"></i>`).join("");

// 1) Barras simples (ej. TIME 1 en QCM / QCM-75)
export function bloqueBarrasSimples(f, items, nota = "") {
  const max = f.ciclo && f.ciclo > 0 ? f.ciclo : 30;
  const bars = items.map(([n, v]) => {
    if (v === null || v === undefined) {
      return `<div class="brow pend">
        <div class="lb">${esc(n)}</div>
        <div class="track pend-track"><span>Por registrar</span></div>
        <div class="vl pend-txt">Por reg.</div>
      </div>`;
    }
    const w = Math.min(100, ((v * f.unidad.factor) / max) * 100);
    return `<div class="brow${v === 0 ? " zero" : ""}">
      <div class="lb">${esc(n)}</div>
      <div class="track" role="img" aria-label="${esc(n)}: ${secs(v, f)} segundos">
        ${gridLines(max)}${v > 0 ? `<div class="fill" style="width:max(4px,${w.toFixed(2)}%)"></div>` : ""}
      </div>
      <div class="vl">${secs(v, f)} s<small>valor ${num(v)}</small></div>
    </div>`;
  }).join("");
  return `${axisHtml(max)}<div class="bars">${bars}</div>${nota ? `<p class="note">${nota}</p>` : ""}`;
}

// 2) Barras dobles IZQ/DER (ej. BEKUM)
export function bloqueBarrasDobles(f, items, notas = []) {
  const max = f.ciclo && f.ciclo > 0 ? f.ciclo : 30;
  const bars = items.map(([n, l, r]) => {
    if ((l === null || l === undefined) && (r === null || r === undefined)) {
      return `<div class="brow pend">
        <div class="lb">${esc(n)}</div>
        <div class="track two pend-track"><span>Por registrar</span></div>
        <div class="vl2 pend-txt"><span>Por reg.</span></div>
      </div>`;
    }
    const lv = l ?? 0;
    const rv = r ?? 0;
    const wl = Math.min(100, ((lv * f.unidad.factor) / max) * 100);
    const wr = Math.min(100, ((rv * f.unidad.factor) / max) * 100);
    const df = lv !== rv;
    return `<div class="brow${lv === 0 && rv === 0 ? " zero" : ""}">
      <div class="lb">${esc(n)}</div>
      <div class="track two" role="img" aria-label="${esc(n)}: izq ${secs(lv, f)} s, der ${secs(rv, f)} s">
        ${gridLines(max)}
        ${lv > 0 ? `<div class="fill l" style="width:max(4px,${wl.toFixed(2)}%)"></div>` : ""}
        ${rv > 0 ? `<div class="fill d" style="width:max(4px,${wr.toFixed(2)}%)"></div>` : ""}
      </div>
      <div class="vl2"><span${df ? ' class="df"' : ""}><i>I</i>${l === null ? "—" : n1(l)}</span><span${df ? ' class="df"' : ""}><i>D</i>${r === null ? "—" : n1(r)}</span></div>
    </div>`;
  }).join("");
  const leyenda = `<div class="key"><span><b style="background:var(--yellow)"></b>IZQ (I)</span><span><b style="background:var(--steel)"></b>DER (D)</span><span><b style="background:var(--hi)"></b>valor distinto entre lados</span></div>`;
  return `${axisHtml(max)}<div class="bars">${bars}</div>${leyenda}${notas.map((n) => `<p class="note">${n}</p>`).join("")}`;
}

// 3) Tablas L/R a dos columnas (ej. TIME 2 y PQ1)
const ptab = (rows) => `<div class="ptab"><div class="phead"><span></span><span>L</span><span>R</span></div>${rows.map(([n, l, r]) => {
  const cell = (v, extra = "") => (v === null || v === undefined
    ? `<div class="v pend ${extra}">Por reg.</div>`
    : `<div class="v${v === 0 ? " zero" : ""} ${extra}">${num(v)}</div>`);
  return `<div class="prow"><div class="nm">${esc(n)}</div>${r === undefined
    ? cell(l, "one")
    : `${cell(l)}${cell(r)}`}</div>`;
}).join("")}</div>`;

export const bloqueTablasLR = (izq, der) => `<div class="cols">${ptab(izq)}${ptab(der)}</div>`;

// 4) Cuadrícula PQ2 (P y Q por pasos 1-2-3)
export const bloquePQ2 = (bloques) => `<div class="pq2">${bloques.map((b) => {
  const pqCell = (v) => (v === null || v === undefined
    ? `<span class="v pend">—</span>`
    : `<span class="v${v === 0 ? " zero" : ""}">${num(v)}</span>`);
  return `
  <div class="pqb"><h3>${esc(b.t)}</h3><div class="pqg">
    <span></span><span class="h">1</span><span class="h">2</span><span class="h">3</span>
    <span class="r">P</span>${b.P.map(pqCell).join("")}
    <span class="r">Q</span>${b.Q.map(pqCell).join("")}
  </div></div>`;
}).join("")}</div>`;

// 5) Zonas de temperatura + interruptores opcionales
export function bloqueZonasTemp(zonas, { clase = "", decimales = false, switches = [], extras = [] } = {}) {
  const fmt = (v) => (v === null || v === undefined ? "###" : decimales ? n1(v) : num(v));
  const fmtAct = (v) => (v === null || v === undefined ? "—" : decimales ? n1(v) : num(v));
  const zHtml = `<div class="zones ${clase}">${zonas.map((z) => `
    <div class="zt ${z.on ? "on" : "off"}">
      <div class="zn">Zona ${z.z}</div>
      <span class="pill ${z.on ? "ok" : "bad"}">${z.on ? "ON" : "OFF"}</span>
      <div class="zc">${fmt(z.consigna)}</div>
      <div class="zl">CONSIGNA °C</div>
      <div class="za">actual ${fmtAct(z.actual)}</div>
    </div>`).join("")}</div>`;

  const swHtml = switches.length
    ? `<div class="sws">${switches.map(([l, on]) => `<div class="sw"><span class="l">${esc(l)}</span><span class="pill ${on ? "ok" : "bad"}">${on ? "ON" : "OFF"}</span></div>`).join("")}</div>`
    : "";

  const exHtml = extras.length
    ? `<div class="vfd" style="margin-top:12px">${extras.map((e) => e.c !== undefined && e.c !== null
        ? `<div class="vf"><div class="l">${esc(e.n)}</div><div class="n">${n1(e.c)}<small> ${e.u} consigna</small></div><div class="za2">actual ${e.a !== null && e.a !== undefined ? n1(e.a) : "—"} ${e.u}</div></div>`
        : tileHtml(e.n, e.c !== undefined ? e.c : e.v, e.u, e.pend || "Por registrar")).join("")}</div>`
    : "";

  return zHtml + swHtml + exHtml;
}

// 6) Tarjetas numéricas (Variadores, Manga, Herramientas simples)
const tileHtml = (l, v, u = "", pend = "Por registrar") =>
  v === null || v === undefined
    ? `<div class="vf pend"><div class="l">${esc(l)}</div><div class="n">${esc(pend)}</div></div>`
    : `<div class="vf"><div class="l">${esc(l)}</div><div class="n${v === 0 ? " zero" : ""}">${num(v)}<small> ${esc(u)}</small></div></div>`;

export const bloqueTarjetas = (items) =>
  `<div class="vfd">${items.map((t) => tileHtml(t.l, t.v, t.u, t.pend)).join("")}</div>`;

// 7) Herramientas de Cabezal (Cono / Funda) y Agujas (Casquillo / Cuchilla / Cuello) en mm
const fmtMm = (v) => {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const clean = String(v).trim().replace(/\s*mm$/i, "");
  const parsed = Number(clean.replace(",", "."));
  return Number.isFinite(parsed) ? num(parsed) : esc(clean);
};

const specCardMm = (label, rawVal, pend = "Por registrar") => {
  const val = fmtMm(rawVal);
  const ok = val !== null;
  return `
    <div style="background:var(--panel);border:1px solid ${ok ? "var(--line)" : "dashed var(--line)"};border-left:3px solid ${ok ? "var(--yellow)" : "var(--steel)"};border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:4px">
      <span style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--steel)">${esc(label)}</span>
      ${ok
        ? `<div style="font-family:var(--font-mono);font-size:20px;font-weight:600;color:var(--ink);line-height:1.15">${val}<span style="font-size:12px;font-weight:500;color:var(--steel);margin-left:4px">mm</span></div>`
        : `<div style="font-size:13px;font-weight:500;color:var(--steel);font-style:italic;line-height:1.4">${esc(pend)}</div>`}
    </div>`;
};

const cellMm = (rawVal, pend = "Por registrar") => {
  const val = fmtMm(rawVal);
  return val !== null
    ? `<div class="blank filled" style="font-family:var(--font-mono);font-weight:600">${val} <small style="font-weight:500;opacity:.75">mm</small></div>`
    : `<div class="blank">${esc(pend)}</div>`;
};

export function bloqueHerramientas({ cabezal = {}, agujas = null, simple = null, pend = "Por registrar" } = {}) {
  const cabezalHtml = `
    <div style="padding:12px 14px;border-bottom:1px solid var(--line)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink)">Herramientas del Cabezal</span>
        <span style="font-size:10px;font-family:var(--font-mono);padding:2px 7px;border-radius:4px;border:1px solid var(--line);color:var(--steel)">EXTRUSIÓN · MM</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
        ${specCardMm("Cono", cabezal.cono, pend)}
        ${specCardMm("Funda", cabezal.funda, pend)}
      </div>
    </div>`;

  let agujaHtml = "";
  if (simple) {
    agujaHtml = `
      <div style="padding:12px 14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink)">Herramientas de la Aguja</span>
          <span style="font-size:10px;font-family:var(--font-mono);padding:2px 7px;border-radius:4px;border:1px solid var(--line);color:var(--steel)">SOPLADO · MM</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">
          ${specCardMm("Casquillo", simple.casquillo, pend)}
          ${specCardMm("Cuchilla", simple.cuchilla, pend)}
          ${specCardMm("Altura cuello", simple.cuello, pend)}
        </div>
      </div>`;
  } else if (agujas) {
    agujaHtml = `
      <div style="padding:12px 14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink)">Herramientas de las Agujas</span>
          <span style="font-size:10px;font-family:var(--font-mono);padding:2px 7px;border-radius:4px;border:1px solid var(--line);color:var(--steel)">MOLDES L / R · MM</span>
        </div>
        <div class="tools" style="margin:0">
          <span></span><span class="hh">Casquillo</span><span class="hh">Cuchilla</span><span class="hh">Altura cuello</span>
          <span class="mo">Molde L</span>${cellMm(agujas.L?.casquillo, pend)}${cellMm(agujas.L?.cuchilla, pend)}${cellMm(agujas.L?.cuello, pend)}
          <span class="mo">Molde R</span>${cellMm(agujas.R?.casquillo, pend)}${cellMm(agujas.R?.cuchilla, pend)}${cellMm(agujas.R?.cuello, pend)}
        </div>
      </div>`;
  }

  return `
    <div style="border:1px solid var(--line);border-radius:12px;overflow:hidden;background:rgba(127,138,148,.04);margin-top:6px">
      ${cabezalHtml}
      ${agujaHtml}
    </div>`;
}

export const bloqueAgujasLR = (a, pend = "Por registrar") => bloqueHerramientas({ agujas: a, pend });