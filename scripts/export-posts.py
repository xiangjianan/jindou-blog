#!/usr/bin/env python3
"""Export posts from dev.db to content/posts/*.md (git-friendly article archive).

The live blog reads from dev.db at build time; this export is the durable
copy that lives in the git repo. Run after each content sync:
    python3 scripts/export-posts.py
"""
import os
import sqlite3
import sys

BLOG_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BLOG_ROOT, "dev.db")
OUT_DIR = os.path.join(BLOG_ROOT, "content", "posts")


def frontmatter_escape(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main() -> int:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT id, title, slug, content, excerpt, coverImage, category, tags,"
        " published, createdAt, updatedAt FROM Post ORDER BY id"
    ).fetchall()
    os.makedirs(OUT_DIR, exist_ok=True)

    # Clean stale exports (posts may have been deleted/renamed in DB)
    for f in os.listdir(OUT_DIR):
        if f.endswith(".md"):
            os.remove(os.path.join(OUT_DIR, f))

    for r in rows:
        tags = [t.strip() for t in str(r["tags"]).split(",") if t.strip()]
        tags_yaml = "\n".join(f"  - {t}" for t in tags) if tags else "  - 未分类"
        fm = [
            "---",
            f"title: {frontmatter_escape(r['title'])}",
            f"slug: {frontmatter_escape(r['slug'])}",
            f"excerpt: {frontmatter_escape(r['excerpt'])}",
            f"category: {frontmatter_escape(r['category'])}",
            "tags:",
            tags_yaml,
            f"published: {'true' if r['published'] else 'false'}",
            f"createdAt: {frontmatter_escape(str(r['createdAt']))}",
            f"updatedAt: {frontmatter_escape(str(r['updatedAt']))}",
        ]
        if r["coverImage"]:
            fm.append(f"coverImage: {frontmatter_escape(r['coverImage'])}")
        fm.append(f"postId: {r['id']}")
        fm.append("---")
        body = str(r["content"]).lstrip()
        out = "\n".join(fm) + "\n\n" + body + "\n"
        path = os.path.join(OUT_DIR, f"{r['slug']}.md")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(out)
    print(f"exported {len(rows)} posts -> {OUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
