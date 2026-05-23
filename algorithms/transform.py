"""
algorithms/transform.py
========================
PPT 07 — Transformasi Dasar
PPT 08 — Matriks Transformasi (Koordinat Homogen 3×3)
PPT 09 — Transformasi Lain (Refleksi & Shear)

Semua transformasi menggunakan representasi matriks homogen 3×3
sehingga mudah dikombinasikan (matriks komposit).

Daftar fungsi:
  Translasi       : translate_matrix(tx, ty)
  Rotasi          : rotate_matrix(angle_deg, cx, cy)
  Skala           : scale_matrix(sx, sy, cx, cy)
  Refleksi sumbu X: reflect_x_matrix()
  Refleksi sumbu Y: reflect_y_matrix()
  Refleksi y=x   : reflect_xy_matrix()
  Refleksi y=-x  : reflect_neg_xy_matrix()
  Shear X         : shear_x_matrix(shx)
  Shear Y         : shear_y_matrix(shy)
  Komposit        : matrix_multiply(A, B)
  Terapkan        : apply_transform(points, matrix)
"""

import math

Matrix3x3 = list[list[float]]
Point2D   = tuple[int, int]


# ─────────────────────────────────────────────────────────────────
#  UTILITAS MATRIKS
# ─────────────────────────────────────────────────────────────────

def identity_matrix() -> Matrix3x3:
    """Matriks identitas 3×3."""
    return [[1, 0, 0], [0, 1, 0], [0, 0, 1]]


def matrix_multiply(A: Matrix3x3, B: Matrix3x3) -> Matrix3x3:
    """Perkalian dua matriks 3×3 (A × B)."""
    result: Matrix3x3 = [[0.0, 0.0, 0.0] for _ in range(3)]
    for i in range(3):
        for j in range(3):
            for k in range(3):
                result[i][j] += A[i][k] * B[k][j]
    return result


def format_matrix(m: Matrix3x3, precision: int = 3) -> Matrix3x3:
    """Membulatkan elemen matriks untuk tampilan."""
    return [[round(m[i][j], precision) for j in range(3)] for i in range(3)]


def apply_transform(
    points: list[Point2D], matrix: Matrix3x3
) -> list[Point2D]:
    """
    Menerapkan matriks transformasi homogen 3×3 ke sekumpulan titik.
    Setiap titik (x, y) dikalikan dengan matriks lalu dibulatkan.
    """
    result: list[Point2D] = []
    for x, y in points:
        nx = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2]
        ny = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2]
        result.append((round(nx), round(ny)))
    return result


# ─────────────────────────────────────────────────────────────────
#  PPT 07 — TRANSFORMASI DASAR
# ─────────────────────────────────────────────────────────────────

def translate_matrix(tx: float, ty: float) -> Matrix3x3:
    """
    Matriks Translasi.
    Memindahkan titik sebesar (tx, ty).
    P' = P + T  →  [1 0 tx; 0 1 ty; 0 0 1]
    """
    return [
        [1, 0, tx],
        [0, 1, ty],
        [0, 0,  1],
    ]


def rotate_matrix(
    angle_deg: float, cx: float = 0, cy: float = 0
) -> Matrix3x3:
    """
    Matriks Rotasi terhadap titik (cx, cy).
    Positif = berlawanan arah jarum jam.
    Jika (cx, cy) = (0,0) → rotasi terhadap origin.
    """
    a = math.radians(angle_deg)
    cos_a, sin_a = math.cos(a), math.sin(a)
    return [
        [cos_a, -sin_a, cx * (1 - cos_a) + cy * sin_a],
        [sin_a,  cos_a, cy * (1 - cos_a) - cx * sin_a],
        [0,      0,     1                             ],
    ]


def scale_matrix(
    sx: float, sy: float, cx: float = 0, cy: float = 0
) -> Matrix3x3:
    """
    Matriks Penskalaan terhadap titik acuan (cx, cy).
    sx, sy = faktor skala sumbu x dan y.
    Jika (cx, cy) = (0,0) → skala terhadap origin.
    """
    return [
        [sx,  0, cx * (1 - sx)],
        [ 0, sy, cy * (1 - sy)],
        [ 0,  0,  1            ],
    ]


# ─────────────────────────────────────────────────────────────────
#  PPT 09 — REFLEKSI
# ─────────────────────────────────────────────────────────────────

def reflect_x_matrix() -> Matrix3x3:
    """
    Refleksi terhadap sumbu X (y = 0).
    x' = x, y' = -y
    Matriks: [1 0 0; 0 -1 0; 0 0 1]
    """
    return [
        [1,  0, 0],
        [0, -1, 0],
        [0,  0, 1],
    ]


def reflect_y_matrix() -> Matrix3x3:
    """
    Refleksi terhadap sumbu Y (x = 0).
    x' = -x, y' = y
    Matriks: [-1 0 0; 0 1 0; 0 0 1]
    """
    return [
        [-1, 0, 0],
        [ 0, 1, 0],
        [ 0, 0, 1],
    ]


def reflect_xy_matrix() -> Matrix3x3:
    """
    Refleksi terhadap garis diagonal y = x.
    x' = y, y' = x
    Matriks: [0 1 0; 1 0 0; 0 0 1]
    """
    return [
        [0, 1, 0],
        [1, 0, 0],
        [0, 0, 1],
    ]


def reflect_neg_xy_matrix() -> Matrix3x3:
    """
    Refleksi terhadap garis y = -x.
    x' = -y, y' = -x
    Matriks: [0 -1 0; -1 0 0; 0 0 1]
    """
    return [
        [ 0, -1, 0],
        [-1,  0, 0],
        [ 0,  0, 1],
    ]


def reflect_origin_matrix() -> Matrix3x3:
    """
    Refleksi terhadap titik origin (0, 0).
    x' = -x, y' = -y  (ekuivalen rotasi 180°)
    Matriks: [-1 0 0; 0 -1 0; 0 0 1]
    """
    return [
        [-1,  0, 0],
        [ 0, -1, 0],
        [ 0,  0, 1],
    ]


# ─────────────────────────────────────────────────────────────────
#  PPT 09 — SHEAR (PERGESERAN)
# ─────────────────────────────────────────────────────────────────

def shear_x_matrix(shx: float) -> Matrix3x3:
    """
    Shear (geser) terhadap sumbu X.
    x' = x + shx * y,  y' = y
    Distorsi horizontal — sisi atas bergeser lebih jauh dari sisi bawah.
    Matriks: [1 shx 0; 0 1 0; 0 0 1]
    """
    return [
        [1, shx, 0],
        [0,   1, 0],
        [0,   0, 1],
    ]


def shear_y_matrix(shy: float) -> Matrix3x3:
    """
    Shear (geser) terhadap sumbu Y.
    x' = x,  y' = y + shy * x
    Distorsi vertikal — sisi kanan bergeser lebih jauh dari sisi kiri.
    Matriks: [1 0 0; shy 1 0; 0 0 1]
    """
    return [
        [  1, 0, 0],
        [shy, 1, 0],
        [  0, 0, 1],
    ]


# ─────────────────────────────────────────────────────────────────
#  PPT 08 — MATRIKS KOMPOSIT
# ─────────────────────────────────────────────────────────────────

def composite_matrix(*matrices: Matrix3x3) -> Matrix3x3:
    """
    Matriks Transformasi Komposit.
    Mengalikan sekumpulan matriks dari kiri ke kanan:
      M_total = M1 × M2 × M3 × ...
    Urutan transformasi: M1 diterapkan pertama, lalu M2, dst.
    """
    result = identity_matrix()
    for m in matrices:
        result = matrix_multiply(result, m)
    return result
