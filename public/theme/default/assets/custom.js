/**
 * TNETZ — Region Selector + App Shortcuts
 * Built from scratch with verified auth_data key
 */
(function() {
  'use strict';

  /* ══════════ CSS ══════════ */
  var css = document.createElement('style');
  css.textContent = [
    '.tnetz-overlay{position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s}',
    '.tnetz-overlay.show{opacity:1}',
    '.tnetz-box{background:#fff;border-radius:20px;padding:24px;width:460px;max-width:94vw;max-height:88vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.15);transform:scale(.96) translateY(8px);transition:transform .25s}',
    '.tnetz-overlay.show .tnetz-box{transform:none}',
    '.tnetz-hdr{display:flex;align-items:center;gap:12px;margin-bottom:18px}',
    '.tnetz-hdr-ico{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;flex-shrink:0}',
    '.tnetz-hdr-t{font:700 17px/1.3 Inter,system-ui,sans-serif;color:#0f172a}',
    '.tnetz-hdr-s{font:500 12px/1.3 Inter,system-ui,sans-serif;color:#94a3b8;margin-top:2px}',
    '.tnetz-lbl{font:700 12px/1 Inter,system-ui,sans-serif;color:#6366f1;text-transform:uppercase;letter-spacing:.06em;margin:14px 0 8px;display:flex;align-items:center;gap:6px}',
    '.tnetz-lbl span{color:#94a3b8;font-weight:500;text-transform:none;letter-spacing:0;font-size:12px}',
    '.tnetz-rc{background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:11px 14px;margin-bottom:6px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:10px}',
    '.tnetz-rc:hover{border-color:#818cf8;background:#f5f3ff}',
    '.tnetz-rc.on{border-color:#6366f1;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 4px 14px rgba(99,102,241,.25)}',
    '.tnetz-rc.on *{color:#fff!important}',
    '.tnetz-rc-i{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;background:rgba(99,102,241,.08)}',
    '.tnetz-rc.on .tnetz-rc-i{background:rgba(255,255,255,.2)}',
    '.tnetz-rc-n{font:600 13px/1.3 Inter,system-ui,sans-serif;color:#1e293b}',
    '.tnetz-rc-d{font:400 10px/1.3 monospace;color:#94a3b8;margin-top:1px}',
    '.tnetz-apps{display:none;margin-top:14px;border-top:1px solid #e2e8f0;padding-top:14px}',
    '.tnetz-apps.show{display:block}',
    '.tnetz-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}',
    '.tnetz-app{display:flex;align-items:center;gap:9px;padding:11px 13px;border:2px solid #e2e8f0;border-radius:11px;background:#fff;cursor:pointer;transition:all .18s;text-decoration:none;color:#1e293b;font:600 12.5px/1 Inter,system-ui,sans-serif}',
    '.tnetz-app:hover{border-color:#6366f1;background:#f5f3ff;transform:translateY(-1px)}',
    '.tnetz-app-i{font-size:18px;flex-shrink:0}',
    '.tnetz-copy{grid-column:1/-1;justify-content:center;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-color:transparent;font-size:13.5px;padding:13px;box-shadow:0 4px 12px rgba(99,102,241,.25)}',
    '.tnetz-copy:hover{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-color:transparent;color:#fff;box-shadow:0 6px 20px rgba(99,102,241,.35)}',
    '.tnetz-close{width:100%;padding:11px;border:none;border-radius:11px;background:#f1f5f9;color:#475569;font:600 13px Inter,system-ui,sans-serif;cursor:pointer;margin-top:10px;transition:background .15s}',
    '.tnetz-close:hover{background:#e2e8f0}',
    '.tnetz-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(18px);background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:11px 26px;border-radius:11px;font:600 13px Inter,system-ui,sans-serif;z-index:10001;box-shadow:0 6px 20px rgba(16,185,129,.3);opacity:0;transition:all .25s;pointer-events:none}',
    '.tnetz-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}',
    '.tnetz-widget{background:linear-gradient(135deg,#0ea5e9,#6366f1 50%,#8b5cf6);border-radius:14px;padding:16px 20px;margin:14px 0;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;box-shadow:0 4px 16px rgba(99,102,241,.2)}',
    '.tnetz-widget:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(99,102,241,.3)}',
    '.tnetz-widget::after{content:"";position:absolute;top:-30%;right:-5%;width:180px;height:180px;background:radial-gradient(circle,rgba(255,255,255,.12),transparent 65%);border-radius:50%;pointer-events:none}',
    '.tnetz-widget-in{display:flex;align-items:center;gap:12px;position:relative;z-index:1}',
    '.tnetz-widget-ic{width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}',
    '.tnetz-widget-t{font:700 15px/1.3 Inter,system-ui,sans-serif;color:#fff;margin:0}',
    '.tnetz-widget-s{font:500 12px/1.3 Inter,system-ui,sans-serif;color:rgba(255,255,255,.8);margin:2px 0 0}',
    '.tnetz-widget-a{margin-left:auto;font-size:18px;color:rgba(255,255,255,.7);transition:transform .2s}',
    '.tnetz-widget:hover .tnetz-widget-a{transform:translateX(3px)}',
    '@media(max-width:640px){.tnetz-grid{grid-template-columns:1fr}.tnetz-box{padding:18px}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ══════════ ICONS ══════════ */
  var FLAGS = {'default':'🌐','china':'🇨🇳','trung':'🇨🇳','russia':'🇷🇺','nga':'🇷🇺','vietnam':'🇻🇳','việt':'🇻🇳','japan':'🇯🇵','nhật':'🇯🇵','korea':'🇰🇷','hàn':'🇰🇷','us':'🇺🇸','mỹ':'🇺🇸','singapore':'🇸🇬','europe':'🇪🇺','hong kong':'🇭🇰','hk':'🇭🇰','taiwan':'🇹🇼','đài':'🇹🇼','mặc':'🌐'};
  function flag(n){var l=(n||'').toLowerCase();for(var k in FLAGS)if(l.indexOf(k)!==-1)return FLAGS[k];return '🌍';}

  /* ══════════ STATE ══════════ */
  var overlay=null,toast=null,cache=null,done=false;

  function token(){
    // Confirmed: live site uses 'auth_data' in localStorage
    return localStorage.getItem('auth_data')||'';
  }
  function logged(){return !!token();}

  function msg(t){
    if(!toast){toast=document.createElement('div');toast.className='tnetz-toast';document.body.appendChild(toast);}
    toast.textContent=t;toast.classList.add('show');
    setTimeout(function(){toast.classList.remove('show');},2500);
  }

  function clip(t){
    if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){msg('✅ Đã sao chép link!');});}
    else{var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px';document.body.appendChild(a);a.select();document.execCommand('copy');document.body.removeChild(a);msg('✅ Đã sao chép link!');}
  }

  /* ══════════ APP SHORTCUTS ══════════ */
  function apps(url){
    var t=(window.settings&&window.settings.title)||'VPN';
    return [
      {n:'Shadowrocket',i:'🚀',h:'shadowrocket://add/sub://'+btoa(url+'&flag=shadowrocket')},
      {n:'Clash / ClashX',i:'⚡',h:'clash://install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},
      {n:'ClashMeta',i:'🔥',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=meta')+'&name='+encodeURIComponent(t)},
      {n:'Surge',i:'🌊',h:'surge:///install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},
      {n:'QuantumultX',i:'⚙️',h:'quantumult-x:///update-configuration?remote-resource='+encodeURIComponent(JSON.stringify({server_remote:[url+', tag='+t]}))},
      {n:'Stash',i:'📦',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=stash')+'&name='+encodeURIComponent(t)}
    ];
  }

  /* ══════════ FETCH ══════════ */
  function load(cb){
    if(cache){cb(cache);return;}
    if(!logged()){msg('⚠️ Vui lòng đăng nhập');return;}
    fetch('/api/v1/user/getSubscribe',{
      headers:{'authorization':token()}
    }).then(function(r){
      if(!r.ok)throw new Error(r.status);
      return r.json();
    }).then(function(j){
      if(!j||!j.data){msg('⚠️ Lỗi dữ liệu');return;}
      var u=j.data.subscribe_urls||[];
      if(!u.length&&j.data.subscribe_url)u=[{name:'Mặc định',url:j.data.subscribe_url,icon:'🌐'}];
      cache=u;
      cb(u);
    }).catch(function(e){
      console.error('TNETZ:',e);
      msg('❌ Lỗi kết nối ('+e.message+')');
    });
  }

  /* ══════════ MODAL ══════════ */
  function open(urls){
    if(overlay)overlay.remove();
    overlay=document.createElement('div');
    overlay.className='tnetz-overlay';

    var box=document.createElement('div');
    box.className='tnetz-box';

    // Header
    box.innerHTML='<div class="tnetz-hdr"><div class="tnetz-hdr-ico">🌍</div><div><div class="tnetz-hdr-t">Đồng bộ đăng ký</div><div class="tnetz-hdr-s">Chọn khu vực → bấm ứng dụng để đồng bộ</div></div></div>';

    // Step 1 label
    var l1=document.createElement('div');l1.className='tnetz-lbl';
    l1.innerHTML='BƯỚC 1 <span>— Chọn khu vực</span>';
    box.appendChild(l1);

    // Region list
    var list=document.createElement('div');
    var appSection=document.createElement('div');appSection.className='tnetz-apps';
    var grid=document.createElement('div');grid.className='tnetz-grid';

    // Step 2 label
    var l2=document.createElement('div');l2.className='tnetz-lbl';
    l2.innerHTML='BƯỚC 2 <span>— Chọn ứng dụng hoặc sao chép</span>';
    appSection.appendChild(l2);
    appSection.appendChild(grid);

    urls.forEach(function(item){
      var c=document.createElement('div');c.className='tnetz-rc';
      var ic=item.icon||flag(item.name);
      var dom='';try{dom=new URL(item.url.split('?')[0]).hostname;}catch(e){dom=item.url;}
      c.innerHTML='<div class="tnetz-rc-i">'+ic+'</div><div><div class="tnetz-rc-n">'+item.name+'</div><div class="tnetz-rc-d">'+dom+'</div></div>';
      c.onclick=function(){
        list.querySelectorAll('.tnetz-rc').forEach(function(x){x.classList.remove('on');});
        c.classList.add('on');
        fillApps(grid,item.url);
        appSection.classList.add('show');
      };
      list.appendChild(c);
    });

    box.appendChild(list);
    box.appendChild(appSection);

    // Close button
    var cl=document.createElement('button');cl.className='tnetz-close';cl.textContent='Đóng';
    cl.onclick=close;
    box.appendChild(cl);

    overlay.appendChild(box);
    overlay.onclick=function(e){if(e.target===overlay)close();};
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){overlay.classList.add('show');});
  }

  function fillApps(grid,url){
    grid.innerHTML='';
    apps(url).forEach(function(a){
      var el=document.createElement('a');el.className='tnetz-app';el.href=a.h;
      el.innerHTML='<span class="tnetz-app-i">'+a.i+'</span>'+a.n;
      grid.appendChild(el);
    });
    var cp=document.createElement('button');cp.className='tnetz-app tnetz-copy';
    cp.innerHTML='📋 Sao chép link đăng ký';
    cp.onclick=function(e){e.preventDefault();clip(url);};
    grid.appendChild(cp);
  }

  function close(){
    if(!overlay)return;
    overlay.classList.remove('show');
    setTimeout(function(){if(overlay){overlay.remove();overlay=null;}},250);
  }

  /* ══════════ TRIGGER ══════════ */
  function go(){
    load(function(u){
      if(u.length)open(u);
      else msg('⚠️ Chưa cấu hình khu vực');
    });
  }

  /* ══════════ HOOKS ══════════ */
  function hook(){
    if(!logged())return;
    document.querySelectorAll('.subsrcibe-for-link').forEach(function(el){
      if(el.dataset.tz)return;el.dataset.tz='1';
      el.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();go();},true);
    });
  }

  /* ══════════ WIDGET ══════════ */
  function widget(){
    if(done||document.getElementById('tz-widget'))return;
    if(!logged())return;

    // Find subscribe input on page
    var inp=null;
    document.querySelectorAll('input[readonly]').forEach(function(el){
      if(el.value&&el.value.indexOf('subscribe')!==-1)inp=el;
    });

    var parent=null;
    if(inp)parent=inp.closest('.block,.block-content,.card,.ant-card')||inp.parentElement;
    if(!parent)parent=document.querySelector('.content.content-full,.ant-layout-content,main');
    if(!parent)return;

    done=true;
    var w=document.createElement('div');w.id='tz-widget';w.className='tnetz-widget';
    w.innerHTML='<div class="tnetz-widget-in"><div class="tnetz-widget-ic">🌍</div><div><div class="tnetz-widget-t">Chọn khu vực & đồng bộ</div><div class="tnetz-widget-s">Chọn khu vực → đồng bộ Clash, Shadowrocket...</div></div><div class="tnetz-widget-a">→</div></div>';
    w.onclick=go;

    if(inp){
      var block=inp.closest('.block,.card,.ant-card');
      if(block){block.parentNode.insertBefore(w,block.nextSibling);return;}
    }
    var fc=parent.firstElementChild;
    if(fc)parent.insertBefore(w,fc.nextSibling);else parent.appendChild(w);
  }

  /* ══════════ OBSERVER ══════════ */
  var tmr=null;
  new MutationObserver(function(){
    if(tmr)return;
    tmr=setTimeout(function(){tmr=null;hook();if(!done)widget();},600);
  }).observe(document.body,{childList:true,subtree:true});

  setTimeout(function(){hook();widget();},2500);
  setTimeout(function(){if(!done)widget();},5000);
})();
