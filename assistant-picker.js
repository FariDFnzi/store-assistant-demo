function syncAssistantPicker(){
 const agent=$('mode').value==='agent';
 $('assistantPickerLabel').textContent=agent?'Store agent':'AI · Orders';
 $('assistantPickerIcon').innerHTML=uiIcon(agent?'sparkles':'orders');
 $('assistantBadge').textContent='DEMO';
 $('assistantPicker').disabled=busy;
 for(const option of $('assistantMenu').querySelectorAll('[data-mode]'))option.setAttribute('aria-checked',String(option.dataset.mode===$('mode').value));
}
function positionAssistantMenu(){const rect=$('assistantPicker').getBoundingClientRect();const menu=$('assistantMenu');menu.style.maxHeight=Math.max(160,window.innerHeight-24)+'px';const bounds=menu.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(window.innerWidth-bounds.width-8,rect.left))+'px';const above=rect.top-bounds.height-9;menu.style.top=Math.max(8,Math.min(window.innerHeight-bounds.height-8,above>=8?above:rect.bottom+9))+'px';}
function showAssistantMenu(){if(busy)return;syncAssistantPicker();$('assistantMenu').showPopover();positionAssistantMenu();$('assistantPicker').setAttribute('aria-expanded','true');$('assistantMenu').querySelector('[aria-checked="true"]').focus();}
function hideAssistantMenu(restoreFocus=true){$('assistantMenu').hidePopover();$('assistantPicker').setAttribute('aria-expanded','false');if(restoreFocus)$('assistantPicker').focus();}
// Declare the button as the popover invoker so native light-dismiss does not
// close the menu before a second click can toggle it closed.
$('assistantPicker').setAttribute('popovertarget','assistantMenu');
$('assistantPicker').setAttribute('popovertargetaction','toggle');
$('assistantPicker').onkeydown=e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();showAssistantMenu();if(e.key==='ArrowUp')$('assistantMenu').querySelectorAll('[data-mode]')[1].focus();}};
for(const option of $('assistantMenu').querySelectorAll('[data-mode]'))option.onclick=()=>{if(busy)return;const next=option.dataset.mode;hideAssistantMenu();if($('mode').value!==next){$('mode').value=next;$('mode').dispatchEvent(new Event('change'));}syncAssistantPicker();};
$('assistantMenu').onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();hideAssistantMenu();return;}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const options=[...$('assistantMenu').querySelectorAll('[data-mode]')];const index=options.indexOf(document.activeElement);const target=e.key==='Home'?0:e.key==='End'?options.length-1:(index+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options[target].focus();}};
$('assistantMenu').addEventListener('beforetoggle',e=>{if(e.newState==='open'){if(busy){e.preventDefault();return;}syncAssistantPicker();}});
$('assistantMenu').addEventListener('toggle',e=>{const open=e.newState==='open';$('assistantPicker').setAttribute('aria-expanded',String(open));if(open){positionAssistantMenu();$('assistantMenu').querySelector('[aria-checked="true"]').focus();}});
window.addEventListener('resize',()=>{if($('assistantMenu').matches(':popover-open'))positionAssistantMenu();});
syncAssistantPicker();
