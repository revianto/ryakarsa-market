import argparse
import json
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import manage_library as ml  # noqa: E402


class LibraryTestCase(unittest.TestCase):
    """Point the module at a throwaway library so tests never touch real data."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.lib = Path(self._tmp.name) / "library"
        self._orig = (ml.LIBRARY_DIR, ml.INDEX_PATH)
        ml.LIBRARY_DIR = self.lib
        ml.INDEX_PATH = self.lib / "index.json"

    def tearDown(self):
        ml.LIBRARY_DIR, ml.INDEX_PATH = self._orig
        self._tmp.cleanup()

    def run_cmd(self, argv):
        out, err = StringIO(), StringIO()
        code = 0
        with redirect_stdout(out), redirect_stderr(err):
            try:
                args = ml.build_parser().parse_args(argv)
                args.func(args)
            except SystemExit as exc:
                code = exc.code or 0
        return code, out.getvalue(), err.getvalue()

    def add(self, name="rebrew-carousel-cover", brand="rebrew", fmt="ig-carousel",
            size="1080x1350", source="prompt", tags="cover"):
        return self.run_cmd(["add", "--name", name, "--brand", brand, "--format", fmt, "--size", size,
                             "--file", f"{fmt}/{name}.html", "--description", "desc",
                             "--tags", tags, "--source", source])

    def index(self):
        return json.loads(ml.INDEX_PATH.read_text(encoding="utf-8"))


class SlugifyTest(unittest.TestCase):
    def test_lowercases_and_hyphenates(self):
        self.assertEqual(ml.slugify("  ReBrew Carousel Cover! "), "rebrew-carousel-cover")


class AddTest(LibraryTestCase):
    def test_add_records_brand_format_and_size(self):
        code, _, _ = self.add()
        self.assertEqual(code, 0)
        entry = self.index()[0]
        self.assertEqual(entry["brand"], "rebrew")
        self.assertEqual(entry["format"], "ig-carousel")
        self.assertEqual(entry["size"], "1080x1350")
        self.assertEqual(entry["tags"], ["cover"])

    def test_duplicate_name_is_rejected(self):
        self.add()
        code, _, err = self.add()
        self.assertEqual(code, 1)
        self.assertIn("already exists", err)
        self.assertEqual(len(self.index()), 1)

    def test_invalid_source_is_rejected(self):
        code, _, err = self.add(source="guess")
        self.assertEqual(code, 1)
        self.assertIn("--source", err)

    def test_malformed_size_is_rejected(self):
        code, _, err = self.add(size="big")
        self.assertEqual(code, 1)
        self.assertIn("--size", err)

    def test_unknown_format_warns_but_still_adds(self):
        code, _, err = self.add(fmt="pinterest-pin")
        self.assertEqual(code, 0)
        self.assertIn("not a standard format", err)
        self.assertEqual(len(self.index()), 1)


class ListTest(LibraryTestCase):
    def setUp(self):
        super().setUp()
        self.add(name="rebrew-cover", brand="rebrew", fmt="ig-carousel", tags="cover")
        self.add(name="undangoo-cover", brand="undangoo", fmt="ig-carousel", tags="cover")
        self.add(name="rebrew-thumb", brand="rebrew", fmt="yt-thumbnail", size="1280x720", tags="video")

    def test_filter_by_brand_keeps_brands_apart(self):
        _, out, _ = self.run_cmd(["list", "--brand", "undangoo"])
        self.assertIn("undangoo-cover", out)
        self.assertNotIn("rebrew-cover", out)

    def test_filter_by_brand_and_format(self):
        _, out, _ = self.run_cmd(["list", "--brand", "rebrew", "--format", "yt-thumbnail"])
        self.assertIn("rebrew-thumb", out)
        self.assertNotIn("rebrew-cover", out)

    def test_query_matches_tags(self):
        _, out, _ = self.run_cmd(["list", "--query", "video"])
        self.assertIn("rebrew-thumb", out)
        self.assertNotIn("undangoo-cover", out)

    def test_no_match_says_so(self):
        _, out, _ = self.run_cmd(["list", "--brand", "nonexistent"])
        self.assertIn("No matching templates", out)


class UpdateRemoveTest(LibraryTestCase):
    def test_rename_onto_existing_name_is_rejected(self):
        self.add(name="a")
        self.add(name="b")
        code, _, err = self.run_cmd(["update", "--name", "a", "--rename", "b"])
        self.assertEqual(code, 1)
        self.assertIn("already exists", err)
        self.assertEqual(sorted(e["id"] for e in self.index()), ["a", "b"])

    def test_update_size_is_validated(self):
        self.add()
        code, _, _ = self.run_cmd(["update", "--name", "rebrew-carousel-cover", "--size", "nope"])
        self.assertEqual(code, 1)
        self.assertEqual(self.index()[0]["size"], "1080x1350")

    def test_remove_deletes_entry_and_html_file(self):
        self.add()
        html = self.lib / "ig-carousel" / "rebrew-carousel-cover.html"
        html.parent.mkdir(parents=True, exist_ok=True)
        html.write_text("<html></html>", encoding="utf-8")
        code, _, _ = self.run_cmd(["remove", "--name", "rebrew-carousel-cover"])
        self.assertEqual(code, 0)
        self.assertFalse(html.exists())
        self.assertEqual(self.index(), [])


if __name__ == "__main__":
    unittest.main()
