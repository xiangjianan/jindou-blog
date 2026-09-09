// 连接自检：node --env-file=.e nv scripts/db-ping.mjs (dotenv 不依赖 nuxt)
import mariadb from "mariadb";

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL missing in env");
  process.exit(1);
}
const url = new URL(raw);
console.log("target:", url.hostname + ":" + url.port, "db:", url.pathname.slice(1));
const t0 = Date.now();
try {
  const pool = mariadb.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 2,
    connectTimeout: 8000,
  });
  const conn = await pool.getConnection();
  const rows = await conn.query("SELECT COUNT(*) AS c FROM Post");
  console.log(`OK in ${Date.now() - t0}ms, posts=${rows[0].c}`);
  await conn.release();
  await pool.end();
} catch (e) {
  console.error(`FAIL after ${Date.now() - t0}ms:`, e.message);
  process.exit(1);
}
