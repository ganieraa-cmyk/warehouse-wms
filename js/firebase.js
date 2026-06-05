const FIREBASE_CONFIG = {
  apiKey            : "AIzaSyAKCSK4isch_jds-wBaxt5BApNo3ZWPLus",
  authDomain        : "warehouse-wms-f0fbe.firebaseapp.com",
  projectId         : "warehouse-wms-f0fbe",
  storageBucket     : "warehouse-wms-f0fbe.firebasestorage.app",
  messagingSenderId : "446546235100",
  appId             : "1:446546235100:web:6733d5e17cbd20bed8ae19"
};

const FIRESTORE_DOC = 'warehouse/main';
const LS_KEY        = 'wms_warehouse_data';

function _isFirebaseConfigured() {
  return !Object.values(FIREBASE_CONFIG).some(v =>
    typeof v === 'string' && v.startsWith('PASTE_YOUR')
  );
}

const DB = (function () {
  let _db         = null;
  let _configured = false;
  let _onSyncCb   = null;

  function _setIndicator(state, label) {
    const dot = document.getElementById('syncDot');
    const lbl = document.getElementById('syncLabel');
    if (dot) dot.className = 'sync-dot ' + (state || '');
    if (lbl) lbl.textContent = label || '';
  }

  function _localLoad() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) State.loadFromCloud(JSON.parse(raw));
    } catch (e) { console.warn('WMS: localStorage read failed', e); }
  }

  function _localSave() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(State.snapshot()));
    } catch (e) { console.warn('WMS: localStorage save failed', e); }
  }

  function _initOffline(onReady) {
    _localLoad();
    _setIndicator('offline', 'Offline mode');
    const banner = document.getElementById('configBanner');
    if (banner) banner.style.display = 'flex';
    UI.setLog('💾 Offline mode — data saves to this browser only');
    if (onReady) onReady();
  }

  function _listenRealtime(onReady) {
    const [col, doc] = FIRESTORE_DOC.split('/');
    let firstLoad = true;

    _db.collection(col).doc(doc).onSnapshot(
      snap => {
        if (snap.exists) {
          State.loadFromCloud(snap.data());
        } else {
          _db.collection(col).doc(doc).set(State.snapshot());
        }
        _setIndicator('online', 'Cloud synced ✓');
        if (firstLoad) {
          firstLoad = false;
          if (onReady) onReady();
        } else {
          if (_onSyncCb) _onSyncCb();
          UI.setLog('☁️ Synced — <strong>' + new Date().toLocaleTimeString() + '</strong>');
        }
      },
      err => {
        console.error('WMS Firestore error:', err);
        _setIndicator('error', 'Sync error');
        UI.setLog('⚠️ ' + err.message);
        _initOffline(onReady);
      }
    );
  }

  function init(onReady, onSync) {
    _onSyncCb = onSync;
    if (!_isFirebaseConfigured()) {
      _initOffline(onReady);
      return;
    }
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      _db         = firebase.firestore();
      _configured = true;
      _setIndicator('', 'Connecting...');
      UI.setLog('🔗 Connecting to Firebase...');
      _listenRealtime(onReady);
    } catch (e) {
      console.error('WMS Firebase init error:', e);
      _initOffline(onReady);
    }
  }

  async function save() {
    if (_configured && _db) {
      try {
        const [col, doc] = FIRESTORE_DOC.split('/');
        await _db.collection(col).doc(doc).set(State.snapshot());
        _setIndicator('online', 'Cloud synced ✓');
      } catch (e) {
        console.error('WMS save failed:', e);
        _setIndicator('error', 'Save failed');
        _localSave();
        UI.setLog('⚠️ Cloud save failed — saved locally as backup');
      }
    } else {
      _localSave();
    }
  }

  return { init, save };
})();
