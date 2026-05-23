// static/js/modules/tools.js
// PPT 03, 04, 05 — Logika setiap tool gambar

import { state } from './state.js';
import {
  drawPoints, commitObject,
  clearOverlay, previewLine, previewCircle,
  previewEllipse, previewPolygon, getXY,
  mainCanvas, overlayCanvas, redrawAll,
} from './canvas.js';
import {
  drawLine, drawCircle, drawEllipse,
  fillScanline, fillFlood,
} from './api.js';
import { updateUI, setAlgoInfo, showToast } from './ui.js';

// ── Titik ─────────────────────────────────────────────────────
export function doPoint(x, y) {
  commitObject('point', [[x, y]]);
  updateUI();
}

// ── Garis (PPT 03) ────────────────────────────────────────────
export async function doLine(x0, y0, x1, y1) {
  const data = await drawLine(x0, y0, x1, y1, state.algo);
  commitObject('line', data.points);
  setAlgoInfo(`${state.algo.toUpperCase()}: ${data.count} titik digambar`);
  updateUI();
}

// ── Lingkaran (PPT 04) ────────────────────────────────────────
export async function doCircle(cx, cy, r) {
  if (r < 2) return;
  const data = await drawCircle(cx, cy, r);
  commitObject('circle', data.points);
  setAlgoInfo(`Midpoint Circle — r=${r}, ${data.count} titik`);
  updateUI();
}

// ── Elips (PPT 04) ────────────────────────────────────────────
export async function doEllipse(cx, cy, rx, ry) {
  if (Math.abs(rx) < 2 || Math.abs(ry) < 2) return;
  const data = await drawEllipse(cx, cy, Math.abs(rx), Math.abs(ry));
  commitObject('ellipse', data.points);
  setAlgoInfo(`Midpoint Ellipse — rx=${Math.abs(rx)}, ry=${Math.abs(ry)}, ${data.count} titik`);
  updateUI();
}

// ── Polygon / Scanline Fill (PPT 05) ─────────────────────────
export async function closePoly() {
  if (state.polyPoints.length < 3) {
    showToast('Minimal 3 titik untuk polygon!', 'warning');
    return;
  }
  const data = await fillScanline(state.polyPoints);
  commitObject('polygon', data.points);
  setAlgoInfo(`Scanline Fill — ${state.polyPoints.length} vertex, ${data.count} titik`);
  state.polyPoints = [];
  updatePolyControls();
  clearOverlay();
  updateUI();
}

export function cancelPoly() {
  state.polyPoints = [];
  clearOverlay();
  updatePolyControls();
}

export function addPolyPoint(x, y) {
  state.polyPoints.push([x, y]);
  previewPolygon(state.polyPoints);
  updatePolyControls();
}

// ── Flood Fill (PPT 05) ───────────────────────────────────────
export async function doFloodFill(x, y) {
  // Kumpulkan semua titik boundary dari objek yang ada
  const boundary = new Set();
  state.objects.forEach(obj => {
    obj.points.forEach(([px, py]) => boundary.add(`${px},${py}`));
  });
  const boundaryArr = [...boundary].map(s => {
    const [bx, by] = s.split(',').map(Number);
    return [bx, by];
  });

  const { width, height } = mainCanvas;
  const data = await fillFlood(x, y, boundaryArr, width, height);
  if (data.count === 0) {
    showToast('Flood fill gagal — klik di dalam area tertutup', 'warning');
    return;
  }
  commitObject('flood', data.points);
  setAlgoInfo(`Flood Fill — seed(${x},${y}), ${data.count} titik`);
  updateUI();
}

// ── UI polygon controls ────────────────────────────────────────
export function updatePolyControls() {
  const ctrl = document.getElementById('polyControls');
  if (!ctrl) return;
  const n = state.polyPoints.length;
  ctrl.style.display = n > 0 ? 'flex' : 'none';
  const counter = document.getElementById('polyCount');
  if (counter) counter.textContent = `${n} titik`;
}

// ── Mouse events (dipasang di editor.js) ──────────────────────
export function setupMouseEvents() {
  overlayCanvas.addEventListener('mousemove', onMouseMove);
  overlayCanvas.addEventListener('mousedown', onMouseDown);
  overlayCanvas.addEventListener('mouseup', onMouseUp);
  overlayCanvas.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('keydown', onKeyDown);
}


// Panning: middle mouse drag to move viewport
function startPan(e) {
  e.preventDefault();
  state.panning = true;
  state.panStartMouse = [e.clientX, e.clientY];
  state.panStartOffset = [state.panX, state.panY];
}

function updatePan(e) {
  if (!state.panning) return;
  const dx = e.clientX - state.panStartMouse[0];
  const dy = e.clientY - state.panStartMouse[1];
  state.panX = state.panStartOffset[0] + dx;
  state.panY = state.panStartOffset[1] + dy;
  // redraw canvases
  redrawAll();
}

function endPan(e) {
  if (!state.panning) return;
  state.panning = false;
}

function onMouseMove(e) {
  // if panning, update pan and skip drawing previews
  if (state.panning) {
    updatePan(e);
    return;
  }
  const [x, y] = getXY(e);
  const coord = document.getElementById('statusCoord');
  if (coord) coord.textContent = `x: ${x}  y: ${y}`;

  if (!state.drawing) return;
  if (state.tool === 'line') {
    previewLine(state.startX, state.startY, x, y);
  } else if (state.tool === 'circle') {
    const r = Math.round(Math.hypot(x - state.startX, y - state.startY));
    previewCircle(state.startX, state.startY, r);
  } else if (state.tool === 'ellipse') {
    previewEllipse(state.startX, state.startY, x - state.startX, y - state.startY);
  }
}

async function onMouseDown(e) {
  // middle button => start panning
  if (e.button === 1) { startPan(e); return; }

  const [x, y] = getXY(e);
  if (state.tool === 'polygon') { addPolyPoint(x, y); return; }
  if (state.tool === 'flood')   { await doFloodFill(x, y); return; }

  state.drawing = true;
  state.startX  = x;
  state.startY  = y;
  if (state.tool === 'point') doPoint(x, y);
}

async function onMouseUp(e) {
  // middle button up => end panning
  if (e.button === 1) { endPan(e); return; }

  if (!state.drawing) return;
  state.drawing = false;
  clearOverlay();
  const [x, y] = getXY(e);

  if (state.tool === 'line') {
    await doLine(state.startX, state.startY, x, y);
  } else if (state.tool === 'circle') {
    const r = Math.round(Math.hypot(x - state.startX, y - state.startY));
    await doCircle(state.startX, state.startY, r);
  } else if (state.tool === 'ellipse') {
    await doEllipse(state.startX, state.startY, x - state.startX, y - state.startY);
  }
}

function onMouseLeave() {
  const coord = document.getElementById('statusCoord');
  if (coord) coord.textContent = 'x: —  y: —';
  if (state.drawing && state.tool !== 'polygon') clearOverlay();
  // stop panning when leaving canvas
  if (state.panning) state.panning = false;
}

function onKeyDown(e) {
  if (state.tool === 'polygon') {
    if (e.key === 'Enter')  closePoly();
    if (e.key === 'Escape') cancelPoly();
  }
}
