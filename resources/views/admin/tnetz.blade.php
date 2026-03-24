<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TNETZ Config — V2Board</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#f0f2f5;--card:#fff;--border:#e8e8e8;--text:rgba(0,0,0,.85);--dim:rgba(0,0,0,.45);--accent:#1890ff;--green:#52c41a;--red:#ff4d4f}
body{font:400 14px/1.6 'Inter',-apple-system,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

/* Header */
.hd{background:var(--card);border-bottom:1px solid var(--border);padding:12px 24px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:10}
.hd h1{font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px}
.hd-right{margin-left:auto;display:flex;gap:12px;align-items:center}
.btn-back{color:var(--accent);text-decoration:none;font-size:13px;font-weight:500;display:flex;align-items:center;gap:4px;border:1px solid var(--border);padding:4px 12px;border-radius:4px;background:#fff}
.btn-back:hover{color:#40a9ff;border-color:#40a9ff}

/* Block */
.container{padding:20px 24px;max-width:1200px}
.block{background:var(--card);border:1px solid var(--border);border-radius:4px;margin-bottom:16px}
.block-hdr{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.block-title{font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}

/* Table */
.tbl{width:100%;border-collapse:collapse}
.tbl th{background:#fafafa;padding:12px 16px;text-align:left;font-weight:500;color:var(--text);border-bottom:1px solid var(--border);font-size:13px;white-space:nowrap}
.tbl td{padding:12px 16px;border-bottom:1px solid var(--border);color:rgba(0,0,0,.65);vertical-align:middle}
.tbl tr:hover td{background:#e6f7ff}
.tbl .mono{font-family:'SFMono-Regular',Consolas,monospace;font-size:12px;color:#333}

/* Switch */
.sw{position:relative;display:inline-block;width:36px;height:20px;cursor:pointer;vertical-align:middle}
.sw input{opacity:0;width:0;height:0}
.sw-s{position:absolute;inset:0;background:#00000040;border-radius:20px;transition:.2s}
.sw-s:before{content:"";position:absolute;height:16px;width:16px;left:2px;top:2px;background:#fff;border-radius:50%;transition:.2s;box-shadow:0 2px 4px rgba(0,0,0,.2)}
.sw input:checked+.sw-s{background:var(--accent)}
.sw input:checked+.sw-s:before{transform:translateX(16px)}

/* Actions */
.act{color:var(--accent);cursor:pointer;font-size:13px;background:none;border:none;padding:0}.act:hover{color:#40a9ff}
.divider{display:inline-block;width:1px;height:14px;background:var(--border);margin:0 8px;vertical-align:middle}

/* Buttons */
.btn{padding:5px 16px;border-radius:4px;font-size:14px;cursor:pointer;border:1px solid var(--border);background:#fff;color:rgba(0,0,0,.65);transition:.2s;line-height:1.5;display:inline-flex;align-items:center;gap:4px}
.btn:hover{color:#40a9ff;border-color:#40a9ff}
.btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}.btn-primary:hover{background:#40a9ff;border-color:#40a9ff}
.btn-sm{padding:2px 10px;font-size:12px}

/* Empty */
.empty{text-align:center;padding:32px;color:var(--dim);font-size:14px}

/* Modal */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;justify-content:center;align-items:center}
.modal{background:#fff;border-radius:4px;width:520px;max-width:90vw;max-height:85vh;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.modal-hdr{padding:16px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.modal-title{font-size:16px;font-weight:600}
.modal-close{background:none;border:none;font-size:20px;cursor:pointer;color:var(--dim);line-height:1}.modal-close:hover{color:rgba(0,0,0,.75)}
.modal-body{padding:24px}
.modal-footer{padding:10px 16px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:13px;font-weight:500;color:var(--text);margin-bottom:6px}
.form-help{font-size:12px;color:var(--dim);margin-top:4px}
.form-input{width:100%;padding:6px 12px;border:1px solid var(--border);border-radius:4px;font-size:14px;transition:.2s;outline:none}
.form-input:focus{border-color:var(--accent);box-shadow:0 0 0 2px rgba(24,144,255,.2)}

/* Save bar */
.save-bar{padding:16px 0;display:flex;gap:12px;align-items:center}
.save-status{font-size:13px;color:var(--green)}

@media(max-width:768px){.container{padding:12px}}
</style>
</head>
<body>
<div class="hd">
    <a class="btn-back" href="javascript:history.back()">← Admin</a>
    <h1>⚡ TNETZ Config</h1>
    <div class="hd-right">
        <span style="font-size:12px;color:var(--dim)">Cấu hình SNI, subscribe info, đường dẫn khu vực</span>
    </div>
</div>

<div class="container">
    <!-- Block 1: SNI List -->
    <div class="block">
        <div class="block-hdr">
            <div class="block-title">🔒 Danh sách SNI</div>
            <button class="btn btn-sm" onclick="addSni()">+ Thêm SNI</button>
        </div>
        <table class="tbl"><thead><tr><th>#</th><th>Tên</th><th>Giá trị SNI</th><th style="text-align:right">Thao tác</th></tr></thead>
        <tbody id="sniTbody"></tbody></table>
    </div>

    <!-- Block 2: Subscribe Info Config -->
    <div class="block">
        <div class="block-hdr">
            <div class="block-title">📋 Hiển thị trên link đăng ký (Web mẹ)</div>
        </div>
        <table class="tbl"><thead><tr><th>Thông tin</th><th>Kích Hoạt</th><th>Mô tả</th></tr></thead>
        <tbody id="subInfoTbody"></tbody></table>
    </div>

    <!-- Block 3: Subscribe URLs -->
    <div class="block">
        <div class="block-hdr">
            <div class="block-title">🌐 Đường dẫn đăng ký khu vực</div>
            <button class="btn btn-sm" onclick="addUrl()">+ Thêm khu vực</button>
        </div>
        <table class="tbl"><thead><tr><th>#</th><th>Kích Hoạt</th><th>Tên khu vực</th><th>URL đăng ký</th><th style="text-align:right">Thao tác</th></tr></thead>
        <tbody id="urlTbody"></tbody></table>
    </div>

    <!-- Save bar -->
    <div class="save-bar">
        <button class="btn btn-primary" id="saveBtn" onclick="saveAll()">💾 Lưu tất cả</button>
        <span class="save-status" id="saveStatus"></span>
    </div>
</div>

<script>
var SEC = @json($secure_path ?? 'admin');
var AUTH = '';
try { AUTH = localStorage.getItem('authorization') || ''; } catch(e) {}

var snis = [];
var subInfo = {};
var urls = [];

function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ---- Load Data ----
function loadData() {
    fetch('/api/v1/' + SEC + '/config/fetch?key=tnetz', {
        headers: { 'Authorization': AUTH }
    }).then(function(r) { return r.json(); }).then(function(data) {
        if (!data.data) return;
        var d = data.data.tnetz || data.data;

        // Parse SNI
        var raw = d.sni_list || '';
        snis = [];
        raw.split('\n').forEach(function(line) {
            line = line.trim();
            if (!line) return;
            var parts = line.split('|');
            snis.push({ name: parts[0].trim(), value: (parts[1] || parts[0]).trim() });
        });

        // Parse subscribe info
        var sic = d.subscribe_info_config;
        if (sic) { try { if (typeof sic === 'string') sic = JSON.parse(sic); } catch(e) { sic = {}; } }
        subInfo = sic || {};

        // Parse URLs
        var su = d.subscribe_urls;
        if (su) { try { if (typeof su === 'string') su = JSON.parse(su); } catch(e) { su = []; } }
        urls = (Array.isArray(su) ? su : []).map(function(item) {
            return { name: item.name || '', url: item.url || '', enabled: item.enabled !== false };
        });

        renderSni();
        renderSubInfo();
        renderUrls();
    }).catch(function(e) { console.error('Load failed:', e); });
}

// ---- Render SNI ----
function renderSni() {
    var tb = document.getElementById('sniTbody');
    if (!snis.length) { tb.innerHTML = '<tr><td colspan="4" class="empty">Chưa có SNI nào</td></tr>'; return; }
    var h = '';
    snis.forEach(function(s, i) {
        h += '<tr><td style="width:50px;color:var(--dim)">' + (i+1) + '</td>' +
            '<td style="font-weight:500">' + esc(s.name) + '</td>' +
            '<td><span class="mono">' + esc(s.value) + '</span></td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="act" onclick="editSni(' + i + ')">Sửa</button>' +
            '<span class="divider"></span>' +
            '<button class="act" style="color:var(--red)" onclick="delSni(' + i + ')">Xóa</button></td></tr>';
    });
    tb.innerHTML = h;
}

// ---- Render Sub Info ----
function renderSubInfo() {
    var tb = document.getElementById('subInfoTbody');
    var items = [
        { key: 'show_user_id', label: 'User ID', desc: 'Hiển thị mã ID người dùng' },
        { key: 'show_plan', label: 'Gói dịch vụ', desc: 'Hiển thị tên gói đang sử dụng' },
        { key: 'show_data', label: 'Dung lượng còn', desc: 'Hiển thị data đã dùng / tổng data' },
        { key: 'show_reset', label: 'Ngày làm mới', desc: 'Hiển thị ngày reset data' },
        { key: 'show_expiry', label: 'Ngày hết hạn', desc: 'Hiển thị ngày hết hạn gói' }
    ];
    var h = '';
    items.forEach(function(item) {
        var checked = subInfo[item.key] !== false;
        h += '<tr><td style="font-weight:500">' + esc(item.label) + '</td>' +
            '<td><label class="sw"><input type="checkbox" ' + (checked ? 'checked' : '') +
            ' onchange="subInfo[\'' + item.key + '\']=this.checked"><span class="sw-s"></span></label></td>' +
            '<td style="color:var(--dim);font-size:13px">' + esc(item.desc) + '</td></tr>';
    });
    tb.innerHTML = h;
}

// ---- Render URLs ----
function renderUrls() {
    var tb = document.getElementById('urlTbody');
    if (!urls.length) { tb.innerHTML = '<tr><td colspan="5" class="empty">Chưa có URL nào</td></tr>'; return; }
    var h = '';
    urls.forEach(function(u, i) {
        h += '<tr><td style="width:50px;color:var(--dim)">' + (i+1) + '</td>' +
            '<td><label class="sw"><input type="checkbox" ' + (u.enabled ? 'checked' : '') +
            ' onchange="urls[' + i + '].enabled=this.checked"><span class="sw-s"></span></label></td>' +
            '<td style="font-weight:500">' + esc(u.name) + '</td>' +
            '<td><span class="mono">' + esc(u.url) + '</span></td>' +
            '<td style="text-align:right;white-space:nowrap">' +
            '<button class="act" onclick="editUrl(' + i + ')">Sửa</button>' +
            '<span class="divider"></span>' +
            '<button class="act" style="color:var(--red)" onclick="delUrl(' + i + ')">Xóa</button></td></tr>';
    });
    tb.innerHTML = h;
}

// ---- CRUD ----
function addSni() { showModal('Thêm SNI', {name:'',value:''}, 'sni', function(d) { snis.push(d); renderSni(); }); }
function editSni(i) { showModal('Sửa SNI', snis[i], 'sni', function(d) { snis[i]=d; renderSni(); }); }
function delSni(i) { if (confirm('Xóa SNI "' + snis[i].name + '"?')) { snis.splice(i,1); renderSni(); } }

function addUrl() { showModal('Thêm khu vực', {name:'',url:''}, 'url', function(d) { d.enabled=true; urls.push(d); renderUrls(); }); }
function editUrl(i) { showModal('Sửa khu vực', urls[i], 'url', function(d) { urls[i].name=d.name; urls[i].url=d.url; renderUrls(); }); }
function delUrl(i) { if (confirm('Xóa khu vực "' + urls[i].name + '"?')) { urls.splice(i,1); renderUrls(); } }

// ---- Modal ----
function showModal(title, data, type, onSave) {
    var existing = document.getElementById('modalOv');
    if (existing) existing.remove();

    var ov = document.createElement('div');
    ov.id = 'modalOv';
    ov.className = 'modal-ov';

    var f1Label = type === 'sni' ? 'Tên hiển thị' : 'Tên khu vực';
    var f2Label = type === 'sni' ? 'Giá trị SNI' : 'URL đăng ký';
    var f1Ph = type === 'sni' ? 'VD: Viettel' : 'VD: Việt Nam';
    var f2Ph = type === 'sni' ? 'VD: dl.viettel.vn' : 'https://...';
    var f1Val = esc(data.name || '');
    var f2Val = esc(type === 'sni' ? (data.value || '') : (data.url || ''));

    ov.innerHTML = '<div class="modal">' +
        '<div class="modal-hdr"><span class="modal-title">' + title + '</span><button class="modal-close" onclick="closeModal()">✕</button></div>' +
        '<div class="modal-body">' +
        '<div class="form-group"><label class="form-label">' + f1Label + '</label><input class="form-input" id="mf1" placeholder="' + f1Ph + '" value="' + f1Val + '"></div>' +
        '<div class="form-group"><label class="form-label">' + f2Label + '</label><input class="form-input" id="mf2" placeholder="' + f2Ph + '" value="' + f2Val + '" style="font-family:monospace">' +
        '<div class="form-help">' + (type === 'sni' ? 'Domain SNI sẽ được set cho user' : 'URL subscribe cho khu vực này') + '</div></div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" id="mOk">Xác nhận</button></div>' +
        '</div>';

    document.body.appendChild(ov);
    ov.onclick = function(e) { if (e.target === ov) closeModal(); };

    document.getElementById('mOk').onclick = function() {
        var v1 = document.getElementById('mf1').value.trim();
        var v2 = document.getElementById('mf2').value.trim();
        if (!v1) { alert('Vui lòng nhập tên'); return; }
        if (type === 'sni') onSave({ name: v1, value: v2 || v1 });
        else onSave({ name: v1, url: v2 });
        closeModal();
    };

    setTimeout(function() { document.getElementById('mf1').focus(); }, 100);
}

function closeModal() {
    var ov = document.getElementById('modalOv');
    if (ov) ov.remove();
}

// ---- Save All ----
function saveAll() {
    var btn = document.getElementById('saveBtn');
    var status = document.getElementById('saveStatus');
    btn.textContent = '⏳ Đang lưu...'; btn.disabled = true;

    var sniText = snis.map(function(s) { return s.name + '|' + s.value; }).join('\n');

    fetch('/api/v1/' + SEC + '/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': AUTH },
        body: JSON.stringify({
            sni_list: sniText,
            subscribe_info_config: JSON.stringify(subInfo),
            subscribe_urls: JSON.stringify(urls.map(function(u) { return { name: u.name, url: u.url, enabled: u.enabled }; }))
        })
    }).then(function(r) { return r.json(); }).then(function() {
        btn.textContent = '💾 Lưu tất cả'; btn.disabled = false;
        status.textContent = '✅ Đã lưu thành công!';
        setTimeout(function() { status.textContent = ''; }, 3000);
    }).catch(function(e) {
        btn.textContent = '💾 Lưu tất cả'; btn.disabled = false;
        status.textContent = '❌ Lỗi: ' + e.message;
    });
}

// Init
loadData();
</script>
</body>
</html>
