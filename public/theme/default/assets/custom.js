/**
 * TNETZ Custom: Multi-Region Subscribe URL Selector
 * Injects region selector into the customer portal dashboard
 */
(function() {
  'use strict';

  // CSS injection
  var style = document.createElement('style');
  style.textContent = `
    .tnetz-region-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s ease;
    }
    .tnetz-region-overlay.show { opacity: 1; }
    .tnetz-region-modal {
      background: #fff; border-radius: 16px; padding: 32px; width: 480px; max-width: 92vw;
      max-height: 85vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      transform: translateY(20px); transition: transform 0.3s ease;
    }
    .tnetz-region-overlay.show .tnetz-region-modal { transform: translateY(0); }
    .tnetz-region-title {
      font-size: 20px; font-weight: 700; color: #1a202c; margin-bottom: 6px;
    }
    .tnetz-region-subtitle {
      font-size: 13px; color: #718096; margin-bottom: 20px;
    }
    .tnetz-region-card {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;
      margin-bottom: 12px; cursor: pointer; transition: all 0.2s ease;
      display: flex; align-items: center; gap: 14px;
    }
    .tnetz-region-card:hover {
      border-color: #667eea; background: linear-gradient(135deg, #ebf4ff 0%, #e8eaf6 100%);
      transform: translateY(-2px); box-shadow: 0 4px 16px rgba(102,126,234,0.15);
    }
    .tnetz-region-card.active {
      border-color: #667eea; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 20px rgba(102,126,234,0.3);
    }
    .tnetz-region-card.active .tnetz-region-name,
    .tnetz-region-card.active .tnetz-region-url { color: #fff; }
    .tnetz-region-icon {
      width: 42px; height: 42px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
      background: rgba(102,126,234,0.1);
    }
    .tnetz-region-card.active .tnetz-region-icon {
      background: rgba(255,255,255,0.2);
    }
    .tnetz-region-info { flex: 1; min-width: 0; }
    .tnetz-region-name {
      font-size: 15px; font-weight: 600; color: #2d3748;
    }
    .tnetz-region-url {
      font-size: 11px; color: #a0aec0; margin-top: 2px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-family: monospace;
    }
    .tnetz-region-actions {
      display: flex; gap: 8px; margin-top: 20px;
    }
    .tnetz-region-btn {
      flex: 1; padding: 12px; border: none; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      transition: all 0.2s ease; display: flex; align-items: center;
      justify-content: center; gap: 6px;
    }
    .tnetz-region-btn-copy {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    .tnetz-region-btn-copy:hover {
      transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,0.4);
    }
    .tnetz-region-btn-close {
      background: #edf2f7; color: #4a5568;
    }
    .tnetz-region-btn-close:hover {
      background: #e2e8f0;
    }
    .tnetz-copy-toast {
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #48bb78; color: #fff; padding: 10px 24px; border-radius: 8px;
      font-size: 14px; font-weight: 500; z-index: 10001;
      opacity: 0; transition: all 0.3s ease; pointer-events: none;
    }
    .tnetz-copy-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  `;
  document.head.appendChild(style);

  // Region icons
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

  // State
  var selectedUrl = '';
  var overlayEl = null;
  var toastEl = null;

  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'tnetz-copy-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function() { toastEl.classList.remove('show'); }, 2000);
  }

  function copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('✅ Đã sao chép link đăng ký!');
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✅ Đã sao chép link đăng ký!');
    }
  }

  function showRegionSelector(urls) {
    if (overlayEl) overlayEl.remove();

    selectedUrl = urls[0] ? urls[0].url : '';

    overlayEl = document.createElement('div');
    overlayEl.className = 'tnetz-region-overlay';
    overlayEl.innerHTML =
      '<div class="tnetz-region-modal">' +
        '<div class="tnetz-region-title">🌍 Chọn khu vực đăng ký</div>' +
        '<div class="tnetz-region-subtitle">Chọn server khu vực phù hợp để tải link nhanh nhất</div>' +
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
      card.innerHTML =
        '<div class="tnetz-region-icon">' + getIcon(item.name) + '</div>' +
        '<div class="tnetz-region-info">' +
          '<div class="tnetz-region-name">' + item.name + '</div>' +
          '<div class="tnetz-region-url">' + (item.url.split('?')[0] || item.url) + '</div>' +
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

    document.getElementById('tnetz-region-close').addEventListener('click', function() {
      overlayEl.classList.remove('show');
      setTimeout(function() { overlayEl.remove(); overlayEl = null; }, 300);
    });

    overlayEl.addEventListener('click', function(e) {
      if (e.target === overlayEl) {
        overlayEl.classList.remove('show');
        setTimeout(function() { overlayEl.remove(); overlayEl = null; }, 300);
      }
    });

    // Animate in
    requestAnimationFrame(function() {
      overlayEl.classList.add('show');
    });
  }

  // Intercept the subscribe link copy — override the original behavior
  function hookSubscribeButtons() {
    // Find the "复制订阅地址" / "Sao chép link đăng ký" button
    var items = document.querySelectorAll('.subsrcibe-for-link');
    if (items.length === 0) return;

    items.forEach(function(item) {
      if (item.dataset.tnetzHooked) return;
      item.dataset.tnetzHooked = '1';

      // Get the user token from the subscribe URL
      var token = '';
      var authData = localStorage.getItem('auth_data') || 
                     sessionStorage.getItem('auth_data') || '';

      item.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        // Fetch subscribe_urls from API
        fetch('/api/v1/user/getSubscribe', {
          headers: { 'Authorization': authData }
        }).then(function(r) { return r.json(); })
        .then(function(data) {
          var urls = data.data && data.data.subscribe_urls;
          if (urls && urls.length > 1) {
            showRegionSelector(urls);
          } else if (urls && urls.length === 1) {
            copyText(urls[0].url);
          } else {
            // Fallback: copy the default subscribe_url
            var defaultUrl = data.data && data.data.subscribe_url;
            if (defaultUrl) copyText(defaultUrl);
          }
        }).catch(function() {
          // Fallback: try from existing props
          showToast('❌ Lỗi tải danh sách khu vực');
        });
      }, true);
    });
  }

  // MutationObserver to hook buttons when they appear in the SPA
  var observer = new MutationObserver(function() {
    hookSubscribeButtons();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial hook
  setTimeout(hookSubscribeButtons, 2000);
})();
