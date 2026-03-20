/**
 * TNETZ Premium Customer Portal — Custom JS
 * Region Selector → One-Click Subscribe Shortcuts
 * v3.0 — Select region first, then show app shortcuts
 */
(function() {
  'use strict';

  var style = document.createElement('style');
  style.textContent = `
    /* Region Selector Widget */
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
    }
    .tnetz-region-widget-text h3 {
      font-family: 'Inter',sans-serif; font-size: 16px; font-weight: 700;
      color: #fff; margin: 0;
    }
    .tnetz-region-widget-text p {
      font-family: 'Inter',sans-serif; font-size: 12.5px; color: rgba(255,255,255,0.8);
      margin: 3px 0 0;
    }
    .tnetz-region-widget-arrow {
      margin-left: auto; font-size: 20px; color: rgba(255,255,255,0.7);
      transition: transform 0.2s ease;
    }
    .tnetz-region-widget:hover .tnetz-region-widget-arrow { transform: translateX(3px); }

    /* Region Selector Overlay */
    .tnetz-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15,23,42,0.6); backdrop-filter: blur(8px);
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.25s ease;
    }
    .tnetz-overlay.show { opacity: 1; }
    .tnetz-modal {
      background: #fff; border-radius: 20px; padding: 28px 24px 24px; width: 480px; max-width: 94vw;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,0.15);
      transform: scale(0.95) translateY(10px); transition: transform 0.25s ease;
    }
    .tnetz-overlay.show .tnetz-modal { transform: scale(1) translateY(0); }

    /* Modal Header */
    .tnetz-modal-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
    }
    .tnetz-modal-header-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; color: #fff; flex-shrink: 0;
    }
    .tnetz-modal-title {
      font-family: 'Inter',sans-serif; font-size: 18px; font-weight: 700; color: #0f172a;
    }
    .tnetz-modal-subtitle {
      font-family: 'Inter',sans-serif; font-size: 12.5px; color: #94a3b8; margin-top: 2px;
    }

    /* Step Label */
    .tnetz-step-label {
      font-family: 'Inter',sans-serif; font-size: 13px; font-weight: 700;
      color: #6366f1; margin-bottom: 10px; text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tnetz-step-label span { color: #94a3b8; font-weight: 500; text-transform: none; letter-spacing: 0; }

    /* Region Cards */
    .tnetz-region-card {
      background: #f8fafc; border: 2px solid #e2e8f0;
      border-radius: 14px; padding: 12px 14px; margin-bottom: 6px;
      cursor: pointer; transition: all 0.2s ease;
      display: flex; align-items: center; gap: 12px;
    }
    .tnetz-region-card:hover {
      border-color: #818cf8; background: #f0f0ff;
    }
    .tnetz-region-card.active {
      border-color: #6366f1;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      box-shadow: 0 4px 16px rgba(99,102,241,0.25);
    }
    .tnetz-region-card.active * { color: #fff !important; }
    .tnetz-rc-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0; background: rgba(99,102,241,0.08);
    }
    .tnetz-region-card.active .tnetz-rc-icon { background: rgba(255,255,255,0.2); }
    .tnetz-rc-name { font-family: 'Inter',sans-serif; font-size: 14px; font-weight: 600; color: #1e293b; }
    .tnetz-rc-domain { font-size: 11px; color: #94a3b8; font-family: monospace; }

    /* Shortcut Grid */
    .tnetz-shortcuts {
      display: none; margin-top: 16px;
      border-top: 1px solid #e2e8f0; padding-top: 16px;
    }
    .tnetz-shortcuts.show { display: block; }
    .tnetz-shortcut-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    }
    .tnetz-shortcut-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 12px;
      background: #fff; cursor: pointer; transition: all 0.2s ease;
      text-decoration: none; color: #1e293b;
      font-family: 'Inter',sans-serif; font-size: 13px; font-weight: 600;
    }
    .tnetz-shortcut-btn:hover {
      border-color: #6366f1; background: #f5f3ff;
      transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.1);
    }
    .tnetz-shortcut-btn img, .tnetz-shortcut-btn .tnetz-sb-icon {
      width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    }
    .tnetz-copy-url-btn {
      grid-column: 1 / -1;
      justify-content: center;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff; border-color: transparent;
      font-size: 14px; padding: 14px;
      box-shadow: 0 4px 12px rgba(99,102,241,0.25);
    }
    .tnetz-copy-url-btn:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-color: transparent; color: #fff;
      box-shadow: 0 6px 20px rgba(99,102,241,0.35);
    }

    /* Close btn */
    .tnetz-close-btn {
      width: 100%; padding: 12px; border: none; border-radius: 12px;
      background: #f1f5f9; color: #475569; font-family: 'Inter',sans-serif;
      font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 12px;
      transition: all 0.2s ease;
    }
    .tnetz-close-btn:hover { background: #e2e8f0; }

    /* Toast */
    .tnetz-toast {
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: linear-gradient(135deg, #10b981, #059669); color: #fff;
      padding: 12px 28px; border-radius: 12px;
      font-family: 'Inter',sans-serif; font-size: 14px; font-weight: 600;
      z-index: 10001; box-shadow: 0 8px 24px rgba(16,185,129,0.3);
      opacity: 0; transition: all 0.25s ease; pointer-events: none;
    }
    .tnetz-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    @media (max-width: 640px) {
      .tnetz-modal { padding: 20px 18px 18px; }
      .tnetz-shortcut-grid { grid-template-columns: 1fr; }
      .tnetz-region-widget { padding: 16px 20px; }
    }
  `;
  document.head.appendChild(style);

  // ============ ICONS ============
  var regionIcons = {
    'default':'🌐','china':'🇨🇳','trung':'🇨🇳','russia':'🇷🇺','nga':'🇷🇺',
    'vietnam':'🇻🇳','việt':'🇻🇳','japan':'🇯🇵','nhật':'🇯🇵',
    'korea':'🇰🇷','hàn':'🇰🇷','us':'🇺🇸','mỹ':'🇺🇸','singapore':'🇸🇬',
    'europe':'🇪🇺','châu âu':'🇪🇺','hong kong':'🇭🇰','hk':'🇭🇰',
    'taiwan':'🇹🇼','đài':'🇹🇼','mặc':'🌐'
  };
  function getIcon(n) {
    var l = (n||'').toLowerCase();
    for (var k in regionIcons) { if (l.indexOf(k) !== -1) return regionIcons[k]; }
    return '🌍';
  }

  // ============ GLOBALS ============
  var overlayEl = null, toastEl = null, cachedUrls = null, widgetDone = false;

  function getAuth() {
    // Different theme versions use different keys
    return localStorage.getItem('auth_data') || localStorage.getItem('authorization') || sessionStorage.getItem('auth_data') || sessionStorage.getItem('authorization') || '';
  }
  function isLoggedIn() { return !!getAuth(); }

  function showToast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'tnetz-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    setTimeout(function() { toastEl.classList.remove('show'); }, 2500);
  }

  function copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() { showToast('✅ Đã sao chép link đăng ký!'); });
    } else {
      var ta = document.createElement('textarea'); ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta); showToast('✅ Đã sao chép link đăng ký!');
    }
  }

  // ============ APP SHORTCUTS ============
  function getShortcuts(subUrl) {
    var title = (window.settings && window.settings.title) || 'VPN';
    return [
      { name: 'Shadowrocket', icon: '🚀', href: 'shadowrocket://add/sub://' + window.btoa(subUrl + '&flag=shadowrocket') },
      { name: 'Clash / ClashX', icon: '⚡', href: 'clash://install-config?url=' + encodeURIComponent(subUrl) + '&name=' + encodeURIComponent(title) },
      { name: 'ClashMeta', icon: '🔥', href: 'clash://install-config?url=' + encodeURIComponent(subUrl + '&flag=meta') + '&name=' + encodeURIComponent(title) },
      { name: 'Surge', icon: '🌊', href: 'surge:///install-config?url=' + encodeURIComponent(subUrl) + '&name=' + encodeURIComponent(title) },
      { name: 'QuantumultX', icon: '⚙️', href: 'quantumult-x:///update-configuration?remote-resource=' + encodeURIComponent(JSON.stringify({'server_remote': [subUrl + ', tag=' + title]})) },
      { name: 'Stash', icon: '📦', href: 'clash://install-config?url=' + encodeURIComponent(subUrl + '&flag=stash') + '&name=' + encodeURIComponent(title) },
    ];
  }

  // ============ FETCH URLS ============
  function fetchUrls(callback) {
    if (cachedUrls) { callback(cachedUrls); return; }
    if (!isLoggedIn()) { showToast('⚠️ Vui lòng đăng nhập'); return; }
    fetch('/api/v1/user/getSubscribe', {
      headers: { 'authorization': getAuth() }
    }).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function(data) {
      if (!data || !data.data) { showToast('⚠️ Lỗi lấy thông tin'); return; }
      var urls = data.data.subscribe_urls || [];
      if (!urls.length && data.data.subscribe_url) {
        urls = [{ name: 'Mặc định', url: data.data.subscribe_url, icon: '🌐' }];
      }
      cachedUrls = urls;
      callback(urls);
    }).catch(function() { showToast('❌ Lỗi kết nối'); });
  }

  // ============ SHOW REGION + SHORTCUTS MODAL ============
  function showModal(urls) {
    if (overlayEl) overlayEl.remove();

    overlayEl = document.createElement('div');
    overlayEl.className = 'tnetz-overlay';

    var html = '<div class="tnetz-modal">' +
      '<div class="tnetz-modal-header">' +
        '<div class="tnetz-modal-header-icon">🌍</div>' +
        '<div><div class="tnetz-modal-title">Đồng bộ đăng ký</div>' +
        '<div class="tnetz-modal-subtitle">Chọn khu vực → bấm phím tắt để đồng bộ vào app</div></div>' +
      '</div>' +
      '<div class="tnetz-step-label">BƯỚC 1 <span>— Chọn khu vực</span></div>' +
      '<div id="tnetz-rlist"></div>' +
      '<div class="tnetz-shortcuts" id="tnetz-shortcuts">' +
        '<div class="tnetz-step-label">BƯỚC 2 <span>— Chọn ứng dụng hoặc sao chép</span></div>' +
        '<div class="tnetz-shortcut-grid" id="tnetz-sgrid"></div>' +
      '</div>' +
      '<button class="tnetz-close-btn" id="tnetz-close">Đóng</button>' +
    '</div>';

    overlayEl.innerHTML = html;
    document.body.appendChild(overlayEl);

    var list = document.getElementById('tnetz-rlist');
    var shortcuts = document.getElementById('tnetz-shortcuts');
    var grid = document.getElementById('tnetz-sgrid');

    urls.forEach(function(item, idx) {
      var card = document.createElement('div');
      card.className = 'tnetz-region-card';
      var icon = item.icon || getIcon(item.name);
      var domain = '';
      try { domain = new URL(item.url.split('?')[0]).hostname; } catch(e) { domain = item.url; }
      card.innerHTML =
        '<div class="tnetz-rc-icon">' + icon + '</div>' +
        '<div><div class="tnetz-rc-name">' + item.name + '</div>' +
        '<div class="tnetz-rc-domain">' + domain + '</div></div>';

      card.addEventListener('click', function() {
        // Mark active
        list.querySelectorAll('.tnetz-region-card').forEach(function(c) { c.classList.remove('active'); });
        card.classList.add('active');
        // Show shortcuts for this region
        renderShortcuts(grid, item.url);
        shortcuts.classList.add('show');
      });
      list.appendChild(card);
    });

    document.getElementById('tnetz-close').addEventListener('click', closeModal);
    overlayEl.addEventListener('click', function(e) { if (e.target === overlayEl) closeModal(); });
    requestAnimationFrame(function() { overlayEl.classList.add('show'); });
  }

  function renderShortcuts(grid, subUrl) {
    grid.innerHTML = '';
    var apps = getShortcuts(subUrl);
    apps.forEach(function(app) {
      var a = document.createElement('a');
      a.className = 'tnetz-shortcut-btn';
      a.href = app.href;
      a.innerHTML = '<div class="tnetz-sb-icon">' + app.icon + '</div>' + app.name;
      grid.appendChild(a);
    });
    // Copy URL button at bottom
    var copyBtn = document.createElement('button');
    copyBtn.className = 'tnetz-shortcut-btn tnetz-copy-url-btn';
    copyBtn.innerHTML = '📋 Sao chép link đăng ký';
    copyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      copyText(subUrl);
    });
    grid.appendChild(copyBtn);
  }

  function closeModal() {
    if (!overlayEl) return;
    overlayEl.classList.remove('show');
    setTimeout(function() { if (overlayEl) { overlayEl.remove(); overlayEl = null; } }, 250);
  }

  // ============ OPEN FLOW ============
  function openRegionSelector() {
    fetchUrls(function(urls) {
      if (urls.length > 1) {
        showModal(urls);
      } else if (urls.length === 1) {
        // Only 1 region — show shortcuts directly
        showModal(urls);
      } else {
        showToast('⚠️ Chưa cấu hình khu vực đăng ký');
      }
    });
  }

  // ============ HOOK SUBSCRIBE BUTTONS ============
  function hookButtons() {
    if (!isLoggedIn()) return;
    document.querySelectorAll('.subsrcibe-for-link').forEach(function(el) {
      if (el.dataset.tnetzHooked) return;
      el.dataset.tnetzHooked = '1';
      el.addEventListener('click', function(e) {
        e.stopPropagation(); e.preventDefault();
        openRegionSelector();
      }, true);
    });
  }

  // ============ INJECT REGION WIDGET ============
  function injectWidget() {
    if (widgetDone || document.getElementById('tnetz-region-widget')) { widgetDone = true; return; }
    if (!isLoggedIn()) return;

    // Find subscribe area
    var subInput = document.querySelector('input[readonly]');
    if (subInput && subInput.value && subInput.value.indexOf('subscribe') === -1) subInput = null;
    var parent = null;
    if (subInput) parent = subInput.closest('.block, .block-content, .card, .ant-card') || subInput.parentElement;
    if (!parent) parent = document.querySelector('.content.content-full, .ant-layout-content, main, #root > div');
    if (!parent) return;

    widgetDone = true;
    var w = document.createElement('div');
    w.id = 'tnetz-region-widget';
    w.className = 'tnetz-region-widget';
    w.innerHTML =
      '<div class="tnetz-region-widget-inner">' +
        '<div class="tnetz-region-widget-icon">🌍</div>' +
        '<div class="tnetz-region-widget-text">' +
          '<h3>Chọn khu vực & đồng bộ</h3>' +
          '<p>Chọn khu vực → đồng bộ vào Clash, Shadowrocket...</p>' +
        '</div>' +
        '<div class="tnetz-region-widget-arrow">→</div>' +
      '</div>';
    w.addEventListener('click', openRegionSelector);

    if (subInput) {
      var block = subInput.closest('.block, .card, .ant-card');
      if (block) { block.parentNode.insertBefore(w, block.nextSibling); return; }
    }
    var fc = parent.firstElementChild;
    if (fc) parent.insertBefore(w, fc.nextSibling); else parent.appendChild(w);
  }

  // ============ OBSERVER (debounced) ============
  var timer = null;
  new MutationObserver(function() {
    if (timer) return;
    timer = setTimeout(function() { timer = null; hookButtons(); if (!widgetDone) injectWidget(); }, 500);
  }).observe(document.body, { childList: true, subtree: true });

  setTimeout(function() { hookButtons(); injectWidget(); }, 2000);
  setTimeout(function() { if (!widgetDone) injectWidget(); }, 5000);
})();
