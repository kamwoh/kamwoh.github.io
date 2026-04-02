/* ==========================================================================
   Claude Code Loading Animation + Site Interactions
   ========================================================================== */

(function () {
  'use strict';

  // --- Spinner frames ---
  var SPINNER = ['\u280B','\u2819','\u2839','\u2838','\u283C','\u2834','\u2826','\u2827','\u2807','\u280F'];

  // --- Loader tasks ---
  var TASKS = [
    { text: 'Reading about.md',            dur: 280 },
    { text: 'Loading publications...',     dur: 250 },
    { text: 'Rendering research papers...', dur: 300 },
    { text: 'Compiling stylesheets...',    dur: 220 },
    { text: 'Building page layout...',     dur: 260 }
  ];

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

    // Phase 1: type command
    await sleep(200);
    await typeText(typedEl, 'Building kamwoh.github.io...', 28);
    cursorEl.style.display = 'none';
    await sleep(200);

    // Phase 2: tasks with spinners
    var spinnerInterval = null;
    var spinnerFrame = 0;

    for (var i = 0; i < TASKS.length; i++) {
      var task = TASKS[i];

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
    doneLine.innerHTML = '<span class="loader__check">\u2713</span> <span class="loader__done-text">Site ready.</span>';
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

  // --- Init ---
  function init() {
    initSmoothScroll();

    if (document.readyState === 'complete') {
      runLoader();
    } else {
      window.addEventListener('load', runLoader);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
