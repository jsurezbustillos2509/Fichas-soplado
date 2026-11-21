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

// 1) Carga únicamente la hoja RECETAS para mostrar el catálogo al instante
export async function loadRecetas() {
  if (recetasCache) return recetasCache;
  const rows = await fetchCsv(URL_RECETAS);

  recetasCache = rows
    .filter((r) => r.id && String(r.id).trim() !== "")
    .map((r) => ({
      id: String(r.id || "").trim(),
      layout: String(r.layout || "qcm").trim().toLowerCase(),
      sku: String(r.sku || "").trim(),
      desc: String(r.desc || "").trim(),
      maquina: String(r.maquina || "").trim(),
      hmi: String(r.hmi || "").trim(),
      ciclo: toNum(r.ciclo, 1),
      cicloTipo: String(r.cicloTipo || "Ciclo real").trim(),
      moldes: toNum(r.moldes, 0),
      cavidades: toNum(r.cavidades, 0),
      pesoG: toNum(r.pesoG, 0),
      bolsas: toNum(r.bolsas, 0),
      bolsasPeriodo: strOrNull(r.bolsasPeriodo),
      envasesPorBolsa: toNum(r.envases_por_bolsa, 0),
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
      // Datos del Molinero (Preparada)
      preparada: {
        mp1: {
          nombre: strOrNull(r.mp1_nombre),
          codigo: strOrNull(r.mp1_codigo),
          kg: toNum(r.mp1_kg, 0)
        },
        mp2: {
          nombre: strOrNull(r.mp2_nombre),
          codigo: strOrNull(r.mp2_codigo),
          kg: toNum(r.mp2_kg, 0)
        },
        master: {
          nombre: strOrNull(r.master_nombre),
          codigo: strOrNull(r.master_codigo),
          gr: toNum(r.master_gr, 0)
        },
        molido: {
          minKg: numOrNull(r.molido_min_kg),
          maxKg: numOrNull(r.molido_max_kg)
        }
      }
    }));

  return recetasCache;
}

// 2) Carga bajo demanda la hoja específica de una HMI y devuelve la fila de ese ID
export async function loadHmiRow(layout, id) {
  const key = String(layout || "qcm").toLowerCase();
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