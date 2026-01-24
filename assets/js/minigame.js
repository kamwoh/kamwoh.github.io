/**
 * Catch the Bird Minigame
 * Move your cursor fast enough to catch the flying bird!
 */
(function() {
  'use strict';

  const container = document.getElementById('game-container');
  const bird = document.getElementById('bird');
  const cursor = document.getElementById('cursor');
  const scoreDisplay = document.getElementById('score');
  const message = document.getElementById('message');

  if (!container || !bird || !cursor) return;

  let score = 0;
  let birdX = 100;
  let birdY = 100;
  let birdVX = 3;
  let birdVY = 2;
  let cursorX = 0;
  let cursorY = 0;
  let gameStarted = false;
  let isCaught = false;

  const BIRD_SPEED = 4;
  const CATCH_DISTANCE = 40;
  const MILESTONES = {
    10: "Nice! 🎉",
    20: "Don't you have work to do? 😅",
    50: "50! Get back to work! 💼",
    100: "100! Wish you all Strong ACCEPTs for your paper! 🎊📝"
  };

  // Initialize bird position
  function initBird() {
    const rect = container.getBoundingClientRect();
    birdX = Math.random() * (rect.width - 60) + 30;
    birdY = Math.random() * (rect.height - 60) + 30;

    // Random direction
    const angle = Math.random() * Math.PI * 2;
    birdVX = Math.cos(angle) * BIRD_SPEED;
    birdVY = Math.sin(angle) * BIRD_SPEED;
  }

  // Update bird position
  function updateBird() {
    const rect = container.getBoundingClientRect();

    birdX += birdVX;
    birdY += birdVY;

    // Bounce off walls
    if (birdX <= 20 || birdX >= rect.width - 40) {
      birdVX = -birdVX;
      birdX = Math.max(20, Math.min(rect.width - 40, birdX));
    }
    if (birdY <= 20 || birdY >= rect.height - 40) {
      birdVY = -birdVY;
      birdY = Math.max(20, Math.min(rect.height - 40, birdY));
    }

    // Flip bird based on direction
    bird.style.transform = birdVX < 0 ? 'scaleX(1)' : 'scaleX(-1)';
    bird.style.left = birdX + 'px';
    bird.style.top = birdY + 'px';
  }

  // Check if cursor caught the bird
  function checkCatch() {
    if (isCaught) return;

    const dx = cursorX - birdX - 20;
    const dy = cursorY - birdY - 20;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < CATCH_DISTANCE) {
      isCaught = true;
      score++;
      scoreDisplay.textContent = 'Score: ' + score;

      // Check for milestone
      const milestoneMsg = MILESTONES[score];
      if (milestoneMsg) {
        message.textContent = milestoneMsg;
        message.style.opacity = '1';
        message.style.fontSize = '28px';

        // Hide bird during delay
        bird.style.opacity = '0';

        // Longer delay for milestones
        setTimeout(() => {
          initBird();
          bird.style.opacity = '1';
          message.style.opacity = '0';
          message.style.fontSize = '24px';
          isCaught = false;
        }, 2000);
      } else {
        // Show catch message briefly
        message.textContent = 'Caught! +1';
        message.style.opacity = '1';

        // Hide bird during delay
        bird.style.opacity = '0';

        // Reset bird after 0.5s delay
        setTimeout(() => {
          initBird();
          bird.style.opacity = '1';
          message.style.opacity = '0';
          isCaught = false;
        }, 500);
      }
    }
  }

  // Track cursor/touch position
  function updateCursorPosition(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    cursorX = clientX - rect.left;
    cursorY = clientY - rect.top;

    cursor.style.left = (cursorX - 15) + 'px';
    cursor.style.top = (cursorY - 5) + 'px';

    if (!gameStarted) {
      gameStarted = true;
      message.style.opacity = '0';
    }

    checkCatch();
  }

  // Mouse events
  container.addEventListener('mousemove', (e) => {
    updateCursorPosition(e.clientX, e.clientY);
  });

  // Touch events for mobile
  container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    updateCursorPosition(touch.clientX, touch.clientY);
  }, { passive: false });

  container.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    updateCursorPosition(touch.clientX, touch.clientY);
    cursor.style.opacity = '1';
  });

  // Hide default cursor message after first move
  container.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  container.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0.3';
  });

  // Game loop
  function gameLoop() {
    updateBird();
    requestAnimationFrame(gameLoop);
  }

  // Start game
  initBird();
  cursor.style.opacity = '0.3';
  message.style.transition = 'opacity 0.3s';
  gameLoop();
})();
