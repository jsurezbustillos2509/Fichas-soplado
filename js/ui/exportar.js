import { $, esc, toast } from "./bloques.js";

export function closeOverlay() {
  const b = $("#ovbox");
  if (!b) return;
  const im = b.querySelector("img");
  if (im && im.dataset.u) {
    try { URL.revokeObjectURL(im.dataset.u); } catch (e) {}
  }
  b.innerHTML = "";
}

function showOverlay(blob, name) {
  const u = URL.createObjectURL(blob);
  $("#ovbox").innerHTML = `
    <div class="ov" id="ov" role="dialog" aria-modal="true" aria-label="Imagen de la ficha">
      <div class="ovin">
        <p>Mantén presionada la imagen para guardarla o compartirla por WhatsApp.</p>
        <img src="${u}" data-u="${u}" alt="Ficha lista para compartir">
        <div class="ovb">
          <a class="btn solid" href="${u}" download="${esc(name)}">Descargar</a>
          <button class="btn" id="ovx" type="button">Cerrar</button>
        </div>
      </div>
    </div>`;
  $("#ovx").addEventListener("click", closeOverlay);
  $("#ov").addEventListener("click", (e) => { if (e.target.id === "ov") closeOverlay(); });
}

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeOverlay(); });

export async function saveImage(f, roleKey = "todo") {
  const btn = $("#img");
  const node = $("#sheet");
  if (!btn || !node || !window.htmlToImage) {
    toast("No se pudo iniciar el exportador de imagen");
    return;
  }

  btn.disabled = true;
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--panel").trim() || "#F3F5F6";

    const blob = await window.htmlToImage.toBlob(node, {
      backgroundColor: bg,
      pixelRatio: 2,
      cacheBust: true,
      filter: (el) => !(el.dataset && el.dataset.noExport === "true")
    });

    if (!blob) throw new Error("sin imagen");
    const name = `ficha-${f.sku.replace(/\./g, "-")}-${f.maquina}-${roleKey}.png`;
    showOverlay(blob, name);
  } catch (e) {
    toast("No se pudo generar la imagen. Inténtalo otra vez");
  } finally {
    btn.disabled = false;
  }
}