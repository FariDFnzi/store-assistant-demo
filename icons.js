const iconPaths={
 'chevron-down':'M6 9l6 6 6-6','check':'M5 12l4 4L19 6','orders':'M7 3h10v4H7V3zM7 5H5v16h14V5h-2M8 11h8M8 15h5',
 'edit':'M15 5l4 4M4 20l4-1 12-12a2.8 2.8 0 00-4-4L4 15v5z',
 'pin':'M16 3l5 5-4 1-4 6v3l-3-3-6 6m6-6l-4-4h3l6-4 1-4z',
 'trash':'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
 'sparkles':'M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z',
 'plus':'M12 5v14M5 12h14','minus':'M5 12h14','close':'M6 6l12 12M18 6L6 18','arrow-up':'M12 19V5m-6 6l6-6 6 6',
 'panel-left':'M9 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
 'panel-right':'M15 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
 'refresh':'M20 7v5h-5M4 17v-5h5M6.1 6.1A8 8 0 0120 12M4 12a8 8 0 0013.9 5.9',
 'package':'M3 7l9-4 9 4v10l-9 4-9-4V7zm0 0l9 5 9-5m-9 5v9M7 5l10 5',
 'settings':'M9 4l1-2h4l1 2 2 1 2-.2 2 3-1 2v3l1 2-2 3-2-.2-2 1-1 2h-4l-1-2-2-1-2 .2-2-3 1-2v-3l-1-2 2-3 2 .2 2-1zM15 11a3 3 0 11-6 0 3 3 0 016 0z'
};
function uiIcon(name){return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(iconPaths[name]||iconPaths.sparkles)+'"/></svg>';}
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=uiIcon(el.dataset.icon));
