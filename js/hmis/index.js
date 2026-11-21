import { renderQCM } from "./qcm.js";
import { renderQCM75 } from "./qcm75.js";
import { renderBekum } from "./bekum.js";

const RENDERERS = {
  "qcm": renderQCM,
  "qcm-75": renderQCM75,
  "bekum": renderBekum
};

export function renderHmiBody(ficha, hmiRow) {
  const fn = RENDERERS[ficha.layout] || renderQCM;
  return fn(ficha, hmiRow || {});
}