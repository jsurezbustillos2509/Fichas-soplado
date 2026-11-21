import { toNum, numOrNull, toBool } from "../datos.js";
import { secH, esc, num, n1, bloqueBarrasDobles, bloqueZonasTemp, bloqueTarjetas } from "../ui/bloques.js";

export function renderBekum(f, b = {}) {
  const tiempos = [
    ["Subida Molde (Manga)", toNum(b.encabezado_izq), toNum(b.encabezado_der)],
    ["Ret. Subir Brazo", toNum(b.tiempos_Ret_Subir_Brazo_L), toNum(b.tiempos_Ret_Subir_Brazo_R)],
    ["Ret. Bajar Brazo", toNum(b.tiempos_Ret_Bajar_Brazo_L), toNum(b.tiempos_Ret_Bajar_Brazo_R)],
    ["Ret. Corte Manga", toNum(b.tiempos_Ret_Corte_Manga_L), toNum(b.tiempos_Ret_Corte_Manga_R)],
    ["Ret. Abrir Molde", toNum(b.tiempos_Ret_Abrir_Molde_L), toNum(b.tiempos_Ret_Abrir_Molde_R)],
    ["Ret. Cerrar Molde", toNum(b.tiempos_Ret_Cerrar_Molde_L), toNum(b.tiempos_Ret_Cerrar_Molde_R)],
    ["Ret. Pre-Soplo", toNum(b.tiempos_Ret_Pre_Soplo_L), toNum(b.tiempos_Ret_Pre_Soplo_R)],
    ["Tiempo Pre-Soplo", toNum(b.tiempos_Tiempo_Pre_Soplo_L), toNum(b.tiempos_Tiempo_Pre_Soplo_R)],
    ["Ret. Soplo", toNum(b.tiempos_Ret_Soplo_L), toNum(b.tiempos_Ret_Soplo_R)],
    ["Tiempo Soplo", toNum(b.tiempos_Tiempo_Soplo_L), toNum(b.tiempos_Tiempo_Soplo_R)],
    ["Ret. Bajar Pico", toNum(b.tiempos_Ret_Bajar_Pico_L), toNum(b.tiempos_Ret_Bajar_Pico_R)],
    ["Tiemp Subir Pico 1", toNum(b.tiempos_Tiemp_Subir_Pico_1_L), toNum(b.tiempos_Tiemp_Subir_Pico_1_R)],
    ["Ret. Subir Pico 2", toNum(b.tiempos_Ret_Subir_Pico_2_L), toNum(b.tiempos_Ret_Subir_Pico_2_R)]
  ];
  const zonas = [9, 8, 7, 6, 5, 4, 3, 2, 1].map((z) => ({
    z, on: toBool(b[`calef_z${z}_on`]), consigna: toNum(b[`calef_z${z}_consigna`]), actual: toNum(b[`calef_z${z}_actual`])
  }));
  const switches = [
    ["Cuchilla", toBool(b.calef_cuchilla)],
    ["Turbina 1", toBool(b.calef_turbina_1)],
    ["Turbina 2", toBool(b.calef_turbina_2)],
    ["Turbina 3", toBool(b.calef_turbina_3)]
  ];
  const extras = [
    { n: "Temp. para hab. tornillo", c: toNum(b.calef_temp_hab_tornillo_consigna), a: toNum(b.calef_temp_hab_tornillo_actual), u: "°C" },
    { n: "Valor de temp. (renglón inferior)", v: numOrNull(b.calef_valor_temp_inferior), u: "°C", pend: "ilegible en la foto" }
  ];
  const perilla = toNum(b.manga_perilla);
  const soploVal = n1(toNum(b.tiempos_Tiempo_Soplo_L));

  return `
    ${secH("PANTALLA AJUSTE DE TIEMPOS", "Tiempos del ciclo", "A escala del ciclo de " + num(f.ciclo) + " s")}
    ${bloqueBarrasDobles(f, tiempos, [
      `<span class="flag">UNIDAD POR CONFIRMAR</span>La pantalla dice "Tiempo en Seg." pero los valores (por ejemplo ${soploVal}) no caben en un ciclo de ${num(f.ciclo)} s. Se asume 1 unidad = ${num(f.unidad.factor)} s.`,
      `Se registran los valores de ajuste (columnas azules). Las columnas en vivo no se guardan.`
    ])}
    ${secH("PANTALLA AJUSTE CALEFACCIÓN", "Zonas de temperatura", "Consigna en °C")}
    ${bloqueZonasTemp(zonas, { decimales: true, switches, extras })}
    ${secH("MANGA", "Variador WEG y perilla")}
    ${bloqueTarjetas([
      { l: "Velocidad", v: toNum(b.manga_rpm), u: "rpm" },
      { l: "Corriente", v: toNum(b.manga_a), u: "A" },
      { l: "Frecuencia", v: toNum(b.manga_hz), u: "Hz" },
      { l: "Perilla (R10K)", v: perilla, u: "%" }
    ])}
    <p class="note">Estado del variador: ${esc(b.manga_estado || "")}. La perilla se lee a ojo (≈ ${perilla} %). Anotado a mano: "${esc(b.manga_nota || "")}".</p>
    ${secH("AGUJAS", "Herramientas de aguja", "Para el cambio de formato (mm)")}
    ${bloqueTarjetas([
      { l: "Casquillo", v: numOrNull(b.herramientas_casquillo), u: "mm" },
      { l: "Cuchilla", v: numOrNull(b.herramientas_cuchilla), u: "mm" },
      { l: "Altura del cuello", v: numOrNull(b.herramientas_cuello), u: "mm" }
    ])}`;
}