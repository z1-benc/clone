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

    // Create content panel — matching native form-item style like Telegram tab
    var contentArea = document.querySelector('.ant-tabs-content');
    if (!contentArea) contentArea = document.querySelector('.ant-tabs');

    var adminPrefix = window.location.pathname.split('/')[1];

    var tnetzPanel = document.createElement('div');
    tnetzPanel.id = 'tnetz-config-panel';
    tnetzPanel.style.cssText = 'display:none;';
    tnetzPanel.innerHTML =
      // Row 1: SNI List textarea
      '<div style="display:flex;align-items:flex-start;padding:24px 0;border-bottom:1px solid #f0f0f0;">' +
        '<div style="flex:0 0 45%;padding-right:24px;">' +
          '<div style="font-weight:600;font-size:14px;color:rgba(0,0,0,0.85);">Danh sách SNI</div>' +
          '<div style="font-size:13px;color:rgba(0,0,0,0.45);margin-top:4px;">Mỗi dòng là 1 SNI. Định dạng: Tên|Giá trị</div>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<textarea id="tnetz-sni-textarea" rows="6" style="width:100%;padding:8px 12px;border:1px solid #d9d9d9;border-radius:4px;font-family:monospace;font-size:13px;resize:vertical;transition:border-color 0.3s;" placeholder="Viettel|dl.viettel.vn&#10;MobiFone|gg.gg.vn&#10;VinaPhone|zalo.vn"></textarea>' +
        '</div>' +
      '</div>' +
      // Save button row — matching native umi.js style
      '<div style="padding:24px 0;text-align:right;">' +
        '<button id="tnetz-sni-save" class="ant-btn ant-btn-primary" style="padding:4px 24px;height:32px;border-radius:4px;background:#1890ff;border:1px solid #1890ff;color:#fff;cursor:pointer;font-size:14px;">Lưu</button>' +
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
        body: JSON.stringify({ sni_list: ta.value })
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

  // ========== EXTRA FIELDS IN PLAN EDIT FORM ==========
  var planFieldsInjected = false;

  function injectPlanExtraFields() {
    if (planFieldsInjected) return;
    if (!window.location.hash.includes('/plan')) return;
    if (document.getElementById('tnetz-plan-extra-fields')) { planFieldsInjected = true; return; }

    // Find plan form by detecting form-group with labels specific to plan page
    // The plan form has labels: 套餐流量 (Lưu lượng gói), 设备数限制, 权限组
    var formGroups = document.querySelectorAll('.form-group');
    var deviceLimitGroup = null;
    formGroups.forEach(fg => {
      var label = fg.querySelector('label');
      if (!label) return;
      var text = label.textContent.trim();
      // 设备数限制 = device limit, or Vietnamese translation
      if (text.includes('设备数限制') || text.includes('Giới hạn thiết bị') || text.includes('thiết bị')) {
        deviceLimitGroup = fg;
      }
    });
    if (!deviceLimitGroup) return;

    // Create section matching the existing form-group style
    var section = document.createElement('div');
    section.id = 'tnetz-plan-extra-fields';
    section.style.cssText = 'border-top:1px dashed #e8e8e8;padding-top:16px;margin-top:16px;';
    section.innerHTML =
      '<div style="font-weight:600;font-size:14px;color:rgba(0,0,0,0.85);margin-bottom:12px;">🛒 Cài đặt giá mua thêm</div>' +

      // Device price
      '<div class="form-group">' +
        '<label>Giá mỗi thiết bị thêm</label>' +
        '<span class="ant-input-wrapper ant-input-group">' +
          '<input id="tnetz-extra-device-price" type="number" class="ant-input" placeholder="Để trống = không bán thêm">' +
          '<span class="ant-input-group-addon">₫</span>' +
        '</span>' +
      '</div>' +

      // Data price  
      '<div class="form-group">' +
        '<label>Giá mua thêm lưu lượng</label>' +
        '<span class="ant-input-wrapper ant-input-group">' +
          '<input id="tnetz-extra-data-price" type="number" class="ant-input" placeholder="Để trống = không bán thêm">' +
          '<span class="ant-input-group-addon">₫</span>' +
        '</span>' +
      '</div>' +

      // Data amount per purchase
      '<div class="form-group">' +
        '<label>Lưu lượng mỗi lần mua</label>' +
        '<span class="ant-input-wrapper ant-input-group">' +
          '<input id="tnetz-extra-data-amount" type="number" class="ant-input" value="100" placeholder="100">' +
          '<span class="ant-input-group-addon">GB</span>' +
        '</span>' +
      '</div>';

    // Insert after device_limit form group
    deviceLimitGroup.parentNode.insertBefore(section, deviceLimitGroup.nextSibling);

    // Load existing values from API
    var adminPrefix = window.location.pathname.split('/')[1];
    // Get plan ID from the first column of selected/hovered row
    function getPlanId() {
      // Check all table rows for the one that triggered the drawer/form
      var rows = document.querySelectorAll('.ant-table-row');
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].classList.contains('ant-table-row-selected') || rows[i].matches(':hover')) {
          var td = rows[i].querySelector('td');
          if (td) return td.textContent.trim();
        }
      }
      // Fallback: try to get from the input values (id field)
      var idInput = document.querySelector('input[value][disabled]');
      if (idInput && /^\d+$/.test(idInput.value)) return idInput.value;
      return null;
    }

    var planId = getPlanId();
    if (planId) {
      fetch('/api/v1/' + adminPrefix + '/plan/fetch', {
        headers: { 'Authorization': localStorage.getItem('authorization') || '' }
      }).then(r => r.json()).then(data => {
        var plans = data.data || [];
        var plan = plans.find(p => String(p.id) === String(planId));
        if (plan) {
          var f1 = document.getElementById('tnetz-extra-device-price');
          var f2 = document.getElementById('tnetz-extra-data-price');
          var f3 = document.getElementById('tnetz-extra-data-amount');
          if (f1 && plan.extra_device_price) f1.value = plan.extra_device_price;
          if (f2 && plan.extra_data_price) f2.value = plan.extra_data_price;
          if (f3 && plan.extra_data_amount) f3.value = plan.extra_data_amount;
        }
      }).catch(() => {});
    }

    // Hook into the native save button to include extra fields
    var saveBtn = document.querySelector('.ant-btn-primary');
    if (saveBtn && !saveBtn.dataset.tnetzHooked) {
      saveBtn.dataset.tnetzHooked = 'true';
      saveBtn.addEventListener('click', () => {
        var pid = getPlanId();
        if (!pid) return;
        var v1 = document.getElementById('tnetz-extra-device-price');
        var v2 = document.getElementById('tnetz-extra-data-price');
        var v3 = document.getElementById('tnetz-extra-data-amount');
        if (!v1) return;
        // Save extra fields separately via API
        var body = { id: parseInt(pid) };
        if (v1.value) body.extra_device_price = parseInt(v1.value);
        if (v2.value) body.extra_data_price = parseInt(v2.value);
        if (v3.value) body.extra_data_amount = parseInt(v3.value);

        setTimeout(() => {
          fetch('/api/v1/' + adminPrefix + '/plan/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('authorization') || '' },
            body: JSON.stringify(body)
          }).catch(() => {});
        }, 500);
      });
    }

    planFieldsInjected = true;
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
    injectPlanExtraFields();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['placeholder'] });

  // Reset tab injection on hash change
  window.addEventListener('hashchange', () => { tnetzTabInjected = false; planFieldsInjected = false; });

  setInterval(() => { translatePlaceholders(); translateSelectOptions(); translateMessages(); }, 800);
})();
