module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ ok: false, error: 'Missing Telegram configuration' });

  const { name = '', phone = '', type = '' } = req.body || {};
  if (!String(name).trim() || !String(phone).trim()) {
    return res.status(400).json({ ok: false, error: 'Name and phone are required' });
  }

  const message = `FABS yangi so'rov\n\nIsm: ${String(name).trim()}\nTelefon: ${String(phone).trim()}\nLoyiha turi: ${String(type).trim() || 'Ko‘rsatilmagan'}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });
    const data = await r.json();
    if (!r.ok || !data.ok) return res.status(502).json({ ok: false, error: 'Telegram API error' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
};
