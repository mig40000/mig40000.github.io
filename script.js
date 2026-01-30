// Top-tabs accessible behavior + hash routing
(function(){
  const tabs = Array.from(document.querySelectorAll('#tablist [role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  function activateTab(tab){
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById('panel-' + t.dataset.target);
      if(panel) panel.hidden = !selected;
    });
    history.replaceState(null, '', '#' + tab.dataset.target);
    // focus management if needed
    tab.focus();
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', ()=> activateTab(tab));
    tab.addEventListener('keydown', e=>{
      if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){
        e.preventDefault();
        let next = idx;
        if(e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
        if(e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
        if(e.key === 'Home') next = 0;
        if(e.key === 'End') next = tabs.length - 1;
        activateTab(tabs[next]);
      }
    });
  });

  const initial = location.hash.replace('#','') || 'about';
  const initialTab = tabs.find(t => t.dataset.target === initial) || tabs[0];
  if(initialTab) activateTab(initialTab);
  window.addEventListener('popstate', ()=>{
    const h = location.hash.replace('#','');
    const t = tabs.find(x => x.dataset.target === h) || tabs[0];
    if(t) activateTab(t);
  });

  // set year
  const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
})();

document.addEventListener('DOMContentLoaded', () => {
  // ensure previously stored theme preference doesn't override the glass default
  try { localStorage.removeItem('site-theme'); } catch (e) {}
  // explicitly set the theme attribute to 'glass' (keeps behavior predictable)
  document.documentElement.setAttribute('data-theme','glass');

  // ...existing script functionality (tabs, year updater, back-to-top etc.) ...
});
