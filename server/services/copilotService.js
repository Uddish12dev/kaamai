/**
 * Copilot service — Anthropic Claude API (primary) + dynamic Hinglish local fallback.
 * Uses native fetch for maximum stability and supports Claude 3.5 / 3.7 models.
 */

import { getTodaySummary, getCurrentInventory } from '../data/store.js';

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';

function getVendorContext() {
  const summary = getTodaySummary();
  const liveRevenue = 5200 + (summary?.revenue || 0);
  const liveOrders = 104 + (summary?.orders || 0);
  const inventory = getCurrentInventory();
  const lowStock = inventory.filter(i => (i.current / (i.min || 1)) <= 1.0).map(i => `${i.name} (${i.current} ${i.unit} left)`).join(', ');

  return `You are KaamAI, the personal AI business advisor for "Raju Bhai's Momos Corner", located near Delhi University (DU) North Campus Gate, Delhi.
Business Profile:
- Operating since 2019. Known for Steamed Momos (₹60), Paneer Momos (₹80), Fried Momos (₹70), Kurkure Momos (₹90), Masala Chai (₹15), Cold Drinks (₹30), DU Special Combo (₹85).
- Today's Live Performance: ₹${liveRevenue.toLocaleString()} across ${liveOrders} settled orders. Average ticket size ~₹50.
- Safe-Stock Alert: ${lowStock ? lowStock : 'Paneer is at critical level (0.5 kg left)'}.
- Target customers: DU college students, commuters, office workers.

Guidelines:
1. Tone: Warm, respectful, street-smart Hinglish ("Namaste Raju Bhai! 🙏", "bhai", "fayda", "rush hour").
2. Be concise, actionable, and encouraging. Zero corporate jargon.
3. Use emojis (🥟, ☕, 💰, 🚀, ⚡).
4. Provide concrete numerical recommendations (exact kg, plates, prices, profit margins).
5. For government schemes, recommend PM SVANidhi (₹10k first tranche collateral-free loan with 7% subsidy via CSC or pmsvanidhi.mohua.gov.in).`;
}

export const RULE_ENGINE = {
  respond(query) {
    const q = (query || '').toLowerCase();
    const summary = getTodaySummary();
    const liveRevenue = 5200 + (summary?.revenue || 0);
    const liveOrders = 104 + (summary?.orders || 0);

    if (q.includes('stock') || q.includes('kal kitna') || q.includes('saman')) {
      return `Namaste Raju Bhai! 🙏 Kal ka forecast aaya hai — demand ~94% predict ho rahi hai DU fest & exam rush ke karan.
Meri advice:
1. 🥟 Maida kam se kam 8-10 kg aur cabbage 5 kg ready rakho.
2. 🧀 Paneer abhi critical level par hai (0.5 kg bacha hai) — aaj shaam dairy se 1.5 kg zaroor le aao.
3. 🥤 Cold drinks ke 3 crates fridge mein lagao, dhoop tez hogi! 🔥`;
    }
    if (q.includes('svanidhi') || q.includes('loan') || q.includes('scheme') || q.includes('sarkari')) {
      return `PM SVANidhi scheme Raju Bhai ke liye best option hai! 💰
1. Pehli baar mein ₹10,000 collateral-free loan milta hai 7% interest subsidy ke sath.
2. Vending certificate (DU gate wala) + Aadhar card + bank passbook lagega.
3. Paas ke CSC centre jao ya pmsvanidhi.mohua.gov.in par apply karo.
Aapka KaamAI digital billing record bank mein dikhane par loan 2x fast pass hota hai! 🚀`;
    }
    if (q.includes('price') || q.includes('rate') || q.includes('badha') || q.includes('margin')) {
      return `Raju Bhai, plate ka direct price mat badhaiye — students dusre stall par chale jayenge. Ye smart strategy apnayein:
1. Veg Momo plate ₹60 hi rakhein (volume bana rahega).
2. 🍱 "DU Fest Special Combo" (Momos + Drink = ₹85) introduce karein — 42% zyada margin nikalta hai!
3. 🔥 Kurkure momos ki demand sabse high hai, usko ₹90 par aggressively push karein!`;
    }
    if (q.includes('exam') || q.includes('season') || q.includes('college') || q.includes('fest')) {
      return `Exam & Fest season golden time hai Raju Bhai! 🎓
1. 1:00-2:30 PM aur 4:30 PM exam exit ke time par 50 plates momos pehle se steamed ready rakhein.
2. Chai aur cold drinks dono peak demand par rahenge.
3. ⚡ KaamAI quick billing terminal se 5 second mein UPI QR scan karwake counter clear karein!`;
    }
    return `Namaste Raju Bhai! 🙏 Aaj aapki sales ₹${liveRevenue.toLocaleString()} ho chuki hai across ${liveOrders} orders. Shaam ki rush ke liye momos stream ready rakhein aur UPI Soundbox on rakhein taaki jaldi payments confirm ho sakein! 🔊`;
  }
};

/**
 * Call Anthropic Claude API using native fetch
 */
async function callAnthropic(message, context = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const systemPrompt = getVendorContext();

  const formattedMessages = [];
  if (context.history && Array.isArray(context.history)) {
    for (const m of context.history) {
      if (m.text && m.text.trim()) {
        formattedMessages.push({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.text
        });
      }
    }
  }
  formattedMessages.push({ role: 'user', content: message });

  const payload = {
    model,
    max_tokens: 800,
    system: systemPrompt,
    messages: formattedMessages
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey.trim(),
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find(b => b.type === 'text');
  if (!textBlock?.text) {
    throw new Error('No text in Anthropic response');
  }

  return textBlock.text;
}

export async function getCopilotReply(message, context = {}) {
  if (!message || !message.trim()) return RULE_ENGINE.respond('');
  try {
    const reply = await callAnthropic(message, context);
    return { reply, source: 'claude' };
  } catch (err) {
    console.log(`[Copilot] Falling back to rule engine (${err.message})`);
    return { reply: RULE_ENGINE.respond(message), source: 'fallback' };
  }
}