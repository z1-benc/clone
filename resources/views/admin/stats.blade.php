<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Server Status — TNETZ Monitor</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0f1117;--card:#181a25;--border:#252836;--text:#e2e8f0;--dim:#64748b;--accent:#6366f1;--green:#10b981;--red:#ef4444;--yellow:#f59e0b;--blue:#3b82f6}
body{font:400 13px/1.5 'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

/* Header */
.hd{background:var(--card);border-bottom:1px solid var(--border);padding:16px 24px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:10;backdrop-filter:blur(12px)}
.hd-logo{display:flex;align-items:center;gap:10px}
.hd-logo span{font-size:20px;font-weight:800;background:linear-gradient(135deg,var(--accent),#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hd-stats{display:flex;gap:16px;margin-left:auto;align-items:center}
.hd-stat{text-align:center}
.hd-stat .val{font-size:18px;font-weight:800}
.hd-stat .lbl{font-size:10px;color:var(--dim);text-transform:uppercase;letter-spacing:.05em}
.hd-stat .val.green{color:var(--green)}.hd-stat .val.red{color:var(--red)}
.hd-refresh{font-size:11px;color:var(--dim);display:flex;align-items:center;gap:4px}
.hd-refresh .dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* Summary Cards */
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;padding:20px 24px 12px}
.s-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;text-align:center}
.s-card .s-val{font-size:22px;font-weight:800}
.s-card .s-lbl{font-size:10px;color:var(--dim);text-transform:uppercase;letter-spacing:.05em;margin-top:2px}

/* Server Grid */
.container{padding:8px 24px 24px}
.srv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:12px}

/* Server Card — Nezha style */
.srv{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px;transition:all .25s}
.srv:hover{border-color:var(--accent);transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.08)}
.srv.offline{opacity:.45}
.srv-top{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.srv-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.srv-dot.on{background:var(--green);box-shadow:0 0 6px rgba(16,185,129,.6)}
.srv-dot.off{background:var(--red);box-shadow:0 0 6px rgba(239,68,68,.5)}
.srv-name{font-weight:700;font-size:14px;flex:1}
.srv-tag{font-size:10px;background:var(--border);padding:2px 8px;border-radius:6px;color:var(--dim);font-family:'JetBrains Mono',monospace}
.srv-info{display:flex;gap:12px;font-size:11px;color:var(--dim);margin-bottom:14px}
.srv-info span{display:flex;align-items:center;gap:4px}

/* Progress bars */
.bars{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
.bar-row{display:flex;align-items:center;gap:10px}
.bar-lbl{width:32px;font-size:11px;font-weight:600;color:var(--dim);text-transform:uppercase;flex-shrink:0}
.bar-track{flex:1;height:6px;background:#1e2033;border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px;transition:width .5s ease;min-width:1px}
.bar-fill.cpu{background:linear-gradient(90deg,var(--green),var(--yellow))}
.bar-fill.mem{background:linear-gradient(90deg,var(--blue),var(--accent))}
.bar-fill.warn{background:linear-gradient(90deg,var(--yellow),var(--red))!important}
.bar-val{width:40px;text-align:right;font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace}

/* Net speed */
.srv-net{display:flex;gap:8px}
.net-pill{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:#141620;border-radius:8px;padding:6px 10px;font-size:12px;font-family:'JetBrains Mono',monospace;font-weight:500}
.net-pill .arrow{font-size:14px;font-weight:700}
.net-pill.dl .arrow{color:var(--green)}
.net-pill.ul .arrow{color:var(--accent)}

/* Uptime */
.srv-uptime{display:flex;align-items:center;justify-content:space-between;margin-top:10px;font-size:11px;color:var(--dim)}
.srv-uptime .up-val{font-family:'JetBrains Mono',monospace;font-weight:600;color:var(--text)}

/* Empty */
.empty{text-align:center;padding:80px;color:var(--dim)}
.empty-ico{font-size:48px;margin-bottom:12px;opacity:.3}

/* Back */
.back{color:var(--accent);font-size:12px;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px}
.back:hover{color:#818cf8}

@media(max-width:768px){.srv-grid{grid-template-columns:1fr}.container,.summary{padding-left:14px;padding-right:14px}.hd{padding:12px 14px;flex-wrap:wrap}}
</style>
</head>
<body>
<div class="hd">
    <div class="hd-logo">
        <a class="back" href="javascript:history.back()">←</a>
        <span>⚡ TNETZ Monitor</span>
    </div>
    <div class="hd-stats">
        <div class="hd-stat"><div class="val green" id="onCount">-</div><div class="lbl">Online</div></div>
        <div class="hd-stat"><div class="val red" id="offCount">-</div><div class="lbl">Offline</div></div>
    </div>
    <div class="hd-refresh"><div class="dot"></div><span id="timer">10s</span></div>
</div>

<div class="summary" id="summary">
    <div class="s-card"><div class="s-val" id="avgCpu">-</div><div class="s-lbl">Avg CPU</div></div>
    <div class="s-card"><div class="s-val" id="avgMem">-</div><div class="s-lbl">Avg RAM</div></div>
    <div class="s-card"><div class="s-val" id="totalDown">-</div><div class="s-lbl">↓ Total</div></div>
    <div class="s-card"><div class="s-val" id="totalUp">-</div><div class="s-lbl">↑ Total</div></div>
</div>

<div class="container">
    <div class="srv-grid" id="grid">
        <div class="empty"><div class="empty-ico">📡</div><div>Đang tải dữ liệu...</div></div>
    </div>
</div>

<script>
var SEC_PATH = @json($secure_path ?? 'admin');

function fB(b){if(!b||b<=0)return '0 B/s';var u=['B/s','KB/s','MB/s','GB/s'];var i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(i>1?2:0)+' '+u[i];}
function fMem(b){if(!b||b<=0)return '0';var u=['B','KB','MB','GB','TB'];var i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(1)+u[i];}
function fUp(s){if(!s)return '0s';var d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);if(d>0)return d+'d '+h+'h';if(h>0)return h+'h '+m+'m';return m+'m';}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function barClass(v){return v>80?'warn':'';}

function render(data){
    var grid=document.getElementById('grid');
    if(!data||!data.length){grid.innerHTML='<div class="empty"><div class="empty-ico">📡</div><div>Chưa có node nào báo cáo stats</div></div>';return;}

    // Sort: online first
    data.sort(function(a,b){return(b.online?1:0)-(a.online?1:0);});

    var onN=0,offN=0,cpuS=0,memS=0,dS=0,uS=0,cnt=0;
    var html='';
    data.forEach(function(n){
        var s=n.stats||{};
        var on=n.online;
        if(on){onN++;cpuS+=s.cpu_percent||0;memS+=s.mem_percent||0;dS+=s.net_in_speed||0;uS+=s.net_out_speed||0;cnt++;}
        else{offN++;}

        var cpu=s.cpu_percent||0,mem=s.mem_percent||0;
        html+='<div class="srv'+(on?'':' offline')+'">';
        html+='<div class="srv-top"><span class="srv-dot '+(on?'on':'off')+'"></span>';
        html+='<span class="srv-name">'+esc(n.name)+'</span>';
        html+='<span class="srv-tag">#'+n.id+'</span></div>';

        if(on&&s.updated_at){
            // Info row
            html+='<div class="srv-info">';
            if(s.hostname)html+='<span>🖥️ '+esc(s.hostname)+'</span>';
            if(s.cpu_cores)html+='<span>⚡ '+s.cpu_cores+' cores</span>';
            html+='<span>⏱️ '+fUp(s.uptime)+'</span>';
            html+='</div>';

            // Bars
            html+='<div class="bars">';
            html+='<div class="bar-row"><span class="bar-lbl">CPU</span><div class="bar-track"><div class="bar-fill cpu '+barClass(cpu)+'" style="width:'+Math.max(cpu,1)+'%"></div></div><span class="bar-val">'+cpu.toFixed(1)+'%</span></div>';
            html+='<div class="bar-row"><span class="bar-lbl">RAM</span><div class="bar-track"><div class="bar-fill mem '+barClass(mem)+'" style="width:'+Math.max(mem,1)+'%"></div></div><span class="bar-val">'+mem.toFixed(1)+'%</span></div>';
            html+='</div>';

            // Memory detail
            if(s.mem_total)html+='<div style="font-size:10px;color:var(--dim);margin:-6px 0 10px 42px">'+fMem(s.mem_used)+' / '+fMem(s.mem_total)+'</div>';

            // Network
            html+='<div class="srv-net">';
            html+='<div class="net-pill dl"><span class="arrow">↓</span>'+fB(s.net_in_speed)+'</div>';
            html+='<div class="net-pill ul"><span class="arrow">↑</span>'+fB(s.net_out_speed)+'</div>';
            html+='</div>';
        } else {
            html+='<div style="text-align:center;padding:24px;color:var(--dim);font-size:12px">⚠️ Offline — không có dữ liệu</div>';
        }
        html+='</div>';
    });
    grid.innerHTML=html;

    // Summary
    document.getElementById('onCount').textContent=onN;
    document.getElementById('offCount').textContent=offN;
    document.getElementById('avgCpu').textContent=cnt?((cpuS/cnt).toFixed(1)+'%'):'-%';
    document.getElementById('avgMem').textContent=cnt?((memS/cnt).toFixed(1)+'%'):'-%';
    document.getElementById('totalDown').textContent=fB(dS);
    document.getElementById('totalUp').textContent=fB(uS);
}

function fetchStats(){
    var auth='';try{auth=localStorage.getItem('auth_data')||'';}catch(e){}
    fetch('/api/v1/'+SEC_PATH+'/server/stats/fetch',{
        headers:{'authorization':auth,'Content-Type':'application/json'}
    }).then(function(r){return r.json();}).then(function(j){
        if(j&&j.data)render(j.data);
    }).catch(function(e){
        document.getElementById('grid').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div>API error: '+e.message+'</div></div>';
    });
}

var countdown=10;
setInterval(function(){
    countdown--;
    document.getElementById('timer').textContent=countdown+'s';
    if(countdown<=0){countdown=10;fetchStats();}
},1000);
fetchStats();
</script>
</body>
</html>
