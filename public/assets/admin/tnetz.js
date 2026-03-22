(function() {
  'use strict';
  const ATTRS = ['placeholder', 'value', 'title', 'alt'];

  function translateText(text) {
    if (!window.zhViDictionary) return text;
    const key = text.trim();
    return window.zhViDictionary[key] || text;
  }

  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const translated = translateText(node.nodeValue);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      ATTRS.forEach(attr => {
        if (node.hasAttribute(attr)) {
          const original = node.getAttribute(attr);
          const translated = translateText(original);
          if (translated !== original) node.setAttribute(attr, translated);
        }
      });
      node.childNodes.forEach(translateNode);
    }
  }

  function translatePage() { translateNode(document.body); }

  function translatePlaceholders() {
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      var ph = el.getAttribute('placeholder');
      if (ph && /[\u4e00-\u9fff]/.test(ph)) {
        var t = translateText(ph);
        if (t !== ph) el.setAttribute('placeholder', t);
      }
    });
  }

  function translateSelectOptions() {
    document.querySelectorAll('.ant-select-selection-item, .ant-select-item-option-content').forEach(el => {
      var text = el.textContent.trim();
      if (/[\u4e00-\u9fff]/.test(text)) {
        var t = translateText(text);
        if (t !== text) el.textContent = t;
      }
    });
  }

  function translateMessages() {
    document.querySelectorAll('.ant-message-notice-content, .ant-notification-notice-message, .ant-notification-notice-description, .ant-modal-confirm-content').forEach(el => {
      var text = el.textContent.trim();
      if (/[\u4e00-\u9fff]/.test(text)) {
        var t = translateText(text);
        if (t !== text) el.textContent = t;
      }
    });
  }

  // ========== SET SNI FOR USER (Admin dropdown injection) ==========
  var sniCache = null;

  function fetchSniList() {
    if (sniCache) return Promise.resolve(sniCache);
    var adminPath = window.settings ? window.settings.secure_path || '' : '';
    return fetch('/api/v1/' + (window.location.pathname.split('/')[1]) + '/config/fetch?key=tnetz', {
      headers: { 'Authorization': localStorage.getItem('authorization') || document.cookie }
    }).then(r => r.json()).then(data => {
      var raw = (data.data && data.data.tnetz && data.data.tnetz.sni_list) || '';
      sniCache = [];
      if (raw) {
        raw.split('\n').forEach(line => {
          line = line.trim();
          if (!line) return;
          var parts = line.split('|');
          sniCache.push({ name: parts[0].trim(), value: (parts[1] || parts[0]).trim() });
        });
      }
      return sniCache;
    }).catch(() => []);
  }

  function showSniModal(userId, userEmail) {
    var existing = document.getElementById('sni-admin-modal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'sni-admin-modal';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;display:flex;justify-content:center;align-items:center;';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:#fff;border-radius:12px;padding:24px;width:400px;max-width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
    modal.innerHTML = '<h3 style="margin:0 0 4px;font-size:16px;">🔒 Set SNI</h3>' +
      '<p style="margin:0 0 16px;font-size:13px;color:#888;">' + (userEmail || 'User #' + userId) + '</p>' +
      '<select id="sni-select" style="width:100%;padding:8px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;margin-bottom:16px;"><option value="">Đang tải...</option></select>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
      '<button id="sni-cancel" style="padding:8px 20px;background:#f5f5f5;color:#333;border:1px solid #d9d9d9;border-radius:6px;cursor:pointer;">Hủy</button>' +
      '<button id="sni-save" style="padding:8px 20px;background:#1890ff;color:#fff;border:none;border-radius:6px;cursor:pointer;">Lưu SNI</button></div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('sni-cancel').addEventListener('click', () => overlay.remove());

    fetchSniList().then(list => {
      var sel = document.getElementById('sni-select');
      sel.innerHTML = '<option value="">-- Chọn SNI --</option>';
      list.forEach(s => {
        sel.innerHTML += '<option value="' + s.value + '">' + s.name + ' (' + s.value + ')</option>';
      });
    });

    document.getElementById('sni-save').addEventListener('click', () => {
      var sel = document.getElementById('sni-select');
      var val = sel.value;
      if (!val) { alert('Chọn SNI trước'); return; }
      var adminPrefix = window.location.pathname.split('/')[1];
      fetch('/api/v1/' + adminPrefix + '/user/setSni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('authorization') || '' },
        body: JSON.stringify({ id: userId, name_sni: sel.options[sel.selectedIndex].text.split(' (')[0], network_settings: val })
      }).then(r => r.json()).then(d => {
        if (d.data) {
          alert('✅ Đã set SNI thành công!');
          overlay.remove();
        } else {
          alert('❌ Lỗi: ' + (d.message || 'Unknown'));
        }
      }).catch(e => alert('❌ Lỗi: ' + e.message));
    });
  }

  function injectSetSniButton() {
    document.querySelectorAll('.ant-dropdown-menu-item').forEach(item => {
      var text = item.textContent.trim();
      if ((text.includes('Lấy QR code') || text.includes('获取QR码')) && !item.dataset.sniInjected) {
        item.dataset.sniInjected = 'true';
        // Create a fresh element instead of cloneNode to avoid breaking React event handlers
        var sniItem = document.createElement('li');
        sniItem.className = 'ant-dropdown-menu-item';
        sniItem.setAttribute('role', 'menuitem');
        sniItem.dataset.sniInjected = 'true';
        sniItem.innerHTML = '<a><i aria-label="icon: lock" class="anticon anticon-lock"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="lock" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 1 0-56 0z"></path></svg></i> Set SNI</a>';
        sniItem.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          // Find user info from the row
          var row = document.querySelector('.ant-table-row-selected, .ant-table-row:hover');
          if (!row) {
            var rows = document.querySelectorAll('.ant-table-row');
            row = rows.length ? rows[0] : null;
          }
          var userId = row ? row.querySelector('td')?.textContent.trim() : '';
          var email = '';
          if (row) {
            row.querySelectorAll('td').forEach(td => {
              if (td.textContent.includes('@')) email = td.textContent.trim();
            });
          }
          showSniModal(userId, email);
        });
        item.parentNode.insertBefore(sniItem, item.nextSibling);
      }
    });
  }

  // ========== TNETZ TAB IN SYSTEM CONFIG ==========
  var tnetzTabInjected = false;

  function injectTnetzTab() {
    if (tnetzTabInjected) return;
    if (!window.location.hash.includes('/config/system')) return;
    if (document.getElementById('tnetz-tab')) return;
    
    // Ant Design v3: .ant-tabs-nav.ant-tabs-nav-animated > div (no class) holds tabs
    var navAnimated = document.querySelector('.ant-tabs-nav.ant-tabs-nav-animated');
    if (!navAnimated) return;
    var tabContainer = navAnimated.querySelector(':scope > div:first-child');
    if (!tabContainer) return;
    var inkBar = navAnimated.querySelector('.ant-tabs-ink-bar');
    
    var existingTab = tabContainer.querySelector('.ant-tabs-tab');
    if (!existingTab) return;

    // Create new tab matching Ant Design v3 style
    var newTab = document.createElement('div');
    newTab.id = 'tnetz-tab';
    newTab.setAttribute('role', 'tab');
    newTab.setAttribute('aria-disabled', 'false');
    newTab.setAttribute('aria-selected', 'false');
    newTab.className = 'ant-tabs-tab';
    newTab.textContent = 'TNETZ';
    newTab.style.cursor = 'pointer';
    tabContainer.appendChild(newTab);

    // Create content panel — matching native ant-form-item style like Telegram tab
    var contentArea = document.querySelector('.ant-tabs-content');
    if (!contentArea) contentArea = document.querySelector('.ant-tabs');

    var adminPrefix = window.location.pathname.split('/')[1];

    var tnetzPanel = document.createElement('div');
    tnetzPanel.id = 'tnetz-config-panel';
    tnetzPanel.style.cssText = 'display:none;';
    tnetzPanel.innerHTML =
      // Row 1: SNI List — native config style
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:24px 0;border-bottom:1px solid #f0f0f0;">' +
        '<div style="flex:1;padding-right:40px;">' +
          '<div style="font-weight:600;font-size:14px;color:rgba(0,0,0,0.85);">Danh sách SNI</div>' +
          '<div style="font-size:13px;color:rgba(0,0,0,0.45);margin-top:4px;">Mỗi dòng là 1 SNI. Định dạng: Tên|Giá trị. Dùng để set SNI cho user trong trang quản lý.</div>' +
        '</div>' +
        '<div style="flex:0 0 400px;">' +
          '<textarea id="tnetz-sni-textarea" rows="4" class="ant-input" style="font-family:monospace;font-size:13px;resize:vertical;" placeholder="Viettel|dl.viettel.vn&#10;MobiFone|gg.gg.vn&#10;VinaPhone|zalo.vn"></textarea>' +
        '</div>' +
      '</div>' +
      // Row 2: Subscribe info toggles — native config style
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:24px 0;border-bottom:1px solid #f0f0f0;">' +
        '<div style="flex:1;padding-right:40px;">' +
          '<div style="font-weight:600;font-size:14px;color:rgba(0,0,0,0.85);">Hiển thị trên link đăng ký</div>' +
          '<div style="font-size:13px;color:rgba(0,0,0,0.45);margin-top:4px;">Bật/tắt thông tin hiện trên link subscribe (web mẹ). Web con có config riêng.</div>' +
        '</div>' +
        '<div style="flex:0 0 400px;display:flex;flex-wrap:wrap;gap:8px 20px;padding-top:4px;">' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="checkbox" id="tnetz-sys-show_user_id" checked style="width:15px;height:15px;accent-color:#1890ff;"> ID</label>' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="checkbox" id="tnetz-sys-show_plan" checked style="width:15px;height:15px;accent-color:#1890ff;"> Gói</label>' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="checkbox" id="tnetz-sys-show_data" checked style="width:15px;height:15px;accent-color:#1890ff;"> Còn (data)</label>' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="checkbox" id="tnetz-sys-show_reset" checked style="width:15px;height:15px;accent-color:#1890ff;"> Làm mới</label>' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="checkbox" id="tnetz-sys-show_expiry" checked style="width:15px;height:15px;accent-color:#1890ff;"> Hạn</label>' +
        '</div>' +
      '</div>' +
      // Row 3: Subscribe URLs
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:24px 0;border-bottom:1px solid #f0f0f0;">' +
        '<div style="flex:1;padding-right:40px;">' +
          '<div style="font-weight:600;font-size:14px;color:rgba(0,0,0,0.85);">Đường dẫn đăng ký khu vực</div>' +
          '<div style="font-size:13px;color:rgba(0,0,0,0.45);margin-top:4px;">Thêm URL đăng ký cho từng khu vực. Người dùng sẽ chọn khu vực khi xem link đăng ký.</div>' +
        '</div>' +
        '<div style="flex:0 0 500px;">' +
          '<div id="tnetz-subscribe-urls-list"></div>' +
          '<button id="tnetz-add-url" class="ant-btn" style="margin-top:8px;" type="button">+ Thêm khu vực</button>' +
        '</div>' +
      '</div>' +
      // Save button row
      '<div style="padding:24px 0;">' +
        '<button id="tnetz-sni-save" class="ant-btn ant-btn-primary">Lưu</button>' +
        '<span id="tnetz-sni-status" style="margin-left:12px;color:#52c41a;font-size:13px;"></span>' +
      '</div>';
    contentArea.parentNode.insertBefore(tnetzPanel, contentArea.nextSibling);

    // Add hover effect to textarea
    var ta = document.getElementById('tnetz-sni-textarea');
    if (ta) {
      ta.addEventListener('focus', () => { ta.style.borderColor = '#40a9ff'; ta.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.2)'; });
      ta.addEventListener('blur', () => { ta.style.borderColor = '#d9d9d9'; ta.style.boxShadow = 'none'; });
    }

    // Load current SNI data
    fetch('/api/v1/' + adminPrefix + '/config/fetch?key=tnetz', {
      headers: { 'Authorization': localStorage.getItem('authorization') || '' }
    }).then(r => r.json()).then(data => {
      var ta = document.getElementById('tnetz-sni-textarea');
      if (!ta || !data.data) return;
      // Try nested (tnetz.sni_list) or flat (sni_list)
      var val = (data.data.tnetz && data.data.tnetz.sni_list) || data.data.sni_list || '';
      ta.value = val;
      // Load subscribe_info_config toggles
      var sic = (data.data.tnetz && data.data.tnetz.subscribe_info_config) || data.data.subscribe_info_config;
      if (sic) {
        try { if (typeof sic === 'string') sic = JSON.parse(sic); } catch(e) {}
        ['show_user_id','show_plan','show_data','show_reset','show_expiry'].forEach(k => {
          var cb = document.getElementById('tnetz-sys-' + k);
          if (cb && sic[k] !== undefined) cb.checked = sic[k] !== false;
        });
      }
      // Load subscribe_urls
      var su = (data.data.tnetz && data.data.tnetz.subscribe_urls) || data.data.subscribe_urls;
      if (su) {
        try { if (typeof su === 'string') su = JSON.parse(su); } catch(e) { su = []; }
        if (Array.isArray(su)) su.forEach(function(item) { addUrlRow(item.name, item.url); });
      }
    }).catch(() => {});

    // Subscribe URLs dynamic rows
    function addUrlRow(name, url) {
      var list = document.getElementById('tnetz-subscribe-urls-list');
      if (!list) return;
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';
      row.innerHTML = '<input type="text" class="ant-input tnetz-url-name" placeholder="Tên khu vực" value="' + (name||'').replace(/"/g,'&quot;') + '" style="width:160px;font-size:13px;">' +
        '<input type="text" class="ant-input tnetz-url-value" placeholder="https://..." value="' + (url||'').replace(/"/g,'&quot;') + '" style="flex:1;font-size:13px;font-family:monospace;">' +
        '<button class="ant-btn ant-btn-sm" type="button" style="color:#ff4d4f;border-color:#ff4d4f;" onclick="this.parentElement.remove()">✕</button>';
      list.appendChild(row);
    }
    document.getElementById('tnetz-add-url').addEventListener('click', function() { addUrlRow('',''); });

    // Save button
    document.getElementById('tnetz-sni-save').addEventListener('click', () => {
      var ta = document.getElementById('tnetz-sni-textarea');
      var status = document.getElementById('tnetz-sni-status');
      var btn = document.getElementById('tnetz-sni-save');
      btn.textContent = 'Đang lưu...';
      btn.disabled = true;

      fetch('/api/v1/' + adminPrefix + '/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('authorization') || '' },
        body: JSON.stringify({
          sni_list: ta.value,
          subscribe_info_config: JSON.stringify({
            show_user_id: document.getElementById('tnetz-sys-show_user_id').checked,
            show_plan: document.getElementById('tnetz-sys-show_plan').checked,
            show_data: document.getElementById('tnetz-sys-show_data').checked,
            show_reset: document.getElementById('tnetz-sys-show_reset').checked,
            show_expiry: document.getElementById('tnetz-sys-show_expiry').checked
          }),
          subscribe_urls: JSON.stringify(Array.from(document.querySelectorAll('#tnetz-subscribe-urls-list > div')).map(function(row) {
            return { name: row.querySelector('.tnetz-url-name').value.trim(), url: row.querySelector('.tnetz-url-value').value.trim() };
          }).filter(function(item) { return item.name && item.url; }))
        })
      }).then(r => r.json()).then(d => {
        btn.textContent = 'Lưu';
        btn.disabled = false;
        status.textContent = '✅ Đã lưu thành công!';
        sniCache = null;
        setTimeout(() => { status.textContent = ''; }, 3000);
      }).catch(e => {
        btn.textContent = 'Lưu';
        btn.disabled = false;
        status.textContent = '❌ Lỗi: ' + e.message;
      });
    });

    // Move ink-bar to TNETZ tab
    function moveInkBar(targetTab) {
      if (!inkBar) return;
      var left = targetTab.offsetLeft;
      var width = targetTab.offsetWidth;
      inkBar.style.transform = 'translate3d(' + left + 'px, 0px, 0px)';
      inkBar.style.width = width + 'px';
    }

    // Tab click: show TNETZ panel, hide main content, move ink-bar
    newTab.addEventListener('click', () => {
      tabContainer.querySelectorAll('.ant-tabs-tab').forEach(t => t.classList.remove('ant-tabs-tab-active'));
      newTab.classList.add('ant-tabs-tab-active');
      contentArea.style.display = 'none';
      tnetzPanel.style.display = 'block';
      moveInkBar(newTab);
    });

    // Other tabs: hide TNETZ panel, restore content, move ink-bar back
    tabContainer.querySelectorAll('.ant-tabs-tab:not(#tnetz-tab)').forEach(tab => {
      tab.addEventListener('click', () => {
        tnetzPanel.style.display = 'none';
        newTab.classList.remove('ant-tabs-tab-active');
        contentArea.style.display = '';
        // Let Ant Design handle ink-bar by removing our forced style
        if (inkBar) {
          inkBar.style.transform = '';
          inkBar.style.width = '';
        }
      });
    });

    tnetzTabInjected = true;
  }


  // ========== SUBSCRIBE INFO CONFIG IN WEBCON EDIT MODAL ==========
  var webconTogglesInjected = false;

  function injectWebconInfoToggles() {
    if (webconTogglesInjected) return;
    if (!window.location.hash.includes('/webcon') && !window.location.hash.includes('/staff')) return;

    // Detect the webcon edit modal
    var modal = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-body');
    if (!modal) return;
    // Confirm it's the webcon modal by looking for "Email admin webcon" or "domain" label
    var labels = modal.querySelectorAll('.form-group label');
    var isWebcon = false;
    labels.forEach(l => { if (l.textContent.includes('Email') || l.textContent.includes('domain')) isWebcon = true; });
    if (!isWebcon || labels.length < 3) return;
    if (modal.querySelector('#tnetz-info-toggles')) { webconTogglesInjected = true; return; }

    // Config keys
    var toggles = [
      { key: 'show_user_id', label: 'ID', icon: 'user' },
      { key: 'show_plan', label: 'Gói', icon: 'book' },
      { key: 'show_data', label: 'Còn (data)', icon: 'database' },
      { key: 'show_reset', label: 'Làm mới', icon: 'sync' },
      { key: 'show_expiry', label: 'Hạn', icon: 'calendar' },
    ];

    // Get current config from the submit state (if editing)
    var currentConfig = {};
    // Try to read from submit.subscribe_info_config
    try {
      var submitData = modal.closest('.ant-modal-wrap');
      // We'll load from API instead
    } catch(e) {}

    var section = document.createElement('div');
    section.id = 'tnetz-info-toggles';
    section.style.cssText = 'border-bottom:1px dashed #e8e8e8;padding-bottom:12px;margin-bottom:12px;';
    section.innerHTML =
      '<div style="font-weight:600;font-size:13px;color:rgba(0,0,0,0.85);margin-bottom:10px;">Hiển thị trên link đăng ký</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;">' +
        toggles.map(t =>
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;padding:4px 0;">' +
            '<input type="checkbox" id="tnetz-toggle-' + t.key + '" checked style="width:16px;height:16px;cursor:pointer;accent-color:#1890ff;">' +
            t.label +
          '</label>'
        ).join('') +
      '</div>';

    // Insert at the TOP of the modal (before first form-group)
    var firstFormGroup = modal.querySelector('.form-group');
    if (firstFormGroup) {
      firstFormGroup.parentNode.insertBefore(section, firstFormGroup);
    } else {
      modal.prepend(section);
    }

    // Load current values from the staff record being edited
    // Find the staff ID from the table row or modal title
    var adminPrefix = window.location.pathname.split('/')[1];
    // Get staff data from the table to find the current subscribe_info_config
    fetch('/api/v1/' + adminPrefix + '/webcon/fetch', {
      headers: { 'Authorization': localStorage.getItem('authorization') || '' }
    }).then(r => r.json()).then(data => {
      var staffs = data.data || [];
      // Find the staff being edited by matching email in the modal
      var emailInput = modal.querySelector('input[class*="ant-input"]');
      var editEmail = emailInput ? emailInput.value : '';
      var staff = staffs.find(s => s.email === editEmail);
      if (staff && staff.subscribe_info_config) {
        var cfg = typeof staff.subscribe_info_config === 'string' 
          ? JSON.parse(staff.subscribe_info_config) 
          : staff.subscribe_info_config;
        toggles.forEach(t => {
          var cb = document.getElementById('tnetz-toggle-' + t.key);
          if (cb) cb.checked = cfg[t.key] !== false; // default true
        });
      }
    }).catch(() => {});

    // Hook into the modal OK button to save config
    var okBtn = modal.closest('.ant-modal-wrap').querySelector('.ant-modal-footer .ant-btn-primary');
    if (okBtn && !okBtn.dataset.tnetzInfoHooked) {
      okBtn.dataset.tnetzInfoHooked = 'true';
      okBtn.addEventListener('click', () => {
        // Build config object
        var config = {};
        toggles.forEach(t => {
          var cb = document.getElementById('tnetz-toggle-' + t.key);
          if (cb) config[t.key] = cb.checked;
        });
        // Get email and find staff
        var emailInput = modal.querySelector('input[class*="ant-input"]');
        var email = emailInput ? emailInput.value : '';
        if (!email) return;
        // Save subscribe_info_config via API after a slight delay
        setTimeout(() => {
          fetch('/api/v1/' + adminPrefix + '/webcon/fetch', {
            headers: { 'Authorization': localStorage.getItem('authorization') || '' }
          }).then(r => r.json()).then(data => {
            var staff = (data.data || []).find(s => s.email === email);
            if (staff) {
              fetch('/api/v1/' + adminPrefix + '/webcon/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('authorization') || '' },
                body: JSON.stringify({
                  id: staff.id,
                  email: email,
                  domain: staff.domain,
                  subscribe_info_config: config
                })
              }).catch(() => {});
            }
          }).catch(() => {});
        }, 1000);
      });
    }

    webconTogglesInjected = true;
  }

  // ========== ORDER COUPON COLUMN INJECTION ==========
  var orderCouponCache = {};

  // Intercept XHR to cache coupon data from order/fetch responses
  (function() {
    var origOpen = XMLHttpRequest.prototype.open;
    var origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url) {
      this._tnetzUrl = url;
      return origOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function() {
      var self = this;
      if (self._tnetzUrl && self._tnetzUrl.indexOf('/order/fetch') !== -1) {
        self.addEventListener('load', function() {
          try {
            var data = JSON.parse(self.responseText);
            if (data && data.data && Array.isArray(data.data)) {
              data.data.forEach(function(order) {
                if (order.trade_no) {
                  orderCouponCache[order.trade_no] = order.coupon_name || null;
                }
              });
              setTimeout(injectOrderCouponColumn, 300);
            }
          } catch(e) {}
        });
      }
      return origSend.apply(this, arguments);
    };
  })();

  function injectOrderCouponColumn() {
    if (!window.location.hash.includes('/order')) return;
    var table = document.querySelector('.ant-table-content table');
    if (!table) return;

    // Add header if not already present
    var thead = table.querySelector('thead tr');
    if (thead && !thead.querySelector('.tnetz-coupon-th')) {
      var th = document.createElement('th');
      th.className = 'ant-table-cell tnetz-coupon-th';
      th.textContent = 'Mã giảm giá';
      th.style.cssText = 'font-weight:600;white-space:nowrap;';
      // Insert before last column (actions)
      var lastTh = thead.querySelector('th:last-child');
      thead.insertBefore(th, lastTh);
    }

    // Add coupon data to each row
    var rows = table.querySelectorAll('tbody tr.ant-table-row');
    rows.forEach(function(row) {
      if (row.querySelector('.tnetz-coupon-td')) return;
      // Find trade_no from the row — first look for it in the text cells
      var tradeNo = '';
      var cells = row.querySelectorAll('td');
      cells.forEach(function(td) {
        var text = td.textContent.trim();
        if (/^[a-f0-9]{32,}$/i.test(text) || /^[a-f0-9-]{36}$/i.test(text)) {
          tradeNo = text;
        }
      });

      var td = document.createElement('td');
      td.className = 'ant-table-cell tnetz-coupon-td';
      var couponName = tradeNo ? orderCouponCache[tradeNo] : null;
      if (couponName) {
        td.innerHTML = '<span style="display:inline-block;padding:2px 8px;background:#f0f5ff;border:1px solid #adc6ff;border-radius:4px;font-size:12px;color:#1d39c4;white-space:nowrap;">🏷️ ' + couponName + '</span>';
      } else {
        td.innerHTML = '<span style="color:#bbb;font-size:12px;">—</span>';
      }
      var lastTd = row.querySelector('td:last-child');
      row.insertBefore(td, lastTd);
    });
  }

  // ========== NODE MONITOR BUTTON IN SIDEBAR ==========
  var monitorBtnInjected = false;
  function injectNodeMonitorButton() {
    if (monitorBtnInjected) return;
    // Find the sidebar menu
    var sidebar = document.querySelector('.ant-layout-sider-children .ant-menu, .ant-menu-root');
    if (!sidebar) return;
    // Check if already injected
    if (document.getElementById('tnetz-monitor-btn')) { monitorBtnInjected = true; return; }
    // Find the "server" submenu or last menu item
    var serverMenu = null;
    sidebar.querySelectorAll('.ant-menu-submenu, .ant-menu-item').forEach(function(item) {
      var text = item.textContent || '';
      if (text.includes('节点') || text.includes('Server') || text.includes('Máy chủ') || text.includes('服务器')) {
        serverMenu = item;
      }
    });
    // Create monitoring menu item
    var monitorItem = document.createElement('li');
    monitorItem.id = 'tnetz-monitor-btn';
    monitorItem.className = 'ant-menu-item';
    monitorItem.setAttribute('role', 'menuitem');
    monitorItem.style.cssText = 'cursor:pointer;';
    monitorItem.innerHTML = '<span><i aria-label="icon: dashboard" class="anticon" style="margin-right:8px;">📡</i><span>Node Monitor</span></span>';
    monitorItem.addEventListener('click', function() {
      var p = window.location.pathname.split('/')[1] || '';
      window.open('/' + p + '/node-stats', '_blank');
    });
    // Insert after server submenu or at end
    if (serverMenu && serverMenu.nextSibling) {
      sidebar.insertBefore(monitorItem, serverMenu.nextSibling);
    } else {
      sidebar.appendChild(monitorItem);
    }
    monitorBtnInjected = true;
  }

  // ========== ADMIN DASHBOARD ENHANCEMENT ==========
  var dashInjected = false;
  var AP = function(){ return '/api/v1/' + (window.location.pathname.split('/')[1] || ''); };
  var AH = function(){ return { 'Authorization': localStorage.getItem('authorization') || '', 'Content-Type': 'application/json' }; };
  var fmtMoney = function(v){ return ((v||0)/100).toLocaleString('vi-VN') + 'đ'; };
  var fmtBytes = function(b){if(!b)return '0 B';var u=['B','KB','MB','GB','TB'];var i=Math.floor(Math.log(b)/Math.log(1024));return (b/Math.pow(1024,i)).toFixed(1)+' '+u[i];};

  function injectDashboardEnhancement() {
    if (dashInjected) return;
    if (!window.location.hash.includes('/dashboard') && window.location.hash !== '' && window.location.hash !== '#/' && window.location.hash !== '#/dashboard') return;
    var container = document.querySelector('.ant-layout-content');
    if (!container) return;
    if (document.getElementById('tnetz-dash-enhanced')) { dashInjected = true; return; }

    var wrap = document.createElement('div');
    wrap.id = 'tnetz-dash-enhanced';
    wrap.innerHTML = '<style>' +
      '.tz-dash{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:0 0 24px}' +
      '.tz-row{display:grid;gap:16px;margin-bottom:16px}' +
      '.tz-r4{grid-template-columns:repeat(4,1fr)}' +
      '.tz-r2{grid-template-columns:repeat(2,1fr)}' +
      '.tz-r3{grid-template-columns:repeat(3,1fr)}' +
      '.tz-card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #f0f0f0;transition:all .2s}' +
      '.tz-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.1);transform:translateY(-2px)}' +
      '.tz-stat{display:flex;align-items:center;gap:16px}' +
      '.tz-stat-ico{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}' +
      '.tz-stat-val{font-size:22px;font-weight:800;color:rgba(0,0,0,.85);line-height:1.2}' +
      '.tz-stat-lbl{font-size:12px;color:rgba(0,0,0,.45);margin-top:2px}' +
      '.tz-stat-sub{font-size:11px;color:rgba(0,0,0,.35);margin-top:2px}' +
      '.tz-title{font-size:15px;font-weight:700;color:rgba(0,0,0,.85);margin-bottom:14px;display:flex;align-items:center;gap:8px}' +
      '.tz-title-badge{font-size:11px;background:#f0f5ff;color:#1d39c4;padding:2px 8px;border-radius:10px;font-weight:500}' +
      '.tz-tbl{width:100%;border-collapse:collapse;font-size:13px}' +
      '.tz-tbl th{text-align:left;padding:8px 10px;border-bottom:2px solid #f0f0f0;color:rgba(0,0,0,.45);font-weight:600;font-size:11px;text-transform:uppercase}' +
      '.tz-tbl td{padding:8px 10px;border-bottom:1px solid #f5f5f5}' +
      '.tz-tbl tr:hover td{background:#fafafa}' +
      '.tz-health-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}' +
      '.tz-online{background:#52c41a;box-shadow:0 0 6px rgba(82,196,26,.4)}' +
      '.tz-offline{background:#ff4d4f;box-shadow:0 0 6px rgba(255,77,79,.4)}' +
      '.tz-sys-ok{color:#52c41a;font-weight:600}.tz-sys-err{color:#ff4d4f;font-weight:600}' +
      '.tz-chart-wrap{position:relative;height:200px;overflow:hidden}' +
      '.tz-quick-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1px solid #d9d9d9;background:#fff;cursor:pointer;font-size:13px;transition:all .15s;color:rgba(0,0,0,.65)}' +
      '.tz-quick-btn:hover{border-color:#1890ff;color:#1890ff;background:#f0f5ff}' +
      '@media(max-width:768px){.tz-r4{grid-template-columns:repeat(2,1fr)}.tz-r2,.tz-r3{grid-template-columns:1fr}}' +
    '</style>' +
    '<div class="tz-dash">' +
      // Stats row
      '<div class="tz-row tz-r4" id="tz-stats-row">' +
        '<div class="tz-card"><div class="tz-stat"><div class="tz-stat-ico" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff">💰</div><div><div class="tz-stat-val" id="tz-day-income">—</div><div class="tz-stat-lbl">Doanh thu hôm nay</div><div class="tz-stat-sub" id="tz-month-income"></div></div></div></div>' +
        '<div class="tz-card"><div class="tz-stat"><div class="tz-stat-ico" style="background:linear-gradient(135deg,#f093fb,#f5576c);color:#fff">👥</div><div><div class="tz-stat-val" id="tz-online-users">—</div><div class="tz-stat-lbl">Online hiện tại</div><div class="tz-stat-sub" id="tz-day-reg"></div></div></div></div>' +
        '<div class="tz-card"><div class="tz-stat"><div class="tz-stat-ico" style="background:linear-gradient(135deg,#4facfe,#00f2fe);color:#fff">🎫</div><div><div class="tz-stat-val" id="tz-tickets">—</div><div class="tz-stat-lbl">Ticket chờ</div><div class="tz-stat-sub" id="tz-commission"></div></div></div></div>' +
        '<div class="tz-card"><div class="tz-stat"><div class="tz-stat-ico" style="background:linear-gradient(135deg,#43e97b,#38f9d7);color:#fff">📊</div><div><div class="tz-stat-val" id="tz-sys-status">—</div><div class="tz-stat-lbl">Hệ thống</div><div class="tz-stat-sub" id="tz-queue-info"></div></div></div></div>' +
      '</div>' +
      // Revenue chart + Server health
      '<div class="tz-row tz-r2">' +
        '<div class="tz-card"><div class="tz-title">📈 Doanh thu 30 ngày <span class="tz-title-badge" id="tz-chart-total"></span></div><div class="tz-chart-wrap"><canvas id="tz-revenue-chart" width="600" height="200"></canvas></div></div>' +
        '<div class="tz-card"><div class="tz-title">🏥 Server Health <span class="tz-title-badge" id="tz-health-count"></span></div><div id="tz-health-list" style="max-height:200px;overflow-y:auto"><div style="color:#bbb;text-align:center;padding:20px">Đang tải...</div></div></div>' +
      '</div>' +
      // Rankings
      '<div class="tz-row tz-r3">' +
        '<div class="tz-card"><div class="tz-title">🏆 Top User hôm nay</div><div id="tz-user-rank" style="max-height:250px;overflow-y:auto"><div style="color:#bbb;text-align:center;padding:20px">Đang tải...</div></div></div>' +
        '<div class="tz-card"><div class="tz-title">🖥️ Top Server hôm nay</div><div id="tz-server-rank" style="max-height:250px;overflow-y:auto"><div style="color:#bbb;text-align:center;padding:20px">Đang tải...</div></div></div>' +
        '<div class="tz-card"><div class="tz-title">⚡ Hành động nhanh</div><div style="display:flex;flex-wrap:wrap;gap:8px">' +
          '<button class="tz-quick-btn" onclick="window.location.hash=\'#/user\'">👥 Quản lý User</button>' +
          '<button class="tz-quick-btn" onclick="window.location.hash=\'#/order\'">📦 Đơn hàng</button>' +
          '<button class="tz-quick-btn" onclick="window.location.hash=\'#/coupon\'">🏷️ Mã giảm giá</button>' +
          '<button class="tz-quick-btn" onclick="window.location.hash=\'#/ticket\'">💬 Ticket</button>' +
          '<button class="tz-quick-btn" onclick="window.location.hash=\'#/plan\'">📋 Gói dịch vụ</button>' +
          '<button class="tz-quick-btn" onclick="window.location.hash=\'#/notice\'">📢 Thông báo</button>' +
          '<button class="tz-quick-btn" onclick="window.location.hash=\'#/config/system\'">⚙️ Cấu hình</button>' +
          '<button class="tz-quick-btn" onclick="window.location.hash=\'#/knowledge\'">📚 Hướng dẫn</button>' +
          '<button class="tz-quick-btn" onclick="window._tz_genGift()">🎁 Tạo Gift Card</button>' +
          '<button class="tz-quick-btn" onclick="window._tz_exportRev()">📥 Xuất doanh thu</button>' +
        '</div></div>' +
      '</div>' +
    '</div>';

    // Insert at the top of content
    var firstChild = container.firstChild;
    if (firstChild) container.insertBefore(wrap, firstChild);
    else container.appendChild(wrap);

    // Load data
    loadDashStats();
    loadRevenueChart();
    loadServerHealth();
    loadUserRank();
    loadServerRank();

    dashInjected = true;
  }

  function loadDashStats() {
    Promise.all([
      fetch(AP() + '/stat/getOverride', { headers: AH() }).then(r => r.json()),
      fetch(AP() + '/system/getSystemStatus', { headers: AH() }).then(r => r.json()).catch(() => ({ data: {} })),
      fetch(AP() + '/system/getQueueStats', { headers: AH() }).then(r => r.json()).catch(() => ({ data: {} }))
    ]).then(function(res) {
      var s = res[0].data || {};
      var sys = res[1].data || {};
      var q = res[2].data || {};

      var di = document.getElementById('tz-day-income');
      if (di) di.textContent = fmtMoney(s.day_income);
      var mi = document.getElementById('tz-month-income');
      if (mi) mi.textContent = 'Tháng: ' + fmtMoney(s.month_income) + ' | Tháng trước: ' + fmtMoney(s.last_month_income);

      var ou = document.getElementById('tz-online-users');
      if (ou) ou.textContent = (s.online_user || 0).toLocaleString();
      var dr = document.getElementById('tz-day-reg');
      if (dr) dr.textContent = 'Hôm nay: +' + (s.day_register_total || 0) + ' | Tháng: +' + (s.month_register_total || 0);

      var tk = document.getElementById('tz-tickets');
      if (tk) tk.textContent = s.ticket_pending_total || 0;
      var cm = document.getElementById('tz-commission');
      if (cm) cm.textContent = 'HH chờ: ' + (s.commission_pending_total || 0) + ' đơn';

      var ss = document.getElementById('tz-sys-status');
      if (ss) {
        var ok = sys.schedule && sys.horizon;
        ss.innerHTML = ok ? '<span class="tz-sys-ok">✅ OK</span>' : '<span class="tz-sys-err">⚠️ Lỗi</span>';
      }
      var qi = document.getElementById('tz-queue-info');
      if (qi) qi.textContent = 'Jobs: ' + (q.recentJobs || 0) + ' | ' + (q.jobsPerMinute || 0) + '/min | Fail: ' + (q.failedJobs || 0);
    }).catch(function() {});
  }

  function loadRevenueChart() {
    fetch(AP() + '/stat/getRevenueChart?period=month', { headers: AH() })
    .then(r => r.json()).then(function(j) {
      var data = j.data || [];
      if (!data.length) return;
      var canvas = document.getElementById('tz-revenue-chart');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var W = canvas.parentElement.offsetWidth || 600;
      var H = 200;
      canvas.width = W * 2; canvas.height = H * 2;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.scale(2, 2);

      var vals = data.map(function(d) { return d.revenue / 100; });
      var maxV = Math.max.apply(null, vals) || 1;
      var total = vals.reduce(function(a, b) { return a + b; }, 0);
      var ct = document.getElementById('tz-chart-total');
      if (ct) ct.textContent = 'Tổng: ' + total.toLocaleString('vi-VN') + 'đ';

      var pad = { t: 20, r: 20, b: 30, l: 60 };
      var cw = W - pad.l - pad.r;
      var ch = H - pad.t - pad.b;
      var step = cw / (vals.length - 1 || 1);

      // Grid lines
      ctx.strokeStyle = '#f0f0f0'; ctx.lineWidth = 0.5;
      for (var g = 0; g <= 4; g++) {
        var gy = pad.t + ch - (ch / 4) * g;
        ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
        ctx.fillStyle = '#bbb'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxV / 4 * g).toLocaleString(), pad.l - 6, gy + 3);
      }

      // Gradient fill
      var grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
      grad.addColorStop(0, 'rgba(102,126,234,0.3)');
      grad.addColorStop(1, 'rgba(102,126,234,0.02)');
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t + ch);
      vals.forEach(function(v, i) {
        var x = pad.l + i * step;
        var y = pad.t + ch - (v / maxV) * ch;
        if (i === 0) ctx.lineTo(x, y);
        else {
          var px = pad.l + (i-1) * step;
          var py = pad.t + ch - (vals[i-1] / maxV) * ch;
          var cpx = (px + x) / 2;
          ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
        }
      });
      ctx.lineTo(pad.l + (vals.length-1) * step, pad.t + ch);
      ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

      // Line
      ctx.beginPath(); ctx.strokeStyle = '#667eea'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      vals.forEach(function(v, i) {
        var x = pad.l + i * step;
        var y = pad.t + ch - (v / maxV) * ch;
        if (i === 0) ctx.moveTo(x, y);
        else {
          var px = pad.l + (i-1) * step;
          var py = pad.t + ch - (vals[i-1] / maxV) * ch;
          var cpx = (px + x) / 2;
          ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
        }
      });
      ctx.stroke();

      // Dots
      vals.forEach(function(v, i) {
        var x = pad.l + i * step;
        var y = pad.t + ch - (v / maxV) * ch;
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.strokeStyle = '#667eea'; ctx.lineWidth = 2; ctx.stroke();
      });

      // Labels
      ctx.fillStyle = '#999'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
      data.forEach(function(d, i) {
        if (i % 5 === 0 || i === data.length - 1) {
          var x = pad.l + i * step;
          ctx.fillText(d.date.substring(5), x, H - pad.b + 14);
        }
      });
    }).catch(function() {});
  }

  function loadServerHealth() {
    fetch(AP() + '/health/check', { headers: AH() })
    .then(r => r.json()).then(function(j) {
      var servers = j.data || [];
      var el = document.getElementById('tz-health-list');
      var cnt = document.getElementById('tz-health-count');
      if (!el) return;
      var on = servers.filter(function(s) { return s.status === 'online'; }).length;
      if (cnt) cnt.textContent = on + '/' + servers.length + ' online';
      if (!servers.length) { el.innerHTML = '<div style="color:#bbb;text-align:center;padding:20px">Không có server</div>'; return; }
      var h = '<table class="tz-tbl"><thead><tr><th>Server</th><th>Loại</th><th>Trạng thái</th><th>Online</th></tr></thead><tbody>';
      servers.forEach(function(s) {
        h += '<tr><td style="font-weight:500">' + (s.name || '—') + '</td><td><span style="background:#f5f5f5;padding:2px 6px;border-radius:4px;font-size:11px">' + (s.type || '—') + '</span></td><td><span class="tz-health-dot ' + (s.status==='online'?'tz-online':'tz-offline') + '"></span>' + (s.status==='online'?'Online':'Offline') + '</td><td>' + (s.online_users||0) + '</td></tr>';
      });
      h += '</tbody></table>';
      el.innerHTML = h;
    }).catch(function() {
      var el = document.getElementById('tz-health-list');
      if (el) el.innerHTML = '<div style="color:#bbb;text-align:center;padding:20px">Không thể tải</div>';
    });
  }

  function loadUserRank() {
    fetch(AP() + '/stat/getUserTodayRank', { headers: AH() })
    .then(r => r.json()).then(function(j) {
      var users = j.data || [];
      var el = document.getElementById('tz-user-rank');
      if (!el) return;
      if (!users.length) { el.innerHTML = '<div style="color:#bbb;text-align:center;padding:20px">Chưa có dữ liệu</div>'; return; }
      var h = '<table class="tz-tbl"><thead><tr><th>#</th><th>Email</th><th>Traffic</th></tr></thead><tbody>';
      users.forEach(function(u, i) {
        var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
        h += '<tr><td>' + medal + '</td><td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (u.email || 'ID:' + u.user_id) + '</td><td style="font-weight:600">' + (u.total || 0) + ' GB</td></tr>';
      });
      h += '</tbody></table>';
      el.innerHTML = h;
    }).catch(function() {});
  }

  function loadServerRank() {
    fetch(AP() + '/stat/getServerTodayRank', { headers: AH() })
    .then(r => r.json()).then(function(j) {
      var servers = j.data || [];
      var el = document.getElementById('tz-server-rank');
      if (!el) return;
      if (!servers.length) { el.innerHTML = '<div style="color:#bbb;text-align:center;padding:20px">Chưa có dữ liệu</div>'; return; }
      var h = '<table class="tz-tbl"><thead><tr><th>#</th><th>Server</th><th>Loại</th><th>Traffic</th></tr></thead><tbody>';
      servers.forEach(function(s, i) {
        var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
        h += '<tr><td>' + medal + '</td><td style="font-weight:500">' + (s.server_name || 'ID:' + s.server_id) + '</td><td><span style="background:#f5f5f5;padding:2px 6px;border-radius:4px;font-size:11px">' + (s.server_type || '') + '</span></td><td style="font-weight:600">' + (s.total || 0) + ' GB</td></tr>';
      });
      h += '</tbody></table>';
      el.innerHTML = h;
    }).catch(function() {});
  }

  // Quick actions
  window._tz_genGift = function() {
    var existing = document.getElementById('tz-gift-modal');
    if (existing) existing.remove();
    var ov = document.createElement('div');
    ov.id = 'tz-gift-modal';
    ov.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.45);z-index:99999;display:flex;justify-content:center;align-items:center;';
    var m = document.createElement('div');
    m.style.cssText = 'background:#fff;border-radius:12px;padding:24px;width:400px;max-width:90%;box-shadow:0 20px 60px rgba(0,0,0,.3);';
    m.innerHTML = '<h3 style="margin:0 0 16px;font-size:16px">🎁 Tạo Gift Card nhanh</h3>' +
      '<div style="margin-bottom:12px"><label style="font-size:13px;color:#666;display:block;margin-bottom:4px">Số tiền (x100, VD: 10000 = 100đ)</label><input id="tz-gc-amt" type="number" class="ant-input" placeholder="10000" style="width:100%"></div>' +
      '<div style="margin-bottom:12px"><label style="font-size:13px;color:#666;display:block;margin-bottom:4px">Số lượng</label><input id="tz-gc-qty" type="number" class="ant-input" value="1" style="width:100%"></div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end">' +
        '<button id="tz-gc-cancel" class="ant-btn" style="padding:6px 20px">Hủy</button>' +
        '<button id="tz-gc-submit" class="ant-btn ant-btn-primary" style="padding:6px 20px">Tạo</button>' +
      '</div>' +
      '<div id="tz-gc-result" style="margin-top:12px;font-size:13px"></div>';
    ov.appendChild(m);
    document.body.appendChild(ov);
    ov.onclick = function(e) { if (e.target === ov) ov.remove(); };
    document.getElementById('tz-gc-cancel').onclick = function() { ov.remove(); };
    document.getElementById('tz-gc-submit').onclick = function() {
      var amt = parseInt(document.getElementById('tz-gc-amt').value);
      var qty = parseInt(document.getElementById('tz-gc-qty').value) || 1;
      if (!amt || amt <= 0) { alert('Nhập số tiền hợp lệ'); return; }
      var btn = document.getElementById('tz-gc-submit');
      btn.textContent = 'Đang tạo...'; btn.disabled = true;
      fetch(AP() + '/giftcard/generate', {
        method: 'POST', headers: AH(),
        body: JSON.stringify({ amount: amt, count: qty })
      }).then(r => r.json()).then(function(d) {
        btn.textContent = 'Tạo'; btn.disabled = false;
        var res = document.getElementById('tz-gc-result');
        if (d.data && Array.isArray(d.data)) {
          res.innerHTML = '<div style="color:#52c41a;margin-bottom:8px">✅ Đã tạo ' + d.data.length + ' mã:</div>' +
            '<textarea class="ant-input" rows="3" style="font-family:monospace;font-size:12px" readonly>' + d.data.map(g => g.code).join('\n') + '</textarea>';
        } else {
          res.innerHTML = '<span style="color:#52c41a">✅ ' + (d.message || 'Đã tạo') + '</span>';
        }
      }).catch(function(e) {
        btn.textContent = 'Tạo'; btn.disabled = false;
        document.getElementById('tz-gc-result').innerHTML = '<span style="color:#ff4d4f">❌ ' + e.message + '</span>';
      });
    };
  };

  window._tz_exportRev = function() {
    var month = prompt('Xuất doanh thu tháng nào? (VD: 2026-03)', new Date().toISOString().substring(0, 7));
    if (!month) return;
    window.open(AP() + '/stat/exportRevenue?month=' + month + '&authorization=' + encodeURIComponent(localStorage.getItem('authorization') || ''), '_blank');
  };

  // ========== INIT ==========
  window.addEventListener('load', () => { translatePage(); translatePlaceholders(); });

  var observer = new MutationObserver(() => {
    translatePage();
    translatePlaceholders();
    translateSelectOptions();
    translateMessages();
    injectSetSniButton();
    injectTnetzTab();
    injectWebconInfoToggles();
    injectOrderCouponColumn();
    injectNodeMonitorButton();
    injectDashboardEnhancement();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['placeholder'] });

  // Reset tab injection on hash change
  window.addEventListener('hashchange', () => { tnetzTabInjected = false; webconTogglesInjected = false; orderCouponCache = {}; dashInjected = false; });

  setInterval(() => { translatePlaceholders(); translateSelectOptions(); translateMessages(); }, 800);
})();
