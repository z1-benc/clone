/**
 * TNETZ PRO v3 — Full-Feature Premium SPA
 * Server List • Traffic Logs • Extra Purchase • Notices
 */
(function(){
'use strict';
var $=document.getElementById.bind(document);
var C=document.createElement.bind(document);
var API='/api/v1';
var SITE=window.v2board||{};
var user=null,subData=null,plans=null;

/* ══════════ AUTH ══════════ */
function tk(){return localStorage.getItem('auth_data')||'';}
function logged(){return !!tk();}
function logout(){localStorage.removeItem('auth_data');user=null;subData=null;plans=null;go('login');}

/* ══════════ API ══════════ */
function api(p,o){o=o||{};var h={'authorization':tk()};if(o.body)h['Content-Type']='application/json';return fetch(API+p,{method:o.method||'GET',headers:h,body:o.body?JSON.stringify(o.body):undefined}).then(function(r){return r.json();}).then(function(j){if(j.message&&!j.data)throw new Error(j.message);return j;});}

/* ══════════ TOAST ══════════ */
var toastEl,toastTm;
function toast(m,t){if(!toastEl){toastEl=C('div');toastEl.className='toast';document.body.appendChild(toastEl);}toastEl.textContent=m;toastEl.className='toast toast-'+(t||'ok')+' show';clearTimeout(toastTm);toastTm=setTimeout(function(){toastEl.classList.remove('show');},3000);}

/* ══════════ HELPERS ══════════ */
function e(s){if(!s)return '';var d=C('div');d.textContent=s;return d.innerHTML;}
function fB(b){if(!b||b<=0)return '0 B';var u=['B','KB','MB','GB','TB'];var i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(i>1?2:0)+' '+u[i];}
function fD(ts){if(!ts)return '—';var d=new Date(ts*1000);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());}
function fDT(ts){if(!ts)return '—';return fD(ts)+' '+p2(new Date(ts*1000).getHours())+':'+p2(new Date(ts*1000).getMinutes());}
function p2(n){return n<10?'0'+n:''+n;}
function fM(v){if(v===null||v===undefined)return '—';return new Intl.NumberFormat('vi-VN').format(v/100)+'đ';}
function clip(t){if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast('✅ Đã sao chép');});else{var a=C('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px';document.body.appendChild(a);a.select();document.execCommand('copy');document.body.removeChild(a);toast('✅ Đã sao chép');}}
function daysLeft(ts){if(!ts)return 0;return Math.max(0,Math.ceil((ts*1000-Date.now())/86400000));}
var FL={'china':'🇨🇳','trung':'🇨🇳','nga':'🇷🇺','việt':'🇻🇳','nhật':'🇯🇵','hàn':'🇰🇷','mỹ':'🇺🇸','us':'🇺🇸','singapore':'🇸🇬','hong kong':'🇭🇰','taiwan':'🇹🇼','đài':'🇹🇼','europe':'🇪🇺'};
function flag(n){var l=(n||'').toLowerCase();for(var k in FL)if(l.indexOf(k)!==-1)return FL[k];return '🌍';}
function L(n,s){s=s||18;return '<i data-lucide="'+n+'" style="width:'+s+'px;height:'+s+'px"></i>';}
function LI(){try{if(window.lucide)lucide.createIcons();}catch(x){}}

/* ══════════ THEME ══════════ */
var theme=localStorage.getItem('tz-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
document.documentElement.setAttribute('data-theme',theme);
function toggleTheme(){theme=theme==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',theme);localStorage.setItem('tz-theme',theme);var b=$('themeBtn');if(b)b.textContent=theme==='dark'?'☀️':'🌙';}

/* ══════════ ROUTER ══════════ */
var routes={login:pgLogin,register:pgRegister,dash:pgDash,subscribe:pgSub,plan:pgPlan,order:pgOrder,invite:pgInvite,ticket:pgTicket,knowledge:pgKnowledge,server:pgServer,notice:pgNotice,profile:pgProfile};
var cur='';
function go(p){window.location.hash='#/'+p;}
function route(){var h=(window.location.hash||'#/').replace('#/','').split('?')[0]||'dash';if(!logged()&&h!=='login'&&h!=='register'){go('login');return;}if(logged()&&(h==='login'||h==='register')){go('dash');return;}cur=h;var fn=routes[h];if(fn)fn();else pgDash();}
window.addEventListener('hashchange',route);

/* ══════════ SHELL ══════════ */
function shell(title,content){
  var app=$('app'),em=user?user.email:'';
  app.innerHTML='<div class="shell"><nav class="nav" id="nav"><div class="nav-brand"><div class="dot">'+L('zap',16)+'</div><h1>'+e(SITE.title||'TNETZ')+'</h1></div>'+
  (em?'<div class="nav-user"><div class="nav-user-name">'+e(em.split('@')[0])+'</div><div class="nav-user-email">'+e(em)+'</div></div>':'')+
  '<div class="nav-links">'+
    '<div class="nav-section">Tổng quan</div>'+
    nl('dash',L('layout-dashboard'),'Dashboard')+nl('notice',L('bell'),'Thông báo')+
    '<div class="nav-section">Dịch vụ</div>'+
    nl('subscribe',L('link'),'Đăng ký')+nl('server',L('server'),'Máy chủ')+nl('plan',L('gem'),'Gói dịch vụ')+nl('order',L('file-text'),'Đơn hàng')+
    '<div class="nav-section">Khác</div>'+
    nl('invite',L('gift'),'Giới thiệu')+nl('ticket',L('message-circle'),'Hỗ trợ')+nl('knowledge',L('book-open'),'Hướng dẫn')+nl('profile',L('user'),'Tài khoản')+
  '</div><div class="nav-footer"><button class="nav-link" id="logoutBtn"><span class="ico">'+L('log-out')+'</span>Đăng xuất</button></div></nav>'+
  '<div class="main"><div class="topbar"><button class="menu-btn" id="menuBtn">☰</button><div class="topbar-title">'+e(title)+'</div>'+
  '<div class="topbar-user"><span class="topbar-email">'+e(em)+'</span><div class="topbar-avatar">'+((em)?em[0].toUpperCase():'U')+'</div></div></div>'+
  '<div class="page fade-in" id="pc">'+content+'</div></div></div><button id="themeBtn">'+(theme==='dark'?'☀️':'🌙')+'</button>';
  $('themeBtn').onclick=toggleTheme;$('menuBtn').onclick=function(){$('nav').classList.toggle('open');};$('logoutBtn').onclick=logout;
  app.querySelectorAll('.nav-link[data-p]').forEach(function(l){l.onclick=function(){$('nav').classList.remove('open');go(this.dataset.p);};});
  LI();
}
function nl(p,i,t){return '<button class="nav-link'+(cur===p?' on':'')+'" data-p="'+p+'"><span class="ico">'+i+'</span>'+t+'</button>';}
function ld(){return '<div class="page-loading"><span class="spin"></span></div>';}

/* ══════════ LOGIN ══════════ */
function pgLogin(){
  $('app').innerHTML='<div class="login-wrap fade-in"><div class="login-box"><div class="login-header"><div class="login-logo">'+L('zap',24)+'</div><h1>'+e(SITE.title||'TNETZ')+'</h1><p>'+e(SITE.description||'Đăng nhập để tiếp tục')+'</p></div>'+
  '<div class="login-card"><div class="inp-group"><label class="inp-lbl">Email</label><input class="inp" id="le" type="email" placeholder="email@example.com" autofocus></div>'+
  '<div class="inp-group"><label class="inp-lbl">Mật khẩu</label><input class="inp" id="lp" type="password" placeholder="••••••••"></div>'+
  '<button class="btn btn-grad btn-block" id="lb">Đăng nhập</button></div>'+
  '<div class="login-switch">Chưa có tài khoản? <a href="#/register">Đăng ký ngay</a></div></div></div><button id="themeBtn">'+(theme==='dark'?'☀️':'🌙')+'</button>';
  $('themeBtn').onclick=toggleTheme;$('lb').onclick=doLogin;$('lp').onkeydown=function(ev){if(ev.key==='Enter')doLogin();};LI();
}
function doLogin(){var em=$('le').value.trim(),pw=$('lp').value;if(!em||!pw){toast('Nhập đầy đủ','err');return;}$('lb').innerHTML='<span class="spin"></span>';fetch(API+'/passport/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw})}).then(function(r){return r.json();}).then(function(j){if(j.data&&j.data.auth_data){localStorage.setItem('auth_data',j.data.auth_data);user=null;subData=null;go('dash');}else{toast(j.message||'Thất bại','err');$('lb').textContent='Đăng nhập';}}).catch(function(x){toast(x.message,'err');$('lb').textContent='Đăng nhập';});}

/* ══════════ REGISTER ══════════ */
function pgRegister(){
  $('app').innerHTML='<div class="login-wrap fade-in"><div class="login-box"><div class="login-header"><div class="login-logo">'+L('zap',24)+'</div><h1>Tạo tài khoản</h1><p>Đăng ký miễn phí</p></div>'+
  '<div class="login-card"><div class="inp-group"><label class="inp-lbl">Email</label><input class="inp" id="re" type="email" placeholder="email@example.com"></div>'+
  '<div class="inp-group"><label class="inp-lbl">Mật khẩu</label><input class="inp" id="rp" type="password" placeholder="Ít nhất 8 ký tự"></div>'+
  '<div class="inp-group"><label class="inp-lbl">Mã mời</label><input class="inp" id="ri" placeholder="Tuỳ chọn"></div>'+
  '<button class="btn btn-grad btn-block" id="rb">Đăng ký</button></div>'+
  '<div class="login-switch">Đã có tài khoản? <a href="#/login">Đăng nhập</a></div></div></div><button id="themeBtn">'+(theme==='dark'?'☀️':'🌙')+'</button>';
  $('themeBtn').onclick=toggleTheme;
  $('rb').onclick=function(){var em=$('re').value.trim(),pw=$('rp').value,inv=$('ri').value.trim();if(!em||!pw){toast('Nhập đầy đủ','err');return;}$('rb').innerHTML='<span class="spin"></span>';var body={email:em,password:pw};if(inv)body.invite_code=inv;fetch(API+'/passport/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json();}).then(function(j){if(j.data&&j.data.auth_data){localStorage.setItem('auth_data',j.data.auth_data);go('dash');}else{toast(j.message||'Thất bại','err');$('rb').textContent='Đăng ký';}}).catch(function(x){toast(x.message,'err');$('rb').textContent='Đăng ký';});};
}

/* ══════════ DASHBOARD ══════════ */
function pgDash(){
  shell('Dashboard',ld());
  loadUser(function(){
    var p=user.plan,used=(user.u||0)+(user.d||0),total=user.transfer_enable||1,pct=Math.min(100,Math.round(used/total*100)),dl=daysLeft(user.expired_at);
    var hr=new Date().getHours(),greet=hr<12?'Chào buổi sáng':hr<18?'Chào buổi chiều':'Chào buổi tối';
    var em=user.email||'';
    $('pc').innerHTML='<div id="noticeBanner"></div>'+
    '<div class="hero"><div class="hero-greeting">'+greet+' 👋</div><div class="hero-name">'+e(em.split('@')[0])+'</div>'+
    '<div class="hero-plan">'+L('gem',14)+' '+(p?e(p.name):'Chưa có gói')+'</div>'+
    '<div class="hero-stats"><div><div class="hero-stat-val">'+dl+'</div><div class="hero-stat-lbl">Ngày còn lại</div></div>'+
    '<div><div class="hero-stat-val">'+fB(used)+'</div><div class="hero-stat-lbl">Đã sử dụng</div></div>'+
    '<div><div class="hero-stat-val">'+(user.alive_ip||0)+' / '+(user.device_limit||'∞')+'</div><div class="hero-stat-lbl">Thiết bị</div></div></div></div>'+
    '<div class="card" style="margin-bottom:20px"><div class="card-b">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:13px;font-weight:700">Dung lượng sử dụng</span><span style="font-size:14px;font-weight:800;color:var(--pr)">'+pct+'%</span></div>'+
      '<div class="progress-wrap"><div class="progress-bar"><div class="progress-fill" style="width:'+pct+'%"></div></div>'+
      '<div class="progress-info"><span>'+L('arrow-up',14)+' '+fB(user.u||0)+'</span><span>'+L('arrow-down',14)+' '+fB(user.d||0)+'</span></div></div>'+
    '</div></div>'+
    '<div class="g g3" style="margin-bottom:14px">'+
      qcard('subscribe',L('link',20),'c1','Đăng ký & Khu vực','Lấy link, đồng bộ app')+
      qcard('plan',L('gem',20),'c2','Mua gói / Gia hạn','Xem gói dịch vụ có sẵn')+
      qcard('server',L('server',20),'c4','Danh sách máy chủ','Xem trạng thái server')+
    '</div>'+
    '<div class="g g3">'+
      qcard('invite',L('gift',20),'c3','Giới thiệu bạn bè','Kiếm hoa hồng')+
      qcard('ticket',L('message-circle',20),'c1','Hỗ trợ kỹ thuật','Gửi ticket')+
      qcard('profile',L('user',20),'c4','Tài khoản','Đổi mật khẩu, cài đặt')+
    '</div>';
    $('pc').classList.add('fade-in');LI();
    api('/user/notice/fetch').then(function(j){var ns=j.data||[];if(!ns.length)return;var nb=$('noticeBanner');if(!nb)return;nb.innerHTML='<div class="notice"><div class="notice-ico">'+L('bell',16)+'</div><div><div class="notice-t">'+e(ns[0].title)+'</div><div class="notice-s">'+(ns[0].content||'').substring(0,150)+'</div></div></div>';LI();}).catch(function(){});
  });
}
function qcard(p,i,c,t,s){return '<div class="qcard" onclick="location.hash=\'#/'+p+'\'"><div class="qcard-ico '+c+'">'+i+'</div><div><div class="qcard-t">'+t+'</div><div class="qcard-s">'+s+'</div></div></div>';}

/* ══════════ SUBSCRIBE ══════════ */
function pgSub(){
  shell('Đăng ký',ld());
  loadSub(function(){
    var d=subData,urls=d.subscribe_urls||[];
    if(!urls.length&&d.subscribe_url)urls=[{name:'Mặc định',url:d.subscribe_url,icon:'🌐'}];
    var h='<div class="card" style="margin-bottom:20px"><div class="card-h">🔗 Link đăng ký <span class="card-badge">Bảo mật</span></div><div class="card-b">'+
      '<div class="sub-url"><input class="inp" value="'+e(d.subscribe_url||'')+'" readonly id="subUrl"><button class="btn btn-p" id="cpBtn">📋 Sao chép</button></div>'+
      '<div style="font-size:11px;color:var(--tx3);margin-top:4px">⚠️ Không chia sẻ link này cho người khác</div></div></div>';
    if(urls.length>0){
      h+='<div class="card" style="margin-bottom:20px"><div class="card-h">🌍 Chọn khu vực</div><div class="card-b" id="rList">';
      urls.forEach(function(r,i){var ic=r.icon||flag(r.name),dm='';try{dm=new URL(r.url.split('?')[0]).hostname;}catch(x){}h+='<div class="region" data-i="'+i+'"><div class="region-ico">'+ic+'</div><div><div class="region-name">'+e(r.name)+'</div>'+(dm?'<div class="region-dom">'+e(dm)+'</div>':'')+'</div></div>';});
      h+='</div></div><div class="card" id="appCard" style="display:none;margin-bottom:20px"><div class="card-h">📱 Phím tắt ứng dụng</div><div class="card-b"><div class="sub-apps" id="appG"></div></div></div>';
    }
    h+='<div class="card"><div class="card-h">ℹ️ Thông tin gói</div><div class="card-b"><div class="g g3"><div><div style="font-size:11px;color:var(--tx2)">Gói</div><div style="font-weight:700;margin-top:4px">'+e(d.plan?d.plan.name:'—')+'</div></div><div><div style="font-size:11px;color:var(--tx2)">Hết hạn</div><div style="font-weight:700;margin-top:4px">'+fD(d.expired_at)+'</div></div><div><div style="font-size:11px;color:var(--tx2)">Reset ngày</div><div style="font-weight:700;margin-top:4px">'+(d.reset_day||'—')+'</div></div></div></div></div>';
    $('pc').innerHTML=h;$('pc').classList.add('fade-in');
    $('cpBtn').onclick=function(){clip($('subUrl').value);};
    var rels=$('pc').querySelectorAll('.region');
    rels.forEach(function(el){el.onclick=function(){rels.forEach(function(x){x.classList.remove('on');});el.classList.add('on');var url=urls[parseInt(el.dataset.i)].url;$('subUrl').value=url;showApps(url);};});
  });
}
function showApps(url){var ac=$('appCard');if(!ac)return;ac.style.display='';var g=$('appG');var t=SITE.title||'VPN';var sc=[{n:'Shadowrocket',i:'🚀',h:'shadowrocket://add/sub://'+btoa(url+'&flag=shadowrocket')},{n:'Clash',i:'⚡',h:'clash://install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},{n:'ClashMeta',i:'🔥',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=meta')+'&name='+encodeURIComponent(t)},{n:'Surge',i:'🌊',h:'surge:///install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},{n:'QuantumultX',i:'⚙️',h:'quantumult-x:///update-configuration?remote-resource='+encodeURIComponent(JSON.stringify({server_remote:[url+', tag='+t]}))},{n:'Stash',i:'📦',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=stash')+'&name='+encodeURIComponent(t)}];g.innerHTML='';sc.forEach(function(s){var a=C('a');a.className='sub-app';a.href=s.h;a.innerHTML='<span class="ico">'+s.i+'</span>'+s.n;g.appendChild(a);});var cp=C('a');cp.className='sub-app';cp.href='#';cp.innerHTML='<span class="ico">📋</span>Sao chép link';cp.onclick=function(ev){ev.preventDefault();clip(url);};g.appendChild(cp);}

/* ══════════ SERVER LIST (NEW) ══════════ */
function pgServer(){
  shell('Máy chủ',ld());
  api('/user/server/fetch').then(function(j){
    var servers=j.data||[];
    if(!servers.length){$('pc').innerHTML='<div class="empty"><div class="empty-ico">🖥️</div><div class="empty-txt">Chưa có máy chủ nào</div></div>';return;}
    var groups={};servers.forEach(function(s){var g=s.group_id||'Khác';if(!groups[g])groups[g]=[];groups[g].push(s);});
    var h='<div style="margin-bottom:16px;font-size:13px;color:var(--tx2)">Tổng cộng <strong>'+servers.length+'</strong> máy chủ</div>';
    for(var gid in groups){
      h+='<div class="card" style="margin-bottom:16px"><div class="card-h">🖥️ Nhóm '+e(gid)+'<span class="card-badge">'+groups[gid].length+' server</span></div>';
      groups[gid].forEach(function(s){
        var rate=s.rate||1;
        h+='<div class="server"><div class="server-dot '+(s.available_status?'up':'down')+'"></div><div class="server-name">'+e(s.name)+'</div>'+(s.tags&&s.tags.length?s.tags.map(function(t){return '<span class="server-tag">'+e(t)+'</span>';}).join(''):'')+'<span class="server-rate">x'+rate+'</span></div>';
      });
      h+='</div>';
    }
    $('pc').innerHTML=h;$('pc').classList.add('fade-in');
  }).catch(function(x){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+e(x.message)+'</div></div>';});
}

/* ══════════ NOTICES (NEW) ══════════ */
function pgNotice(){
  shell('Thông báo',ld());
  api('/user/notice/fetch').then(function(j){
    var ns=j.data||[];
    if(!ns.length){$('pc').innerHTML='<div class="empty"><div class="empty-ico">📢</div><div class="empty-txt">Chưa có thông báo</div></div>';return;}
    var h='';ns.forEach(function(n){
      h+='<div class="card" style="margin-bottom:12px"><div class="card-h">'+e(n.title)+'<span class="card-badge">'+fD(n.created_at)+'</span></div><div class="card-b" style="font-size:13px;line-height:1.7;color:var(--tx2)">'+(n.content||'')+'</div></div>';
    });
    $('pc').innerHTML=h;$('pc').classList.add('fade-in');
  }).catch(function(x){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+e(x.message)+'</div></div>';});
}

/* ══════════ PLAN ══════════ */
function pgPlan(){
  shell('Gói dịch vụ',ld());
  loadPlans(function(){
    if(!plans||!plans.length){$('pc').innerHTML='<div class="empty"><div class="empty-ico">📦</div><div class="empty-txt">Chưa có gói nào</div></div>';return;}
    var h='<div class="g g3">';
    plans.forEach(function(p,i){var pr=gP(p),lo=pr.length?pr[0]:null;
      h+='<div class="plan'+(i===0?' hot':'')+'"><div class="plan-badge">🔥 PHỔ BIẾN</div><div class="plan-name">'+e(p.name)+'</div>'+
      '<div class="plan-price">'+(lo?fM(lo.v):'—')+'<small>'+(lo?' / '+lo.l:'')+'</small></div>'+
      (p.content?'<div class="plan-desc">'+e(p.content).replace(/\n/g,'<br>')+'</div>':'')+
      '<ul class="plan-feat"><li>Data: '+fB(p.transfer_enable)+'</li>'+(p.device_limit?'<li>Thiết bị: '+p.device_limit+'</li>':'')+(p.speed_limit?'<li>Tốc độ: '+p.speed_limit+' Mbps</li>':'')+'</ul>'+
      '<button class="btn btn-grad btn-block" onclick="window._buy('+p.id+')">Mua ngay →</button></div>';
    });h+='</div>';$('pc').innerHTML=h;$('pc').classList.add('fade-in');
  });
}
function gP(p){var r=[];if(p.month_price!=null)r.push({l:'1 Tháng',v:p.month_price,k:'month_price'});if(p.quarter_price!=null)r.push({l:'3 Tháng',v:p.quarter_price,k:'quarter_price'});if(p.half_year_price!=null)r.push({l:'6 Tháng',v:p.half_year_price,k:'half_year_price'});if(p.year_price!=null)r.push({l:'1 Năm',v:p.year_price,k:'year_price'});if(p.two_year_price!=null)r.push({l:'2 Năm',v:p.two_year_price,k:'two_year_price'});if(p.three_year_price!=null)r.push({l:'3 Năm',v:p.three_year_price,k:'three_year_price'});if(p.onetime_price!=null)r.push({l:'Trọn đời',v:p.onetime_price,k:'onetime_price'});return r;}
window._buy=function(id){var p=plans.find(function(x){return x.id===id;});if(!p)return;var pr=gP(p);if(!pr.length){toast('Chưa có giá','err');return;}
  openModal('📦 '+e(p.name),function(box){
    box.innerHTML+='<div class="inp-group" style="margin-bottom:16px"><label class="inp-lbl">Mã giảm giá</label><div style="display:flex;gap:8px"><input class="inp" id="cpnI" placeholder="Nhập mã"><button class="btn btn-sm" id="cpnB">Áp dụng</button></div><div id="cpnM" style="font-size:12px;margin-top:4px"></div></div>';
    var cpn=null;pr.forEach(function(x){var el=C('div');el.className='region';el.innerHTML='<div class="region-ico" style="background:var(--prBg)">💰</div><div><div class="region-name">'+x.l+'</div><div style="font-size:15px;font-weight:800;color:var(--pr);margin-top:2px">'+fM(x.v)+'</div></div>';el.onclick=function(){el.innerHTML='<span class="spin"></span>';var body={plan_id:id,period:x.k};if(cpn)body.coupon_code=cpn;api('/user/order/save',{method:'POST',body:body}).then(function(j){if(j.data){toast('✅ Tạo đơn thành công');closeModal();go('order');}else toast(j.message||'Lỗi','err');}).catch(function(x){toast(x.message,'err');});};box.appendChild(el);});
    setTimeout(function(){var cb=$('cpnB');if(cb)cb.onclick=function(){var code=$('cpnI').value.trim();if(!code)return;api('/user/coupon/check',{method:'POST',body:{code:code,plan_id:id}}).then(function(j){if(j.data){cpn=code;$('cpnM').innerHTML='<span style="color:var(--ok)">✅ Giảm '+fM(j.data.value)+'</span>';}else $('cpnM').innerHTML='<span style="color:var(--err)">❌ '+(j.message||'Không hợp lệ')+'</span>';}).catch(function(x){$('cpnM').innerHTML='<span style="color:var(--err)">'+x.message+'</span>';});};},50);
  });
};

/* ══════════ ORDER ══════════ */
function pgOrder(){
  shell('Đơn hàng',ld());
  api('/user/order/fetch').then(function(j){var os=j.data||[];
    if(!os.length){$('pc').innerHTML='<div class="empty"><div class="empty-ico">🧾</div><div class="empty-txt">Chưa có đơn hàng</div><div class="empty-sub">Hãy mua gói dịch vụ để bắt đầu</div></div>';return;}
    var sm={0:['Chờ thanh toán','tag-warn'],1:['Đang mở','tag-pr'],2:['Đã hủy','tag-err'],3:['Hoàn thành','tag-ok'],4:['Hoàn tiền','tag-err']};
    var pd={'month_price':'Tháng','quarter_price':'Quý','half_year_price':'6 tháng','year_price':'Năm','two_year_price':'2 năm','three_year_price':'3 năm','onetime_price':'Trọn đời'};
    var h='<div class="card"><div class="card-b" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Mã đơn</th><th>Gói</th><th>Chu kỳ</th><th>Số tiền</th><th>Trạng thái</th><th>Ngày</th><th></th></tr></thead><tbody>';
    os.forEach(function(o){var s=sm[o.status]||['—',''];h+='<tr><td class="mono">'+e((o.trade_no||'').substring(0,14))+'</td><td>'+e(o.plan?o.plan.name:'—')+'</td><td style="font-size:12px">'+(pd[o.period]||o.period||'—')+'</td><td style="font-weight:700">'+fM(o.total_amount)+'</td><td><span class="tag '+s[1]+'">'+s[0]+'</span></td><td style="font-size:12px">'+fDT(o.created_at)+'</td><td>'+(o.status===0?'<button class="btn btn-p btn-sm" onclick="window._pay(\''+o.trade_no+'\')">Thanh toán</button> <button class="btn btn-sm" onclick="window._cancel(\''+o.trade_no+'\')">Hủy</button>':'')+'</td></tr>';});
    h+='</tbody></table></div></div>';$('pc').innerHTML=h;$('pc').classList.add('fade-in');
  }).catch(function(x){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+e(x.message)+'</div></div>';});
}
window._pay=function(tn){api('/user/order/getPaymentMethod').then(function(j){var ms=j.data||[];if(!ms.length){toast('Chưa cấu hình thanh toán','err');return;}openModal('💳 Thanh toán',function(box){ms.forEach(function(m){var el=C('div');el.className='region';el.innerHTML='<div class="region-ico" style="background:var(--prBg)">💳</div><div><div class="region-name">'+e(m.name)+'</div></div>';el.onclick=function(){el.innerHTML='<span class="spin"></span>';api('/user/order/checkout',{method:'POST',body:{trade_no:tn,method:m.id}}).then(function(j){if(j.data){closeModal();if(j.data.type===1&&j.data.data)window.open(j.data.data);else if(j.data.type===0)toast('✅ Thanh toán thành công');else if(j.data.type===-1)window.location.href=j.data.data;pgOrder();}else toast(j.message||'Lỗi','err');}).catch(function(x){toast(x.message,'err');});};box.appendChild(el);});});}).catch(function(x){toast(x.message,'err');});};
window._cancel=function(tn){if(!confirm('Hủy đơn hàng?'))return;api('/user/order/cancel',{method:'POST',body:{trade_no:tn}}).then(function(){toast('✅ Đã hủy');pgOrder();}).catch(function(x){toast(x.message,'err');});};

/* ══════════ INVITE ══════════ */
function pgInvite(){shell('Giới thiệu',ld());Promise.all([api('/user/invite/fetch'),api('/user/invite/details')]).then(function(r){var inv=r[0].data||{},det=r[1].data||[],codes=inv.codes||[];
  var h='<div class="stats" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:20px"><div class="stat-card"><div class="s-ico">💰</div><div class="s-val">'+fM(inv.stat?inv.stat[0]:0)+'</div><div class="s-lbl">Hoa hồng chờ</div></div><div class="stat-card"><div class="s-ico">✅</div><div class="s-val">'+fM(inv.stat?inv.stat[1]:0)+'</div><div class="s-lbl">Đã nhận</div></div><div class="stat-card"><div class="s-ico">👥</div><div class="s-val">'+fM(inv.stat?inv.stat[2]:0)+'</div><div class="s-lbl">Tổng</div></div></div>';
  h+='<div class="card" style="margin-bottom:16px"><div class="card-h">🎟️ Mã giới thiệu <button class="btn btn-p btn-sm" id="genC" style="margin-left:auto">+ Tạo mã</button></div><div class="card-b">';
  if(codes.length){codes.forEach(function(c){var lk=location.origin+'/#/register?code='+c.code;h+='<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bdr2)"><span class="mono" style="flex:1">'+e(c.code)+'</span><button class="btn btn-sm" onclick="('+clip.toString()+')(\''+lk+'\')">📋 Sao chép link</button></div>';});}else h+='<div class="empty" style="padding:24px"><div class="empty-txt">Chưa có mã</div></div>';
  h+='</div></div>';
  if(det.length){h+='<div class="card"><div class="card-h">📋 Lịch sử</div><div class="card-b" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Đơn hàng</th><th>Hoa hồng</th><th>Trạng thái</th><th>Ngày</th></tr></thead><tbody>';det.forEach(function(d){h+='<tr><td class="mono">#'+d.order_id+'</td><td style="font-weight:700">'+fM(d.get_amount)+'</td><td><span class="tag '+(d.status?'tag-ok':'tag-warn')+'">'+(d.status?'Đã nhận':'Chờ')+'</span></td><td style="font-size:12px">'+fDT(d.created_at)+'</td></tr>';});h+='</tbody></table></div></div>';}
  $('pc').innerHTML=h;$('pc').classList.add('fade-in');$('genC').onclick=function(){api('/user/invite/save').then(function(){toast('✅');pgInvite();}).catch(function(x){toast(x.message,'err');});};
}).catch(function(x){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+e(x.message)+'</div></div>';});}

/* ══════════ TICKET ══════════ */
function pgTicket(){shell('Hỗ trợ',ld());api('/user/ticket/fetch').then(function(j){var ts=j.data||[];var h='<div style="margin-bottom:16px"><button class="btn btn-grad" id="newT">✏️ Tạo ticket mới</button></div>';if(!ts.length)h+='<div class="empty"><div class="empty-ico">💬</div><div class="empty-txt">Chưa có ticket</div></div>';else{var st={0:['Đang mở','tag-ok'],1:['Đã đóng','tag-err']};ts.forEach(function(t){var s=st[t.status]||['—',''];h+='<div class="card" style="margin-bottom:10px;cursor:pointer" onclick="window._vt('+t.id+')"><div class="card-b" style="display:flex;align-items:center;gap:12px"><div style="flex:1"><div style="font-weight:600">'+e(t.subject)+'</div><div style="font-size:12px;color:var(--tx3);margin-top:2px">'+fDT(t.created_at)+'</div></div><span class="tag '+s[1]+'">'+s[0]+'</span></div></div>';});}
  $('pc').innerHTML=h;$('pc').classList.add('fade-in');
  $('newT').onclick=function(){openModal('✏️ Ticket mới',function(box){box.innerHTML+='<div class="inp-group"><label class="inp-lbl">Tiêu đề</label><input class="inp" id="tS"></div><div class="inp-group"><label class="inp-lbl">Nội dung</label><textarea class="inp" id="tC" rows="4"></textarea></div><button class="btn btn-grad btn-block" id="tB">Gửi ticket</button>';setTimeout(function(){$('tB').onclick=function(){var s=$('tS').value.trim(),c=$('tC').value.trim();if(!s||!c){toast('Nhập đầy đủ','err');return;}api('/user/ticket/save',{method:'POST',body:{subject:s,message:c,level:0}}).then(function(){toast('✅');closeModal();pgTicket();}).catch(function(x){toast(x.message,'err');});};},50);});};
}).catch(function(x){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+e(x.message)+'</div></div>';});}
window._vt=function(id){openModal('💬 Ticket #'+id,function(box){box.innerHTML=ld();api('/user/ticket/fetch?id='+id).then(function(j){var t=j.data;if(!t){box.innerHTML='<p>Không tìm thấy</p>';return;}var ms='';(t.message||[]).forEach(function(m){ms+='<div style="margin-bottom:10px;padding:12px 16px;border-radius:12px;background:'+(m.is_me?'var(--prBg)':'var(--bgH)')+';'+(m.is_me?'margin-left:24px':'margin-right:24px')+'"><div style="font-size:11px;color:var(--tx3);margin-bottom:4px">'+(m.is_me?'Bạn':'Hỗ trợ')+' · '+fDT(m.created_at)+'</div><div style="font-size:13px">'+e(m.message)+'</div></div>';});box.innerHTML='<div style="font-weight:700;margin-bottom:14px">'+e(t.subject||'')+'</div><div style="max-height:320px;overflow-y:auto;margin-bottom:16px">'+ms+'</div>'+(t.status===0?'<div class="inp-group"><textarea class="inp" id="tR" rows="2" placeholder="Trả lời..."></textarea></div><div class="btn-group"><button class="btn btn-p" id="tRB">Gửi</button><button class="btn btn-d btn-sm" id="tCB">Đóng ticket</button></div>':'<div style="text-align:center;color:var(--tx3);font-size:13px;padding:12px">Ticket đã đóng</div>');if(t.status===0)setTimeout(function(){$('tRB').onclick=function(){var m=$('tR').value.trim();if(!m)return;api('/user/ticket/reply',{method:'POST',body:{id:id,message:m}}).then(function(){toast('✅');window._vt(id);}).catch(function(x){toast(x.message,'err');});};$('tCB').onclick=function(){api('/user/ticket/close',{method:'POST',body:{id:id}}).then(function(){toast('✅');closeModal();pgTicket();}).catch(function(x){toast(x.message,'err');});};},50);}).catch(function(x){box.innerHTML='<p style="color:var(--err)">'+x.message+'</p>';});});};

/* ══════════ KNOWLEDGE ══════════ */
function pgKnowledge(){shell('Hướng dẫn',ld());api('/user/knowledge/fetch').then(function(j){var items=j.data||[];if(!items.length){$('pc').innerHTML='<div class="empty"><div class="empty-ico">📚</div><div class="empty-txt">Chưa có hướng dẫn</div></div>';return;}var h='';items.forEach(function(item){h+='<div class="card" style="margin-bottom:10px;cursor:pointer"><div class="card-b"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px">📖</span><div style="flex:1"><div style="font-weight:600;font-size:14px">'+e(item.title)+'</div>'+(item.category?'<div style="font-size:11px;color:var(--tx3);margin-top:2px">'+e(item.category.name||'')+'</div>':'')+'</div><span style="color:var(--tx3);transition:transform .15s" class="kb-arrow">▶</span></div><div class="kb-body" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid var(--bdr2);font-size:13px;line-height:1.75">'+(item.body||'')+'</div></div></div>';});$('pc').innerHTML=h;$('pc').classList.add('fade-in');$('pc').querySelectorAll('.card').forEach(function(card){card.onclick=function(){var body=card.querySelector('.kb-body'),arrow=card.querySelector('.kb-arrow');if(body.style.display==='none'){body.style.display='block';arrow.textContent='▼';}else{body.style.display='none';arrow.textContent='▶';}};});}).catch(function(x){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+e(x.message)+'</div></div>';});}

/* ══════════ PROFILE ══════════ */
function pgProfile(){shell('Tài khoản',ld());loadUser(function(){var used=(user.u||0)+(user.d||0);
  $('pc').innerHTML='<div class="g g2">'+
  '<div class="card"><div class="card-h">👤 Thông tin tài khoản</div><div class="card-b">'+ir('Email',user.email)+ir('UUID',user.uuid||'—')+ir('Gói',user.plan?user.plan.name:'—')+ir('Hết hạn',fD(user.expired_at))+ir('Data',fB(used)+' / '+fB(user.transfer_enable))+ir('Thiết bị',(user.alive_ip||0)+' / '+(user.device_limit||'∞'))+'</div></div>'+
  '<div><div class="card" style="margin-bottom:16px"><div class="card-h">🔒 Đổi mật khẩu</div><div class="card-b"><div class="inp-group"><label class="inp-lbl">Mật khẩu cũ</label><input class="inp" type="password" id="oP"></div><div class="inp-group"><label class="inp-lbl">Mật khẩu mới</label><input class="inp" type="password" id="nP"></div><button class="btn btn-p" id="cpB">Đổi mật khẩu</button></div></div>'+
  '<div class="card" style="margin-bottom:16px"><div class="card-h">🎁 Gift Card</div><div class="card-b"><div style="display:flex;gap:8px"><input class="inp" id="gcI" placeholder="Nhập mã"><button class="btn btn-p" id="gcB">Đổi</button></div></div></div>'+
  '<div class="card"><div class="card-h">⚙️ Cài đặt</div><div class="card-b"><div class="btn-group"><button class="btn" id="rstB">🔄 Reset link đăng ký</button><button class="btn" onclick="window._ss()">📱 Phiên đăng nhập</button></div></div></div></div></div>';
  $('pc').classList.add('fade-in');
  $('cpB').onclick=function(){var o=$('oP').value,n=$('nP').value;if(!o||!n){toast('Nhập đầy đủ','err');return;}api('/user/changePassword',{method:'POST',body:{old_password:o,new_password:n}}).then(function(){toast('✅ Đã đổi');$('oP').value='';$('nP').value='';}).catch(function(x){toast(x.message,'err');});};
  $('gcB').onclick=function(){var c=$('gcI').value.trim();if(!c)return;api('/user/redeemgiftcard',{method:'POST',body:{code:c}}).then(function(){toast('✅ Thành công');$('gcI').value='';}).catch(function(x){toast(x.message,'err');});};
  $('rstB').onclick=function(){if(!confirm('Reset link? Link cũ sẽ mất.'))return;api('/user/resetSecurity').then(function(){toast('✅ Đã reset');subData=null;user=null;}).catch(function(x){toast(x.message,'err');});};
});}
function ir(l,v){return '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--bdr2);font-size:13px"><span style="color:var(--tx2)">'+l+'</span><span style="font-weight:600;word-break:break-all;text-align:right;max-width:60%">'+e(v||'')+'</span></div>';}
window._ss=function(){openModal('📱 Phiên đăng nhập',function(box){box.innerHTML=ld();api('/user/getActiveSession').then(function(j){var ss=j.data||[];if(!ss.length){box.innerHTML='<div style="text-align:center;color:var(--tx3);padding:20px">Không có phiên nào</div>';return;}var h='';ss.forEach(function(s){h+='<div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--bdr2)"><div style="flex:1"><div style="font-size:13px;font-weight:500">'+e(s.ip||'—')+'</div><div style="font-size:11px;color:var(--tx3)">'+fDT(s.created_at)+'</div></div><button class="btn btn-sm btn-d" onclick="window._rs(\''+s.session_id+'\')">Xóa</button></div>';});box.innerHTML=h;}).catch(function(x){box.innerHTML='<p style="color:var(--err)">'+x.message+'</p>';});});};
window._rs=function(sid){api('/user/removeActiveSession',{method:'POST',body:{session_id:sid}}).then(function(){toast('✅');window._ss();}).catch(function(x){toast(x.message,'err');});};

/* ══════════ MODAL ══════════ */
var mOv=null;
function openModal(t,fn){if(mOv)mOv.remove();mOv=C('div');mOv.className='ov';var m=C('div');m.className='modal';m.innerHTML='<div class="modal-h">'+t+'<button class="modal-close" id="mCl">✕</button></div>';fn(m);mOv.appendChild(m);document.body.appendChild(mOv);requestAnimationFrame(function(){mOv.classList.add('show');});mOv.querySelector('#mCl').onclick=closeModal;mOv.onclick=function(ev){if(ev.target===mOv)closeModal();};}
function closeModal(){if(!mOv)return;mOv.classList.remove('show');setTimeout(function(){if(mOv){mOv.remove();mOv=null;}},250);}

/* ══════════ DATA ══════════ */
function loadUser(cb){if(user){cb();return;}api('/user/getSubscribe').then(function(j){user=j.data;cb();}).catch(function(x){if((x.message||'').indexOf('登录')!==-1){logout();return;}toast(x.message,'err');});}
function loadSub(cb){if(subData){cb();return;}api('/user/getSubscribe').then(function(j){subData=j.data;user=j.data;cb();}).catch(function(x){if((x.message||'').indexOf('登录')!==-1){logout();return;}toast(x.message,'err');});}
function loadPlans(cb){if(plans){cb();return;}api('/user/plan/fetch').then(function(j){plans=j.data||[];cb();}).catch(function(x){toast(x.message,'err');});}

/* ══════════ INIT ══════════ */
route();
})();
