(function () {
  'use strict';

  const CRITTERS = {
    paper: {
      name: 'Hugh',
      full: 'Hugh the Colour Chameleon',
      element: 'COLOUR',
      material: 'Construction Paper & Scissors',
      task: 'Make a stained glass window',
      tip: 'Cut and paste construction paper to make your stained glass window',
      spriteClass: 'placeholder-critter-paper',
      lessonSequence: 'hugh-lesson',
      reactionSequence: 'hugh-reaction'
    },
    felt: {
      name: 'Puff',
      full: 'Puff the Sheep',
      element: 'TEXTURE',
      material: 'Felt, Fabric, or Yarn',
      task: 'Make a scarf',
      tip: 'Use soft materials, like felt, fabric, and yarn, to make your scarf',
      spriteClass: 'placeholder-critter-felt',
      lessonSequence: 'puff-lesson',
      reactionSequence: 'puff-reaction'
    },
    wood: {
      name: 'Rowan',
      full: 'Rowan the Owl',
      element: 'FORM',
      material: 'Popsicle Sticks & Glue',
      task: 'Rebuild a birdhouse',
      tip: 'Use glue, popsicle sticks or wood blocks, to make your birdhouse',
      spriteClass: 'placeholder-critter-wood',
      lessonSequence: 'rowan-lesson',
      reactionSequence: 'rowan-reaction'
    }
  };
  window.CRITTERS = CRITTERS;

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
