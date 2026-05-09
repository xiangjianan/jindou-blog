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
      var ul = content.querySelector(':scope > ul');
      if (!ul) return;

      var items = Array.from(ul.children);
      
      items.forEach(function(li) {
        var link = li.querySelector(':scope > a');
        if (!link) return;
        var href = link.getAttribute('href') || '';
        var slug = href.replace(/^\/+|\/+$/g, '').split('/').pop() || '';
        var fullSlug = href.replace(/^\/+|\/+$/g, '');
        var dateStr = dateMap[slug] || dateMap[fullSlug];
        
        if (dateStr) {
          link.dataset.sortDate = dateStr;
          if (!link.querySelector('.sidebar-date')) {
            var span = document.createElement('span');
            span.className = 'sidebar-date';
            span.textContent = dateStr.substring(0, 10);
            link.appendChild(span);
          }
        }
      });

      // Sort by date descending (newest first)
      items.sort(function(a, b) {
        var dateA = a.querySelector('a') ? a.querySelector('a').dataset.sortDate : '';
        var dateB = b.querySelector('a') ? b.querySelector('a').dataset.sortDate : '';
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.localeCompare(dateA);
      });

      items.forEach(function(item) { ul.appendChild(item); });
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
