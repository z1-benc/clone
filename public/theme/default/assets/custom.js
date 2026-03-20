/**
 * TNETZ Premium Customer Portal — Custom JS
 * Multi-Region Subscribe URL Selector + Dashboard UI Enhancements
 * v2.0 — Fixed auth, widget placement, and API call flood
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
      border-radius: 16px; padding: 20px 24px; margin: 16px 0;
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

    @media (max-width: 768px) {
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
  var widgetInjected = false;

  function getAuth() {
    // umi.js stores auth in 'authorization' key
    return localStorage.getItem('authorization') || sessionStorage.getItem('authorization') || '';
  }

  function isLoggedIn() {
    return !!getAuth();
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

  // ============ FETCH SUBSCRIBE URLs ============
  function fetchAndShowRegion() {
    if (!isLoggedIn()) {
      showToast('⚠️ Vui lòng đăng nhập trước');
      return;
    }
    if (cachedUrls) {
      handleUrls(cachedUrls);
      return;
    }
    fetch('/api/v1/user/getSubscribe', {
      headers: { 'authorization': getAuth() }
    }).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function(data) {
      if (data && data.data) {
        var urls = data.data.subscribe_urls;
        cachedUrls = urls;
        handleUrls(urls, data.data.subscribe_url);
      } else {
        showToast('⚠️ Không lấy được thông tin đăng ký');
      }
    }).catch(function(err) {
      console.error('TNETZ Region: ', err);
      showToast('❌ Lỗi tải danh sách khu vực');
    });
  }

  function handleUrls(urls, fallbackUrl) {
    if (urls && urls.length > 1) {
      showRegionSelector(urls);
    } else if (urls && urls.length === 1) {
      copyText(urls[0].url);
    } else if (fallbackUrl) {
      copyText(fallbackUrl);
    } else {
      showToast('⚠️ Chưa cấu hình URL đăng ký khu vực');
    }
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
      var icon = item.icon || getIcon(item.name);
      var domain = '';
      try { domain = new URL(item.url.split('?')[0]).hostname; } catch(e) { domain = item.url; }
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
    if (!isLoggedIn()) return;

    // Only hook the exact subscribe-for-link class (theme uses this)
    var items = document.querySelectorAll('.subsrcibe-for-link');
    items.forEach(function(item) {
      if (item.dataset.tnetzHooked) return;
      item.dataset.tnetzHooked = '1';
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        fetchAndShowRegion();
      }, true);
    });
  }

  // ============ REGION WIDGET ON DASHBOARD ============
  function injectRegionWidget() {
    if (widgetInjected) return;
    if (document.getElementById('tnetz-region-widget')) { widgetInjected = true; return; }
    if (!isLoggedIn()) return;

    // Look for the subscribe URL area on the page
    // The theme shows subscribe URL in an input or in a specific block
    var subscribeInput = document.querySelector('input[readonly][value*="/api/v1/client/subscribe"]');
    if (!subscribeInput) {
      // Also try data-clipboard inputs
      subscribeInput = document.querySelector('[data-clipboard-text*="/api/v1/client/subscribe"]');
    }
    if (!subscribeInput) {
      // Try finding by looking for text content containing "subscribe"
      var allInputs = document.querySelectorAll('input[readonly]');
      for (var i = 0; i < allInputs.length; i++) {
        if (allInputs[i].value && allInputs[i].value.indexOf('subscribe') !== -1) {
          subscribeInput = allInputs[i];
          break;
        }
      }
    }

    // Find the parent block/card
    var parentBlock = null;
    if (subscribeInput) {
      parentBlock = subscribeInput.closest('.block, .block-content, .card, .ant-card');
      if (!parentBlock) parentBlock = subscribeInput.parentElement && subscribeInput.parentElement.parentElement;
    }

    // If no subscribe area found, look for common content containers
    if (!parentBlock) {
      parentBlock = document.querySelector('.content.content-full') || 
                    document.querySelector('.ant-layout-content') ||
                    document.querySelector('#root > div');
    }

    if (!parentBlock) return;

    widgetInjected = true;

    var widget = document.createElement('div');
    widget.id = 'tnetz-region-widget';
    widget.className = 'tnetz-region-widget';
    widget.innerHTML =
      '<div class="tnetz-region-widget-inner">' +
        '<div class="tnetz-region-widget-icon">🌍</div>' +
        '<div class="tnetz-region-widget-text">' +
          '<h3>Chọn khu vực đăng ký</h3>' +
          '<p>Nhiều server khu vực — bấm để chọn link phù hợp</p>' +
        '</div>' +
        '<div class="tnetz-region-widget-arrow">→</div>' +
      '</div>';

    widget.addEventListener('click', function() {
      fetchAndShowRegion();
    });

    // Insert after the subscribe block or at the top
    if (subscribeInput && subscribeInput.closest('.block, .card, .ant-card')) {
      var block = subscribeInput.closest('.block, .card, .ant-card');
      block.parentNode.insertBefore(widget, block.nextSibling);
    } else {
      var firstChild = parentBlock.firstElementChild;
      if (firstChild) {
        parentBlock.insertBefore(widget, firstChild.nextSibling || null);
      } else {
        parentBlock.appendChild(widget);
      }
    }
  }

  // ============ DEBOUNCED OBSERVER ============
  var observerTimer = null;
  var observer = new MutationObserver(function() {
    if (observerTimer) return;
    observerTimer = setTimeout(function() {
      observerTimer = null;
      hookSubscribeButtons();
      if (!widgetInjected) injectRegionWidget();
    }, 500);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial run with delays
  setTimeout(function() {
    hookSubscribeButtons();
    injectRegionWidget();
  }, 2000);

  setTimeout(function() {
    if (!widgetInjected) injectRegionWidget();
  }, 5000);
})();
