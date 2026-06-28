// Vercel serverless proxy to NVIDIA NIM — POST /api/v1/chat/completions
// The production equivalent of ai-proxy.mjs. The NVIDIA key lives ONLY in the Vercel
// env var NVIDIA_API_KEY — never in the client or the repo. The browser calls this
// same-origin route; this function adds the key and forwards to NVIDIA.
const UPSTREAM = process.env.AI_UPSTREAM || 'https://integrate.api.nvidia.com/v1/chat/completions';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const KEY = process.env.NVIDIA_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'NVIDIA_API_KEY is not set in this Vercel project.' });

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
      body,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: String((e && e.message) || e) });
  }
};
