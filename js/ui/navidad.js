// Motor visual Navidad Industrial: nieve en Canvas 60fps, luces LED, trineo con renos y muñeco de nieve
let snowCanvas = null;
let rafId = null;
let flakes = [];
let observer = null;
let active = false;

const reducedMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function buildDecorations() {
  const topbar = document.querySelector(".topbar");
  const brand = document.querySelector(".brand");

  // 1) Gorro de Santa sobre el logo industrial
  if (brand && !brand.querySelector(".xmas-hat")) {
    const hat = document.createElement("div");
    hat.className = "xmas-hat";
    hat.setAttribute("aria-hidden", "true");
    hat.innerHTML = `
      <svg viewBox="0 0 64 54" fill="none">
        <path d="M12 36C14 17 30 7 49 12C54 13 58 17 59 22C54 20 49 21 47 25C43 21 31 23 26 36H12Z" fill="#C81E1E"/>
        <circle cx="58" cy="23" r="5.5" fill="#F8FAFC"/>
        <rect x="8" y="33" width="34" height="8.5" rx="4.25" fill="#F8FAFC"/>
      </svg>`;
    brand.appendChild(hat);
  }

  // 2) Horizonte invernal con trineo y renos en la cabecera
  if (topbar && !topbar.querySelector(".xmas-sky")) {
    const sky = document.createElement("div");
    sky.className = "xmas-sky";
    sky.setAttribute("aria-hidden", "true");
    sky.innerHTML = `
      <svg viewBox="0 0 1200 34" preserveAspectRatio="xMidYMax slice">
        <g fill="#E5A91A" opacity="0.65">
          <circle cx="90" cy="8" r="1.2"/><circle cx="240" cy="12" r="1.5"/><circle cx="410" cy="6" r="1.1"/>
          <circle cx="590" cy="10" r="1.4"/><circle cx="780" cy="7" r="1.2"/><circle cx="960" cy="11" r="1.5"/>
          <circle cx="1110" cy="8" r="1.2"/>
        </g>
        <g class="xmas-sleigh-group" fill="#E5A91A">
          <!-- Trineo -->
          <path d="M14 23H44L49 16H45L42 20H21L18 14H12L14 23Z"/>
          <path d="M10 25.5H48C51 25.5 53 23.5 53 21.5" stroke="#E5A91A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <!-- Santa -->
          <circle cx="28" cy="13" r="3.2"/>
          <path d="M23 19C23 16 33 16 33 19" fill="#B91C1C"/>
          <!-- Riendas -->
          <path d="M44 17L118 16" stroke="#E5A91A" stroke-width="0.9" opacity="0.75"/>
          <!-- Reno 1 -->
          <g transform="translate(74,10)">
            <ellipse cx="10" cy="9" rx="6" ry="3.2"/>
            <circle cx="17" cy="5" r="2.3"/>
            <path d="M17 3L16 0M18 3L20 0" stroke="#E5A91A" stroke-width="1.1" stroke-linecap="round"/>
            <path d="M6 12L4 16M9 12L9 16M13 12L15 16" stroke="#E5A91A" stroke-width="1.3" stroke-linecap="round"/>
          </g>
          <!-- Reno 2 (Rodolfo con nariz roja) -->
          <g transform="translate(106,9)">
            <ellipse cx="10" cy="9" rx="6.2" ry="3.3"/>
            <circle cx="17" cy="5" r="2.4"/>
            <circle cx="19.8" cy="5.2" r="1.3" fill="#FF3B3B"/>
            <path d="M17 3L16 0M18 3L20 0" stroke="#E5A91A" stroke-width="1.1" stroke-linecap="round"/>
            <path d="M6 12L4 16M9 12L9 16M13 12L15 16" stroke="#E5A91A" stroke-width="1.3" stroke-linecap="round"/>
          </g>
        </g>
        <!-- Silueta sutil de pinos nevados -->
        <path d="M0 34L18 22L36 34ZM28 34L44 24L60 34ZM1120 34L1138 21L1156 34ZM1148 34L1168 23L1188 34Z" fill="#174634"/>
      </svg>`;
    topbar.appendChild(sky);
  }

  // 3) Guirnalda de luces LED colgantes
  if (topbar && !topbar.querySelector(".xmas-lights")) {
    const lights = document.createElement("div");
    lights.className = "xmas-lights";
    lights.setAttribute("aria-hidden", "true");
    const count = window.innerWidth < 640 ? 12 : 22;
    const bulbs = Array.from({ length: count }, (_, i) => {
      const cls = `c${(i % 4) + 1}`;
      return `<div class="xmas-bulb-wrap"><span class="xmas-socket"></span><span class="xmas-bulb ${cls}"></span></div>`;
    }).join("");
    lights.innerHTML = `<div class="xmas-lights-row">${bulbs}</div>`;
    topbar.appendChild(lights);
  }
}

function removeDecorations() {
  document.querySelectorAll(".xmas-hat, .xmas-sky, .xmas-lights, .xmas-snowman").forEach((el) => el.remove());
}

function injectSnowmanInFoot() {
  if (!active) return;
  const foot = document.querySelector(".foot");
  if (!foot || foot.querySelector(".xmas-snowman")) return;

  const box = document.createElement("div");
  box.className = "xmas-snowman";
  box.setAttribute("data-no-export", "true");
  box.setAttribute("aria-hidden", "true");
  box.innerHTML = `
    <svg viewBox="0 0 120 140" fill="none">
      <!-- Sombra en nieve -->
      <ellipse cx="60" cy="131" rx="44" ry="6" fill="#C1D1C9"/>
      <!-- Cuerpo -->
      <circle cx="60" cy="102" r="27" fill="#FFFFFF" stroke="#133827" stroke-width="2.5"/>
      <circle cx="60" cy="64" r="20" fill="#FFFFFF" stroke="#133827" stroke-width="2.5"/>
      <!-- Botones -->
      <circle cx="60" cy="95" r="2.6" fill="#133827"/>
      <circle cx="60" cy="106" r="2.6" fill="#133827"/>
      <!-- Brazos de rama -->
      <path d="M40 92L18 78M24 82L19 73M24 82L15 84" stroke="#5C3A21" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M80 92L102 78M96 82L101 73M96 82L105 84" stroke="#5C3A21" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Bufanda carmesí y oro -->
      <rect x="42" y="78" width="36" height="8" rx="4" fill="#B91C1C" stroke="#133827" stroke-width="2"/>
      <path d="M68 85L73 105L64 103L61 85Z" fill="#B91C1C" stroke="#133827" stroke-width="2"/>
      <line x1="63" y1="98" x2="71" y2="99" stroke="#E5A91A" stroke-width="2"/>
      <!-- Rostro -->
      <circle cx="53" cy="59" r="2.4" fill="#133827"/>
      <circle cx="67" cy="59" r="2.4" fill="#133827"/>
      <path d="M60 63L75 66L60 69Z" fill="#F97316" stroke="#133827" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M53 71Q60 76 67 71" stroke="#133827" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Sombrero de copa -->
      <rect x="37" y="42" width="46" height="5" rx="2.5" fill="#133827"/>
      <rect x="45" y="21" width="30" height="22" rx="2" fill="#133827"/>
      <rect x="45" y="37" width="30" height="4.5" fill="#B91C1C"/>
      <circle cx="71" cy="39" r="3" fill="#157A44"/>
      <circle cx="74" cy="38" r="1.8" fill="#E5A91A"/>
    </svg>`;
  foot.appendChild(box);
}

// --- Motor de nieve en Canvas ---
function initSnow() {
  if (snowCanvas) return;
  snowCanvas = document.createElement("canvas");
  snowCanvas.id = "xmas-snow";
  snowCanvas.setAttribute("data-no-export", "true");
  snowCanvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(snowCanvas);

  const ctx = snowCanvas.getContext("2d");
  const resize = () => {
    if (!snowCanvas) return;
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const total = window.innerWidth < 640 ? 42 : 75;
  flakes = Array.from({ length: total }, () => ({
    x: Math.random() * snowCanvas.width,
    y: Math.random() * snowCanvas.height,
    r: 1.4 + Math.random() * 3.1,
    vy: 0.55 + Math.random() * 1.15,
    vx: (Math.random() - 0.5) * 0.4,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.45 + Math.random() * 0.5
  }));

  const step = () => {
    if (!active || !snowCanvas) return;
    if (document.hidden) {
      rafId = requestAnimationFrame(step);
      return;
    }

    const w = snowCanvas.width;
    const h = snowCanvas.height;
    ctx.clearRect(0, 0, w, h);

    for (const f of flakes) {
      if (!reducedMotion()) {
        f.phase += 0.015;
        f.y += f.vy;
        f.x += f.vx + Math.sin(f.phase) * 0.35;
        if (f.y > h + 6) {
          f.y = -6;
          f.x = Math.random() * w;
        }
        if (f.x > w + 6) f.x = -6;
        if (f.x < -6) f.x = w + 6;
      }

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
      ctx.shadowColor = "rgba(12, 36, 27, 0.18)";
      ctx.shadowBlur = 3;
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
}

function stopSnow() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (snowCanvas) {
    snowCanvas.remove();
    snowCanvas = null;
  }
  flakes = [];
}

export function syncNavidadTheme(isNavidad) {
  active = Boolean(isNavidad);
  if (active) {
    buildDecorations();
    injectSnowmanInFoot();
    initSnow();
    if (!observer) {
      const app = document.getElementById("app");
      if (app) {
        observer = new MutationObserver(() => injectSnowmanInFoot());
        observer.observe(app, { childList: true, subtree: true });
      }
    }
  } else {
    stopSnow();
    removeDecorations();
  }
}