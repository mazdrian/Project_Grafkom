# GrafKom 2D — Editor Grafika Komputer

Editor grafika komputer 2D berbasis web yang mengimplementasikan algoritma-algoritma dari materi kuliah Grafika Komputer.

## Struktur Proyek

```
grafkom/
├── app.py                        ← Entry point Flask, routing API
├── requirements.txt
├── algorithms/                   ← Satu file per topik materi
│   ├── __init__.py               ← Ekspor semua fungsi
│   ├── line.py                   ← PPT 03: DDA & Bresenham
│   ├── circle.py                 ← PPT 04: Midpoint Circle & Ellipse
│   ├── fill.py                   ← PPT 05: Scanline, Flood Fill, Inside-Outside Test
│   ├── attributes.py             ← PPT 06: Grayscale, validasi atribut
│   └── transform.py              ← PPT 07-09: Translasi, Rotasi, Skala,
│                                              Refleksi, Shear, Komposit
├── static/
│   └── js/
│       ├── editor.js             ← Entry point JS, inisialisasi modul
│       └── modules/
│           ├── state.js          ← State global aplikasi
│           ├── api.js            ← Pemanggilan REST API ke backend
│           ├── canvas.js         ← Manajemen kanvas & rendering
│           ├── tools.js          ← Logika setiap tool gambar
│           ├── transform.js      ← UI & logika transformasi
│           └── ui.js             ← Helper UI, toast, setup controls
└── templates/
    └── index.html                ← Template HTML + Tailwind CSS
```

## Materi yang Diimplementasikan

| PPT | Materi | Implementasi |
|-----|--------|--------------|
| 03 | Output Primitif — Garis | DDA, Bresenham |
| 04 | Output Primitif — Lingkaran & Elips | Midpoint Circle, Midpoint Ellipse |
| 05 | Filled-Area Primitif | Scanline Fill, Flood Fill, Inside-Outside Test (Even-Odd) |
| 06 | Atribut Output Primitif | Warna, Tebal, Tipe (solid/dashed/dotted/dashdot), Opacity, Grayscale |
| 07 | Transformasi Dasar | Translasi, Rotasi, Skala |
| 08 | Matriks Transformasi | Koordinat Homogen 3×3, Matriks Komposit |
| 09 | Transformasi Lain | Refleksi (X, Y, y=x, y=-x, Origin), Shear X & Y |

## Instalasi & Menjalankan

```bash
pip install -r requirements.txt
python app.py
```

Buka browser: http://localhost:5000

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/line` | Garis DDA / Bresenham |
| POST | `/api/circle` | Lingkaran Midpoint |
| POST | `/api/ellipse` | Elips Midpoint |
| POST | `/api/fill/scanline` | Scanline Fill polygon |
| POST | `/api/fill/flood` | Flood Fill dari seed point |
| POST | `/api/fill/test` | Inside-Outside Test (Even-Odd Rule) |
| POST | `/api/transform` | Semua jenis transformasi 2D |
| POST | `/api/grayscale` | Konversi + info formula grayscale |
