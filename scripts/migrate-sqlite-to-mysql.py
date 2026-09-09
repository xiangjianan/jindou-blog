#!/usr/bin/env python3
"""One-shot: migrate dev.db (SQLite) -> Aliyun MySQL `blog` database.

Usage: python3 scripts/migrate-sqlite-to-mysql.py
Auth comes from ~/.myblog.cnf via the mysql CLI. Idempotent: truncates target tables first.
"""
import datetime
import sqlite3
import subprocess
import sys

DB = "/Users/xiangjianan/.openclaw/workspace/github/blog/dev.db"
CNF = "/Users/xiangjianan/.myblog.cnf"


def norm_dt(v: str) -> str:
    """Normalize SQLite datetime (ISO or space form) to MySQL DATETIME literal (UTC naive)."""
    v = str(v).strip()
    try:
        d = datetime.datetime.fromisoformat(v.replace("Z", "+00:00"))
        if d.tzinfo:
            d = d.astimezone(datetime.datetime.timezone.utc).replace(tzinfo=None)
        return d.strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        return v.replace("T", " ")[:19]


def esc(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v).replace("\\", "\\\\").replace("'", "''")
    return f"'{s}'"


def rows_to_inserts(table: str, rows, cols) -> list[str]:
    stmts = []
    for r in rows:
        vals = ", ".join(esc(r[c]) for c in cols)
        stmts.append(f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({vals});")
    return stmts


def main() -> int:
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row

    posts = conn.execute(
        "SELECT id, title, slug, content, excerpt, coverImage, category, tags,"
        " published, createdAt, updatedAt FROM Post"
    ).fetchall()
    users = conn.execute(
        "SELECT id, username, password, createdAt, updatedAt FROM User"
    ).fetchall()

    stmts = ["SET NAMES utf8mb4;", "SET FOREIGN_KEY_CHECKS=0;", "SET UNIQUE_CHECKS=0;",
             "START TRANSACTION;", "TRUNCATE TABLE Post;", "TRUNCATE TABLE User;"]
    stmts += rows_to_inserts(
        "Post", posts,
        ["id", "title", "slug", "content", "excerpt", "coverImage", "category",
         "tags", "published", "createdAt", "updatedAt"])
    # normalize datetimes inside Post rows
    fixed = []
    for s in stmts:
        if s.startswith("INSERT INTO Post"):
            import re
            s = re.sub(r"'(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:\+\d{2}:\d{2})?'",
                       r"'\1 \2'", s)
        fixed.append(s)
    stmts = fixed
    stmts += rows_to_inserts("User", users,
                             ["id", "username", "password", "createdAt", "updatedAt"])
    stmts += ["SET UNIQUE_CHECKS=1;", "SET FOREIGN_KEY_CHECKS=1;", "COMMIT;"]

    dump = "\n".join(stmts) + "\n"
    proc = subprocess.run(
        ["mysql", f"--defaults-extra-file={CNF}", "blog"],
        input=dump.encode("utf-8"), capture_output=True,
    )
    if proc.returncode != 0:
        print("MySQL 导入失败:", proc.stderr.decode("utf-8", "replace")[:2000])
        return 1
    print(f"✅ 迁移完成: {len(posts)} posts, {len(users)} users -> MySQL blog")
    return 0


if __name__ == "__main__":
    sys.exit(main())
