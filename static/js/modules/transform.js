// static/js/modules/transform.js
// PPT 07, 08, 09 — Semua transformasi 2D

import { state } from './state.js';
import { redrawAll } from './canvas.js';
import { transformPoints } from './api.js';
import { showToast, updateUI } from './ui.js';

// ── Terapkan transformasi ke semua objek ──────────────────────
export async function applyTransform(type, params) {
  if (state.objects.length === 0) {
    showToast('Tidak ada objek di kanvas!', 'warning');
    return;
  }

  // Simpan snapshot untuk undo
  state.transformHistory.push(JSON.parse(JSON.stringify(state.objects)));

  // Hitung bounding box center
  const allPts = state.objects.flatMap(o => o.points);
  const xs = allPts.map(p => p[0]);
  const ys = allPts.map(p => p[1]);
  const cx = Math.round((Math.min(...xs) + Math.max(...xs)) / 2);
  const cy = Math.round((Math.min(...ys) + Math.max(...ys)) / 2);

  const fullParams = { ...params, cx, cy };
  let lastMatrix = null;

  for (let i = 0; i < state.objects.length; i++) {
    const data = await transformPoints(state.objects[i].points, type, fullParams);
    state.objects[i].points = data.points;
    if (i === state.objects.length - 1) lastMatrix = data.matrix;
  }

  if (lastMatrix) displayMatrix(lastMatrix, type);
  redrawAll();
  updateUI();
}

// ── Undo transformasi ─────────────────────────────────────────
export function undoTransform() {
  if (state.transformHistory.length === 0) {
    showToast('Tidak ada riwayat transformasi!', 'info');
    return;
  }
  state.objects = state.transformHistory.pop();
  redrawAll();
  updateUI();
  if (state.transformHistory.length === 0) hideMatrix();
}

// ── Tampilkan matriks ─────────────────────────────────────────
function displayMatrix(matrix, type) {
  const bar  = document.getElementById('matrixBar');
  const disp = document.getElementById('matrixDisplay');
  const lbl  = document.getElementById('matrixLabel');
  if (!bar || !disp) return;

  const labels = {
    translate    : 'Matriks Translasi',
    rotate       : 'Matriks Rotasi',
    scale        : 'Matriks Skala',
    reflect_x    : 'Matriks Refleksi ‖ Sumbu X',
    reflect_y    : 'Matriks Refleksi ‖ Sumbu Y',
    reflect_xy   : 'Matriks Refleksi ‖ y = x',
    reflect_neg_xy: 'Matriks Refleksi ‖ y = -x',
    reflect_origin: 'Matriks Refleksi ‖ Origin',
    shear_x      : 'Matriks Shear X',
    shear_y      : 'Matriks Shear Y',
    composite    : 'Matriks Komposit',
  };
  if (lbl) lbl.textContent = labels[type] || 'Matriks Transformasi';

  disp.innerHTML = matrix.map(row =>
    `<div class="flex gap-1">
      ${row.map(v =>
        `<span class="matrix-cell">${v.toFixed(3)}</span>`
      ).join('')}
    </div>`
  ).join('');

  bar.classList.remove('hidden');
}

export function hideMatrix() {
  const bar = document.getElementById('matrixBar');
  if (bar) bar.classList.add('hidden');
}

// ── Setup event listener tombol-tombol transformasi ──────────
export function setupTransformUI() {
  // Tab transformasi
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeTransformTab = tab.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach(t => {
        t.classList.remove('tab-active');
        t.classList.add('tab-inactive');
      });
      tab.classList.add('tab-active');
      tab.classList.remove('tab-inactive');
      document.querySelectorAll('[data-tab-content]').forEach(c => c.classList.add('hidden'));
      const target = document.getElementById(`tab-${state.activeTransformTab}`);
      if (target) target.classList.remove('hidden');
    });
  });

  // Tombol Apply Transform
  document.getElementById('btnTransform')?.addEventListener('click', () => {
    const t = state.activeTransformTab;
    let params = {};

    if (t === 'translate') {
      params.tx = parseFloat(document.getElementById('tx')?.value) || 0;
      params.ty = parseFloat(document.getElementById('ty')?.value) || 0;
    } else if (t === 'rotate') {
      params.angle = parseFloat(document.getElementById('angle')?.value) || 0;
    } else if (t === 'scale') {
      params.sx = parseFloat(document.getElementById('sx')?.value) || 1;
      params.sy = parseFloat(document.getElementById('sy')?.value) || 1;
    } else if (t === 'reflect') {
      params.axis = document.querySelector('input[name="reflectAxis"]:checked')?.value || 'x';
      return applyTransform('reflect_' + params.axis, params);
    } else if (t === 'shear') {
      const shearType = document.querySelector('input[name="shearType"]:checked')?.value || 'x';
      if (shearType === 'x') {
        params.shx = parseFloat(document.getElementById('shx')?.value) || 0;
        return applyTransform('shear_x', params);
      } else {
        params.shy = parseFloat(document.getElementById('shy')?.value) || 0;
        return applyTransform('shear_y', params);
      }
    } else if (t === 'composite') {
      params.use_translate = document.getElementById('comp_translate')?.checked;
      params.use_rotate    = document.getElementById('comp_rotate')?.checked;
      params.use_scale     = document.getElementById('comp_scale')?.checked;
      params.tx    = parseFloat(document.getElementById('comp_tx')?.value) || 0;
      params.ty    = parseFloat(document.getElementById('comp_ty')?.value) || 0;
      params.angle = parseFloat(document.getElementById('comp_angle')?.value) || 0;
      params.sx    = parseFloat(document.getElementById('comp_sx')?.value) || 1;
      params.sy    = parseFloat(document.getElementById('comp_sy')?.value) || 1;
    }

    applyTransform(t, params);
  });

  // Undo
  document.getElementById('btnUndoTransform')?.addEventListener('click', undoTransform);
}
