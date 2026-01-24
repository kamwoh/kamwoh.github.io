---
permalink: /minigame/
title: "Catch the Bird"
excerpt: "A simple minigame where you catch a flying bird with your cursor"
author_profile: true
---

<div id="game-container" style="position: relative; width: 100%; height: 500px; border: 2px solid #333; border-radius: 10px; overflow: hidden; background: linear-gradient(to bottom, #87CEEB, #E0F6FF); cursor: none;">
  <div id="bird" style="position: absolute; font-size: 40px; user-select: none; transition: none;">🐦</div>
  <div id="cursor" style="position: absolute; font-size: 30px; user-select: none; pointer-events: none;">🖐️</div>
  <div id="score" style="position: absolute; top: 10px; left: 10px; font-size: 20px; font-weight: bold; color: #333;">Score: 0</div>
  <div id="message" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; font-weight: bold; color: #333; text-align: center;">Move your cursor to catch the bird!</div>
</div>

<script src="{{ '/assets/js/minigame.js' | relative_url }}"></script>
