// static/js/modules/ui.js
// Helper UI: update status bar, toast, info panel

import { state } from './state.js';
import { computeGrayscale, insideOutsideTest } from './api.js';
import { mainCanvas, redrawAll } from './canvas.js';

const TOOL_LABELS = {
  point  : 'Titik',
  line   : 'Garis',
  circle : 'Lingkaran',
  ellipse: 'Elips',
  polygon: 'Polygon Fill',
  flood  : 'Flood Fill',
};

const HINTS = {
  point  : 'Klik pada kanvas untuk menempatkan titik',
  line   : 'Klik dan drag untuk menggambar garis',
  circle : 'Klik pusat, drag ke tepi untuk menggambar lingkaran',
  ellipse: 'Klik pusat, drag untuk menentukan rx dan ry elips',
  polygon: 'Klik titik-titik polygon — Enter untuk menutup, Esc untuk batal',
  flood  : 'Klik di dalam area tertutup untuk flood fill',
};

// ── Update status bar & info ───────────────────────────────────
export function updateUI() {
  setText('statusTool', `Tool: ${TOOL_LABELS[state.tool] || state.tool}`);
  setText('statusAlgo', state.tool === 'line' ? state.algo.toUpperCase() : '—');
  setText('infoObjects', `Objek: ${state.objects.length}`);
  setText('infoPoints',  `Titik: ${state.totalPoints.toLocaleString()}`);
  setText('hint', HINTS[state.tool] || '');
  const algoPanel = document.getElementById('algo-panel');
  if (algoPanel) {
    algoPanel.style.opacity = state.tool === 'line' ? '1' : '0.4';
    algoPanel.style.pointerEvents = state.tool === 'line' ? 'auto' : 'none';
  }
}

export function setAlgoInfo(text) {
  setText('infoAlgoInfo', text);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Toast notification ─────────────────────────────────────────
export function showToast(msg, type = 'info') {
  const colors = {
    info   : 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    error  : 'bg-red-50 text-red-700 border-red-200',
  };
  const toast = document.createElement('div');
  toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all duration-300 ${colors[type] || colors.info}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ── Setup atribut output primitif (PPT 06) ────────────────────
export function setupAttributes() {
  document.getElementById('colorPicker')?.addEventListener('input', e => {
    state.color = e.target.value;
    document.getElementById('colorHex').textContent = e.target.value.toUpperCase();
  });

  const sizeSlider = document.getElementById('sizeSlider');
  sizeSlider?.addEventListener('input', e => {
    state.size = parseInt(e.target.value);
    setText('sizeVal', e.target.value + 'px');
  });

  const opacitySlider = document.getElementById('opacitySlider');
  opacitySlider?.addEventListener('input', e => {
    state.opacity = parseInt(e.target.value) / 100;
    setText('opacityVal', e.target.value + '%');
  });

  document.getElementById('lineStyle')?.addEventListener('change', e => {
    state.lineStyle = e.target.value;
  });
}

// ── Setup tool buttons ─────────────────────────────────────────
export function setupToolButtons() {
  document.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Import cancelPoly secara lazy untuk hindari circular dep
      import('./tools.js').then(({ cancelPoly }) => cancelPoly());
      state.tool = btn.dataset.tool;
      document.querySelectorAll('[data-tool]').forEach(b => {
        b.classList.remove('tool-active');
        b.classList.add('tool-inactive');
      });
      btn.classList.remove('tool-inactive');
      btn.classList.add('tool-active');
      updateUI();
    });
  });

  // Algoritma garis
  document.querySelectorAll('input[name="algo"]').forEach(r => {
    r.addEventListener('change', () => { state.algo = r.value; updateUI(); });
  });
}

// ── Setup clear & export ───────────────────────────────────────
export function setupControls() {
  document.getElementById('btnClear')?.addEventListener('click', () => {
    state.objects = [];
    state.transformHistory = [];
    state.polyPoints = [];
    state.totalPoints = 0;
    if (mainCanvas) {
      const ctx = mainCanvas.getContext('2d');
      ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    }
    import('./canvas.js').then(({ clearOverlay }) => clearOverlay());
    import('./transform.js').then(({ hideMatrix }) => hideMatrix());
    document.getElementById('polyControls')?.style.setProperty('display', 'none');
    updateUI();
    setAlgoInfo('');
    showToast('Kanvas dibersihkan', 'info');
  });

  document.getElementById('btnExport')?.addEventListener('click', () => {
    const tmp = document.createElement('canvas');
    tmp.width  = mainCanvas.width;
    tmp.height = mainCanvas.height;
    const tctx = tmp.getContext('2d');
    tctx.fillStyle = '#f8f7f4';
    tctx.fillRect(0, 0, tmp.width, tmp.height);
    tctx.drawImage(mainCanvas, 0, 0);
    const a = document.createElement('a');
    a.download = `grafkom_${Date.now()}.png`;
    a.href = tmp.toDataURL('image/png');
    a.click();
    showToast('Gambar diekspor!', 'success');
  });

  // Polygon controls
  document.getElementById('btnClosePoly')?.addEventListener('click', () => {
    import('./tools.js').then(({ closePoly }) => closePoly());
  });
  document.getElementById('btnCancelPoly')?.addEventListener('click', () => {
    import('./tools.js').then(({ cancelPoly }) => cancelPoly());
  });
}

// ── Setup grayscale (PPT 06) ───────────────────────────────────
export function setupGrayscale() {
  const btn    = document.getElementById('btnGrayscale');
  const picker = document.getElementById('gsColor');
  const orig   = document.getElementById('gsOriginal');

  picker?.addEventListener('input', () => {
    if (orig) orig.style.background = picker.value;
  });

  btn?.addEventListener('click', async () => {
    const data = await computeGrayscale(picker.value);
    const gsRes = document.getElementById('gsResult');
    if (gsRes) gsRes.style.background = data.gray_hex;
    setText('gsInfo', `${data.formula}`);
    setText('gsHex', data.gray_hex);
  });

  // Init preview
  if (orig && picker) orig.style.background = picker.value;
}

// ── Setup Inside-Outside Test (PPT 05) ────────────────────────
export function setupInsideOutsideTest() {
  document.getElementById('btnIOTest')?.addEventListener('click', async () => {
    const polyObjs = state.objects.filter(o => o.type === 'polygon');
    if (polyObjs.length === 0) {
      showToast('Buat polygon fill terlebih dahulu!', 'warning');
      return;
    }
    // Gunakan polygon terakhir sebagai boundary approximation
    const last = polyObjs[polyObjs.length - 1];
    // Buat titik uji dari input
    const rawInput = document.getElementById('ioTestPoints')?.value || '';
    const test_points = rawInput.split(';').map(s => {
      const [x, y] = s.trim().split(',').map(Number);
      return isNaN(x) || isNaN(y) ? null : [Math.round(x), Math.round(y)];
    }).filter(Boolean);

    if (test_points.length === 0) {
      showToast('Masukkan titik uji, contoh: 100,200;300,400', 'warning');
      return;
    }

    // Perlu vertices polygon — ambil dari first polygon object
    const polyVerts = polyObjs[polyObjs.length - 1].vertices || [];
    if (polyVerts.length === 0) {
      showToast('Vertices polygon tidak tersedia. Gunakan tool Polygon (Scanline Fill).', 'info');
      return;
    }

    const { results } = await insideOutsideTest(polyVerts, test_points);
    const out = document.getElementById('ioTestResult');
    if (out) {
      out.innerHTML = results.map(r =>
        `<span class="${r.inside ? 'text-green-600' : 'text-red-500'}">
          (${r.x}, ${r.y}) → ${r.inside ? '✓ Dalam' : '✗ Luar'}
        </span>`
      ).join('<br>');
    }
  });
}
