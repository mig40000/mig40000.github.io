
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
// Theme toggle: creates a small button in the top-right header (no external libs)
(function(){
  const header = document.querySelector('.header-inner');
  if(!header) return;
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.type = 'button';
  btn.title = 'Toggle theme';
  btn.innerHTML = '🌓';
  btn.style.border = '0';
  btn.style.background = 'transparent';
  btn.style.fontSize = '18px';
  btn.style.cursor = 'pointer';
  btn.style.marginLeft = '8px';

  // initial (use system pref)
  const mode = localStorage.getItem('site-theme');
  if(mode) document.documentElement.dataset.theme = mode;

  btn.addEventListener('click', ()=>{
    const cur = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('site-theme', next);
    // small visual feedback
    btn.animate([{transform:'rotate(0)'},{transform:'rotate(360deg)'}],{duration:420});
  });

  header.appendChild(btn);

  // Apply dataset theme to override prefers-color-scheme:dark if user chose
  const applySaved = ()=>{
    const saved = localStorage.getItem('site-theme');
    if(saved === 'dark') document.documentElement.classList.add('force-dark');
    else if(saved === 'light') document.documentElement.classList.remove('force-dark');
  };
  applySaved();
})();
