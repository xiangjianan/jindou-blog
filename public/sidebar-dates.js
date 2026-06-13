// sidebar-dates.js - Fetches date map and sorts/displays dates in sidebar
(function() {
  var lastSidebarScrollTop = null;

  function initSidebarDates(scrollMode) {
    fetch('/sidebar-dates.json')
      .then(r => r.json())
      .then(dateMap => applyDates(dateMap, scrollMode))
      .catch(() => {});
  }

  function applyDates(dateMap, scrollMode) {
    document.querySelectorAll('.sidebar-content').forEach(function(content) {
      Array.from(content.querySelectorAll('a[href]')).forEach(function(link) {
        applyDateLabel(link, dateMap);
      });
    });
    syncCurrentSidebarLink();
    scrollCurrentSidebarItem(scrollMode);
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

  function normalizePath(path) {
    try {
      var pathname = new URL(path, window.location.origin).pathname;
      return pathname.replace(/\/index\/?$/, '/').replace(/\/?$/, '/');
    } catch {
      return path.replace(/\/?$/, '/');
    }
  }

  function syncCurrentSidebarLink() {
    var currentPath = normalizePath(window.location.pathname);
    document.querySelectorAll('.sidebar-content a[href]').forEach(function(link) {
      var linkPath = normalizePath(link.getAttribute('href') || '');
      if (linkPath === currentPath) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function scrollCurrentSidebarItem(mode) {
    var sidebar = document.getElementById('starlight__sidebar');
    var currentLink = sidebar && sidebar.querySelector('a[aria-current="page"]');
    if (!sidebar || !currentLink) return;

    requestAnimationFrame(function() {
      var linkRect = currentLink.getBoundingClientRect();
      var sidebarRect = sidebar.getBoundingClientRect();
      var margin = 24;
      var targetTop = sidebar.scrollTop;

      if (mode === 'center') {
        var linkCenter = linkRect.top - sidebarRect.top + sidebar.scrollTop + linkRect.height / 2;
        targetTop = linkCenter - sidebar.clientHeight / 2;
      } else if (linkRect.top < sidebarRect.top + margin) {
        targetTop = sidebar.scrollTop + linkRect.top - sidebarRect.top - margin;
      } else if (linkRect.bottom > sidebarRect.bottom - margin) {
        targetTop = sidebar.scrollTop + linkRect.bottom - sidebarRect.bottom + margin;
      } else {
        return;
      }

      targetTop = Math.max(0, Math.min(targetTop, sidebar.scrollHeight - sidebar.clientHeight));
      sidebar.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  }

  function restoreSidebarScrollThenSync() {
    var sidebar = document.getElementById('starlight__sidebar');
    if (!sidebar || lastSidebarScrollTop === null) {
      initSidebarDates('nearest');
      return;
    }

    var savedScrollTop = lastSidebarScrollTop;
    var previousScrollBehavior = sidebar.style.scrollBehavior;
    var startedAt = performance.now();
    sidebar.style.scrollBehavior = 'auto';

    function keepRestored() {
      sidebar.scrollTop = savedScrollTop;
      if (performance.now() - startedAt < 260) {
        requestAnimationFrame(keepRestored);
        return;
      }

      sidebar.style.scrollBehavior = previousScrollBehavior;
      initSidebarDates('nearest');
      lastSidebarScrollTop = null;
    }

    keepRestored();
  }

  document.addEventListener('astro:before-swap', function() {
    var sidebar = document.getElementById('starlight__sidebar');
    lastSidebarScrollTop = sidebar ? sidebar.scrollTop : null;
  });

  document.addEventListener('astro:after-swap', function() {
    restoreSidebarScrollThenSync();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() { initSidebarDates('center'); }, 300);
    });
  } else {
    setTimeout(function() { initSidebarDates('center'); }, 300);
  }
})();
