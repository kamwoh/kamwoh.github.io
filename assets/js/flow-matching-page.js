/**
 * Claude Code Loading Animation
 * Simulates a Claude Code terminal building the website
 * Only plays on the main page (homepage)
 */
(function() {
  'use strict';

  // Only run on the main page (root path)
  const path = window.location.pathname;
  if (path !== '/' && path !== '/index.html' && path !== '') {
    return;
  }

  // Braille spinner frames (Claude Code style)
  const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  // Tasks to display
  const TASKS = [
    { text: 'Reading _pages/about.md', duration: 280 },
    { text: 'Loading publications...', duration: 250 },
    { text: 'Rendering research papers...', duration: 300 },
    { text: 'Compiling stylesheets...', duration: 220 },
    { text: 'Building page layout...', duration: 260 },
  ];

  class ClaudeCodeLoader {
    constructor() {
      this.overlay = null;
      this.terminal = null;
      this.linesContainer = null;
      this.spinnerInterval = null;
      this.currentSpinnerFrame = 0;
      this.init();
    }

    init() {
      this.createOverlay();
      if (document.readyState === 'complete') {
        this.runSequence();
      } else {
        window.addEventListener('load', () => this.runSequence());
      }
    }

    createOverlay() {
      // Inject styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }
        #claude-loader-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: #1a1a2e;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
        }
        #claude-loader-overlay.fade-out {
          animation: fadeSlideUp 400ms ease-in forwards;
        }
        #claude-terminal {
          width: min(600px, 90vw);
          color: #e8e0d4;
          font-size: 15px;
          line-height: 1.7;
          padding: 20px;
        }
        .cl-prompt {
          color: #d97706;
          font-weight: bold;
        }
        .cl-command {
          color: #e8e0d4;
        }
        .cl-cursor {
          display: inline-block;
          width: 8px;
          height: 17px;
          background: #d97706;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 800ms step-end infinite;
        }
        .cl-task-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 2px 0;
          opacity: 0;
          transition: opacity 100ms;
        }
        .cl-task-line.visible {
          opacity: 1;
        }
        .cl-spinner {
          color: #6366f1;
          width: 14px;
          text-align: center;
        }
        .cl-check {
          color: #4ade80;
          width: 14px;
          text-align: center;
        }
        .cl-task-text {
          color: #9ca3af;
        }
        .cl-task-line.done .cl-task-text {
          color: #e8e0d4;
        }
        .cl-done-line {
          margin-top: 8px;
          opacity: 0;
          transition: opacity 200ms;
        }
        .cl-done-line.visible {
          opacity: 1;
        }
        .cl-done-check {
          color: #4ade80;
          font-weight: bold;
        }
        .cl-done-text {
          color: #e8e0d4;
          font-weight: bold;
        }

        /* Scanline overlay */
        #claude-loader-overlay::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          );
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);

      // Create overlay
      this.overlay = document.createElement('div');
      this.overlay.id = 'claude-loader-overlay';

      // Create terminal
      this.terminal = document.createElement('div');
      this.terminal.id = 'claude-terminal';

      // Prompt line
      const promptLine = document.createElement('div');
      promptLine.id = 'cl-prompt-line';
      promptLine.innerHTML = '<span class="cl-prompt">&gt; </span><span class="cl-command" id="cl-typed-text"></span><span class="cl-cursor" id="cl-cursor"></span>';
      this.terminal.appendChild(promptLine);

      // Lines container for tasks
      this.linesContainer = document.createElement('div');
      this.linesContainer.id = 'cl-lines';
      this.terminal.appendChild(this.linesContainer);

      this.overlay.appendChild(this.terminal);
      document.documentElement.appendChild(this.overlay);
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async typeText(text, speed) {
      const el = document.getElementById('cl-typed-text');
      for (let i = 0; i < text.length; i++) {
        el.textContent += text[i];
        await this.sleep(speed);
      }
    }

    startSpinner(spinnerEl) {
      this.currentSpinnerFrame = 0;
      this.spinnerInterval = setInterval(() => {
        this.currentSpinnerFrame = (this.currentSpinnerFrame + 1) % SPINNER.length;
        spinnerEl.textContent = SPINNER[this.currentSpinnerFrame];
      }, 80);
    }

    stopSpinner() {
      if (this.spinnerInterval) {
        clearInterval(this.spinnerInterval);
        this.spinnerInterval = null;
      }
    }

    async runSequence() {
      // Phase 1: Type the command
      await this.sleep(200);
      await this.typeText('Building kamwoh.github.io...', 30);

      // Hide cursor after typing
      const cursor = document.getElementById('cl-cursor');
      cursor.style.display = 'none';

      await this.sleep(200);

      // Phase 2: Show tasks one by one
      for (let i = 0; i < TASKS.length; i++) {
        const task = TASKS[i];

        // Create task line
        const line = document.createElement('div');
        line.className = 'cl-task-line';
        line.innerHTML = `
          <span class="cl-spinner" id="cl-spinner-${i}">${SPINNER[0]}</span>
          <span class="cl-task-text">${task.text}</span>
        `;
        this.linesContainer.appendChild(line);

        // Show line
        requestAnimationFrame(() => line.classList.add('visible'));

        // Start spinner
        const spinnerEl = document.getElementById(`cl-spinner-${i}`);
        this.startSpinner(spinnerEl);

        // Wait for task duration
        await this.sleep(task.duration);

        // Complete task
        this.stopSpinner();
        line.classList.add('done');
        spinnerEl.outerHTML = '<span class="cl-check">✓</span>';
      }

      // Phase 3: Done message
      await this.sleep(150);
      const doneLine = document.createElement('div');
      doneLine.className = 'cl-done-line';
      doneLine.innerHTML = '<span class="cl-done-check">✓</span> <span class="cl-done-text">Site ready.</span>';
      this.linesContainer.appendChild(doneLine);
      requestAnimationFrame(() => doneLine.classList.add('visible'));

      // Phase 4: Fade out
      await this.sleep(350);
      this.overlay.classList.add('fade-out');
      await this.sleep(400);
      this.overlay.remove();
    }
  }

  // Start immediately
  new ClaudeCodeLoader();
})();
