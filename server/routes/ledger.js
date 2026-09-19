import { recordBill, getBills, getTodaySummary, addExpense } from '../data/store.js';

export function registerLedgerRoutes(app) {
  app.post('/api/ledger/bill', (req, res) => {
    const bill = req.body;
    if (!bill || !bill.finalTotal) {
      return res.status(400).json({ error: 'Invalid bill data' });
    }
    const record = recordBill(bill);

    addExpense('rawMaterials', Math.round(bill.finalTotal * 0.68));
    addExpense('gasFuel', Math.round(bill.finalTotal * 0.12));
    addExpense('transport', Math.round(bill.finalTotal * 0.10));
    addExpense('other', Math.round(bill.finalTotal * 0.10));

    res.json({ success: true, bill: record, today: getTodaySummary() });
  });

  app.get('/api/ledger', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const bills = getBills(limit);
    const today = getTodaySummary();
    res.json({ bills, today });
  });

  app.get('/api/ledger/today', (_req, res) => {
    const summary = getTodaySummary();
    res.json(summary);
  });
}