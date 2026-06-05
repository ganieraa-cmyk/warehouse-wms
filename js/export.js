/**
 * export.js — Excel export via SheetJS.
 * Depends on: config.js, state.js
 */

const Exporter = (function () {

  function exportExcel() {
    const wb   = XLSX.utils.book_new();
    const bins = State.getBins();
    const date = new Date().toISOString().slice(0, 10);

    /* Sheet 1: Stock Summary */
    const summaryRows = [
      ['Main Bin','Sub-Bin','Row','SKU','Qty','Capacity','Fill %','Status']
    ];
    MAIN_BINS.forEach(mb => {
      for (let i = 1; i <= SUB_COUNT; i++) {
        const k = mb + i;
        (bins[k] || []).forEach(row => {
          const pct    = Math.round(row.qty / CAP * 100);
          const status = row.qty === 0 ? 'Empty' : pct >= 70 ? 'Full' : pct >= 30 ? 'Medium' : 'Low';
          summaryRows.push([mb, k, 'Row ' + row.id, row.sku || '—', row.qty, CAP, pct, status]);
        });
      }
    });
    const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
    ws1['!cols'] = [10,10,8,18,8,10,8,10].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws1, 'Stock Summary');

    /* Sheet 2: Bin Totals */
    const binRows = [['Sub-Bin','Total Rows','Total Qty','Total Capacity','Utilization %']];
    MAIN_BINS.forEach(mb => {
      for (let i = 1; i <= SUB_COUNT; i++) {
        const k    = mb + i;
        const rows = bins[k] || [];
        const tQty = rows.reduce((s, r) => s + r.qty, 0);
        const tCap = rows.length * CAP;
        const util = tCap > 0 ? Math.round(tQty / tCap * 100) : 0;
        binRows.push([k, rows.length, tQty, tCap, util]);
      }
    });
    const ws2 = XLSX.utils.aoa_to_sheet(binRows);
    ws2['!cols'] = [10,12,12,16,14].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws2, 'Bin Totals');

    /* Sheet 3: Transaction Log */
    const txRows = [['#','Time','Type','Bin','Row','SKU','Qty','Balance After']];
    const log = State.txLog();
    if (!log.length) {
      txRows.push(['—','—','—','—','—','—','—','—']);
    } else {
      log.forEach(t => txRows.push([t.no, t.time, t.type, t.bin, 'Row ' + t.row, t.sku, t.qty, t.balance]));
    }
    const ws3 = XLSX.utils.aoa_to_sheet(txRows);
    ws3['!cols'] = [6,12,10,8,8,18,8,14].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws3, 'Transaction Log');

    const filename = 'warehouse_inventory_' + date + '.xlsx';
    XLSX.writeFile(wb, filename);
    UI.setLog('Excel exported — <strong>' + filename + '</strong> downloaded');
  }

  return { exportExcel };
})();
