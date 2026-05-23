"""
algorithms/attributes.py
=========================
PPT 06 — Atribut Output Primitif
Berisi pemrosesan atribut output di sisi server:
  - Konversi warna RGB ↔ HEX
  - Hitung grayscale (luminance)
  - Validasi atribut garis (tipe, tebal, warna)
  - Tipe garis yang didukung: solid, dashed, dotted, dashdot
"""

import re


# ─────────────────────────────────────────────────────────────────
#  TIPE GARIS YANG VALID (PPT 06 — slide 4)
# ─────────────────────────────────────────────────────────────────

VALID_LINE_TYPES = frozenset({"solid", "dashed", "dotted", "dashdot"})

LINE_DASH_PATTERNS = {
    # (dash_length_multiplier, gap_multiplier)
    "solid"   : None,
    "dashed"  : (4, 2),
    "dotted"  : (1, 2),
    "dashdot" : (4, 2),   # diproses di client sebagai [len, gap, dot, gap]
}


# ─────────────────────────────────────────────────────────────────
#  WARNA & GRAYSCALE
# ─────────────────────────────────────────────────────────────────

def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """
    Konversi warna HEX (#RRGGBB) ke tuple (R, G, B).
    Melempar ValueError jika format tidak valid.
    """
    hex_color = hex_color.strip().lstrip("#")
    if not re.fullmatch(r"[0-9A-Fa-f]{6}", hex_color):
        raise ValueError(f"Format warna tidak valid: #{hex_color}")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return r, g, b


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Konversi (R, G, B) ke string HEX '#RRGGBB'."""
    return f"#{r:02x}{g:02x}{b:02x}"


def compute_grayscale(r: int, g: int, b: int) -> int:
    """
    Menghitung nilai grayscale menggunakan formula luminance:
      Gray = 0.299·R + 0.587·G + 0.114·B
    (Sesuai standar NTSC / ITU-R BT.601)
    """
    return round(0.299 * r + 0.587 * g + 0.114 * b)


def grayscale_info(hex_color: str) -> dict:
    """
    Menerima warna HEX, mengembalikan dict berisi:
      - r, g, b        : komponen warna asli
      - gray           : nilai grayscale (0–255)
      - gray_hex       : HEX grayscale '#gggggg'
      - formula        : teks rumus yang dipakai
    """
    r, g, b = hex_to_rgb(hex_color)
    gray = compute_grayscale(r, g, b)
    return {
        "r"      : r,
        "g"      : g,
        "b"      : b,
        "gray"   : gray,
        "gray_hex": rgb_to_hex(gray, gray, gray),
        "formula": f"0.299×{r} + 0.587×{g} + 0.114×{b} = {gray}",
    }


# ─────────────────────────────────────────────────────────────────
#  VALIDASI ATRIBUT
# ─────────────────────────────────────────────────────────────────

def validate_line_attributes(
    color: str = "#000000",
    width: int = 2,
    line_type: str = "solid",
    opacity: float = 1.0,
) -> dict:
    """
    Validasi atribut garis. Mengembalikan dict atribut yang sudah
    dibersihkan / diperbaiki ke nilai default jika tidak valid.
    """
    # Validasi warna
    try:
        hex_to_rgb(color)
    except ValueError:
        color = "#000000"

    # Validasi tebal garis
    width = max(1, min(int(width), 20))

    # Validasi tipe garis
    if line_type not in VALID_LINE_TYPES:
        line_type = "solid"

    # Validasi opacity
    opacity = max(0.0, min(float(opacity), 1.0))

    return {
        "color"    : color,
        "width"    : width,
        "line_type": line_type,
        "opacity"  : opacity,
    }
