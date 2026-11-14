function applyTheme(){const selected=prefs.theme||'light';const dark=selected==='dark'||(selected==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';$('theme').value=selected;document.querySelector('meta[name="theme-color"]').content=dark?'#202020':'#faf9f6';}
function settingsScale(value){prefs.settingsScale=Math.max(.8,Math.min(1.4,Math.round(value*10)/10));document.documentElement.style.setProperty('--settings-scale',prefs.settingsScale);$('settingsScaleOutput').textContent=Math.round(prefs.settingsScale*100)+'%';$('settingsZoomOut').disabled=prefs.settingsScale<=.8;$('settingsZoomIn').disabled=prefs.settingsScale>=1.4;savePrefs();}
$('theme').onchange=()=>{prefs.theme=$('theme').value;applyTheme();savePrefs();};
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(prefs.theme==='system')applyTheme();});
$('settingsZoomOut').onclick=()=>settingsScale((prefs.settingsScale||1)-.1);
$('settingsZoomIn').onclick=()=>settingsScale((prefs.settingsScale||1)+.1);
$('settingsZoomReset').onclick=()=>settingsScale(1);
applyTheme();settingsScale(prefs.settingsScale||1);
