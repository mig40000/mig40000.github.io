document.addEventListener('DOMContentLoaded', () => {

  /* ── Footer year ──────────────────────────────────────────── */
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = String(new Date().getFullYear());

  /* ── Theme toggle (light / dark) ──────────────────────────── */
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('site-theme');
  const initial = stored || 'dark';            // dark is the default; light is opt-in
  root.setAttribute('data-theme', initial);

  const syncToggleLabel = () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    const label = themeToggle?.querySelector('.theme-label');
    if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
    themeToggle?.setAttribute('aria-pressed', String(isDark));
  };
  syncToggleLabel();

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('site-theme', next); } catch {}
    syncToggleLabel();
  });

  /* ── Section routing — show one section at a time ─────────── */
  const navLinks = Array.from(document.querySelectorAll('.section-nav a'));
  const sections = Array.from(document.querySelectorAll('.content .section'));
  const mainEl = document.querySelector('.content');

  if (navLinks.length && sections.length) {
    const show = (id, { push = true, scroll = true } = {}) => {
      const target = document.getElementById(id) || sections[0];
      const activeId = target.id;

      sections.forEach(s => { s.hidden = s.id !== activeId; });
      navLinks.forEach(a => {
        const isActive = a.getAttribute('href') === '#' + activeId;
        a.classList.toggle('active', isActive);
        if (isActive) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });

      // retrigger the entrance animation each time a section is shown
      target.classList.remove('section--enter');
      void target.offsetWidth;
      target.classList.add('section--enter');

      if (push) history.pushState({ id: activeId }, '', '#' + activeId);
      if (scroll) {
        if (window.innerWidth <= 900) mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0 });
      }
    };

    navLinks.forEach(a => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (document.getElementById(id)) { e.preventDefault(); show(id); }
    }));

    window.addEventListener('popstate', () => {
      show(location.hash.slice(1) || sections[0].id, { push: false });
    });

    const startId = location.hash.slice(1);
    show(document.getElementById(startId) ? startId : sections[0].id, { push: false, scroll: false });
  }

  /* ── News: show more / less ───────────────────────────────── */
  const newsList = document.querySelector('.news-list');
  const newsToggle = document.getElementById('news-toggle');
  if (newsList && newsToggle) {
    const items = Array.from(newsList.querySelectorAll('li'));
    const collapsedCount = 4;
    const extra = items.slice(collapsedCount);
    if (extra.length) {
      const setExpanded = (expanded) => {
        extra.forEach(li => { li.hidden = !expanded; });
        newsToggle.setAttribute('aria-expanded', String(expanded));
        newsToggle.textContent = expanded ? 'Show less' : `Show ${extra.length} more`;
      };
      setExpanded(false);
      newsToggle.hidden = false;
      newsToggle.addEventListener('click', () => {
        setExpanded(newsToggle.getAttribute('aria-expanded') !== 'true');
      });
    }
  }

  /* ── Publications: search, filter, view, abstracts ────────── */
  const panel = document.getElementById('publications');
  if (panel) {
    const search = document.getElementById('pub-search');
    const yearFilter = document.getElementById('pub-year-filter');
    const typeFilter = document.getElementById('pub-type-filter');
    const toggleViewBtn = document.getElementById('pub-toggle-view');
    const yearGroups = Array.from(panel.querySelectorAll('.pub-year-group'));
    const items = Array.from(panel.querySelectorAll('.pub-item'));

    const yearOf = (el) =>
      el.closest('.pub-year-group')?.querySelector('.pub-year-heading')?.textContent.trim() || '';

    // Classify each entry by venue text and prepend a type tag (kept in JS so
    // new entries are tagged automatically — no per-item markup needed).
    const classify = (venue) => {
      const v = venue.toLowerCase();
      if (/arxiv/.test(v))                                                             return ['Preprint', 'preprint'];
      if (/thesis/.test(v))                                                            return ['Thesis', 'thesis'];
      if (/zenodo|artifact/.test(v))                                                   return ['Artifact', 'artifact'];
      if (/workshop|\bvst\b|\brew\b/.test(v))                                          return ['Workshop', 'workshop'];
      if (/journal of|transactions|science of computer|\btosem\b|systems and software/.test(v)) return ['Journal', 'journal'];
      if (/journal-first|journal first/.test(v))                                       return ['Journal-First', 'journal'];
      if (/journal/.test(v))                                                           return ['Journal', 'journal'];
      return ['Conference', 'conference'];
    };
    // Flagship venues that make up the curated "Selected Publications" list
    const FLAGSHIP = /\b(icse|fse|esec|issta|ase|issre|tosem|fm|pldi|esorics)\b/;
    items.forEach(li => {
      const venueEl = li.querySelector('.pub-venue');
      if (!venueEl || venueEl.querySelector('.pub-type')) return;
      const venueText = venueEl.textContent;
      const [label, kind] = classify(venueText);
      li.dataset.pubType = kind;
      if (FLAGSHIP.test(venueText.toLowerCase())) li.dataset.featured = 'true';
      const tag = document.createElement('span');
      tag.className = `pub-type pub-type--${kind}`;
      tag.textContent = label;
      venueEl.prepend(tag);
    });

    // Build the Selected Publications list by cloning the flagship entries
    // (single source of truth stays the full list below)
    const selectedWrap = document.getElementById('pub-selected-wrap');
    const selectedList = panel.querySelector('.pub-selected-list');
    const featured = items.filter(li => li.dataset.featured === 'true');
    if (selectedList && featured.length) {
      featured.forEach(li => {
        const clone = li.cloneNode(true);
        clone.removeAttribute('style');
        selectedList.appendChild(clone);
      });
      if (selectedWrap) selectedWrap.hidden = false;
    }

    // Populate year filter
    const years = yearGroups
      .map(g => g.querySelector('.pub-year-heading')?.textContent.trim())
      .filter(Boolean);
    Array.from(new Set(years)).sort((a, b) => b.localeCompare(a)).forEach(y => {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      yearFilter.appendChild(opt);
    });

    // Populate type filter from the kinds actually present
    const TYPE_LABEL = { journal: 'Journal', conference: 'Conference', workshop: 'Workshop', preprint: 'Preprint', artifact: 'Artifact', thesis: 'Thesis' };
    const present = new Set(items.map(li => li.dataset.pubType).filter(Boolean));
    ['journal', 'conference', 'workshop', 'preprint', 'artifact', 'thesis'].forEach(t => {
      if (!present.has(t)) return;
      const opt = document.createElement('option');
      opt.value = t; opt.textContent = TYPE_LABEL[t];
      typeFilter?.appendChild(opt);
    });

    // Collapsible abstracts — collapsed by default, click title to reveal.
    // Query fresh so the cloned Selected entries get wired too.
    Array.from(panel.querySelectorAll('.pub-item')).forEach(li => {
      const title = li.querySelector('.pub-title');
      const abs = li.querySelector('.pub-abstract');
      if (!title || !abs) return;
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-expanded', 'false');
      abs.classList.add('collapsed');
      const toggle = () => {
        const collapsed = abs.classList.toggle('collapsed');
        title.setAttribute('aria-expanded', String(!collapsed));
      };
      title.addEventListener('click', toggle);
      title.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });

    // "No results" message is created on demand so it never ships in the static
    // HTML — it exists only after an active search/filter matches nothing.
    const groupsWrap = panel.querySelector('.pub-groups');
    let noResultsEl = null;
    const showNoResults = (show) => {
      if (show && !noResultsEl) {
        noResultsEl = document.createElement('p');
        noResultsEl.className = 'no-results';
        noResultsEl.setAttribute('role', 'status');
        noResultsEl.textContent = 'No publications match your search.';
        groupsWrap?.before(noResultsEl);
      }
      if (noResultsEl) noResultsEl.hidden = !show;
    };

    const update = () => {
      const q = (search?.value || '').trim().toLowerCase();
      const ty = typeFilter?.value || 'all';
      const filtering = q !== '' || yearFilter.value !== 'all' || ty !== 'all';
      let visible = 0;
      items.forEach(li => {
        const matchesYear = yearFilter.value === 'all' || yearOf(li) === yearFilter.value;
        const matchesType = ty === 'all' || li.dataset.pubType === ty;
        const matchesText = !q || li.innerText.toLowerCase().includes(q);
        const show = matchesYear && matchesType && matchesText;
        li.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      yearGroups.forEach(g => {
        const anyVisible = Array.from(g.querySelectorAll('.pub-item'))
          .some(li => li.style.display !== 'none');
        g.style.display = anyVisible ? '' : 'none';
      });
      // Hide the curated Selected list while actively searching/filtering
      if (selectedWrap && featured.length) selectedWrap.hidden = filtering;
      // Only surface the empty state when a filter is active and nothing matched
      showNoResults(filtering && visible === 0);
    };

    search?.addEventListener('input', debounce(update, 150));
    yearFilter?.addEventListener('change', update);
    typeFilter?.addEventListener('change', update);
    toggleViewBtn?.addEventListener('click', () => {
      const isCard = panel.classList.toggle('card-view');
      toggleViewBtn.setAttribute('aria-pressed', String(isCard));
      toggleViewBtn.textContent = isCard ? 'List view' : 'Card view';
    });

    update();
  }

  /* ── Back to top ──────────────────────────────────────────── */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.hidden = window.scrollY < 500;
    }, { passive: true });
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function debounce(fn, wait = 120) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
  }
});
