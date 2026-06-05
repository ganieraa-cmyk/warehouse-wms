/**
 * state.js — In-memory state store.
 * Depends on: config.js (MAIN_BINS, SUB_COUNT, CAP)
 */

const State = (function () {
  let _bins        = {};
  let _rowCounters = {};
  let _collapsed   = {};
  let _txLog       = [];
  let _totalPut    = 0;
  let _totalPick   = 0;

  function _freshInit() {
    _bins = {}; _rowCounters = {}; _collapsed = {};
    _txLog = []; _totalPut = 0; _totalPick = 0;
    MAIN_BINS.forEach(mb => {
      _collapsed[mb] = false;
      for (let i = 1; i <= SUB_COUNT; i++) {
        const k = mb + i;
        _rowCounters[k] = 5;
        _bins[k] = [];
        for (let r = 1; r <= 5; r++) {
          _bins[k].push({ id: r, sku: '', qty: 0, cap: CAP });
        }
      }
    });
  }

  function _fmtTime() {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  return {
    init: _freshInit,

    loadFromCloud(data) {
      _bins        = data.bins        || {};
      _rowCounters = data.rowCounters || {};
      _collapsed   = data.collapsed   || {};
      _txLog       = data.txLog       || [];
      _totalPut    = data.totalPut    || 0;
      _totalPick   = data.totalPick   || 0;
      // ensure all bin keys exist
      MAIN_BINS.forEach(mb => {
        if (!_collapsed.hasOwnProperty(mb)) _collapsed[mb] = false;
        for (let i = 1; i <= SUB_COUNT; i++) {
          const k = mb + i;
          if (!_bins[k])        _bins[k] = [];
          if (!_rowCounters[k]) _rowCounters[k] = Math.max(_bins[k].length, 5);
        }
      });
    },

    snapshot() {
      return {
        bins: _bins, rowCounters: _rowCounters,
        collapsed: _collapsed, txLog: _txLog,
        totalPut: _totalPut, totalPick: _totalPick
      };
    },

    getBins    : ()     => _bins,
    getBin     : (k)    => _bins[k] || [],
    collapsed  : (mb)   => _collapsed[mb],
    totalPut   : ()     => _totalPut,
    totalPick  : ()     => _totalPick,
    txLog      : ()     => _txLog,
    allSubKeys : (mb)   => Array.from({ length: SUB_COUNT }, (_, i) => mb + (i + 1)),

    totalRows() {
      return Object.values(_bins).reduce((s, rows) => s + rows.length, 0);
    },

    toggleCollapse(mb) { _collapsed[mb] = !_collapsed[mb]; },

    addRow(k) {
      _rowCounters[k] = (_rowCounters[k] || 0) + 1;
      _bins[k].push({ id: _rowCounters[k], sku: '', qty: 0, cap: CAP });
      return _rowCounters[k];
    },

    deleteRow(k, idx) {
      if (_bins[k][idx].qty > 0) return { ok: false, msg: 'Clear stock first' };
      _bins[k].splice(idx, 1);
      return { ok: true };
    },

    putaway(k, idx, skuVal, qty) {
      const row = _bins[k][idx];
      if (!row)                              return { ok: false, msg: 'Row not found' };
      if (!skuVal)                           return { ok: false, msg: 'Enter SKU' };
      if (qty <= 0)                          return { ok: false, msg: 'Enter qty' };
      if (row.qty + qty > CAP)               return { ok: false, msg: 'Exceeds cap ' + CAP };
      if (row.sku && row.sku !== skuVal)     return { ok: false, msg: 'SKU mismatch: ' + row.sku };
      row.sku = skuVal; row.qty += qty; _totalPut += qty;
      _txLog.unshift({
        no: _txLog.length + 1, time: _fmtTime(),
        type: 'PUTAWAY', bin: k, row: row.id,
        sku: skuVal, qty, balance: row.qty
      });
      return { ok: true, row };
    },

    pick(k, idx, qty) {
      const row = _bins[k][idx];
      if (!row)          return { ok: false, msg: 'Row not found' };
      if (qty <= 0)      return { ok: false, msg: 'Enter qty' };
      if (row.qty === 0) return { ok: false, msg: 'Row is empty' };
      if (qty > row.qty) return { ok: false, msg: 'Only ' + row.qty + ' avail' };
      const prevSku = row.sku;
      row.qty -= qty; _totalPick += qty;
      if (row.qty === 0) row.sku = '';
      _txLog.unshift({
        no: _txLog.length + 1, time: _fmtTime(),
        type: 'PICK', bin: k, row: row.id,
        sku: prevSku, qty, balance: row.qty
      });
      return { ok: true, row, prevSku };
    },

    clearAll() { _freshInit(); }
  };
})();

State.init();
