/**
 * TNETZ PRO — Full-Feature Custom SPA
 * All V2Board features • Vanilla JS • No dependencies
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
function hdr(){return {'authorization':tk(),'Content-Type':'application/json'};}
function logout(){localStorage.removeItem('auth_data');user=null;subData=null;plans=null;go('login');}

/* ══════════ API ══════════ */
function api(path,opts){
  opts=opts||{};var h={'authorization':tk()};if(opts.body)h['Content-Type']='application/json';
  return fetch(API+path,{method:opts.method||'GET',headers:h,body:opts.body?JSON.stringify(opts.body):undefined})
    .then(function(r){return r.json();}).then(function(j){if(j.message&&!j.data)throw new Error(j.message);return j;});
}

/* ══════════ TOAST ══════════ */
var toastEl,toastTm;
function toast(m,t){if(!toastEl){toastEl=C('div');toastEl.className='toast';document.body.appendChild(toastEl);}toastEl.textContent=m;toastEl.className='toast toast-'+(t||'ok')+' show';clearTimeout(toastTm);toastTm=setTimeout(function(){toastEl.classList.remove('show');},2800);}

/* ══════════ HELPERS ══════════ */
function esc(s){if(!s)return '';var d=C('div');d.textContent=s;return d.innerHTML;}
function fmtB(b){if(!b||b<=0)return '0 B';var u=['B','KB','MB','GB','TB'];var i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(i>1?2:0)+' '+u[i];}
function fmtD(ts){if(!ts)return '—';var d=new Date(ts*1000);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());}
function fmtDT(ts){if(!ts)return '—';var d=new Date(ts*1000);return fmtD(ts)+' '+p2(d.getHours())+':'+p2(d.getMinutes());}
function p2(n){return n<10?'0'+n:''+n;}
function fmtMoney(v){if(v===null||v===undefined)return '—';return (v/100).toLocaleString('vi-VN')+'đ';}
function clip(t){if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast('✅ Đã sao chép');});else{var a=C('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px';document.body.appendChild(a);a.select();document.execCommand('copy');document.body.removeChild(a);toast('✅ Đã sao chép');}}
function daysLeft(ts){if(!ts)return 0;return Math.max(0,Math.ceil((ts*1000-Date.now())/86400000));}
var FLAGS={'default':'🌐','china':'🇨🇳','trung':'🇨🇳','russia':'🇷🇺','nga':'🇷🇺','vietnam':'🇻🇳','việt':'🇻🇳','japan':'🇯🇵','nhật':'🇯🇵','korea':'🇰🇷','hàn':'🇰🇷','us':'🇺🇸','mỹ':'🇺🇸','singapore':'🇸🇬','hong kong':'🇭🇰','taiwan':'🇹🇼'};
function flag(n){var l=(n||'').toLowerCase();for(var k in FLAGS)if(l.indexOf(k)!==-1)return FLAGS[k];return '🌍';}

/* ══════════ THEME ══════════ */
var theme=localStorage.getItem('tz-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
document.documentElement.setAttribute('data-theme',theme);
function toggleTheme(){theme=theme==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',theme);localStorage.setItem('tz-theme',theme);var b=$('themeBtn');if(b)b.textContent=theme==='dark'?'☀️':'🌙';}

/* ══════════ ROUTER ══════════ */
var routes={login:pgLogin,register:pgRegister,dash:pgDash,subscribe:pgSub,plan:pgPlan,order:pgOrder,invite:pgInvite,ticket:pgTicket,knowledge:pgKnowledge,profile:pgProfile};
var curPage='';
function go(p){window.location.hash='#/'+p;}
function route(){var h=(window.location.hash||'#/').replace('#/','').split('?')[0]||'dash';if(!logged()&&h!=='login'&&h!=='register'){go('login');return;}if(logged()&&(h==='login'||h==='register')){go('dash');return;}curPage=h;var fn=routes[h];if(fn)fn();else pgDash();}
window.addEventListener('hashchange',route);

/* ══════════ SHELL ══════════ */
function shell(title,content){
  var app=$('app');
  app.innerHTML='<div class="shell"><nav class="nav" id="nav"><div class="nav-brand"><div class="dot">⚡</div><h1>'+esc(SITE.title||'TNETZ')+'</h1></div><div class="nav-links">'+
    nl('dash','📊','Tổng quan')+nl('subscribe','🔗','Đăng ký')+nl('plan','📦','Gói dịch vụ')+nl('order','🧾','Đơn hàng')+nl('invite','🎁','Giới thiệu')+nl('ticket','💬','Hỗ trợ')+nl('knowledge','📚','Hướng dẫn')+nl('profile','👤','Tài khoản')+
  '</div><div class="nav-footer"><button class="nav-link" id="logoutBtn"><span class="ico">🚪</span>Đăng xuất</button></div></nav>'+
  '<div class="main"><div class="topbar"><button class="menu-btn" id="menuBtn">☰</button><div class="topbar-title">'+esc(title)+'</div>'+
  '<div class="topbar-user"><div class="topbar-avatar">'+((user&&user.email)?user.email[0].toUpperCase():'U')+'</div><span class="topbar-email">'+esc(user?user.email:'')+'</span></div></div>'+
  '<div class="page fade-in" id="pc">'+content+'</div></div></div><button id="themeBtn">'+(theme==='dark'?'☀️':'🌙')+'</button>';
  $('themeBtn').onclick=toggleTheme;
  $('menuBtn').onclick=function(){$('nav').classList.toggle('open');};
  $('logoutBtn').onclick=logout;
  app.querySelectorAll('.nav-link[data-p]').forEach(function(l){l.onclick=function(){$('nav').classList.remove('open');go(this.dataset.p);};});
}
function nl(p,i,t){return '<button class="nav-link'+(curPage===p?' on':'')+'" data-p="'+p+'"><span class="ico">'+i+'</span>'+t+'</button>';}
function loading(){return '<div class="page-loading"><span class="spin"></span></div>';}

/* ══════════ LOGIN ══════════ */
function pgLogin(){
  $('app').innerHTML='<div class="login-wrap fade-in"><div class="login-box"><div class="login-header"><div class="login-logo">⚡</div><h1>'+esc(SITE.title||'TNETZ')+'</h1><p>'+(SITE.description||'Đăng nhập để tiếp tục')+'</p></div>'+
  '<div class="login-card"><div class="inp-group"><label class="inp-lbl">Email</label><input class="inp" id="le" type="email" placeholder="email@example.com" autofocus></div>'+
  '<div class="inp-group"><label class="inp-lbl">Mật khẩu</label><input class="inp" id="lp" type="password" placeholder="••••••••"></div>'+
  '<button class="btn btn-p btn-block" id="lb" style="height:44px;font-size:14px;margin-top:4px">Đăng nhập</button></div>'+
  '<div class="login-switch">Chưa có tài khoản? <a href="#/register">Đăng ký</a></div></div></div><button id="themeBtn">'+(theme==='dark'?'☀️':'🌙')+'</button>';
  $('themeBtn').onclick=toggleTheme;$('lb').onclick=doLogin;$('lp').onkeydown=function(e){if(e.key==='Enter')doLogin();};
}
function doLogin(){
  var e=$('le').value.trim(),p=$('lp').value;if(!e||!p){toast('Nhập đầy đủ','err');return;}
  $('lb').innerHTML='<span class="spin"></span>';
  fetch(API+'/passport/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})})
  .then(function(r){return r.json();}).then(function(j){
    if(j.data&&j.data.auth_data){localStorage.setItem('auth_data',j.data.auth_data);user=null;subData=null;go('dash');}
    else{toast(j.message||'Thất bại','err');$('lb').textContent='Đăng nhập';}
  }).catch(function(e){toast(e.message,'err');$('lb').textContent='Đăng nhập';});
}

/* ══════════ REGISTER ══════════ */
function pgRegister(){
  $('app').innerHTML='<div class="login-wrap fade-in"><div class="login-box"><div class="login-header"><div class="login-logo">⚡</div><h1>Tạo tài khoản</h1><p>Đăng ký miễn phí</p></div>'+
  '<div class="login-card"><div class="inp-group"><label class="inp-lbl">Email</label><input class="inp" id="re" type="email" placeholder="email@example.com"></div>'+
  '<div class="inp-group"><label class="inp-lbl">Mật khẩu</label><input class="inp" id="rp" type="password" placeholder="Ít nhất 8 ký tự"></div>'+
  '<div class="inp-group"><label class="inp-lbl">Mã mời (tuỳ chọn)</label><input class="inp" id="ri" placeholder="Nhập mã nếu có"></div>'+
  '<button class="btn btn-p btn-block" id="rb" style="height:44px;font-size:14px;margin-top:4px">Đăng ký</button></div>'+
  '<div class="login-switch">Đã có tài khoản? <a href="#/login">Đăng nhập</a></div></div></div><button id="themeBtn">'+(theme==='dark'?'☀️':'🌙')+'</button>';
  $('themeBtn').onclick=toggleTheme;
  $('rb').onclick=function(){
    var e=$('re').value.trim(),p=$('rp').value,inv=$('ri').value.trim();if(!e||!p){toast('Nhập đầy đủ','err');return;}
    $('rb').innerHTML='<span class="spin"></span>';var body={email:e,password:p};if(inv)body.invite_code=inv;
    fetch(API+'/passport/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(function(r){return r.json();}).then(function(j){
      if(j.data&&j.data.auth_data){localStorage.setItem('auth_data',j.data.auth_data);go('dash');}
      else{toast(j.message||'Thất bại','err');$('rb').textContent='Đăng ký';}
    }).catch(function(e){toast(e.message,'err');$('rb').textContent='Đăng ký';});
  };
}

/* ══════════ DASHBOARD ══════════ */
function pgDash(){
  shell('Tổng quan',loading());
  loadUser(function(){
    var p=user.plan,used=(user.u||0)+(user.d||0),total=user.transfer_enable||1,pct=Math.min(100,Math.round(used/total*100)),dl=daysLeft(user.expired_at);
    var pctColor=pct>80?'var(--err)':pct>50?'var(--warn)':'var(--pr)';
    var dlColor=dl<7?'var(--err)':dl<30?'var(--warn)':'var(--ok)';
    $('pc').innerHTML=
    // Notice banner
    '<div id="noticeArea"></div>'+
    // Stats row
    '<div class="g g4" style="margin-bottom:16px">'+
      statCard('📦',p?p.name:'—','Gói hiện tại')+
      statCard('📅','<span style="color:'+dlColor+'">'+dl+' ngày</span>','Còn lại')+
      statCard('📊',fmtB(used)+' / '+fmtB(total),'Data đã dùng')+
      statCard('📱',(user.alive_ip||0)+' / '+(user.device_limit||'∞'),'Thiết bị')+
    '</div>'+
    // Progress bar
    '<div class="card" style="margin-bottom:16px"><div class="card-b">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;font-weight:600">Dung lượng</span><span style="font-size:12px;color:var(--tx2)">'+pct+'%</span></div>'+
      '<div style="height:8px;background:var(--bgH);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+pctColor+';border-radius:4px;transition:width .5s"></div></div>'+
      '<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--tx3)"><span>↑ '+fmtB(user.u||0)+'</span><span>↓ '+fmtB(user.d||0)+'</span></div>'+
    '</div></div>'+
    // Quick actions
    '<div class="g g3">'+
      quickCard('subscribe','🔗','Đăng ký & Khu vực','Lấy link, đồng bộ app')+
      quickCard('plan','📦','Mua gói / Gia hạn','Xem gói dịch vụ')+
      quickCard('invite','🎁','Giới thiệu bạn bè','Nhận hoa hồng')+
    '</div>';
    $('pc').classList.add('fade-in');
    // Load notices
    api('/user/notice/fetch').then(function(j){
      var notices=j.data||[];if(!notices.length)return;
      var na=$('noticeArea');if(!na)return;
      na.innerHTML='<div class="card" style="margin-bottom:16px;border-left:3px solid var(--pr)"><div class="card-b" style="padding:14px 16px">'+
        '<div style="font-size:12px;font-weight:600;color:var(--pr);margin-bottom:4px">📢 Thông báo</div>'+
        '<div style="font-size:13px">'+esc(notices[0].title)+'</div>'+
        (notices[0].content?'<div style="font-size:12px;color:var(--tx2);margin-top:4px">'+notices[0].content.substring(0,120)+'...</div>':'')+
      '</div></div>';
    }).catch(function(){});
  });
}
function statCard(i,v,l){return '<div class="card"><div class="stat"><div class="stat-ico">'+i+'</div><div class="stat-val">'+v+'</div><div class="stat-lbl">'+l+'</div></div></div>';}
function quickCard(p,i,t,s){return '<div class="card" style="cursor:pointer" onclick="location.hash=\'#/'+p+'\'"><div class="card-b" style="display:flex;align-items:center;gap:12px"><span style="font-size:26px">'+i+'</span><div><div style="font-weight:600;font-size:14px">'+t+'</div><div style="font-size:12px;color:var(--tx2)">'+s+'</div></div></div></div>';}

/* ══════════ SUBSCRIBE ══════════ */
function pgSub(){
  shell('Đăng ký',loading());
  loadSub(function(){
    var d=subData,urls=d.subscribe_urls||[];
    if(!urls.length&&d.subscribe_url)urls=[{name:'Mặc định',url:d.subscribe_url,icon:'🌐'}];
    var html='<div class="card" style="margin-bottom:16px"><div class="card-h">🔗 Link đăng ký</div><div class="card-b">'+
      '<div class="sub-url"><input class="inp" value="'+esc(d.subscribe_url||'')+'" readonly id="subUrl"><button class="btn btn-p" id="cpBtn">📋 Sao chép</button></div>'+
      '<div style="font-size:11px;color:var(--tx3);margin-top:4px">⚠️ Link chứa thông tin cá nhân, không chia sẻ cho người khác</div>'+
    '</div></div>';
    if(urls.length>0){
      html+='<div class="card" style="margin-bottom:16px"><div class="card-h">🌍 Chọn khu vực <span style="font-size:11px;color:var(--tx3);font-weight:400;margin-left:8px">Chọn vùng → link tự cập nhật</span></div><div class="card-b"><div id="rList">';
      urls.forEach(function(r,i){
        var ic=r.icon||flag(r.name),dm='';try{dm=new URL(r.url.split('?')[0]).hostname;}catch(e){}
        html+='<div class="region" data-i="'+i+'"><div class="region-ico">'+ic+'</div><div><div class="region-name">'+esc(r.name)+'</div>'+(dm?'<div class="region-dom">'+esc(dm)+'</div>':'')+'</div></div>';
      });
      html+='</div></div></div>';
      html+='<div class="card" id="appCard" style="display:none;margin-bottom:16px"><div class="card-h">📱 Phím tắt ứng dụng</div><div class="card-b"><div class="sub-apps" id="appG"></div></div></div>';
    }
    // Reset URL info
    html+='<div class="card"><div class="card-h">ℹ️ Thông tin gói</div><div class="card-b"><div class="g g3">'+
      '<div><span style="font-size:11px;color:var(--tx2)">Gói</span><div style="font-weight:600">'+esc(d.plan?d.plan.name:'—')+'</div></div>'+
      '<div><span style="font-size:11px;color:var(--tx2)">Hết hạn</span><div style="font-weight:600">'+fmtD(d.expired_at)+'</div></div>'+
      '<div><span style="font-size:11px;color:var(--tx2)">Reset ngày</span><div style="font-weight:600">'+(d.reset_day||'—')+'</div></div>'+
    '</div></div></div>';

    $('pc').innerHTML=html;$('pc').classList.add('fade-in');
    $('cpBtn').onclick=function(){clip($('subUrl').value);};
    // Region clicks
    var rels=$('pc').querySelectorAll('.region');
    rels.forEach(function(el){el.onclick=function(){
      rels.forEach(function(x){x.classList.remove('on');});el.classList.add('on');
      var url=urls[parseInt(el.dataset.i)].url;$('subUrl').value=url;showApps(url);
    };});
  });
}
function showApps(url){
  var ac=$('appCard');if(!ac)return;ac.style.display='';var g=$('appG');var t=SITE.title||'VPN';
  var sc=[{n:'Shadowrocket',i:'🚀',h:'shadowrocket://add/sub://'+btoa(url+'&flag=shadowrocket')},{n:'Clash',i:'⚡',h:'clash://install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},{n:'ClashMeta',i:'🔥',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=meta')+'&name='+encodeURIComponent(t)},{n:'Surge',i:'🌊',h:'surge:///install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},{n:'QuantumultX',i:'⚙️',h:'quantumult-x:///update-configuration?remote-resource='+encodeURIComponent(JSON.stringify({server_remote:[url+', tag='+t]}))},{n:'Stash',i:'📦',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=stash')+'&name='+encodeURIComponent(t)}];
  g.innerHTML='';sc.forEach(function(s){var a=C('a');a.className='sub-app';a.href=s.h;a.innerHTML='<span class="ico">'+s.i+'</span>'+s.n;g.appendChild(a);});
  var cp=C('a');cp.className='sub-app';cp.href='#';cp.innerHTML='<span class="ico">📋</span>Sao chép';cp.onclick=function(e){e.preventDefault();clip(url);};g.appendChild(cp);
}

/* ══════════ PLAN ══════════ */
function pgPlan(){
  shell('Gói dịch vụ',loading());
  loadPlans(function(){
    if(!plans||!plans.length){$('pc').innerHTML='<div class="empty"><div class="empty-ico">📦</div><div class="empty-txt">Chưa có gói nào</div></div>';return;}
    var html='<div class="g g3">';
    plans.forEach(function(p,i){
      var pr=getPrices(p),lo=pr.length?pr[0]:null;
      html+='<div class="plan'+(i===0?' hot':'')+'">'+
        '<div class="plan-name">'+esc(p.name)+'</div>'+
        '<div class="plan-price">'+(lo?fmtMoney(lo.v):'—')+'<small>'+(lo?' / '+lo.l:'')+'</small></div>'+
        (p.content?'<div class="plan-desc">'+esc(p.content).replace(/\n/g,'<br>')+'</div>':'')+
        '<ul class="plan-feat"><li>Data: '+fmtB(p.transfer_enable)+'</li>'+(p.device_limit?'<li>Thiết bị: '+p.device_limit+'</li>':'')+(p.speed_limit?'<li>Tốc độ: '+p.speed_limit+' Mbps</li>':'')+'</ul>'+
        '<button class="btn btn-p btn-block" onclick="window._buyPlan('+p.id+')">Mua ngay</button></div>';
    });
    html+='</div>';$('pc').innerHTML=html;$('pc').classList.add('fade-in');
  });
}
function getPrices(p){var r=[];
  if(p.month_price!=null)r.push({l:'1 Tháng',v:p.month_price,k:'month_price'});
  if(p.quarter_price!=null)r.push({l:'3 Tháng',v:p.quarter_price,k:'quarter_price'});
  if(p.half_year_price!=null)r.push({l:'6 Tháng',v:p.half_year_price,k:'half_year_price'});
  if(p.year_price!=null)r.push({l:'1 Năm',v:p.year_price,k:'year_price'});
  if(p.two_year_price!=null)r.push({l:'2 Năm',v:p.two_year_price,k:'two_year_price'});
  if(p.three_year_price!=null)r.push({l:'3 Năm',v:p.three_year_price,k:'three_year_price'});
  if(p.onetime_price!=null)r.push({l:'Trọn đời',v:p.onetime_price,k:'onetime_price'});
  return r;
}
window._buyPlan=function(id){
  var p=plans.find(function(x){return x.id===id;});if(!p)return;
  var pr=getPrices(p);if(!pr.length){toast('Chưa có giá','err');return;}
  openModal('📦 '+esc(p.name), function(box){
    box.innerHTML+='<p style="font-size:13px;color:var(--tx2);margin-bottom:12px">Chọn chu kỳ:</p>';
    // Coupon input
    box.innerHTML+='<div class="inp-group" style="margin-bottom:16px"><label class="inp-lbl">Mã giảm giá (tuỳ chọn)</label><div style="display:flex;gap:8px"><input class="inp" id="couponInp" placeholder="Nhập mã"><button class="btn btn-sm" id="couponBtn">Áp dụng</button></div><div id="couponMsg" style="font-size:12px;margin-top:4px"></div></div>';
    var couponCode=null;
    pr.forEach(function(x){
      var el=C('div');el.className='region';el.style.marginBottom='8px';
      el.innerHTML='<div class="region-ico" style="background:var(--prBg)">💰</div><div><div class="region-name">'+x.l+'</div><div style="font-size:14px;font-weight:700;color:var(--pr)">'+fmtMoney(x.v)+'</div></div>';
      el.onclick=function(){
        el.innerHTML='<span class="spin"></span>';
        var body={plan_id:id,period:x.k};if(couponCode)body.coupon_code=couponCode;
        api('/user/order/save',{method:'POST',body:body}).then(function(j){
          if(j.data){toast('✅ Đã tạo đơn hàng!');closeModal();go('order');}else toast(j.message||'Lỗi','err');
        }).catch(function(e){toast(e.message,'err');el.innerHTML='<div class="region-ico" style="background:var(--prBg)">💰</div><div><div class="region-name">'+x.l+'</div><div style="font-size:14px;font-weight:700;color:var(--pr)">'+fmtMoney(x.v)+'</div></div>';});
      };
      box.appendChild(el);
    });
    // Coupon apply
    setTimeout(function(){
      var cb=$('couponBtn');if(cb)cb.onclick=function(){
        var code=$('couponInp').value.trim();if(!code)return;
        api('/user/coupon/check',{method:'POST',body:{code:code,plan_id:id}}).then(function(j){
          if(j.data){couponCode=code;$('couponMsg').innerHTML='<span style="color:var(--ok)">✅ Giảm '+fmtMoney(j.data.value)+'</span>';}
          else $('couponMsg').innerHTML='<span style="color:var(--err)">❌ '+(j.message||'Mã không hợp lệ')+'</span>';
        }).catch(function(e){$('couponMsg').innerHTML='<span style="color:var(--err)">'+e.message+'</span>';});
      };
    },50);
  });
};

/* ══════════ ORDER ══════════ */
function pgOrder(){
  shell('Đơn hàng',loading());
  api('/user/order/fetch').then(function(j){
    var orders=j.data||[];
    if(!orders.length){$('pc').innerHTML='<div class="empty"><div class="empty-ico">🧾</div><div class="empty-txt">Chưa có đơn hàng</div></div>';return;}
    var sm={0:['Chờ thanh toán','tag-warn'],1:['Đang mở','tag-pr'],2:['Đã hủy','tag-err'],3:['Hoàn thành','tag-ok'],4:['Hoàn tiền','tag-err']};
    var html='<div class="card"><div class="card-b" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Mã đơn</th><th>Gói</th><th>Chu kỳ</th><th>Số tiền</th><th>Trạng thái</th><th>Ngày tạo</th><th></th></tr></thead><tbody>';
    orders.forEach(function(o){
      var s=sm[o.status]||['—',''];
      var period={'month_price':'Tháng','quarter_price':'Quý','half_year_price':'6 tháng','year_price':'Năm','two_year_price':'2 năm','three_year_price':'3 năm','onetime_price':'Trọn đời','reset_price':'Reset'};
      html+='<tr><td style="font-family:monospace;font-size:11px">'+esc((o.trade_no||'').substring(0,12))+'</td>'+
        '<td>'+esc(o.plan?o.plan.name:'—')+'</td>'+
        '<td style="font-size:12px">'+(period[o.period]||o.period||'—')+'</td>'+
        '<td style="font-weight:600">'+fmtMoney(o.total_amount)+'</td>'+
        '<td><span class="tag '+s[1]+'">'+s[0]+'</span></td>'+
        '<td style="font-size:12px">'+fmtDT(o.created_at)+'</td>'+
        '<td>'+(o.status===0?'<button class="btn btn-p btn-sm" onclick="window._payOrder(\''+o.trade_no+'\')">Thanh toán</button> <button class="btn btn-sm" onclick="window._cancelOrder(\''+o.trade_no+'\')">Hủy</button>':'')+'</td></tr>';
    });
    html+='</tbody></table></div></div>';$('pc').innerHTML=html;$('pc').classList.add('fade-in');
  }).catch(function(e){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+esc(e.message)+'</div></div>';});
}
window._payOrder=function(tradeNo){
  api('/user/order/getPaymentMethod').then(function(j){
    var methods=j.data||[];
    if(!methods.length){toast('Chưa cấu hình thanh toán','err');return;}
    openModal('💳 Thanh toán',function(box){
      box.innerHTML+='<p style="font-size:13px;color:var(--tx2);margin-bottom:12px">Chọn phương thức:</p>';
      methods.forEach(function(m){
        var el=C('div');el.className='region';el.style.marginBottom='8px';
        el.innerHTML='<div class="region-ico" style="background:var(--prBg)">💳</div><div><div class="region-name">'+esc(m.name)+'</div></div>';
        el.onclick=function(){
          el.innerHTML='<span class="spin"></span>';
          api('/user/order/checkout',{method:'POST',body:{trade_no:tradeNo,method:m.id}}).then(function(j){
            if(j.data){closeModal();if(j.data.type===1&&j.data.data)window.open(j.data.data);else if(j.data.type===0)toast('✅ Đã thanh toán!');else if(j.data.type===-1)window.location.href=j.data.data;pgOrder();}
            else toast(j.message||'Lỗi','err');
          }).catch(function(e){toast(e.message,'err');});
        };
        box.appendChild(el);
      });
    });
  }).catch(function(e){toast(e.message,'err');});
};
window._cancelOrder=function(tradeNo){
  if(!confirm('Hủy đơn hàng này?'))return;
  api('/user/order/cancel',{method:'POST',body:{trade_no:tradeNo}}).then(function(){toast('✅ Đã hủy');pgOrder();}).catch(function(e){toast(e.message,'err');});
};

/* ══════════ INVITE ══════════ */
function pgInvite(){
  shell('Giới thiệu',loading());
  Promise.all([api('/user/invite/fetch'),api('/user/invite/details')]).then(function(res){
    var inv=res[0].data||{},details=res[1].data||[];
    var codes=inv.codes||[];
    var html='<div class="g g3" style="margin-bottom:16px">'+
      statCard('💰',fmtMoney(inv.stat?inv.stat[0]:0),'Hoa hồng chờ')+
      statCard('✅',fmtMoney(inv.stat?inv.stat[1]:0),'Đã nhận')+
      statCard('👥',fmtMoney(inv.stat?inv.stat[2]:0),'Tổng hoa hồng')+
    '</div>';
    // Invite codes
    html+='<div class="card" style="margin-bottom:16px"><div class="card-h">🎟️ Mã giới thiệu <button class="btn btn-sm btn-p" id="genCode" style="margin-left:auto">+ Tạo mã</button></div><div class="card-b">';
    if(codes.length){codes.forEach(function(c){
      var link=window.location.origin+'/#/register?code='+c.code;
      html+='<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--bdr2)"><span style="font-family:monospace;font-size:13px;flex:1">'+esc(c.code)+'</span><button class="btn btn-sm" onclick="('+clip.toString()+')(\''+link+'\')">📋</button></div>';
    });}else html+='<p style="font-size:13px;color:var(--tx3)">Chưa có mã. Bấm "Tạo mã" để bắt đầu.</p>';
    html+='</div></div>';
    // Commission history
    if(details.length){
      html+='<div class="card"><div class="card-h">📋 Lịch sử hoa hồng</div><div class="card-b" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Đơn hàng</th><th>Hoa hồng</th><th>Trạng thái</th><th>Ngày</th></tr></thead><tbody>';
      details.forEach(function(d){
        html+='<tr><td style="font-size:12px">#'+d.order_id+'</td><td style="font-weight:600">'+fmtMoney(d.get_amount)+'</td><td><span class="tag '+(d.status?'tag-ok':'tag-warn')+'">'+(d.status?'Đã nhận':'Chờ')+'</span></td><td style="font-size:12px">'+fmtDT(d.created_at)+'</td></tr>';
      });
      html+='</tbody></table></div></div>';
    }
    $('pc').innerHTML=html;$('pc').classList.add('fade-in');
    $('genCode').onclick=function(){api('/user/invite/save').then(function(){toast('✅ Đã tạo mã!');pgInvite();}).catch(function(e){toast(e.message,'err');});};
  }).catch(function(e){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+esc(e.message)+'</div></div>';});
}

/* ══════════ TICKET ══════════ */
function pgTicket(){
  shell('Hỗ trợ',loading());
  api('/user/ticket/fetch').then(function(j){
    var tickets=j.data||[];
    var html='<div style="margin-bottom:16px"><button class="btn btn-p" id="newTicket">✏️ Tạo ticket mới</button></div>';
    if(!tickets.length){html+='<div class="empty"><div class="empty-ico">💬</div><div class="empty-txt">Chưa có ticket nào</div></div>';}
    else{
      var st={0:['Đang mở','tag-ok'],1:['Đã đóng','tag-err']};
      tickets.forEach(function(t){
        var s=st[t.status]||['—',''];
        html+='<div class="card" style="margin-bottom:10px;cursor:pointer" onclick="window._viewTicket('+t.id+')"><div class="card-b" style="display:flex;align-items:center;gap:12px">'+
          '<div style="flex:1"><div style="font-weight:600;font-size:14px">'+esc(t.subject)+'</div><div style="font-size:12px;color:var(--tx3)">'+fmtDT(t.created_at)+'</div></div>'+
          '<span class="tag '+s[1]+'">'+s[0]+'</span>'+
        '</div></div>';
      });
    }
    $('pc').innerHTML=html;$('pc').classList.add('fade-in');
    $('newTicket').onclick=function(){
      openModal('✏️ Ticket mới',function(box){
        box.innerHTML+='<div class="inp-group"><label class="inp-lbl">Tiêu đề</label><input class="inp" id="tSubject"></div>'+
          '<div class="inp-group"><label class="inp-lbl">Nội dung</label><textarea class="inp" id="tContent" rows="4"></textarea></div>'+
          '<button class="btn btn-p btn-block" id="tSubmit">Gửi ticket</button>';
        setTimeout(function(){$('tSubmit').onclick=function(){
          var subj=$('tSubject').value.trim(),cont=$('tContent').value.trim();
          if(!subj||!cont){toast('Nhập đầy đủ','err');return;}
          api('/user/ticket/save',{method:'POST',body:{subject:subj,message:cont,level:0}}).then(function(){toast('✅ Đã gửi!');closeModal();pgTicket();}).catch(function(e){toast(e.message,'err');});
        };},50);
      });
    };
  }).catch(function(e){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+esc(e.message)+'</div></div>';});
}
window._viewTicket=function(id){
  openModal('💬 Ticket #'+id,function(box){
    box.innerHTML='<div class="page-loading"><span class="spin"></span></div>';
    api('/user/ticket/fetch?id='+id).then(function(j){
      var t=j.data;if(!t){box.innerHTML='<p>Không tìm thấy</p>';return;}
      var msgs='';(t.message||[]).forEach(function(m){
        var isUser=m.is_me;
        msgs+='<div style="margin-bottom:10px;padding:10px 14px;border-radius:10px;background:'+(isUser?'var(--prBg)':'var(--bgH)')+';'+(isUser?'margin-left:24px':'margin-right:24px')+'">'+
          '<div style="font-size:11px;color:var(--tx3);margin-bottom:4px">'+(isUser?'Bạn':'Hỗ trợ')+' · '+fmtDT(m.created_at)+'</div>'+
          '<div style="font-size:13px">'+esc(m.message)+'</div></div>';
      });
      box.innerHTML='<div style="font-weight:600;margin-bottom:12px">'+esc(t.subject||'')+'</div>'+
        '<div style="max-height:300px;overflow-y:auto;margin-bottom:14px">'+msgs+'</div>'+
        (t.status===0?'<div class="inp-group"><textarea class="inp" id="tReply" rows="2" placeholder="Trả lời..."></textarea></div><div class="btn-group"><button class="btn btn-p" id="tReplyBtn">Gửi</button><button class="btn btn-d btn-sm" id="tCloseBtn">Đóng ticket</button></div>':'<p style="font-size:12px;color:var(--tx3)">Ticket đã đóng</p>');
      if(t.status===0){
        setTimeout(function(){
          $('tReplyBtn').onclick=function(){
            var msg=$('tReply').value.trim();if(!msg)return;
            api('/user/ticket/reply',{method:'POST',body:{id:id,message:msg}}).then(function(){toast('✅');window._viewTicket(id);}).catch(function(e){toast(e.message,'err');});
          };
          $('tCloseBtn').onclick=function(){
            api('/user/ticket/close',{method:'POST',body:{id:id}}).then(function(){toast('Đã đóng');closeModal();pgTicket();}).catch(function(e){toast(e.message,'err');});
          };
        },50);
      }
    }).catch(function(e){box.innerHTML='<p style="color:var(--err)">'+esc(e.message)+'</p>';});
  });
};

/* ══════════ KNOWLEDGE ══════════ */
function pgKnowledge(){
  shell('Hướng dẫn',loading());
  api('/user/knowledge/fetch').then(function(j){
    var items=j.data||[];
    if(!items.length){$('pc').innerHTML='<div class="empty"><div class="empty-ico">📚</div><div class="empty-txt">Chưa có hướng dẫn</div></div>';return;}
    var html='';
    items.forEach(function(item){
      html+='<div class="card" style="margin-bottom:10px;cursor:pointer" onclick="this.querySelector(\'.kb-body\').classList.toggle(\'show\')"><div class="card-b">'+
        '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:18px">📖</span><div style="flex:1"><div style="font-weight:600;font-size:14px">'+esc(item.title)+'</div>'+(item.category?'<div style="font-size:11px;color:var(--tx3)">'+esc(item.category.name||'')+'</div>':'')+'</div><span style="color:var(--tx3)">▼</span></div>'+
        '<div class="kb-body" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--bdr2);font-size:13px;line-height:1.7">'+(item.body||'')+'</div>'+
      '</div></div>';
    });
    $('pc').innerHTML=html;$('pc').classList.add('fade-in');
    // Toggle body on click
    $('pc').querySelectorAll('.kb-body').forEach(function(el){el.closest('.card').onclick=function(e){
      el.style.display=el.style.display==='none'?'block':'none';
    };});
  }).catch(function(e){$('pc').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+esc(e.message)+'</div></div>';});
}

/* ══════════ PROFILE ══════════ */
function pgProfile(){
  shell('Tài khoản',loading());
  loadUser(function(){
    var used=(user.u||0)+(user.d||0);
    $('pc').innerHTML='<div class="g g2">'+
    // Account info
    '<div class="card"><div class="card-h">👤 Thông tin</div><div class="card-b">'+
      infoRow('Email',user.email)+infoRow('UUID',user.uuid||'—')+infoRow('Gói',user.plan?user.plan.name:'—')+infoRow('Hết hạn',fmtD(user.expired_at))+infoRow('Data',fmtB(used)+' / '+fmtB(user.transfer_enable))+infoRow('Thiết bị',(user.alive_ip||0)+' / '+(user.device_limit||'∞'))+
    '</div></div>'+
    // Change password
    '<div><div class="card" style="margin-bottom:16px"><div class="card-h">🔒 Đổi mật khẩu</div><div class="card-b">'+
      '<div class="inp-group"><label class="inp-lbl">Mật khẩu cũ</label><input class="inp" type="password" id="oldPw"></div>'+
      '<div class="inp-group"><label class="inp-lbl">Mật khẩu mới</label><input class="inp" type="password" id="newPw"></div>'+
      '<button class="btn btn-p" id="cpwBtn">Đổi mật khẩu</button>'+
    '</div></div>'+
    // Gift card
    '<div class="card" style="margin-bottom:16px"><div class="card-h">🎁 Đổi Gift Card</div><div class="card-b">'+
      '<div style="display:flex;gap:8px"><input class="inp" id="gcInp" placeholder="Nhập mã gift card"><button class="btn btn-p" id="gcBtn">Đổi</button></div>'+
    '</div></div>'+
    // Reset subscription
    '<div class="card"><div class="card-h">🔄 Khác</div><div class="card-b">'+
      '<button class="btn" id="resetBtn" style="margin-right:8px">🔄 Reset link đăng ký</button>'+
      '<button class="btn" onclick="window._showSessions()">📱 Phiên đăng nhập</button>'+
    '</div></div></div></div>';
    $('pc').classList.add('fade-in');
    $('cpwBtn').onclick=function(){
      var o=$('oldPw').value,n=$('newPw').value;if(!o||!n){toast('Nhập đầy đủ','err');return;}
      api('/user/changePassword',{method:'POST',body:{old_password:o,new_password:n}}).then(function(){toast('✅ Đã đổi');$('oldPw').value='';$('newPw').value='';}).catch(function(e){toast(e.message,'err');});
    };
    $('gcBtn').onclick=function(){
      var code=$('gcInp').value.trim();if(!code)return;
      api('/user/redeemgiftcard',{method:'POST',body:{code:code}}).then(function(){toast('✅ Đổi thành công!');$('gcInp').value='';}).catch(function(e){toast(e.message,'err');});
    };
    $('resetBtn').onclick=function(){
      if(!confirm('Reset link đăng ký? Link cũ sẽ mất hiệu lực.'))return;
      api('/user/resetSecurity').then(function(){toast('✅ Đã reset');subData=null;user=null;}).catch(function(e){toast(e.message,'err');});
    };
  });
}
function infoRow(l,v){return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bdr2);font-size:13px"><span style="color:var(--tx2)">'+l+'</span><span style="font-weight:600;word-break:break-all;text-align:right;max-width:60%">'+esc(v||'')+'</span></div>';}
window._showSessions=function(){
  openModal('📱 Phiên đăng nhập',function(box){
    box.innerHTML='<div class="page-loading"><span class="spin"></span></div>';
    api('/user/getActiveSession').then(function(j){
      var ss=j.data||[];if(!ss.length){box.innerHTML='<p style="color:var(--tx3)">Không có phiên nào</p>';return;}
      var html='';ss.forEach(function(s){
        html+='<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bdr2)">'+
          '<div style="flex:1"><div style="font-size:13px;font-weight:500">'+esc(s.ip||'—')+'</div><div style="font-size:11px;color:var(--tx3)">'+fmtDT(s.created_at)+'</div></div>'+
          '<button class="btn btn-sm btn-d" onclick="window._removeSession(\''+s.session_id+'\')">Xóa</button></div>';
      });
      box.innerHTML=html;
    }).catch(function(e){box.innerHTML='<p style="color:var(--err)">'+e.message+'</p>';});
  });
};
window._removeSession=function(sid){
  api('/user/removeActiveSession',{method:'POST',body:{session_id:sid}}).then(function(){toast('✅ Đã xóa');window._showSessions();}).catch(function(e){toast(e.message,'err');});
};

/* ══════════ MODAL HELPERS ══════════ */
var modalOv=null;
function openModal(title,buildFn){
  if(modalOv)modalOv.remove();
  modalOv=C('div');modalOv.className='ov';
  var m=C('div');m.className='modal';
  m.innerHTML='<div class="modal-h">'+title+'<button class="modal-close" id="mClose">✕</button></div>';
  buildFn(m);
  modalOv.appendChild(m);document.body.appendChild(modalOv);
  requestAnimationFrame(function(){modalOv.classList.add('show');});
  modalOv.querySelector('#mClose').onclick=closeModal;
  modalOv.onclick=function(e){if(e.target===modalOv)closeModal();};
}
function closeModal(){if(!modalOv)return;modalOv.classList.remove('show');setTimeout(function(){if(modalOv){modalOv.remove();modalOv=null;}},200);}

/* ══════════ DATA LOADERS ══════════ */
function loadUser(cb){if(user){cb();return;}api('/user/getSubscribe').then(function(j){user=j.data;cb();}).catch(function(e){if((e.message||'').indexOf('登录')!==-1||(e.message||'').indexOf('403')!==-1){logout();return;}toast(e.message,'err');});}
function loadSub(cb){if(subData){cb();return;}api('/user/getSubscribe').then(function(j){subData=j.data;user=j.data;cb();}).catch(function(e){if((e.message||'').indexOf('登录')!==-1||(e.message||'').indexOf('403')!==-1){logout();return;}toast(e.message,'err');});}
function loadPlans(cb){if(plans){cb();return;}api('/user/plan/fetch').then(function(j){plans=j.data||[];cb();}).catch(function(e){toast(e.message,'err');});}

/* ══════════ INIT ══════════ */
route();
})();
