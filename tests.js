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

  window.addEventListener('load', function () {
    setTimeout(function () {
      const summary = document.createElement('h2');
      summary.textContent = `Pass: ${pass}  Fail: ${fail}`;
      summary.className = fail === 0 ? 'pass' : 'fail';
      results.appendChild(summary);
    }, 100);
  });
})();
