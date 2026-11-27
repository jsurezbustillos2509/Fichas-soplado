// URL principal del catálogo (hoja RECETAS)
export const URL_RECETAS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTehGw7Jj9XknMHf3I0UApujodM4QsUFFNAo6tZ8LuBgdVIcmYOhdI_2mgsC7NAoiLAU7ZK9Jf_1kY/pub?gid=0&single=true&output=csv";

// Registro de hojas por HMI (se descargan SOLO cuando alguien abre una ficha de esa máquina)
// La clave (izquierda) debe coincidir en minúsculas con tu columna "layout" de RECETAS
export const HMI_URLS = {
  "qcm-75-1": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTehGw7Jj9XknMHf3I0UApujodM4QsUFFNAo6tZ8LuBgdVIcmYOhdI_2mgsC7NAoiLAU7ZK9Jf_1kY/pub?gid=1&single=true&output=csv",
  "qcm-75":   "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTehGw7Jj9XknMHf3I0UApujodM4QsUFFNAo6tZ8LuBgdVIcmYOhdI_2mgsC7NAoiLAU7ZK9Jf_1kY/pub?gid=1304841054&single=true&output=csv",
  "bekum":    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTehGw7Jj9XknMHf3I0UApujodM4QsUFFNAo6tZ8LuBgdVIcmYOhdI_2mgsC7NAoiLAU7ZK9Jf_1kY/pub?gid=2&single=true&output=csv",
  "pet-1":    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTehGw7Jj9XknMHf3I0UApujodM4QsUFFNAo6tZ8LuBgdVIcmYOhdI_2mgsC7NAoiLAU7ZK9Jf_1kY/pub?gid=1677897756&single=true&output=csv"
};

// Dirección pública en GitHub Pages para generar los códigos QR
export const SHARE_BASE = window.location.protocol.startsWith("http")
  ? window.location.origin + window.location.pathname
  : "https://jsurezbustillos2509.github.io/Fichas-soplado/";

// Configuración para agregar nuevos SKUs desde la app
export const URL_GUARDAR_SKU = "https://script.google.com/macros/s/AKfycbz0VYIAom5IgEOcdjCO597TgEpO3qngbVbw9fYfx9ywliRRbdVBXNf5s3oS4FuBHq4/exec";
export const PIN_ADMIN = "1402"; // Debe coincidir con PIN_ADMIN en tu Apps Script
export const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/jsurezbustillos2509/Fichas-soplado/main/";

// Categorías de maquinaria (Pantalla principal)
export const CATEGORIAS = [
  {
    id: "sopladora",
    titulo: "SOPLADORA",
    subtitulo: "Extrusión-soplado PEAD (QCM-75, QCM-75-1, BEKUM)",
    color: "#2E7D5B",
    layouts: ["qcm-75-1", "qcm-75", "bekum"]
  },
  {
    id: "pet",
    titulo: "PET",
    subtitulo: "Sopladora PET semiautomática · 1 molde × 2 cavidades",
    color: "#3B82B8",
    layouts: ["pet-1"]
  },
  {
    id: "inyeccion",
    titulo: "INYECCIÓN",
    subtitulo: "Inyectora hidráulica compacta (tipo ZSJ-388)",
    color: "#B83232",
    layouts: []
  },
  {
    id: "extrusora",
    titulo: "EXTRUSORA",
    subtitulo: "Línea de extrusión simple continua",
    color: "#C88A1E",
    layouts: []
  }
];

export function getCategoriaByLayout(layout) {
  const key = String(layout || "").trim().toLowerCase();
  return CATEGORIAS.find((c) => c.layouts.includes(key)) || CATEGORIAS[0];
}