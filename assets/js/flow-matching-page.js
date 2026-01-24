/**
 * Flow-Matching Noise-to-Page Animation
 * Shows colorful RGB noise that fades to transparent, revealing the page underneath
 * Only plays on the main page (homepage)
 */
(function() {
  'use strict';

  // Only run on the main page (root path)
  const path = window.location.pathname;
  if (path !== '/' && path !== '/index.html' && path !== '') {
    return;
  }

  // Configuration
  const CONFIG = {
    duration: 1000,         // Fade duration in ms
    totalSteps: 50,         // Total denoising steps
    easing: 'easeInCubic'   // Slow at start, fast at end
  };

  // Easing functions
  const easingFunctions = {
    linear: t => t,
    easeInCubic: t => t * t * t,
    easeInQuad: t => t * t,
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeOutQuad: t => 1 - (1 - t) * (1 - t)
  };

  // Generate colorful RGB noise
  function generateColorfulNoise(width, height) {
    const imageData = new ImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.floor(Math.random() * 256);     // R
      data[i + 1] = Math.floor(Math.random() * 256); // G
      data[i + 2] = Math.floor(Math.random() * 256); // B
      data[i + 3] = 255; // A
    }

    return imageData;
  }

  class FlowMatchingPage {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.textDiv = null;
      this.noiseData = null;
      this.width = 0;
      this.height = 0;

      this.init();
    }

    init() {
      this.createOverlay();

      // Start fade animation when page is ready
      if (document.readyState === 'complete') {
        this.animate();
      } else {
        window.addEventListener('load', () => this.animate());
      }
    }

    createOverlay() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Create overlay canvas
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'flow-matching-overlay';
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 99999;
        pointer-events: none;
      `;

      // Create text overlay for step counter
      this.textDiv = document.createElement('div');
      this.textDiv.id = 'flow-matching-text';
      this.textDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 100000;
        pointer-events: none;
        font-family: monospace;
        font-size: 24px;
        color: white;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        white-space: nowrap;
      `;
      this.textDiv.textContent = 'Denoising the website [0/50]';

      document.documentElement.appendChild(this.canvas);
      document.documentElement.appendChild(this.textDiv);
      this.ctx = this.canvas.getContext('2d');

      // Generate and store noise data
      this.noiseData = generateColorfulNoise(this.width, this.height);
      this.ctx.putImageData(this.noiseData, 0, 0);
    }

    animate() {
      const startTime = performance.now();
      const easing = easingFunctions[CONFIG.easing] || easingFunctions.linear;

      const tick = (currentTime) => {
        const elapsed = currentTime - startTime;
        const rawProgress = Math.min(elapsed / CONFIG.duration, 1);
        const t = easing(rawProgress);

        // Calculate current step (0 to 50)
        const currentStep = Math.floor(rawProgress * CONFIG.totalSteps);

        // Update step counter text
        this.textDiv.textContent = `Denoising the website [${currentStep}/${CONFIG.totalSteps}]`;

        // Fade noise opacity, but keep text fully visible
        this.canvas.style.opacity = 1 - t;

        if (rawProgress < 1) {
          requestAnimationFrame(tick);
        } else {
          // Remove both elements when done
          this.canvas.remove();
          this.textDiv.remove();
        }
      };

      requestAnimationFrame(tick);
    }
  }

  // Start immediately
  new FlowMatchingPage();
})();
