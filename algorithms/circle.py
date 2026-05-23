"""
algorithms/circle.py
=====================
PPT 04 — Output Primitif: Lingkaran & Elips
Berisi algoritma pembentukan lingkaran dan elips:
  - Midpoint Circle Algorithm  (simetri 8 titik)
  - Midpoint Ellipse Algorithm (2 region)
"""


def _plot_circle_octants(
    cx: int, cy: int, x: int, y: int
) -> list[tuple[int, int]]:
    """Helper: menghasilkan 8 titik simetris dari satu titik (x, y)."""
    return [
        (cx + x, cy + y), (cx - x, cy + y),
        (cx + x, cy - y), (cx - x, cy - y),
        (cx + y, cy + x), (cx - y, cy + x),
        (cx + y, cy - x), (cx - y, cy - x),
    ]


def midpoint_circle(cx: int, cy: int, r: int) -> list[tuple[int, int]]:
    """
    Midpoint Circle Algorithm.
    Memanfaatkan simetri 8 titik — hanya menghitung 1/8 lingkaran
    lalu mencerminkannya ke 7 oktant lainnya.
    Parameter keputusan: d = 1 - r (awal).
    """
    points: list[tuple[int, int]] = []
    x, y = 0, r
    d = 1 - r
    while x <= y:
        points.extend(_plot_circle_octants(cx, cy, x, y))
        if d < 0:
            d += 2 * x + 3
        else:
            d += 2 * (x - y) + 5
            y -= 1
        x += 1
    return list(set(points))


def midpoint_ellipse(
    cx: int, cy: int, rx: int, ry: int
) -> list[tuple[int, int]]:
    """
    Midpoint Ellipse Algorithm.
    Dibagi menjadi dua region berdasarkan kemiringan kurva:
      Region 1: |slope| < 1  (dominan perubahan x)
      Region 2: |slope| > 1  (dominan perubahan y)
    Memanfaatkan simetri 4 kuadran.
    """
    points: list[tuple[int, int]] = []
    rx2, ry2 = rx * rx, ry * ry

    def _plot4(x: int, y: int) -> list[tuple[int, int]]:
        return [
            (cx + x, cy + y), (cx - x, cy + y),
            (cx + x, cy - y), (cx - x, cy - y),
        ]

    x, y = 0, ry

    # ── Region 1 ──────────────────────────────────────────────────
    d1 = ry2 - rx2 * ry + 0.25 * rx2
    dx, dy = 2 * ry2 * x, 2 * rx2 * y
    while dx < dy:
        points.extend(_plot4(x, y))
        if d1 < 0:
            x += 1
            dx += 2 * ry2
            d1 += dx + ry2
        else:
            x += 1
            y -= 1
            dx += 2 * ry2
            dy -= 2 * rx2
            d1 += dx - dy + ry2

    # ── Region 2 ──────────────────────────────────────────────────
    d2 = ry2 * (x + 0.5) ** 2 + rx2 * (y - 1) ** 2 - rx2 * ry2
    while y >= 0:
        points.extend(_plot4(x, y))
        if d2 > 0:
            y -= 1
            dy -= 2 * rx2
            d2 += rx2 - dy
        else:
            y -= 1
            x += 1
            dx += 2 * ry2
            dy -= 2 * rx2
            d2 += dx - dy + rx2

    return list(set(points))
