/* ===== TEXNEWS — MAIN APP LOGIC ===== */

// ── Category color mapping ────────────────────────────────────────
const CAT_COLORS = {
  'Politics':   'cat-politics',
  'Business':   'cat-business',
  'Culture':    'cat-culture',
  'Local News': 'cat-local-news',
};
const CAT_HEX = {
  'Politics':   '#002868',
  'Business':   '#16a34a',
  'Culture':    '#7c3aed',
  'Local News': '#d97706',
};

function getCatClass(cat) { return CAT_COLORS[cat] || 'cat-default'; }
function getCatHex(cat)   { return CAT_HEX[cat] || '#374151'; }

// ── Utilities ─────────────────────────────────────────────────────
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// ── INDEX PAGE ────────────────────────────────────────────────────
function initIndexPage() {
  if (!document.getElementById('postsGrid')) return;

  const featured   = POSTS.find(p => p.featured);
  const nonFeatured = POSTS.filter(p => !p.featured);

  renderHero(featured);
  renderTrendingSidebar(POSTS.slice(0, 5));
  renderCategoryWidget();
  renderPosts(nonFeatured);
  initFilters(nonFeatured);
  initSearch(nonFeatured);
  initNewsletter();
  updateDate();
}

// Hero / Featured Post
function renderHero(post) {
  if (!post) return;
  const section = document.getElementById('heroSection');
  if (!section) return;
  section.innerHTML = `
    <div class="hero-card" onclick="goToPost(${post.id})">
      <img src="${post.image}" alt="${post.title}" class="hero-image" loading="eager">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-meta">
          <span class="hero-label">Featured Story</span>
          <span class="hero-cat-badge">${post.category}</span>
        </div>
        <h1 class="hero-title">${post.title}</h1>
        <p class="hero-summary">${post.summary}</p>
        <div class="hero-info">
          <span class="hero-author">By <strong>${post.author}</strong></span>
          <span class="hero-date">${post.date}</span>
          <span class="hero-date">&#183; ${post.readTime}</span>
          <a href="post.html?id=${post.id}" class="hero-read-btn">
            Read Story
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>`;
}

// Render post cards grid
function renderPosts(posts) {
  const grid = document.getElementById('postsGrid');
  const noResults = document.getElementById('noResults');
  const resultsInfo = document.getElementById('resultsInfo');

  if (!posts.length) {
    grid.innerHTML = '';
    if (noResults) noResults.classList.add('visible');
    if (resultsInfo) resultsInfo.textContent = '';
    return;
  }
  if (noResults) noResults.classList.remove('visible');
  if (resultsInfo) {
    const q = document.getElementById('mainSearch')?.value.trim();
    const cat = document.querySelector('.filter-btn.active')?.dataset.cat;
    if (q) {
      resultsInfo.innerHTML = `Showing <strong>${posts.length}</strong> result${posts.length !== 1 ? 's' : ''} for "<strong>${q}</strong>"`;
    } else if (cat && cat !== 'All') {
      resultsInfo.innerHTML = `<strong>${posts.length}</strong> article${posts.length !== 1 ? 's' : ''} in <strong>${cat}</strong>`;
    } else {
      resultsInfo.innerHTML = `Latest <strong>${posts.length}</strong> articles`;
    }
  }

  grid.innerHTML = posts.map(post => `
    <div class="post-card" onclick="goToPost(${post.id})">
      <div class="card-img-wrap">
        <img src="${post.image}" alt="${post.title}" class="card-img" loading="lazy">
        <span class="card-category-badge ${getCatClass(post.category)}">${post.category}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${post.title}</h3>
        <p class="card-summary">${post.summary}</p>
        <div class="card-meta">
          <span class="card-meta-author">${post.author}</span>
          <div class="card-meta-right">
            <span class="card-meta-date">${post.date}</span>
            <span class="card-meta-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              ${post.readTime}
            </span>
          </div>
        </div>
      </div>
    </div>`).join('');
}

// Navigate to post
function goToPost(id) { window.location.href = `post.html?id=${id}`; }

// ── Filters ───────────────────────────────────────────────────────
function initFilters(allPosts) {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      const searchVal = document.getElementById('mainSearch')?.value.trim().toLowerCase() || '';
      let filtered = cat === 'All' ? allPosts : allPosts.filter(p => p.category === cat);
      if (searchVal) filtered = filtered.filter(p => matchesSearch(p, searchVal));
      renderPosts(filtered);
    });
  });
}

// ── Search ────────────────────────────────────────────────────────
function matchesSearch(post, q) {
  const haystack = `${post.title} ${post.summary} ${post.category} ${post.author} ${(post.tags || []).join(' ')}`.toLowerCase();
  return haystack.includes(q);
}

function initSearch(allPosts) {
  const input = document.getElementById('mainSearch');
  const clearBtn = document.getElementById('searchClear');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (clearBtn) clearBtn.classList.toggle('visible', q.length > 0);
    const activeCat = document.querySelector('.filter-btn.active')?.dataset.cat || 'All';
    let filtered = activeCat === 'All' ? allPosts : allPosts.filter(p => p.category === activeCat);
    if (q) filtered = filtered.filter(p => matchesSearch(p, q));
    renderPosts(filtered);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.remove('visible');
      input.dispatchEvent(new Event('input'));
      input.focus();
    });
  }

  // Sync with header search
  const headerInput = document.getElementById('headerSearch');
  if (headerInput) {
    headerInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && headerInput.value.trim()) {
        input.value = headerInput.value.trim();
        if (clearBtn) clearBtn.classList.add('visible');
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.dispatchEvent(new Event('input'));
      }
    });
  }
}

// ── Trending Sidebar ──────────────────────────────────────────────
function renderTrendingSidebar(posts) {
  const el = document.getElementById('trendingList');
  if (!el) return;
  el.innerHTML = posts.slice(0, 5).map((p, i) => `
    <div class="trending-item" onclick="goToPost(${p.id})">
      <span class="trending-num">0${i + 1}</span>
      <div class="trending-info">
        <div class="trending-cat">${p.category}</div>
        <div class="trending-title">${p.title}</div>
        <div class="trending-date">${p.date}</div>
      </div>
    </div>`).join('');
}

// ── Category Widget ───────────────────────────────────────────────
function renderCategoryWidget() {
  const el = document.getElementById('catLinks');
  if (!el) return;
  const cats = ['Politics', 'Business', 'Culture', 'Local News'];
  el.innerHTML = cats.map(cat => {
    const count = POSTS.filter(p => p.category === cat).length;
    return `
      <button class="cat-link" onclick="filterByCat('${cat}')">
        <span class="cat-link-name">
          <span class="cat-link-dot" style="background:${getCatHex(cat)}"></span>
          ${cat}
        </span>
        <span class="cat-link-count">${count}</span>
      </button>`;
  }).join('');
}

function filterByCat(cat) {
  const btn = document.querySelector(`.filter-btn[data-cat="${cat}"]`);
  if (btn) {
    btn.click();
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

// ── Newsletter ────────────────────────────────────────────────────
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput?.value) return;
    form.style.display = 'none';
    const success = document.getElementById('newsletterSuccess');
    if (success) success.classList.add('visible');
  });
}

// ── Date display ──────────────────────────────────────────────────
function updateDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── POST PAGE ─────────────────────────────────────────────────────
function initPostPage() {
  const postContent = document.getElementById('postContent');
  if (!postContent) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  const slug = params.get('slug');

  let post = POSTS.find(p => p.id === id);
  if (!post && slug) post = POSTS.find(p => p.slug === slug);
  if (!post) {
    postContent.innerHTML = '<div class="no-results visible"><div class="no-results-icon">📰</div><h3>Article not found</h3><p><a href="index.html" style="color:var(--texas-red)">Return to homepage</a></p></div>';
    return;
  }

  // Update page title
  document.title = `${post.title} — TEXNEWS`;

  // Update meta og tags if present
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', post.title);

  // Hero image
  const heroImg = document.getElementById('postHeroImg');
  if (heroImg) { heroImg.src = post.image; heroImg.alt = post.title; }

  // Hero content
  const heroCat = document.getElementById('postHeroCat');
  if (heroCat) {
    heroCat.textContent = post.category;
    heroCat.className = `post-hero-cat ${getCatClass(post.category)}`;
    heroCat.style.background = getCatHex(post.category);
  }
  const heroTitle = document.getElementById('postHeroTitle');
  if (heroTitle) heroTitle.textContent = post.title;

  const heroAuthor = document.getElementById('postHeroAuthor');
  if (heroAuthor) heroAuthor.innerHTML = `By <strong>${post.author}</strong>`;

  const heroDate = document.getElementById('postHeroDate');
  if (heroDate) heroDate.textContent = post.date;

  const heroTime = document.getElementById('postHeroTime');
  if (heroTime) heroTime.textContent = post.readTime;

  // Breadcrumb
  const breadcrumbCat = document.getElementById('breadcrumbCat');
  if (breadcrumbCat) {
    breadcrumbCat.textContent = post.category;
    breadcrumbCat.href = `index.html?cat=${encodeURIComponent(post.category)}`;
  }
  const breadcrumbTitle = document.getElementById('breadcrumbTitle');
  if (breadcrumbTitle) breadcrumbTitle.textContent = post.title.length > 60 ? post.title.slice(0, 57) + '…' : post.title;

  // Caption
  const captionEl = document.getElementById('postCaption');
  if (captionEl && post.imageCaption) captionEl.textContent = post.imageCaption;

  // Body
  const bodyEl = document.getElementById('postBody');
  if (bodyEl) bodyEl.innerHTML = post.content || '<p>Full article content coming soon.</p>';

  // Tags
  const tagsEl = document.getElementById('postTags');
  if (tagsEl && post.tags?.length) {
    tagsEl.innerHTML = (post.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('');
  }

  // Author bio
  const bioEl = document.getElementById('authorBio');
  if (bioEl) {
    bioEl.querySelector('.author-avatar').textContent = getInitials(post.author);
    bioEl.querySelector('.author-name').textContent = post.author;
    bioEl.querySelector('.author-title').textContent = post.authorTitle || 'TEXNEWS Reporter';
  }

  // Related posts
  renderRelatedPosts(post);

  // Trending sidebar on post page
  renderTrendingSidebar(POSTS.filter(p => p.id !== post.id).slice(0, 4));

  // Share buttons
  initShare(post);
}

function renderRelatedPosts(currentPost) {
  const el = document.getElementById('relatedPosts');
  if (!el) return;
  const related = POSTS.filter(p => p.category === currentPost.category && p.id !== currentPost.id).slice(0, 3);
  if (!related.length) { el.parentElement?.remove(); return; }
  el.innerHTML = related.map(p => `
    <div class="related-card" onclick="goToPost(${p.id})">
      <img src="${p.image}" alt="${p.title}" class="related-img" loading="lazy">
      <div class="related-info">
        <div class="related-cat">${p.category}</div>
        <div class="related-title">${p.title}</div>
        <div class="related-date">${p.date}</div>
      </div>
    </div>`).join('');
}

function initShare(post) {
  const url = window.location.href;

  const twBtn = document.getElementById('shareTwitter');
  if (twBtn) twBtn.onclick = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`, '_blank');

  const fbBtn = document.getElementById('shareFacebook');
  if (fbBtn) fbBtn.onclick = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');

  const copyBtn = document.getElementById('shareCopy');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(url).then(() => {
        copyBtn.innerHTML = '&#10003; Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.innerHTML = '&#128279; Copy Link';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    };
  }
}

// ── Mobile Navigation ─────────────────────────────────────────────
function initMobileNav() {
  const toggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn = document.getElementById('mobileNavClose');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => mobileNav.classList.add('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => mobileNav.classList.remove('open'));
    mobileNav.addEventListener('click', e => {
      if (e.target === mobileNav) mobileNav.classList.remove('open');
    });
  }
}

// ── Scroll-to-top ─────────────────────────────────────────────────
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Active nav highlighting ───────────────────────────────────────
function highlightNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (path.endsWith('index.html') || path.endsWith('/')) {
      if (href.includes('index.html') || href === '/') link.classList.add('active');
    } else if (path.endsWith('post.html')) {
      // no nav item for post
    }
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollTop();
  highlightNav();

  fetch('/posts.json')
    .then(r => r.json())
    .then(data => {
      window.POSTS = data;
      initIndexPage();
      initPostPage();
    })
    .catch(() => {
      // fallback: POSTS already defined by data/posts.js script tag
      if (typeof POSTS !== 'undefined') {
        initIndexPage();
        initPostPage();
      }
    });
});
