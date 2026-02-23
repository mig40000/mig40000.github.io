document.addEventListener('DOMContentLoaded', () => {
	// ── Year in footer ────────────────────────────────────────────────────────
	const yEl = document.getElementById('year');
	if (yEl) yEl.textContent = String(new Date().getFullYear());

	// ── Tab UI with keyboard navigation and hash routing ──────────────────────
	const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
	if (tabs.length) {
		const getPanel = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

		const activate = (tab, focus = true) => {
			tabs.forEach(t => {
				const is = t === tab;
				t.setAttribute('aria-selected', is ? 'true' : 'false');
				t.tabIndex = is ? 0 : -1;
				const panel = getPanel(t);
				if (panel) panel.hidden = !is;
			});
			history.replaceState(null, '', '#' + (tab.dataset.target || tab.getAttribute('aria-controls')));
			if (focus) tab.focus();
		};

		// Restore from hash or default to first tab
		const hash = location.hash.replace('#', '');
		const initial = tabs.find(t => (t.dataset.target || t.getAttribute('aria-controls')) === hash) || tabs[0];
		activate(initial, false);

		tabs.forEach((tab, idx) => {
			tab.addEventListener('click', () => activate(tab, true));
			tab.addEventListener('keydown', (e) => {
				let newIdx = idx;
				switch (e.key) {
					case 'ArrowRight': newIdx = (idx + 1) % tabs.length; tabs[newIdx].focus(); e.preventDefault(); break;
					case 'ArrowLeft':  newIdx = (idx - 1 + tabs.length) % tabs.length; tabs[newIdx].focus(); e.preventDefault(); break;
					case 'Home': tabs[0].focus(); e.preventDefault(); break;
					case 'End':  tabs[tabs.length - 1].focus(); e.preventDefault(); break;
					case 'Enter': case ' ': case 'Spacebar':
						e.preventDefault();
						activate(document.activeElement || tab, true);
						break;
				}
			});
		});

		window.addEventListener('popstate', () => {
			const h = location.hash.replace('#', '');
			const t = tabs.find(x => (x.dataset.target || x.getAttribute('aria-controls')) === h) || tabs[0];
			if (t) activate(t, false);
		});
	}

	// ── Theme selector ────────────────────────────────────────────────────────
	const themeSelect = document.getElementById('theme-select');
	const setTheme = (t) => document.documentElement.setAttribute('data-theme', t);
	const saved = localStorage.getItem('site-theme');
	if (saved) setTheme(saved);
	if (themeSelect) {
		if (saved) themeSelect.value = saved;
		themeSelect.addEventListener('change', () => {
			const val = themeSelect.value;
			setTheme(val);
			try { localStorage.setItem('site-theme', val); } catch {}
		});
	}

	// ── Publications: search, year filter, view toggle, collapsible abstracts ─
	const panel = document.getElementById('panel-pubs');
	if (panel) {
		const search = document.getElementById('pub-search');
		const yearFilter = document.getElementById('pub-year-filter');
		const toggleViewBtn = document.getElementById('pub-toggle-view');
		const noResults = document.getElementById('pub-no-results');
		const yearGroups = Array.from(panel.querySelectorAll('.pub-year-group'));
		const items = Array.from(panel.querySelectorAll('.pub-item'));

		// Populate year filter
		const years = yearGroups.map(g => g.querySelector('.pub-year-heading')?.textContent.trim()).filter(Boolean);
		Array.from(new Set(years)).sort((a, b) => b.localeCompare(a)).forEach(y => {
			const opt = document.createElement('option'); opt.value = y; opt.textContent = y; yearFilter.appendChild(opt);
		});

		// Collapsible abstracts — click title to toggle
		items.forEach(li => {
			const title = li.querySelector('.pub-title');
			const abs = li.querySelector('.pub-abstract');
			if (!title || !abs) return;
			title.style.cursor = 'pointer';
			title.setAttribute('role', 'button');
			title.tabIndex = 0;
			if (window.innerWidth < 720) abs.classList.add('collapsed');
			const toggle = () => abs.classList.toggle('collapsed');
			title.addEventListener('click', toggle);
			title.addEventListener('keydown', e => {
				if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); toggle(); }
			});
		});

		const update = () => {
			const q = (search?.value || '').trim().toLowerCase();
			let visible = 0;
			items.forEach(li => {
				const text = li.innerText.toLowerCase();
				const year = li.closest('.pub-year-group')?.querySelector('.pub-year-heading')?.textContent.trim() || '';
				const show = (yearFilter.value === 'all' || year === yearFilter.value) && (!q || text.includes(q));
				li.style.display = show ? '' : 'none';
				if (show) visible++;
			});
			yearGroups.forEach(g => {
				const any = g.querySelector('.pub-item:not([style*="display: none"])');
				g.style.display = any ? '' : 'none';
			});
			if (noResults) noResults.hidden = visible > 0;
		};

		search?.addEventListener('input', debounce(update, 150));
		yearFilter?.addEventListener('change', update);
		toggleViewBtn?.addEventListener('click', () => {
			const isCard = panel.classList.toggle('card-view');
			toggleViewBtn.setAttribute('aria-pressed', String(isCard));
			toggleViewBtn.textContent = isCard ? 'List view' : 'Card view';
		});

		update();
	}

	// ── Back to top ───────────────────────────────────────────────────────────
	const backToTop = document.getElementById('back-to-top');
	if (backToTop) {
		window.addEventListener('scroll', () => {
			backToTop.hidden = window.scrollY < 400;
		}, { passive: true });
		backToTop.addEventListener('click', (e) => {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	function debounce(fn, wait = 120) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; }
});

