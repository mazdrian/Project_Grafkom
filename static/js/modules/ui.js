// static/js/modules/ui.js
// Helper UI: update status bar, toast, info panel

import { state } from './state.js';
import { computeGrayscale, insideOutsideTest } from './api.js';
import { mainCanvas, redrawAll, clearOverlay } from './canvas.js';

const TOOL_LABELS = {
  point  : 'Titik',
  line   : 'Garis',
  freestyle: 'Freestyle',
  circle : 'Lingkaran',
  ellipse: 'Elips',
  polygon: 'Polygon Fill',
  flood  : 'Flood Fill',
};

const HINTS = {
  point  : 'Klik pada kanvas untuk menempatkan titik',
  line   : 'Klik dan drag untuk menggambar garis',
  freestyle: 'Klik dan drag bebas seperti whiteboard',
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
    info   : 'bg-slate-900 text-slate-200 border-slate-700',
    warning: 'bg-slate-900 text-slate-200 border-slate-700',
    success: 'bg-slate-900 text-slate-200 border-slate-700',
    error  : 'bg-slate-900 text-slate-200 border-slate-700',
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

  // Grid controls
  const gridToggle = document.getElementById('gridToggle');
  const gridSizeInput = document.getElementById('gridSizeInput');
  if (gridToggle) {
    gridToggle.checked = state.showGrid;
    gridToggle.addEventListener('change', e => {
      state.showGrid = e.target.checked;
      redrawAll();
    });
  }
  if (gridSizeInput) {
    gridSizeInput.value = state.gridSize;
    gridSizeInput.addEventListener('input', e => {
      const v = parseInt(e.target.value) || 10;
      state.gridSize = Math.max(8, Math.min(200, v));
      redrawAll();
    });
  }
}

// ── Setup tool buttons ─────────────────────────────────────────
export function setupToolButtons() {
  document.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Import cancelPoly secara lazy untuk hindari circular dep
      import('./tools.js').then(({ cancelPoly }) => cancelPoly());
      setActiveTool(btn.dataset.tool);
    });
  });

  // Algoritma garis
  document.querySelectorAll('input[name="algo"]').forEach(r => {
    r.addEventListener('change', () => { state.algo = r.value; updateUI(); });
  });
}

// ── Setup clear & export ───────────────────────────────────────
export function setupControls() {
  bindActionButtons();
  document.addEventListener('keydown', handleGlobalShortcuts);

  // Polygon controls
  document.getElementById('btnClosePoly')?.addEventListener('click', () => {
    import('./tools.js').then(({ closePoly }) => closePoly());
  });
  document.getElementById('btnCancelPoly')?.addEventListener('click', () => {
    import('./tools.js').then(({ cancelPoly }) => cancelPoly());
  });

}

function bindActionButtons() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      runAction(action);
    });
  });

  document.getElementById('btnClear')?.addEventListener('click', () => runAction('new'));
  document.getElementById('btnExport')?.addEventListener('click', () => runAction('export'));
  document.getElementById('btnResetView')?.addEventListener('click', () => runAction('reset-view'));
}

function runAction(action) {
  switch (action) {
    case 'new':
      clearWorkspace();
      break;
    case 'export':
      exportWorkspace();
      break;
    case 'reset-view':
      resetWorkspaceView();
      break;
    case 'toggle-grid':
      toggleGrid();
      break;
    case 'help':
      showShortcutHelp();
      break;
    case 'freestyle':
      setActiveTool('freestyle');
      showToast('Mode Freestyle aktif', 'info');
      break;
    default:
      break;
  }
}

function setActiveTool(tool) {
  state.tool = tool;
  document.querySelectorAll('[data-tool]').forEach(b => {
    b.classList.remove('tool-active');
    b.classList.add('tool-inactive');
  });
  document.querySelectorAll('[data-action]').forEach(b => {
    if (b.dataset.action === 'freestyle') {
      b.classList.remove('tool-active');
      b.classList.add('tool-inactive');
    }
  });
  const freestyleBtn = document.querySelector('[data-action="freestyle"]');
  if (tool === 'freestyle' && freestyleBtn) {
    freestyleBtn.classList.remove('tool-inactive');
    freestyleBtn.classList.add('tool-active');
  }
  updateUI();
}

function clearWorkspace() {
  state.objects = [];
  state.transformHistory = [];
  state.polyPoints = [];
  state.freestylePoints = [];
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
  showToast('Workspace baru dibuat', 'info');
}

function exportWorkspace() {
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
}

function resetWorkspaceView() {
  state.panX = 0;
  state.panY = 0;
  clearOverlay();
  redrawAll();
  showToast('View di-reset ke posisi awal', 'info');
}

function toggleGrid() {
  state.showGrid = !state.showGrid;
  const gridToggle = document.getElementById('gridToggle');
  if (gridToggle) gridToggle.checked = state.showGrid;
  redrawAll();
  showToast(state.showGrid ? 'Grid ditampilkan' : 'Grid disembunyikan', 'info');
}

function showShortcutHelp() {
  showToast('Shortcuts: F Freestyle, Ctrl+N New, Ctrl+E Export, Home Reset View, G Grid', 'info');
}

function handleGlobalShortcuts(e) {
  const target = e.target;
  const isTyping = target && (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  );

  if (isTyping) return;

  const key = e.key.toLowerCase();
  if (e.ctrlKey && key === 'n') {
    e.preventDefault();
    runAction('new');
  } else if (e.ctrlKey && key === 'e') {
    e.preventDefault();
    runAction('export');
  } else if (key === 'home') {
    e.preventDefault();
    runAction('reset-view');
  } else if (!e.ctrlKey && !e.metaKey && !e.altKey && key === 'f') {
    e.preventDefault();
    runAction('freestyle');
  } else if (!e.ctrlKey && !e.metaKey && !e.altKey && key === 'g') {
    e.preventDefault();
    runAction('toggle-grid');
  } else if ((e.shiftKey && key === '/') || key === '?') {
    e.preventDefault();
    runAction('help');
  }
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
        `<span class="${r.inside ? 'text-slate-200' : 'text-slate-400'}">
          (${r.x}, ${r.y}) → ${r.inside ? '✓ Dalam' : '✗ Luar'}
        </span>`
      ).join('<br>');
    }
  });
}
