export function registerHealthRoutes(app) {
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'kaamai-backend' });
  });
}
