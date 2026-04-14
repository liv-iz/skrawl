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
    const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  function checkOrientation() {
    rotatePrompt.classList.toggle('active', window.innerHeight > window.innerWidth);
  }
  function onResize() { scaleScene(); checkOrientation(); }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  let currentScreen = null;
  const dialogueStrip = document.getElementById('dialogue-strip');

  function showScreen(id, options) {
    options = options || {};

    if (currentScreen === 'screen-camera' && window.Camera && Camera.close) {
      Camera.close();
    }
    Dialogue.stop();

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const next = document.getElementById(id);
    if (!next) { console.warn('No screen:', id); return; }
    next.classList.add('active');

    const hideStrip = (id === 'screen-camera' || id === 'screen-preview');
    dialogueStrip.classList.toggle('hidden', hideStrip);

    currentScreen = id;
  }
  window.showScreen = showScreen;

  async function boot() {
    onResize();
    const onboarded = await DB.getMeta('onboarded');
    if (onboarded) {
      await goToOrderList();
    } else {
      startOnboarding();
    }
  }

  function startOnboarding() {
    showScreen('screen-onboarding');
    Dialogue.playSequence('onboarding', async function () {
      await DB.setMeta('onboarded', true);
      await goToOrderList();
    });
  }

  async function goToOrderList() {
    showScreen('screen-order-list');

    const orders = await DB.loadOrders();
    const completedIds = new Set(orders.map(o => o.critterId));

    const container = document.getElementById('order-cards');
    container.innerHTML = '';
    container.style.display = 'flex';

    const ids = ['paper', 'felt', 'wood'];
    ids.forEach(function (id) {
      const c = CRITTERS[id];
      const card = document.createElement('div');
      card.className = 'order-card';
      if (completedIds.has(id)) card.classList.add('completed');
      card.innerHTML = `
        <div class="order-card-sprite ${c.spriteClass}"></div>
        <div class="order-card-name">${c.name}</div>
        <div class="order-card-element">${c.element}</div>
        <div class="order-card-material">${c.material}</div>
      `;
      if (!completedIds.has(id)) {
        card.addEventListener('click', function (e) {
          e.stopPropagation();
          startOrder(id);
        });
      }
      container.appendChild(card);
    });

    document.getElementById('dialogue-bubble').textContent = "Who needs help today?";
  }
  window.goToOrderList = goToOrderList;

  function startOrder(critterId) {
    console.log('TODO: start order', critterId);
  }
  window.startOrder = startOrder;

  window.addEventListener('load', boot);
})();
