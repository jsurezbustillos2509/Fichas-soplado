import { numOrNull, strOrNull, toBool } from "../datos.js";
import { secH, num, bloqueBarrasSimples, bloqueTablasLR, bloquePQ2, bloqueZonasTemp, bloqueTarjetas, bloqueHerramientas } from "../ui/bloques.js";

export function renderQCM75(f, q = {}) {
  const time1 = [
    ["BLOW", numOrNull(q.time1_BLOW)], ["EXHAUST", numOrNull(q.time1_EXHAUST)],
    ["CUT", numOrNull(q.time1_CUT)], ["HEAD LIFT", numOrNull(q.time1_HEAD_LIFT)],
    ["HOLD ON", numOrNull(q.time1_HOLD_ON)], ["S-exhaust", numOrNull(q.time1_S_exhaust)],
    ["PIN PRE-UP", numOrNull(q.time1_PIN_PRE_UP)], ["FLASH", numOrNull(q.time1_FLASH)],
    ["ROTATION TIME", numOrNull(q.time1_ROTATION_TIME)], ["SPARE1", numOrNull(q.time1_SPARE1)], ["SPARE2", numOrNull(q.time1_SPARE2)]
  ];
  const time2Izq = [
    ["Station up delay", numOrNull(q.time2_Station_up_delay_L), numOrNull(q.time2_Station_up_delay_R)],
    ["Mold close delay", numOrNull(q.time2_Mold_close_delay_L), numOrNull(q.time2_Mold_close_delay_R)],
    ["Cutter delay", numOrNull(q.time2_Cutter_delay_L), numOrNull(q.time2_Cutter_delay_R)],
    ["Station down delay", numOrNull(q.time2_Station_down_delay_L), numOrNull(q.time2_Station_down_delay_R)],
    ["Head lift delay", numOrNull(q.time2_Head_lift_delay_L), numOrNull(q.time2_Head_lift_delay_R)],
    ["Deflash delay", numOrNull(q.time2_Deflash_delay)]
  ];
  const time2Der = [
    ["Pin down delay", numOrNull(q.time2_Pin_down_delay_L), numOrNull(q.time2_Pin_down_delay_R)],
    ["Blow delay", numOrNull(q.time2_Blow_delay_L), numOrNull(q.time2_Blow_delay_R)],
    ["Mold open delay", numOrNull(q.time2_Mold_open_delay_L), numOrNull(q.time2_Mold_open_delay_R)],
    ["Pin up delay", numOrNull(q.time2_Pin_up_delay_L), numOrNull(q.time2_Pin_up_delay_R)],
    ["Sub-mold delay", numOrNull(q.time2_Sub_mold_delay_L), numOrNull(q.time2_Sub_mold_delay_R)],
    ["STATION Inplace", numOrNull(q.time2_Station_inplace_L ?? q.time2_Station_Inplace_L), numOrNull(q.time2_Station_inplace_R ?? q.time2_Station_Inplace_R)]
  ];
  const pq1Izq = [
    ["M. close fast", numOrNull(q.pq1_M_close_fast_L), numOrNull(q.pq1_M_close_fast_R)],
    ["M. close slow", numOrNull(q.pq1_M_close_slow_L), numOrNull(q.pq1_M_close_slow_R)],
    ["M. close clamp", numOrNull(q.pq1_M_close_clamp_L), numOrNull(q.pq1_M_close_clamp_R)],
    ["M. open", numOrNull(q.pq1_M_open_L), numOrNull(q.pq1_M_open_R)]
  ];
  const pq1Der = [
    ["Pin down fast", numOrNull(q.pq1_Pin_down_fast_L), numOrNull(q.pq1_Pin_down_fast_R)],
    ["Pin down slow", numOrNull(q.pq1_Pin_down_slow_L), numOrNull(q.pq1_Pin_down_slow_R)],
    ["Pin up", numOrNull(q.pq1_Pin_up_L), numOrNull(q.pq1_Pin_up_R)],
    ["CAP CLOSE", numOrNull(q.pq1_CAP_CLOSE_L), numOrNull(q.pq1_CAP_CLOSE_R)],
    ["CAP OPEN", numOrNull(q.pq1_CAP_OPEN_L), numOrNull(q.pq1_CAP_OPEN_R)]
  ];
  const pq2 = [
    { t: "L · Station up", P: [numOrNull(q.pq2_L_Station_up_P1), numOrNull(q.pq2_L_Station_up_P2), numOrNull(q.pq2_L_Station_up_P3)], Q: [numOrNull(q.pq2_L_Station_up_Q1), numOrNull(q.pq2_L_Station_up_Q2), numOrNull(q.pq2_L_Station_up_Q3)] },
    { t: "R · Station up", P: [numOrNull(q.pq2_R_Station_up_P1), numOrNull(q.pq2_R_Station_up_P2), numOrNull(q.pq2_R_Station_up_P3)], Q: [numOrNull(q.pq2_R_Station_up_Q1), numOrNull(q.pq2_R_Station_up_Q2), numOrNull(q.pq2_R_Station_up_Q3)] },
    { t: "L · Station down", P: [numOrNull(q.pq2_L_Station_down_P1), numOrNull(q.pq2_L_Station_down_P2), numOrNull(q.pq2_L_Station_down_P3)], Q: [numOrNull(q.pq2_L_Station_down_Q1), numOrNull(q.pq2_L_Station_down_Q2), numOrNull(q.pq2_L_Station_down_Q3)] },
    { t: "R · Station down", P: [numOrNull(q.pq2_R_Station_down_P1), numOrNull(q.pq2_R_Station_down_P2), numOrNull(q.pq2_R_Station_down_P3)], Q: [numOrNull(q.pq2_R_Station_down_Q1), numOrNull(q.pq2_R_Station_down_Q2), numOrNull(q.pq2_R_Station_down_Q3)] }
  ];
  const zonas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((z) => ({
    z, on: toBool(q[`temp_z${z}_on`]), consigna: numOrNull(q[`temp_z${z}_consigna`]), actual: numOrNull(q[`temp_z${z}_actual`])
  }));
  const cabezal = {
    cono: numOrNull(q.herramientas_cono),
    funda: numOrNull(q.herramientas_funda)
  };
  const agujas = {
    L: { casquillo: strOrNull(q.agujas_L_casquillo), cuchilla: strOrNull(q.agujas_L_cuchilla), cuello: strOrNull(q.agujas_L_cuello) },
    R: { casquillo: strOrNull(q.agujas_R_casquillo), cuchilla: strOrNull(q.agujas_R_cuchilla), cuello: strOrNull(q.agujas_R_cuello) }
  };

  return `
    ${secH("PANTALLA TIME 1", "Tiempos del ciclo", f.ciclo !== null ? "A escala del ciclo de " + num(f.ciclo) + " s" : "Ciclo por registrar")}
    ${bloqueBarrasSimples(f, time1, `<span class="flag">UNIDAD POR CONFIRMAR</span>Se asume 1 unidad = ${num(f.unidad.factor)} s. Cada barra es la duración de un temporizador; no indica el orden de las etapas.`)}
    ${secH("PANTALLA TIME 2", "Retardos", "L = izquierda · R = derecha")}
    ${bloqueTablasLR(time2Izq, time2Der)}
    ${secH("PANTALLAS PQ VALVE 1 Y 2", "Presión y caudal", "P = presión · Q = caudal")}
    ${bloqueTablasLR(pq1Izq, pq1Der)}
    ${bloquePQ2(pq2)}
    ${secH("PANTALLA TEMP SETTING", "Zonas de temperatura", `UP ${num(numOrNull(q.temp_up))} · DOWN ${num(numOrNull(q.temp_down))}`)}
    ${bloqueZonasTemp(zonas, { clase: "z10" })}
    ${secH("VARIADOR", "Lectura del variador", "TRANSDUCER III")}
    ${bloqueTarjetas([{ l: "Frecuencia", v: numOrNull(q.variador_hz), u: "Hz" }])}
    ${secH("HERRAMIENTAS", "Cabezal y herramientas de aguja", "Cambio de formato (mm)")}
    ${bloqueHerramientas({ cabezal, agujas, pend: "Por registrar" })}`;
}