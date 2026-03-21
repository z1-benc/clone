/**
 * TNETZ Theme — Custom JS
 * Theme Toggle + Region Selector + App Shortcuts
 */
(function() {
  'use strict';

  /* ══════════ THEME TOGGLE ══════════ */
  var saved = localStorage.getItem('tz-theme');
  if (!saved) {
    saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-tz-theme', saved);
  if (saved === 'dark') document.documentElement.classList.add('tz-dark');

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-tz-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-tz-theme', next);
    document.documentElement.classList.toggle('tz-dark', next === 'dark');
    localStorage.setItem('tz-theme', next);
    var btn = document.getElementById('tz-theme-toggle');
    if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
  }

  function injectToggle() {
    if (document.getElementById('tz-theme-toggle')) return;
    var btn = document.createElement('button');
    btn.id = 'tz-theme-toggle';
    btn.textContent = saved === 'dark' ? '☀️' : '🌙';
    btn.onclick = toggleTheme;
    btn.title = 'Chuyển chế độ sáng/tối';
    document.body.appendChild(btn);
  }

  /* ══════════ REGION SELECTOR CSS ══════════ */
  var css = document.createElement('style');
  css.textContent = [
    '.tz-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}',
    '.tz-overlay.show{opacity:1}',
    '.tz-box{background:var(--tz-bg-elevated);border:1px solid var(--tz-border);border-radius:var(--tz-radius-lg);padding:24px;width:460px;max-width:94vw;max-height:88vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.2);transform:scale(.96) translateY(8px);transition:transform .2s}',
    '.tz-overlay.show .tz-box{transform:none}',
    '.tz-hdr{display:flex;align-items:center;gap:12px;margin-bottom:18px}',
    '.tz-hdr-ico{width:42px;height:42px;border-radius:10px;background:var(--tz-primary);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;flex-shrink:0}',
    '.tz-hdr-t{font-size:17px;font-weight:700;color:var(--tz-text)}',
    '.tz-hdr-s{font-size:12px;color:var(--tz-text-secondary);margin-top:2px}',
    '.tz-lbl{font-size:11px;font-weight:700;color:var(--tz-primary);text-transform:uppercase;letter-spacing:.06em;margin:14px 0 8px;display:flex;align-items:center;gap:6px}',
    '.tz-lbl span{color:var(--tz-text-muted);font-weight:500;text-transform:none;letter-spacing:0;font-size:12px}',
    '.tz-rc{background:var(--tz-bg-secondary);border:1.5px solid var(--tz-border);border-radius:var(--tz-radius-sm);padding:11px 14px;margin-bottom:6px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:10px}',
    '.tz-rc:hover{border-color:var(--tz-primary-border);background:var(--tz-primary-bg)}',
    '.tz-rc.on{border-color:var(--tz-primary);background:var(--tz-primary);box-shadow:0 4px 14px rgba(79,110,247,.25)}',
    '.tz-rc.on *{color:#fff!important}',
    '.tz-rc-i{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;background:var(--tz-primary-bg)}',
    '.tz-rc.on .tz-rc-i{background:rgba(255,255,255,.2)}',
    '.tz-rc-n{font-size:13px;font-weight:600;color:var(--tz-text)}',
    '.tz-rc-d{font-size:10px;color:var(--tz-text-muted);font-family:monospace}',
    '.tz-apps{display:none;margin-top:14px;border-top:1px solid var(--tz-border);padding-top:14px}',
    '.tz-apps.show{display:block}',
    '.tz-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}',
    '.tz-app{display:flex;align-items:center;gap:9px;padding:11px 13px;border:1.5px solid var(--tz-border);border-radius:var(--tz-radius-sm);background:var(--tz-bg-secondary);cursor:pointer;transition:all .15s;text-decoration:none!important;color:var(--tz-text)!important;font-size:12.5px;font-weight:600}',
    '.tz-app:hover{border-color:var(--tz-primary);background:var(--tz-primary-bg);color:var(--tz-primary)!important;transform:translateY(-1px)}',
    '.tz-app-i{font-size:18px;flex-shrink:0}',
    '.tz-copy{grid-column:1/-1;justify-content:center;background:var(--tz-primary)!important;color:#fff!important;border-color:var(--tz-primary)!important;font-size:13.5px;padding:13px}',
    '.tz-copy:hover{opacity:.9;color:#fff!important;transform:translateY(-1px);box-shadow:0 4px 12px rgba(79,110,247,.3)}',
    '.tz-closebtn{width:100%;padding:11px;border:none;border-radius:var(--tz-radius-sm);background:var(--tz-bg-hover);color:var(--tz-text-secondary);font-size:13px;font-weight:600;cursor:pointer;margin-top:10px;transition:background .15s}',
    '.tz-closebtn:hover{background:var(--tz-border)}',
    '.tz-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(18px);background:#10b981;color:#fff;padding:11px 26px;border-radius:var(--tz-radius-sm);font-size:13px;font-weight:600;z-index:10001;box-shadow:0 6px 20px rgba(16,185,129,.3);opacity:0;transition:all .25s;pointer-events:none}',
    '.tz-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}',
    '.tz-widget{background:var(--tz-primary);border-radius:var(--tz-radius);padding:16px 20px;margin:14px 0;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}',
    '.tz-widget:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(79,110,247,.3)}',
    '.tz-widget-in{display:flex;align-items:center;gap:12px;position:relative;z-index:1}',
    '.tz-widget-ic{width:42px;height:42px;border-radius:10px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}',
    '.tz-widget-t{font-size:15px;font-weight:700;color:#fff;margin:0}',
    '.tz-widget-s{font-size:12px;color:rgba(255,255,255,.8);margin:2px 0 0}',
    '.tz-widget-a{margin-left:auto;font-size:18px;color:rgba(255,255,255,.7);transition:transform .2s}',
    '.tz-widget:hover .tz-widget-a{transform:translateX(3px)}',
    '@media(max-width:640px){.tz-grid{grid-template-columns:1fr}.tz-box{padding:18px}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ══════════ REGION ICONS ══════════ */
  var FLAGS={'default':'🌐','china':'🇨🇳','trung':'🇨🇳','russia':'🇷🇺','nga':'🇷🇺','vietnam':'🇻🇳','việt':'🇻🇳','japan':'🇯🇵','nhật':'🇯🇵','korea':'🇰🇷','hàn':'🇰🇷','us':'🇺🇸','mỹ':'🇺🇸','singapore':'🇸🇬','europe':'🇪🇺','hong kong':'🇭🇰','hk':'🇭🇰','taiwan':'🇹🇼','đài':'🇹🇼','mặc':'🌐'};
  function flag(n){var l=(n||'').toLowerCase();for(var k in FLAGS)if(l.indexOf(k)!==-1)return FLAGS[k];return '🌍';}

  /* ══════════ STATE ══════════ */
  var overlay=null,toast=null,cache=null,widgetDone=false;

  function token(){return localStorage.getItem('auth_data')||'';}
  function logged(){return !!token();}
  function onLogin(){var h=window.location.hash||'';return h.indexOf('login')!==-1||h.indexOf('register')!==-1||h.indexOf('forgot')!==-1;}
  function msg(t){if(!toast){toast=document.createElement('div');toast.className='tz-toast';document.body.appendChild(toast);}toast.textContent=t;toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},2500);}
  function clip(t){if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){msg('✅ Đã sao chép!');});}else{var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px';document.body.appendChild(a);a.select();document.execCommand('copy');document.body.removeChild(a);msg('✅ Đã sao chép!');}}

  /* ══════════ APP SHORTCUTS ══════════ */
  function apps(url){var t=(window.settings&&window.settings.title)||'VPN';return[{n:'Shadowrocket',i:'🚀',h:'shadowrocket://add/sub://'+btoa(url+'&flag=shadowrocket')},{n:'Clash / ClashX',i:'⚡',h:'clash://install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},{n:'ClashMeta',i:'🔥',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=meta')+'&name='+encodeURIComponent(t)},{n:'Surge',i:'🌊',h:'surge:///install-config?url='+encodeURIComponent(url)+'&name='+encodeURIComponent(t)},{n:'QuantumultX',i:'⚙️',h:'quantumult-x:///update-configuration?remote-resource='+encodeURIComponent(JSON.stringify({server_remote:[url+', tag='+t]}))},{n:'Stash',i:'📦',h:'clash://install-config?url='+encodeURIComponent(url+'&flag=stash')+'&name='+encodeURIComponent(t)}];}

  /* ══════════ FETCH ══════════ */
  function load(cb){if(cache){cb(cache);return;}if(!logged()){msg('⚠️ Vui lòng đăng nhập');return;}fetch('/api/v1/user/getSubscribe',{headers:{'authorization':token()}}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(j){if(!j||!j.data){msg('⚠️ Lỗi');return;}var u=j.data.subscribe_urls||[];if(!u.length&&j.data.subscribe_url)u=[{name:'Mặc định',url:j.data.subscribe_url,icon:'🌐'}];cache=u;cb(u);}).catch(function(e){msg('❌ Lỗi ('+e.message+')');});}

  /* ══════════ MODAL ══════════ */
  function openModal(urls){
    if(overlay)overlay.remove();
    overlay=document.createElement('div');overlay.className='tz-overlay';
    var box=document.createElement('div');box.className='tz-box';
    box.innerHTML='<div class="tz-hdr"><div class="tz-hdr-ico">🌍</div><div><div class="tz-hdr-t">Đồng bộ đăng ký</div><div class="tz-hdr-s">Chọn khu vực → bấm ứng dụng để đồng bộ</div></div></div>';
    var l1=document.createElement('div');l1.className='tz-lbl';l1.innerHTML='BƯỚC 1 <span>— Chọn khu vực</span>';box.appendChild(l1);
    var list=document.createElement('div');
    var appSec=document.createElement('div');appSec.className='tz-apps';
    var grid=document.createElement('div');grid.className='tz-grid';
    var l2=document.createElement('div');l2.className='tz-lbl';l2.innerHTML='BƯỚC 2 <span>— Chọn ứng dụng</span>';
    appSec.appendChild(l2);appSec.appendChild(grid);
    urls.forEach(function(item){
      var c=document.createElement('div');c.className='tz-rc';
      var ic=item.icon||flag(item.name);
      var dom='';try{dom=new URL(item.url.split('?')[0]).hostname;}catch(e){dom=item.url;}
      c.innerHTML='<div class="tz-rc-i">'+ic+'</div><div><div class="tz-rc-n">'+item.name+'</div><div class="tz-rc-d">'+dom+'</div></div>';
      c.onclick=function(){list.querySelectorAll('.tz-rc').forEach(function(x){x.classList.remove('on');});c.classList.add('on');fillGrid(grid,item.url);appSec.classList.add('show');};
      list.appendChild(c);
    });
    box.appendChild(list);box.appendChild(appSec);
    var cl=document.createElement('button');cl.className='tz-closebtn';cl.textContent='Đóng';cl.onclick=closeModal;box.appendChild(cl);
    overlay.appendChild(box);overlay.onclick=function(e){if(e.target===overlay)closeModal();};
    document.body.appendChild(overlay);requestAnimationFrame(function(){overlay.classList.add('show');});
  }
  function fillGrid(g,url){g.innerHTML='';apps(url).forEach(function(a){var el=document.createElement('a');el.className='tz-app';el.href=a.h;el.innerHTML='<span class="tz-app-i">'+a.i+'</span>'+a.n;g.appendChild(el);});var cp=document.createElement('button');cp.className='tz-app tz-copy';cp.innerHTML='📋 Sao chép link';cp.onclick=function(e){e.preventDefault();clip(url);};g.appendChild(cp);}
  function closeModal(){if(!overlay)return;overlay.classList.remove('show');setTimeout(function(){if(overlay){overlay.remove();overlay=null;}},200);}
  function go(){load(function(u){if(u.length)openModal(u);else msg('⚠️ Chưa cấu hình khu vực');});}

  /* ══════════ HOOKS ══════════ */
  function hook(){if(!logged()||onLogin())return;document.querySelectorAll('.subsrcibe-for-link').forEach(function(el){if(el.dataset.tz)return;el.dataset.tz='1';el.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();go();},true);});}

  /* ══════════ WIDGET ══════════ */
  function widget(){
    if(widgetDone||document.getElementById('tz-widget'))return;
    if(!logged()||onLogin())return;
    var inp=null;document.querySelectorAll('input[readonly]').forEach(function(el){if(el.value&&el.value.indexOf('subscribe')!==-1)inp=el;});
    var parent=null;if(inp)parent=inp.closest('.block,.block-content,.card,.ant-card')||inp.parentElement;
    if(!parent)parent=document.querySelector('.content.content-full,.ant-layout-content,main');
    if(!parent)return;
    widgetDone=true;
    var w=document.createElement('div');w.id='tz-widget';w.className='tz-widget';
    w.innerHTML='<div class="tz-widget-in"><div class="tz-widget-ic">🌍</div><div><div class="tz-widget-t">Chọn khu vực & đồng bộ</div><div class="tz-widget-s">Chọn khu vực → đồng bộ Clash, Shadowrocket...</div></div><div class="tz-widget-a">→</div></div>';
    w.onclick=go;
    if(inp){var block=inp.closest('.block,.card,.ant-card');if(block){block.parentNode.insertBefore(w,block.nextSibling);return;}}
    var fc=parent.firstElementChild;if(fc)parent.insertBefore(w,fc.nextSibling);else parent.appendChild(w);
  }

  /* ══════════ OBSERVER ══════════ */
  var tmr=null;
  new MutationObserver(function(){if(tmr)return;tmr=setTimeout(function(){tmr=null;injectToggle();hook();if(!widgetDone)widget();},600);}).observe(document.body,{childList:true,subtree:true});
  setTimeout(function(){injectToggle();hook();widget();},2000);
  setTimeout(function(){if(!widgetDone)widget();},5000);
})();
