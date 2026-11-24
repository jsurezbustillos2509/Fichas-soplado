import { URL_GUARDAR_SKU, PIN_ADMIN, GITHUB_RAW_BASE } from "../config.js";
import { addRecetaLocal, updateRecetaLocal } from "../datos.js";
import { $, esc, toast } from "./bloques.js";

const SESSION_KEY = "fp-admin-until";
const SESSION_MS = 30 * 60 * 1000; // 30 minutos

const MAQUINAS = [
  { layout: "qcm-75-1", maquina: "QCM-75-1", hmiDefault: "Siemens Smart Line" },
  { layout: "qcm-75",   maquina: "QCM-75",   hmiDefault: "HMI QCM-75" },
  { layout: "bekum",    maquina: "BEKUM",    hmiDefault: "HMI Bekum" }
];

// Definición de secciones HMI dinámicas por máquina (coinciden 1 a 1 con las columnas del Sheet)
function getHmiSections(layout) {
  if (layout === "qcm-75-1") {
    return [
      {
        tag: "TIME 1",
        title: "Tiempos del ciclo (QCM-75-1)",
        fields: [
          ["time1_BLOW", "BLOW"], ["time1_EXHAUST", "EXHAUST"],
          ["time1_CUT", "CUT"], ["time1_HEAD_LIFT", "HEAD LIFT"],
          ["time1_HOLD_ON", "HOLD ON"], ["time1_F_EXHAUST", "F-EXHAUST"],
          ["time1_PIN_PRE_UP", "PIN PRE-UP"], ["time1_FLASH", "FLASH"],
          ["time1_ROTATION_TIME", "ROTATION TIME"], ["time1_Die_blow", "Die blow"]
        ].map(([k, l]) => ({ key: k, label: l, type: "num" }))
      },
      {
        tag: "TIME 2",
        title: "Retardos L / R",
        fields: [
          ["time2_Station_up_delay_L", "Station up delay (L)"], ["time2_Station_up_delay_R", "Station up delay (R)"],
          ["time2_Mold_close_delay_L", "Mold close delay (L)"], ["time2_Mold_close_delay_R", "Mold close delay (R)"],
          ["time2_Cutter_delay_L", "Cutter delay (L)"], ["time2_Cutter_delay_R", "Cutter delay (R)"],
          ["time2_Station_down_delay_L", "Station down delay (L)"], ["time2_Station_down_delay_R", "Station down delay (R)"],
          ["time2_Head_lift_delay_L", "Head lift delay (L)"], ["time2_Head_lift_delay_R", "Head lift delay (R)"],
          ["time2_Deflash_delay", "Deflash delay"],
          ["time2_Pin_down_delay_L", "Pin down delay (L)"], ["time2_Pin_down_delay_R", "Pin down delay (R)"],
          ["time2_Blow_delay_L", "Blow delay (L)"], ["time2_Blow_delay_R", "Blow delay (R)"],
          ["time2_Mold_open_delay_L", "Mold open delay (L)"], ["time2_Mold_open_delay_R", "Mold open delay (R)"],
          ["time2_Pin_up_delay_L", "Pin up delay (L)"], ["time2_Pin_up_delay_R", "Pin up delay (R)"],
          ["time2_Sub_mold_delay_L", "Sub-mold delay (L)"], ["time2_Sub_mold_delay_R", "Sub-mold delay (R)"],
          ["time2_Station_down_hold_delay_L", "Station down hold delay (L)"], ["time2_Station_down_hold_delay_R", "Station down hold delay (R)"]
        ].map(([k, l]) => ({ key: k, label: l, type: "num" }))
      },
      {
        tag: "PQ 1 Y 2",
        title: "Presión y caudal (PQ Valve)",
        fields: [
          ["pq1_M_close_fast_L", "M. close fast (L)"], ["pq1_M_close_fast_R", "M. close fast (R)"],
          ["pq1_M_close_slow_L", "M. close slow (L)"], ["pq1_M_close_slow_R", "M. close slow (R)"],
          ["pq1_M_close_clamp_L", "M. close clamp (L)"], ["pq1_M_close_clamp_R", "M. close clamp (R)"],
          ["pq1_M_open_L", "M. open (L)"], ["pq1_M_open_R", "M. open (R)"],
          ["pq1_Pin_down_fast_L", "Pin down fast (L)"], ["pq1_Pin_down_fast_R", "Pin down fast (R)"],
          ["pq1_Pin_down_slow_L", "Pin down slow (L)"], ["pq1_Pin_down_slow_R", "Pin down slow (R)"],
          ["pq1_Pin_up_L", "Pin up (L)"], ["pq1_Pin_up_R", "Pin up (R)"],
          ["pq1_CAP_CLOSE_L", "CAP CLOSE (L)"], ["pq1_CAP_CLOSE_R", "CAP CLOSE (R)"],
          ["pq1_CAP_OPEN_L", "CAP OPEN (L)"], ["pq1_CAP_OPEN_R", "CAP OPEN (R)"],
          ["pq2_L_Station_up_P1", "L St. up P1"], ["pq2_L_Station_up_P2", "L St. up P2"], ["pq2_L_Station_up_P3", "L St. up P3"],
          ["pq2_L_Station_up_Q1", "L St. up Q1"], ["pq2_L_Station_up_Q2", "L St. up Q2"], ["pq2_L_Station_up_Q3", "L St. up Q3"],
          ["pq2_R_Station_up_P1", "R St. up P1"], ["pq2_R_Station_up_P2", "R St. up P2"], ["pq2_R_Station_up_P3", "R St. up P3"],
          ["pq2_R_Station_up_Q1", "R St. up Q1"], ["pq2_R_Station_up_Q2", "R St. up Q2"], ["pq2_R_Station_up_Q3", "R St. up Q3"],
          ["pq2_L_Station_down_P1", "L St. down P1"], ["pq2_L_Station_down_P2", "L St. down P2"], ["pq2_L_Station_down_P3", "L St. down P3"],
          ["pq2_L_Station_down_Q1", "L St. down Q1"], ["pq2_L_Station_down_Q2", "L St. down Q2"], ["pq2_L_Station_down_Q3", "L St. down Q3"],
          ["pq2_R_Station_down_P1", "R St. down P1"], ["pq2_R_Station_down_P2", "R St. down P2"], ["pq2_R_Station_down_P3", "R St. down P3"],
          ["pq2_R_Station_down_Q1", "R St. down Q1"], ["pq2_R_Station_down_Q2", "R St. down Q2"], ["pq2_R_Station_down_Q3", "R St. down Q3"]
        ].map(([k, l]) => ({ key: k, label: l, type: "num" }))
      },
      {
        tag: "HERRAMIENTAS",
        title: "Variador, cabezal y agujas (mm)",
        fields: [
          { key: "variador_hz", label: "Variador (Hz)", type: "num" },
          { key: "variador_a", label: "Variador (A)", type: "num" },
          { key: "variador_v", label: "Variador (V)", type: "num" },
          { key: "herramientas_cono", label: "Cabezal · Cono (mm)", type: "num" },
          { key: "herramientas_funda", label: "Cabezal · Funda (mm)", type: "num" },
          { key: "agujas_L_casquillo", label: "Molde L · Casquillo (mm)", type: "num" },
          { key: "agujas_L_cuchilla", label: "Molde L · Cuchilla (mm)", type: "num" },
          { key: "agujas_L_cuello", label: "Molde L · Altura cuello (mm)", type: "num" },
          { key: "agujas_R_casquillo", label: "Molde R · Casquillo (mm)", type: "num" },
          { key: "agujas_R_cuchilla", label: "Molde R · Cuchilla (mm)", type: "num" },
          { key: "agujas_R_cuello", label: "Molde R · Altura cuello (mm)", type: "num" }
        ]
      }
    ];
  }

  if (layout === "qcm-75") {
    const tempFields = [
      { key: "temp_up", label: "Temp UP", type: "num" },
      { key: "temp_down", label: "Temp DOWN", type: "num" }
    ];
    for (let z = 1; z <= 10; z++) {
      tempFields.push(
        { key: `temp_z${z}_on`, label: `Zona ${z} Estado`, type: "bool" },
        { key: `temp_z${z}_consigna`, label: `Zona ${z} Consigna °C`, type: "num" },
        { key: `temp_z${z}_actual`, label: `Zona ${z} Actual °C`, type: "num" }
      );
    }

    return [
      {
        tag: "TIME 1",
        title: "Tiempos del ciclo (QCM-75)",
        fields: [
          ["time1_BLOW", "BLOW"], ["time1_EXHAUST", "EXHAUST"],
          ["time1_CUT", "CUT"], ["time1_HEAD_LIFT", "HEAD LIFT"],
          ["time1_HOLD_ON", "HOLD ON"], ["time1_S_exhaust", "S-exhaust"],
          ["time1_PIN_PRE_UP", "PIN PRE-UP"], ["time1_FLASH", "FLASH"],
          ["time1_ROTATION_TIME", "ROTATION TIME"], ["time1_SPARE1", "SPARE1"], ["time1_SPARE2", "SPARE2"]
        ].map(([k, l]) => ({ key: k, label: l, type: "num" }))
      },
      {
        tag: "TIME 2",
        title: "Retardos L / R",
        fields: [
          ["time2_Station_up_delay_L", "Station up delay (L)"], ["time2_Station_up_delay_R", "Station up delay (R)"],
          ["time2_Mold_close_delay_L", "Mold close delay (L)"], ["time2_Mold_close_delay_R", "Mold close delay (R)"],
          ["time2_Cutter_delay_L", "Cutter delay (L)"], ["time2_Cutter_delay_R", "Cutter delay (R)"],
          ["time2_Station_down_delay_L", "Station down delay (L)"], ["time2_Station_down_delay_R", "Station down delay (R)"],
          ["time2_Head_lift_delay_L", "Head lift delay (L)"], ["time2_Head_lift_delay_R", "Head lift delay (R)"],
          ["time2_Deflash_delay", "Deflash delay"],
          ["time2_Pin_down_delay_L", "Pin down delay (L)"], ["time2_Pin_down_delay_R", "Pin down delay (R)"],
          ["time2_Blow_delay_L", "Blow delay (L)"], ["time2_Blow_delay_R", "Blow delay (R)"],
          ["time2_Mold_open_delay_L", "Mold open delay (L)"], ["time2_Mold_open_delay_R", "Mold open delay (R)"],
          ["time2_Pin_up_delay_L", "Pin up delay (L)"], ["time2_Pin_up_delay_R", "Pin up delay (R)"],
          ["time2_Sub_mold_delay_L", "Sub-mold delay (L)"], ["time2_Sub_mold_delay_R", "Sub-mold delay (R)"],
          ["time2_Station_inplace_L", "STATION Inplace (L)"], ["time2_Station_inplace_R", "STATION Inplace (R)"]
        ].map(([k, l]) => ({ key: k, label: l, type: "num" }))
      },
      {
        tag: "PQ 1 Y 2",
        title: "Presión y caudal (PQ Valve)",
        fields: [
          ["pq1_M_close_fast_L", "M. close fast (L)"], ["pq1_M_close_fast_R", "M. close fast (R)"],
          ["pq1_M_close_slow_L", "M. close slow (L)"], ["pq1_M_close_slow_R", "M. close slow (R)"],
          ["pq1_M_close_clamp_L", "M. close clamp (L)"], ["pq1_M_close_clamp_R", "M. close clamp (R)"],
          ["pq1_M_open_L", "M. open (L)"], ["pq1_M_open_R", "M. open (R)"],
          ["pq1_Pin_down_fast_L", "Pin down fast (L)"], ["pq1_Pin_down_fast_R", "Pin down fast (R)"],
          ["pq1_Pin_down_slow_L", "Pin down slow (L)"], ["pq1_Pin_down_slow_R", "Pin down slow (R)"],
          ["pq1_Pin_up_L", "Pin up (L)"], ["pq1_Pin_up_R", "Pin up (R)"],
          ["pq1_CAP_CLOSE_L", "CAP CLOSE (L)"], ["pq1_CAP_CLOSE_R", "CAP CLOSE (R)"],
          ["pq1_CAP_OPEN_L", "CAP OPEN (L)"], ["pq1_CAP_OPEN_R", "CAP OPEN (R)"],
          ["pq2_L_Station_up_P1", "L St. up P1"], ["pq2_L_Station_up_P2", "L St. up P2"], ["pq2_L_Station_up_P3", "L St. up P3"],
          ["pq2_L_Station_up_Q1", "L St. up Q1"], ["pq2_L_Station_up_Q2", "L St. up Q2"], ["pq2_L_Station_up_Q3", "L St. up Q3"],
          ["pq2_R_Station_up_P1", "R St. up P1"], ["pq2_R_Station_up_P2", "R St. up P2"], ["pq2_R_Station_up_P3", "R St. up P3"],
          ["pq2_R_Station_up_Q1", "R St. up Q1"], ["pq2_R_Station_up_Q2", "R St. up Q2"], ["pq2_R_Station_up_Q3", "R St. up Q3"],
          ["pq2_L_Station_down_P1", "L St. down P1"], ["pq2_L_Station_down_P2", "L St. down P2"], ["pq2_L_Station_down_P3", "L St. down P3"],
          ["pq2_L_Station_down_Q1", "L St. down Q1"], ["pq2_L_Station_down_Q2", "L St. down Q2"], ["pq2_L_Station_down_Q3", "L St. down Q3"],
          ["pq2_R_Station_down_P1", "R St. down P1"], ["pq2_R_Station_down_P2", "R St. down P2"], ["pq2_R_Station_down_P3", "R St. down P3"],
          ["pq2_R_Station_down_Q1", "R St. down Q1"], ["pq2_R_Station_down_Q2", "R St. down Q2"], ["pq2_R_Station_down_Q3", "R St. down Q3"]
        ].map(([k, l]) => ({ key: k, label: l, type: "num" }))
      },
      {
        tag: "TEMP SETTING",
        title: "Zonas de temperatura (1 a 10)",
        fields: tempFields
      },
      {
        tag: "HERRAMIENTAS",
        title: "Variador, cabezal y agujas (mm)",
        fields: [
          { key: "variador_hz", label: "Variador (Hz)", type: "num" },
          { key: "variador_a", label: "Variador (A)", type: "num" },
          { key: "variador_v", label: "Variador (V)", type: "num" },
          { key: "herramientas_cono", label: "Cabezal · Cono (mm)", type: "num" },
          { key: "herramientas_funda", label: "Cabezal · Funda (mm)", type: "num" },
          { key: "agujas_L_casquillo", label: "Molde L · Casquillo (mm)", type: "num" },
          { key: "agujas_L_cuchilla", label: "Molde L · Cuchilla (mm)", type: "num" },
          { key: "agujas_L_cuello", label: "Molde L · Altura cuello (mm)", type: "num" },
          { key: "agujas_R_casquillo", label: "Molde R · Casquillo (mm)", type: "num" },
          { key: "agujas_R_cuchilla", label: "Molde R · Cuchilla (mm)", type: "num" },
          { key: "agujas_R_cuello", label: "Molde R · Altura cuello (mm)", type: "num" }
        ]
      }
    ];
  }

  if (layout === "bekum") {
    const calefFields = [];
    for (let z = 9; z >= 1; z--) {
      calefFields.push(
        { key: `calef_z${z}_on`, label: `Zona ${z} Estado`, type: "bool" },
        { key: `calef_z${z}_consigna`, label: `Zona ${z} Consigna °C`, type: "num" },
        { key: `calef_z${z}_actual`, label: `Zona ${z} Actual °C`, type: "num" }
      );
    }
    calefFields.push(
      { key: "calef_cuchilla", label: "Cuchilla", type: "bool" },
      { key: "calef_turbina_1", label: "Turbina 1", type: "bool" },
      { key: "calef_turbina_2", label: "Turbina 2", type: "bool" },
      { key: "calef_turbina_3", label: "Turbina 3", type: "bool" },
      { key: "calef_temp_hab_tornillo_consigna", label: "Hab. tornillo Consigna °C", type: "num" },
      { key: "calef_temp_hab_tornillo_actual", label: "Hab. tornillo Actual °C", type: "num" },
      { key: "calef_valor_temp_inferior", label: "Temp. inferior °C", type: "num" }
    );

    return [
      {
        tag: "AJUSTE TIEMPOS",
        title: "Tiempos del ciclo L / R (BEKUM)",
        fields: [
          ["encabezado_izq", "Subida Molde (IZQ)"], ["encabezado_der", "Subida Molde (DER)"],
          ["tiempos_Ret_Subir_Brazo_L", "Ret. Subir Brazo (L)"], ["tiempos_Ret_Subir_Brazo_R", "Ret. Subir Brazo (R)"],
          ["tiempos_Ret_Bajar_Brazo_L", "Ret. Bajar Brazo (L)"], ["tiempos_Ret_Bajar_Brazo_R", "Ret. Bajar Brazo (R)"],
          ["tiempos_Ret_Corte_Manga_L", "Ret. Corte Manga (L)"], ["tiempos_Ret_Corte_Manga_R", "Ret. Corte Manga (R)"],
          ["tiempos_Ret_Abrir_Molde_L", "Ret. Abrir Molde (L)"], ["tiempos_Ret_Abrir_Molde_R", "Ret. Abrir Molde (R)"],
          ["tiempos_Ret_Cerrar_Molde_L", "Ret. Cerrar Molde (L)"], ["tiempos_Ret_Cerrar_Molde_R", "Ret. Cerrar Molde (R)"],
          ["tiempos_Ret_Pre_Soplo_L", "Ret. Pre-Soplo (L)"], ["tiempos_Ret_Pre_Soplo_R", "Ret. Pre-Soplo (R)"],
          ["tiempos_Tiempo_Pre_Soplo_L", "Tiempo Pre-Soplo (L)"], ["tiempos_Tiempo_Pre_Soplo_R", "Tiempo Pre-Soplo (R)"],
          ["tiempos_Ret_Soplo_L", "Ret. Soplo (L)"], ["tiempos_Ret_Soplo_R", "Ret. Soplo (R)"],
          ["tiempos_Tiempo_Soplo_L", "Tiempo Soplo (L)"], ["tiempos_Tiempo_Soplo_R", "Tiempo Soplo (R)"],
          ["tiempos_Ret_Bajar_Pico_L", "Ret. Bajar Pico (L)"], ["tiempos_Ret_Bajar_Pico_R", "Ret. Bajar Pico (R)"],
          ["tiempos_Tiemp_Subir_Pico_1_L", "Tiemp Subir Pico 1 (L)"], ["tiempos_Tiemp_Subir_Pico_1_R", "Tiemp Subir Pico 1 (R)"],
          ["tiempos_Ret_Subir_Pico_2_L", "Ret. Subir Pico 2 (L)"], ["tiempos_Ret_Subir_Pico_2_R", "Ret. Subir Pico 2 (R)"]
        ].map(([k, l]) => ({ key: k, label: l, type: "num" }))
      },
      {
        tag: "CALEFACCIÓN",
        title: "Zonas de temperatura (9 a 1) y turbinas",
        fields: calefFields
      },
      {
        tag: "MANGA",
        title: "Variador WEG y perilla",
        fields: [
          { key: "manga_rpm", label: "Velocidad (rpm)", type: "num" },
          { key: "manga_a", label: "Corriente (A)", type: "num" },
          { key: "manga_hz", label: "Frecuencia (Hz)", type: "num" },
          { key: "manga_perilla", label: "Perilla R10K (%)", type: "num" },
          { key: "manga_estado", label: "Estado variador", type: "text", placeholder: "Ej: Run · REM (remoto)" },
          { key: "manga_nota", label: "Nota anotada", type: "text", placeholder: "Ej: 400 RPM" }
        ]
      },
      {
        tag: "HERRAMIENTAS",
        title: "Cabezal y herramientas de aguja (mm)",
        fields: [
          { key: "herramientas_cono", label: "Cabezal · Cono (mm)", type: "num" },
          { key: "herramientas_funda", label: "Cabezal · Funda (mm)", type: "num" },
          { key: "herramientas_casquillo", label: "Aguja · Casquillo (mm)", type: "num" },
          { key: "herramientas_cuchilla", label: "Aguja · Cuchilla (mm)", type: "num" },
          { key: "herramientas_cuello", label: "Aguja · Altura del cuello (mm)", type: "num" }
        ]
      }
    ];
  }

  return [];
}

function buildSkuId(sku) {
  const clean = String(sku || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean ? `sku-${clean}` : "";
}

function isUnlocked() {
  try {
    return Date.now() < Number(sessionStorage.getItem(SESSION_KEY) || 0);
  } catch (e) {
    return false;
  }
}

function setUnlocked() {
  try {
    sessionStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_MS));
  } catch (e) {}
}

function runWithAuth(fn) {
  if (isUnlocked()) {
    fn();
    return;
  }
  openPinModal(() => {
    setUnlocked();
    fn();
  });
}

// 1) Flujo para crear un SKU nuevo desde el catálogo
export function openNewSkuFlow(fichas, onSaved) {
  runWithAuth(() => openFormModal({ mode: "create", fichas, onSaved }));
}

// 2) Flujo para editar/completar un SKU existente desde su ficha
export function openEditSkuFlow(ficha, hmiRow, onSaved) {
  runWithAuth(() => openFormModal({ mode: "update", ficha, hmiRow: hmiRow || {}, onSaved }));
}

// ================= MODAL DE PIN (4 DÍGITOS) =================

function openPinModal(onSuccess) {
  const ov = $("#ovbox");
  ov.innerHTML = `
    <div class="ov" id="pin-ov" role="dialog" aria-modal="true" aria-label="Acceso restringido">
      <div class="ovin pin-modal">
        <div class="crono-head">
          <div>
            <span class="sk-tag">ACCESO SUPERVISOR</span>
            <h3>Ingresa tu PIN de 4 dígitos</h3>
          </div>
          <button class="btn ghost crono-close" id="pin-close" type="button" aria-label="Cerrar">✕</button>
        </div>
        <p class="note" style="margin:0">Solo personal autorizado puede crear o editar SKUs. La sesión quedará activa por 30 minutos.</p>
        <form id="pin-form" class="pin-form">
          <input class="pin-input" id="pin-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="••••" autocomplete="off" required>
          <p class="pin-err" id="pin-err" hidden>PIN incorrecto. Intenta nuevamente.</p>
          <div class="ovb">
            <button class="btn solid" style="flex:1" type="submit">Desbloquear</button>
            <button class="btn" id="pin-cancel" type="button">Cancelar</button>
          </div>
        </form>
      </div>
    </div>`;

  const close = () => { ov.innerHTML = ""; };
  $("#pin-close").addEventListener("click", close);
  $("#pin-cancel").addEventListener("click", close);
  $("#pin-ov").addEventListener("click", (e) => { if (e.target.id === "pin-ov") close(); });

  const input = $("#pin-input");
  const errEl = $("#pin-err");
  setTimeout(() => input.focus(), 50);

  $("#pin-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim() === String(PIN_ADMIN)) {
      close();
      onSuccess();
    } else {
      errEl.hidden = false;
      input.value = "";
      input.focus();
    }
  });
}

// ================= MODAL DE CREACIÓN / EDICIÓN DE SKU =================

function openFormModal(opts) {
  const isEdit = opts.mode === "update";
  const ficha = opts.ficha || null;
  const hmiRow = opts.hmiRow || {};
  const fichas = opts.fichas || [];
  const ov = $("#ovbox");
  const hoy = new Date().toISOString().slice(0, 10);

  ov.innerHTML = `
    <div class="ov" id="sku-ov" role="dialog" aria-modal="true" aria-label="${isEdit ? "Editar SKU" : "Agregar nuevo SKU"}">
      <div class="ovin sku-modal">
        <div class="crono-head">
          <div>
            <span class="sk-tag">${isEdit ? "EDITAR / COMPLETAR FICHA" : "NUEVA FICHA DE PROCESO"}</span>
            <h3>${isEdit ? `Editar SKU ${esc(ficha.sku)}` : "Agregar SKU a la base de datos"}</h3>
          </div>
          <button class="btn ghost crono-close" id="sku-close" type="button" aria-label="Cerrar">✕</button>
        </div>

        <!-- Barra sticky de progreso de llenado -->
        <div class="sku-prog-bar">
          <div class="sku-prog-top">
            <span id="sku-prog-txt">0 de 0 campos llenos</span>
            <span class="sku-id-prev" id="sku-id-prev">ID: pendiente</span>
          </div>
          <div class="av-prog-track">
            <div class="av-prog-fill" id="sku-prog-fill" style="width:0%"></div>
          </div>
        </div>

        <!-- Vista 1: Formulario dinámico -->
        <form id="sku-form" class="sku-form" novalidate>
          <details class="form-sec active-sec" open>
            <summary>
              <span class="tag">1 · GENERAL</span>
              <b>Máquina, código y estándar operativo</b>
              <span class="avance-chev">▾</span>
            </summary>
            <div class="form-grid">
              <div class="field">
                <label for="f-layout">Máquina * ${isEdit ? "(Bloqueada)" : "(Obligatorio)"}</label>
                <select id="f-layout" name="layout" data-scope="receta" ${isEdit ? "disabled" : "required"}>
                  <option value="">— Selecciona máquina —</option>
                  ${MAQUINAS.map((m) => `<option value="${m.layout}">${m.maquina}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="f-sku">Código SKU * ${isEdit ? "(Clave fija)" : "(Obligatorio)"}</label>
                <input id="f-sku" name="sku" data-scope="receta" type="text" placeholder="Ej: 500128.320" autocomplete="off" ${isEdit ? "disabled" : "required"}>
              </div>
              <div class="dup-alert" id="sku-dup-alert" hidden></div>

              <div class="field span-2">
                <label for="f-desc">Descripción del envase</label>
                <input id="f-desc" name="desc" data-scope="receta" type="text" placeholder="Ej: Env Pead Emulsión 320ml c/Blanco">
              </div>

              <div class="field">
                <label for="f-hmi">Pantalla HMI</label>
                <input id="f-hmi" name="hmi" data-scope="receta" type="text" placeholder="Ej: Siemens Smart Line">
              </div>
              <div class="field">
                <label for="f-ciclo">Ciclo estándar (segundos)</label>
                <input id="f-ciclo" name="ciclo" data-scope="receta" type="text" inputmode="decimal" placeholder="Ej: 24">
              </div>

              <div class="field">
                <label for="f-cicloTipo">Tipo de ciclo</label>
                <select id="f-cicloTipo" name="cicloTipo" data-scope="receta">
                  <option value="Ciclo real" selected>Ciclo real</option>
                  <option value="Ciclo teórico">Ciclo teórico</option>
                </select>
              </div>
              <div class="field">
                <label for="f-moldes">Cantidad de moldes</label>
                <input id="f-moldes" name="moldes" data-scope="receta" type="text" inputmode="numeric" placeholder="Ej: 2">
              </div>

              <div class="field">
                <label for="f-cavidades">Cavidades por molde</label>
                <input id="f-cavidades" name="cavidades" data-scope="receta" type="text" inputmode="numeric" placeholder="Ej: 3">
              </div>
              <div class="field">
                <label for="f-pesoG">Peso del envase (g)</label>
                <input id="f-pesoG" name="pesoG" data-scope="receta" type="text" inputmode="decimal" placeholder="Ej: 29">
              </div>

              <div class="field">
                <label for="f-envases_por_bolsa">Envases por bolsa</label>
                <input id="f-envases_por_bolsa" name="envases_por_bolsa" data-scope="receta" type="text" inputmode="numeric" placeholder="Ej: 230">
              </div>
              <div class="field">
                <label for="f-bolsas">Meta de bolsas</label>
                <input id="f-bolsas" name="bolsas" data-scope="receta" type="text" inputmode="numeric" placeholder="Ej: 28">
              </div>

              <div class="field">
                <label for="f-bolsasPeriodo">Periodo de meta</label>
                <select id="f-bolsasPeriodo" name="bolsasPeriodo" data-scope="receta">
                  <option value="TURNO" selected>TURNO</option>
                  <option value="HORA">HORA</option>
                  <option value="">Sin definir</option>
                </select>
              </div>
              <div class="field">
                <label for="f-foto">Archivo de foto (GitHub)</label>
                <input id="f-foto" name="foto" data-scope="receta" type="text" placeholder="Ej: 500128.320.jpg">
              </div>

              <div class="field">
                <label for="f-unidad_factor">Factor de unidad HMI</label>
                <input id="f-unidad_factor" name="unidad_factor" data-scope="receta" type="text" inputmode="decimal" value="0.1">
              </div>
              <div class="field">
                <label for="f-unidad_confirmada">Unidad confirmada</label>
                <select id="f-unidad_confirmada" name="unidad_confirmada" data-scope="receta">
                  <option value="FALSE" selected>FALSE (Por confirmar)</option>
                  <option value="TRUE">TRUE (Confirmada)</option>
                </select>
              </div>

              <div class="field span-2">
                <label for="f-leyenda">Leyenda / Nota al pie de ficha</label>
                <input id="f-leyenda" name="leyenda" data-scope="receta" type="text" placeholder="Ej: Gris = valor 0 o sin dato.">
              </div>
            </div>
          </details>

          <details class="form-sec">
            <summary>
              <span class="tag">2 · MOLINERO</span>
              <b>Fórmula de preparada y materia prima</b>
              <span class="avance-chev">▾</span>
            </summary>
            <div class="form-grid">
              <div class="field">
                <label for="f-mp1_nombre">Materia Prima 1 (Nombre)</label>
                <input id="f-mp1_nombre" name="mp1_nombre" data-scope="receta" type="text" placeholder="Ej: PEAD - 4950">
              </div>
              <div class="field">
                <label for="f-mp1_codigo">MP1 Código</label>
                <input id="f-mp1_codigo" name="mp1_codigo" data-scope="receta" type="text" placeholder="Ej: 500104.056">
              </div>
              <div class="field">
                <label for="f-mp1_kg">MP1 Kilos base (kg)</label>
                <input id="f-mp1_kg" name="mp1_kg" data-scope="receta" type="text" inputmode="decimal" placeholder="Ej: 25">
              </div>

              <div class="field">
                <label for="f-mp2_nombre">Materia Prima 2 (Opcional)</label>
                <input id="f-mp2_nombre" name="mp2_nombre" data-scope="receta" type="text" placeholder="Ej: PEAD Recuperado">
              </div>
              <div class="field">
                <label for="f-mp2_codigo">MP2 Código</label>
                <input id="f-mp2_codigo" name="mp2_codigo" data-scope="receta" type="text" placeholder="Código MP2">
              </div>
              <div class="field">
                <label for="f-mp2_kg">MP2 Kilos base (kg)</label>
                <input id="f-mp2_kg" name="mp2_kg" data-scope="receta" type="text" inputmode="decimal" placeholder="Ej: 0">
              </div>

              <div class="field">
                <label for="f-master_nombre">Masterbatch (Color)</label>
                <input id="f-master_nombre" name="master_nombre" data-scope="receta" type="text" placeholder="Ej: BLANCO / ROJO">
              </div>
              <div class="field">
                <label for="f-master_codigo">Master Código</label>
                <input id="f-master_codigo" name="master_codigo" data-scope="receta" type="text" placeholder="Ej: 500104.116">
              </div>
              <div class="field">
                <label for="f-master_gr">Master Gramos (g)</label>
                <input id="f-master_gr" name="master_gr" data-scope="receta" type="text" inputmode="decimal" placeholder="Ej: 350">
              </div>

              <div class="field">
                <label for="f-molido_min_kg">Molido mínimo (kg)</label>
                <input id="f-molido_min_kg" name="molido_min_kg" data-scope="receta" type="text" inputmode="decimal" placeholder="Ej: 12">
              </div>
              <div class="field">
                <label for="f-molido_max_kg">Molido máximo (kg)</label>
                <input id="f-molido_max_kg" name="molido_max_kg" data-scope="receta" type="text" inputmode="decimal" placeholder="Ej: 17">
              </div>
            </div>
          </details>

          <!-- Contenedor dinámico donde se dibujan los parámetros HMI de la máquina elegida -->
          <div id="hmi-dynamic-sections">
            <div class="empty" style="margin-top:8px">
              Selecciona una <b>Máquina</b> arriba para desplegar su planilla de parámetros HMI. Todo campo que dejes en blanco aparecerá como <b>"Por registrar"</b>.
            </div>
          </div>

          <div class="ovb" style="margin-top:14px">
            <button class="btn solid" style="flex:1;min-height:52px" type="submit">${isEdit ? "Revisar cambios" : "Revisar y guardar"}</button>
            <button class="btn" id="sku-cancel" type="button">Cancelar</button>
          </div>
        </form>

        <!-- Vista 2: Pantalla de confirmación antes de enviar -->
        <div id="sku-confirm-box" hidden></div>
      </div>
    </div>`;

  const form = $("#sku-form");
  const confirmBox = $("#sku-confirm-box");
  const layoutSel = $("#f-layout");
  const skuInput = $("#f-sku");
  const hmiInput = $("#f-hmi");
  const dupAlert = $("#sku-dup-alert");
  const hmiContainer = $("#hmi-dynamic-sections");

  const close = () => { ov.innerHTML = ""; };
  $("#sku-close").addEventListener("click", close);
  $("#sku-cancel").addEventListener("click", close);

  // Resaltar en amarillo la sección plegable activa
  form.addEventListener("toggle", (e) => {
    if (e.target.tagName !== "DETAILS") return;
    form.querySelectorAll(".form-sec").forEach((d) => d.classList.remove("active-sec"));
    if (e.target.open) e.target.classList.add("active-sec");
  }, true);

  // Actualizar contador de campos llenos y vista previa de ID
  const updateProgress = () => {
    const inputs = [...form.querySelectorAll("input[name], select[name]")];
    const filled = inputs.filter((el) => String(el.value || "").trim() !== "").length;
    const total = inputs.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

    $("#sku-prog-txt").textContent = `${filled} de ${total} campos llenos`;
    $("#sku-prog-fill").style.width = `${pct}%`;

    const idPrev = isEdit ? ficha.id : buildSkuId(skuInput.value);
    $("#sku-id-prev").textContent = idPrev ? `ID: ${idPrev}` : "ID: pendiente";
  };

  // Validar duplicado en vivo (solo aplica al crear nuevo)
  const checkDuplicate = () => {
    if (isEdit) return false;
    const id = buildSkuId(skuInput.value);
    const maq = layoutSel.value;
    if (!id) {
      dupAlert.hidden = true;
      return false;
    }
    const existente = fichas.find((f) => f.id.toLowerCase() === id.toLowerCase());
    if (existente) {
      dupAlert.hidden = false;
      dupAlert.innerHTML = `⚠️ <b>SKU duplicado:</b> El código <b>${esc(existente.sku)}</b> ya existe en la máquina <b>${esc(existente.maquina)}</b>. Cambia el código para no duplicar filas.`;
      return true;
    }
    const mismaMaqSku = maq && fichas.find((f) => f.layout === maq && f.sku.toLowerCase() === skuInput.value.trim().toLowerCase());
    if (mismaMaqSku) {
      dupAlert.hidden = false;
      dupAlert.innerHTML = `⚠️ Este código ya está registrado en <b>${esc(mismaMaqSku.maquina)}</b>.`;
      return true;
    }
    dupAlert.hidden = true;
    return false;
  };

  // Dibujar secciones dinámicas al elegir máquina
  const renderHmiGrid = (layout) => {
    const info = MAQUINAS.find((m) => m.layout === layout);
    if (info && !hmiInput.value.trim()) {
      hmiInput.value = info.hmiDefault;
    }

    const sections = getHmiSections(layout);
    if (!sections.length) {
      hmiContainer.innerHTML = `<div class="empty" style="margin-top:8px">Selecciona una <b>Máquina</b> arriba para desplegar su planilla de parámetros HMI.</div>`;
      updateProgress();
      return;
    }

    hmiContainer.innerHTML = sections.map((sec, idx) => `
      <details class="form-sec" style="margin-top:10px">
        <summary>
          <span class="tag">${idx + 3} · ${esc(sec.tag)}</span>
          <b>${esc(sec.title)} (${sec.fields.length} campos)</b>
          <span class="avance-chev">▾</span>
        </summary>
        <div class="form-grid">
          ${sec.fields.map((fld) => {
            if (fld.type === "bool") {
              return `
                <div class="field">
                  <label for="hmi-${esc(fld.key)}">${esc(fld.label)}</label>
                  <select id="hmi-${esc(fld.key)}" name="${esc(fld.key)}" data-scope="hmi">
                    <option value="">Por registrar</option>
                    <option value="TRUE">TRUE (ON)</option>
                    <option value="FALSE">FALSE (OFF)</option>
                  </select>
                </div>`;
            }
            const isNum = fld.type === "num";
            return `
              <div class="field">
                <label for="hmi-${esc(fld.key)}">${esc(fld.label)}</label>
                <input id="hmi-${esc(fld.key)}" name="${esc(fld.key)}" data-scope="hmi" type="text"
                  ${isNum ? 'inputmode="decimal"' : ""}
                  placeholder="${esc(fld.placeholder || "Por registrar")}">
              </div>`;
          }).join("")}
        </div>
      </details>
    `).join("");

    checkDuplicate();
    updateProgress();
  };

  layoutSel.addEventListener("change", () => renderHmiGrid(layoutSel.value));

  // Precargar valores si estamos en modo EDICIÓN
  if (isEdit && ficha) {
    layoutSel.value = ficha.layout;
    skuInput.value = ficha.sku;
    renderHmiGrid(ficha.layout);

    const fotoLimpia = ficha.foto && ficha.foto.startsWith(GITHUB_RAW_BASE)
      ? ficha.foto.slice(GITHUB_RAW_BASE.length)
      : (ficha.foto || "");

    const recetaMap = {
      desc: ficha.desc || "",
      hmi: ficha.hmi || "",
      ciclo: ficha.ciclo ?? "",
      cicloTipo: ficha.cicloTipo || "Ciclo real",
      moldes: ficha.moldes ?? "",
      cavidades: ficha.cavidades ?? "",
      pesoG: ficha.pesoG ?? "",
      envases_por_bolsa: ficha.envasesPorBolsa ?? "",
      bolsas: ficha.bolsas ?? "",
      bolsasPeriodo: ficha.bolsasPeriodo ?? "",
      foto: fotoLimpia,
      unidad_factor: ficha.unidad?.factor ?? 0.1,
      unidad_confirmada: ficha.unidad?.confirmada ? "TRUE" : "FALSE",
      leyenda: Array.isArray(ficha.leyenda) ? ficha.leyenda.join(" | ") : "",
      mp1_nombre: ficha.preparada?.mp1?.nombre || "",
      mp1_codigo: ficha.preparada?.mp1?.codigo || "",
      mp1_kg: ficha.preparada?.mp1?.kg ?? "",
      mp2_nombre: ficha.preparada?.mp2?.nombre || "",
      mp2_codigo: ficha.preparada?.mp2?.codigo || "",
      mp2_kg: ficha.preparada?.mp2?.kg ?? "",
      master_nombre: ficha.preparada?.master?.nombre || "",
      master_codigo: ficha.preparada?.master?.codigo || "",
      master_gr: ficha.preparada?.master?.gr ?? "",
      molido_min_kg: ficha.preparada?.molido?.minKg ?? "",
      molido_max_kg: ficha.preparada?.molido?.maxKg ?? ""
    };

    Object.entries(recetaMap).forEach(([k, v]) => {
      const el = form.querySelector(`[data-scope='receta'][name='${k}']`);
      if (el) el.value = v !== null && v !== undefined ? String(v) : "";
    });

    form.querySelectorAll("[data-scope='hmi']").forEach((el) => {
      const altKey = el.name.replace("inplace", "Inplace");
      const raw = hmiRow[el.name] !== undefined ? hmiRow[el.name] : hmiRow[altKey];
      if (raw === undefined || raw === null || String(raw).trim() === "") {
        el.value = "";
        return;
      }
      if (el.tagName === "SELECT") {
        const up = String(raw).trim().toUpperCase();
        el.value = up === "TRUE" || up === "FALSE" ? up : "";
      } else {
        el.value = String(raw).trim();
      }
    });
  }

  skuInput.addEventListener("input", () => {
    checkDuplicate();
    updateProgress();
  });
  form.addEventListener("input", updateProgress);
  form.addEventListener("change", updateProgress);
  updateProgress();

  // Recopilar datos del formulario
  const collectPayload = () => {
    const layout = isEdit ? ficha.layout : layoutSel.value.trim().toLowerCase();
    const maqObj = MAQUINAS.find((m) => m.layout === layout);
    const sku = isEdit ? ficha.sku : skuInput.value.trim();
    const id = isEdit ? ficha.id : buildSkuId(sku);

    const receta = {
      id,
      layout,
      sku,
      maquina: isEdit ? ficha.maquina : (maqObj ? maqObj.maquina : layout.toUpperCase()),
      fecha: hoy,
      version: isEdit ? (ficha.version || "1.0") : "1.0"
    };
    const hmi = { id, sku };

    form.querySelectorAll("[data-scope='receta']").forEach((el) => {
      if (el.name && el.name !== "layout" && el.name !== "sku") {
        receta[el.name] = el.value.trim();
      }
    });

    if (receta.foto && !/^https?:\/\//i.test(receta.foto)) {
      receta.foto = GITHUB_RAW_BASE + receta.foto;
    }

    form.querySelectorAll("[data-scope='hmi']").forEach((el) => {
      if (el.name) hmi[el.name] = el.value.trim();
    });

    return {
      action: isEdit ? "update" : "create",
      pin: String(PIN_ADMIN),
      receta,
      hmi
    };
  };

  // Paso previo: Pantalla de confirmación con resumen
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isEdit && !layoutSel.value) {
      toast("Selecciona primero la máquina");
      layoutSel.focus();
      return;
    }
    if (!isEdit && !skuInput.value.trim()) {
      toast("Escribe el código SKU");
      skuInput.focus();
      return;
    }
    if (checkDuplicate()) {
      toast("Ese código SKU ya existe");
      skuInput.focus();
      return;
    }

    const payload = collectPayload();
    const allInputs = [...form.querySelectorAll("input[name], select[name]")];
    const filledCount = allInputs.filter((el) => String(el.value || "").trim() !== "").length;
    const emptyCount = allInputs.length - filledCount;

    form.hidden = true;
    confirmBox.hidden = false;
    confirmBox.innerHTML = `
      <div class="confirm-card">
        <span class="sk-tag">${isEdit ? "CONFIRMAR ACTUALIZACIÓN" : "CONFIRMAR REGISTRO"}</span>
        <h4 style="margin:8px 0;font-family:var(--font-display);font-size:24px;text-transform:uppercase">${isEdit ? "Resumen de cambios antes de actualizar" : "Resumen antes de guardar en Google Sheets"}</h4>
        <div class="confirm-grid">
          <div><small>Máquina</small><b>${esc(payload.receta.maquina)}</b></div>
          <div><small>Código SKU</small><b>${esc(payload.receta.sku)}</b></div>
          <div><small>ID</small><b>${esc(payload.receta.id)}</b></div>
          <div><small>Descripción</small><b>${esc(payload.receta.desc || "Por registrar")}</b></div>
          <div><small>Campos llenos</small><b>${filledCount} de ${allInputs.length}</b></div>
          <div><small>Campos vacíos</small><b>${emptyCount} (dirán "Por registrar")</b></div>
        </div>
        <p class="note">Se ${isEdit ? "actualizará" : "guardará"} simultáneamente en la pestaña <b>RECETAS</b> y en <b>${esc(payload.receta.maquina)}</b>.</p>
        <div id="send-status" style="margin-top:12px"></div>
        <div class="ovb" style="margin-top:14px" id="confirm-btns">
          <button class="btn solid" style="flex:1;min-height:52px" id="btn-send-now" type="button">${isEdit ? "Actualizar en Sheets" : "Guardar en Sheets"}</button>
          <button class="btn" id="btn-back-edit" type="button">Volver a editar</button>
        </div>
      </div>`;

    const sendToSheets = async () => {
      const statusEl = $("#send-status");
      const btnsEl = $("#confirm-btns");

      if (!URL_GUARDAR_SKU || URL_GUARDAR_SKU.includes("PEGA_AQUI")) {
        statusEl.innerHTML = `<div class="empty" style="border-color:var(--alert);color:var(--ink)">Falta pegar la URL de tu Apps Script en <code>js/config.js</code> (variable <b>URL_GUARDAR_SKU</b>).</div>`;
        return;
      }

      btnsEl.querySelectorAll("button").forEach((b) => { b.disabled = true; });
      statusEl.innerHTML = `<div class="sk-status" style="margin:0"><span class="sk-tag">ENVIANDO</span><span class="sk-status-txt">${isEdit ? "Actualizando ficha" : "Guardando en Google Sheets"}<span class="sk-dots">...</span></span></div>`;

      try {
        const res = await fetch(URL_GUARDAR_SKU, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!data || !data.ok) {
          throw new Error(data?.message || "El servidor rechazó la operación.");
        }

        const fichaResult = isEdit
          ? updateRecetaLocal(payload.receta, payload.hmi)
          : addRecetaLocal(payload.receta, payload.hmi);

        close();
        toast(isEdit
          ? "Ficha actualizada. Los demás celulares verán el cambio en unos minutos."
          : "SKU guardado. Puede tardar unos minutos en verse en otros celulares.");

        if (typeof opts.onSaved === "function") opts.onSaved(fichaResult, payload.hmi);

      } catch (err) {
        btnsEl.querySelectorAll("button").forEach((b) => { b.disabled = false; });
        $("#btn-send-now").textContent = "Reintentar envío";
        statusEl.innerHTML = `
          <div class="empty" style="border-color:var(--alert);color:var(--ink);text-align:left">
            <span class="pill bad">ERROR DE CONEXIÓN</span><br><br>
            No se perdió ningún dato escrito. Verifica tu señal e intenta de nuevo.<br>
            <small style="color:var(--steel)">Detalle: ${esc(err.message)}</small>
          </div>`;
      }
    };

    $("#btn-back-edit").addEventListener("click", () => {
      confirmBox.hidden = true;
      form.hidden = false;
    });
    $("#btn-send-now").addEventListener("click", sendToSheets);
  });
}