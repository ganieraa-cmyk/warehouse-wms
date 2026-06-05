# WMS — Warehouse Floor Layout

A browser-based warehouse inventory management system.
Bins A to E, sub-bins A1–E5, with putaway, picking, and Excel export.

---

## File Structure

```
warehouse-app/
├── index.html          ← Main entry point
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── state.js        ← Data store (bins, rows, transactions)
│   ├── ui.js           ← DOM rendering
│   ├── export.js       ← Excel export (SheetJS)
│   └── app.js          ← Event wiring, entry point
└── README.md
```

---

## How to Run

### Option 1 — Python (simplest)
```bash
cd warehouse-app
python3 -m http.server 8080
```
Then open: http://localhost:8080

### Option 2 — Node.js (npx serve)
```bash
cd warehouse-app
npx serve .
```

### Option 3 — VS Code
Install the **Live Server** extension → right-click `index.html` → Open with Live Server

### Option 4 — PHP
```bash
cd warehouse-app
php -S localhost:8080
```

---

## Features

| Feature | Detail |
|---|---|
| Bins | A, B, C, D, E (main) |
| Sub-bins | A1–A5, B1–B5, C1–C5, D1–D5, E1–E5 |
| Rows per bin | 5 default, unlimited add/delete |
| SKU entry | Manual text input per row |
| Putaway | Add stock to any row (with SKU mismatch check) |
| Pick | Remove stock from any row |
| Fill bars | Live colour-coded (green/blue/amber) |
| Transaction log | Full history with time, bin, row, SKU, qty, balance |
| Excel export | 3 sheets: Stock Summary, Bin Totals, Transaction Log |

---

## Excel Export Sheets

1. **Stock Summary** — Every row across all bins with fill % and status
2. **Bin Totals** — Per sub-bin utilization summary
3. **Transaction Log** — Full putaway/pick history

---

## Notes

- No backend needed — fully browser-based
- SheetJS loaded via CDN for Excel export
- Google Fonts loaded via CDN (DM Sans + JetBrains Mono)
- Works offline if you replace CDN links with local copies
