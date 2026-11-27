import { URL_RECETAS, HMI_URLS } from "./config.js";

// Conversores seguros de texto/número/booleano
export const toNum = (v, def = 0) => {
  if (v === null || v === undefined || String(v).trim() === "") return def;
  const parsed = Number(String(v).trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : def;
};

export const numOrNull = (v) => {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const parsed = Number(String(v).trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

export const strOrNull = (v) => {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  return String(v).trim();
};

export const toBool = (v) => String(v || "").trim().toUpperCase() === "TRUE";

// Descarga un CSV usando PapaParse
function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    window.Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data || []),
      error: (err) => reject(err)
    });
  });
}

// Caché en memoria (evita descargar dos veces la misma hoja)
let recetasCache = null;
const hmiCache = new Map();
const localHmiRows = new Map();

function mapRecetaRow(r) {
  return {
    id: String(r.id || "").trim(),
    layout: String(r.layout || "").trim().toLowerCase(),
    sku: String(r.sku || "").trim(),
    desc: String(r.desc || "").trim(),
    maquina: String(r.maquina || "").trim(),
    hmi: String(r.hmi || "").trim(),
    ciclo: numOrNull(r.ciclo),
    cicloTipo: String(r.cicloTipo || "Ciclo real").trim(),
    moldes: numOrNull(r.moldes),
    cavidades: numOrNull(r.cavidades),
    pesoG: numOrNull(r.pesoG),
    bolsas: numOrNull(r.bolsas),
    bolsasPeriodo: strOrNull(r.bolsasPeriodo),
    envasesPorBolsa: numOrNull(r.envases_por_bolsa),
    foto: String(r.foto || "").trim(),
    fecha: String(r.fecha || "").trim(),
    version: String(r.version || "1.0").trim(),
    unidad: {
      factor: toNum(r.unidad_factor, 0.1),
      confirmada: toBool(r.unidad_confirmada)
    },
    leyenda: r.leyenda
      ? String(r.leyenda).split("|").map((t) => t.trim()).filter(Boolean)
      : [],
    observaciones: strOrNull(r.observaciones),
    // Datos del Molinero (Preparada)
    preparada: {
      mp1: {
        nombre: strOrNull(r.mp1_nombre),
        codigo: strOrNull(r.mp1_codigo),
        kg: numOrNull(r.mp1_kg)
      },
      mp2: {
        nombre: strOrNull(r.mp2_nombre),
        codigo: strOrNull(r.mp2_codigo),
        kg: numOrNull(r.mp2_kg)
      },
      master: {
        nombre: strOrNull(r.master_nombre),
        codigo: strOrNull(r.master_codigo),
        gr: numOrNull(r.master_gr)
      },
      molido: {
        minKg: numOrNull(r.molido_min_kg),
        maxKg: numOrNull(r.molido_max_kg)
      }
    }
  };
}

// Detecta si a una ficha le faltan datos estándar en RECETAS
export function isFichaIncompleta(f) {
  const esPet = String(f.layout || "").trim().toLowerCase().startsWith("pet");
  return (
    !f.desc ||
    (!esPet && f.ciclo === null) ||
    f.moldes === null ||
    f.cavidades === null ||
    f.pesoG === null ||
    f.envasesPorBolsa === null ||
    !f.foto ||
    (!esPet && f.preparada?.mp1?.kg === null)
  );
}

// Inserta al instante una ficha recién guardada en memoria (sin esperar el caché CSV de Google)
export function addRecetaLocal(rawReceta, rawHmi) {
  const mapped = mapRecetaRow(rawReceta);
  if (recetasCache) {
    recetasCache.push(mapped);
  }
  if (rawHmi && mapped.id) {
    localHmiRows.set(mapped.id, rawHmi);
  }
  return mapped;
}

// Actualiza al instante una ficha editada en memoria
export function updateRecetaLocal(rawReceta, rawHmi) {
  const mapped = mapRecetaRow(rawReceta);
  if (recetasCache) {
    const idx = recetasCache.findIndex((x) => x.id === mapped.id);
    if (idx !== -1) recetasCache[idx] = mapped;
  }
  if (rawHmi && mapped.id) {
    localHmiRows.set(mapped.id, rawHmi);
  }
  return mapped;
}

// 1) Carga únicamente la hoja RECETAS para mostrar el catálogo al instante
export async function loadRecetas() {
  if (recetasCache) return recetasCache;
  const rows = await fetchCsv(URL_RECETAS);

  recetasCache = rows
    .filter((r) => r.id && String(r.id).trim() !== "")
    .map(mapRecetaRow);

  return recetasCache;
}

// 2) Carga bajo demanda la hoja específica de una HMI y devuelve la fila de ese ID
export async function loadHmiRow(layout, id) {
  if (localHmiRows.has(id)) return localHmiRows.get(id);

  const key = String(layout || "").trim().toLowerCase();
  const url = HMI_URLS[key];
  if (!url) return null;

  if (!hmiCache.has(key)) {
    const rows = await fetchCsv(url);
    const map = new Map(
      rows.filter((r) => r.id).map((r) => [String(r.id).trim(), r])
    );
    hmiCache.set(key, map);
  }
  return hmiCache.get(key).get(id) || {};
}