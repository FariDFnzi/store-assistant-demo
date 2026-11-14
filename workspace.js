const $=id=>document.getElementById(id);
function uiError(text){
 const s=String(text||'');
 if(/HTTP 402/.test(s))return 'Your Shopify store is inactive (HTTP 402). Open Shopify admin to review your subscription and reactivate the store.';
 if(/n8n/.test(s)&&/وارد|ورود|منقضی/.test(s))return 'Go to Settings → Open n8n to sign in, then send your message again.';
 if(/fetch failed|ECONNRESET/.test(s))return 'Unable to reach Shopify. Check your internet connection or VPN, then try again.';
 if(/دسترسی نوشتن هنوز فعال/.test(s))return 'Write access has not been enabled yet.';
 if(/دسترسی به فروشگاه برقرار نیست/.test(s))return 'The agent is connected to this app, but Shopify is currently unavailable.';
 if(/جریان ایجنت n8n هنوز منتشر/.test(s))return 'The n8n agent workflow has not been published yet.';
 return s;
}
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
let storageWarning=false;
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{if(!storageWarning){storageWarning=true;$('composerMode').textContent='Browser storage is full. Chats will only last for this session.';}}}
const prefs=read('store-assistant-demo-prefs',{});
let threads=read('store-assistant-demo-chats',[]).filter(t=>t&&typeof t.id==='string'&&Array.isArray(t.messages));
for(const thread of threads)if(!thread.messages.length&&thread.title==='گفت‌وگوی جدید')thread.title='New chat';
let activeId=read('store-assistant-demo-active',null),busy=false,cursor=null,renameId=null;
const active=()=>threads.find(t=>t.id===activeId);
function persist(){write('store-assistant-demo-chats',threads);write('store-assistant-demo-active',activeId);}
function savePrefs(){write('store-assistant-demo-prefs',prefs);}
function newThread(mode='agent'){if(busy)return;const t={id:crypto.randomUUID(),title:'New chat',mode,messages:[],updated:Date.now()};threads.unshift(t);activeId=t.id;persist();renderThreads();renderChat();$('input').focus();}
function renderThreads(){
 const query=$('chatSearch').value.trim().toLowerCase();$('threads').replaceChildren();
 const found=threads.filter(t=>!t.deletedAt&&t.title.toLowerCase().includes(query)).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||(b.pinnedAt||b.updated)-(a.pinnedAt||a.updated));
 for(const t of found){const row=document.createElement('div');row.className='thread'+(t.id===activeId?' active':'')+(t.pinned?' pinned':'');const b=document.createElement('button');b.textContent=t.title;b.title=t.title;b.disabled=busy;b.onclick=()=>{activeId=t.id;persist();renderThreads();renderChat();};if(t.pinned){const pin=document.createElement('span');pin.className='thread-pin';pin.innerHTML=uiIcon('pin');pin.setAttribute('aria-label','Pinned conversation');b.prepend(pin);}const menu=document.createElement('button');menu.className='rename';menu.textContent='⋯';menu.disabled=busy;menu.setAttribute('aria-label','Conversation options: '+t.title);menu.setAttribute('aria-haspopup','menu');menu.onclick=()=>openThreadMenu(t.id,menu);row.append(b,menu);$('threads').append(row);}
 if(!found.length){const p=document.createElement('p');p.className='empty-threads';p.textContent=query?'No conversations found.':'Your conversations will appear here.';$('threads').append(p);}
 if(typeof refreshDeletedCount==='function')refreshDeletedCount();
 if(typeof syncAssistantPicker==='function')syncAssistantPicker();
}
function message(text,role,error=false){const el=document.createElement('div');el.className='msg '+(role==='user'?'user':'bot')+(error?' error':'');el.dir='auto';el.textContent=text;$('conversation').append(el);return el;}
function renderChat(){const t=active();$('conversation').replaceChildren();$('mode').value=t.mode;$('composerMode').textContent=t.mode==='agent'?'Store agent · Local AI':'Orders assistant · Configured provider';
 if(!t.messages.length){const welcome=document.createElement('div');welcome.className='welcome';const spark=document.createElement('span');spark.className='spark';spark.innerHTML=uiIcon('sparkles');const h=document.createElement('h1');h.textContent='What can we do for your store?';const p=document.createElement('p');p.textContent='Explore the sample catalog, ask about orders, or preview a store task.\nReplies are scripted for this demo.';const cards=document.createElement('div');cards.className='suggestions';for(const [label,prompt] of [['Store overview','Tell me my store name and currency.'],['Find a product','I want to find a product. What information do you need?'],['Create a product','I want to create a draft product. What information do you need?']]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{$('input').value=prompt;$('input').focus();};cards.append(b);}welcome.append(spark,h,p,cards);$('conversation').append(welcome);
 }else for(const m of t.messages)message(m.content,m.role,m.error);
 if(typeof syncAssistantPicker==='function')syncAssistantPicker();
 $('log').scrollTop=$('log').scrollHeight;
}
if(!active()||active().deletedAt){const available=threads.filter(t=>!t.deletedAt);if(available.length)activeId=available[0].id;else{const t={id:crypto.randomUUID(),title:'New chat',mode:'agent',messages:[],updated:Date.now()};threads.push(t);activeId=t.id;}persist();}
$('newChat').onclick=()=>newThread($('mode').value);
$('chatSearch').oninput=renderThreads;
$('mode').onchange=()=>newThread($('mode').value);
$('renameForm').onsubmit=e=>{e.preventDefault();const t=threads.find(x=>x.id===renameId);if(t){t.title=$('threadTitle').value.trim()||'Conversation';persist();renderThreads();}$('renameDialog').close();};
$('chat').onsubmit=async e=>{
 e.preventDefault();if(busy)return;const text=$('input').value.trim();if(!text)return;const t=active();busy=true;$('send').disabled=true;$('newChat').disabled=true;$('mode').disabled=true;
 const prior=t.messages.filter(m=>!m.error).map(({role,content})=>({role,content}));
 if(!t.messages.length)t.title=text.slice(0,45);t.messages.push({role:'user',content:text});t.updated=Date.now();threads.sort((a,b)=>b.updated-a.updated);persist();renderThreads();renderChat();$('input').value='';$('input').style.height='';const wait=message('Working on your request…','assistant');wait.classList.add('pending');$('log').scrollTop=$('log').scrollHeight;
 try{const r=await demoFetch(t.mode==='agent'?'/api/agent-chat':'/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:[...prior.slice(-39),{role:'user',content:text}]})});const d=await r.json();if(!r.ok)throw Error(uiError(d.error)||'No response was received.');if(typeof d.reply!=='string')throw Error('The agent returned an invalid response.');wait.textContent=uiError(d.reply);t.messages.push({role:'assistant',content:d.reply});if(d.proposal?.id)addProposalControl(wait,t,d.proposal.id);}
 catch(err){wait.textContent=err.message||'Unable to connect to the app.';wait.classList.add('error');t.messages.push({role:'assistant',content:wait.textContent,error:true});}
 finally{wait.classList.remove('pending');busy=false;$('send').disabled=false;$('newChat').disabled=false;$('mode').disabled=false;persist();renderThreads();$('log').scrollTop=$('log').scrollHeight;}
};
function addProposalControl(container,thread,id){
 const button=document.createElement('button');button.type='button';button.className='primary';button.textContent='Confirm Shopify change';button.style.display='block';button.style.marginTop='12px';container.append(button);
 button.onclick=async()=>{
   if(busy)return;button.disabled=true;button.textContent='Applying…';
   let text;
   try{const r=await demoFetch('/api/agent-confirm',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})});const d=await r.json();text=uiError(r.ok?d.reply:d.error);}
   catch{text='Change not verified. Check Shopify before retrying.';}
   button.remove();thread.messages.push({role:'assistant',content:text});persist();if(active()===thread)renderChat();
 };
}
$('input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('chat').requestSubmit();}};
$('input').oninput=()=>{$('input').style.height='auto';$('input').style.height=Math.min(170,$('input').scrollHeight)+'px';};
function setShop(open){prefs.shopOpen=open;$('shopPanel').inert=!open;$('resizer').inert=!open;$('app').classList.toggle('shop-hidden',!open);$('toggleShop').setAttribute('aria-expanded',String(open));savePrefs();}
$('toggleShop').onclick=()=>setShop($('app').classList.contains('shop-hidden'));
$('closeShop').onclick=()=>{setShop(false);$('toggleShop').focus();};
$('toggleSidebar').onclick=()=>{prefs.sidebarHidden=!$('app').classList.contains('sidebar-hidden');$('app').classList.toggle('sidebar-hidden',prefs.sidebarHidden);syncSidebarAccess();savePrefs();};
function setWidth(value){const sidebar=$('app').classList.contains('sidebar-hidden')?0:(prefs.sidebarWidth||(window.innerWidth<=1150?195:238));const max=Math.max(300,Math.min(750,window.innerWidth-sidebar-359));prefs.shopWidth=Math.max(300,Math.min(max,Number(value)||390));document.documentElement.style.setProperty('--shop-width',prefs.shopWidth+'px');$('resizer').setAttribute('aria-valuenow',String(prefs.shopWidth));$('resizer').setAttribute('aria-valuemax',String(max));savePrefs();}
$('resizer').onpointerdown=e=>{e.preventDefault();$('resizer').setPointerCapture(e.pointerId);document.body.style.userSelect='none';};
$('resizer').onpointermove=e=>{if($('resizer').hasPointerCapture(e.pointerId))setWidth(window.innerWidth-e.clientX);};
for(const event of ['pointerup','pointercancel'])$('resizer').addEventListener(event,e=>{if($('resizer').hasPointerCapture(e.pointerId))$('resizer').releasePointerCapture(e.pointerId);document.body.style.userSelect='';});
$('resizer').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();setWidth(e.key==='Home'?390:(prefs.shopWidth||390)+(e.key==='ArrowLeft'?20:-20));}};
function scale(value){prefs.shopScale=Math.max(.7,Math.min(1.4,Math.round(value*10)/10));document.documentElement.style.setProperty('--shop-scale',prefs.shopScale);$('scaleOutput').textContent=Math.round(prefs.shopScale*100)+'%';$('zoomOut').disabled=prefs.shopScale<=.7;$('zoomIn').disabled=prefs.shopScale>=1.4;savePrefs();}
$('zoomIn').onclick=()=>scale((prefs.shopScale||1)+.1);$('zoomOut').onclick=()=>scale((prefs.shopScale||1)-.1);$('scaleOutput').ondblclick=()=>scale(1);
setWidth(prefs.shopWidth||390);scale(prefs.shopScale||1);setShop(prefs.shopOpen??window.innerWidth>850);$('app').classList.toggle('sidebar-hidden',prefs.sidebarHidden??window.innerWidth<580);
window.addEventListener('resize',()=>setWidth(prefs.shopWidth));
function applyFont(){document.documentElement.style.setProperty('--chat-size',(prefs.chatFont||15)+'px');$('chatFont').value=String(prefs.chatFont||15);}applyFont();$('chatFont').onchange=()=>{prefs.chatFont=Number($('chatFont').value);applyFont();savePrefs();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$('openSettings').onclick=()=>$('settingsDialog').showModal();
function profile(){const name=read('store-assistant-demo-profile','Store owner');$('profileName').textContent=name;$('profileAvatar').textContent=name.trim().slice(0,1)||'S';$('displayName').value=name;}profile();
$('openProfile').onclick=()=>$('profileDialog').showModal();$('saveProfile').onclick=()=>{write('store-assistant-demo-profile',$('displayName').value.trim()||'Store owner');profile();$('profileDialog').close();};
$('connect').onclick=async()=>{$('connect').disabled=true;$('connection').textContent='Checking connection…';$('connection').classList.remove('bad');try{const r=await demoFetch('/api/connect',{method:'POST'});const d=await r.json();if(!r.ok)throw Error(uiError(d.error));$('storeName').textContent=d.name;$('connection').textContent='Demo ready · '+d.currencyCode;}catch(e){$('connection').textContent=e.message;$('connection').classList.add('bad');}finally{$('connect').disabled=false;}};
async function products(after=null){$('loadProducts').disabled=true;$('more').disabled=true;$('productStatus').textContent='Loading products…';try{const q=new URLSearchParams({title:$('searchTitle').value.trim()});if(after)q.set('after',after);const r=await demoFetch('/api/products?'+q);const d=await r.json();if(!r.ok)throw Error(uiError(d.error));$('productRows').replaceChildren();for(const p of d.products){const card=document.createElement('article');card.className='product-card';const title=document.createElement('strong');title.textContent=p.title;const meta=document.createElement('div');meta.className='product-meta';for(const value of [p.price+' '+p.currency,({ACTIVE:'Active',DRAFT:'Draft',ARCHIVED:'Archived'})[p.status]||p.status,'Stock: '+(p.inventory??'Unknown')]){const span=document.createElement('span');span.textContent=value;meta.append(span);}card.append(title,meta);$('productRows').append(card);}cursor=d.pageInfo.endCursor;$('more').hidden=!d.pageInfo.hasNextPage;$('productCount').textContent=d.products.length+' on this page';$('productStatus').textContent=d.products.length?'Showing one page of products.':'No products found.';}catch(e){$('productRows').replaceChildren();$('more').hidden=true;$('productCount').textContent='Unavailable';$('productStatus').textContent=e.message;}finally{$('loadProducts').disabled=false;$('more').disabled=false;}}
$('productSearch').onsubmit=e=>{e.preventDefault();products();};$('more').onclick=()=>products(cursor);
$('writeStatus').textContent='Demo preview · Store changes are simulated.';
renderThreads();renderChat();
