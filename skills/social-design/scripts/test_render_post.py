import struct
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render_post  # noqa: E402


def write_png_header(path, width, height):
    signature = b"\x89PNG\r\n\x1a\n"
    ihdr_length_and_type = struct.pack(">I", 13) + b"IHDR"
    path.write_bytes(signature + ihdr_length_and_type + struct.pack(">II", width, height) + b"\x00" * 8)


class ParseSizeTest(unittest.TestCase):
    def test_parses_width_and_height(self):
        self.assertEqual(render_post.parse_size("1080x1350"), (1080, 1350))

    def test_accepts_uppercase_separator(self):
        self.assertEqual(render_post.parse_size("1280X720"), (1280, 720))

    def test_rejects_malformed_size(self):
        with self.assertRaises(Exception):
            render_post.parse_size("1080")
        with self.assertRaises(Exception):
            render_post.parse_size("wide x tall")


class PngDimensionsTest(unittest.TestCase):
    def test_reads_dimensions_from_header(self):
        with tempfile.TemporaryDirectory() as tmp:
            png = Path(tmp) / "a.png"
            write_png_header(png, 1080, 1920)
            self.assertEqual(render_post.png_dimensions(png), (1080, 1920))

    def test_rejects_non_png_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            fake = Path(tmp) / "a.png"
            fake.write_bytes(b"not a png at all, just bytes pretending")
            with self.assertRaises(ValueError):
                render_post.png_dimensions(fake)


class PlanJobsTest(unittest.TestCase):
    def test_single_html_with_png_renders_to_that_exact_path(self):
        jobs = render_post.plan_jobs(["slide.html", "out/cover.png"])
        self.assertEqual(jobs, [("slide.html", Path("out/cover.png"))])

    def test_multiple_inputs_go_to_out_dir_named_after_each_html(self):
        jobs = render_post.plan_jobs(["s1.html", "s2.html", "s3.html"], out_dir="render")
        self.assertEqual([png for _, png in jobs],
                         [Path("render/s1.png"), Path("render/s2.png"), Path("render/s3.png")])

    def test_two_html_inputs_are_not_mistaken_for_input_and_output(self):
        jobs = render_post.plan_jobs(["a.html", "b.html"])
        self.assertEqual(len(jobs), 2)
        self.assertEqual(jobs[1][1], Path("b.png"))

    def test_out_dir_overrides_explicit_png_pairing(self):
        jobs = render_post.plan_jobs(["a.html", "b.png"], out_dir="x")
        self.assertEqual(jobs[0][1], Path("x/a.png"))


class BuildCommandTest(unittest.TestCase):
    """Regression guard: without --virtual-time-budget, Chrome captures before
    Google Fonts load and text with font-display:block renders invisible."""

    def setUp(self):
        self.cmd = render_post.build_command("chrome", "post.html", "post.png", 1080, 1350, 8000)

    def test_waits_for_web_fonts_before_capture(self):
        self.assertIn("--virtual-time-budget=8000", self.cmd)

    def test_renders_at_exact_pixel_size(self):
        self.assertIn("--window-size=1080,1350", self.cmd)
        self.assertIn("--force-device-scale-factor=1", self.cmd)

    def test_passes_html_as_file_uri(self):
        self.assertTrue(self.cmd[-1].startswith("file://"))
        self.assertTrue(self.cmd[-1].endswith("post.html"))

    def test_scale_sets_device_scale_factor_but_keeps_css_window_size(self):
        cmd = render_post.build_command("chrome", "post.html", "post.png", 1080, 1350, 8000, scale=2)
        self.assertIn("--force-device-scale-factor=2", cmd)
        self.assertIn("--window-size=1080,1350", cmd)
        self.assertIn("--virtual-time-budget=8000", cmd)


class ExpectedDimensionsTest(unittest.TestCase):
    def test_one_x_is_css_size(self):
        self.assertEqual(render_post.expected_dimensions(1080, 1350, 1), (1080, 1350))

    def test_two_x_doubles_both_axes(self):
        self.assertEqual(render_post.expected_dimensions(1080, 1350, 2), (2160, 2700))


@unittest.skipUnless(render_post.find_chrome(), "Chrome/Chromium not installed")
class RenderIntegrationTest(unittest.TestCase):
    def test_renders_png_at_requested_size(self):
        with tempfile.TemporaryDirectory() as tmp:
            html = Path(tmp) / "post.html"
            png = Path(tmp) / "post.png"
            html.write_text(
                "<!doctype html><html><head><style>html,body{margin:0;width:1080px;height:1350px;"
                "overflow:hidden;background:#7C3F2B}</style></head><body></body></html>",
                encoding="utf-8",
            )
            dims = render_post.render(render_post.find_chrome(), html, png, 1080, 1350, 3000)
            self.assertEqual(dims, (1080, 1350))
            self.assertTrue(png.exists())

    def test_renders_at_double_density_when_scaled(self):
        with tempfile.TemporaryDirectory() as tmp:
            html = Path(tmp) / "post.html"
            png = Path(tmp) / "post.png"
            html.write_text(
                "<!doctype html><html><head><style>html,body{margin:0;width:1080px;height:1350px;"
                "overflow:hidden;background:#1a2b21}</style></head><body></body></html>",
                encoding="utf-8",
            )
            dims = render_post.render(render_post.find_chrome(), html, png, 1080, 1350, 3000, scale=2)
            self.assertEqual(dims, (2160, 2700))


if __name__ == "__main__":
    unittest.main()
