import { $, esc, num, n1, stats, secH } from "./bloques.js";

// Destello breve en resultados recalculados
function flash(...els) {
  els.forEach((el) => {
    if (!el) return;
    el.classList.remove("qty-flash");
    void el.offsetWidth;
    el.classList.add("qty-flash");
  });
}

// ================= VISTA OPERADOR =================

export function renderOperador(f) {
  const s = stats(f);
  const tieneEnvBolsa = f.envasesPorBolsa !== null && f.envasesPorBolsa > 0;
  const bolsasHoraTxt = tieneEnvBolsa && s.bolsasHora !== null
    ? n1(s.bolsasHora)
    : (f.bolsas !== null && f.bolsas > 0 ? num(f.bolsas) : "Por registrar");
  const bolsasSub = tieneEnvBolsa && s.teorico !== null
    ? `${s.teorico} env/h ÷ ${f.envasesPorBolsa} env/bolsa`
    : (f.bolsasPeriodo ? esc(f.bolsasPeriodo) : "pendiente de registro");

  return `
    ${secH("OPERACIÓN", "Estándar operativo del puesto", "Meta y ritmo de producción")}
    <div class="stats" style="border:2px solid var(--edge)">
      <div class="stat">
        <span class="n${s.porCiclo !== null ? "" : " pend-stat"}">${s.porCiclo !== null ? s.porCiclo : "Por registrar"}</span>
        <span class="l">Envases por ciclo</span>
        <span class="h">${s.porCiclo !== null ? `${f.moldes} moldes × ${f.cavidades} cav.` : "pendiente moldes/cav."}</span>
      </div>
      <div class="stat">
        <span class="n${s.ciclosHora !== null ? "" : " pend-stat"}">${s.ciclosHora !== null ? s.ciclosHora : "Por registrar"}</span>
        <span class="l">Ciclos por hora</span>
        <span class="h">${f.ciclo !== null ? `3600 s ÷ ${num(f.ciclo)} s` : "pendiente ciclo"}</span>
      </div>
      <div class="stat">
        <span class="n${s.teorico !== null ? "" : " pend-stat"}">${s.teorico !== null ? s.teorico : "Por registrar"}</span>
        <span class="l">Envases/h teórico</span>
        <span class="h">sin paros ni rechazos</span>
      </div>
      <div class="stat">
        <span class="n${tieneEnvBolsa ? "" : " pend-stat"}">${tieneEnvBolsa ? num(f.envasesPorBolsa) : "Por registrar"}</span>
        <span class="l">Envases por bolsa</span>
        <span class="h">empaque estándar</span>
      </div>
      <div class="stat">
        <span class="n${bolsasHoraTxt === "Por registrar" ? " pend-stat" : ""}">${bolsasHoraTxt}</span>
        <span class="l">${tieneEnvBolsa ? "Bolsas por hora" : "Bolsas estándar"}</span>
        <span class="h">${bolsasSub}</span>
      </div>
      <div class="stat">
        <span class="n${f.pesoG !== null && f.pesoG > 0 ? "" : " pend-stat"}">${f.pesoG !== null && f.pesoG > 0 ? num(f.pesoG) + " g" : "Por registrar"}</span>
        <span class="l">Peso del envase</span>
        <span class="h">${f.pesoG !== null && s.porCiclo !== null ? `${num(f.pesoG * s.porCiclo)} g por ciclo` : "pendiente peso"}</span>
      </div>
    </div>

    ${secH("META DE TURNO", "Calculadora rápida de producción", "Toca las horas de tu turno")}
    <div class="calc-box" id="op-calc">
      <div class="calc-controls">
        <button class="pill-btn" type="button" data-hrs="1">1 h</button>
        <button class="pill-btn" type="button" data-hrs="4">4 h</button>
        <button class="pill-btn active" type="button" data-hrs="7.2">7.2 h (Turno)</button>
        <label style="display:flex;align-items:center;gap:8px;margin-left:auto;font-family:var(--font-display);font-weight:700;text-transform:uppercase">
          Horas:
          <input class="calc-input" id="op-hrs" type="number" min="0.1" max="24" step="0.1" value="7.2">
        </label>
      </div>
      <div class="mix-grid">
        <div class="mix-card hi">
          <div class="code">OBJETIVO EN BOLSAS</div>
          <div class="name">Bolsas a entregar</div>
          <div class="qty" id="op-res-bolsas">—</div>
        </div>
        <div class="mix-card">
          <div class="code">PRODUCCIÓN TOTAL</div>
          <div class="name">Envases estándar</div>
          <div class="qty" id="op-res-env">—</div>
        </div>
        <div class="mix-card">
          <div class="code">CONSUMO ESTIMADO</div>
          <div class="name">Material requerido</div>
          <div class="qty" id="op-res-kg">—</div>
        </div>
      </div>
      ${!tieneEnvBolsa ? `<p class="note"><span class="flag">DATO PENDIENTE</span>Agrega la columna <b>envases_por_bolsa</b> en tu hoja RECETAS para calcular automáticamente las bolsas por turno.</p>` : ""}
    </div>`;
}

export function bindOperador(f) {
  const box = $("#op-calc");
  if (!box) return;
  const s = stats(f);
  const input = $("#op-hrs", box);
  const btns = [...box.querySelectorAll("[data-hrs]")];

  const elBolsas = $("#op-res-bolsas", box);
  const elEnv = $("#op-res-env", box);
  const elKg = $("#op-res-kg", box);

  const update = (hrs, animar = true) => {
    const h = Math.max(0, Number(hrs) || 0);
    const totalEnv = s.teorico !== null ? Math.round(s.teorico * h) : 0;
    const totalBolsas = f.envasesPorBolsa !== null && f.envasesPorBolsa > 0 ? totalEnv / f.envasesPorBolsa : 0;
    const totalKg = f.pesoG !== null && f.pesoG > 0 ? (totalEnv * f.pesoG) / 1000 : 0;

    elBolsas.innerHTML = f.envasesPorBolsa !== null && f.envasesPorBolsa > 0 && s.teorico !== null
      ? `${Math.floor(totalBolsas).toLocaleString("es-ES")} <small>bolsas</small>`
      : `<small>Por registrar</small>`;
    elEnv.innerHTML = s.teorico !== null && s.teorico > 0
      ? `${totalEnv.toLocaleString("es-ES")} <small>env.</small>`
      : `<small>Por registrar</small>`;
    elKg.innerHTML = f.pesoG !== null && f.pesoG > 0 && s.teorico !== null && s.teorico > 0
      ? `${n1(totalKg)} <small>kg</small>`
      : `<small>Por registrar</small>`;

    btns.forEach((b) => b.classList.toggle("active", Math.abs(Number(b.dataset.hrs) - h) < 0.01));
    if (animar) flash(elBolsas, elEnv, elKg);
  };

  btns.forEach((b) => b.addEventListener("click", () => {
    input.value = b.dataset.hrs;
    update(b.dataset.hrs, true);
  }));
  input.addEventListener("input", () => update(input.value, true));
  update(7.2, false);
}

// ================= VISTA MOLINERO =================

export function renderMolinero(f) {
  const p = f.preparada;
  const baseKg = p?.mp1?.kg;

  if (baseKg === null || baseKg === undefined || baseKg <= 0) {
    return `
      ${secH("PREPARADA / MOLINO", "Fórmula de materia prima", "Por registrar")}
      <div class="empty">
        <span class="flag">POR REGISTRAR</span><br><br>
        Esta ficha aún no tiene cargada su fórmula de preparada.<br>
        Completa los datos de materia prima y masterbatch para habilitar la calculadora del molinero.
      </div>`;
  }

  const tieneMp2 = Boolean(p.mp2.nombre || p.mp2.kg > 0);
  const tieneMaster = Boolean(p.master.nombre || p.master.gr > 0);
  const tieneMasterCalc = p.master.gr > 0;
  const tieneMolido = p.molido.minKg !== null || p.molido.maxKg !== null;

  return `
    ${secH("PREPARADA / MOLINO", "Calculadora interactiva de mezcla", `Base estándar: ${num(baseKg)} kg de ${esc(p.mp1.nombre || "MP1")}`)}
    <div class="calc-box" id="mol-calc">
      <div class="calc-controls">
        <button class="pill-btn" type="button" data-mult="0.5">½ preparada</button>
        <button class="pill-btn active" type="button" data-mult="1">1 preparada (Base)</button>
        <div style="display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin-left:auto">
          <label style="display:flex;align-items:center;gap:8px;font-family:var(--font-display);font-weight:700;text-transform:uppercase">
            ${esc(p.mp1.nombre || "MP1")} (kg):
            <input class="calc-input" id="mol-mp1" type="number" min="0" step="0.5" value="${baseKg}">
          </label>
          ${tieneMasterCalc ? `
          <label style="display:flex;align-items:center;gap:8px;font-family:var(--font-display);font-weight:700;text-transform:uppercase">
            Master (g):
            <input class="calc-input" id="mol-master" type="number" min="0" step="10" inputmode="numeric" value="${Math.round(p.master.gr)}">
          </label>` : ""}
        </div>
      </div>

      <input class="calc-slider" id="mol-slider" type="range" min="0" max="${baseKg}" step="0.5" value="${baseKg}" aria-label="Ajustar kilos de materia prima principal">

      <div class="mix-grid">
        <div class="mix-card hi" id="mol-card-mp1">
          <div class="code">CÓD. ${esc(p.mp1.codigo || "POR ANOTAR")}</div>
          <div class="name">${esc(p.mp1.nombre || "Materia Prima 1")}</div>
          <div class="qty" id="mol-q-mp1">${n1(baseKg)} <small>kg</small></div>
        </div>

        ${tieneMp2 ? `
        <div class="mix-card">
          <div class="code">CÓD. ${esc(p.mp2.codigo || "POR ANOTAR")}</div>
          <div class="name">${esc(p.mp2.nombre || "Materia Prima 2")}</div>
          <div class="qty" id="mol-q-mp2">${n1(p.mp2.kg)} <small>kg</small></div>
        </div>` : ""}

        ${tieneMaster ? `
        <div class="mix-card" id="mol-card-master">
          <div class="code">CÓD. ${esc(p.master.codigo || "POR ANOTAR")}</div>
          <div class="name">${esc(p.master.nombre || "Masterbatch")}</div>
          <div class="qty" id="mol-q-master">${Math.round(p.master.gr)} <small>g</small></div>
        </div>` : ""}

        ${tieneMolido ? `
        <div class="mix-card">
          <div class="code">RECUPERADO / MOLIDO</div>
          <div class="name">Rango sugerido</div>
          <div class="qty" id="mol-q-molido">—</div>
        </div>` : ""}
      </div>

      <p class="note" id="mol-total"></p>
    </div>`;
}

export function bindMolinero(f) {
  const box = $("#mol-calc");
  if (!box) return;
  const p = f.preparada;
  const baseKg = p.mp1.kg;
  const baseMaster = p.master.gr || 0;
  const input = $("#mol-mp1", box);
  const inputMaster = $("#mol-master", box);
  const slider = $("#mol-slider", box);
  const cardMp1 = $("#mol-card-mp1", box);
  const cardMaster = $("#mol-card-master", box);
  const btns = [...box.querySelectorAll("[data-mult]")];

  // Referencia operativa: cuántas preparadas base cubren 1 turno (7.2 h)
  const s = stats(f);
  const kgTurno = f.pesoG > 0 && s.teorico > 0 ? (Math.round(s.teorico * 7.2) * f.pesoG) / 1000 : 0;
  const baseSinMolido = baseKg + (p.mp2.kg || 0) + baseMaster / 1000;
  const pesoBaseMin = baseSinMolido + (p.molido.minKg || 0);
  const pesoBaseMax = baseSinMolido + (p.molido.maxKg ?? p.molido.minKg ?? 0);
  let refTurnoTxt = "";
  if (kgTurno > 0 && pesoBaseMin > 0) {
    const prepMin = kgTurno / pesoBaseMax;
    const prepMax = kgTurno / pesoBaseMin;
    const rangoPrep = Math.abs(prepMax - prepMin) >= 0.05
      ? `${n1(prepMin)} a ${n1(prepMax)}`
      : n1(prepMin);
    refTurnoTxt = ` · Turno 7.2 h (${n1(kgTurno)} kg): aprox. <b>${rangoPrep} preparadas</b>.`;
  }

  const update = (kgActual, origen = "mp1") => {
    const kg = Math.max(0, Number(kgActual) || 0);
    const ratio = kg / baseKg;
    const grMaster = baseMaster * ratio;

    // Sincronizar la casilla contraria sin interrumpir lo que el usuario está escribiendo
    if (origen !== "mp1") input.value = +kg.toFixed(1);
    if (inputMaster && origen !== "master") inputMaster.value = Math.round(grMaster);

    // Sincronizar barra deslizante
    if (kg > Number(slider.max)) slider.max = Math.ceil(kg * 1.5);
    if (origen !== "slider") slider.value = kg;

    // Mover el borde amarillo (.hi) a la tarjeta desde donde se está calculando
    const desdeMaster = origen === "master" && Boolean(cardMaster);
    if (cardMp1) cardMp1.classList.toggle("hi", !desdeMaster);
    if (cardMaster) cardMaster.classList.toggle("hi", desdeMaster);

    $("#mol-q-mp1", box).innerHTML = `${n1(kg)} <small>kg</small>`;

    const elMp2 = $("#mol-q-mp2", box);
    const kgMp2 = p.mp2.kg * ratio;
    if (elMp2) elMp2.innerHTML = `${n1(kgMp2)} <small>kg</small>`;

    const elMaster = $("#mol-q-master", box);
    if (elMaster) {
      const extraKg = grMaster >= 1000 ? ` <small>(${(grMaster / 1000).toFixed(2).replace(".", ",")} kg)</small>` : "";
      elMaster.innerHTML = `${Math.round(grMaster)} <small>g</small>${extraKg}`;
    }

    const elMolido = $("#mol-q-molido", box);
    const minM = p.molido.minKg !== null ? p.molido.minKg * ratio : null;
    const maxM = p.molido.maxKg !== null ? p.molido.maxKg * ratio : null;
    if (elMolido) {
      if (minM !== null && maxM !== null) elMolido.innerHTML = `${n1(minM)}–${n1(maxM)} <small>kg</small>`;
      else elMolido.innerHTML = `${n1(minM ?? maxM ?? 0)} <small>kg</small>`;
    }

    // Peso total aproximado de la preparada
    const baseTotal = kg + kgMp2 + grMaster / 1000;
    const totMin = baseTotal + (minM || 0);
    const totMax = baseTotal + (maxM ?? minM ?? 0);
    $("#mol-total", box).innerHTML = `Proporción activa: <b>${Math.round(ratio * 100)}%</b> de una preparada base · Peso total aprox. de la mezcla: <b>${minM !== null && maxM !== null ? `${n1(totMin)} a ${n1(totMax)}` : n1(totMin)} kg</b>${refTurnoTxt || "."}`;

    btns.forEach((b) => b.classList.toggle("active", Math.abs(Number(b.dataset.mult) - ratio) < 0.01));
    if (origen !== "init" && origen !== "slider") {
      flash($("#mol-q-mp1", box), elMp2, elMaster, elMolido);
    }
  };

  btns.forEach((b) => b.addEventListener("click", () => {
    const val = +(baseKg * Number(b.dataset.mult)).toFixed(2);
    update(val, "btn");
  }));

  slider.addEventListener("input", () => {
    update(slider.value, "slider");
  });

  slider.addEventListener("change", () => {
    flash($("#mol-q-mp1", box), $("#mol-q-mp2", box), $("#mol-q-master", box), $("#mol-q-molido", box));
  });

  input.addEventListener("input", () => {
    update(input.value, "mp1");
  });

  if (inputMaster && baseMaster > 0) {
    inputMaster.addEventListener("input", () => {
      const gr = Math.max(0, Number(inputMaster.value) || 0);
      const kgEquiv = (gr / baseMaster) * baseKg;
      update(kgEquiv, "master");
    });
  }

  update(baseKg, "init");
}