(function () {
  'use strict';

  const CANVAS_W = 1280;
  const CANVAS_H = 720;

  const stage = document.getElementById('stage');
  const rotatePrompt = document.getElementById('rotate-prompt');

  function scaleScene() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / CANVAS_W, vh / CANVAS_H);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  function checkOrientation() {
    const portrait = window.innerHeight > window.innerWidth;
    rotatePrompt.classList.toggle('active', portrait);
  }

  function onResize() {
    scaleScene();
    checkOrientation();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  window.addEventListener('load', onResize);
  onResize();
})();
