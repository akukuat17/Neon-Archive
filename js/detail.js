const g = games.find((x) => x.id === new URLSearchParams(location.search).get("id"));
const el = document.getElementById("detail");

if (!g) {
  el.innerHTML =
    '<h1>Game tidak ditemukan</h1><p>Id game tidak valid. <a href="katalog.html">Kembali ke katalog</a></p>';
} else {
  document.title = g.judul + " | NEON ARCHIVE";
  const f = isFav(g.id);
  const trailer = g.trailerUrl
    ? `<iframe class="video" src="${g.trailerUrl}" title="Trailer ${g.judul}" allowfullscreen loading="lazy"></iframe>`
    : `<p>Trailer belum diisi. <a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(g.judul + " trailer")}">Cari trailer di YouTube</a></p>`;

  const stars = ratingStars(g.rating);
  const platforms = g.platform.map((p) => `${platformIcon(p)} ${p}`).join(" ");

  const paras = String(g.deskripsi || "")
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  const [awal, ...sisa] = paras;

  let deskripsiHtml;
  if (sisa.length === 0) {
    deskripsiHtml = `<div class="desc">${awal ? `<p>${awal}</p>` : ""}</div>`;
  } else {
    deskripsiHtml = `<div class="desc desc-terbatas" id="descGame">
      <p>${awal}</p>
      <div class="desc-akhir">${sisa.map((p) => `<p>${p}</p>`).join("")}</div>
      <span class="desc-fade" aria-hidden="true"></span>
    </div>
    <button type="button" class="desc-toggle" id="descToggle" aria-expanded="false" aria-controls="descGame">Baca selengkapnya</button>`;
  }

  el.innerHTML = `<div class="det">
    <img src="${g.poster}" alt="Poster ${g.judul}">
    <div>
      <h1>${g.judul}</h1>
      <span class="tag" data-genre="${g.genre}">${g.genre}</span>
      <div class="platforms">${platforms}</div>
      <span class="tag">${g.tahunRilis}</span>
      <span class="tag">${stars}</span>
      <p class="meta">Developer: ${g.developer}</p>
      ${deskripsiHtml}
      <div class="aksi">
        <button class="btn fav${f ? " on" : ""}" data-id="${g.id}" aria-pressed="${f}">${f ? "♥ Hapus dari favorit" : "♡ Simpan ke favorit"}</button>
        <a class="btn" href="${g.linkResmi}" target="_blank" rel="noopener">Link resmi</a>
        <button class="btn share" data-id="${g.id}">Bagikan</button>
        <a class="btn secondary" href="katalog.html">Kembali</a>
      </div>
    </div>
  </div>
  <section><h2>Trailer</h2>${trailer}</section>
  <section><h2>Galeri</h2><div class="galeri">${g.screenshots.map((s, i) => `<img src="${s}" alt="Screenshot ${i + 1} ${g.judul}" loading="lazy">`).join("")}</div></section>
  <section id="recently-viewed" class="recently-viewed" style="display:none"></section>`;

  const toggle = document.getElementById("descToggle");
  const desc = document.getElementById("descGame");
  if (toggle && desc) {
    toggle.addEventListener("click", () => {
      const terbuka = desc.classList.toggle("desc-terbatas") === false;
      toggle.textContent = terbuka ? "Tampilkan lebih sedikit" : "Baca selengkapnya";
      toggle.setAttribute("aria-expanded", String(terbuka));
    });
  }

  addRecentlyViewed(g);
  renderRecentlyViewed();
}
