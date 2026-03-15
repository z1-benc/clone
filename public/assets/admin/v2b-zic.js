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
      var sic = data.data.subscribe_info_config;
      if (sic) {
        try { if (typeof sic === 'string') sic = JSON.parse(sic); } catch(e) {}
        ['show_user_id','show_plan','show_data','show_reset','show_expiry'].forEach(k => {
          var cb = document.getElementById('tnetz-sys-' + k);
          if (cb && sic[k] !== undefined) cb.checked = sic[k] !== false;
        });
      }
    }).catch(() => {});

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
          })
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
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['placeholder'] });

  // Reset tab injection on hash change
  window.addEventListener('hashchange', () => { tnetzTabInjected = false; webconTogglesInjected = false; orderCouponCache = {}; });

  setInterval(() => { translatePlaceholders(); translateSelectOptions(); translateMessages(); }, 800);
})();
