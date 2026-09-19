import { getTodaySummary, getBills } from '../data/store.js';

export function registerDashboardRoutes(app) {
  app.get('/api/dashboard', (req, res) => {
    const today = getTodaySummary();
    const limit = parseInt(req.query.limit) || 10;
    const recentBills = getBills(limit);

    const baseRevenue = 5200;
    const baseOrders = 104;
    const revenue = baseRevenue + (today.revenue || 0);
    const orders = baseOrders + (today.orders || 0);
    const avgOrder = orders > 0 ? Math.round(revenue / orders) : 50;

    res.json({
      today: {
        revenue,
        orders,
        avgOrder,
        doD: '+18%'
      },
      recentBills,
      todayBills: today.bills || [],
      timestamp: new Date().toISOString()
    });
  });
}
