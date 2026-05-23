// static/js/modules/state.js
// Pusat state seluruh aplikasi

export const state = {
  // Tool aktif
  tool: 'point',
  algo: 'bresenham',

  // Atribut garis (PPT 06)
  color: '#8b5cf6',
  size: 2,
  opacity: 1.0,
  lineStyle: 'solid',

  // Status menggambar
  drawing: false,
  startX: 0,
  startY: 0,

  // Polygon
  polyPoints: [],

  // Objek di kanvas
  objects: [],
  transformHistory: [],

  // Info
  totalPoints: 0,

  // Grid helper
  showGrid: true,
  gridSize: 25,
  gridColor: 'rgba(139,92,246,0.10)',

  // Pan / viewport
  panX: 0,
  panY: 0,
  panning: false,
  panStartMouse: [0, 0],
  panStartOffset: [0, 0],

  // Tab transformasi aktif
  activeTransformTab: 'translate',
};
