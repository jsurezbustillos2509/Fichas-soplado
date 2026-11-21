import { toNum, strOrNull } from "../datos.js";
import { secH, num, bloqueBarrasSimples, bloqueTablasLR, bloquePQ2, bloqueTarjetas, bloqueAgujasLR } from "../ui/bloques.js";

export function renderQCM(f, q = {}) {
  const time1 = [
    ["BLOW", toNum(q.time1_BLOW)], ["EXHAUST", toNum(q.time1_EXHAUST)],
    ["CUT", toNum(q.time1_CUT)], ["HEAD LIFT", toNum(q.time1_HEAD_LIFT)],
    ["HOLD ON", toNum(q.time1_HOLD_ON)], ["F-EXHAUST", toNum(q.time1_F_EXHAUST)],
    ["PIN PRE-UP", toNum(q.time1_PIN_PRE_UP)], ["FLASH", toNum(q.time1_FLASH)],
    ["ROTATION TIME", toNum(q.time1_ROTATION_TIME)], ["Die blow", toNum(q.time1_Die_blow)]
  ];
  const time2Izq = [
    ["Station up delay", toNum(q.time2_Station_up_delay_L), toNum(q.time2_Station_up_delay_R)],
    ["Mold close delay", toNum(q.time2_Mold_close_delay_L), toNum(q.time2_Mold_close_delay_R)],
    ["Cutter delay", toNum(q.time2_Cutter_delay_L), toNum(q.time2_Cutter_delay_R)],
    ["Station down delay", toNum(q.time2_Station_down_delay_L), toNum(q.time2_Station_down_delay_R)],
    ["Head lift delay", toNum(q.time2_Head_lift_delay_L), toNum(q.time2_Head_lift_delay_R)],
    ["Deflash delay", toNum(q.time2_Deflash_delay)]
  ];
  const time2Der = [
    ["Pin down delay", toNum(q.time2_Pin_down_delay_L), toNum(q.time2_Pin_down_delay_R)],
    ["Blow delay", toNum(q.time2_Blow_delay_L), toNum(q.time2_Blow_delay_R)],
    ["Mold open delay", toNum(q.time2_Mold_open_delay_L), toNum(q.time2_Mold_open_delay_R)],
    ["Pin up delay", toNum(q.time2_Pin_up_delay_L), toNum(q.time2_Pin_up_delay_R)],
    ["Sub-mold delay", toNum(q.time2_Sub_mold_delay_L), toNum(q.time2_Sub_mold_delay_R)],
    ["Station down hold delay", toNum(q.time2_Station_down_hold_delay_L), toNum(q.time2_Station_down_hold_delay_R)]
  ];
  const pq1Izq = [
    ["M. close fast", toNum(q.pq1_M_close_fast_L), toNum(q.pq1_M_close_fast_R)],
    ["M. close slow", toNum(q.pq1_M_close_slow_L), toNum(q.pq1_M_close_slow_R)],
    ["M. close clamp", toNum(q.pq1_M_close_clamp_L), toNum(q.pq1_M_close_clamp_R)],
    ["M. open", toNum(q.pq1_M_open_L), toNum(q.pq1_M_open_R)]
  ];
  const pq1Der = [
    ["Pin down fast", toNum(q.pq1_Pin_down_fast_L), toNum(q.pq1_Pin_down_fast_R)],
    ["Pin down slow", toNum(q.pq1_Pin_down_slow_L), toNum(q.pq1_Pin_down_slow_R)],
    ["Pin up", toNum(q.pq1_Pin_up_L), toNum(q.pq1_Pin_up_R)],
    ["CAP CLOSE", toNum(q.pq1_CAP_CLOSE_L), toNum(q.pq1_CAP_CLOSE_R)],
    ["CAP OPEN", toNum(q.pq1_CAP_OPEN_L), toNum(q.pq1_CAP_OPEN_R)]
  ];
  const pq2 = [
    { t: "L · Station up", P: [toNum(q.pq2_L_Station_up_P1), toNum(q.pq2_L_Station_up_P2), toNum(q.pq2_L_Station_up_P3)], Q: [toNum(q.pq2_L_Station_up_Q1), toNum(q.pq2_L_Station_up_Q2), toNum(q.pq2_L_Station_up_Q3)] },
    { t: "R · Station up", P: [toNum(q.pq2_R_Station_up_P1), toNum(q.pq2_R_Station_up_P2), toNum(q.pq2_R_Station_up_P3)], Q: [toNum(q.pq2_R_Station_up_Q1), toNum(q.pq2_R_Station_up_Q2), toNum(q.pq2_R_Station_up_Q3)] },
    { t: "L · Station down", P: [toNum(q.pq2_L_Station_down_P1), toNum(q.pq2_L_Station_down_P2), toNum(q.pq2_L_Station_down_P3)], Q: [toNum(q.pq2_L_Station_down_Q1), toNum(q.pq2_L_Station_down_Q2), toNum(q.pq2_L_Station_down_Q3)] },
    { t: "R · Station down", P: [toNum(q.pq2_R_Station_down_P1), toNum(q.pq2_R_Station_down_P2), toNum(q.pq2_R_Station_down_P3)], Q: [toNum(q.pq2_R_Station_down_Q1), toNum(q.pq2_R_Station_down_Q2), toNum(q.pq2_R_Station_down_Q3)] }
  ];
  const agujas = {
    L: { casquillo: strOrNull(q.agujas_L_casquillo), cuchilla: strOrNull(q.agujas_L_cuchilla), cuello: strOrNull(q.agujas_L_cuello) },
    R: { casquillo: strOrNull(q.agujas_R_casquillo), cuchilla: strOrNull(q.agujas_R_cuchilla), cuello: strOrNull(q.agujas_R_cuello) }
  };

  return `
    ${secH("PANTALLA TIME 1", "Tiempos del ciclo", "A escala del ciclo de " + num(f.ciclo) + " s")}
    ${bloqueBarrasSimples(f, time1, `<span class="flag">UNIDAD POR CONFIRMAR</span>Se asume 1 unidad = ${num(f.unidad.factor)} s. Cada barra es la duración de un temporizador; no indica el orden de las etapas.`)}
    ${secH("PANTALLA TIME 2", "Retardos", "L = izquierda · R = derecha")}
    ${bloqueTablasLR(time2Izq, time2Der)}
    ${secH("PANTALLAS PQ VALVE 1 Y 2", "Presión y caudal", "P = presión · Q = caudal")}
    ${bloqueTablasLR(pq1Izq, pq1Der)}
    ${bloquePQ2(pq2)}
    ${secH("VARIADOR", "Lectura del variador")}
    ${bloqueTarjetas([{ l: "Frecuencia", v: toNum(q.variador_hz), u: "Hz" }, { l: "Corriente", v: toNum(q.variador_a), u: "A" }, { l: "Voltaje mostrado", v: toNum(q.variador_v), u: "V" }])}
    ${secH("AGUJAS", "Herramientas: casquillo, cuchilla y cuello", "Para el cambio de formato")}
    ${bloqueAgujasLR(agujas, "por anotar")}`;
}