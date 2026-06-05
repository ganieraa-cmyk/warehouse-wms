/**
 * ui.js — DOM rendering.
 * Depends on: config.js, state.js
 */

const UI = (function () {

  function fillColor(qty) {
    const p = qty / CAP;
    if (qty === 0) return '#c8c6bc';
    if (p >= 0.7)  return '#1a7a52';
    if (p >= 0.3)  return '#1558a0';
    return '#e5a000';
  }

  function pillClass(qty) {
    const p = qty / CAP;
    if (qty === 0) return 'pill-zero';
    if (p >= 0.7)  return 'pill-full';
    if (p >= 0.3)  return 'pill-mid';
    return 'pill-low';
  }

  function setLog(msg) {
    const el = document.getElementById('logMsg');
    if (el) el.innerHTML = msg;
  }

  function setSyncIndicator(state, label) {
    const dot = document.getElementById('syncDot');
    const lbl = document.getElementById('syncLabel');
    if (dot) dot.className = 'sync-dot ' + (state || '');
    if (lbl) lbl.textContent = label || '';
  }

  function updateStats() {
    document.getElementById('st-rows').textContent = State.totalRows();
    document.getElementById('st-put').textContent  = State.totalPut();
    document.getElementById('st-pick').textContent = State.totalPick();
  }

  function showToast(k, idx, msg, type) {
    const el = document.getElementById('t-' + k + '-' + idx);
    if (!el) return;
    el.textContent = msg;
    el.className   = 'toast ' + (type || 'ok');
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
  }

  function renderTx() {
    const log   = State.txLog();
    const tbody = document.getElementById('txBody');
    if (!tbody) return;
    if (!log.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="no-tx">No transactions yet</td></tr>';
      return;
    }
    tbody.innerHTML = log.slice(0, 80).map(t => `
      <tr>
        <td>${t.no}</td>
        <td>${t.time}</td>
        <td class="tx-type ${t.type === 'PUTAWAY' ? 'tx-put' : 'tx-pick'}">${t.type}</td>
        <td>${t.bin}</td>
        <td>R${t.row}</td>
        <td>${t.sku}</td>
        <td>${t.qty}</td>
        <td>${t.balance}</td>
      </tr>`).join('');
  }

  function buildRowEl(k, row, idx) {
    const rp  = Math.round(row.qty / CAP * 100);
    const rd  = document.createElement('div');
    rd.className = 'row-item';
    rd.innerHTML = `
      <div id="t-${k}-${idx}" class="toast"></div>
      <div class="row-top">
        <span class="row-num">R${row.id}</span>
        ${row.sku
          ? `<span class="row-sku-display">${row.sku}</span>`
          : `<span class="row-sku-empty">— empty —</span>`}
        <span class="qty-pill ${pillClass(row.qty)}">${row.qty}/${CAP}</span>
        <span class="row-pct">${rp}%</span>
      </div>
      <div class="row-fill-wrap">
        <div class="row-fill" style="width:${rp}%;background:${fillColor(row.qty)}"></div>
      </div>
      <div class="row-actions">
        <div class="act-group">
          <span class="act-label">SKU</span>
          <input class="act-text" type="text"
            id="ps-${k}-${idx}"
            placeholder="${row.sku || 'e.g. BOLT-M8'}"
            value="${row.sku || ''}">
          <span class="act-label">Qty</span>
          <input class="act-num" type="number" min="1"
            id="pq-${k}-${idx}" placeholder="0">
          <button class="act-btn btn-put"
            data-action="put" data-bin="${k}" data-idx="${idx}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
            Putaway
          </button>
        </div>
        <div class="sep"></div>
        <div class="act-group">
          <span class="act-label">Pick qty</span>
          <input class="act-num" type="number" min="1"
            id="ck-${k}-${idx}" placeholder="0"
            ${row.qty === 0 ? 'disabled' : ''}>
          <button class="act-btn btn-pick"
            data-action="pick" data-bin="${k}" data-idx="${idx}"
            ${row.qty === 0 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
            Pick
          </button>
        </div>
        <div class="sep"></div>
        <button class="act-btn btn-del"
          data-action="del" data-bin="${k}" data-idx="${idx}"
          title="Delete row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>`;
    return rd;
  }

  function renderFloor() {
    updateStats();
    const root = document.getElementById('floorRoot');
    if (!root) return;
    root.innerHTML = '';

    MAIN_BINS.forEach(mb => {
      const subKeys   = State.allSubKeys(mb);
      const totalQty  = subKeys.reduce((s, k) => s + State.getBin(k).reduce((ss, r) => ss + r.qty, 0), 0);
      const totalRows = subKeys.reduce((s, k) => s + State.getBin(k).length, 0);
      const totalCap  = (totalRows * CAP) || 1;
      const pct       = Math.round(totalQty / totalCap * 100);
      const isOpen    = !State.collapsed(mb);

      const block = document.createElement('div');
      block.className = 'main-bin-block';
      block.innerHTML = `
        <div class="main-bin-header" data-toggle="${mb}">
          <div class="main-bin-icon">${mb}</div>
          <div class="main-bin-name">Bin ${mb}
            <span class="main-bin-meta">${totalRows} rows · ${totalQty} units · ${pct}%</span>
          </div>
          <div class="mini-bar-wrap">
            <div class="mini-bar" style="width:${pct}%;background:${fillColor(totalQty)}"></div>
          </div>
          <svg class="chevron-icon ${isOpen ? 'open' : ''}"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>`;
      root.appendChild(block);

      if (!isOpen) return;

      const subWrap = document.createElement('div');
      subWrap.className = 'sub-bins-wrap';
      block.appendChild(subWrap);

      subKeys.forEach(k => {
        const rows = State.getBin(k);
        const tQty = rows.reduce((s, r) => s + r.qty, 0);
        const tCap = (rows.length * CAP) || 1;
        const bp   = Math.round(tQty / tCap * 100);

        const card = document.createElement('div');
        card.className = 'bin-card';
        card.innerHTML = `
          <div class="bin-card-header">
            <div class="bin-card-name">Bin ${k}</div>
            <div class="bin-card-meta">${rows.length} rows · ${tQty}/${rows.length * CAP} units · ${bp}%</div>
            <button class="add-row-btn" data-addrow="${k}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add row
            </button>
          </div>
          <div class="fill-track">
            <div class="fill-track-inner" style="width:${bp}%;background:${fillColor(tQty)}"></div>
          </div>
          <div class="rows-area" id="ra-${k}"></div>`;
        subWrap.appendChild(card);

        const ra = document.getElementById('ra-' + k);
        if (!ra) return;

        if (rows.length === 0) {
          ra.innerHTML = '<div class="empty-rows">No rows — click Add row to begin</div>';
          return;
        }
        rows.forEach((row, idx) => ra.appendChild(buildRowEl(k, row, idx)));
      });
    });
  }

  return { renderFloor, renderTx, setLog, showToast, updateStats, setSyncIndicator };
})();
