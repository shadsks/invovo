// Vercel serverless health check — GET /api/health
// Lets the app's "Test connection" button confirm the function is live and the key is set.
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  return res.status(200).json({ ok: true, key: !!process.env.NVIDIA_API_KEY });
};
