// URL principal del catálogo (hoja RECETAS)
export const URL_RECETAS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTehGw7Jj9XknMHf3I0UApujodM4QsUFFNAo6tZ8LuBgdVIcmYOhdI_2mgsC7NAoiLAU7ZK9Jf_1kY/pub?gid=0&single=true&output=csv";

// Registro de hojas por HMI (se descargan SOLO cuando alguien abre una ficha de esa máquina)
// La clave (izquierda) debe coincidir en minúsculas con tu columna "layout" de RECETAS
export const HMI_URLS = {
  "qcm-75-1": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTehGw7Jj9XknMHf3I0UApujodM4QsUFFNAo6tZ8LuBgdVIcmYOhdI_2mgsC7NAoiLAU7ZK9Jf_1kY/pub?gid=1&single=true&output=csv",
  "qcm-75":   "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTehGw7Jj9XknMHf3I0UApujodM4QsUFFNAo6tZ8LuBgdVIcmYOhdI_2mgsC7NAoiLAU7ZK9Jf_1kY/pub?gid=1304841054&single=true&output=csv",
  "bekum":    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTehGw7Jj9XknMHf3I0UApujodM4QsUFFNAo6tZ8LuBgdVIcmYOhdI_2mgsC7NAoiLAU7ZK9Jf_1kY/pub?gid=2&single=true&output=csv"
};

// Dirección pública en GitHub Pages para generar los códigos QR
export const SHARE_BASE = window.location.protocol.startsWith("http")
  ? window.location.origin + window.location.pathname
  : "https://jsurezbustillos2509.github.io/Fichas-soplado/";

// Configuración para agregar nuevos SKUs desde la app
export const URL_GUARDAR_SKU = "https://script.google.com/macros/s/AKfycbw-q-WLbMF_1h5eUpzyeSz1YD1iMAW7z1t-d9oKHiVyEzbnXLTEyxRsp6eTsgRw12qC/exec";
export const PIN_ADMIN = "1234"; // Debe coincidir con PIN_ADMIN en tu Apps Script
export const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/jsurezbustillos2509/Fichas-soplado/main/";