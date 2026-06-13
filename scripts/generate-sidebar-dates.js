const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../src/content/docs');
const dateMap = {};

function addDateKey(key, date) {
  dateMap[key] = date;
  dateMap[key.toLowerCase()] = date;
  dateMap[key.replace(/\./g, '')] = date;
  dateMap[key.toLowerCase().replace(/\./g, '')] = date;
}

function walkDir(dir, base = '') {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkDir(full, path.join(base, file));
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      const content = fs.readFileSync(full, 'utf-8');
      const dateMatch = content.match(/^---[\s\S]*?date:\s*"?([^"\n]+)"?/m);
      if (dateMatch) {
        const slug = base ? `${base}/${file.replace(/\.(mdx|md)$/, '')}` : file.replace(/\.(mdx|md)$/, '');
        const key = slug.split('/').pop();
        addDateKey(key, dateMatch[1]);
        addDateKey(slug, dateMatch[1]);
      }
    }
  }
}

walkDir(docsDir);
fs.writeFileSync(
  path.join(__dirname, '../public/sidebar-dates.json'),
  JSON.stringify(dateMap, null, 2)
);
console.log(`Generated sidebar-dates.json with ${Object.keys(dateMap).length} entries`);
