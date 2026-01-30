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
	// set current year in footer
	const yEl = document.getElementById('year');
	if (yEl) yEl.textContent = String(new Date().getFullYear());

	// Tab UI: activate the tab with aria-selected="true" or fallback to first
	const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
	if (tabs.length) {
		const getPanel = (tab) => document.getElementById(tab.getAttribute('aria-controls'));
		// Ensure panels reflect initial aria-selected state (only the active one is visible)
		let active = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
		const activate = (tab, focus = true) => {
			tabs.forEach(t => {
				const is = t === tab;
				t.setAttribute('aria-selected', is ? 'true' : 'false');
				t.tabIndex = is ? 0 : -1;
				const panel = getPanel(t);
				if (panel) panel.hidden = !is;
			});
			if (focus) tab.focus();
		};
		// initialize panels
		activate(active, false);

		// Click and keyboard behavior
		tabs.forEach((tab, idx) => {
			tab.addEventListener('click', () => activate(tab, true));
			tab.addEventListener('keydown', (e) => {
				let newIndex = idx;
				switch (e.key) {
					case 'ArrowRight': newIndex = (idx + 1) % tabs.length; tabs[newIndex].focus(); e.preventDefault(); break;
					case 'ArrowLeft': newIndex = (idx - 1 + tabs.length) % tabs.length; tabs[newIndex].focus(); e.preventDefault(); break;
					case 'Home': tabs[0].focus(); e.preventDefault(); break;
					case 'End': tabs[tabs.length - 1].focus(); e.preventDefault(); break;
					case 'Enter':
					case ' ':
					case 'Spacebar':
						e.preventDefault();
						activate(document.activeElement || tab, true);
						break;
					default:
						// no-op
				}
			});
		});
	}

  // Publications: search, year filter, view toggle, collapsible abstracts
  const panel = document.getElementById('panel-pubs');
  if (panel) {
    const search = document.getElementById('pub-search');
    const yearFilter = document.getElementById('pub-year-filter');
    const toggleViewBtn = document.getElementById('pub-toggle-view');
    const noResults = document.getElementById('pub-no-results');

    const yearGroups = Array.from(panel.querySelectorAll('.pub-year-group'));
    const items = Array.from(panel.querySelectorAll('.pub-item'));

    // populate year filter from headings
    const years = yearGroups.map(g => {
      const h = g.querySelector('.pub-year-heading');
      return h ? h.textContent.trim() : null;
    }).filter(Boolean);
    Array.from(new Set(years)).sort((a,b)=>b.localeCompare(a)).forEach(y=>{
      const opt = document.createElement('option'); opt.value = y; opt.textContent = y; yearFilter.appendChild(opt);
    });

    // ensure pub-line acts as a keyboard-accessible toggle
    items.forEach(li=>{
      const line = li.querySelector('.pub-line');
      const abs = li.querySelector('.pub-abstract');
      if (!line || !abs) return;
      line.setAttribute('role','button');
      line.tabIndex = 0;
      // initial collapsed state on small screens
      if (window.innerWidth < 720) abs.classList.add('collapsed');
      // click toggles
      line.addEventListener('click', () => abs.classList.toggle('collapsed'));
      line.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault(); abs.classList.toggle('collapsed');
        }
      });
    });

    const updateVisibility = () => {
      const q = (search && search.value || '').trim().toLowerCase();
      let visibleCount = 0;

      items.forEach(li=>{
        const text = li.innerText.toLowerCase();
        const group = li.closest('.pub-year-group');
        const year = group ? (group.querySelector('.pub-year-heading')?.textContent.trim()||'') : '';
        const matchesYear = yearFilter.value === 'all' || year === yearFilter.value;
        const matchesQuery = !q || text.includes(q);
        const show = matchesYear && matchesQuery;
        li.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });

      // hide year groups with no visible items
      yearGroups.forEach(g => {
        const any = g.querySelector('.pub-item:not([style*="display: none"])');
        g.style.display = any ? '' : 'none';
      });

      if (noResults) noResults.hidden = (visibleCount > 0);
    };

    // events
    if (search) search.addEventListener('input', debounce(updateVisibility, 150));
    if (yearFilter) yearFilter.addEventListener('change', updateVisibility);
    if (toggleViewBtn) {
      toggleViewBtn.addEventListener('click', () => {
        const isCard = panel.classList.toggle('card-view');
        toggleViewBtn.setAttribute('aria-pressed', String(isCard));
        toggleViewBtn.textContent = isCard ? 'List view' : 'Card view';
      });
    }

    // initial visibility
    updateVisibility();
  }

  // small debounce utility (shared)
  function debounce(fn, wait=100) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(()=> fn(...args), wait); };
  }
});
