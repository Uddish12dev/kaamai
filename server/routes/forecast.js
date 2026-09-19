/**
 * Fallback deterministic demand forecast (matches the Python ML model's
 * expected output when historical data is sparse).
 */
function jsFallbackForecast(reqBody) {
  const { dayOfWeek, rain, examSeason, fest } = reqBody || {};
  const dowMap = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
  const dow = typeof dayOfWeek === 'string' ? dowMap[dayOfWeek.toLowerCase()] ?? 0 : (dayOfWeek ?? 4);
  const rainFactor = typeof rain === 'number' ? rain : 0.1;
  const examBonus = examSeason ? 1.4 : 1.1;
  const festBonus = fest ? 1.5 : 1.0;
  const dowMultipliers = [0.85, 0.9, 1.05, 0.95, 1.2, 1.5, 1.3];
  const baseMult = dowMultipliers[dow] || 1.1;
  const combined = baseMult * (1 + rainFactor * 0.6) * examBonus * festBonus;

  return {
    momos: { pct: Math.min(99, Math.round(70 * combined)), trend: combined > 1.2 ? '+15%' : combined > 1.0 ? '+8%' : '-3%' },
    coldDrinks: { pct: Math.min(99, Math.round(50 * combined)), trend: rainFactor > 0.3 ? '+20%' : '+5%' },
    tea: { pct: Math.min(99, Math.round(40 * combined * (rainFactor > 0.3 ? 1.6 : 1.0))), trend: rainFactor > 0.2 ? '+18%' : '+2%' },
    chutney: { pct: Math.min(99, Math.round(55 * combined)), trend: '+2%' }
  };
}

export function registerForecastRoutes(app) {
  const getForecastHandler = async (req, res) => {
    const today = new Date();
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const defaultDow = dayNames[today.getDay()];
    const body = {
      dayOfWeek: req.body?.dayOfWeek || req.query?.dayOfWeek || defaultDow,
      rain: req.body?.rain !== undefined ? req.body.rain : 0.15,
      examSeason: req.body?.examSeason !== undefined ? req.body.examSeason : isExamSeason(today),
      fest: req.body?.fest !== undefined ? req.body.fest : isFestSeason(today)
    };

    try {
      const mlUrl = req.app.get('mlServiceUrl');
      if (mlUrl) {
        const mlRes = await fetch(`${mlUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).catch(() => null);

        if (mlRes && mlRes.ok) {
          const data = await mlRes.json();
          return res.json({ source: 'ml-model', ...data });
        }
      }
    } catch {}

    const data = jsFallbackForecast(body);
    res.json({ source: 'fallback-js', ...data });
  };

  app.get('/api/forecast', getForecastHandler);
  app.post('/api/forecast', getForecastHandler);

  app.post('/api/forecast/daily', async (req, res) => {
    const today = new Date();
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const dow = dayNames[today.getDay()];
    const body = { dayOfWeek: dow, rain: Math.random() * 0.5, examSeason: isExamSeason(today), fest: isFestSeason(today) };

    try {
      const mlUrl = req.app.get('mlServiceUrl');
      const mlRes = await fetch(`${mlUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(() => null);

      if (mlRes && mlRes.ok) {
        const data = await mlRes.json();
        return res.json({ source: 'ml-model', dow, ...data });
      }
    } catch {}

    const data = jsFallbackForecast(body);
    res.json({ source: 'fallback-js', dow, ...data });
  });
}

function isExamSeason(d) {
  const m = d.getMonth(), day = d.getDate();
  return (m === 7 && day >= 15 && day <= 31) || (m === 8 && day <= 15);
}

function isFestSeason(d) {
  const m = d.getMonth(), day = d.getDate();
  return (m === 7 && day >= 25) || (m === 8 && day >= 28);
}