// Cloudflare Pages — Advanced Mode single Worker (no build step, drag-and-drop friendly).
// Handles the AI proxy routes; everything else is served as a static asset.
// The NVIDIA key lives ONLY in the free Cloudflare env var / secret NVIDIA_API_KEY.
const UPSTREAM = 'https://integrate.api.nvidia.com/v1/chat/completions';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (obj, status) =>
  new Response(JSON.stringify(obj), { status: status || 200, headers: { 'Content-Type': 'application/json', ...cors } });

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    // GET /api/health — Test connection
    if (pathname === '/api/health') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      return json({ ok: true, key: !!env.NVIDIA_API_KEY });
    }

    // POST /api/v1/chat/completions — proxy to NVIDIA NIM
    if (pathname === '/api/v1/chat/completions') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);
      const KEY = env.NVIDIA_API_KEY;
      if (!KEY) return json({ error: 'NVIDIA_API_KEY is not set in this Cloudflare Pages project.' }, 500);
      try {
        const body = await request.text();
        const upstream = await fetch(UPSTREAM, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
          body,
        });
        const text = await upstream.text();
        return new Response(text, { status: upstream.status, headers: { 'Content-Type': 'application/json', ...cors } });
      } catch (e) {
        return json({ error: String((e && e.message) || e) }, 502);
      }
    }

    // Everything else → static files (index.html, css, js, ...)
    return env.ASSETS.fetch(request);
  },
};
