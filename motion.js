function syncSidebarAccess(){const hidden=$('app').classList.contains('sidebar-hidden');$('sidebar').inert=hidden;$('sidebarResizer').inert=hidden;$('toggleSidebar').setAttribute('aria-expanded',String(!hidden));}
function sidebarScale(value){prefs.sidebarScale=Math.max(.8,Math.min(1.3,Math.round(Number(value)*10)/10));document.documentElement.style.setProperty('--sidebar-scale',prefs.sidebarScale);$('sidebarScaleOutput').textContent=Math.round(prefs.sidebarScale*100)+'%';$('sidebarZoomOut').disabled=prefs.sidebarScale<=.8;$('sidebarZoomIn').disabled=prefs.sidebarScale>=1.3;savePrefs();}
function sidebarWidth(value){const max=window.innerWidth<850?360:Math.max(180,Math.min(360,window.innerWidth-660));prefs.sidebarWidth=Math.round(Math.max(180,Math.min(max,Number(value)||238)));document.documentElement.style.setProperty('--sidebar-width',prefs.sidebarWidth+'px');$('sidebarResizer').setAttribute('aria-valuenow',String(prefs.sidebarWidth));$('sidebarResizer').setAttribute('aria-valuemax',String(max));if(window.innerWidth>850)setWidth(prefs.shopWidth);savePrefs();}
$('sidebarZoomOut').onclick=()=>sidebarScale((prefs.sidebarScale||1)-.1);
$('sidebarZoomIn').onclick=()=>sidebarScale((prefs.sidebarScale||1)+.1);
$('sidebarZoomReset').onclick=()=>sidebarScale(1);
$('sidebarResizer').onpointerdown=e=>{e.preventDefault();$('sidebarResizer').setPointerCapture(e.pointerId);$('app').classList.add('resizing');document.body.style.userSelect='none';};
$('sidebarResizer').onpointermove=e=>{if($('sidebarResizer').hasPointerCapture(e.pointerId))sidebarWidth(e.clientX);};
function endResize(e){if(e&&$('sidebarResizer').hasPointerCapture(e.pointerId))$('sidebarResizer').releasePointerCapture(e.pointerId);$('app').classList.remove('resizing');document.body.style.userSelect='';}
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('sidebarResizer').addEventListener(event,endResize);
$('sidebarResizer').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();sidebarWidth(e.key==='Home'?238:(prefs.sidebarWidth||238)+(e.key==='ArrowRight'?15:-15));}};
for(const event of ['pointerdown'])$('resizer').addEventListener(event,()=>$('app').classList.add('resizing'));
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('resizer').addEventListener(event,()=>$('app').classList.remove('resizing'));
sidebarScale(prefs.sidebarScale||1);sidebarWidth(prefs.sidebarWidth||(window.innerWidth<=1150?195:238));syncSidebarAccess();
window.addEventListener('resize',()=>sidebarWidth(prefs.sidebarWidth));
