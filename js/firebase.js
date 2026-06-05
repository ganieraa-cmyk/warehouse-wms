/**
 * firebase.js — Firestore real-time sync + localStorage fallback.
 *
 * Firebase config paste pannama irundhalum offline-a work aagum.
 * Config paste pannaa → multi-device real-time sync activate aagum.
 *
 * HOW TO SETUP:
 * 1. https://console.firebase.google.com → Create project
 * 2. Firestore Database → Create → Test mode
 * 3. Project Settings → Web app → Copy config → paste below
 */

const FIREBASE_CONFIG = {
  apiKey            : "PASTE_YOUR_apiKey_HERE",
  authDomain        : "PASTE_YOUR_authDomain_HERE",
  projectId         : "PASTE_YOUR_projectId_HERE",
  storageBucket     : "PASTE_YOUR_storageBucket_HERE",
  messagingSenderId : "PASTE_YOUR_messagingSenderId_HERE",
  appId             : "PASTE_YOUR_appId_HERE"
};

const FIRESTORE_DOC = 'warehouse/main';
const LS_KEY        = 'wms_warehouse_data';

const DB = (function () {
  let _db         = null;
  let _configured = false;
  let _onSyncCb   = null;

  /* ── Check if config is filled ── */
  function _isConfigured() {
    return !Object.values(FIREBASE_CONFIG).some(v =>
      typeof v === 'string' && v.startsWith('PASTE_YOUR')
    );
  }

  /* ── Sync indicator helper ── */
  function _setIndicator(state, label) {
    const dot   = document.getElementById('syncDot');
    const lbl   = document.getElementById('syncLabel');
    if (dot) { dot.className = 'sync-dot ' + state; }
    if (lbl) { lbl.textContent = label; }
  }

  /* ══════════════════════════════
     LOCAL STORAGE FALLBACK
  ══════════════════════════════ */
  function _localLoad() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        State.loadFromCloud(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('WMS: localStorage read failed', e);
    }
  }

  function _localSave() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(State.snapshot()));
    } catch (e) {
      console.warn('WMS: localStorage save failed', e);
    }
  }

  function _initOffline(onReady) {
    _localLoad();
    _setIndicator('offline', 'Offline mode');
    const banner = document.getElementById('configBanner');
    if (banner) banner.style.display = 'flex';
    UI.setLog('💾 Offline mode — data saves to this browser only');
    if (onReady) onReady();
  }

  /* ══════════════════════════════
     FIREBASE / FIRESTORE
  ══════════════════════════════ */
  function _listenRealtime(onReady) {
    const [col, doc] = FIRESTORE_DOC.split('/');
    let firstLoad = true;

    _db.collection(col).doc(doc).onSnapshot(
      snap => {
        if (snap.exists) {
          State.loadFromCloud(snap.data());
        } else {
          /* First ever write */
          _db.collection(col).doc(doc).set(State.snapshot());
        }

        _setIndicator('online', 'Cloud synced');

        if (firstLoad) {
          firstLoad = false;
          if (onReady) onReady();
        } else {
          /* Remote update from another device */
          if (_onSyncCb) _onSyncCb();
          UI.setLog('☁️ Synced from cloud — <strong>' + new Date().toLocaleTimeString() + '</strong>');
        }
      },
      err => {
        console.error('WMS: Firestore error', err);
        _setIndicator('error', 'Sync error');
        UI.setLog('⚠️ Cloud sync error — ' + err.message);
      }
    );
  }

  /* ══════════════════════════════
     PUBLIC API
  ══════════════════════════════ */
  function init(onReady, onSync) {
    _onSyncCb = onSync;

    if (!_isConfigured()) {
      _initOffline(onReady);
      return;
    }

    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      _db         = firebase.firestore();
      _configured = true;
      _setIndicator('', 'Connecting...');
      UI.setLog('🔗 Connecting to cloud...');
      _listenRealtime(onReady);
    } catch (e) {
      console.error('WMS: Firebase init error', e);
      _initOffline(onReady);
    }
  }

  async function save() {
    if (_configured && _db) {
      try {
        const [col, doc] = FIRESTORE_DOC.split('/');
        await _db.collection(col).doc(doc).set(State.snapshot());
        _setIndicator('online', 'Cloud synced');
      } catch (e) {
        console.error('WMS: Firestore save failed', e);
        _setIndicator('error', 'Save failed');
        UI.setLog('⚠️ Save failed — check internet connection');
      }
    } else {
      _localSave();
    }
  }

  return { init, save };
})();
