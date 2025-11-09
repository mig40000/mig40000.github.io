// Accessible tabs with hash routing + keyboard support + mobile accordion fallback
(function(){
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  function activateTab(tab){
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById('panel-' + t.dataset.target);
      if(panel) panel.hidden = !selected;
    });
    // update hash without scrolling
    const h = '#' + tab.dataset.target;
    history.replaceState(null, '', h);
    tab.focus();
  }

  tabs.forEach(tab=>{
    tab.addEventListener('click', e=>{
      activateTab(tab);
    });
    tab.addEventListener('keydown', e=>{
      const idx = tabs.indexOf(tab);
      if(e.key === 'ArrowRight' || e.key === 'ArrowDown'){
        e.preventDefault(); activateTab(tabs[(idx+1)%tabs.length]);
      } else if(e.key === 'ArrowLeft' || e.key === 'ArrowUp'){
        e.preventDefault(); activateTab(tabs[(idx-1+tabs.length)%tabs.length]);
      } else if(e.key === 'Home'){ e.preventDefault(); activateTab(tabs[0]); }
      else if(e.key === 'End'){ e.preventDefault(); activateTab(tabs[tabs.length-1]); }
    });
  });

  // Initial activation based on hash or default
  const hash = location.hash.replace('#','');
  const initial = tabs.find(t=>t.dataset.target === hash) || tabs[0];
  activateTab(initial);

  // Support deep-linking: when user navigates back/forward
  window.addEventListener('popstate', ()=>{
    const h = location.hash.replace('#','');
    const target = tabs.find(t=>t.dataset.target===h) || tabs[0];
    activateTab(target);
  });

  // Mobile: clicking the active tab toggles its panel (accordion-like)
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      if(window.innerWidth <= 700){
        const panel = document.getElementById('panel-' + tab.dataset.target);
        panel.hidden = !panel.hidden;
        tab.setAttribute('aria-expanded', !panel.hidden);
      }
    });
  });
})();