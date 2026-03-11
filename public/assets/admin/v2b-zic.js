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
      if (translated !== node.nodeValue) {
        node.nodeValue = translated;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      ATTRS.forEach(attr => {
        if (node.hasAttribute(attr)) {
          const original = node.getAttribute(attr);
          const translated = translateText(original);
          if (translated !== original) {
            node.setAttribute(attr, translated);
          }
        }
      });
      node.childNodes.forEach(translateNode);
    }
  }

  function translatePage() {
    translateNode(document.body);
  }

  // ========== QR CODE GENERATOR (lightweight, no external library) ==========
  // Minimal QR Code generator using Canvas API + qrcode encoding
  // Uses the free qrserver API to generate QR images
  
  function createQRModal() {
    if (document.getElementById('qr-modal-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'qr-modal-overlay';
    overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:99999;justify-content:center;align-items:center;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:#fff;border-radius:12px;padding:24px;text-align:center;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
    
    modal.innerHTML = `
      <h3 style="margin:0 0 8px;font-size:16px;color:#333;">QR Code đăng ký</h3>
      <p id="qr-modal-email" style="margin:0 0 16px;font-size:13px;color:#888;word-break:break-all;"></p>
      <div id="qr-modal-img-wrap" style="display:flex;justify-content:center;margin-bottom:16px;">
        <img id="qr-modal-img" style="width:220px;height:220px;border:1px solid #eee;border-radius:8px;" />
      </div>
      <p id="qr-modal-url" style="margin:0 0 16px;font-size:11px;color:#aaa;word-break:break-all;max-height:60px;overflow:auto;"></p>
      <div style="display:flex;gap:8px;justify-content:center;">
        <button id="qr-modal-download" style="padding:8px 20px;background:#1890ff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">⬇ Tải QR</button>
        <button id="qr-modal-close" style="padding:8px 20px;background:#f5f5f5;color:#333;border:1px solid #d9d9d9;border-radius:6px;cursor:pointer;font-size:13px;">Đóng</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) hideQRModal();
    });
    
    document.getElementById('qr-modal-close').addEventListener('click', hideQRModal);
    document.getElementById('qr-modal-download').addEventListener('click', function() {
      const img = document.getElementById('qr-modal-img');
      const a = document.createElement('a');
      a.href = img.src;
      a.download = 'subscribe-qr.png';
      a.click();
    });
  }
  
  function showQRModal(url, email) {
    createQRModal();
    const overlay = document.getElementById('qr-modal-overlay');
    const img = document.getElementById('qr-modal-img');
    const emailEl = document.getElementById('qr-modal-email');
    const urlEl = document.getElementById('qr-modal-url');
    
    emailEl.textContent = email || '';
    urlEl.textContent = url;
    img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(url);
    overlay.style.display = 'flex';
  }
  
  function hideQRModal() {
    const overlay = document.getElementById('qr-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  // Inject QR button into admin user action dropdowns
  function injectQRButtons() {
    // Find all "Sao Chép URL" or "复制订阅URL" menu items and add QR option
    const menuItems = document.querySelectorAll('.ant-dropdown-menu-item');
    menuItems.forEach(item => {
      const text = item.textContent.trim();
      if ((text.includes('Sao Chép URL') || text.includes('复制订阅URL')) && !item.dataset.qrInjected) {
        item.dataset.qrInjected = 'true';
        
        const qrItem = item.cloneNode(true);
        qrItem.dataset.qrInjected = 'true';
        qrItem.textContent = '📱 QR Code đăng ký';
        qrItem.style.color = '#1890ff';
        
        qrItem.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          // Find the subscribe URL from the same row context
          // The URL is typically copied via the original button's click handler
          // We need to find it from the table row data
          const row = findParentRow(item);
          if (row) {
            const subscribeUrl = extractSubscribeUrl(row);
            const email = extractEmail(row);
            if (subscribeUrl) {
              showQRModal(subscribeUrl, email);
            }
          }
        });
        
        item.parentNode.insertBefore(qrItem, item.nextSibling);
      }
    });
  }
  
  function findParentRow(el) {
    // Walk up to find the table row that triggered this dropdown
    let current = el;
    while (current) {
      if (current.classList && current.classList.contains('ant-table-row')) {
        return current;
      }
      current = current.parentElement;
    }
    // Fallback: try to find the row from the dropdown's trigger
    return null;
  }
  
  function extractSubscribeUrl(row) {
    // Try to get subscribe URL from row data attributes or cells
    const cells = row ? row.querySelectorAll('td') : [];
    for (const cell of cells) {
      const text = cell.textContent;
      if (text && text.includes('/api/')) {
        return text.trim();
      }
    }
    return null;
  }
  
  function extractEmail(row) {
    const cells = row ? row.querySelectorAll('td') : [];
    for (const cell of cells) {
      const text = cell.textContent.trim();
      if (text && text.includes('@')) {
        return text;
      }
    }
    return '';
  }

  // ========== INIT ==========
  
  window.addEventListener('load', translatePage);
  const observer = new MutationObserver(function() {
    translatePage();
    injectQRButtons();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
