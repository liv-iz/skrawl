(function () {
  'use strict';

  const DB_NAME = 'skrawl';
  const DB_VERSION = 1;

  let dbPromise = null;

  function open() {
    if (!dbPromise) {
      dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('meta')) {
            db.createObjectStore('meta');
          }
          if (!db.objectStoreNames.contains('orders')) {
            db.createObjectStore('orders');
          }
        }
      });
    }
    return dbPromise;
  }

  async function getMeta(key) {
    const db = await open();
    return db.get('meta', key);
  }

  async function setMeta(key, value) {
    const db = await open();
    return db.put('meta', value, key);
  }

  async function saveOrder(critterId, photoBlob) {
    const db = await open();
    return db.put('orders', {
      critterId,
      photoBlob,
      timestamp: Date.now()
    }, critterId);
  }

  async function loadOrders() {
    const db = await open();
    const all = await db.getAll('orders');
    return all;
  }

  window.DB = { getMeta, setMeta, saveOrder, loadOrders };
})();
