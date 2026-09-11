#!/usr/bin/env python3
"""
Manage library/index.json for the social-design skill.

This script is the only thing that should write to library/index.json.
Each entry is one reusable post TEMPLATE (a self-contained HTML file at exact
platform pixel dimensions). The HTML itself is written/edited directly with
normal file tools; this script only tracks metadata about it.

`brand` keeps templates for different products apart (the same library holds
templates for several brands); `size` is what render_post.py needs.

Usage:
  python manage_library.py add --name NAME --brand BRAND --format FORMAT \
      --size 1080x1350 --file RELATIVE/PATH.html --description "..." \
      [--tags a,b,c] [--source prompt|image|code|extract]
  python manage_library.py list [--brand B] [--format F] [--tag T] [--query TEXT]
  python manage_library.py get --name NAME
  python manage_library.py update --name NAME [--description ...] [--tags ...] \
      [--format ...] [--size ...] [--rename NEW_NAME]
  python manage_library.py remove --name NAME
"""

import argparse
import json
import re
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
LIBRARY_DIR = SKILL_DIR / "library"
INDEX_PATH = LIBRARY_DIR / "index.json"

VALID_SOURCES = {"prompt", "image", "code", "extract"}
KNOWN_FORMATS = {
    "ig-feed", "ig-carousel", "ig-story", "ig-reels-cover",
    "tiktok-cover", "yt-thumbnail", "yt-shorts-cover",
    "x-image", "threads-image", "wa-status",
}
SIZE_PATTERN = re.compile(r"^\d{2,5}x\d{2,5}$")


def load_index():
    if not INDEX_PATH.exists():
        return []
    content = INDEX_PATH.read_text(encoding="utf-8").strip()
    return json.loads(content) if content else []


def save_index(entries):
    LIBRARY_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_PATH.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.strip().lower()).strip("-")


def find_entry(entries, name):
    slug = slugify(name)
    for entry in entries:
        if entry["id"] == slug or entry["name"].lower() == name.strip().lower():
            return entry
    return None


def validate_size(size):
    if not SIZE_PATTERN.match(size):
        print(f"Error: --size must look like 1080x1350, got '{size}'", file=sys.stderr)
        sys.exit(1)


def warn_unknown_format(fmt):
    if fmt not in KNOWN_FORMATS:
        print(f"Warning: '{fmt}' is not a standard format ({sorted(KNOWN_FORMATS)}). Proceeding anyway.",
              file=sys.stderr)


def parse_tags(raw):
    return [t.strip() for t in raw.split(",") if t.strip()] if raw else []


def cmd_add(args):
    entries = load_index()
    slug = slugify(args.name)
    if find_entry(entries, args.name):
        print(f"Error: a template named '{args.name}' already exists (id: {slug}). "
              f"Use 'update' instead, or pick a different name.", file=sys.stderr)
        sys.exit(1)

    if args.source not in VALID_SOURCES:
        print(f"Error: --source must be one of {sorted(VALID_SOURCES)}", file=sys.stderr)
        sys.exit(1)
    validate_size(args.size)
    warn_unknown_format(args.format)

    if not (LIBRARY_DIR / args.file).exists():
        print(f"Warning: {LIBRARY_DIR / args.file} does not exist yet. "
              f"Write the template HTML there before (or right after) registering it.", file=sys.stderr)

    entry = {
        "id": slug,
        "name": args.name.strip(),
        "brand": args.brand.strip(),
        "format": args.format.strip(),
        "size": args.size,
        "tags": parse_tags(args.tags),
        "source": args.source,
        "description": args.description.strip(),
        "file": args.file,
    }
    entries.append(entry)
    save_index(entries)
    print(f"Added template '{entry['name']}' (id: {slug}, brand: {entry['brand']}).")


def matches(entry, args):
    if args.brand and entry.get("brand", "").lower() != args.brand.lower():
        return False
    if args.format and entry.get("format", "").lower() != args.format.lower():
        return False
    if args.tag and args.tag.lower() not in [t.lower() for t in entry.get("tags", [])]:
        return False
    if args.query:
        q = args.query.lower()
        haystack = [entry["name"], entry.get("description", ""), entry.get("brand", ""),
                    entry.get("format", ""), *entry.get("tags", [])]
        if not any(q in field.lower() for field in haystack):
            return False
    return True


def cmd_list(args):
    entries = [e for e in load_index() if matches(e, args)]
    if not entries:
        print("No matching templates found.")
        return
    for e in entries:
        print(f"- {e['name']}  [{e.get('brand', '?')} · {e.get('format', '?')} · {e.get('size', '?')}]"
              f"  (source: {e.get('source', 'prompt')})")
        print(f"    tags: {', '.join(e.get('tags', [])) or '(none)'}")
        print(f"    {e.get('description', '')}")
        print(f"    file: library/{e['file']}")


def cmd_get(args):
    entry = find_entry(load_index(), args.name)
    if not entry:
        print(f"Error: no template named '{args.name}' found.", file=sys.stderr)
        sys.exit(1)
    print(json.dumps(entry, indent=2, ensure_ascii=False))
    html_path = LIBRARY_DIR / entry["file"]
    if html_path.exists():
        print("\n--- html ---")
        print(html_path.read_text(encoding="utf-8"))
    else:
        print(f"\n(warning: template file {html_path} is missing)", file=sys.stderr)


def cmd_update(args):
    entries = load_index()
    entry = find_entry(entries, args.name)
    if not entry:
        print(f"Error: no template named '{args.name}' found.", file=sys.stderr)
        sys.exit(1)

    if args.description is not None:
        entry["description"] = args.description
    if args.tags is not None:
        entry["tags"] = parse_tags(args.tags)
    if args.format is not None:
        warn_unknown_format(args.format)
        entry["format"] = args.format
    if args.size is not None:
        validate_size(args.size)
        entry["size"] = args.size
    if args.rename is not None:
        new_slug = slugify(args.rename)
        clash = find_entry(entries, args.rename)
        if clash and clash is not entry:
            print(f"Error: a template named '{args.rename}' already exists.", file=sys.stderr)
            sys.exit(1)
        entry["name"] = args.rename
        entry["id"] = new_slug

    save_index(entries)
    print(f"Updated '{entry['name']}'.")


def cmd_remove(args):
    entries = load_index()
    entry = find_entry(entries, args.name)
    if not entry:
        print(f"Error: no template named '{args.name}' found.", file=sys.stderr)
        sys.exit(1)
    html_path = LIBRARY_DIR / entry["file"]
    if html_path.exists():
        html_path.unlink()
    save_index([e for e in entries if e["id"] != entry["id"]])
    print(f"Removed template '{entry['name']}' from the library.")


def build_parser():
    parser = argparse.ArgumentParser(description="Manage the social-design template library")
    sub = parser.add_subparsers(dest="command", required=True)

    p_add = sub.add_parser("add", help="Register a new post template")
    p_add.add_argument("--name", required=True)
    p_add.add_argument("--brand", required=True, help="Product/brand this template belongs to, e.g. 'rebrew'")
    p_add.add_argument("--format", required=True, help=f"One of {sorted(KNOWN_FORMATS)}")
    p_add.add_argument("--size", required=True, help="Pixel size, e.g. 1080x1350")
    p_add.add_argument("--file", required=True, help="Path relative to library/")
    p_add.add_argument("--description", required=True)
    p_add.add_argument("--tags", default="")
    p_add.add_argument("--source", default="prompt", help="prompt|image|code|extract")
    p_add.set_defaults(func=cmd_add)

    p_list = sub.add_parser("list", help="List templates, optionally filtered")
    p_list.add_argument("--brand")
    p_list.add_argument("--format")
    p_list.add_argument("--tag")
    p_list.add_argument("--query")
    p_list.set_defaults(func=cmd_list)

    p_get = sub.add_parser("get", help="Show metadata + HTML for one template")
    p_get.add_argument("--name", required=True)
    p_get.set_defaults(func=cmd_get)

    p_update = sub.add_parser("update", help="Update template metadata")
    p_update.add_argument("--name", required=True)
    p_update.add_argument("--description")
    p_update.add_argument("--tags")
    p_update.add_argument("--format")
    p_update.add_argument("--size")
    p_update.add_argument("--rename")
    p_update.set_defaults(func=cmd_update)

    p_remove = sub.add_parser("remove", help="Remove a template and its HTML file")
    p_remove.add_argument("--name", required=True)
    p_remove.set_defaults(func=cmd_remove)
    return parser


def main():
    args = build_parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
