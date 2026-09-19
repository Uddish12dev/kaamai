/** Service to call the Python scikit-learn forecasting microservice. */

export async function getDemandPrediction(input, mlServiceUrl) {
  try {
    const res = await fetch(`${mlServiceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (res.ok) {
      const data = await res.json();
      return { source: 'ml-model', ...data };
    }
  } catch {}
  return { source: 'fallback-js', ...jsFallbackForecast(input) };
}

function jsFallbackForecast(body) {
  const { dayOfWeek, rain, examSeason, fest } = body || {};
  const dowMap = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
  const dow = typeof dayOfWeek === 'string' ? dowMap[dayOfWeek.toLowerCase()] ?? 0 : dayOfWeek;
  const rainFactor = typeof rain === 'number' ? rain : 0;
  const examBonus = examSeason ? 1.4 : 1.0;
  const festBonus = fest ? 1.5 : 1.0;
  const dowMultipliers = [0.85, 0.9, 1.05, 0.95, 1.2, 1.5, 1.3];
  const baseMult = dowMultipliers[dow] || 1.0;
  const combined = baseMult * (1 + rainFactor * 0.6) * examBonus * festBonus;

  return {
    momos: { pct: Math.min(99, Math.round(70 * combined)), trend: combined > 1.2 ? '+15%' : combined > 1.0 ? '+8%' : '-3%' },
    coldDrinks: { pct: Math.min(99, Math.round(50 * combined)), trend: rainFactor > 0.3 ? '+20%' : '+5%' },
    tea: { pct: Math.min(99, Math.round(40 * combined * (rainFactor > 0.3 ? 1.6 : 1.0))) },
    chutney: { pct: Math.min(99, Math.round(55 * combined)), trend: '+2%' }
  };
}