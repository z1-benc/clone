<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Node Monitoring — V2Board Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font:400 14px/1.5 'Inter',system-ui,sans-serif;background:#0a0b14;color:#e2e8f0;min-height:100vh}
.header{padding:20px 28px;border-bottom:1px solid #1e2344;display:flex;align-items:center;gap:14px;background:rgba(15,18,33,.9);backdrop-filter:blur(12px);position:sticky;top:0;z-index:10}
.header h1{font-size:18px;font-weight:800;letter-spacing:-.03em;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.header .badge{font-size:11px;background:#10b981;color:#fff;padding:2px 8px;border-radius:12px;font-weight:600}
.header .refresh-info{margin-left:auto;font-size:12px;color:#64748b}
.container{padding:28px;max-width:1400px;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}
.node-card{background:#12141e;border:1px solid #1e2344;border-radius:16px;padding:24px;transition:all .2s}
.node-card:hover{border-color:#6366f1;box-shadow:0 4px 20px rgba(99,102,241,.1)}
.node-card.offline{opacity:.5}
.node-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.node-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.node-dot.on{background:#10b981;box-shadow:0 0 8px rgba(16,185,129,.5)}
.node-dot.off{background:#ef4444;box-shadow:0 0 8px rgba(239,68,68,.4)}
.node-name{font-size:15px;font-weight:700;flex:1}
.node-id{font-size:11px;color:#64748b;background:#1e2344;padding:2px 8px;border-radius:6px}
.gauges{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.gauge{text-align:center}
.gauge-circle{width:80px;height:80px;border-radius:50%;position:relative;margin:0 auto 8px}
.gauge-circle svg{width:80px;height:80px;transform:rotate(-90deg)}
.gauge-circle circle{fill:none;stroke-width:6;stroke-linecap:round}
.gauge-circle .bg{stroke:#1e2344}
.gauge-circle .fill{transition:stroke-dashoffset .5s ease}
.gauge-val{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;letter-spacing:-.03em}
.gauge-lbl{font-size:11px;color:#94a3b8;font-weight:500}
.net-row{display:flex;gap:12px;margin-top:14px}
.net-item{flex:1;background:#181b28;border-radius:10px;padding:12px 14px;text-align:center}
.net-item .net-val{font-size:16px;font-weight:700;margin-bottom:2px}
.net-item .net-lbl{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.04em}
.net-in .net-val{color:#10b981}
.net-out .net-val{color:#6366f1}
.empty{text-align:center;padding:80px 20px;color:#64748b}
.empty-ico{font-size:48px;margin-bottom:16px;opacity:.3}
.empty-txt{font-size:16px;font-weight:500}
.back-link{color:#6366f1;font-size:13px;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px}
.back-link:hover{color:#818cf8}
@media(max-width:768px){.grid{grid-template-columns:1fr}.container{padding:16px}
.gauges{grid-template-columns:1fr 1fr}.header{padding:14px 18px}}
</style>
</head>
<body>
<div class="header">
    <a class="back-link" href="javascript:history.back()">← Quay lại</a>
    <h1>⚡ Node Monitoring</h1>
    <span class="badge" id="count">0 nodes</span>
    <span class="refresh-info">Auto-refresh: <span id="timer">10</span>s</span>
</div>
<div class="container">
    <div class="grid" id="grid">
        <div class="empty"><div class="empty-ico">📡</div><div class="empty-txt">Đang tải...</div></div>
    </div>
</div>
<script>
var ADMIN_PATH = window.location.pathname.split('/').filter(Boolean)[0] || '';
var API_BASE = '/api/v1/' + ADMIN_PATH;

function fB(b){
    if(!b||b<=0)return '0 B/s';
    var u=['B/s','KB/s','MB/s','GB/s'];
    var i=Math.floor(Math.log(b)/Math.log(1024));
    return(b/Math.pow(1024,i)).toFixed(i>1?2:0)+' '+u[i];
}
function fMem(b){
    if(!b||b<=0)return '0';
    var u=['B','KB','MB','GB','TB'];
    var i=Math.floor(Math.log(b)/Math.log(1024));
    return(b/Math.pow(1024,i)).toFixed(1)+' '+u[i];
}

function makeGauge(pct, color){
    var r=34, c=2*Math.PI*r, offset=c-(pct/100)*c;
    return '<div class="gauge-circle"><svg viewBox="0 0 80 80"><circle class="bg" cx="40" cy="40" r="'+r+'"/><circle class="fill" cx="40" cy="40" r="'+r+'" stroke="'+color+'" stroke-dasharray="'+c+'" stroke-dashoffset="'+offset+'"/></svg><div class="gauge-val">'+Math.round(pct)+'%</div></div>';
}

function renderNodes(data){
    var grid=document.getElementById('grid');
    var count=document.getElementById('count');
    if(!data||!data.length){
        grid.innerHTML='<div class="empty"><div class="empty-ico">📡</div><div class="empty-txt">Chưa có node nào báo cáo</div></div>';
        count.textContent='0 nodes';
        return;
    }
    var onlineCount = data.filter(function(n){return n.online;}).length;
    count.textContent = onlineCount + '/' + data.length + ' online';
    var html='';
    data.forEach(function(n){
        var s = n.stats || {};
        var cpu = s.cpu_percent || 0;
        var mem = s.mem_percent || 0;
        var cpuColor = cpu > 80 ? '#ef4444' : cpu > 50 ? '#f59e0b' : '#10b981';
        var memColor = mem > 80 ? '#ef4444' : mem > 50 ? '#f59e0b' : '#6366f1';
        html += '<div class="node-card'+(n.online?'':' offline')+'">';
        html += '<div class="node-top"><span class="node-dot '+(n.online?'on':'off')+'"></span>';
        html += '<span class="node-name">'+esc(n.name)+'</span>';
        html += '<span class="node-id">#'+n.id+'</span></div>';
        if(n.online && s.updated_at){
            html += '<div class="gauges">';
            html += '<div class="gauge">'+makeGauge(cpu, cpuColor)+'<div class="gauge-lbl">CPU</div></div>';
            html += '<div class="gauge">'+makeGauge(mem, memColor)+'<div class="gauge-lbl">RAM '+fMem(s.mem_used)+'/'+fMem(s.mem_total)+'</div></div>';
            html += '</div>';
            html += '<div class="net-row">';
            html += '<div class="net-item net-in"><div class="net-val">↓ '+fB(s.net_in_speed)+'</div><div class="net-lbl">Download</div></div>';
            html += '<div class="net-item net-out"><div class="net-val">↑ '+fB(s.net_out_speed)+'</div><div class="net-lbl">Upload</div></div>';
            html += '</div>';
        } else {
            html += '<div style="text-align:center;padding:20px;color:#475569;font-size:13px">Offline — không có dữ liệu</div>';
        }
        html += '</div>';
    });
    grid.innerHTML = html;
}

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}

function fetchStats(){
    // Try to get auth from cookie or localStorage
    var authData = '';
    try { authData = localStorage.getItem('auth_data') || ''; } catch(e){}

    // Find admin path from meta or try common patterns
    var paths = [
        '/api/v1/' + ADMIN_PATH + '/server/stats/fetch',
        '/api/v1/admin/server/stats/fetch',
    ];

    // Try first path
    tryFetch(paths, 0);
}

function tryFetch(paths, idx){
    if(idx >= paths.length){
        document.getElementById('grid').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">Không thể kết nối API</div></div>';
        return;
    }
    var authData = '';
    try { authData = localStorage.getItem('auth_data') || ''; } catch(e){}

    fetch(paths[idx], {
        headers: {'authorization': authData, 'Content-Type': 'application/json'}
    }).then(function(r){
        if(!r.ok && idx < paths.length-1){tryFetch(paths, idx+1);return;}
        return r.json();
    }).then(function(j){
        if(j && j.data) renderNodes(j.data);
    }).catch(function(){
        if(idx < paths.length-1) tryFetch(paths, idx+1);
    });
}

// Auto-refresh
var countdown = 10;
setInterval(function(){
    countdown--;
    document.getElementById('timer').textContent = countdown;
    if(countdown <= 0){
        countdown = 10;
        fetchStats();
    }
}, 1000);

fetchStats();
</script>
</body>
</html>
