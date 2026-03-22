<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Node Monitor — V2Board</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#f0f2f5;--card:#fff;--border:#e8e8e8;--text:rgba(0,0,0,.85);--dim:rgba(0,0,0,.45);--accent:#1890ff;--green:#52c41a;--red:#ff4d4f;--yellow:#faad14;--blue:#1890ff}
body{font:400 13px/1.6 'Inter',-apple-system,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

/* Header — Ant Design style */
.hd{background:var(--card);border-bottom:1px solid var(--border);padding:12px 24px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:10}
.hd h1{font-size:16px;font-weight:700;margin:0;display:flex;align-items:center;gap:8px}
.hd-stats{display:flex;gap:20px;margin-left:auto;align-items:center}
.hd-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:600;border:1px solid}
.hd-tag.on{color:var(--green);background:#f6ffed;border-color:#b7eb8f}
.hd-tag.off{color:var(--red);background:#fff2f0;border-color:#ffa39e}
.hd-refresh{font-size:12px;color:var(--dim);display:flex;align-items:center;gap:6px}
.hd-refresh .dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.btn-back{color:var(--accent);text-decoration:none;font-size:13px;font-weight:500;display:flex;align-items:center;gap:4px;border:1px solid var(--border);padding:4px 12px;border-radius:4px;background:#fff}
.btn-back:hover{color:#40a9ff;border-color:#40a9ff}

/* Summary */
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;padding:20px 24px 8px}
.s-card{background:var(--card);border-radius:4px;padding:16px 20px;box-shadow:0 1px 2px rgba(0,0,0,.03);border:1px solid var(--border)}
.s-card .s-val{font-size:24px;font-weight:700;color:var(--text);margin-bottom:2px}
.s-card .s-lbl{font-size:12px;color:var(--dim)}

/* Grid */
.container{padding:8px 24px 24px}
.srv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:16px}

/* Server Card — Ant Design Card style */
.srv{background:var(--card);border:1px solid var(--border);border-radius:4px;transition:all .2s;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.srv:hover{box-shadow:0 4px 12px rgba(0,0,0,.08);border-color:#d9d9d9}
.srv.offline{opacity:.5}
.srv-head{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px}
.srv-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.srv-dot.on{background:var(--green)}
.srv-dot.off{background:var(--red)}
.srv-name{font-weight:600;font-size:14px;flex:1;color:var(--text)}
.srv-tag{font-size:10px;background:#fafafa;padding:1px 6px;border:1px solid var(--border);border-radius:2px;color:var(--dim);font-family:'JetBrains Mono',monospace}
.srv-body{padding:14px 16px}
.srv-info{display:flex;gap:14px;font-size:11px;color:var(--dim);margin-bottom:12px;flex-wrap:wrap}
.srv-info span{display:flex;align-items:center;gap:3px}

/* Progress bars — Ant Design Progress style */
.bars{display:flex;flex-direction:column;gap:10px;margin-bottom:12px}
.bar-row{display:flex;align-items:center;gap:8px}
.bar-lbl{width:34px;font-size:11px;font-weight:600;color:var(--dim);flex-shrink:0}
.bar-track{flex:1;height:8px;background:#f5f5f5;border-radius:100px;overflow:hidden}
.bar-fill{height:100%;border-radius:100px;transition:width .6s ease}
.bar-fill.ok{background:var(--green)}
.bar-fill.warn{background:var(--yellow)}
.bar-fill.danger{background:var(--red)}
.bar-val{width:45px;text-align:right;font-size:12px;font-weight:600;font-family:'JetBrains Mono',monospace;color:var(--text)}
.bar-detail{margin:-4px 0 6px 42px;font-size:11px;color:var(--dim)}

/* Net speed — pills */
.srv-net{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.net-pill{display:flex;align-items:center;justify-content:center;gap:6px;background:#fafafa;border:1px solid var(--border);border-radius:4px;padding:6px 10px;font-size:12px;font-family:'JetBrains Mono',monospace;font-weight:500}
.net-pill .arrow{font-weight:700}
.net-pill.dl .arrow{color:var(--green)}
.net-pill.ul .arrow{color:var(--blue)}

/* Empty */
.empty{text-align:center;padding:60px;color:var(--dim)}
.empty-ico{font-size:40px;margin-bottom:12px;opacity:.4}

@media(max-width:768px){.srv-grid{grid-template-columns:1fr}.container,.summary{padding-left:12px;padding-right:12px}.hd{padding:10px 12px;flex-wrap:wrap}}
</style>
</head>
<body>
<div class="hd">
    <a class="btn-back" href="javascript:history.back()">← Admin</a>
    <h1>📡 Node Monitor</h1>
    <div class="hd-stats">
        <span class="hd-tag on" id="onTag">🟢 0 Online</span>
        <span class="hd-tag off" id="offTag">🔴 0 Offline</span>
    </div>
    <div class="hd-refresh"><div class="dot"></div><span id="timer">10s</span></div>
</div>

<div class="summary">
    <div class="s-card"><div class="s-val" id="avgCpu">-</div><div class="s-lbl">CPU Trung bình</div></div>
    <div class="s-card"><div class="s-val" id="avgMem">-</div><div class="s-lbl">RAM Trung bình</div></div>
    <div class="s-card"><div class="s-val" id="totalDown">-</div><div class="s-lbl">↓ Tổng Download</div></div>
    <div class="s-card"><div class="s-val" id="totalUp">-</div><div class="s-lbl">↑ Tổng Upload</div></div>
</div>

<div class="container">
    <div class="srv-grid" id="grid">
        <div class="empty"><div class="empty-ico">📡</div><div>Đang tải dữ liệu...</div></div>
    </div>
</div>

<script>
var SEC_PATH = @json($secure_path ?? 'admin');

function fB(b){if(!b||b<=0)return '0 B/s';var u=['B/s','KB/s','MB/s','GB/s'];var i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(i>1?2:0)+' '+u[i];}
function fMem(b){if(!b||b<=0)return '0';var u=['B','KB','MB','GB','TB'];var i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(1)+' '+u[i];}
function fUp(s){if(!s)return '0s';var d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);if(d>0)return d+' ngày '+h+'h';if(h>0)return h+'h '+m+'m';return m+'m';}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function barCls(v){return v>80?'danger':v>50?'warn':'ok';}

function render(data){
    var grid=document.getElementById('grid');
    if(!data||!data.length){grid.innerHTML='<div class="empty"><div class="empty-ico">📡</div><div>Chưa có node nào báo cáo.<br>Vui lòng build và deploy v2node mới.</div></div>';return;}
    data.sort(function(a,b){return(b.online?1:0)-(a.online?1:0);});
    var onN=0,offN=0,cpuS=0,memS=0,dS=0,uS=0,cnt=0;
    var html='';
    data.forEach(function(n){
        var s=n.stats||{};
        var on=n.online;
        if(on){onN++;cpuS+=s.cpu_percent||0;memS+=s.mem_percent||0;dS+=s.net_in_speed||0;uS+=s.net_out_speed||0;cnt++;}else{offN++;}
        var cpu=s.cpu_percent||0,mem=s.mem_percent||0;
        html+='<div class="srv'+(on?'':' offline')+'">';
        html+='<div class="srv-head"><span class="srv-dot '+(on?'on':'off')+'"></span>';
        html+='<span class="srv-name">'+esc(n.name)+'</span>';
        html+='<span class="srv-tag">#'+n.id+'</span></div>';
        html+='<div class="srv-body">';
        if(on&&s.updated_at){
            html+='<div class="srv-info">';
            if(s.hostname)html+='<span>🖥️ '+esc(s.hostname)+'</span>';
            if(s.cpu_cores)html+='<span>⚡ '+s.cpu_cores+' cores</span>';
            html+='<span>⏱️ '+fUp(s.uptime)+'</span>';
            html+='</div>';
            html+='<div class="bars">';
            html+='<div class="bar-row"><span class="bar-lbl">CPU</span><div class="bar-track"><div class="bar-fill '+barCls(cpu)+'" style="width:'+Math.max(cpu,1)+'%"></div></div><span class="bar-val">'+cpu.toFixed(1)+'%</span></div>';
            html+='<div class="bar-row"><span class="bar-lbl">RAM</span><div class="bar-track"><div class="bar-fill '+barCls(mem)+'" style="width:'+Math.max(mem,1)+'%"></div></div><span class="bar-val">'+mem.toFixed(1)+'%</span></div>';
            if(s.mem_total)html+='<div class="bar-detail">'+fMem(s.mem_used)+' / '+fMem(s.mem_total)+'</div>';
            html+='</div>';
            html+='<div class="srv-net">';
            html+='<div class="net-pill dl"><span class="arrow">↓</span>'+fB(s.net_in_speed)+'</div>';
            html+='<div class="net-pill ul"><span class="arrow">↑</span>'+fB(s.net_out_speed)+'</div>';
            html+='</div>';
        }else{
            html+='<div style="text-align:center;padding:16px;color:var(--dim);font-size:12px">⚠️ Offline — không có dữ liệu</div>';
        }
        html+='</div></div>';
    });
    grid.innerHTML=html;
    document.getElementById('onTag').innerHTML='🟢 '+onN+' Online';
    document.getElementById('offTag').innerHTML='🔴 '+offN+' Offline';
    document.getElementById('avgCpu').textContent=cnt?((cpuS/cnt).toFixed(1)+'%'):'-%';
    document.getElementById('avgMem').textContent=cnt?((memS/cnt).toFixed(1)+'%'):'-%';
    document.getElementById('totalDown').textContent=fB(dS);
    document.getElementById('totalUp').textContent=fB(uS);
}

function fetchStats(){
    var auth='';try{auth=localStorage.getItem('authorization')||'';}catch(e){}
    fetch('/api/v1/'+SEC_PATH+'/server/stats/fetch',{
        headers:{'authorization':auth,'Content-Type':'application/json'}
    }).then(function(r){return r.json();}).then(function(j){
        if(j&&j.data)render(j.data);
    }).catch(function(e){
        document.getElementById('grid').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div>Lỗi kết nối API</div></div>';
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
