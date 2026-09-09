#!/usr/bin/env python3
"""Export posts from the live MySQL database to content/posts/*.md (git-friendly archive).

Auth: ~/.myblog.cnf (SSH tunnel 127.0.0.1:3307 -> aliyun, see scripts/mysql-tunnel.sh).
Usage: python3 scripts/export-posts.py
"""
import json
import os
import subprocess
import sys

BLOG_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BLOG_ROOT, "content", "posts")
CNF = os.path.expanduser("~/.myblog.cnf")

QUERY = (
    "SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT("
    "'id', id, 'title', title, 'slug', slug, 'content', content, 'excerpt', excerpt,"
    "'coverImage', coverImage, 'category', category, 'tags', tags,"
    "'published', published, 'createdAt', createdAt, 'updatedAt', updatedAt)), '[]') "
    "FROM Post"
)


def norm_date(s):
    """MySQL DATETIME 可能带 .000000 微秒尾巴，规整为 YYYY-MM-DD HH:MM:SS"""
    s = str(s)
    return s[:19] if len(s) > 19 and s[4] == "-" and s[10] == " " else s


def fm_str(s):
    return '"' + str(s).replace("\\", "\\\\").replace('"', '\\"') + '"'


def main() -> int:
    proc = subprocess.run(
        ["mysql", f"--defaults-extra-file={CNF}", "-N", "-B", "--raw", "-e", QUERY, "blog"],
        capture_output=True,
    )
    if proc.returncode != 0:
        print("mysql 查询失败:", proc.stderr.decode("utf-8", "replace")[:1000])
        return 1
    posts = json.loads(proc.stdout.decode("utf-8").strip())

    os.makedirs(OUT_DIR, exist_ok=True)
    for f in os.listdir(OUT_DIR):
        if f.endswith(".md"):
            os.remove(os.path.join(OUT_DIR, f))

    for p in posts:
        tags = [t.strip() for t in str(p["tags"] or "").split(",") if t.strip()]
        fm = [
            "---",
            f"title: {fm_str(p['title'])}",
            f"slug: {fm_str(p['slug'])}",
            f"excerpt: {fm_str(p['excerpt'])}",
            f"category: {fm_str(p['category'])}",
            "tags:",
            *[f"  - {t}" for t in tags],
            f"published: {'true' if p['published'] else 'false'}",
            f"createdAt: {fm_str(norm_date(p['createdAt']))}",
            f"updatedAt: {fm_str(norm_date(p['updatedAt']))}",
            f"postId: {p['id']}",
        ]
        if p.get("coverImage"):
            fm.append(f"coverImage: {fm_str(p['coverImage'])}")
        fm.append("---")
        body = str(p["content"]).replace("\r\n", "\n").strip()
        with open(os.path.join(OUT_DIR, f"{p['slug']}.md"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(fm) + "\n\n" + body + "\n")

    print(f"exported {len(posts)} posts -> {OUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
