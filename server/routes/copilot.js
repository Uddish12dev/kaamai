import { getCopilotReply, RULE_ENGINE } from '../services/copilotService.js';

export function registerCopilotRoutes(app) {
  app.post('/api/copilot', async (req, res) => {
    try {
      const { message, context } = req.body || {};
      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'message required' });
      }
      const result = await getCopilotReply(message, context);
      res.json(result);
    } catch (err) {
      res.json({ reply: RULE_ENGINE.respond(req.body?.message || ''), source: 'fallback' });
    }
  });
}