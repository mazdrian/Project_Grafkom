// static/js/modules/api.js
// Helper untuk pemanggilan API ke backend Flask

export async function apiFetch(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── PPT 03 — Garis ────────────────────────────────────────────
export const drawLine = (x0, y0, x1, y1, algorithm) =>
  apiFetch('/api/line', { x0, y0, x1, y1, algorithm });

// ── PPT 04 — Lingkaran & Elips ────────────────────────────────
export const drawCircle = (cx, cy, r) =>
  apiFetch('/api/circle', { cx, cy, r });

export const drawEllipse = (cx, cy, rx, ry) =>
  apiFetch('/api/ellipse', { cx, cy, rx, ry });

// ── PPT 05 — Fill Area ────────────────────────────────────────
export const fillScanline = (vertices) =>
  apiFetch('/api/fill/scanline', { vertices });

export const fillFlood = (seed_x, seed_y, boundary_points, width, height) =>
  apiFetch('/api/fill/flood', { seed_x, seed_y, boundary_points, width, height });

export const insideOutsideTest = (vertices, test_points) =>
  apiFetch('/api/fill/test', { vertices, test_points });

// ── PPT 06 — Grayscale ────────────────────────────────────────
export const computeGrayscale = (color) =>
  apiFetch('/api/grayscale', { color });

// ── PPT 07/08/09 — Transformasi ───────────────────────────────
export const transformPoints = (points, type, params) =>
  apiFetch('/api/transform', { points, type, params });
