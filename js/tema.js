const sfx = new Audio("media/audio/klik.wav");
sfx.volume = 0.25;

const getFav = () => {
  try {
    return JSON.parse(localStorage.getItem("fav") || "[]");
  } catch {
    return [];
  }
};
const isFav = (id) => getFav().includes(id);

function setTema(t) {
  document.documentElement.dataset.tema = t;
  try {
    localStorage.setItem("tema", t);
  } catch {}
}
try {
  document.documentElement.dataset.tema = localStorage.getItem("tema") || "gelap";
} catch {}

function showToast(message, type = "info", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const icons = {
    success:
      '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error:
      '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
  };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type]}<span class="toast-text">${message}</span><button class="toast-close" aria-label="Tutup"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;
  container.appendChild(toast);
  toast.querySelector(".toast-close").addEventListener("click", () => removeToast(toast));
  const timer = setTimeout(() => removeToast(toast), duration);
  toast.addEventListener("mouseenter", () => clearTimeout(timer));
}
function removeToast(toast) {
  toast.classList.add("removing");
  toast.addEventListener("animationend", () => toast.remove());
}

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea, select")) return;
  if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    const searchInput = document.getElementById("q");
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
  if (e.key === "Escape") {
    const suggestions = document.getElementById("suggestions");
    if (suggestions && !suggestions.hidden) {
      suggestions.hidden = true;
    }
    const searchInput = document.getElementById("q");
    if (searchInput === document.activeElement) {
      searchInput.blur();
    }
  }
});

async function shareGame(game) {
  const data = { title: game.judul, text: game.deskripsi.slice(0, 100) + "...", url: window.location.href };
  try {
    if (navigator.share) {
      await navigator.share(data);
      showToast("Berhasil dibagikan", "success");
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link disalin ke clipboard", "success");
    }
  } catch (err) {
    if (err.name !== "AbortError") showToast("Gagal membagikan", "error");
  }
}

function addRecentlyViewed(game) {
  try {
    let recent = JSON.parse(localStorage.getItem("recent") || "[]");
    recent = recent.filter((g) => g.id !== game.id);
    recent.unshift({
      id: game.id,
      judul: game.judul,
      poster: game.poster,
      genre: game.genre,
      rating: game.rating,
    });
    if (recent.length > 6) recent = recent.slice(0, 6);
    localStorage.setItem("recent", JSON.stringify(recent));
  } catch {}
}
function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem("recent") || "[]");
  } catch {
    return [];
  }
}
function renderRecentlyViewed() {
  const container = document.getElementById("recently-viewed");
  if (!container) return;
  const recent = getRecentlyViewed();
  if (recent.length === 0) {
    container.style.display = "none";
    return;
  }
  container.style.display = "block";
  container.innerHTML = `
    <h3>Terbaru dilihat</h3>
    <div class="recently-list">
      ${recent
        .map(
          (g) => `
        <a class="recently-item" href="detail.html?id=${g.id}">
          <img src="${g.poster}" alt="${g.judul}" loading="lazy">
          <div class="recently-info">
            <div class="recently-title">${g.judul}</div>
            <div class="recently-meta">${g.genre} • ${ratingStars(g.rating)}</div>
          </div>
        </a>
      `,
        )
        .join("")}
    </div>
  `;
}

function ratingStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const star = (fill) =>
    fill === 1
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
      : fill === 0.5
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><defs><linearGradient id="half" x1="0" y1="0" x2="100%" y2="0"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half)"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  return `<span class="rating-stars" aria-label="Rating ${rating}">${star(1).repeat(full)}${half ? star(0.5) : ""}${star(0).repeat(empty)}</span>`;
}

function platformIcon(platform) {
  const icons = {
    PC: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    Konsol:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 0-10 10c0 4.4 3.5 8 8 8h4v-8H4V12c0-3.3 2.7-6 6-6h4V2h4v4h4z"/></svg>',
    Mobile:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  };
  return `<span class="platform-icon" data-platform="${platform}">${icons[platform] || platform}</span>`;
}

function highlightText(text, query) {
  if (!query) return String(text);
  const q = String(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!q) return String(text);
  return String(text).replace(new RegExp(q, "gi"), (m) => `<mark class="search-highlight">${m}</mark>`);
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav");
  if (!toggle || !nav) return;
  const set = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "✕" : "☰";
  };
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    set(!nav.classList.contains("open"));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("click", (e) => {
    if (!e.target.closest("nav, .nav-toggle")) set(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") set(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) set(false);
  });
}
document.addEventListener("DOMContentLoaded", initMobileNav);

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
  );

  document.querySelectorAll("section, .grid").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("visible");
      observer.unobserve(el);
    }
  });
}
document.addEventListener("DOMContentLoaded", initScrollReveal);

function kartu(g) {
  const f = isFav(g.id);
  const stars = ratingStars(g.rating);
  const judulTampil = g.judulTampil || g.judul;
  const judulAlt = String(g.judul).replace(/[<>&"]/g, "");
  return `<article class="kartu"><a class="sampul" href="detail.html?id=${g.id}"><img src="${g.poster}" alt="Poster ${judulAlt}" loading="lazy"><span class="badge">${stars}</span></a>
  <div class="isi"><h3><a href="detail.html?id=${g.id}">${judulTampil}</a></h3>
  <span class="tag" data-genre="${g.genre}">${g.genre}</span>
  <button class="fav${f ? " on" : ""}" data-id="${g.id}" aria-label="Favorit ${judulAlt}" aria-pressed="${f}">${f ? "♥" : "♡"}</button></div></article>`;
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("button, .btn");
  if (b) {
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }
  if (e.target.closest("#btnTema"))
    setTema(document.documentElement.dataset.tema === "terang" ? "gelap" : "terang");
  const fv = e.target.closest(".fav");
  if (fv) {
    let l = getFav();
    const id = fv.dataset.id;
    l = l.includes(id) ? l.filter((x) => x !== id) : [...l, id];
    try {
      localStorage.setItem("fav", JSON.stringify(l));
    } catch {}
    const on = l.includes(id);
    fv.classList.toggle("on", on);
    fv.setAttribute("aria-pressed", on);
    fv.textContent = fv.classList.contains("btn")
      ? on
        ? "♥ Hapus dari favorit"
        : "♡ Simpan ke favorit"
      : on
        ? "♥"
        : "♡";
    document.dispatchEvent(new Event("favchange"));
    showToast(on ? "Ditambah ke favorit" : "Dihapus dari favorit", on ? "success" : "info");
  }
  if (e.target.closest(".btn.share")) {
    const id = e.target.closest(".btn.share").dataset.id;
    const game = games.find((g) => g.id === id);
    if (game) shareGame(game);
  }
});
