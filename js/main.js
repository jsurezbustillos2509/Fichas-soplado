import { loadRecetas, loadHmiRow } from "./datos.js";
import { $ } from "./ui/bloques.js";
import { renderCatalog } from "./ui/catalogo.js";
import { renderFicha } from "./ui/ficha.js";
import { closeOverlay } from "./ui/exportar.js";

let FICHAS = [];
let currentId = null;

// Manejo del tema Claro / Oscuro / Auto
const THEMES = ["auto", "light", "dark"];
const THEME_LABEL = { auto: "Auto", light: "Claro", dark: "Oscuro" };
let theme = localStorage.getItem("fp-theme") || "auto";

function applyTheme() {
  if (theme === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
  $("#theme").textContent = "Tema: " + THEME_LABEL[theme];
}
$("#theme").addEventListener("click", () => {
  theme = THEMES[(THEMES.indexOf(theme) + 1) % 3];
  try { localStorage.setItem("fp-theme", theme); } catch (e) {}
  applyTheme();
});
applyTheme();

// Enrutador reactivo (carga la hoja de la HMI solo cuando se abre esa ficha)
async function route() {
  const h = (location.hash || "").slice(1);
  const f = FICHAS.find((x) => x.id === h);
  const key = f ? f.id : "";
  if (key === currentId) return;

  currentId = key;
  closeOverlay();
  window.scrollTo(0, 0);

  if (!f) {
    renderCatalog(FICHAS);
    return;
  }

  $("#app").innerHTML = `<div class="empty">Cargando parámetros de ${f.maquina}...</div>`;
  try {
    const hmiRow = await loadHmiRow(f.layout, f.id);
    renderFicha(f, hmiRow);
  } catch (err) {
    $("#app").innerHTML = `<div class="empty">No se pudo cargar la hoja de la máquina ${f.maquina}. Verifica que esté publicada en la web.</div>`;
  }
}

window.addEventListener("hashchange", route);

// Arranque inicial (solo descarga RECETAS)
async function init() {
  try {
    FICHAS = await loadRecetas();
    route();
  } catch (err) {
    $("#app").innerHTML = `<div class="empty">No se pudieron cargar las recetas desde Google Sheets. Verifica tu conexión o publicación CSV.</div>`;
  }
}
init();