"""
algorithms/__init__.py
======================
Package init — ekspor semua fungsi utama agar mudah di-import dari app.py.

Contoh penggunaan di app.py:
    from algorithms import dda_line, bresenham_line
    from algorithms import midpoint_circle, midpoint_ellipse
    from algorithms import scanline_fill, flood_fill, inside_outside_test
    from algorithms import translate_matrix, rotate_matrix, ...
    from algorithms import grayscale_info, validate_line_attributes
"""

from .line import dda_line, bresenham_line
from .circle import midpoint_circle, midpoint_ellipse
from .fill import scanline_fill, flood_fill, inside_outside_test, is_point_inside_polygon
from .transform import (
    identity_matrix,
    matrix_multiply,
    composite_matrix,
    format_matrix,
    apply_transform,
    translate_matrix,
    rotate_matrix,
    scale_matrix,
    reflect_x_matrix,
    reflect_y_matrix,
    reflect_xy_matrix,
    reflect_neg_xy_matrix,
    reflect_origin_matrix,
    shear_x_matrix,
    shear_y_matrix,
)
from .attributes import grayscale_info, validate_line_attributes, hex_to_rgb

__all__ = [
    # line
    "dda_line", "bresenham_line",
    # circle
    "midpoint_circle", "midpoint_ellipse",
    # fill
    "scanline_fill", "flood_fill", "inside_outside_test", "is_point_inside_polygon",
    # transform
    "identity_matrix", "matrix_multiply", "composite_matrix",
    "format_matrix", "apply_transform",
    "translate_matrix", "rotate_matrix", "scale_matrix",
    "reflect_x_matrix", "reflect_y_matrix",
    "reflect_xy_matrix", "reflect_neg_xy_matrix", "reflect_origin_matrix",
    "shear_x_matrix", "shear_y_matrix",
    # attributes
    "grayscale_info", "validate_line_attributes", "hex_to_rgb",
]
