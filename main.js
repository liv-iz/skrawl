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
      headshot: 'assets/final/headshot_hugh.png',
      lessonSequence: 'hugh-lesson',
      reactionSequence: 'hugh-reaction'
    },
    felt: {
      name: 'Puff',
      full: 'Puff the Sheep',
      element: 'TEXTURE',
      material: 'Felt, Cloth, Fabric, or Yarn',
      task: 'Make a scarf',
      tip: 'Use soft materials, like felt, fabric, and yarn, to make your scarf',
      spriteClass: 'placeholder-critter-felt',
      headshot: 'assets/final/headshot_coming_soon.png',
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
      headshot: 'assets/final/headshot_coming_soon.png',
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

    const hideStrip = (id === 'screen-camera' || id === 'screen-preview' || id === 'screen-crafting');
    dialogueStrip.classList.toggle('hidden', hideStrip);

    const showScrapbookBtn = (id === 'screen-order-list');
    const btn = document.getElementById('btn-open-scrapbook');
    if (btn) btn.style.display = showScrapbookBtn ? 'block' : 'none';
    closeScrapbookOverlay();

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
        <img class="order-card-headshot" src="${c.headshot}" alt="${c.name}">
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

    document.getElementById('dialogue-name').textContent = 'Narrator';
    document.getElementById('dialogue-bubble').textContent = "Who needs help today?";
  }
  window.goToOrderList = goToOrderList;

  function startOrder(critterId) {
    const c = CRITTERS[critterId];
    if (!c) return;

    const panel = document.getElementById('lesson-critter');
    panel.innerHTML = `<div class="${c.spriteClass}"></div>`;

    showScreen('screen-lesson');
    Dialogue.playSequence(c.lessonSequence, function () {
      showCrafting(critterId);
    });
  }
  window.startOrder = startOrder;

  function showCrafting(critterId) {
    const c = CRITTERS[critterId];

    const text = document.getElementById('crafting-text');
    text.innerHTML = `
      <div style="font-size:36px;font-weight:bold;margin-bottom:16px;">${c.task}</div>
      <div style="font-size:24px;margin-bottom:24px;">Tip: ${c.tip}</div>
      <div style="font-size:22px;color:#5a4a35;">When you're ready, photograph your creation against a neutral background.</div>
    `;

    showScreen('screen-crafting');

    const btn = document.getElementById('btn-take-photo');
    btn.onclick = function (e) {
      e.stopPropagation();
      startCamera(critterId);
    };
  }

  function startCamera(critterId) {
    showScreen('screen-camera');
    Camera.open(
      function onCapture(blob, variance) {
        showPreview(critterId, blob, variance);
      },
      function onCancel() {
        showCrafting(critterId);
      }
    );
  }
  window.startCamera = startCamera;

  const BLUR_THRESHOLD = 80;
  let pendingPhotoBlob = null;
  let pendingPhotoUrl = null;

  function showPreview(critterId, blob, variance) {
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    pendingPhotoBlob = blob;
    pendingPhotoUrl = URL.createObjectURL(blob);

    const img = document.createElement('img');
    img.src = pendingPhotoUrl;
    const container = document.getElementById('preview-photo');
    container.innerHTML = '';
    container.appendChild(img);

    showScreen('screen-preview');

    const modal = document.getElementById('blur-modal');
    modal.classList.toggle('active', typeof variance === 'number' && variance < BLUR_THRESHOLD);

    document.getElementById('btn-retake').onclick = function (e) {
      e.stopPropagation();
      onRetake(critterId);
    };
    document.getElementById('btn-confirm').onclick = function (e) {
      e.stopPropagation();
      onConfirm(critterId);
    };
    document.getElementById('btn-blur-retake').onclick = function (e) {
      e.stopPropagation();
      modal.classList.remove('active');
      onRetake(critterId);
    };
    document.getElementById('btn-blur-useanyway').onclick = function (e) {
      e.stopPropagation();
      modal.classList.remove('active');
    };
  }
  window.showPreview = showPreview;

  function onRetake(critterId) {
    if (pendingPhotoUrl) { URL.revokeObjectURL(pendingPhotoUrl); pendingPhotoUrl = null; }
    pendingPhotoBlob = null;
    startCamera(critterId);
  }

  async function onConfirm(critterId) {
    if (!pendingPhotoBlob) return;
    await DB.saveOrder(critterId, pendingPhotoBlob);
    if (pendingPhotoUrl) { URL.revokeObjectURL(pendingPhotoUrl); pendingPhotoUrl = null; }
    pendingPhotoBlob = null;
    showReaction(critterId);
  }

  async function showReaction(critterId) {
    const c = CRITTERS[critterId];

    document.getElementById('reaction-critter').innerHTML =
      `<div class="${c.spriteClass} happy"></div>`;

    const orders = await DB.loadOrders();
    const order = orders.find(o => o.critterId === critterId);
    const mainStage = document.getElementById('reaction-photo');
    mainStage.innerHTML = '';
    if (order && order.photoBlob) {
      const img = document.createElement('img');
      const url = URL.createObjectURL(order.photoBlob);
      img.src = url;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '8px';
      img.onload = function () { URL.revokeObjectURL(url); };
      mainStage.appendChild(img);
    }

    showScreen('screen-reaction');
    Dialogue.playSequence(c.reactionSequence, function () {
      showScrapbook(critterId);
    });
  }
  window.showReaction = showReaction;

  async function showScrapbook(justCompletedCritterId) {
    const orders = await DB.loadOrders();
    const byId = Object.fromEntries(orders.map(o => [o.critterId, o]));

    const container = document.getElementById('scrapbook-slots');
    container.innerHTML = '';
    container.style.display = 'flex';

    const ids = ['paper', 'felt', 'wood'];
    const imgUrls = [];
    ids.forEach(function (id) {
      const c = CRITTERS[id];
      const slot = document.createElement('div');
      slot.className = 'scrapbook-slot';
      const order = byId[id];
      if (order && order.photoBlob) {
        const url = URL.createObjectURL(order.photoBlob);
        imgUrls.push(url);
        const img = document.createElement('img');
        img.src = url;
        slot.appendChild(img);
        const label = document.createElement('div');
        label.className = 'scrapbook-slot-label';
        label.textContent = c.name;
        slot.appendChild(label);
        if (id === justCompletedCritterId) slot.classList.add('new');
      } else {
        slot.classList.add('empty');
        slot.textContent = `${c.name}\n(not yet made)`;
        slot.style.whiteSpace = 'pre-line';
      }
      container.appendChild(slot);
    });

    showScreen('screen-scrapbook');

    const allDone = orders.length >= 3;
    const shown = await DB.getMeta('finalClosingShown');
    if (allDone && !shown) {
      Dialogue.playSequence('final-closing', async function () {
        await DB.setMeta('finalClosingShown', true);
        wireScrapbookContinue(imgUrls);
      });
    } else {
      document.getElementById('dialogue-bubble').textContent =
        justCompletedCritterId
          ? `Another one for the order book!`
          : `Your order book so far…`;
      wireScrapbookContinue(imgUrls);
    }
  }
  window.showScrapbook = showScrapbook;

  function wireScrapbookContinue(imgUrls) {
    const btn = document.getElementById('btn-scrapbook-continue');
    btn.onclick = function () {
      imgUrls.forEach(u => URL.revokeObjectURL(u));
      goToOrderList();
    };
  }

  let overlayUrls = [];
  function closeScrapbookOverlay() {
    const overlay = document.getElementById('scrapbook-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlayUrls.forEach(u => URL.revokeObjectURL(u));
    overlayUrls = [];
    const slots = document.getElementById('scrapbook-overlay-slots');
    if (slots) slots.innerHTML = '';
  }

  async function openScrapbookOverlay() {
    const orders = await DB.loadOrders();
    const byId = Object.fromEntries(orders.map(o => [o.critterId, o]));
    const slots = document.getElementById('scrapbook-overlay-slots');
    slots.innerHTML = '';
    overlayUrls = [];
    ['paper', 'felt', 'wood'].forEach(function (id) {
      const c = CRITTERS[id];
      const slot = document.createElement('div');
      slot.className = 'scrapbook-slot';
      const order = byId[id];
      if (order && order.photoBlob) {
        const url = URL.createObjectURL(order.photoBlob);
        overlayUrls.push(url);
        const img = document.createElement('img');
        img.src = url;
        slot.appendChild(img);
        const label = document.createElement('div');
        label.className = 'scrapbook-slot-label';
        label.textContent = c.name;
        slot.appendChild(label);
      } else {
        slot.classList.add('empty');
        slot.textContent = `${c.name}\n(not yet made)`;
        slot.style.whiteSpace = 'pre-line';
      }
      slots.appendChild(slot);
    });
    document.getElementById('scrapbook-overlay').classList.add('active');
  }

  document.getElementById('btn-open-scrapbook').addEventListener('click', function (e) {
    e.stopPropagation();
    openScrapbookOverlay();
  });
  document.getElementById('btn-close-scrapbook').addEventListener('click', function (e) {
    e.stopPropagation();
    closeScrapbookOverlay();
  });

  window.addEventListener('load', boot);
})();
