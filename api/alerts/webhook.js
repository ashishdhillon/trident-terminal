// Cooldown-protected alert dispatcher for Discord, Slack, and Telegram webhooks.
// Prevents alert fatigue when Threat Convergence Index oscillates around 85/100.

const COOLDOWN_MS = 15 * 60 * 1000;
let lastAlertTimestamp = 0;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  const { threat_index = 87, threshold = 85, title = 'Trident Critical Threshold Breached', summary = '', force = false } = req.body || {};

  if (threat_index < threshold && !force) {
    return res.status(200).json({ dispatched: false, reason: `Index ${threat_index} below threshold ${threshold}` });
  }

  const now = Date.now();
  if (!force && now - lastAlertTimestamp < COOLDOWN_MS) {
    const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastAlertTimestamp)) / 1000);
    return res.status(200).json({ dispatched: false, reason: `Cooldown active (${remainingSec}s remaining)` });
  }

  const message = `[TRIDENT C2 ALERT] ${title}\nThreat Convergence Index: ${threat_index}/100 (Threshold: ${threshold})\n${summary || 'Inspect live terminal for cross-domain causality.'}`;
  const results = {};

  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      const r = await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
      results.discord = r.ok ? 'sent' : `http_${r.status}`;
    } catch { results.discord = 'failed'; }
  }

  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const r = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
      results.slack = r.ok ? 'sent' : `http_${r.status}`;
    } catch { results.slack = 'failed'; }
  }

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message })
      });
      results.telegram = r.ok ? 'sent' : `http_${r.status}`;
    } catch { results.telegram = 'failed'; }
  }

  const configured = Object.keys(results).length > 0;
  if (configured) lastAlertTimestamp = now;

  res.status(200).json({
    dispatched: configured,
    timestamp: new Date(now).toISOString(),
    channels: configured ? results : { note: 'No webhook env vars configured (DISCORD_WEBHOOK_URL / SLACK_WEBHOOK_URL / TELEGRAM_BOT_TOKEN)' }
  });
}
