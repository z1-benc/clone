/**
 * TNETZ — Complete Custom SPA
 * Vanilla JS • Hash Routing • V2Board API
 */
(function(){
'use strict';
var $=document.getElementById.bind(document);
var C=document.createElement.bind(document);

/* ══════════ CONFIG ══════════ */
var SITE=window.v2board||{};
var API='/api/v1';

/* ══════════ STATE ══════════ */
var user=null,subData=null,plans=null;

/* ══════════ AUTH ══════════ */
function tk(){return localStorage.getItem('auth_data')||'';}
function logged(){return !!tk();}
function headers(){return {'authorization':tk(),'Content-Type':'application/json'};}
function logout(){localStorage.removeItem('auth_data');go('login');}

/* ══════════ API ══════════ */
function api(path,opts){
  opts=opts||{};
  var h={'authorization':tk()};
  if(opts.body)h['Content-Type']='application/json';
  return fetch(API+path,{method:opts.method||'GET',headers:h,body:opts.body?JSON.stringify(opts.body):undefined})
    .then(function(r){return r.json();})
    .then(function(j){if(j.message&&!j.data)throw new Error(j.message);return j;});
}

/* ══════════ TOAST ══════════ */
var toastEl=null,toastTmr=null;
function toast(msg,type){
  if(!toastEl){toastEl=C('div');toastEl.className='toast';document.body.appendChild(toastEl);}
  toastEl.textContent=msg;
  toastEl.className='toast toast-'+(type||'ok')+' show';
  clearTimeout(toastTmr);
  toastTmr=setTimeout(function(){toastEl.classList.remove('show');},2500);
}

/* ══════════ HELPERS ══════════ */
function esc(s){var d=C('div');d.textContent=s;return d.innerHTML;}
function fmtBytes(b){if(!b||b<=0)return '0 B';var u=['B','KB','MB','GB','TB'];var i=Math.floor(Math.log(b)/Math.log(1024));return (b/Math.pow(1024,i)).toFixed(i>1?2:0)+' '+u[i];}
function fmtDate(ts){if(!ts)return '—';var d=new Date(ts*1000);return d.getFullYear()+'-'+(d.getMonth()+1<10?'0':'')+(d.getMonth()+1)+'-'+(d.getDate()<10?'0':'')+d.getDate();}
function clip(t){if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast('✅ Đã sao chép');});
else{var a=C('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px';document.body.appendChild(a);a.select();document.execCommand('copy');document.body.removeChild(a);toast('✅ Đã sao chép');}}

/* ══════════ THEME ══════════ */
var theme=localStorage.getItem('tz-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
document.documentElement.setAttribute('data-theme',theme);
function toggleTheme(){
  theme=theme==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',theme);
  localStorage.setItem('tz-theme',theme);
  var b=$('themeBtn');if(b)b.textContent=theme==='dark'?'☀️':'🌙';
}

/* ══════════ ROUTER ══════════ */
var routes={login:pgLogin,register:pgRegister,dash:pgDash,subscribe:pgSub,plan:pgPlan,order:pgOrder,profile:pgProfile};
var currentPage='';
function go(page){window.location.hash='#/'+page;}
function route(){
  var h=(window.location.hash||'#/').replace('#/','').split('?')[0]||'dash';
  if(!logged()&&h!=='login'&&h!=='register'){go('login');return;}
  if(logged()&&(h==='login'||h==='register')){go('dash');return;}
  currentPage=h;
  var fn=routes[h];
  if(fn)fn();else pgDash();
}
window.addEventListener('hashchange',route);

/* ══════════ SHELL ══════════ */
function shell(pageTitle,content){
  var app=$('app');
  app.innerHTML='<div class="shell">'+
    '<nav class="nav" id="nav">'+
      '<div class="nav-brand"><div class="dot">⚡</div><h1>'+esc(SITE.title||'TNETZ')+'</h1></div>'+
      '<div class="nav-links">'+
        navLink('dash','📊','Tổng quan')+
        navLink('subscribe','🔗','Đăng ký')+
        navLink('plan','📦','Gói dịch vụ')+
        navLink('order','🧾','Đơn hàng')+
        navLink('profile','👤','Tài khoản')+
      '</div>'+
      '<div class="nav-footer">'+
        '<button class="nav-link" onclick="('+logout.toString()+')()"><span class="ico">🚪</span>Đăng xuất</button>'+
      '</div>'+
    '</nav>'+
    '<div class="main">'+
      '<div class="topbar">'+
        '<button class="menu-btn" id="menuBtn">☰</button>'+
        '<div class="topbar-title">'+esc(pageTitle)+'</div>'+
        '<div class="topbar-user"><div class="topbar-avatar">'+((user&&user.email)?user.email[0].toUpperCase():'U')+'</div><span>'+esc(user?user.email:'')+'</span></div>'+
      '</div>'+
      '<div class="page fade-in" id="pageContent">'+content+'</div>'+
    '</div>'+
  '</div>'+
  '<button id="themeBtn" onclick="('+toggleTheme.toString()+')">'+(theme==='dark'?'☀️':'🌙')+'</button>';

  // Mobile menu
  var mb=$('menuBtn');if(mb)mb.onclick=function(){$('nav').classList.toggle('open');};
  // Theme button
  var tb=$('themeBtn');if(tb)tb.onclick=toggleTheme;
  // Close nav on link click (mobile)
  app.querySelectorAll('.nav-link[data-p]').forEach(function(l){l.onclick=function(){$('nav').classList.remove('open');go(this.dataset.p);};});
}
function navLink(p,ico,txt){return '<button class="nav-link'+(currentPage===p?' on':'')+'" data-p="'+p+'"><span class="ico">'+ico+'</span>'+txt+'</button>';}

/* ══════════ PAGE: LOGIN ══════════ */
function pgLogin(){
  $('app').innerHTML='<div class="login-wrap fade-in">'+
    '<div class="login-box">'+
      '<div class="login-header"><div class="login-logo">⚡</div><h1>'+esc(SITE.title||'TNETZ')+'</h1><p>'+(SITE.description||'Đăng nhập để tiếp tục')+'</p></div>'+
      '<div class="login-card">'+
        '<div class="inp-group"><label class="inp-lbl">Email</label><input class="inp" id="loginEmail" type="email" placeholder="email@example.com"></div>'+
        '<div class="inp-group"><label class="inp-lbl">Mật khẩu</label><input class="inp" id="loginPw" type="password" placeholder="••••••••"></div>'+
        '<button class="btn btn-p btn-block" id="loginBtn" style="height:44px;font-size:14px;margin-top:4px">Đăng nhập</button>'+
      '</div>'+
      '<div class="login-switch">Chưa có tài khoản? <a href="#/register">Đăng ký</a></div>'+
    '</div>'+
  '</div>'+
  '<button id="themeBtn" onclick="">🌙</button>';
  $('themeBtn').textContent=theme==='dark'?'☀️':'🌙';
  $('themeBtn').onclick=toggleTheme;
  $('loginBtn').onclick=doLogin;
  $('loginPw').onkeydown=function(e){if(e.key==='Enter')doLogin();};
}
function doLogin(){
  var email=$('loginEmail').value.trim();
  var pw=$('loginPw').value;
  if(!email||!pw){toast('Vui lòng nhập email và mật khẩu','err');return;}
  $('loginBtn').innerHTML='<span class="spin"></span>';
  fetch(API+'/passport/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,password:pw})})
    .then(function(r){return r.json();})
    .then(function(j){
      if(j.data&&j.data.auth_data){localStorage.setItem('auth_data',j.data.auth_data);user=null;subData=null;go('dash');}
      else{toast(j.message||'Đăng nhập thất bại','err');$('loginBtn').textContent='Đăng nhập';}
    }).catch(function(e){toast('Lỗi: '+e.message,'err');$('loginBtn').textContent='Đăng nhập';});
}

/* ══════════ PAGE: REGISTER ══════════ */
function pgRegister(){
  $('app').innerHTML='<div class="login-wrap fade-in">'+
    '<div class="login-box">'+
      '<div class="login-header"><div class="login-logo">⚡</div><h1>Tạo tài khoản</h1><p>Đăng ký để sử dụng dịch vụ</p></div>'+
      '<div class="login-card">'+
        '<div class="inp-group"><label class="inp-lbl">Email</label><input class="inp" id="regEmail" type="email" placeholder="email@example.com"></div>'+
        '<div class="inp-group"><label class="inp-lbl">Mật khẩu</label><input class="inp" id="regPw" type="password" placeholder="Ít nhất 8 ký tự"></div>'+
        '<div class="inp-group"><label class="inp-lbl">Mã mời (tuỳ chọn)</label><input class="inp" id="regInvite" placeholder="Nhập mã mời nếu có"></div>'+
        '<button class="btn btn-p btn-block" id="regBtn" style="height:44px;font-size:14px;margin-top:4px">Đăng ký</button>'+
      '</div>'+
      '<div class="login-switch">Đã có tài khoản? <a href="#/login">Đăng nhập</a></div>'+
    '</div>'+
  '</div>'+
  '<button id="themeBtn">🌙</button>';
  $('themeBtn').textContent=theme==='dark'?'☀️':'🌙';$('themeBtn').onclick=toggleTheme;
  $('regBtn').onclick=function(){
    var email=$('regEmail').value.trim(),pw=$('regPw').value,inv=$('regInvite').value.trim();
    if(!email||!pw){toast('Vui lòng nhập đầy đủ','err');return;}
    $('regBtn').innerHTML='<span class="spin"></span>';
    var body={email:email,password:pw};if(inv)body.invite_code=inv;
    fetch(API+'/passport/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json();})
      .then(function(j){
        if(j.data&&j.data.auth_data){localStorage.setItem('auth_data',j.data.auth_data);go('dash');}
        else{toast(j.message||'Đăng ký thất bại','err');$('regBtn').textContent='Đăng ký';}
      }).catch(function(e){toast('Lỗi: '+e.message,'err');$('regBtn').textContent='Đăng ký';});
  };
}

/* ══════════ PAGE: DASHBOARD ══════════ */
function pgDash(){
  shell('Tổng quan','<div class="page-loading"><span class="spin"></span></div>');
  loadUser(function(){
    var p=user.plan;
    var usedPct=0;if(user.transfer_enable>0)usedPct=Math.round(((user.u||0)+(user.d||0))/user.transfer_enable*100);
    var used=(user.u||0)+(user.d||0);
    var pc=$('pageContent');
    pc.innerHTML='<div class="g g2" style="margin-bottom:20px">'+
      '<div class="card"><div class="stat"><div class="stat-ico">📦</div><div class="stat-val">'+esc(p?p.name:'Chưa có')+'</div><div class="stat-lbl">Gói hiện tại</div></div></div>'+
      '<div class="card"><div class="stat"><div class="stat-ico">📅</div><div class="stat-val">'+fmtDate(user.expired_at)+'</div><div class="stat-lbl">Hết hạn</div></div></div>'+
    '</div>'+
    '<div class="g g4" style="margin-bottom:20px">'+
      '<div class="card"><div class="stat"><div class="stat-val" style="color:var(--pr)">'+fmtBytes(used)+'</div><div class="stat-lbl">Đã dùng</div></div></div>'+
      '<div class="card"><div class="stat"><div class="stat-val">'+fmtBytes(user.transfer_enable)+'</div><div class="stat-lbl">Tổng data</div></div></div>'+
      '<div class="card"><div class="stat"><div class="stat-val">'+usedPct+'%</div><div class="stat-lbl">Sử dụng</div></div></div>'+
      '<div class="card"><div class="stat"><div class="stat-val">'+(user.alive_ip||0)+'</div><div class="stat-lbl">Thiết bị online</div></div></div>'+
    '</div>'+
    '<div class="g g2">'+
      '<div class="card" style="cursor:pointer" onclick="window.location.hash=\'#/subscribe\'"><div class="card-b" style="display:flex;align-items:center;gap:12px"><span style="font-size:28px">🔗</span><div><div style="font-weight:600">Đăng ký & Khu vực</div><div style="font-size:12px;color:var(--tx2)">Lấy link đăng ký, đồng bộ app</div></div></div></div>'+
      '<div class="card" style="cursor:pointer" onclick="window.location.hash=\'#/plan\'"><div class="card-b" style="display:flex;align-items:center;gap:12px"><span style="font-size:28px">📦</span><div><div style="font-weight:600">Mua gói / Gia hạn</div><div style="font-size:12px;color:var(--tx2)">Xem gói dịch vụ có sẵn</div></div></div></div>'+
    '</div>';
    pc.classList.add('fade-in');
  });
}

/* ══════════ PAGE: SUBSCRIBE ══════════ */
function pgSub(){
  shell('Đăng ký','<div class="page-loading"><span class="spin"></span></div>');
  loadSub(function(){
    var d=subData;
    var urls=d.subscribe_urls||[];
    if(!urls.length&&d.subscribe_url)urls=[{name:'Mặc định',url:d.subscribe_url,icon:'🌐'}];
    var pc=$('pageContent');

    // Main URL section
    var html='<div class="card" style="margin-bottom:16px"><div class="card-h">🔗 Link đăng ký</div><div class="card-b">'+
      '<div class="sub-url"><input class="inp" value="'+esc(d.subscribe_url||'')+'" readonly id="subUrlInput"><button class="btn btn-p" id="copyUrlBtn">📋 Sao chép</button></div>'+
    '</div></div>';

    // Region selector
    if(urls.length>0){
      html+='<div class="card" style="margin-bottom:16px"><div class="card-h">🌍 Chọn khu vực</div><div class="card-b"><div id="regionList">';
      urls.forEach(function(r,i){
        var ic=r.icon||flag(r.name);
        var dom='';try{dom=new URL(r.url.split('?')[0]).hostname;}catch(e){dom='';}
        html+='<div class="region" data-idx="'+i+'"><div class="region-ico">'+ic+'</div><div><div class="region-name">'+esc(r.name)+'</div>'+(dom?'<div class="region-dom">'+esc(dom)+'</div>':'')+'</div></div>';
      });
      html+='</div></div></div>';

      // App shortcuts (hidden until region selected)
      html+='<div class="card" id="appCard" style="display:none;margin-bottom:16px"><div class="card-h">📱 Phím tắt ứng dụng</div><div class="card-b"><div class="sub-apps" id="appGrid"></div></div></div>';
    }

    pc.innerHTML=html;
    pc.classList.add('fade-in');

    // Copy button
    var cb=$('copyUrlBtn');if(cb)cb.onclick=function(){clip($('subUrlInput').value);};

    // Region click handlers
    var regionEls=pc.querySelectorAll('.region');
    regionEls.forEach(function(el){
      el.onclick=function(){
        regionEls.forEach(function(x){x.classList.remove('on');});
        el.classList.add('on');
        var idx=parseInt(el.dataset.idx);
        var url=urls[idx].url;
        showApps(url);
        $('subUrlInput').value=url;
      };
    });
  });
}
function showApps(url){
  var ac=$('appCard');if(!ac)return;
  ac.style.display='';
  var grid=$('appGrid');
  var t=SITE.title||'VPN';
  var shortcuts=[
    {n:'Shadowrocket',i:'🚀',h:'shadowrocket://add/sub://'+btoa(url+'&flag=shadowrocket')},
    {n:'Clash',i:'⚡',h:'clash://install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},
    {n:'ClashMeta',i:'🔥',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=meta')+'&name='+encodeURIComponent(t)},
    {n:'Surge',i:'🌊',h:'surge:///install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},
    {n:'QuantumultX',i:'⚙️',h:'quantumult-x:///update-configuration?remote-resource='+encodeURIComponent(JSON.stringify({server_remote:[url+', tag='+t]}))},
    {n:'Stash',i:'📦',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=stash')+'&name='+encodeURIComponent(t)}
  ];
  grid.innerHTML='';
  shortcuts.forEach(function(s){
    var a=C('a');a.className='sub-app';a.href=s.h;
    a.innerHTML='<span class="ico">'+s.i+'</span>'+s.n;
    grid.appendChild(a);
  });
  // Copy button
  var cp=C('a');cp.className='sub-app';cp.href='#';
  cp.innerHTML='<span class="ico">📋</span>Sao chép link';
  cp.onclick=function(e){e.preventDefault();clip(url);};
  grid.appendChild(cp);
}

/* ══════════ PAGE: PLAN ══════════ */
function pgPlan(){
  shell('Gói dịch vụ','<div class="page-loading"><span class="spin"></span></div>');
  loadPlans(function(){
    var pc=$('pageContent');
    if(!plans||!plans.length){pc.innerHTML='<div class="empty"><div class="empty-ico">📦</div><div class="empty-txt">Chưa có gói dịch vụ nào</div></div>';return;}
    var html='<div class="g g3">';
    plans.forEach(function(p,i){
      var prices=[];
      if(p.month_price!==null&&p.month_price!==undefined)prices.push({label:'Tháng',val:p.month_price,period:'month_price'});
      if(p.quarter_price!==null&&p.quarter_price!==undefined)prices.push({label:'Quý',val:p.quarter_price,period:'quarter_price'});
      if(p.half_year_price!==null&&p.half_year_price!==undefined)prices.push({label:'6 tháng',val:p.half_year_price,period:'half_year_price'});
      if(p.year_price!==null&&p.year_price!==undefined)prices.push({label:'Năm',val:p.year_price,period:'year_price'});
      if(p.two_year_price!==null&&p.two_year_price!==undefined)prices.push({label:'2 năm',val:p.two_year_price,period:'two_year_price'});
      if(p.three_year_price!==null&&p.three_year_price!==undefined)prices.push({label:'3 năm',val:p.three_year_price,period:'three_year_price'});
      if(p.onetime_price!==null&&p.onetime_price!==undefined)prices.push({label:'Trọn đời',val:p.onetime_price,period:'onetime_price'});
      var lowest=prices.length?prices[0]:null;
      html+='<div class="plan'+(i===0?' hot':'')+'" data-plan="'+p.id+'">'+
        '<div class="plan-name">'+esc(p.name)+'</div>'+
        '<div class="plan-price">'+(lowest?(lowest.val/100).toLocaleString()+'đ':'Liên hệ')+'<small>'+(lowest?' / '+lowest.label:'')+'</small></div>'+
        '<div class="plan-desc">'+(p.content?esc(p.content).replace(/\n/g,'<br>'):'')+'</div>'+
        '<ul class="plan-feat">'+
          '<li>Data: '+fmtBytes(p.transfer_enable)+'</li>'+
          (p.device_limit?'<li>Thiết bị: '+p.device_limit+'</li>':'')+
          (p.speed_limit?'<li>Tốc độ: '+p.speed_limit+' Mbps</li>':'')+
        '</ul>'+
        '<button class="btn btn-p btn-block" onclick="buyPlan('+p.id+')">Mua ngay</button>'+
      '</div>';
    });
    html+='</div>';
    pc.innerHTML=html;
    pc.classList.add('fade-in');
  });
}
window.buyPlan=function(planId){
  var p=plans.find(function(x){return x.id===planId;});
  if(!p)return;
  // Show period selection modal
  var prices=[];
  if(p.month_price!==null&&p.month_price!==undefined)prices.push({label:'1 Tháng',val:p.month_price,period:'month_price'});
  if(p.quarter_price!==null&&p.quarter_price!==undefined)prices.push({label:'3 Tháng (Quý)',val:p.quarter_price,period:'quarter_price'});
  if(p.half_year_price!==null&&p.half_year_price!==undefined)prices.push({label:'6 Tháng',val:p.half_year_price,period:'half_year_price'});
  if(p.year_price!==null&&p.year_price!==undefined)prices.push({label:'1 Năm',val:p.year_price,period:'year_price'});
  if(p.onetime_price!==null&&p.onetime_price!==undefined)prices.push({label:'Trọn đời',val:p.onetime_price,period:'onetime_price'});
  if(!prices.length){toast('Gói này chưa có giá','err');return;}

  var ov=C('div');ov.className='ov';
  var html='<div class="modal"><div class="modal-h">📦 '+esc(p.name)+'<button class="modal-close" id="closeModal">✕</button></div>';
  html+='<p style="font-size:13px;color:var(--tx2);margin-bottom:16px">Chọn chu kỳ thanh toán:</p>';
  prices.forEach(function(pr){
    html+='<div class="region" data-period="'+pr.period+'" style="margin-bottom:8px"><div class="region-ico" style="background:var(--prBg)">💰</div><div><div class="region-name">'+pr.label+'</div><div style="font-size:13px;font-weight:700;color:var(--pr)">'+(pr.val/100).toLocaleString()+'đ</div></div></div>';
  });
  html+='</div>';
  ov.innerHTML=html;
  document.body.appendChild(ov);
  requestAnimationFrame(function(){ov.classList.add('show');});
  ov.querySelector('#closeModal').onclick=function(){ov.classList.remove('show');setTimeout(function(){ov.remove();},200);};
  ov.onclick=function(e){if(e.target===ov){ov.classList.remove('show');setTimeout(function(){ov.remove();},200);}};
  ov.querySelectorAll('.region').forEach(function(el){
    el.onclick=function(){
      var period=el.dataset.period;
      el.innerHTML='<span class="spin"></span>';
      api('/user/order/save',{method:'POST',body:{plan_id:planId,period:period}})
        .then(function(j){
          if(j.data){toast('✅ Đã tạo đơn hàng!');ov.classList.remove('show');setTimeout(function(){ov.remove();go('order');},300);}
          else toast(j.message||'Lỗi tạo đơn','err');
        }).catch(function(e){toast(e.message,'err');});
    };
  });
};

/* ══════════ PAGE: ORDERS ══════════ */
function pgOrder(){
  shell('Đơn hàng','<div class="page-loading"><span class="spin"></span></div>');
  api('/user/order/fetch').then(function(j){
    var pc=$('pageContent');
    var orders=j.data||[];
    if(!orders.length){pc.innerHTML='<div class="empty"><div class="empty-ico">🧾</div><div class="empty-txt">Chưa có đơn hàng nào</div></div>';return;}
    var statusMap={0:['Chờ thanh toán','tag-warn'],1:['Đã thanh toán','tag-ok'],2:['Đã hủy','tag-err'],3:['Hoàn thành','tag-ok'],4:['Giảm giá','tag-pr']};
    var html='<div class="card"><table class="tbl"><thead><tr><th>Mã đơn</th><th>Gói</th><th>Số tiền</th><th>Trạng thái</th><th>Ngày tạo</th></tr></thead><tbody>';
    orders.forEach(function(o){
      var s=statusMap[o.status]||['—',''];
      html+='<tr>'+
        '<td style="font-family:monospace;font-size:12px">'+esc(o.trade_no||'—')+'</td>'+
        '<td>'+esc(o.plan?o.plan.name:(o.plan_id||'—'))+'</td>'+
        '<td style="font-weight:600">'+(o.total_amount?(o.total_amount/100).toLocaleString()+'đ':'—')+'</td>'+
        '<td><span class="tag '+s[1]+'">'+s[0]+'</span></td>'+
        '<td>'+fmtDate(o.created_at)+'</td>'+
      '</tr>';
    });
    html+='</tbody></table></div>';
    pc.innerHTML=html;
    pc.classList.add('fade-in');
  }).catch(function(e){
    $('pageContent').innerHTML='<div class="empty"><div class="empty-ico">❌</div><div class="empty-txt">'+esc(e.message)+'</div></div>';
  });
}

/* ══════════ PAGE: PROFILE ══════════ */
function pgProfile(){
  shell('Tài khoản','<div class="page-loading"><span class="spin"></span></div>');
  loadUser(function(){
    var pc=$('pageContent');
    pc.innerHTML='<div class="g g2">'+
      '<div class="card"><div class="card-h">👤 Thông tin tài khoản</div><div class="card-b">'+
        '<div style="margin-bottom:12px"><span style="font-size:12px;color:var(--tx2)">Email</span><div style="font-weight:600">'+esc(user.email)+'</div></div>'+
        '<div style="margin-bottom:12px"><span style="font-size:12px;color:var(--tx2)">UUID</span><div style="font-family:monospace;font-size:12px;word-break:break-all">'+esc(user.uuid||'—')+'</div></div>'+
        '<div style="margin-bottom:12px"><span style="font-size:12px;color:var(--tx2)">Gói</span><div style="font-weight:600">'+esc(user.plan?user.plan.name:'Chưa có')+'</div></div>'+
        '<div><span style="font-size:12px;color:var(--tx2)">Hết hạn</span><div style="font-weight:600">'+fmtDate(user.expired_at)+'</div></div>'+
      '</div></div>'+
      '<div class="card"><div class="card-h">🔒 Đổi mật khẩu</div><div class="card-b">'+
        '<div class="inp-group"><label class="inp-lbl">Mật khẩu cũ</label><input class="inp" type="password" id="oldPw"></div>'+
        '<div class="inp-group"><label class="inp-lbl">Mật khẩu mới</label><input class="inp" type="password" id="newPw"></div>'+
        '<button class="btn btn-p" id="changePwBtn">Đổi mật khẩu</button>'+
      '</div></div>'+
    '</div>';
    pc.classList.add('fade-in');
    $('changePwBtn').onclick=function(){
      var old=$('oldPw').value,nw=$('newPw').value;
      if(!old||!nw){toast('Nhập đầy đủ mật khẩu','err');return;}
      api('/user/changePassword',{method:'POST',body:{old_password:old,new_password:nw}})
        .then(function(){toast('✅ Đổi mật khẩu thành công');$('oldPw').value='';$('newPw').value='';})
        .catch(function(e){toast(e.message,'err');});
    };
  });
}

/* ══════════ DATA LOADERS ══════════ */
function loadUser(cb){
  if(user){cb();return;}
  api('/user/getSubscribe').then(function(j){user=j.data;cb();}).catch(function(e){
    if(e.message&&e.message.indexOf('登录')!==-1||e.message&&e.message.indexOf('403')!==-1){logout();return;}
    toast('Lỗi tải dữ liệu: '+e.message,'err');
  });
}
function loadSub(cb){
  if(subData){cb();return;}
  api('/user/getSubscribe').then(function(j){subData=j.data;user=j.data;cb();}).catch(function(e){
    if(e.message&&e.message.indexOf('登录')!==-1||e.message&&e.message.indexOf('403')!==-1){logout();return;}
    toast('Lỗi: '+e.message,'err');
  });
}
function loadPlans(cb){
  if(plans){cb();return;}
  api('/user/plan/fetch').then(function(j){plans=j.data||[];cb();}).catch(function(e){toast('Lỗi: '+e.message,'err');});
}

/* ══════════ REGION FLAG HELPER ══════════ */
var FLAGS={'default':'🌐','china':'🇨🇳','trung':'🇨🇳','russia':'🇷🇺','nga':'🇷🇺','vietnam':'🇻🇳','việt':'🇻🇳','japan':'🇯🇵','nhật':'🇯🇵','korea':'🇰🇷','hàn':'🇰🇷','us':'🇺🇸','mỹ':'🇺🇸','singapore':'🇸🇬','hong kong':'🇭🇰','taiwan':'🇹🇼'};
function flag(n){var l=(n||'').toLowerCase();for(var k in FLAGS)if(l.indexOf(k)!==-1)return FLAGS[k];return '🌍';}

/* ══════════ INIT ══════════ */
route();
})();
