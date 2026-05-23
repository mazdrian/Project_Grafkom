// static/js/modules/canvas.js
// Pengelolaan kanvas: setup, gambar ulang, preview

import { state } from './state.js';

export let mainCanvas, overlayCanvas, mctx, octx;

export function initCanvas() {
  mainCanvas    = document.getElementById('mainCanvas');
  overlayCanvas = document.getElementById('overlayCanvas');
  mctx          = mainCanvas.getContext('2d');
  octx          = overlayCanvas.getContext('2d');
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);
}

export function resizeCanvases() {
  const wrap = document.querySelector('.canvas-wrap');
  if (!wrap) return;
  const W = wrap.clientWidth;
  const H = wrap.clientHeight;
  [mainCanvas, overlayCanvas].forEach(c => {
    c.width  = W;
    c.height = H;
  });
  redrawAll();
}

// ── Gaya konteks ──────────────────────────────────────────────
function applyStyle(ctx, color, size, opacity, lineStyle) {
  ctx.globalAlpha = opacity;
  ctx.fillStyle   = color;
  ctx.strokeStyle = color;
  ctx.lineWidth   = size;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  _setDash(ctx, lineStyle, size);
}

function _setDash(ctx, lineStyle, size) {
  const s = size || 2;
  switch (lineStyle) {
    case 'dashed' : ctx.setLineDash([s * 4, s * 2]);               break;
    case 'dotted' : ctx.setLineDash([s, s * 2]);                   break;
    case 'dashdot': ctx.setLineDash([s * 4, s * 2, s, s * 2]);     break;
    default       : ctx.setLineDash([]);
  }
}

function resetCtx(ctx) {
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

// ── Gambar titik-titik ────────────────────────────────────────
export function drawPoints(ctx, points, color, size, opacity, lineStyle) {
  applyStyle(ctx, color, size, opacity, lineStyle);
  const r = Math.max(size / 2, 1);
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  resetCtx(ctx);
}

// ── Gambar ulang semua objek ───────────────────────────────────
export function redrawAll() {
  if (!mctx) return;
  mctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  // apply pan transform for viewport
  mctx.save();
  mctx.setTransform(1, 0, 0, 1, 0, 0);
  mctx.translate(state.panX, state.panY);
  // draw grid under objects
  if (state.showGrid) drawGrid(mctx, state.gridSize, state.gridColor);
  state.objects.forEach(obj => {
    drawPoints(mctx, obj.points, obj.color, obj.size, obj.opacity, obj.lineStyle);
  });
  mctx.restore();
}

// ── Grid drawing ───────────────────────────────────────────
export function drawGrid(ctx, gridSize = 25, color = 'rgba(255,255,255,0.04)') {
  if (!ctx || gridSize <= 0) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  // grid is drawn in world coordinates; compute visible bounds for efficiency
  const startX = -ctx.getTransform().e;
  const startY = -ctx.getTransform().f;
  const endX = startX + W;
  const endY = startY + H;
  const sx = Math.floor(startX / gridSize) * gridSize;
  const sy = Math.floor(startY / gridSize) * gridSize;
  for (let x = sx; x <= endX; x += gridSize) {
    ctx.moveTo(x + 0.5, startY);
    ctx.lineTo(x + 0.5, endY);
  }
  for (let y = sy; y <= endY; y += gridSize) {
    ctx.moveTo(startX, y + 0.5);
    ctx.lineTo(endX, y + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

// ── Commit objek ke state ─────────────────────────────────────
export function commitObject(type, points, extra = {}) {
  const obj = {
    type,
    points: points.map(p => [p[0], p[1]]),
    color    : state.color,
    size     : state.size,
    opacity  : state.opacity,
    lineStyle: state.lineStyle,
    ...extra,
  };
  state.objects.push(obj);
  state.totalPoints += points.length;
  redrawAll();
  return obj;
}

// ── Preview (overlay) ─────────────────────────────────────────
export function clearOverlay() {
  if (!octx) return;
  octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

export function previewLine(x0, y0, x1, y1) {
  clearOverlay();
  octx.save();
  octx.translate(state.panX, state.panY);
  applyStyle(octx, state.color, state.size, state.opacity * 0.5, state.lineStyle);
  octx.beginPath();
  octx.moveTo(x0, y0);
  octx.lineTo(x1, y1);
  octx.stroke();
  octx.restore();
  resetCtx(octx);
}

export function previewCircle(cx, cy, r) {
  clearOverlay();
  octx.save();
  octx.translate(state.panX, state.panY);
  applyStyle(octx, state.color, state.size, state.opacity * 0.5, state.lineStyle);
  octx.beginPath();
  octx.arc(cx, cy, r, 0, Math.PI * 2);
  octx.stroke();
  octx.restore();
  resetCtx(octx);
}

export function previewEllipse(cx, cy, rx, ry) {
  clearOverlay();
  octx.save();
  octx.translate(state.panX, state.panY);
  applyStyle(octx, state.color, state.size, state.opacity * 0.5, state.lineStyle);
  octx.beginPath();
  octx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
  octx.stroke();
  octx.restore();
  resetCtx(octx);
}

export function previewPolygon(points) {
  clearOverlay();
  if (points.length === 0) return;
  octx.save();
  octx.translate(state.panX, state.panY);
  applyStyle(octx, state.color, 1.5, 0.5, 'dashed');
  octx.beginPath();
  points.forEach(([x, y], i) => i === 0 ? octx.moveTo(x, y) : octx.lineTo(x, y));
  octx.stroke();
  points.forEach(([x, y]) => {
    octx.beginPath();
    octx.arc(x, y, 4, 0, Math.PI * 2);
    octx.fillStyle = state.color;
    octx.globalAlpha = 0.8;
    octx.fill();
  });
  octx.restore();
  resetCtx(octx);
}

// ── Koordinat dari event mouse ────────────────────────────────
export function getXY(e) {
  const rect = overlayCanvas.getBoundingClientRect();
  // Map screen coordinates to world coordinates (account for pan)
  const rawX = e.clientX - rect.left;
  const rawY = e.clientY - rect.top;
  return [
    Math.round(rawX - state.panX),
    Math.round(rawY - state.panY),
  ];
}
