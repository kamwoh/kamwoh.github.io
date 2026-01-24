/**
 * Flow-Matching Noise-to-Image Animation
 * Simulates the flow-matching generative process where noise transforms into an image
 * through straight trajectories (optimal transport path)
 */
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    duration: 2000,        // Animation duration in ms
    fps: 60,               // Target frame rate
    noiseScale: 1.0,       // Initial noise intensity
    easing: 'easeInOutCubic', // Easing function
    replayOnHover: true,   // Replay animation on hover
    autoStart: true        // Auto-start animation on load
  };

  // Easing functions
  const easingFunctions = {
    linear: t => t,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  };

  // Box-Muller transform for Gaussian noise
  function gaussianRandom(mean = 0, std = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * std + mean;
  }

  // Generate noise image data
  function generateNoise(width, height, imageData) {
    const noise = new ImageData(width, height);
    for (let i = 0; i < noise.data.length; i += 4) {
      // Generate noise centered around the mean color of the image
      const r = imageData ? imageData[i] : 128;
      const g = imageData ? imageData[i + 1] : 128;
      const b = imageData ? imageData[i + 2] : 128;

      // Gaussian noise
      const noiseR = Math.max(0, Math.min(255, gaussianRandom(128, 80)));
      const noiseG = Math.max(0, Math.min(255, gaussianRandom(128, 80)));
      const noiseB = Math.max(0, Math.min(255, gaussianRandom(128, 80)));

      noise.data[i] = noiseR;
      noise.data[i + 1] = noiseG;
      noise.data[i + 2] = noiseB;
      noise.data[i + 3] = 255;
    }
    return noise;
  }

  // Linear interpolation between two values
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Interpolate between noise and image (flow-matching trajectory)
  function interpolateFrames(noiseData, imageData, t, output) {
    for (let i = 0; i < output.data.length; i += 4) {
      output.data[i] = lerp(noiseData.data[i], imageData.data[i], t);
      output.data[i + 1] = lerp(noiseData.data[i + 1], imageData.data[i + 1], t);
      output.data[i + 2] = lerp(noiseData.data[i + 2], imageData.data[i + 2], t);
      output.data[i + 3] = 255;
    }
    return output;
  }

  class FlowMatchingAvatar {
    constructor(imgElement) {
      this.img = imgElement;
      this.canvas = null;
      this.ctx = null;
      this.noiseData = null;
      this.imageData = null;
      this.outputData = null;
      this.isAnimating = false;
      this.animationId = null;

      this.init();
    }

    init() {
      // Wait for image to load
      if (this.img.complete) {
        this.setup();
      } else {
        this.img.onload = () => this.setup();
      }
    }

    setup() {
      // Create canvas
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'flow-matching-canvas author__avatar';
      this.canvas.style.borderRadius = this.img.style.borderRadius || '50%';

      // Get image dimensions
      const rect = this.img.getBoundingClientRect();
      const width = rect.width || this.img.width || 200;
      const height = rect.height || this.img.height || 200;

      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';

      this.ctx = this.canvas.getContext('2d');

      // Draw image to get pixel data
      this.ctx.drawImage(this.img, 0, 0, width, height);
      this.imageData = this.ctx.getImageData(0, 0, width, height);

      // Generate initial noise
      this.noiseData = generateNoise(width, height, this.imageData.data);
      this.outputData = new ImageData(width, height);

      // Replace image with canvas
      this.img.style.display = 'none';
      this.img.parentNode.insertBefore(this.canvas, this.img);

      // Set up event listeners
      if (CONFIG.replayOnHover) {
        this.canvas.addEventListener('mouseenter', () => this.replay());
        this.canvas.addEventListener('click', () => this.replay());
      }

      // Start animation
      if (CONFIG.autoStart) {
        // Small delay to ensure page is ready
        setTimeout(() => this.animate(), 100);
      } else {
        // Show final image
        this.ctx.putImageData(this.imageData, 0, 0);
      }
    }

    animate() {
      if (this.isAnimating) return;

      this.isAnimating = true;
      const startTime = performance.now();
      const easing = easingFunctions[CONFIG.easing] || easingFunctions.linear;

      // Regenerate noise for each animation
      this.noiseData = generateNoise(this.canvas.width, this.canvas.height, this.imageData.data);

      const tick = (currentTime) => {
        const elapsed = currentTime - startTime;
        const rawProgress = Math.min(elapsed / CONFIG.duration, 1);
        const progress = easing(rawProgress);

        // Flow-matching: straight-line interpolation from noise to image
        interpolateFrames(this.noiseData, this.imageData, progress, this.outputData);
        this.ctx.putImageData(this.outputData, 0, 0);

        if (rawProgress < 1) {
          this.animationId = requestAnimationFrame(tick);
        } else {
          this.isAnimating = false;
          // Ensure final frame is the clean image
          this.ctx.putImageData(this.imageData, 0, 0);
        }
      };

      this.animationId = requestAnimationFrame(tick);
    }

    replay() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      this.isAnimating = false;
      this.animate();
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      this.img.style.display = '';
    }
  }

  // Initialize on DOM ready
  function initFlowMatchingAvatars() {
    // Find all author avatars
    const avatars = document.querySelectorAll('.author__avatar img, img.author__avatar');
    avatars.forEach(img => {
      // Skip if already initialized
      if (img.dataset.flowMatchingInit) return;
      img.dataset.flowMatchingInit = 'true';

      // Handle cross-origin images
      if (img.src && !img.src.startsWith(window.location.origin) && !img.crossOrigin) {
        // Create a new image with crossOrigin set
        const newImg = new Image();
        newImg.crossOrigin = 'anonymous';
        newImg.src = img.src;
        newImg.className = img.className;
        newImg.alt = img.alt;
        img.parentNode.replaceChild(newImg, img);
        new FlowMatchingAvatar(newImg);
      } else {
        new FlowMatchingAvatar(img);
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFlowMatchingAvatars);
  } else {
    initFlowMatchingAvatars();
  }

  // Expose for manual initialization
  window.FlowMatchingAvatar = FlowMatchingAvatar;
  window.initFlowMatchingAvatars = initFlowMatchingAvatars;
})();
