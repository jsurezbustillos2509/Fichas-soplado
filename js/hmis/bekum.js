import { numOrNull, toBool } from "../datos.js";
import { secH, esc, num, n1, bloqueBarrasDobles, bloqueZonasTemp, bloqueTarjetas, bloqueHerramientas } from "../ui/bloques.js";

export function renderBekum(f, b = {}) {
  const tiempos = [
    ["Subida Molde (Manga)", numOrNull(b.encabezado_izq), numOrNull(b.encabezado_der)],
    ["Ret. Subir Brazo", numOrNull(b.tiempos_Ret_Subir_Brazo_L), numOrNull(b.tiempos_Ret_Subir_Brazo_R)],
    ["Ret. Bajar Brazo", numOrNull(b.tiempos_Ret_Bajar_Brazo_L), numOrNull(b.tiempos_Ret_Bajar_Brazo_R)],
    ["Ret. Corte Manga", numOrNull(b.tiempos_Ret_Corte_Manga_L), numOrNull(b.tiempos_Ret_Corte_Manga_R)],
    ["Ret. Abrir Molde", numOrNull(b.tiempos_Ret_Abrir_Molde_L), numOrNull(b.tiempos_Ret_Abrir_Molde_R)],
    ["Ret. Cerrar Molde", numOrNull(b.tiempos_Ret_Cerrar_Molde_L), numOrNull(b.tiempos_Ret_Cerrar_Molde_R)],
    ["Ret. Pre-Soplo", numOrNull(b.tiempos_Ret_Pre_Soplo_L), numOrNull(b.tiempos_Ret_Pre_Soplo_R)],
    ["Tiempo Pre-Soplo", numOrNull(b.tiempos_Tiempo_Pre_Soplo_L), numOrNull(b.tiempos_Tiempo_Pre_Soplo_R)],
    ["Ret. Soplo", numOrNull(b.tiempos_Ret_Soplo_L), numOrNull(b.tiempos_Ret_Soplo_R)],
    ["Tiempo Soplo", numOrNull(b.tiempos_Tiempo_Soplo_L), numOrNull(b.tiempos_Tiempo_Soplo_R)],
    ["Ret. Bajar Pico", numOrNull(b.tiempos_Ret_Bajar_Pico_L), numOrNull(b.tiempos_Ret_Bajar_Pico_R)],
    ["Tiemp Subir Pico 1", numOrNull(b.tiempos_Tiemp_Subir_Pico_1_L), numOrNull(b.tiempos_Tiemp_Subir_Pico_1_R)],
    ["Ret. Subir Pico 2", numOrNull(b.tiempos_Ret_Subir_Pico_2_L), numOrNull(b.tiempos_Ret_Subir_Pico_2_R)]
  ];
  const zonas = [9, 8, 7, 6, 5, 4, 3, 2, 1].map((z) => ({
    z, on: toBool(b[`calef_z${z}_on`]), consigna: numOrNull(b[`calef_z${z}_consigna`]), actual: numOrNull(b[`calef_z${z}_actual`])
  }));
  const switches = [
    ["Cuchilla", toBool(b.calef_cuchilla)],
    ["Turbina 1", toBool(b.calef_turbina_1)],
    ["Turbina 2", toBool(b.calef_turbina_2)],
    ["Turbina 3", toBool(b.calef_turbina_3)]
  ];
  const extras = [
    { n: "Temp. para hab. tornillo", c: numOrNull(b.calef_temp_hab_tornillo_consigna), a: numOrNull(b.calef_temp_hab_tornillo_actual), u: "°C" },
    { n: "Valor de temp. (renglón inferior)", v: numOrNull(b.calef_valor_temp_inferior), u: "°C", pend: "Por registrar" }
  ];
  const perilla = numOrNull(b.manga_perilla);
  const soploNum = numOrNull(b.tiempos_Tiempo_Soplo_L);
  const soploVal = soploNum !== null ? n1(soploNum) : "—";

  return `
    ${secH("PANTALLA AJUSTE DE TIEMPOS", "Tiempos del ciclo", f.ciclo !== null ? "A escala del ciclo de " + num(f.ciclo) + " s" : "Ciclo por registrar")}
    ${bloqueBarrasDobles(f, tiempos, [
      `<span class="flag">UNIDAD POR CONFIRMAR</span>La pantalla dice "Tiempo en Seg." pero los valores (por ejemplo ${soploVal}) no caben en un ciclo de ${num(f.ciclo)} s. Se asume 1 unidad = ${num(f.unidad.factor)} s.`,
      `Se registran los valores de ajuste (columnas azules). Las columnas en vivo no se guardan.`
    ])}
    ${secH("PANTALLA AJUSTE CALEFACCIÓN", "Zonas de temperatura", "Consigna en °C")}
    ${bloqueZonasTemp(zonas, { decimales: true, switches, extras })}
    ${secH("MANGA", "Variador WEG y perilla")}
    ${bloqueTarjetas([
      { l: "Velocidad", v: numOrNull(b.manga_rpm), u: "rpm" },
      { l: "Corriente", v: numOrNull(b.manga_a), u: "A" },
      { l: "Frecuencia", v: numOrNull(b.manga_hz), u: "Hz" },
      { l: "Perilla (R10K)", v: perilla, u: "%" }
    ])}
    <p class="note">Estado del variador: ${esc(b.manga_estado || "Por registrar")}.${perilla !== null ? ` La perilla se lee a ojo (≈ ${perilla} %).` : ""} Anotado a mano: "${esc(b.manga_nota || "Por registrar")}".</p>
    ${secH("HERRAMIENTAS", "Cabezal y herramientas de aguja", "Cambio de formato (mm)")}
    ${bloqueHerramientas({
      cabezal: {
        cono: numOrNull(b.herramientas_cono),
        funda: numOrNull(b.herramientas_funda)
      },
      simple: {
        casquillo: numOrNull(b.herramientas_casquillo),
        cuchilla: numOrNull(b.herramientas_cuchilla),
        cuello: numOrNull(b.herramientas_cuello)
      },
      pend: "Por registrar"
    })}`;
}