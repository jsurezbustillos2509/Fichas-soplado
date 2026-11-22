import { $, n1, stats, toast } from "./bloques.js";

const HORAS_TURNO = 7.2;
const MIN_COMIDA = 48; // 8,0 h - 7,2 h = 0,8 h (48 minutos de comida)

const vib = (pat = 25) => {
  try { if (navigator.vibrate) navigator.vibrate(pat); } catch (e) {}
};

function ahoraHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function parseMin(hhmm) {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function loadState(id) {
  try {
    const raw = localStorage.getItem(`fp-avance-${id}`);
    if (!raw) return { ini: "", fin: "", comida: false, bolsas: 0 };
    const d = JSON.parse(raw);
    return {
      ini: typeof d.ini === "string" ? d.ini : "",
      fin: typeof d.fin === "string" ? d.fin : "",
      comida: Boolean(d.comida),
      bolsas: Math.max(0, Math.floor(Number(d.bolsas) || 0))
    };
  } catch (e) {
    return { ini: "", fin: "", comida: false, bolsas: 0 };
  }
}

function saveState(id, st) {
  try {
    localStorage.setItem(`fp-avance-${id}`, JSON.stringify({ ...st, ts: Date.now() }));
  } catch (e) {}
}

function clearState(id) {
  try { localStorage.removeItem(`fp-avance-${id}`); } catch (e) {}
}

function calcTiempo(ini, fin, comida) {
  const mIni = parseMin(ini);
  const mFin = parseMin(fin);
  if (mIni === null || mFin === null) return { valido: false, motivo: "falta" };

  let brutoMin = mFin - mIni;
  if (brutoMin < 0) brutoMin += 1440; // Soporta turno noche que cruza medianoche
  if (brutoMin === 0) return { valido: false, motivo: "igual" };

  const descMin = comida ? MIN_COMIDA : 0;
  const effMin = Math.max(0, brutoMin - descMin);
  return {
    valido: true,
    brutoH: brutoMin / 60,
    effH: effMin / 60,
    effMin,
    descMin
  };
}

function evaluarAvance(f, st) {
  const s = stats(f);
  const metaTurno = f.bolsas > 0
    ? Math.floor(f.bolsas)
    : (f.envasesPorBolsa > 0 && s.teorico > 0 ? Math.floor((s.teorico * HORAS_TURNO) / f.envasesPorBolsa) : 0);

  const bolsasHora = f.envasesPorBolsa > 0 && s.teorico > 0
    ? s.teorico / f.envasesPorBolsa
    : (metaTurno > 0 ? metaTurno / HORAS_TURNO : 0);

  const tiempo = calcTiempo(st.ini, st.fin, st.comida);
  const reales = Math.max(0, Math.floor(Number(st.bolsas) || 0));
  const pctTurno = metaTurno > 0 ? Math.min(100, Math.round((reales / metaTurno) * 100)) : 0;
  const faltan = Math.max(0, metaTurno - reales);

  let esperadas = 0;
  let pctEsperado = 0;
  let diff = 0;
  let clase = "";
  let etiqueta = "SIN HORARIO";
  let nota = "Ingresa la hora de arranque y la hora de fin (o toca AHORA) para evaluar tu avance.";

  if (metaTurno <= 0) {
    nota = "Falta cargar bolsas o envases_por_bolsa en RECETAS para evaluar el avance.";
  } else if (tiempo.valido) {
    if (Math.abs(tiempo.effH - HORAS_TURNO) < 0.01) {
      esperadas = metaTurno;
    } else if (f.envasesPorBolsa > 0 && s.teorico > 0) {
      esperadas = Math.floor(Math.round(s.teorico * tiempo.effH) / f.envasesPorBolsa);
    } else {
      esperadas = Math.floor((metaTurno / HORAS_TURNO) * tiempo.effH);
    }

    pctEsperado = Math.min(100, Math.round((esperadas / metaTurno) * 100));
    diff = reales - esperadas;

    if (tiempo.effMin === 0 && st.comida) {
      clase = "warn";
      etiqueta = "REVISAR COMIDA";
      nota = "El tiempo transcurrido es menor a 48 min; desmarca la comida si aún no descansaste.";
    } else if (diff >= 0) {
      clase = "ok";
      etiqueta = diff > 0 ? `ADELANTADO (+${diff})` : "EN META";
      nota = diff > 0
        ? `Vas ${diff} ${diff === 1 ? "bolsa" : "bolsas"} por encima del ritmo estándar.`
        : "Excelente ritmo: vas exacto con la meta acumulada.";
    } else if (diff === -1) {
      clase = "warn";
      etiqueta = "ATENCIÓN (−1 BOLSA)";
      nota = "Estás 1 bolsa por debajo del estándar a esta hora. Vigila el ciclo y los paros.";
    } else {
      clase = "bad";
      etiqueta = `ATRASADO (${diff} BOLSAS)`;
      nota = `Llevas ${Math.abs(diff)} bolsas por debajo del estándar. Revisar ritmo o avisar a supervisión.`;
    }
  } else if (tiempo.motivo === "igual") {
    nota = "La hora de fin es igual a la de arranque; ajusta la hora para calcular el tiempo transcurrido.";
  }

  // Cálculo de lo que falta para cerrar el turno de 7.2 h
  let resumenRestante = "";
  if (metaTurno > 0) {
    if (faltan === 0) {
      const extra = reales - metaTurno;
      resumenRestante = extra > 0
        ? `Meta de 7,2 h completada (+${extra} ${extra === 1 ? "bolsa" : "bolsas"} extra).`
        : "Meta completa de 7,2 h alcanzada.";
    } else if (tiempo.valido) {
      const restH = Math.max(0, HORAS_TURNO - tiempo.effH);
      if (restH > 0.05) {
        const ritmoNec = faltan / restH;
        const ritmoTxt = bolsasHora > 0
          ? ` (necesitas ${n1(ritmoNec)} bolsas/h · estándar ${n1(bolsasHora)}/h)`
          : ` (necesitas ${n1(ritmoNec)} bolsas/h)`;
        resumenRestante = `Faltan <b>${faltan} ${faltan === 1 ? "bolsa" : "bolsas"}</b> en ${n1(restH)} h restantes${ritmoTxt}.`;
      } else {
        resumenRestante = `Turno de 7,2 h cumplido · Faltaron <b>${faltan} ${faltan === 1 ? "bolsa" : "bolsas"}</b> para llegar a la meta.`;
      }
    } else {
      resumenRestante = `Faltan <b>${faltan} ${faltan === 1 ? "bolsa" : "bolsas"}</b> para completar la meta de ${metaTurno}.`;
    }
  }

  return {
    metaTurno, bolsasHora, tiempo, reales, esperadas, diff,
    pctTurno, pctEsperado, faltan, clase, etiqueta, nota, resumenRestante
  };
}

function flashEls(...els) {
  els.forEach((el) => {
    if (!el) return;
    el.classList.remove("qty-flash");
    void el.offsetWidth;
    el.classList.add("qty-flash");
  });
}

export function renderAvanceTurno(f) {
  const st = loadState(f.id);
  const tieneActivo = Boolean(st.ini || st.fin || st.bolsas > 0);

  return `
    <details class="avance-acc" id="av-box" data-no-export="true" ${tieneActivo ? "open" : ""}>
      <summary class="avance-sum">
        <span class="tag">SEGUIMIENTO</span>
        <h2>Control de avance del turno</h2>
        <span class="avance-badge" id="av-sum-badge"></span>
        <span class="avance-chev" aria-hidden="true">▾</span>
      </summary>

      <div class="calc-box avance-body">
        <div class="av-times">
          <div class="av-tfield">
            <label for="av-ini">Arranque máquina</label>
            <div class="av-trow">
              <input class="av-time-in" id="av-ini" type="time" value="${st.ini}">
              <button class="pill-btn av-now" type="button" data-now="ini">Ahora</button>
            </div>
          </div>
          <div class="av-tfield">
            <label for="av-fin">Fin / Hora actual</label>
            <div class="av-trow">
              <input class="av-time-in" id="av-fin" type="time" value="${st.fin}">
              <button class="pill-btn av-now" type="button" data-now="fin">Ahora</button>
            </div>
          </div>
        </div>

        <div class="av-opts">
          <label class="av-check">
            <input id="av-comida" type="checkbox" ${st.comida ? "checked" : ""}>
            <span>Descontar comida (−48 min / 0,8 h)</span>
          </label>
          <span class="av-eff" id="av-eff"></span>
        </div>

        <div class="av-counter">
          <div class="av-counter-top">
            <span class="av-clabel">Bolsas entregadas</span>
            <button class="av-reset" id="av-reset" type="button">Reiniciar turno</button>
          </div>
          <div class="av-counter-row">
            <button class="btn av-step-btn" id="av-minus" type="button" aria-label="Restar 1 bolsa">−1</button>
            <input class="calc-input av-bolsas-in" id="av-bolsas" type="number" min="0" step="1" inputmode="numeric" value="${st.bolsas}">
            <button class="btn solid av-plus-btn" id="av-plus" type="button">+1 BOLSA</button>
          </div>
        </div>

        <div class="av-prog-wrap" id="av-prog-wrap">
          <div class="av-prog-head">
            <span id="av-prog-lbl">Avance del turno (7,2 h)</span>
            <b id="av-prog-pct">0%</b>
          </div>
          <div class="av-prog-track">
            <div class="av-prog-fill" id="av-prog-fill"></div>
            <div class="av-prog-mark" id="av-prog-mark" hidden title="Meta esperada a esta hora"></div>
          </div>
          <p class="av-prog-rem" id="av-prog-rem"></p>
        </div>

        <div class="andon av-andon" id="av-andon">
          <div class="andon-top">
            <span class="pill" id="av-pill">SIN HORARIO</span>
            <span class="andon-meta" id="av-meta-txt"></span>
          </div>
          <div class="andon-grid">
            <div class="andon-kpi">
              <span class="k-code">ENTREGADAS VS. ESPERADAS</span>
              <span class="k-val" id="av-kpi-comp">—</span>
            </div>
            <div class="andon-kpi">
              <span class="k-code">DIFERENCIA ACTUAL</span>
              <span class="k-val" id="av-kpi-diff">—</span>
            </div>
          </div>
          <p class="andon-note" id="av-note"></p>
        </div>
      </div>
    </details>`;
}

export function bindAvanceTurno(f) {
  const box = $("#av-box");
  if (!box) return;

  const st = loadState(f.id);
  const inIni = $("#av-ini", box);
  const inFin = $("#av-fin", box);
  const inComida = $("#av-comida", box);
  const inBolsas = $("#av-bolsas", box);

  const elSumBadge = $("#av-sum-badge", box);
  const elEff = $("#av-eff", box);
  const elProgPct = $("#av-prog-pct", box);
  const elProgFill = $("#av-prog-fill", box);
  const elProgMark = $("#av-prog-mark", box);
  const elProgRem = $("#av-prog-rem", box);
  const elAndon = $("#av-andon", box);
  const elPill = $("#av-pill", box);
  const elMetaTxt = $("#av-meta-txt", box);
  const elKpiComp = $("#av-kpi-comp", box);
  const elKpiDiff = $("#av-kpi-diff", box);
  const elNote = $("#av-note", box);

  const paint = (animar = false, origen = "") => {
    const ev = evaluarAvance(f, st);

    if (origen !== "bolsas") inBolsas.value = st.bolsas;

    // Resumen compacto en la barra desplegable
    if (ev.metaTurno > 0 && (st.bolsas > 0 || ev.tiempo.valido)) {
      elSumBadge.innerHTML = `<span class="pill ${ev.clase || "warn"}">${st.bolsas}/${ev.metaTurno} · ${ev.etiqueta}</span>`;
    } else {
      elSumBadge.textContent = "Tocar para registrar";
    }

    // Tiempo efectivo calculado
    if (ev.tiempo.valido) {
      elEff.innerHTML = st.comida
        ? `Efectivo: <b>${n1(ev.tiempo.effH)} h</b> (${n1(ev.tiempo.brutoH)} h − 48 min)`
        : `Efectivo: <b>${n1(ev.tiempo.effH)} h</b>`;
    } else {
      elEff.textContent = "Tiempo efectivo: —";
    }

    // Barra de progreso HMI hacia la meta de 7,2 h
    elProgPct.textContent = `${ev.pctTurno}%`;
    elProgFill.style.width = `${ev.pctTurno}%`;
    elProgFill.className = `av-prog-fill${ev.clase ? ` ${ev.clase}` : ""}`;
    if (ev.tiempo.valido && ev.metaTurno > 0) {
      elProgMark.hidden = false;
      elProgMark.style.left = `${ev.pctEsperado}%`;
    } else {
      elProgMark.hidden = true;
    }
    elProgRem.innerHTML = ev.resumenRestante || "";

    // Tarjeta Andon
    elAndon.className = `andon av-andon${ev.clase ? ` ${ev.clase}` : ""}`;
    elPill.className = `pill${ev.clase ? ` ${ev.clase}` : ""}`;
    elPill.textContent = ev.etiqueta;
    elMetaTxt.textContent = ev.metaTurno > 0 ? `Meta turno 7,2 h: ${ev.metaTurno} bolsas` : "";

    if (ev.tiempo.valido && ev.metaTurno > 0) {
      elKpiComp.innerHTML = `${ev.reales} <small>de ${ev.esperadas} esp.</small>`;
      const diffTxt = ev.diff > 0 ? `+${ev.diff}` : ev.diff < 0 ? `−${Math.abs(ev.diff)}` : "0";
      elKpiDiff.innerHTML = `${diffTxt} <small>${Math.abs(ev.diff) === 1 ? "bolsa" : "bolsas"}</small>`;
    } else {
      elKpiComp.innerHTML = `${ev.reales} <small>bolsas</small>`;
      elKpiDiff.innerHTML = `—`;
    }
    elNote.textContent = ev.nota;

    if (animar) flashEls(elKpiComp, elKpiDiff, elProgPct);
  };

  const commit = (animar = true, origen = "") => {
    saveState(f.id, st);
    paint(animar, origen);
  };

  inIni.addEventListener("input", () => {
    st.ini = inIni.value;
    commit(true, "ini");
  });

  inFin.addEventListener("input", () => {
    st.fin = inFin.value;
    commit(true, "fin");
  });

  inComida.addEventListener("change", () => {
    vib(20);
    st.comida = inComida.checked;
    commit(true, "comida");
  });

  box.querySelectorAll("[data-now]").forEach((btn) => {
    btn.addEventListener("click", () => {
      vib(25);
      const ahora = ahoraHHMM();
      if (btn.dataset.now === "ini") {
        st.ini = ahora;
        inIni.value = ahora;
      } else {
        st.fin = ahora;
        inFin.value = ahora;
      }
      commit(true, "now");
    });
  });

  $("#av-plus", box).addEventListener("click", () => {
    vib(30);
    st.bolsas = Math.max(0, st.bolsas + 1);
    commit(true, "btn");
  });

  $("#av-minus", box).addEventListener("click", () => {
    if (st.bolsas <= 0) return;
    vib(20);
    st.bolsas = Math.max(0, st.bolsas - 1);
    commit(true, "btn");
  });

  inBolsas.addEventListener("input", () => {
    st.bolsas = Math.max(0, Math.floor(Number(inBolsas.value) || 0));
    commit(true, "bolsas");
  });

  $("#av-reset", box).addEventListener("click", () => {
    vib([20, 30, 20]);
    st.ini = "";
    st.fin = "";
    st.comida = false;
    st.bolsas = 0;
    inIni.value = "";
    inFin.value = "";
    inComida.checked = false;
    inBolsas.value = 0;
    clearState(f.id);
    paint(false, "reset");
    toast("Avance de turno reiniciado");
  });

  paint(false, "init");
}