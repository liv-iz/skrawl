(function () {
  'use strict';

  const results = document.getElementById('results');
  let currentGroup = null;
  let pass = 0, fail = 0;

  window.describe = function (name, fn) {
    const h = document.createElement('div');
    h.className = 'group';
    h.textContent = name;
    results.appendChild(h);
    currentGroup = name;
    try { fn(); } catch (e) {
      const row = document.createElement('div');
      row.className = 'fail';
      row.textContent = `  ✗ threw in group: ${e.message}`;
      results.appendChild(row);
      fail++;
    }
  };

  window.it = function (desc, fn) {
    const row = document.createElement('div');
    try {
      fn();
      row.className = 'pass';
      row.textContent = `  ✓ ${desc}`;
      pass++;
    } catch (e) {
      row.className = 'fail';
      row.textContent = `  ✗ ${desc} — ${e.message}`;
      fail++;
    }
    results.appendChild(row);
  };

  window.assert = function (cond, msg) {
    if (!cond) throw new Error(msg || 'assertion failed');
  };

  window.assertEqual = function (actual, expected, msg) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) throw new Error(`${msg || 'assertEqual'}: expected ${e}, got ${a}`);
  };

  describe('Dialogue.createPlayer', function () {
    const bubbles = [
      { lines: [
        { text: 'Line A' },
        { text: 'Line B', popup: 'p1' }
      ]},
      { lines: [
        { text: 'Line C', popup: 'dismiss' }
      ], isExit: true }
    ];

    it('starts on the first line of the first bubble', function () {
      const p = Dialogue.createPlayer(bubbles);
      const c = p.current();
      assertEqual(c.line.text, 'Line A');
      assertEqual(c.bubbleIndex, 0);
      assertEqual(c.lineIndex, 0);
      assertEqual(c.isNewBubble, true);
      assertEqual(p.done, false);
    });

    it('advance moves to next line in same bubble (not new bubble)', function () {
      const p = Dialogue.createPlayer(bubbles);
      p.advance();
      const c = p.current();
      assertEqual(c.line.text, 'Line B');
      assertEqual(c.bubbleIndex, 0);
      assertEqual(c.lineIndex, 1);
      assertEqual(c.isNewBubble, false);
      assertEqual(c.line.popup, 'p1');
    });

    it('advance crosses into next bubble (isNewBubble true)', function () {
      const p = Dialogue.createPlayer(bubbles);
      p.advance();
      p.advance();
      const c = p.current();
      assertEqual(c.line.text, 'Line C');
      assertEqual(c.bubbleIndex, 1);
      assertEqual(c.lineIndex, 0);
      assertEqual(c.isNewBubble, true);
    });

    it('advance past last line sets done', function () {
      const p = Dialogue.createPlayer(bubbles);
      p.advance(); p.advance(); p.advance();
      assertEqual(p.done, true);
    });

    it('advance is no-op once done', function () {
      const p = Dialogue.createPlayer(bubbles);
      p.advance(); p.advance(); p.advance();
      p.advance();
      assertEqual(p.done, true);
    });
  });

  describe('Camera.computeBlurVariance', function () {
    function makeSolidImageData(w, h, v) {
      const data = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i+1] = data[i+2] = v;
        data[i+3] = 255;
      }
      return { data, width: w, height: h };
    }

    function makeCheckerImageData(w, h) {
      const data = new Uint8ClampedArray(w * h * 4);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const v = ((x + y) % 2) * 255;
          data[idx] = data[idx+1] = data[idx+2] = v;
          data[idx+3] = 255;
        }
      }
      return { data, width: w, height: h };
    }

    it('solid image has near-zero variance (very blurry)', function () {
      const img = makeSolidImageData(32, 32, 128);
      const v = Camera.computeBlurVariance(img);
      assert(v < 1, 'solid image variance should be < 1, got ' + v);
    });

    it('checkerboard has high variance (very sharp)', function () {
      const img = makeCheckerImageData(32, 32);
      const v = Camera.computeBlurVariance(img);
      assert(v > 1000, 'checkerboard variance should be > 1000, got ' + v);
    });
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      const summary = document.createElement('h2');
      summary.textContent = `Pass: ${pass}  Fail: ${fail}`;
      summary.className = fail === 0 ? 'pass' : 'fail';
      results.appendChild(summary);
    }, 100);
  });
})();
