// static/js/modules/state.js
// Pusat state seluruh aplikasi

export const state = {
  // Tool aktif
  tool: 'point',
  algo: 'bresenham',

  // Atribut garis (PPT 06)
  color: '#1e3a5f',
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

  // Tab transformasi aktif
  activeTransformTab: 'translate',
};
