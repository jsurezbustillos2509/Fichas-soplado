import { loadRecetas, loadHmiRow } from "./datos.js";
import { $ } from "./ui/bloques.js";
import { renderCatalog } from "./ui/catalogo.js";
import { renderFicha } from "./ui/ficha.js";
import { closeOverlay } from "./ui/exportar.js";
import { skeletonCatalog, skeletonFicha, errorBox } from "./ui/skeleton.js";
import { syncNavidadTheme } from "./ui/navidad.js";

// Espera mínima para que el esqueleto no parpadee cuando la carga es muy rápida
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
async function conMinimo(promesa, ms) {
  const [res] = await Promise.all([promesa, esperar(ms)]);
  return res;
}

let FICHAS = [];
let currentId = null;

// Manejo del tema Navidad / Claro / Oscuro / Auto
const THEMES = ["navidad", "auto", "light", "dark"];
const THEME_LABEL = { navidad: "🎄 Navidad", auto: "Auto", light: "Claro", dark: "Oscuro" };
let theme = localStorage.getItem("fp-theme") || "navidad";
if (!THEMES.includes(theme)) theme = "navidad";

function applyTheme() {
  if (theme === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
  $("#theme").textContent = "Tema: " + THEME_LABEL[theme];
  syncNavidadTheme(theme === "navidad");
}
$("#theme").addEventListener("click", () => {
  theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
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

  $("#app").innerHTML = skeletonFicha(f.maquina);
  try {
    const hmiRow = await conMinimo(loadHmiRow(f.layout, f.id), 350);
    if (currentId !== key) return; // el usuario ya navegó a otra pantalla
    renderFicha(f, hmiRow);
  } catch (err) {
    if (currentId !== key) return;
    $("#app").innerHTML = errorBox(`No se pudo cargar la hoja de la máquina ${f.maquina}. Verifica que esté publicada en la web.`, "sk-retry");
    $("#sk-retry").addEventListener("click", () => { currentId = null; route(); });
  }
}

window.addEventListener("hashchange", route);

// Arranque inicial (solo descarga RECETAS)
async function init() {
  $("#app").innerHTML = skeletonCatalog();
  try {
    FICHAS = await conMinimo(loadRecetas(), 600);
    route();
  } catch (err) {
    $("#app").innerHTML = errorBox("No se pudieron cargar las recetas desde Google Sheets. Verifica tu conexión o publicación CSV.", "sk-retry");
    $("#sk-retry").addEventListener("click", init);
  }
}
init();