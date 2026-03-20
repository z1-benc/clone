<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TNETZ Config — Cấu Hình Nâng Cao</title>
    <style>
        :root { --primary: #667eea; --primary-dark: #5a67d8; --bg: #f0f2f5; --card: #fff; --text: #2d3748; --text-light: #718096; --border: #e2e8f0; --success: #48bb78; --danger: #f56565; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 24px 32px; box-shadow: 0 4px 20px rgba(102,126,234,0.3); }
        .header h1 { font-size: 22px; font-weight: 600; }
        .header p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
        .container { max-width: 1000px; margin: 24px auto; padding: 0 20px; }
        .card { background: var(--card); border-radius: 12px; box-shadow: 0 1px 8px rgba(0,0,0,0.06); margin-bottom: 20px; overflow: hidden; }
        .card-header { padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
        .card-header h2 { font-size: 16px; font-weight: 600; }
        .card-header .icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .clash-icon { background: #eef2ff; color: #667eea; }
        .singbox-icon { background: #fef3e2; color: #ed8936; }
        .sni-icon { background: #e6fffa; color: #38b2ac; }
        .card-body { padding: 20px 24px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 6px; }
        .form-group .hint { font-size: 12px; color: var(--text-light); margin-bottom: 6px; }
        textarea { width: 100%; min-height: 160px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; line-height: 1.5; resize: vertical; transition: border-color 0.2s; background: #fafbfc; }
        textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        input[type="text"] { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; transition: border-color 0.2s; }
        input[type="text"]:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        .btn { padding: 10px 28px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
        .btn-back { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
        .btn-back:hover { background: #e2e8f0; }
        .actions { display: flex; gap: 12px; justify-content: flex-end; padding: 20px 0; }
        .toast { position: fixed; top: 20px; right: 20px; padding: 12px 24px; border-radius: 8px; color: #fff; font-size: 14px; z-index: 9999; transform: translateX(120%); transition: transform 0.3s ease; }
        .toast.show { transform: translateX(0); }
        .toast.success { background: var(--success); }
        .toast.error { background: var(--danger); }
        .tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 20px; flex-wrap: wrap; }
        .tab { padding: 10px 20px; font-size: 14px; font-weight: 500; color: var(--text-light); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
        .tab.active { color: var(--primary); border-bottom-color: var(--primary); }
        .tab:hover { color: var(--primary-dark); }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .region-icon { background: #fef3e2; color: #38b2ac; }
        .region-row { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; padding: 14px; background: #f8fafc; border-radius: 10px; border: 1px solid var(--border); position: relative; transition: all 0.2s; }
        .region-row:hover { border-color: var(--primary); box-shadow: 0 2px 8px rgba(102,126,234,0.1); }
        .region-row .region-field { flex: 1; }
        .region-row .region-field.name-field { flex: 0.8; }
        .region-row .region-field.icon-field { flex: 0.4; }
        .region-row input { width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; }
        .region-row input:focus { outline: none; border-color: var(--primary); }
        .btn-remove { width: 32px; height: 32px; border-radius: 50%; border: none; background: #fed7d7; color: #e53e3e; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        .btn-remove:hover { background: #e53e3e; color: #fff; }
        .btn-add { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: 2px dashed var(--border); border-radius: 10px; background: transparent; color: var(--primary); cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; width: 100%; justify-content: center; }
        .btn-add:hover { border-color: var(--primary); background: #eef2ff; }
        .region-label { font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .region-default-badge { display: inline-block; padding: 2px 8px; background: #c6f6d5; color: #276749; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚙️ TNETZ Config — Cấu Hình Nâng Cao</h1>
        <p>Setup Clash, Singbox, SNI và các cấu hình tùy chỉnh trực tiếp trên web</p>
    </div>
    <div class="container">
        <div class="tabs">
            <div class="tab active" data-tab="region">🌐 Khu vực</div>
            <div class="tab" data-tab="clash">🔥 Clash</div>
            <div class="tab" data-tab="singbox">📦 Singbox</div>
            <div class="tab" data-tab="sni">🔒 SNI</div>
        </div>

        <div id="tab-region" class="tab-content active">
            <div class="card">
                <div class="card-header"><div class="icon region-icon">🌐</div><h2>URL Đăng Ký Theo Khu Vực</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label>URL Mặc Định <span class="region-default-badge">Mặc định</span></label>
                        <div class="hint">URL đăng ký chính, được dùng khi khách hàng không chọn khu vực. Cấu hình trong mục Hệ Thống → URL Đăng Ký.</div>
                        <input type="text" id="default_subscribe_url" disabled placeholder="Được lấy từ cài đặt hệ thống">
                    </div>
                    <div class="form-group">
                        <label>Khu Vực Đăng Ký Thêm</label>
                        <div class="hint">Ấn dấu ➕ để thêm URL khu vực mới. Mỗi khu vực có tên, URL riêng và icon.</div>
                        <div id="regions-container"></div>
                        <button class="btn-add" onclick="addRegionRow()">
                            ➕ Thêm khu vực mới
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="tab-clash" class="tab-content">
            <div class="card">
                <div class="card-header"><div class="icon clash-icon">⚡</div><h2>Clash DNS Config</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label>DNS Configuration (YAML)</label>
                        <div class="hint">Cấu hình DNS cho Clash client. Hỗ trợ YAML format.</div>
                        <textarea id="clash_dns_config" placeholder="dns:&#10;  enable: true&#10;  nameserver:&#10;    - 8.8.8.8&#10;    - 1.1.1.1"></textarea>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><div class="icon clash-icon">🔀</div><h2>Clash Proxy Group</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label>Proxy Group Configuration (YAML)</label>
                        <div class="hint">Cấu hình proxy groups cho Clash client.</div>
                        <textarea id="clash_proxy_group" placeholder="proxy-groups:&#10;  - name: Auto&#10;    type: url-test&#10;    proxies: []"></textarea>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><div class="icon clash-icon">📝</div><h2>Clash Custom Config</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label>Custom Rules & Config (YAML)</label>
                        <div class="hint">Cấu hình tuỳ chỉnh thêm cho Clash (rules, script, v.v.)</div>
                        <textarea id="clash_custom_config" placeholder="rules:&#10;  - DOMAIN-SUFFIX,google.com,PROXY&#10;  - MATCH,DIRECT"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <div id="tab-singbox" class="tab-content">
            <div class="card">
                <div class="card-header"><div class="icon singbox-icon">🌐</div><h2>Singbox DNS Config</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label>DNS Configuration (JSON)</label>
                        <div class="hint">Cấu hình DNS cho Singbox client. Hỗ trợ JSON format.</div>
                        <textarea id="singbox_dns_config" placeholder='{"servers": [{"address": "8.8.8.8"}]}'></textarea>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><div class="icon singbox-icon">🔌</div><h2>Singbox Outbound Config</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label>Outbound Configuration (JSON)</label>
                        <div class="hint">Cấu hình outbound cho Singbox client.</div>
                        <textarea id="singbox_outbound_config" placeholder='[{"type": "direct", "tag": "direct"}]'></textarea>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><div class="icon singbox-icon">📏</div><h2>Singbox Custom Rules</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label>Route Rules (JSON)</label>
                        <div class="hint">Cấu hình route rules cho Singbox client.</div>
                        <textarea id="singbox_custom_rules" placeholder='[{"protocol": "dns", "outbound": "dns-out"}]'></textarea>
                    </div>
                </div>
            </div>
        </div>

        <div id="tab-sni" class="tab-content">
            <div class="card">
                <div class="card-header"><div class="icon sni-icon">🔒</div><h2>Danh sách SNI</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label>SNI List</label>
                        <div class="hint">Mỗi dòng 1 SNI theo format: tên|network_settings|nội_dung. User sẽ chọn từ danh sách này.</div>
                        <textarea id="sni_list" placeholder="Default SNI|default|content1&#10;Custom SNI|custom|content2"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <div class="actions">
            <button class="btn btn-back" onclick="window.history.back()">← Quay lại</button>
            <button class="btn btn-primary" onclick="saveConfig()">💾 Lưu cấu hình</button>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <script>
        const FIELDS = ['clash_custom_config','singbox_custom_rules','sni_list','clash_dns_config','clash_proxy_group','singbox_dns_config','singbox_outbound_config'];
        const API_BASE = window.location.pathname.replace(/\/tnetz.*/, '');
        const SECURE_PATH = '{{$secure_path}}';

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            });
        });

        // ===== Region Management =====
        function addRegionRow(name = '', url = '', icon = '🌍') {
            const container = document.getElementById('regions-container');
            const row = document.createElement('div');
            row.className = 'region-row';
            row.innerHTML = `
                <div class="region-field icon-field">
                    <div class="region-label">Icon</div>
                    <input type="text" class="region-icon-input" value="${icon}" placeholder="🇨🇳">
                </div>
                <div class="region-field name-field">
                    <div class="region-label">Tên khu vực</div>
                    <input type="text" class="region-name" value="${name}" placeholder="VD: China, Russia, Japan...">
                </div>
                <div class="region-field">
                    <div class="region-label">URL đăng ký</div>
                    <input type="text" class="region-url" value="${url}" placeholder="https://cn.example.com">
                </div>
                <button class="btn-remove" onclick="this.parentElement.remove()" title="Xóa khu vực">×</button>
            `;
            container.appendChild(row);
        }

        function getRegionsJSON() {
            const rows = document.querySelectorAll('.region-row');
            const regions = [];
            rows.forEach(row => {
                const name = row.querySelector('.region-name').value.trim();
                const url = row.querySelector('.region-url').value.trim();
                const icon = row.querySelector('.region-icon-input').value.trim() || '🌍';
                if (name && url) {
                    regions.push({ name, url, icon, code: name.toLowerCase().replace(/[^a-z0-9]/g, '_') });
                }
            });
            return JSON.stringify(regions);
        }

        // ===== Config Load/Save =====
        async function loadConfig() {
            try {
                // Load tnetz config
                const res = await fetch('/api/v1/' + SECURE_PATH + '/config/fetch?key=tnetz', {
                    headers: { 'Authorization': getToken() }
                });
                const data = await res.json();
                if (data.data && data.data.tnetz) {
                    FIELDS.forEach(f => {
                        const el = document.getElementById(f);
                        if (el && data.data.tnetz[f]) el.value = data.data.tnetz[f];
                    });
                    // Load regions
                    if (data.data.tnetz.subscribe_urls) {
                        try {
                            const regions = JSON.parse(data.data.tnetz.subscribe_urls);
                            if (Array.isArray(regions)) {
                                regions.forEach(r => addRegionRow(r.name || '', r.url || '', r.icon || '🌍'));
                            }
                        } catch(e) { /* ignore parse error */ }
                    }
                }
                // Load default subscribe_url from site config
                const siteRes = await fetch('/api/v1/' + SECURE_PATH + '/config/fetch?key=site', {
                    headers: { 'Authorization': getToken() }
                });
                const siteData = await siteRes.json();
                if (siteData.data && siteData.data.site && siteData.data.site.subscribe_url) {
                    document.getElementById('default_subscribe_url').value = siteData.data.site.subscribe_url;
                }
            } catch(e) { showToast('Lỗi tải config: ' + e.message, 'error'); }
        }

        async function saveConfig() {
            try {
                const body = {};
                FIELDS.forEach(f => { body[f] = document.getElementById(f).value; });
                // Save regions as JSON
                body.subscribe_urls = getRegionsJSON();
                const res = await fetch('/api/v1/' + SECURE_PATH + '/config/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': getToken() },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (data.data) { showToast('✅ Đã lưu cấu hình thành công!', 'success'); }
                else { showToast('❌ Lưu thất bại', 'error'); }
            } catch(e) { showToast('Lỗi: ' + e.message, 'error'); }
        }

        function getToken() {
            const cookies = document.cookie.split(';');
            for (const c of cookies) {
                const [k, v] = c.trim().split('=');
                if (k === 'auth_data') return v;
            }
            return localStorage.getItem('auth_data') || sessionStorage.getItem('auth_data') || '';
        }

        function showToast(msg, type) {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.className = 'toast ' + type + ' show';
            setTimeout(() => t.classList.remove('show'), 3000);
        }

        loadConfig();
    </script>
</body>
</html>
