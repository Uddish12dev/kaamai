import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerForecastRoutes } from './routes/forecast.js';
import { registerInventoryRoutes } from './routes/inventory.js';
import { registerLedgerRoutes } from './routes/ledger.js';
import { registerCopilotRoutes } from './routes/copilot.js';
import { registerDashboardRoutes } from './routes/dashboard.js';
import { registerHealthRoutes } from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

app.set('mlServiceUrl', ML_SERVICE_URL);
app.use(cors());
app.use(express.json());

registerHealthRoutes(app);
registerForecastRoutes(app);
registerInventoryRoutes(app);
registerLedgerRoutes(app);
registerCopilotRoutes(app);
registerDashboardRoutes(app);

app.listen(PORT, () => {
  console.log(`\n  🚀 KaamAI backend running on http://localhost:${PORT}`);
  console.log(`  📡 ML service: ${ML_SERVICE_URL}`);
  console.log(`  📦 Ledger: http://localhost:${PORT}/api/ledger`);
  console.log(`  🤖 Copilot: http://localhost:${PORT}/api/copilot\n`);
});

export default app;