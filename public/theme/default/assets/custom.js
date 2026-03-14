/**
 * V2Board User Custom JS
 * Features: SNI Selection + Extra Device/Data Purchase
 */
(function() {
  'use strict';

  var API_BASE = '/api/v1/user';
  var injected = false;

  // ========== HELPERS ==========
  function getAuthHeaders() {
    var token = localStorage.getItem('authorization') || '';
    return { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': token };
  }

  function apiGet(url) {
    return fetch(API_BASE + url, { headers: getAuthHeaders() }).then(async r => {
      var res = await r.json();
      if (!r.ok) throw new Error(res.message || 'Lỗi hệ thống');
      return res;
    });
  }

  function apiPost(url, body) {
    return fetch(API_BASE + url, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(body) }).then(async r => {
      var res = await r.json();
      if (!r.ok) throw new Error(res.message || 'Lỗi hệ thống');
      return res;
    });
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 GB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  function formatPrice(cents) {
    return (cents / 100).toLocaleString('vi-VN') + '₫';
  }

  // ========== SNI PANEL ==========
  function createSniPanel() {
    var panel = document.createElement('div');
    panel.id = 'tnetz-sni-panel';
    panel.style.cssText = 'background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:20px;margin:16px 0;color:#fff;box-shadow:0 4px 15px rgba(102,126,234,0.4);';
    panel.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">' +
      '<span style="font-size:20px;">🔒</span>' +
      '<div><div style="font-weight:700;font-size:16px;">Cấu hình SNI</div>' +
      '<div style="font-size:12px;opacity:0.8;">Chọn SNI phù hợp với mạng của bạn</div></div></div>' +
      '<div id="sni-current" style="background:rgba(255,255,255,0.15);border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:13px;">Đang tải...</div>' +
      '<select id="sni-user-select" style="width:100%;padding:10px 14px;border:none;border-radius:8px;font-size:14px;background:rgba(255,255,255,0.95);color:#333;margin-bottom:12px;cursor:pointer;">' +
      '<option value="">-- Chọn SNI --</option></select>' +
      '<button id="sni-user-save" style="width:100%;padding:10px;background:#fff;color:#667eea;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.2s;">Áp dụng SNI</button>';
    return panel;
  }

  function loadSniData() {
    apiGet('/sni/fetch').then(data => {
      var sel = document.getElementById('sni-user-select');
      var cur = document.getElementById('sni-current');
      if (!sel || !cur) return;

      var currentSni = data.current_sni || 'Chưa chọn';
      cur.innerHTML = '📡 SNI hiện tại: <strong>' + currentSni + '</strong>';

      sel.innerHTML = '<option value="">-- Chọn SNI --</option>';
      (data.data || []).forEach(s => {
        var selected = s.name_sni === currentSni ? ' selected' : '';
        sel.innerHTML += '<option value="' + s.network_settings + '" data-name="' + s.name_sni + '"' + selected + '>' + s.name_sni + '</option>';
      });
    });

    var saveBtn = document.getElementById('sni-user-save');
    if (saveBtn && !saveBtn.dataset.bound) {
      saveBtn.dataset.bound = 'true';
      saveBtn.addEventListener('click', () => {
        var sel = document.getElementById('sni-user-select');
        if (!sel.value) { alert('Chọn SNI trước'); return; }
        var name = sel.options[sel.selectedIndex].dataset.name;
        saveBtn.textContent = 'Đang lưu...';
        saveBtn.disabled = true;
        apiPost('/changeSNI', { name_sni: name, network_settings: sel.value }).then(d => {
          saveBtn.textContent = '✅ Đã lưu!';
          setTimeout(() => { saveBtn.textContent = 'Áp dụng SNI'; saveBtn.disabled = false; }, 2000);
          var cur = document.getElementById('sni-current');
          if (cur) cur.innerHTML = '📡 SNI hiện tại: <strong>' + name + '</strong>';
        }).catch(e => {
          saveBtn.textContent = '❌ Lỗi!';
          setTimeout(() => { saveBtn.textContent = 'Áp dụng SNI'; saveBtn.disabled = false; }, 2000);
        });
      });
    }
  }

  // ========== EXTRA PURCHASE PANEL ==========
  function createExtraPanel() {
    var panel = document.createElement('div');
    panel.id = 'tnetz-extra-panel';
    panel.style.cssText = 'background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:12px;padding:20px;margin:16px 0;color:#fff;box-shadow:0 4px 15px rgba(245,87,108,0.4);';
    panel.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">' +
      '<span style="font-size:20px;">🛒</span>' +
      '<div><div style="font-weight:700;font-size:16px;">Mua thêm</div>' +
      '<div style="font-size:12px;opacity:0.8;">Thiết bị & dung lượng data</div></div></div>' +
      '<div id="extra-info" style="background:rgba(255,255,255,0.15);border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:13px;">Đang tải...</div>' +
      '<div style="display:flex;gap:8px;">' +
      '<button id="extra-buy-device" style="flex:1;padding:10px;background:#fff;color:#f5576c;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">📱 Mua thiết bị</button>' +
      '<button id="extra-buy-data" style="flex:1;padding:10px;background:#fff;color:#f5576c;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">📦 Mua data</button></div>';
    return panel;
  }

  function loadExtraData() {
    apiGet('/extra/getInfo').then(data => {
      var info = document.getElementById('extra-info');
      var btnDevice = document.getElementById('extra-buy-device');
      var btnData = document.getElementById('extra-buy-data');
      if (!info || !data.data) return;
      var d = data.data;

      if (btnDevice) {
        btnDevice.disabled = (d.extra_device_price <= 0);
        btnDevice.style.opacity = (d.extra_device_price <= 0) ? '0.5' : '1';
        btnDevice.style.cursor = (d.extra_device_price <= 0) ? 'not-allowed' : 'pointer';
      }
      if (btnData) {
        btnData.disabled = (d.extra_data_price <= 0);
        btnData.style.opacity = (d.extra_data_price <= 0) ? '0.5' : '1';
        btnData.style.cursor = (d.extra_data_price <= 0) ? 'not-allowed' : 'pointer';
      }

      if (d.extra_device_price <= 0 && d.extra_data_price <= 0) {
        info.innerHTML = 'Gói hiện tại không hỗ trợ mua thêm';
        return;
      }
      var lines = [];
      if (d.extra_device_price > 0) lines.push('📱 Thiết bị: ' + formatPrice(d.extra_device_price) + '/cái | Đã mua: ' + (d.extra_devices || 0));
      if (d.extra_data_price > 0) lines.push('📦 Data: ' + formatPrice(d.extra_data_price) + '/' + (d.extra_data_amount || 100) + 'GB');
      info.innerHTML = lines.join('<br>');
    }).catch(e => {
        var info = document.getElementById('extra-info');
        if (info) info.innerHTML = 'Lỗi tải dữ liệu: ' + e.message;
    });

    ['extra-buy-device', 'extra-buy-data'].forEach(id => {
      var btn = document.getElementById(id);
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
          var isDevice = id.includes('device');
          var qty = prompt('Số lượng muốn mua (1-10):', '1');
          if (!qty || isNaN(qty) || qty < 1) return;
          btn.textContent = 'Đang xử lý...';
          btn.disabled = true;
          apiPost('/extra/' + (isDevice ? 'buyDevice' : 'buyData'), { quantity: parseInt(qty) }).then(d => {
            if (d.data && typeof d.data === 'string') {
              btn.textContent = '✅ Đang chuyển...';
              window.location.hash = '#/order/' + d.data;
            } else if (d.data && d.data.success) { // Backward compatible
              btn.textContent = '✅ Thành công!';
              alert('Mua thành công! Số dư còn: ' + formatPrice(d.data.balance));
              loadExtraData();
              setTimeout(() => {
                btn.textContent = isDevice ? '📱 Mua thiết bị' : '📦 Mua data';
                btn.disabled = false;
              }, 2000);
            } else {
              btn.textContent = '❌ Lỗi';
              setTimeout(() => {
                btn.textContent = isDevice ? '📱 Mua thiết bị' : '📦 Mua data';
                btn.disabled = false;
              }, 2000);
            }
          }).catch(e => {
            alert('Lỗi: ' + e.message);
            btn.textContent = isDevice ? '📱 Mua thiết bị' : '📦 Mua data';
            btn.disabled = false;
          });
        });
      }
    });
  }

  // ========== INJECT INTO USER DASHBOARD ==========
  function injectPanels() {
    if (injected) return;
    if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#/dashboard') {
      // Check if already injected
      if (document.getElementById('tnetz-sni-panel')) return;

      // Try multiple selectors for V2Board themes (Bootstrap-based or Ant Design)
      var container = document.querySelector('.content.content-full') || 
                      document.querySelector('.content-full') ||
                      document.querySelector('.ant-layout-content') || 
                      document.querySelector('#root > div > div:last-child');
      if (!container) return;

      // Find insertion point — after first .block or .ant-row card
      var firstBlock = container.querySelector('.block') || container.querySelector('.ant-row') || container.querySelector('.ant-card');

      // Add panels
      var wrapper = document.createElement('div');
      wrapper.id = 'tnetz-panels-wrapper';
      wrapper.style.cssText = 'padding:0 16px;max-width:1200px;margin:0 auto;';

      wrapper.appendChild(createSniPanel());
      wrapper.appendChild(createExtraPanel());

      if (firstBlock && firstBlock.nextSibling) {
        container.insertBefore(wrapper, firstBlock.nextSibling);
      } else {
        container.appendChild(wrapper);
      }

      injected = true;

      // Load data
      setTimeout(() => {
        loadSniData();
        loadExtraData();
      }, 500);
    }
  }

  // Reset injection flag on hash change
  window.addEventListener('hashchange', () => {
    injected = false;
    var existing = document.getElementById('tnetz-panels-wrapper');
    if (existing) existing.remove();
  });

  // Watch for DOM changes
  var observer = new MutationObserver(() => { injectPanels(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Initial try
  window.addEventListener('load', () => { setTimeout(injectPanels, 1000); });
})();
