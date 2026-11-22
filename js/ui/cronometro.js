import { $, esc, num, n1, stats, toast } from "./bloques.js";

const vib = (pat = 30) => {
  try { if (navigator.vibrate) navigator.vibrate(pat); } catch (e) {}
};

function loadSaved(id) {
  try {
    const raw = localStorage.getItem(`fp-ciclo-${id}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && Number(data.ciclo) > 0 ? data : null;
  } catch (e) {
    return null;
  }
}

function saveCiclo(id, ciclo) {
  try {
    localStorage.setItem(`fp-ciclo-${id}`, JSON.stringify({
      ciclo: +Number(ciclo).toFixed(1),
      ts: Date.now()
    }));
  } catch (e) {}
}

function clearCiclo(id) {
  try { localStorage.removeItem(`fp-ciclo-${id}`); } catch (e) {}
}

function formatHora(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const hoy = new Date();
  const esHoy = d.toDateString() === hoy.toDateString();
  const hora = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (esHoy) return `Hoy ${hora}`;
  return `${d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })} ${hora}`;
}

function evaluarCiclo(f, cicloReal) {
  const std = f.ciclo > 0 ? f.ciclo : 0;
  const med = +Number(cicloReal).toFixed(1);
  const diff = +(med - std).toFixed(1);
  const s = stats(f);

  // Semáforo Andon: +1,0 s o más lento SIEMPRE marca rojo
  let clase = "ok";
  let etiqueta = "ÓPTIMO · EN RANGO";
  let aviso = "La máquina está corriendo dentro del ciclo estándar.";
  if (diff >= 1) {
    clase = "bad";
    etiqueta = "LENTO · FUERA DE ESTÁNDAR";
    aviso = "1 s o más lento genera pérdida directa de bolsas. Avisar a mecánica.";
  } else if (diff > 0.2) {
    clase = "warn";
    etiqueta = "ATENCIÓN · LIGERAMENTE LENTO";
    aviso = "Debajo de 1 s de retraso, pero conviene vigilar el ritmo.";
  }

  // Proyección real vs meta de turno (7.2 h)
  const metaBolsas = f.bolsas > 0
    ? Math.floor(f.bolsas)
    : (f.envasesPorBolsa > 0 && s.teorico > 0 ? Math.floor((s.teorico * 7.2) / f.envasesPorBolsa) : 0);

  let proyBolsas = 0;
  if (med > 0) {
    if (f.envasesPorBolsa > 0 && s.porCiclo > 0) {
      const envTurnoReal = ((7.2 * 3600) / med) * s.porCiclo;
      proyBolsas = Math.floor(envTurnoReal / f.envasesPorBolsa);
    } else if (metaBolsas > 0 && std > 0) {
      proyBolsas = Math.floor(metaBolsas * (std / med));
    }
  }

  const diffBolsas = metaBolsas > 0 ? proyBolsas - metaBolsas : 0;
  const diffSegTxt = `${diff > 0 ? "+" : diff < 0 ? "−" : ""}${n1(Math.abs(diff))} s`;
  const diffBolsasTxt = metaBolsas > 0
    ? (diffBolsas > 0 ? `+${diffBolsas} bolsas vs. meta` : diffBolsas < 0 ? `${diffBolsas} bolsas vs. meta` : "En meta exacta")
    : "Sin meta cargada";

  return { std, med, diff, clase, etiqueta, aviso, metaBolsas, proyBolsas, diffBolsas, diffSegTxt, diffBolsasTxt };
}

function buildPanelInner(f) {
  const saved = loadSaved(f.id);

  if (!saved) {
    return `
      <div class="crono-strip" data-no-export="true">
        <div class="crono-strip-txt">
          <b>Verificador de ciclo real</b>
          <span>Estándar: ${num(f.ciclo)} s · Mide en vivo si la máquina cumple la meta de 7.2 h</span>
        </div>
        <button class="btn solid" type="button" data-crono="open">⏱ Medir ciclo</button>
      </div>`;
  }

  const ev = evaluarCiclo(f, saved.ciclo);

  return `
    <div class="andon ${ev.clase}">
      <div class="andon-top">
        <span class="pill ${ev.clase}">${ev.etiqueta}</span>
        <span class="andon-meta">Medido · ${formatHora(saved.ts)}</span>
        <div class="andon-acts" data-no-export="true">
          <button class="pill-btn" type="button" data-crono="open">⏱ Volver a medir</button>
          <button class="pill-btn" type="button" data-crono="clear" aria-label="Borrar medición">✕</button>
        </div>
      </div>

      <div class="andon-grid">
        <div class="andon-kpi">
          <span class="k-code">CICLO MEDIDO VS. ESTÁNDAR (${num(ev.std)} s)</span>
          <span class="k-val" data-andon-val>${n1(ev.med)} <small>s (${ev.diffSegTxt})</small></span>
        </div>
        <div class="andon-kpi">
          <span class="k-code">PROYECCIÓN TURNO 7.2 H (META: ${ev.metaBolsas || "—"})</span>
          <span class="k-val" data-andon-val>${ev.metaBolsas ? `${ev.proyBolsas} <small>bolsas (${ev.diffBolsasTxt})</small>` : "—"}</span>
        </div>
      </div>
      <p class="andon-note">${ev.aviso}</p>
    </div>`;
}

function buildGuiaAnimada() {
  return `
    <details class="crono-guide" open>
      <summary>¿Cómo medir el ciclo? (guía visual rápida)</summary>
      <div class="crono-guide-body">
        <svg class="mold-svg" viewBox="0 0 280 86" role="img" aria-label="Animación de cierre de molde para marcar inicio y fin del ciclo">
          <rect x="0" y="0" width="280" height="86" fill="#07090A" stroke="#2A3238" stroke-width="2"/>
          <g class="mold-l">
            <rect x="64" y="16" width="44" height="54" fill="#2A3238" stroke="#9AA6B0" stroke-width="2"/>
            <path d="M108 26 h-10 v34 h10" fill="#101316"/>
          </g>
          <g class="mold-r">
            <rect x="172" y="16" width="44" height="54" fill="#2A3238" stroke="#9AA6B0" stroke-width="2"/>
            <path d="M172 26 h10 v34 h-10" fill="#101316"/>
          </g>
          <g class="mold-bottle">
            <rect x="135" y="21" width="10" height="7" rx="1" fill="#FFC400"/>
            <rect x="131" y="28" width="18" height="34" rx="4" fill="#FFC400"/>
          </g>
          <circle class="mold-pulse" cx="140" cy="43" r="10" fill="none" stroke="#FFC400" stroke-width="2.5"/>
          <text x="140" y="12" text-anchor="middle" fill="#FFC400" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="600" class="mold-lbl">PUNTO FIJO: AL CERRAR EL MOLDE</text>
          <text x="140" y="80" text-anchor="middle" fill="#9AA6B0" font-family="IBM Plex Mono, monospace" font-size="8.5">MEDIR AL CERRAR · PARAR AL VOLVER A CERRAR</text>
        </svg>
        <ol class="crono-steps">
          <li>Mira un punto fijo (ej. <b>cuando cierra el molde</b>).</li>
          <li>Toca <b>MEDIR</b> justo en ese instante.</li>
          <li>Toca <b>PARAR</b> cuando el molde vuelva a cerrar y luego <b>GUARDAR</b>.</li>
        </ol>
      </div>
    </details>`;
}

export function renderCronoPanel(f) {
  return `<div id="crono-host">${buildPanelInner(f)}</div>`;
}

export function bindCronoPanel(f) {
  const host = $("#crono-host");
  if (!host) return;

  const refreshHost = (animar = false) => {
    host.innerHTML = buildPanelInner(f);
    if (animar) {
      host.querySelectorAll("[data-andon-val]").forEach((el) => {
        el.classList.remove("qty-flash");
        void el.offsetWidth;
        el.classList.add("qty-flash");
      });
    }
  };

  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-crono]");
    if (!btn) return;
    const act = btn.dataset.crono;
    if (act === "open") {
      openCronoModal(f, () => refreshHost(true));
    } else if (act === "clear") {
      clearCiclo(f.id);
      refreshHost(false);
      toast("Medición eliminada");
    }
  });
}

function openCronoModal(f, onSaved) {
  const ov = $("#ovbox");
  if (!ov) return;

  let estado = "idle"; // idle | running | done
  let startTime = 0;
  let rafId = null;
  let medidoActual = 0;

  ov.innerHTML = `
    <div class="ov" id="crono-ov" role="dialog" aria-modal="true" aria-label="Medir ciclo real">
      <div class="ovin crono-modal">
        <div class="crono-head">
          <div>
            <span class="role-badge">SKU ${esc(f.sku)}</span>
            <h3>Verificador de ciclo real</h3>
          </div>
          <button class="btn ghost crono-close" id="crono-x" type="button" aria-label="Cerrar">✕</button>
        </div>

        ${buildGuiaAnimada()}

        <div class="crono-lcd">
          <small>ESTÁNDAR: ${num(f.ciclo)} s</small>
          <span class="dig" id="crono-dig">0,0</span>
          <span class="u" id="crono-sub">Listo para medir</span>
        </div>

        <div id="crono-preview" hidden></div>

        <div class="crono-controls" id="crono-ctrl-run">
          <button class="btn solid crono-main-btn" id="crono-main" type="button">MEDIR</button>
        </div>

        <div class="crono-done-acts" id="crono-ctrl-done" hidden>
          <button class="btn solid crono-save-btn" id="crono-save" type="button">GUARDAR</button>
          <button class="btn crono-retry-btn" id="crono-retry" type="button">VOLVER A MEDIR</button>
        </div>
      </div>
    </div>`;

  const elDig = $("#crono-dig", ov);
  const elSub = $("#crono-sub", ov);
  const elPreview = $("#crono-preview", ov);
  const elMain = $("#crono-main", ov);
  const elCtrlRun = $("#crono-ctrl-run", ov);
  const elCtrlDone = $("#crono-ctrl-done", ov);

  const flashDig = () => {
    elDig.classList.remove("qty-flash");
    void elDig.offsetWidth;
    elDig.classList.add("qty-flash");
  };

  const stopLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const tick = () => {
    if (estado !== "running") return;
    const seg = (performance.now() - startTime) / 1000;
    elDig.textContent = n1(seg);
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    vib(30);
    estado = "running";
    startTime = performance.now();
    elPreview.hidden = true;
    elCtrlDone.hidden = true;
    elCtrlRun.hidden = false;
    elMain.textContent = "PARAR";
    elMain.classList.remove("solid");
    elMain.classList.add("stop");
    elSub.textContent = "Midiendo ciclo...";
    tick();
  };

  const stop = () => {
    if (estado !== "running") return;
    stopLoop();
    const seg = (performance.now() - startTime) / 1000;

    if (seg < 0.5) {
      reset();
      toast("Medición muy corta, intenta de nuevo");
      return;
    }

    vib([35, 30, 35]);
    estado = "done";
    medidoActual = +seg.toFixed(1);

    elDig.textContent = n1(medidoActual);
    flashDig();
    elSub.textContent = "Ciclo medido";

    const ev = evaluarCiclo(f, medidoActual);
    elPreview.hidden = false;
    elPreview.innerHTML = `
      <div class="andon ${ev.clase} role-anim">
        <div class="andon-top">
          <span class="pill ${ev.clase}">${ev.etiqueta}</span>
          <span class="andon-meta">${ev.diffSegTxt} vs. estándar</span>
        </div>
        <div class="andon-grid">
          <div class="andon-kpi">
            <span class="k-code">PROYECCIÓN 7.2 H</span>
            <span class="k-val">${ev.metaBolsas ? `${ev.proyBolsas} <small>bolsas</small>` : "—"}</span>
          </div>
          <div class="andon-kpi">
            <span class="k-code">VS. META (${ev.metaBolsas || "—"})</span>
            <span class="k-val"><small>${ev.diffBolsasTxt}</small></span>
          </div>
        </div>
        <p class="andon-note">${ev.aviso}</p>
      </div>`;

    elCtrlRun.hidden = true;
    elCtrlDone.hidden = false;
  };

  const reset = () => {
    stopLoop();
    estado = "idle";
    medidoActual = 0;
    elDig.textContent = "0,0";
    elSub.textContent = "Listo para medir";
    elMain.textContent = "MEDIR";
    elMain.classList.remove("stop");
    elMain.classList.add("solid");
    elPreview.hidden = true;
    elCtrlDone.hidden = true;
    elCtrlRun.hidden = false;
  };

  const close = () => {
    stopLoop();
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("hashchange", close);
    ov.innerHTML = "";
  };

  const onKey = (e) => {
    if (e.key === "Escape") close();
  };

  elMain.addEventListener("click", () => {
    if (estado === "idle") start();
    else if (estado === "running") stop();
  });

  $("#crono-retry", ov).addEventListener("click", reset);
  $("#crono-save", ov).addEventListener("click", () => {
    if (!medidoActual) return;
    vib([25, 40, 25]);
    saveCiclo(f.id, medidoActual);
    close();
    if (onSaved) onSaved();
    toast("Ciclo real guardado");
  });

  $("#crono-x", ov).addEventListener("click", close);
  $("#crono-ov", ov).addEventListener("click", (e) => {
    if (e.target.id === "crono-ov") close();
  });
  document.addEventListener("keydown", onKey);
  window.addEventListener("hashchange", close, { once: true });
}