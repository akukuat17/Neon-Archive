const $ = s => document.querySelector(s);
const genres = [...new Set(games.map(g => g.genre))].sort();

if ($('#unggulan')) {
  $('#unggulan').innerHTML = [...games].sort((a, b) => b.rating - a.rating).slice(0, 4).map(kartu).join('');
  $('#genreCepat').innerHTML = genres.map(g => `<a href="katalog.html?genre=${encodeURIComponent(g)}">${g}</a>`).join('');
}

if ($('#grid')) {
  $('#grid').innerHTML = Array.from({length: 20}, () => `
    <article class="kartu skeleton">
      <a class="sampul" href="#"><img src="" alt=""><span class="badge"><span class="rating-stars" style="color:var(--on-aksen)">${ratingStars(4.5)}</span></span></a>
      <div class="isi"></div>
    </article>
  `).join('');

  $('#fGenre').innerHTML += genres.map(g => `<option>${g}</option>`).join('');
  const p = new URLSearchParams(location.search).get('genre');
  if (p && genres.includes(p)) $('#fGenre').value = p;


  const suggestions = [...new Set(games.flatMap(g => [g.judul, g.genre, g.developer, ...g.platform]))].sort((a, b) => a.localeCompare(b));
  let debounceTimer;
  $('#q').addEventListener('input', e => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const val = e.target.value.trim().toLowerCase();
      if (val.length < 2) { hideSuggestions(); return; }
      const seen = new Set();
      const matches = suggestions.filter(s => {
        const k = s.toLowerCase();
        return k.includes(val) && !seen.has(k) && seen.add(k);
      }).slice(0, 6);
      showSuggestions(matches, val);
    }, 150);
  });

  function showSuggestions(items, query) {
    let el = $('#suggestions');
    if (!el) {
      // Bungkus input dalam container relatif supaya dropdown tidak full-viewport
      const wrap = document.createElement('div');
      wrap.className = 'q-wrap';
      const input = $('#q');
      input.parentElement.insertBefore(wrap, input);
      wrap.appendChild(input);
      el = document.createElement('div');
      el.id = 'suggestions';
      el.className = 'suggestions';
      el.hidden = true;
      wrap.appendChild(el);
    }
    if (items.length === 0) { el.hidden = true; return; }
    el.innerHTML = items.map(s => `<button type="button" tabindex="-1">${highlightText(escapeHtml(s), escapeHtml(query))}</button>`).join('');
    el.hidden = false;
    el.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('mousedown', e => e.preventDefault());
      btn.addEventListener('click', () => {
        $('#q').value = btn.textContent;
        hideSuggestions();
        render();
      });
    });
  }
  function hideSuggestions() {
    const el = $('#suggestions');
    if (el) el.hidden = true;
  }
  $('#q').addEventListener('blur', hideSuggestions);
  document.addEventListener('click', e => {
    if (!e.target.closest('.alat')) hideSuggestions();
  });


  let allFiltered = [];
  let renderedCount = 0;
  const BATCH_SIZE = 12;
  let isLoading = false;
  let observer = null;

  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function cocok(g, q) {
    if (!q) return true;
    return g.judul.toLowerCase().includes(q)
      || g.developer.toLowerCase().includes(q)
      || g.genre.toLowerCase().includes(q)
      || g.platform.some(p => p.toLowerCase().includes(q))
      || String(g.tahunRilis).includes(q);
  }

  function getFilteredGames() {
    const q = $('#q').value.trim().toLowerCase();
    const gn = $('#fGenre').value;
    const pf = $('#fPlatform').value;
    const fo = $('#fFav').checked;
    const u = $('#fUrut').value;

    const h = games.filter(g =>
      cocok(g, q) &&
      (!gn || g.genre === gn) &&
      (!pf || g.platform.includes(pf)) &&
      (!fo || isFav(g.id))
    );

    const cmp = {
      'rt-desc': (a, b) => b.rating - a.rating,
      'rt-asc': (a, b) => a.rating - b.rating,
      'judul': (a, b) => a.judul.localeCompare(b.judul, 'id'),
      'baru': (a, b) => b.tahunRilis - a.tahunRilis
    }[u];

    h.sort(cmp || ((a, b) => b.rating - a.rating));
    return h;
  }

  // Escape per-segmen agar query dengan karakter khusus (& < >) tetap aman
  function hl(raw, q) {
    const text = String(raw);
    if (!q) return escapeHtml(text);
    const i = text.toLowerCase().indexOf(q);
    if (i === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0, i))
      + '<mark class="search-highlight">' + escapeHtml(text.slice(i, i + q.length)) + '</mark>'
      + escapeHtml(text.slice(i + q.length));
  }

  function renderBatch(append = false) {
    if (isLoading) return;
    isLoading = true;

    const nextBatch = allFiltered.slice(renderedCount, renderedCount + BATCH_SIZE);
    if (nextBatch.length === 0) {
      if (!append) {
        $('#grid').innerHTML = '';
        $('#kosong').hidden = false;
      }
      $('#info').textContent = allFiltered.length + ' game ditampilkan';
      if (observer) { observer.disconnect(); observer = null; }
      isLoading = false;
      return;
    }

    const q = $('#q').value.trim().toLowerCase();
    const html = nextBatch.map(g => kartu({ ...g, judulTampil: hl(g.judul, q) })).join('');

    if (append) {
      $('#grid').insertAdjacentHTML('beforeend', html);
    } else {
      $('#grid').innerHTML = html;
    }

    renderedCount += nextBatch.length;
    $('#kosong').hidden = true;
    $('#info').textContent = allFiltered.length + ' game ditampilkan';
    isLoading = false;


    if (renderedCount < allFiltered.length && !observer) {
      setupObserver();
    }
  }

  function setupObserver() {
    const sentinel = document.createElement('div');
    sentinel.id = 'load-sentinel';
    sentinel.style.height = '20px';
    $('#grid').parentElement.appendChild(sentinel);

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading) {
        renderBatch(true);
      }
    }, {rootMargin: '200px', threshold: 0.1});
    observer.observe(sentinel);
  }

  function render() {
    allFiltered = getFilteredGames();
    renderedCount = 0;
    if (observer) { observer.disconnect(); observer = null; }
    const sentinel = $('#load-sentinel');
    if (sentinel) sentinel.remove();
    renderBatch(false);
  }

  let renderTimer;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  }

  ['#q', '#fGenre', '#fPlatform', '#fUrut'].forEach(s => $(s).addEventListener('input', scheduleRender));
  $('#fFav').addEventListener('change', render);
  document.addEventListener('favchange', () => { if ($('#fFav').checked) render(); });

  const kosongEl = $('#kosong');
  if (kosongEl) {
    kosongEl.addEventListener('click', e => {
      if (e.target.id === 'resetFilter') {
        $('#q').value = '';
        $('#fGenre').value = '';
        $('#fPlatform').value = '';
        $('#fUrut').value = 'rt-desc';
        $('#fFav').checked = false;
        hideSuggestions();
        render();
      }
    });
  }

  render();
}