// Fix Starlight sidebar links missing base path on splash page
document.addEventListener('astro:page-load', () => {
  const base = document.querySelector('base')?.getAttribute('href') || '/jindou-blog/';
  document.querySelectorAll('a[href^="/"]').forEach(a => {
    // Skip anchors and external links
    if (a.getAttribute('href')?.startsWith('/#') || a.getAttribute('href')?.startsWith('//')) return;
    const href = a.getAttribute('href');
    if (!href?.startsWith(base)) {
      a.setAttribute('href', base.replace(/\/$/, '') + href);
    }
  });
});
