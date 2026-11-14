let menuThreadId=null,undoThreadId=null;
function openThreadMenu(id,button){if(busy)return;const thread=threads.find(t=>t.id===id&&!t.deletedAt);if(!thread)return;menuThreadId=id;$('pinThreadLabel').textContent=thread.pinned?'Unpin conversation':'Pin conversation';$('threadMenu').showPopover();const rect=button.getBoundingClientRect();$('threadMenu').style.left=Math.max(8,Math.min(window.innerWidth-234,rect.right+5))+'px';$('threadMenu').style.top=Math.max(8,Math.min(window.innerHeight-190,rect.top))+'px';$('pinThread').focus();}
function closeThreadMenu(){$('threadMenu').hidePopover();}
function refreshDeletedCount(){const count=threads.filter(t=>t.deletedAt).length;$('deletedChats').hidden=!count;$('deletedChatsCount').textContent=String(count);}
function showUndo(id){undoThreadId=id;$('undoToast').hidden=false;}
function restoreThread(id){const t=threads.find(t=>t.id===id&&t.deletedAt);if(!t||busy)return;delete t.deletedAt;persist();renderThreads();renderDeletedChats();if(id===undoThreadId){$('undoToast').hidden=true;undoThreadId=null;}}
function renderDeletedChats(){$('deletedList').replaceChildren();const deleted=threads.filter(t=>t.deletedAt).sort((a,b)=>b.deletedAt-a.deletedAt);$('emptyDeletedChats').disabled=busy||!deleted.length;for(const thread of deleted){const row=document.createElement('div');row.className='deleted-chat';const title=document.createElement('span');title.className='deleted-chat-title';title.textContent=thread.title;const actions=document.createElement('div');actions.className='deleted-chat-actions';const restore=document.createElement('button');restore.textContent='Restore';restore.setAttribute('aria-label','Restore '+thread.title);restore.disabled=busy;restore.onclick=()=>restoreThread(thread.id);const remove=document.createElement('button');remove.className='danger';remove.innerHTML=uiIcon('trash');remove.setAttribute('aria-label','Permanently delete '+thread.title);remove.title='Delete permanently';remove.disabled=busy;remove.onclick=()=>requestPermanentDelete([thread.id]);actions.append(restore,remove);row.append(title,actions);$('deletedList').append(row);}if(!deleted.length){const p=document.createElement('p');p.className='profile-hint';p.textContent='No deleted conversations.';$('deletedList').append(p);}}
$('pinThread').onclick=()=>{const t=threads.find(t=>t.id===menuThreadId&&!t.deletedAt);if(!t||busy)return;t.pinned=!t.pinned;if(t.pinned)t.pinnedAt=Date.now();else delete t.pinnedAt;closeThreadMenu();persist();renderThreads();};
$('renameThread').onclick=()=>{if(busy)return;const t=threads.find(t=>t.id===menuThreadId&&!t.deletedAt);if(!t)return;renameId=t.id;$('threadTitle').value=t.title;closeThreadMenu();$('renameDialog').showModal();};
$('deleteThread').onclick=()=>{if(busy)return;const t=threads.find(t=>t.id===menuThreadId&&!t.deletedAt);if(!t)return;t.deletedAt=Date.now();closeThreadMenu();if(activeId===t.id){const next=threads.filter(t=>!t.deletedAt).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||b.updated-a.updated)[0];if(next){activeId=next.id;renderChat();}else newThread(t.mode);}persist();renderThreads();showUndo(t.id);};
$('undoDelete').onclick=()=>restoreThread(undoThreadId);
$('dismissUndo').onclick=()=>{$('undoToast').hidden=true;undoThreadId=null;};
$('deletedChats').onclick=()=>{renderDeletedChats();$('deletedDialog').showModal();};
$('closeDeletedDialog').onclick=()=>$('deletedDialog').close();
$('threadMenu').onkeydown=e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const buttons=[...$('threadMenu').querySelectorAll('[role="menuitem"]')];const index=buttons.indexOf(document.activeElement);const target=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[target].focus();}};
refreshDeletedCount();
let pendingPurgeIds=[];
function requestPermanentDelete(ids){
 if(busy)return;
 const selected=threads.filter(t=>t.deletedAt&&ids.includes(t.id));
 if(!selected.length)return;
 pendingPurgeIds=selected.map(t=>t.id);
 $('purgeTitle').textContent=selected.length===1?'Delete conversation permanently?':'Delete '+selected.length+' conversations permanently?';
 $('purgeDescription').textContent=selected.length===1?'“'+selected[0].title+'” and its saved messages will be removed from this browser. This cannot be undone.':'All '+selected.length+' selected deleted conversations and their saved messages will be removed from this browser. This cannot be undone.';
 $('purgeError').textContent='';$('purgeDialog').showModal();$('cancelPurge').focus();
}
function cancelPurge(){pendingPurgeIds=[];$('purgeDialog').close();}
$('emptyDeletedChats').onclick=()=>requestPermanentDelete(threads.filter(t=>t.deletedAt).map(t=>t.id));
$('cancelPurge').onclick=cancelPurge;$('closePurge').onclick=cancelPurge;
$('purgeDialog').addEventListener('cancel',()=>{pendingPurgeIds=[];});
$('confirmPurge').onclick=()=>{
 if(busy||!pendingPurgeIds.length)return;
 const result=purgeDeletedConversations(threads,pendingPurgeIds);
 try{localStorage.setItem('store-assistant-demo-chats',JSON.stringify(result.remaining));}
 catch{$('purgeError').textContent='Unable to save this change. No conversations were permanently deleted. Please try again.';return;}
 threads=result.remaining;
 if(result.removedIds.includes(undoThreadId)){$('undoToast').hidden=true;undoThreadId=null;}
 pendingPurgeIds=[];$('purgeDialog').close();renderThreads();renderDeletedChats();
 $('deletedFeedback').textContent=result.removedIds.length===1?'Conversation permanently deleted.':result.removedIds.length+' conversations permanently deleted.';
};
