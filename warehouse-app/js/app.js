/**
 * app.js — Entry point. Wires all events via delegation.
 * Depends on: state.js, firebase.js, ui.js, export.js
 */

/* ── Boot: init DB → render on first load ── */
DB.init(
  /* onLoad  */ () => { UI.renderFloor(); UI.renderTx(); },
  /* onSync  */ () => { UI.renderFloor(); UI.renderTx(); }
);

/* helper: save to cloud + re-render */
function saveAndRender(logMsg) {
  if (logMsg) UI.setLog(logMsg);
  DB.save();
  UI.renderFloor();
  UI.renderTx();
}

/* ── Export button ── */
document.getElementById('exportBtn').addEventListener('click', () => {
  Exporter.exportExcel();
});

/* ── Clear Data button ── */
document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('All bin data and transaction log will be deleted everywhere. Sure?')) {
    State.clearAll();
    saveAndRender('All data cleared — fresh start');
  }
});

/* ── Floor root: event delegation ── */
document.getElementById('floorRoot').addEventListener('click', e => {
  const btn = e.target.closest('[data-action],[data-toggle],[data-addrow]');
  if (!btn) return;

  /* Toggle main bin collapse — local only, no cloud save needed */
  if (btn.dataset.toggle) {
    State.toggleCollapse(btn.dataset.toggle);
    UI.renderFloor();
    return;
  }

  /* Add row */
  if (btn.dataset.addrow) {
    const k      = btn.dataset.addrow;
    const rowNum = State.addRow(k);
    saveAndRender('Row <strong>' + rowNum + '</strong> added to Bin ' + k);
    return;
  }

  /* Putaway */
  if (btn.dataset.action === 'put') {
    const k      = btn.dataset.bin;
    const idx    = parseInt(btn.dataset.idx);
    const skuEl  = document.getElementById('ps-' + k + '-' + idx);
    const qtyEl  = document.getElementById('pq-' + k + '-' + idx);
    const skuVal = (skuEl ? skuEl.value : '').trim().toUpperCase();
    const qty    = parseInt(qtyEl ? qtyEl.value : 0) || 0;
    const res    = State.putaway(k, idx, skuVal, qty);
    if (!res.ok) { UI.showToast(k, idx, res.msg, 'err'); return; }
    saveAndRender('Putaway <strong>' + qty + ' × ' + skuVal + '</strong> → Bin ' + k + ' / Row ' + res.row.id);
    return;
  }

  /* Pick */
  if (btn.dataset.action === 'pick') {
    const k     = btn.dataset.bin;
    const idx   = parseInt(btn.dataset.idx);
    const qtyEl = document.getElementById('ck-' + k + '-' + idx);
    const qty   = parseInt(qtyEl ? qtyEl.value : 0) || 0;
    const res   = State.pick(k, idx, qty);
    if (!res.ok) { UI.showToast(k, idx, res.msg, 'err'); return; }
    saveAndRender('Picked <strong>' + qty + ' × ' + res.prevSku + '</strong> ← Bin ' + k + ' / Row ' + res.row.id);
    return;
  }

  /* Delete row */
  if (btn.dataset.action === 'del') {
    const k   = btn.dataset.bin;
    const idx = parseInt(btn.dataset.idx);
    const res = State.deleteRow(k, idx);
    if (!res.ok) { UI.showToast(k, idx, res.msg, 'err'); return; }
    saveAndRender('Row deleted from Bin <strong>' + k + '</strong>');
    return;
  }
});
