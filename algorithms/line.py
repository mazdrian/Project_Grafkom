"""
algorithms/line.py
==================
PPT 03 — Output Primitif: Garis
Berisi algoritma pembentukan garis:
  - DDA  (Digital Differential Analyzer)
  - Bresenham's Line Algorithm
"""


def dda_line(x0: int, y0: int, x1: int, y1: int) -> list[tuple[int, int]]:
    """
    Digital Differential Analyzer (DDA).
    Menghitung posisi piksel sepanjang garis dari (x0,y0) ke (x1,y1)
    menggunakan pembagian langkah terbanyak (dx atau dy).
    """
    points: list[tuple[int, int]] = []
    dx = x1 - x0
    dy = y1 - y0
    steps = max(abs(dx), abs(dy))
    if steps == 0:
        return [(x0, y0)]
    x_inc = dx / steps
    y_inc = dy / steps
    x, y = float(x0), float(y0)
    for _ in range(int(steps) + 1):
        points.append((round(x), round(y)))
        x += x_inc
        y += y_inc
    return points


def bresenham_line(x0: int, y0: int, x1: int, y1: int) -> list[tuple[int, int]]:
    """
    Bresenham's Line Algorithm.
    Menggunakan hanya operasi integer (tanpa floating-point) untuk efisiensi.
    Menentukan piksel berikutnya berdasarkan nilai error.
    """
    points: list[tuple[int, int]] = []
    dx = abs(x1 - x0)
    dy = abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy
    x, y = x0, y0
    while True:
        points.append((x, y))
        if x == x1 and y == y1:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x += sx
        if e2 < dx:
            err += dx
            y += sy
    return points
