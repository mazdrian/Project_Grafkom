"""
app.py
======
Entry point aplikasi Flask — Grafika Komputer 2D Editor.
Semua logika algoritma dipisah ke package `algorithms/`.

Route API:
  POST /api/line          — Garis (DDA / Bresenham)
  POST /api/circle        — Lingkaran (Midpoint Circle)
  POST /api/ellipse       — Elips (Midpoint Ellipse)
  POST /api/fill/scanline — Scanline Fill
  POST /api/fill/flood    — Flood Fill
  POST /api/fill/test     — Inside-Outside Test
  POST /api/transform     — Semua transformasi (translate/rotate/scale/
                            reflect/shear/composite)
  POST /api/grayscale     — Konversi grayscale + info formula
"""

from flask import Flask, render_template, request, jsonify

from algorithms import (
    # Line
    dda_line, bresenham_line,
    # Circle
    midpoint_circle, midpoint_ellipse,
    # Fill
    scanline_fill, flood_fill, inside_outside_test,
    # Transform helpers
    apply_transform, format_matrix, composite_matrix,
    translate_matrix, rotate_matrix, scale_matrix,
    reflect_x_matrix, reflect_y_matrix,
    reflect_xy_matrix, reflect_neg_xy_matrix, reflect_origin_matrix,
    shear_x_matrix, shear_y_matrix,
    # Attributes
    grayscale_info, validate_line_attributes,
)

app = Flask(__name__)


# ─────────────────────────────────────────────────────────────────
#  HALAMAN UTAMA
# ─────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


# ─────────────────────────────────────────────────────────────────
#  API — OUTPUT PRIMITIF: GARIS (PPT 03)
# ─────────────────────────────────────────────────────────────────

@app.route("/api/line", methods=["POST"])
def api_line():
    d = request.json
    x0, y0 = int(d["x0"]), int(d["y0"])
    x1, y1 = int(d["x1"]), int(d["y1"])
    algo    = d.get("algorithm", "bresenham")

    if algo == "dda":
        points = dda_line(x0, y0, x1, y1)
    else:
        points = bresenham_line(x0, y0, x1, y1)

    return jsonify({"points": points, "algorithm": algo, "count": len(points)})


# ─────────────────────────────────────────────────────────────────
#  API — OUTPUT PRIMITIF: LINGKARAN & ELIPS (PPT 04)
# ─────────────────────────────────────────────────────────────────

@app.route("/api/circle", methods=["POST"])
def api_circle():
    d = request.json
    cx, cy = int(d["cx"]), int(d["cy"])
    r = int(d["r"])
    points = midpoint_circle(cx, cy, r)
    return jsonify({"points": points, "count": len(points)})


@app.route("/api/ellipse", methods=["POST"])
def api_ellipse():
    d = request.json
    cx, cy = int(d["cx"]), int(d["cy"])
    rx, ry = int(d["rx"]), int(d["ry"])
    points = midpoint_ellipse(cx, cy, rx, ry)
    return jsonify({"points": points, "count": len(points)})


# ─────────────────────────────────────────────────────────────────
#  API — FILLED-AREA PRIMITIF (PPT 05)
# ─────────────────────────────────────────────────────────────────

@app.route("/api/fill/scanline", methods=["POST"])
def api_fill_scanline():
    d = request.json
    vertices = [(int(v[0]), int(v[1])) for v in d["vertices"]]
    points   = scanline_fill(vertices)
    return jsonify({"points": points, "count": len(points)})


@app.route("/api/fill/flood", methods=["POST"])
def api_fill_flood():
    d = request.json
    seed_x = int(d["seed_x"])
    seed_y = int(d["seed_y"])
    boundary = {(int(p[0]), int(p[1])) for p in d.get("boundary_points", [])}
    width    = int(d.get("width", 800))
    height   = int(d.get("height", 600))
    points   = flood_fill(seed_x, seed_y, boundary, width, height)
    return jsonify({"points": points, "count": len(points)})


@app.route("/api/fill/test", methods=["POST"])
def api_fill_test():
    """Inside-Outside Test — cek apakah titik di dalam polygon (Even-Odd Rule)."""
    d = request.json
    vertices     = [(int(v[0]), int(v[1])) for v in d["vertices"]]
    test_points  = [(int(p[0]), int(p[1])) for p in d["test_points"]]
    results      = inside_outside_test(vertices, test_points)
    return jsonify({"results": results})


# ─────────────────────────────────────────────────────────────────
#  API — TRANSFORMASI 2D (PPT 07, 08, 09)
# ─────────────────────────────────────────────────────────────────

@app.route("/api/transform", methods=["POST"])
def api_transform():
    d      = request.json
    points = [(int(p[0]), int(p[1])) for p in d["points"]]
    ttype  = d["type"]      # jenis transformasi
    params = d.get("params", {})

    cx = float(params.get("cx", 0))
    cy = float(params.get("cy", 0))

    # ── Pilih matriks berdasarkan tipe ────────────────────────────
    if ttype == "translate":
        M = translate_matrix(
            float(params.get("tx", 0)),
            float(params.get("ty", 0)),
        )

    elif ttype == "rotate":
        M = rotate_matrix(float(params.get("angle", 0)), cx, cy)

    elif ttype == "scale":
        M = scale_matrix(
            float(params.get("sx", 1)),
            float(params.get("sy", 1)),
            cx, cy,
        )

    elif ttype == "reflect_x":
        # Refleksi terhadap sumbu X
        T1 = translate_matrix(0, -cy)
        R  = reflect_x_matrix()
        T2 = translate_matrix(0, cy)
        M  = composite_matrix(T1, R, T2)

    elif ttype == "reflect_y":
        # Refleksi terhadap sumbu Y
        T1 = translate_matrix(-cx, 0)
        R  = reflect_y_matrix()
        T2 = translate_matrix(cx, 0)
        M  = composite_matrix(T1, R, T2)

    elif ttype == "reflect_xy":
        # Refleksi terhadap garis y = x
        M = reflect_xy_matrix()

    elif ttype == "reflect_neg_xy":
        # Refleksi terhadap garis y = -x
        M = reflect_neg_xy_matrix()

    elif ttype == "reflect_origin":
        # Refleksi terhadap titik origin
        M = reflect_origin_matrix()

    elif ttype == "shear_x":
        M = shear_x_matrix(float(params.get("shx", 0)))

    elif ttype == "shear_y":
        M = shear_y_matrix(float(params.get("shy", 0)))

    elif ttype == "composite":
        # Komposit: T → R → S (urutan bisa diatur dari client)
        matrices = []
        if params.get("use_translate"):
            matrices.append(translate_matrix(
                float(params.get("tx", 0)),
                float(params.get("ty", 0)),
            ))
        if params.get("use_rotate"):
            matrices.append(rotate_matrix(float(params.get("angle", 0)), cx, cy))
        if params.get("use_scale"):
            matrices.append(scale_matrix(
                float(params.get("sx", 1)),
                float(params.get("sy", 1)),
                cx, cy,
            ))
        M = composite_matrix(*matrices) if matrices else translate_matrix(0, 0)

    else:
        M = translate_matrix(0, 0)   # identity fallback

    new_points = apply_transform(points, M)
    return jsonify({
        "points": new_points,
        "matrix": format_matrix(M),
        "type"  : ttype,
    })


# ─────────────────────────────────────────────────────────────────
#  API — ATRIBUT OUTPUT PRIMITIF (PPT 06)
# ─────────────────────────────────────────────────────────────────

@app.route("/api/grayscale", methods=["POST"])
def api_grayscale():
    d   = request.json
    hex_color = d.get("color", "#000000")
    info = grayscale_info(hex_color)
    return jsonify(info)


# ─────────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)
