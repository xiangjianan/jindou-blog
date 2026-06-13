// sidebar-dates.js - Fetches date map and sorts/displays dates in sidebar
(function() {
  function initSidebarDates() {
    fetch('/sidebar-dates.json')
      .then(r => r.json())
      .then(dateMap => applyDates(dateMap))
      .catch(() => {});
  }

  function applyDates(dateMap) {
    document.querySelectorAll('.sidebar-content').forEach(function(content) {
      Array.from(content.querySelectorAll('a[href]')).forEach(function(link) {
        applyDateLabel(link, dateMap);
      });
    });
    centerCurrentSidebarItem();
  }

  function getLinkDate(link, dateMap) {
    var href = link.getAttribute('href') || '';
    var slug = href.replace(/^\/+|\/+$/g, '').split('/').pop() || '';
    var fullSlug = href.replace(/^\/+|\/+$/g, '');
    return dateMap[fullSlug] || dateMap[slug] || '';
  }

  function applyDateLabel(link, dateMap) {
    var dateStr = getLinkDate(link, dateMap);
    if (!dateStr) return;

    link.dataset.sortDate = dateStr;
    if (!link.querySelector('.sidebar-date')) {
      var span = document.createElement('span');
      span.className = 'sidebar-date';
      span.textContent = dateStr.substring(0, 10);
      link.appendChild(span);
    }
  }

  function centerCurrentSidebarItem() {
    var sidebar = document.getElementById('starlight__sidebar');
    var currentLink = sidebar && sidebar.querySelector('a[aria-current="page"]');
    if (!sidebar || !currentLink) return;

    requestAnimationFrame(function() {
      var linkRect = currentLink.getBoundingClientRect();
      var sidebarRect = sidebar.getBoundingClientRect();
      var linkCenter = linkRect.top - sidebarRect.top + sidebar.scrollTop + linkRect.height / 2;
      var targetTop = Math.max(0, linkCenter - sidebar.clientHeight / 2);
      sidebar.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  }

  function run() {
    initSidebarDates();
  }

  // Run on Astro page transitions
  document.addEventListener('astro:page-load', run);
  document.addEventListener('astro:after-swap', run);
  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(run, 300); });
  } else {
    setTimeout(run, 300);
  }
})();
