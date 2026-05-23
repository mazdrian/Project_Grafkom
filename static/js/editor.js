// static/js/editor.js
// Entry point — inisialisasi semua modul

import { initCanvas } from './modules/canvas.js';
import { setupMouseEvents, updatePolyControls } from './modules/tools.js';
import { setupTransformUI } from './modules/transform.js';
import {
  setupAttributes, setupToolButtons,
  setupControls, setupGrayscale,
  setupInsideOutsideTest, updateUI,
} from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  setupToolButtons();
  setupMouseEvents();
  setupAttributes();
  setupControls();
  setupGrayscale();
  setupTransformUI();
  setupInsideOutsideTest();
  updateUI();
  updatePolyControls();
});
