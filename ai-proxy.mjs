// ai-proxy.mjs — local key-hiding proxy for Invoice Studio's AI features.
//
// Why this exists: Invoice Studio runs entirely in the browser. If it called NVIDIA
// directly, your API key would be visible to anyone who opened the page. This tiny
// proxy holds the key on YOUR machine, adds it to each request, and forwards to
// NVIDIA's OpenAI-compatible endpoint. The browser only ever talks to localhost.
//
// Run it:   node ai-proxy.mjs
// Stop it:  Ctrl+C
//
// The key is read from (in order):
//   1) the NVIDIA_API_KEY environment variable, or
//   2) a file .ai-proxy.config.json next to this file: { "NVIDIA_API_KEY": "nvapi-..." }
//      (a dotfile so it is never published by a static host / Vercel deploy; the legacy
//       non-dot name ai-proxy.config.json is still read as a fallback)
// Never paste the key into the web app, the browser, or a chat. It belongs here only.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.AI_PROXY_PORT) || 8787;
const UPSTREAM = process.env.AI_UPSTREAM || 'https://integrate.api.nvidia.com/v1/chat/completions';

function readKey() {
  if (process.env.NVIDIA_API_KEY) return process.env.NVIDIA_API_KEY.trim();
  for (const name of ['.ai-proxy.config.json', 'ai-proxy.config.json']) {
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
      if (cfg && cfg.NVIDIA_API_KEY) return String(cfg.NVIDIA_API_KEY).trim();
    } catch (e) { /* try the next location */ }
  }
  return '';
}

const KEY = readKey();
if (!KEY) {
  console.error('\n[ai-proxy] No NVIDIA API key found.');
  console.error('  Set NVIDIA_API_KEY, or create .ai-proxy.config.json with { "NVIDIA_API_KEY": "nvapi-..." }');
  console.error('  Copy ai-proxy.config.example.json to .ai-proxy.config.json and paste your key.\n');
  process.exit(1);
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    return res.end('{"ok":true}');
  }

  if (req.method !== 'POST' || !req.url.startsWith('/v1/chat/completions')) {
    res.writeHead(404, { ...CORS, 'Content-Type': 'application/json' });
    return res.end('{"error":"not found"}');
  }

  let body = '';
  req.on('data', (c) => {
    body += c;
    if (body.length > 25 * 1024 * 1024) req.destroy(); // guard against huge uploads
  });
  req.on('end', async () => {
    try {
      const upstream = await fetch(UPSTREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
        body,
      });
      const text = await upstream.text();
      res.writeHead(upstream.status, { ...CORS, 'Content-Type': 'application/json' });
      res.end(text);
    } catch (e) {
      res.writeHead(502, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String((e && e.message) || e) }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n[ai-proxy] running on http://127.0.0.1:${PORT}`);
  console.log(`[ai-proxy] forwarding to ${UPSTREAM}`);
  console.log(`[ai-proxy] key loaded (${KEY.slice(0, 7)}…). Leave this window open while you use AI features.\n`);
});
