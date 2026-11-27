import { numOrNull } from "../datos.js";
import { secH, num, bloqueTarjetas } from "../ui/bloques.js";

export function renderPet1(f, p = {}) {
  const tiempos = [
    { l: "C. MOULD",     v: numOrNull(p.time_c_mould),    u: "s" },
    { l: "SE. DELAY",    v: numOrNull(p.time_se_delay),   u: "s" },
    { l: "SEAL TIME",    v: numOrNull(p.time_seal_time),  u: "s" },
    { l: "ST. DELAY",    v: numOrNull(p.time_st_delay),   u: "s" },
    { l: "STRETCH",      v: numOrNull(p.time_stretch),    u: "s" },
    { l: "L.B. DELAY",   v: numOrNull(p.time_l_b_delay),  u: "s" },
    { l: "L. BLOWING",   v: numOrNull(p.time_l_blowing),  u: "s" },
    { l: "R.B. DELAY",   v: numOrNull(p.time_r_b_delay),  u: "s" },
    { l: "R. BLOWING",   v: numOrNull(p.time_r_blowing),  u: "s" },
    { l: "L.E. DELAY",   v: numOrNull(p.time_l_e_delay),  u: "s" },
    { l: "L. EXCR. AIR", v: numOrNull(p.time_l_excr_air), u: "s" },
    { l: "R.E. DELAY",   v: numOrNull(p.time_r_e_delay),  u: "s" },
    { l: "R. EXCR. AIR", v: numOrNull(p.time_r_excr_air), u: "s" },
    { l: "SPARE 1",      v: numOrNull(p.time_spare_1),    u: "s" },
    { l: "SPARE 2",      v: numOrNull(p.time_spare_2),    u: "s" }
  ];

  const zonasConfig = [
    ["TEMP CONTROL A", "heater_a"],
    ["TEMP CONTROL B", "heater_b"],
    ["TEMP CONTROL C", "heater_c"],
    ["TEMP CONTROL D", "heater_d"],
    ["TEMP CONTROL E", "heater_e"],
    ["TEMP CONTROL F", "heater_f"],
    ["TEMP CONTROL G", "heater_g"],
    ["TEMP CONTROL H", "heater_h"],
    ["TEMP INDICATOR", "heater_ind"]
  ];

  const zonasCards = zonasConfig.map(([label, prefix]) => {
    const pv = numOrNull(p[`${prefix}_pv`]);
    const sv = numOrNull(p[`${prefix}_sv`]);
    const pvTxt = pv !== null ? `${num(pv)} °C` : "—";
    return {
      l: `${label} · PV: ${pvTxt}`,
      v: sv,
      u: "°C (SV)"
    };
  });

  zonasCards.push({
    l: "TRANSDUCER",
    v: numOrNull(p.heater_transducer),
    u: "valor"
  });

  return `
    ${secH("TIME SETTING", "Tiempos de soplado PET", "Valores en segundos (s)")}
    ${bloqueTarjetas(tiempos)}
    ${secH("PREFORMS HEATER", "Calefacción de preformas", "Consigna SV (°C) y lectura PV")}
    ${bloqueTarjetas(zonasCards)}
    <p class="note">En cada zona se muestra el valor programado (<b>SV</b>) como consigna principal y la referencia de lectura (<b>PV</b>) registrada en el tablero.</p>`;
}