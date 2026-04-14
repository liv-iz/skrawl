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

  window.addEventListener('load', function () {
    setTimeout(function () {
      const summary = document.createElement('h2');
      summary.textContent = `Pass: ${pass}  Fail: ${fail}`;
      summary.className = fail === 0 ? 'pass' : 'fail';
      results.appendChild(summary);
    }, 100);
  });
})();
