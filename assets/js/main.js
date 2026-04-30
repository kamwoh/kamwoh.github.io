/* ==========================================================================
   Claude Code Loading Animation + Site Interactions
   ========================================================================== */

(function () {
  'use strict';

  // --- Spinner frames ---
  var SPINNER = ['\u280B','\u2819','\u2839','\u2838','\u283C','\u2834','\u2826','\u2827','\u2807','\u280F'];

  // --- Loader configs (per page / per referrer) ---
  var LOADERS = {
    home_initial: {
      command: 'Building kamwoh.github.io...',
      tasks: [
        { text: 'Reading about.md',             dur: 280 },
        { text: 'Loading publications...',      dur: 250 },
        { text: 'Rendering research papers...', dur: 300 },
        { text: 'Compiling stylesheets...',     dur: 220 },
        { text: 'Building page layout...',      dur: 260 }
      ],
      doneText: 'Site ready.'
    },
    home_from_blog: {
      command: 'cd ~/',
      tasks: [
        { text: 'Restoring session...',  dur: 200 },
        { text: 'Loading homepage...',   dur: 200 }
      ],
      doneText: 'Welcome back.'
    },
    blog_post: {
      command: '',
      tasks: [
        { text: 'Fetching post...',     dur: 180 },
        { text: 'Parsing markdown...',  dur: 180 },
        { text: 'Rendering article...', dur: 200 }
      ],
      doneText: 'Ready.'
    }
  };

  function pickLoader() {
    var path = window.location.pathname;
    var ref = document.referrer || '';

    if (/^\/blog\//.test(path)) {
      var slug = path.replace(/^\/blog\//, '').replace(/\.html$/, '').replace(/\/$/, '') || 'index';
      var cfg = {
        command: 'cat blog/' + slug + '.md',
        tasks: LOADERS.blog_post.tasks,
        doneText: LOADERS.blog_post.doneText
      };
      return cfg;
    }

    if (/\/blog\//.test(ref)) return LOADERS.home_from_blog;
    return LOADERS.home_initial;
  }

  // --- Helpers ---
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function typeText(el, text, speed) {
    return new Promise(function (resolve) {
      var i = 0;
      (function next() {
        if (i < text.length) {
          el.textContent += text[i++];
          setTimeout(next, speed);
        } else { resolve(); }
      })();
    });
  }

  // --- Loader sequence ---
  async function runLoader() {
    var typedEl   = document.getElementById('loader-typed');
    var cursorEl  = document.getElementById('loader-cursor');
    var tasksEl   = document.getElementById('loader-tasks');
    var loaderEl  = document.getElementById('loader');
    var siteEl    = document.getElementById('site');

    // Bail gracefully if the page has no loader DOM.
    if (!typedEl || !tasksEl || !loaderEl || !siteEl) {
      if (siteEl) {
        siteEl.classList.remove('hidden');
        siteEl.classList.add('visible');
      }
      return;
    }

    var config = pickLoader();

    // Phase 1: type command
    await sleep(200);
    await typeText(typedEl, config.command, 28);
    cursorEl.style.display = 'none';
    await sleep(200);

    // Phase 2: tasks with spinners
    var spinnerInterval = null;
    var spinnerFrame = 0;

    for (var i = 0; i < config.tasks.length; i++) {
      var task = config.tasks[i];

      // Create task DOM
      var line = document.createElement('div');
      line.className = 'loader__task';

      var spinnerSpan = document.createElement('span');
      spinnerSpan.className = 'loader__spinner';
      spinnerSpan.textContent = SPINNER[0];

      var textSpan = document.createElement('span');
      textSpan.className = 'loader__task-text';
      textSpan.textContent = task.text;

      line.appendChild(spinnerSpan);
      line.appendChild(textSpan);
      tasksEl.appendChild(line);

      // Animate in
      requestAnimationFrame(function(l) { return function() { l.classList.add('visible'); }; }(line));

      // Start spinner
      spinnerFrame = 0;
      spinnerInterval = setInterval(function(sp) {
        return function() {
          spinnerFrame = (spinnerFrame + 1) % SPINNER.length;
          sp.textContent = SPINNER[spinnerFrame];
        };
      }(spinnerSpan), 80);

      await sleep(task.dur);

      // Complete
      clearInterval(spinnerInterval);
      line.classList.add('done');

      var checkSpan = document.createElement('span');
      checkSpan.className = 'loader__check';
      checkSpan.textContent = '\u2713';
      line.replaceChild(checkSpan, spinnerSpan);
    }

    // Phase 3: done message
    await sleep(150);
    var doneLine = document.createElement('div');
    doneLine.className = 'loader__done';
    doneLine.innerHTML = '<span class="loader__check">\u2713</span> <span class="loader__done-text">' + config.doneText + '</span>';
    tasksEl.appendChild(doneLine);
    requestAnimationFrame(function() { doneLine.classList.add('visible'); });

    // Phase 4: transition to site
    await sleep(400);

    // Unhide site, start staggered animations
    siteEl.classList.remove('hidden');
    loaderEl.classList.add('fade-out');

    // Wait for loader fade, then reveal site content
    await sleep(200);
    siteEl.classList.add('visible');

    // Clean up loader after transition
    await sleep(400);
    loaderEl.remove();
  }

  // --- Smooth scroll for nav links ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // --- Skill modal ---
  function initSkillModal() {
    var modal = document.getElementById('skill-modal');
    var btn = document.getElementById('show-skill');
    var close = document.getElementById('skill-close');
    var backdrop = document.getElementById('skill-backdrop');

    if (!modal || !btn) return;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      modal.classList.add('open');
    });

    close.addEventListener('click', function() {
      modal.classList.remove('open');
    });

    backdrop.addEventListener('click', function() {
      modal.classList.remove('open');
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') modal.classList.remove('open');
    });
  }

  // --- Init ---
  function init() {
    initSmoothScroll();
    initSkillModal();

    if (document.readyState === 'complete') {
      runLoader();
    } else {
      window.addEventListener('load', runLoader);
    }
  }

  /* ── Lightbox (event delegation) ── */
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    var lightboxImg = lightbox.querySelector('.lightbox__img');
    var lightboxVideo = lightbox.querySelector('.lightbox__video');

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightboxImg.classList.remove('active');
      lightboxVideo.classList.remove('active');
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }

    document.addEventListener('click', function(e) {
      var img = e.target.closest('.timeline__gallery img');
      var video = e.target.closest('.timeline__gallery video');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxImg.style.background = img.style.background || '';
        lightboxImg.classList.add('active');
        lightboxVideo.classList.remove('active');
        lightbox.classList.add('open');
        return;
      }
      if (video) {
        lightboxVideo.src = video.src;
        lightboxVideo.classList.add('active');
        lightboxImg.classList.remove('active');
        lightbox.classList.add('open');
        return;
      }
      if (lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  function initAll() {
    init();
    initLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
