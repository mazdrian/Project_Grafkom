"""
algorithms/fill.py
==================
PPT 05 — Filled-Area Primitif
Berisi algoritma pengisian area:
  - Scanline Fill     : mengisi polygon berdasarkan irisan scan line
  - Flood Fill        : mengisi area dari titik dalam ke arah pinggir (4-connected)
  - Inside-Outside Test (Even-Odd Rule): cek apakah titik di dalam polygon
"""


# ─────────────────────────────────────────────────────────────────
#  1. SCANLINE FILL
# ─────────────────────────────────────────────────────────────────

def scanline_fill(
    vertices: list[tuple[int, int]]
) -> list[tuple[int, int]]:
    """
    Scanline Fill Algorithm.
    Untuk setiap scan line y, hitung titik potong dengan sisi-sisi
    polygon, urutkan dari kiri ke kanan, lalu isi piksel antar pasangan
    titik potong. Menangani kasus vertex khusus (titik sudut).
    """
    if len(vertices) < 3:
        return []

    filled: list[tuple[int, int]] = []
    min_y = int(min(v[1] for v in vertices))
    max_y = int(max(v[1] for v in vertices))
    n = len(vertices)

    for y in range(min_y, max_y + 1):
        intersections: list[float] = []
        for i in range(n):
            x0, y0 = vertices[i]
            x1, y1 = vertices[(i + 1) % n]
            # Lewati sisi horizontal
            if y0 == y1:
                continue
            # Cek apakah scan line y memotong sisi ini
            if min(y0, y1) <= y < max(y0, y1):
                x_intersect = x0 + (y - y0) * (x1 - x0) / (y1 - y0)
                intersections.append(x_intersect)

        intersections.sort()
        for i in range(0, len(intersections) - 1, 2):
            x_start = int(round(intersections[i]))
            x_end   = int(round(intersections[i + 1]))
            for x in range(x_start, x_end + 1):
                filled.append((x, y))

    return filled


# ─────────────────────────────────────────────────────────────────
#  2. FLOOD FILL (4-connected)
# ─────────────────────────────────────────────────────────────────

def flood_fill(
    seed_x: int,
    seed_y: int,
    boundary_points: set[tuple[int, int]],
    width: int = 800,
    height: int = 600,
    max_pixels: int = 200_000,
) -> list[tuple[int, int]]:
    """
    Flood Fill Algorithm (4-connected, iteratif dengan stack).
    Dimulai dari titik seed (seed_x, seed_y), menyebar ke 4 arah
    (atas, bawah, kiri, kanan) selama tidak menyentuh batas boundary.
    Parameter:
        boundary_points : himpunan piksel batas (garis objek)
        width, height   : ukuran kanvas (batas luar)
        max_pixels      : batas keamanan agar tidak loop tak terbatas
    """
    filled: list[tuple[int, int]] = []
    if (seed_x, seed_y) in boundary_points:
        return filled

    visited: set[tuple[int, int]] = set()
    stack: list[tuple[int, int]] = [(seed_x, seed_y)]

    while stack and len(filled) < max_pixels:
        x, y = stack.pop()
        if (x, y) in visited:
            continue
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
        if (x, y) in boundary_points:
            continue

        visited.add((x, y))
        filled.append((x, y))

        stack.append((x + 1, y))
        stack.append((x - 1, y))
        stack.append((x, y + 1))
        stack.append((x, y - 1))

    return filled


# ─────────────────────────────────────────────────────────────────
#  3. INSIDE-OUTSIDE TEST (Even-Odd Rule)
# ─────────────────────────────────────────────────────────────────

def is_point_inside_polygon(
    px: float,
    py: float,
    vertices: list[tuple[int, int]],
) -> bool:
    """
    Even-Odd Rule (Ray Casting).
    Menembakkan sinar horizontal ke kanan dari titik (px, py).
    Jika jumlah perpotongan dengan sisi polygon ganjil → titik di dalam.
    Jika genap → titik di luar.
    """
    n = len(vertices)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = vertices[i]
        xj, yj = vertices[j]
        if ((yi > py) != (yj > py)) and (
            px < (xj - xi) * (py - yi) / (yj - yi) + xi
        ):
            inside = not inside
        j = i
    return inside


def inside_outside_test(
    vertices: list[tuple[int, int]],
    test_points: list[tuple[int, int]],
) -> list[dict]:
    """
    Menjalankan even-odd test untuk sekumpulan titik terhadap polygon.
    Mengembalikan list dict berisi koordinat dan hasil test.
    """
    return [
        {
            "x": px,
            "y": py,
            "inside": is_point_inside_polygon(px, py, vertices),
        }
        for px, py in test_points
    ]
