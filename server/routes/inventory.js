import { getStore, recordInventoryAdjustment, getCurrentInventory } from '../data/store.js';

const INITIAL_INVENTORY = [
  { name: 'Maida (Flour)', icon: '🌾', current: 5, unit: 'kg', min: 3, cost: 40 },
  { name: 'Cabbage', icon: '🥬', current: 2, unit: 'kg', min: 2, cost: 20 },
  { name: 'Paneer', icon: '🧀', current: 0.5, unit: 'kg', min: 1, cost: 320 },
  { name: 'Cold Drinks', icon: '🥤', current: 48, unit: 'bottles', min: 30, cost: 18 },
  { name: 'Tea Leaves', icon: '🍃', current: 800, unit: 'g', min: 400, cost: 3 },
  { name: 'Gas Cylinder', icon: '🔥', current: 60, unit: '%', min: 30, cost: 0 }
];

function getStatus(current, min) {
  const ratio = current / min;
  if (ratio <= 0.5) return { label: 'Critical', color: '#e17055' };
  if (ratio <= 1) return { label: 'Low', color: '#6c5ce7' };
  return { label: 'OK', color: '#00b894' };
}

export function registerInventoryRoutes(app) {
  // GET /api/inventory — current stock with status
  app.get('/api/inventory', (_req, res) => {
    const storeItems = getCurrentInventory();
    const items = storeItems.length > 0
      ? storeItems.map(item => ({ ...item, status: getStatus(item.current, item.min) }))
      : INITIAL_INVENTORY.map(item => ({ ...item, status: getStatus(item.current, item.min) }));
    res.json({ items });
  });

  // POST /api/inventory/adjust — record a restock or adjustment
  app.post('/api/inventory/adjust', (req, res) => {
    const { name, addedKg, addedBottles, addedG, addedPercent } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const snapshot = recordInventoryAdjustment({ name, addedKg, addedBottles, addedG, addedPercent });
    res.json({ success: true, snapshot });
  });

  // POST /api/inventory/shopping-list — generate restock list
  app.post('/api/inventory/shopping-list', (req, res) => {
    const storeItems = getCurrentInventory();
    const baseItems = storeItems.length > 0 ? storeItems : INITIAL_INVENTORY;
    const needsRestock = baseItems.filter(item => {
      const ratio = item.current / item.min;
      return ratio <= 1.2;
    });

    const recommendations = needsRestock.map(item => {
      const needed = Math.max(0, item.min - item.current);
      const stores = {
        'Maida (Flour)': 'Kirana store',
        'Cabbage': 'Vegetable market',
        'Paneer': 'Big Bazaar / Local dairy',
        'Cold Drinks': 'Wholesale distributor',
        'Tea Leaves': 'Kirana store',
        'Gas Cylinder': 'Gas agency'
      };
      const costMap = { 'Maida (Flour)': 40, 'Cabbage': 20, 'Paneer': 320, 'Cold Drinks': 18, 'Tea Leaves': 3, 'Gas Cylinder': 0 };
      return {
        item: item.name,
        icon: item.icon,
        qty: needed.toFixed(1) + ' ' + item.unit,
        est: `₹${Math.round(needed * costMap[item.name] || 50)}`,
        store: stores[item.name] || 'Local market',
        status: getStatus(item.current, item.min).label
      };
    });

    const total = recommendations.reduce((sum, r) => {
      const match = r.est.match(/₹(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    res.json({ shoppingList: recommendations, estimatedTotal: total });
  });
}
