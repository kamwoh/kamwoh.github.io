/* ==========================================================================
   Site Interactions
   ========================================================================== */

(function () {
  'use strict';

  // --- Reveal site ---
  function revealSite() {
    var siteEl = document.getElementById('site');
    if (siteEl) siteEl.classList.add('visible');
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

    revealSite();
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
