/**
 * TNETZ Premium Customer Portal — Custom JS
 * Multi-Region Subscribe URL Selector + Dashboard UI Enhancements
 */
(function() {
  'use strict';

  // ============ CSS INJECTION ============
  var style = document.createElement('style');
  style.textContent = `
    /* Region Selector Modal */
    .tnetz-region-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15,23,42,0.6); backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.25s ease;
    }
    .tnetz-region-overlay.show { opacity: 1; }
    .tnetz-region-modal {
      background: #fff; border-radius: 20px; padding: 28px 24px 24px; width: 440px; max-width: 92vw;
      max-height: 85vh; overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04);
      transform: scale(0.95) translateY(10px); transition: transform 0.25s ease;
    }
    .tnetz-region-overlay.show .tnetz-region-modal { transform: scale(1) translateY(0); }
    .tnetz-region-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
    }
    .tnetz-region-header-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; color: #fff; flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }
    .tnetz-region-title {
      font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700;
      color: #0f172a; letter-spacing: -0.02em;
    }
    .tnetz-region-subtitle {
      font-family: 'Inter', sans-serif; font-size: 12.5px; color: #94a3b8; margin-top: 2px;
    }
    .tnetz-region-card {
      background: #f8fafc; border: 2px solid #e2e8f0;
      border-radius: 14px; padding: 14px 16px; margin-bottom: 8px;
      cursor: pointer; transition: all 0.2s ease;
      display: flex; align-items: center; gap: 12px;
    }
    .tnetz-region-card:hover {
      border-color: #818cf8; background: #f0f0ff;
      transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.08);
    }
    .tnetz-region-card.active {
      border-color: #6366f1;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      box-shadow: 0 4px 20px rgba(99,102,241,0.25);
    }
    .tnetz-region-card.active .tnetz-region-name,
    .tnetz-region-card.active .tnetz-region-url { color: #fff; }
    .tnetz-region-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0; background: rgba(99,102,241,0.08);
    }
    .tnetz-region-card.active .tnetz-region-icon { background: rgba(255,255,255,0.2); }
    .tnetz-region-info { flex: 1; min-width: 0; }
    .tnetz-region-name {
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
      color: #1e293b;
    }
    .tnetz-region-url {
      font-size: 11px; color: #94a3b8; margin-top: 2px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-family: 'JetBrains Mono', monospace;
    }
    .tnetz-region-actions { display: flex; gap: 8px; margin-top: 16px; }
    .tnetz-region-btn {
      flex: 1; padding: 12px; border: none; border-radius: 12px;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s ease;
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .tnetz-region-btn-copy {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.25);
    }
    .tnetz-region-btn-copy:hover {
      transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.35);
    }
    .tnetz-region-btn-close { background: #f1f5f9; color: #475569; }
    .tnetz-region-btn-close:hover { background: #e2e8f0; }
    .tnetz-copy-toast {
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: linear-gradient(135deg, #10b981, #059669); color: #fff;
      padding: 12px 28px; border-radius: 12px;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
      z-index: 10001; box-shadow: 0 8px 24px rgba(16,185,129,0.3);
      opacity: 0; transition: all 0.25s ease; pointer-events: none;
    }
    .tnetz-copy-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* Region Widget on Dashboard */
    .tnetz-region-widget {
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%);
      border-radius: 16px; padding: 20px 24px; margin-bottom: 16px;
      cursor: pointer; transition: all 0.25s ease; position: relative;
      overflow: hidden; box-shadow: 0 4px 20px rgba(99,102,241,0.2);
    }
    .tnetz-region-widget:hover {
      transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,0.3);
    }
    .tnetz-region-widget::after {
      content: ''; position: absolute; top: -30%; right: -5%; width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%);
      border-radius: 50%; pointer-events: none;
    }
    .tnetz-region-widget-inner {
      display: flex; align-items: center; gap: 14px; position: relative; z-index: 1;
    }
    .tnetz-region-widget-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: rgba(255,255,255,0.2); display: flex; align-items: center;
      justify-content: center; font-size: 24px; flex-shrink: 0;
      backdrop-filter: blur(8px);
    }
    .tnetz-region-widget-text h3 {
      font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700;
      color: #fff; margin: 0; letter-spacing: -0.01em;
    }
    .tnetz-region-widget-text p {
      font-family: 'Inter', sans-serif; font-size: 12.5px; color: rgba(255,255,255,0.8);
      margin: 3px 0 0;
    }
    .tnetz-region-widget-arrow {
      margin-left: auto; font-size: 20px; color: rgba(255,255,255,0.7);
      transition: transform 0.2s ease;
    }
    .tnetz-region-widget:hover .tnetz-region-widget-arrow { transform: translateX(3px); }

    /* Dashboard Welcome Banner Enhancement */
    .tnetz-welcome-banner {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
      border-radius: 20px; padding: 28px 32px; margin-bottom: 20px;
      color: #fff; position: relative; overflow: hidden;
      box-shadow: 0 8px 32px rgba(99,102,241,0.2);
    }
    .tnetz-welcome-banner::after {
      content: ''; position: absolute; top: -40%; right: -10%; width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      border-radius: 50%;
    }
    .tnetz-welcome-banner h2 {
      font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 700;
      margin: 0; letter-spacing: -0.02em; position: relative; z-index: 1;
    }
    .tnetz-welcome-banner p {
      font-size: 13.5px; opacity: 0.85; margin: 6px 0 0;
      position: relative; z-index: 1;
    }

    /* Quick stats row */
    .tnetz-quick-stats {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px; margin-bottom: 20px;
    }
    .tnetz-stat-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 18px 20px; transition: all 0.2s ease;
    }
    .tnetz-stat-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.05); transform: translateY(-1px);
    }
    .tnetz-stat-label {
      font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
      color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .tnetz-stat-value {
      font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 800;
      color: #0f172a; margin-top: 4px; letter-spacing: -0.02em;
    }
    .tnetz-stat-icon {
      float: right; font-size: 28px; opacity: 0.15; margin-top: -4px;
    }

    @media (max-width: 768px) {
      .tnetz-welcome-banner { padding: 20px 22px; border-radius: 16px; }
      .tnetz-welcome-banner h2 { font-size: 18px; }
      .tnetz-quick-stats { grid-template-columns: 1fr 1fr; gap: 8px; }
      .tnetz-stat-card { padding: 14px 16px; }
      .tnetz-stat-value { font-size: 18px; }
      .tnetz-region-modal { padding: 20px 18px 18px; }
      .tnetz-region-widget { padding: 16px 20px; }
    }
  `;
  document.head.appendChild(style);

  // ============ REGION ICONS ============
  var regionIcons = {
    'default': '🌐', 'china': '🇨🇳', 'trung': '🇨🇳', 'russia': '🇷🇺', 'nga': '🇷🇺',
    'vietnam': '🇻🇳', 'việt': '🇻🇳', 'japan': '🇯🇵', 'nhật': '🇯🇵',
    'korea': '🇰🇷', 'hàn': '🇰🇷', 'us': '🇺🇸', 'mỹ': '🇺🇸', 'singapore': '🇸🇬',
    'europe': '🇪🇺', 'châu âu': '🇪🇺', 'hong kong': '🇭🇰', 'hk': '🇭🇰',
    'taiwan': '🇹🇼', 'đài': '🇹🇼', 'mặc': '🌐'
  };

  function getIcon(name) {
    var lower = (name || '').toLowerCase();
    for (var key in regionIcons) {
      if (lower.indexOf(key) !== -1) return regionIcons[key];
    }
    return '🌍';
  }

  // ============ UTILITIES ============
  var selectedUrl = '';
  var overlayEl = null;
  var toastEl = null;
  var cachedUrls = null;

  function getAuth() {
    return localStorage.getItem('auth_data') || sessionStorage.getItem('auth_data') || '';
  }

  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'tnetz-copy-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function() { toastEl.classList.remove('show'); }, 2500);
  }

  function copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('✅ Đã sao chép link đăng ký!');
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✅ Đã sao chép link đăng ký!');
    }
  }

  // ============ FETCH SUBSCRIBE URLS ============
  function fetchAndShowRegion() {
    if (cachedUrls) {
      showRegionSelector(cachedUrls);
      return;
    }
    fetch('/api/v1/user/getSubscribe', {
      headers: { 'Authorization': getAuth() }
    }).then(function(r) { return r.json(); })
    .then(function(data) {
      var urls = data.data && data.data.subscribe_urls;
      if (urls && urls.length > 1) {
        cachedUrls = urls;
        showRegionSelector(urls);
      } else if (urls && urls.length === 1) {
        copyText(urls[0].url);
      } else {
        var defaultUrl = data.data && data.data.subscribe_url;
        if (defaultUrl) copyText(defaultUrl);
        else showToast('⚠️ Chưa cấu hình URL đăng ký');
      }
    }).catch(function() {
      showToast('❌ Lỗi tải danh sách khu vực');
    });
  }

  // ============ REGION SELECTOR MODAL ============
  function showRegionSelector(urls) {
    if (overlayEl) overlayEl.remove();
    selectedUrl = urls[0] ? urls[0].url : '';

    overlayEl = document.createElement('div');
    overlayEl.className = 'tnetz-region-overlay';
    overlayEl.innerHTML =
      '<div class="tnetz-region-modal">' +
        '<div class="tnetz-region-header">' +
          '<div class="tnetz-region-header-icon">🌍</div>' +
          '<div>' +
            '<div class="tnetz-region-title">Chọn khu vực đăng ký</div>' +
            '<div class="tnetz-region-subtitle">Chọn server khu vực gần bạn nhất để lấy link đồng bộ</div>' +
          '</div>' +
        '</div>' +
        '<div id="tnetz-region-list"></div>' +
        '<div class="tnetz-region-actions">' +
          '<button class="tnetz-region-btn tnetz-region-btn-close" id="tnetz-region-close">Đóng</button>' +
          '<button class="tnetz-region-btn tnetz-region-btn-copy" id="tnetz-region-copy">📋 Sao chép link</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlayEl);
    var list = document.getElementById('tnetz-region-list');

    urls.forEach(function(item, idx) {
      var card = document.createElement('div');
      card.className = 'tnetz-region-card' + (idx === 0 ? ' active' : '');
      card.dataset.url = item.url;
      var icon = item.icon || getIcon(item.name);
      var domain = '';
      try { domain = new URL(item.url.split('?')[0]).hostname; } catch(e) { domain = item.url.split('?')[0]; }
      card.innerHTML =
        '<div class="tnetz-region-icon">' + icon + '</div>' +
        '<div class="tnetz-region-info">' +
          '<div class="tnetz-region-name">' + item.name + '</div>' +
          '<div class="tnetz-region-url">' + domain + '</div>' +
        '</div>';
      card.addEventListener('click', function() {
        list.querySelectorAll('.tnetz-region-card').forEach(function(c) { c.classList.remove('active'); });
        card.classList.add('active');
        selectedUrl = item.url;
      });
      list.appendChild(card);
    });

    document.getElementById('tnetz-region-copy').addEventListener('click', function() {
      if (selectedUrl) copyText(selectedUrl);
    });

    document.getElementById('tnetz-region-close').addEventListener('click', closeOverlay);
    overlayEl.addEventListener('click', function(e) { if (e.target === overlayEl) closeOverlay(); });

    requestAnimationFrame(function() { overlayEl.classList.add('show'); });
  }

  function closeOverlay() {
    if (!overlayEl) return;
    overlayEl.classList.remove('show');
    setTimeout(function() { if (overlayEl) { overlayEl.remove(); overlayEl = null; } }, 250);
  }

  // ============ SUBSCRIBE BUTTON HOOK ============
  function hookSubscribeButtons() {
    // Hook any subscribe link/copy buttons
    var selectors = [
      '.subsrcibe-for-link',
      '[class*="subscribe"][class*="link"]',
      '[class*="subscribe"][class*="copy"]',
      'button[class*="copy"]'
    ];
    selectors.forEach(function(sel) {
      try {
        var items = document.querySelectorAll(sel);
        items.forEach(function(item) {
          if (item.dataset.tnetzHooked) return;
          item.dataset.tnetzHooked = '1';
          item.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            fetchAndShowRegion();
          }, true);
        });
      } catch(ex) {}
    });
  }

  // ============ REGION WIDGET ON DASHBOARD ============
  function injectRegionWidget() {
    if (document.getElementById('tnetz-region-widget')) return;

    // Find the subscribe URL display area or main content
    var targets = [
      '.block-content',
      '.content.content-full',
      '#root > div > div > div:last-child',
      '.ant-layout-content',
      'main',
      '#root'
    ];
    var container = null;
    for (var i = 0; i < targets.length; i++) {
      container = document.querySelector(targets[i]);
      if (container) break;
    }
    if (!container) return;

    // Check if there's already a subscribe URL shown on page
    var subUrlElements = document.querySelectorAll('input[value*="/api/v1/client/subscribe"], [class*="subscribe_url"], [class*="subscribeUrl"]');
    var insertTarget = null;
    if (subUrlElements.length > 0) {
      // Insert near the subscribe URL display
      insertTarget = subUrlElements[0].closest('.ant-card, .block, .card, div[class*="card"]') || subUrlElements[0].parentElement;
    }

    var widget = document.createElement('div');
    widget.id = 'tnetz-region-widget';
    widget.className = 'tnetz-region-widget';
    widget.innerHTML =
      '<div class="tnetz-region-widget-inner">' +
        '<div class="tnetz-region-widget-icon">🌍</div>' +
        '<div class="tnetz-region-widget-text">' +
          '<h3>Chọn khu vực đăng ký</h3>' +
          '<p>Nhiều server khu vực khác nhau — chọn gần bạn nhất</p>' +
        '</div>' +
        '<div class="tnetz-region-widget-arrow">→</div>' +
      '</div>';

    widget.addEventListener('click', function() {
      fetchAndShowRegion();
    });

    if (insertTarget) {
      insertTarget.parentNode.insertBefore(widget, insertTarget.nextSibling);
    } else {
      // Insert at the top of first content area
      var firstChild = container.firstElementChild;
      if (firstChild) {
        container.insertBefore(widget, firstChild);
      } else {
        container.appendChild(widget);
      }
    }
  }

  // ============ DASHBOARD ENHANCEMENTS ============
  function enhanceDashboard() {
    // Only on dashboard page
    if (window.location.pathname !== '/' && window.location.pathname !== '' && 
        !window.location.hash.match(/#\/?$/)) return;

    var content = document.querySelector('.content.content-full');
    if (!content || content.dataset.tnetzEnhanced) return;
    content.dataset.tnetzEnhanced = '1';

    // Add welcome banner
    var banner = document.createElement('div');
    banner.className = 'tnetz-welcome-banner';
    var title = window.settings && window.settings.title ? window.settings.title : 'VPN';
    banner.innerHTML =
      '<h2>👋 Chào mừng đến với ' + title + '</h2>' +
      '<p>Quản lý tài khoản, đăng ký và theo dõi sử dụng tại đây</p>';

    // Insert before first child
    var firstEl = content.firstElementChild;
    if (firstEl) {
      // Skip alerts, insert after alerts
      var alerts = content.querySelectorAll('.alert');
      if (alerts.length > 0) {
        var lastAlert = alerts[alerts.length - 1];
        lastAlert.parentNode.insertBefore(banner, lastAlert.nextSibling);
      } else {
        content.insertBefore(banner, firstEl);
      }
    }
  }

  // ============ OBSERVER ============
  var observer = new MutationObserver(function() {
    hookSubscribeButtons();
    enhanceDashboard();
    injectRegionWidget();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial run with delay to let React render
  setTimeout(function() {
    hookSubscribeButtons();
    enhanceDashboard();
    injectRegionWidget();
  }, 2000);

  setTimeout(function() {
    injectRegionWidget();
  }, 4000);
})();

