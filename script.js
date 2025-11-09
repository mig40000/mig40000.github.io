
(function(){
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
  function activateTab(tab){
    tabs.forEach(t=>{const s = t===tab; t.setAttribute('aria-selected', s? 'true':'false'); t.tabIndex = s?0:-1; const panel=document.getElementById('panel-'+t.dataset.target); if(panel) panel.hidden = !s; });
    history.replaceState(null,'','#'+tab.dataset.target);
    tab.focus();
  }
  tabs.forEach(tab=>{ tab.addEventListener('click', ()=> activateTab(tab)); tab.addEventListener('keydown', e=>{ const idx=tabs.indexOf(tab); if(e.key==='ArrowRight'||e.key==='ArrowDown'){ e.preventDefault(); activateTab(tabs[(idx+1)%tabs.length]); } else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){ e.preventDefault(); activateTab(tabs[(idx-1+tabs.length)%tabs.length]); } else if(e.key==='Home'){ e.preventDefault(); activateTab(tabs[0]); } else if(e.key==='End'){ e.preventDefault(); activateTab(tabs[tabs.length-1]); } }); });
  const hash = location.hash.replace('#',''); const initial = tabs.find(t=>t.dataset.target===hash) || tabs[0]; activateTab(initial);
  window.addEventListener('popstate', ()=>{ const h=location.hash.replace('#',''); const target=tabs.find(t=>t.dataset.target===h) || tabs[0]; activateTab(target); });
})();
