import { renderQCM75_1 } from "./qcm75-1.js";
import { renderQCM75 } from "./qcm75.js";
import { renderBekum } from "./bekum.js";
import { renderPet1 } from "./pet-1.js";
import { esc, secH } from "../ui/bloques.js";

const RENDERERS = {
  "qcm-75-1": renderQCM75_1,
  "qcm-75":   renderQCM75,
  "bekum":    renderBekum,
  "pet-1":    renderPet1
};

export function renderHmiBody(ficha, hmiRow) {
  const fn = RENDERERS[ficha.layout];

  if (!fn) {
    return `
      ${secH("PARÁMETROS HMI", "Error de configuración de máquina", "Revisar columna layout")}
      <div class="empty" style="border-color:var(--alert);color:var(--ink)">
        <span class="pill bad">LAYOUT NO RECONOCIDO</span><br><br>
        El valor <b>"${esc(ficha.layout || "vacío")}"</b> en la columna <b>layout</b> de tu hoja RECETAS no coincide con ninguna máquina registrada.<br>
        Usa exactamente: <b>qcm-75-1</b>, <b>qcm-75</b>, <b>bekum</b> o <b>pet-1</b>.
      </div>`;
  }

  if (!hmiRow || !hmiRow.id) {
    const detalle = hmiRow === null
      ? `No existe una URL configurada para <b>${esc(ficha.layout)}</b> en <code>js/config.js</code>.`
      : `El ID <b>${esc(ficha.id)}</b> no aparece en la pestaña <b>${esc(ficha.layout.toUpperCase())}</b> de tu Google Sheet.`;

    return `
      ${secH("PARÁMETROS HMI", "Datos mecánicos no encontrados", "Pendiente de carga en BD")}
      <div class="empty" style="border-color:var(--alert);color:var(--ink)">
        <span class="pill bad">SIN DATOS HMI</span><br><br>
        ${detalle}<br>
        Verifica el ID en tu base de datos para mostrar los parámetros reales de esta máquina.
      </div>`;
  }

  return fn(ficha, hmiRow);
}