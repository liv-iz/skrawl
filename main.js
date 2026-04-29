(function () {
  'use strict';

  const CRITTERS = {
    paper: {
      name: 'Hugh',
      full: 'Hugh the Colour Chameleon',
      element: 'Colour',
      material: ['Markers', 'Paper', 'Scissors', 'Glue', 'Tape'],
      task: 'Task: Make a stained glass window!',
      tip: 'Cut and paste construction paper to make your stained glass window.',
      spriteClass: 'placeholder-critter-paper',
      headshot: 'assets/final/headshot_hugh.png',
      scrapbookHeadshot: 'assets/final/headshot_hugh_happy.png',
      quote: "Thank you for fixing my window! You've brought a new light into my life.",
      lessonSequence: 'hugh-lesson',
      reactionSequence: 'hugh-reaction'
    },
    felt: {
      name: 'Puff',
      full: 'Puff the Sheep',
      element: 'Texture',
      material: ['Fabric', 'Felt', 'Yarn', 'String', 'Thread'],
      task: 'Task: Make a scarf!',
      tip: 'Use soft materials, like felt, fabric, and yarn, to make your scarf.',
      spriteClass: 'placeholder-critter-felt',
      headshot: 'assets/final/headshot_puff.png',
      scrapbookHeadshot: 'assets/final/scrapbook_puff.png',
      quote: "Thank you kindly for the wonderful scarf you made. You chose your textures with such care, and it shows in every layer.",
      lessonSequence: 'puff-lesson',
      reactionSequence: 'puff-reaction'
    },
    wood: {
      name: 'Rowan',
      full: 'Rowan the Owl',
      element: 'Form',
      material: ['Popsicle Sticks', 'Glue', 'Cardboard', 'Tape', 'Twigs'],
      task: 'Task: Rebuild a birdhouse!',
      tip: 'Use glue, popsicle sticks or wood blocks, to make your birdhouse.',
      spriteClass: 'placeholder-critter-wood',
      headshot: 'assets/final/headshot_rowan.png',
      scrapbookHeadshot: 'assets/final/scrapbook_rowan.png',
      quote: "My sincere thanks for the fine birdhouse. I can feel its strength, and I know it will stand firm through wind and weather.",
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

    const hideStrip = (id === 'screen-camera' || id === 'screen-preview' || id === 'screen-crafting' || id === 'screen-landing');
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
    showScreen('screen-landing');
    const landingScreen = document.getElementById('screen-landing');
    landingScreen.addEventListener('click', async function onStart() {
      landingScreen.removeEventListener('click', onStart);
      const onboarded = await DB.getMeta('onboarded');
      if (onboarded) {
        await goToOrderList();
      } else {
        startOnboarding();
      }
    });
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
        <div class="order-card-material">
          <div class="order-card-material-header">Suggested Supplies:</div>
          <ul class="order-card-material-list">
            ${(Array.isArray(c.material) ? c.material : [c.material]).map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      `;
      if (!completedIds.has(id)) {
        card.addEventListener('click', function (e) {
          e.stopPropagation();
          startOrder(id);
        });
      }
      container.appendChild(card);
    });

    document.getElementById('dialogue-name').textContent = 'Barnaby';
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
      <div style="font-size:24px;margin-bottom:24px;">${c.tip}</div>
      <div style="font-size:24px;color:#5a4a35;">When you're ready, photograph your creation against a neutral background.</div>
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

  function renderScrapbookBook(container, opts) {
    opts = opts || {};
    const orders = opts.orders || [];
    const byId = Object.fromEntries(orders.map(o => [o.critterId, o]));
    const ids = ['paper', 'felt', 'wood'];

    const entries = ids.map(function (id) {
      const c = CRITTERS[id];
      const order = byId[id];
      return order && order.photoBlob
        ? { kind: 'filled', critterId: id, critter: c, photoBlob: order.photoBlob }
        : { kind: 'empty', critterId: id, critter: c };
    });

    const spreads = [];
    for (let i = 0; i < entries.length; i += 2) {
      spreads.push([entries[i], entries[i + 1] || { kind: 'blank' }]);
    }

    const urls = [];
    let currentSpread = 0;
    if (opts.justCompletedCritterId) {
      const idx = ids.indexOf(opts.justCompletedCritterId);
      if (idx >= 0) currentSpread = Math.floor(idx / 2);
    }

    container.innerHTML = '';

    function buildPage(entry, side) {
      const page = document.createElement('div');
      page.className = 'scrapbook-page page-' + side;

      if (entry.kind === 'filled') {
        const head = document.createElement('img');
        head.className = 'page-headshot';
        head.src = entry.critter.scrapbookHeadshot || entry.critter.headshot;
        head.alt = entry.critter.name;
        page.appendChild(head);

        const quoteWrap = document.createElement('div');
        quoteWrap.className = 'page-quote-wrap';
        const quote = document.createElement('p');
        quote.className = 'page-quote';
        quote.textContent = entry.critter.quote;
        quoteWrap.appendChild(quote);
        const sig = document.createElement('p');
        sig.className = 'page-quote-sig';
        sig.textContent = '— ' + entry.critter.name;
        quoteWrap.appendChild(sig);
        page.appendChild(quoteWrap);

        const photoFrame = document.createElement('div');
        photoFrame.className = 'page-photo-frame';
        const tape = document.createElement('span');
        tape.className = 'page-photo-tape';
        photoFrame.appendChild(tape);
        const url = URL.createObjectURL(entry.photoBlob);
        urls.push(url);
        const img = document.createElement('img');
        img.className = 'page-photo';
        img.src = url;
        photoFrame.appendChild(img);
        page.appendChild(photoFrame);

        if (entry.critterId === opts.justCompletedCritterId) {
          page.classList.add('page-new');
        }
      } else if (entry.kind === 'empty') {
        const empty = document.createElement('div');
        empty.className = 'page-empty';
        empty.textContent = 'Not completed yet';
        page.appendChild(empty);
      } else {
        page.classList.add('page-blank');
      }
      return page;
    }

    function renderSpread() {
      Array.from(container.querySelectorAll('.scrapbook-page, .scrapbook-prev, .scrapbook-next')).forEach(function (n) {
        n.remove();
      });
      const spread = spreads[currentSpread];
      container.appendChild(buildPage(spread[0], 'left'));
      container.appendChild(buildPage(spread[1], 'right'));

      if (!opts.hideNav) {
        if (currentSpread > 0) {
          const prev = document.createElement('button');
          prev.className = 'scrapbook-prev';
          prev.textContent = '←';
          prev.onclick = function (e) { e.stopPropagation(); currentSpread--; renderSpread(); };
          container.appendChild(prev);
        }
        if (currentSpread < spreads.length - 1) {
          const next = document.createElement('button');
          next.className = 'scrapbook-next';
          next.textContent = '→';
          next.onclick = function (e) { e.stopPropagation(); currentSpread++; renderSpread(); };
          container.appendChild(next);
        }
      }
    }

    renderSpread();
    return urls;
  }

  let scrapbookScreenUrls = [];
  async function showScrapbook(justCompletedCritterId) {
    const orders = await DB.loadOrders();

    scrapbookScreenUrls.forEach(u => URL.revokeObjectURL(u));
    const book = document.getElementById('scrapbook-book');
    scrapbookScreenUrls = renderScrapbookBook(book, {
      orders: orders,
      justCompletedCritterId: justCompletedCritterId,
      hideNav: true
    });

    showScreen('screen-scrapbook');

    const closeBtn = document.getElementById('btn-scrapbook-continue');
    const allDone = orders.length >= 3;
    const shown = await DB.getMeta('finalClosingShown');

    if (allDone && !shown) {
      closeBtn.style.display = 'none';
      Dialogue.playSequence('final-closing', async function () {
        await DB.setMeta('finalClosingShown', true);
        closeBtn.style.display = '';
        wireScrapbookContinue();
      });
    } else {
      document.getElementById('dialogue-name').textContent = 'Barnaby';
      document.getElementById('dialogue-bubble').textContent =
        justCompletedCritterId
          ? `Another one for the order book!`
          : `Your order book so far…`;
      closeBtn.style.display = '';
      wireScrapbookContinue();
    }
  }
  window.showScrapbook = showScrapbook;

  function wireScrapbookContinue() {
    const btn = document.getElementById('btn-scrapbook-continue');
    btn.onclick = function (e) {
      if (e) e.stopPropagation();
      scrapbookScreenUrls.forEach(u => URL.revokeObjectURL(u));
      scrapbookScreenUrls = [];
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
    const book = document.getElementById('scrapbook-overlay-book');
    if (book) book.innerHTML = '';
  }

  async function openScrapbookOverlay() {
    const orders = await DB.loadOrders();
    const book = document.getElementById('scrapbook-overlay-book');
    overlayUrls = renderScrapbookBook(book, { orders: orders });
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
