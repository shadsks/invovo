# Invoice Studio — AI features setup

All AI features are powered by free NVIDIA NIM models and share **three model roles** you configure in *Settings → AI features*: **vision** (image reading), **followup** (message/text drafting), and **scope** (reasoning). Each feature below reuses one of those three roles — there is nothing extra to configure.

**Vision (screenshot/photo reading)**
1. **Payment-screenshot reader** — read a GCash/Maya "paid na po" screenshot and auto-fill the reference, amount, and method. In *Record payment*, installment payments, and split-payer shares.
2. **Supplier-receipt reader** — on a project's *Pass-Through Costs* card, **Scan receipt (AI)** reads a vendor/expense receipt and pre-fills the description, category, and cost.

**Drafting (followup role)**
3. **Register-matched follow-up draft** — in *Compose & send the ask*, **AI draft** writes the message in the client's own Taglish/formality.
4. **Tone check** — in the composer, **Tone check** flags a hostile/unclear message and offers a softer, still-firm rewrite.
5. **Escalating reminder ladder** — on an overdue invoice, **AI: draft all 4 reminders** writes friendly → firm → files-locked → formal versions in one go.
6. **AI quote / proposal** — on the Action Center, **AI quote** turns a short brief into an itemized PHP proposal with PH-appropriate terms.
7. **Cash-flow explainer** — on *Insights → Cash-flow forecast*, **Explain** narrates which months are thin/strong and what to do this week.
8. **Discount ("pa-tawad") coach** — on *Change Orders*, **Handle a discount request** returns reply options that trade scope, not price.
9. **Reschedule / typhoon message** — on *Weather Reschedule*, **AI reschedule message** drafts the empathetic-but-clear move message.
10. **Onboarding setup** — in *Settings → Business profile*, **Describe your studio (AI)** suggests business name, terms, reservation %, and revision policy.
11. **Review & testimonial co-writer** — on a delivered/paid project's *Review & Referral* card, **AI review & testimonial** drafts the ask plus a testimonial the client can edit.

**Reasoning (scope role)**
12. **Scope-creep / request checker** — on *Change Orders*, **Check a request** decides in-scope vs. billable, with a ready reply and one-tap change order.
13. **Closeout check** — in a project header, **AI closeout** lists everything still unbilled/uncollected before you mark it delivered.
14. **Payment-risk briefing** — on *Insights → Client payment-risk*, **AI briefing** turns payment history into who-to-watch and concrete terms advice.

Your API key never touches the web app or the browser — it lives only in the local proxy.

## One-time setup

1. **Get an NVIDIA API key** at <https://build.nvidia.com> → sign in → open any model → *Get API Key*. It looks like `nvapi-...`.
2. **Give the proxy your key** (pick one):
   - Copy `ai-proxy.config.example.json` to `.ai-proxy.config.json` (note the leading dot) and paste your key into it, **or**
   - Set an environment variable `NVIDIA_API_KEY` before running the proxy.
   - The leading dot matters: it keeps the key file out of any static/Vercel deploy automatically.
3. **Start the proxy** from this folder:
   ```
   node ai-proxy.mjs
   ```
   Leave that window open. You should see `running on http://127.0.0.1:8787`.
4. **Turn AI on in the app:** open Invoice Studio → **Settings → AI features** → tick *Enable AI features* → **Test connection** → **Save AI settings**.

## Model ids

Settings ships with sensible defaults, but model slugs on NVIDIA change. If a feature returns a **404**, the slug is wrong — copy the exact id from the model's page on build.nvidia.com (format `vendor/model`) into the matching field in **Settings → AI features**:

| Feature | Default slug (verified working 2026-06-27) | Swap for any… |
|---|---|---|
| Screenshot reader | `nvidia/nemotron-nano-12b-v2-vl` | vision-language model |
| AI message drafts | `meta/llama-3.3-70b-instruct` | strong multilingual LLM |
| Request / scope checker | `nvidia/llama-3.3-nemotron-super-49b-v1` | reasoning LLM |

## Security notes

- The real `.ai-proxy.config.json` (dotfile) holds a secret — do not share it, commit it, or paste its contents anywhere. Because it starts with a dot, Vercel and most static hosts will not publish it.
- The proxy binds to `127.0.0.1` only (this machine), not your network.
- Everything the AI sees (a screenshot, a chat thread, a request) is sent to NVIDIA for that one call. Don't paste anything you wouldn't send to a cloud API. The PII fields stay on your device unless you include them.

## Deploying to Vercel (production — no terminal needed)

In production the local `ai-proxy.mjs` is replaced by Vercel **serverless functions** (`api/health.js` and `api/v1/chat/completions.js`, already in this repo). Your key lives in a Vercel **environment variable**, not in any file. The static app auto-detects it's deployed and talks to `/api` on the same domain, so AI keeps working with nothing running on your machine.

### What's already wired
- `api/health.js` — handles `GET /api/health` (the **Test connection** check; reports whether the key env var is set).
- `api/v1/chat/completions.js` — the proxy that forwards `POST /api/v1/chat/completions` to NVIDIA with your key.
- `vercel.json` — gives the AI function a 60-second `maxDuration` (the default 10s can cut off slower vision/reasoning models, which shows up in the browser as "Failed to fetch").
- The app auto-uses `/api` when served from a real domain (and the local proxy when run from `file://` or `localhost`).
- Your local key file is a **dotfile** (`.ai-proxy.config.json`), so Vercel never uploads it; the function reads the key from the `NVIDIA_API_KEY` env var instead. `.gitignore` / `.vercelignore` list it too.
- Screenshots are downscaled in-browser before upload to stay under Vercel's ~4.5 MB request limit.

### Option A — Drag-and-drop deploy (no terminal, no GitHub)
1. Go to **vercel.com → Add New → Project**.
2. **Drag this whole folder** onto the upload area (or `vercel.com/new` → drop the folder/zip). Framework preset: **Other** (auto-detected); no build command.
3. After the first deploy, open the project → **Settings → Environment Variables** → add `NVIDIA_API_KEY` = your `nvapi-...` key (Production), then **Redeploy** (the env var only takes effect on a deploy made after it's added).
4. Open the `*.vercel.app` URL → **Settings → AI features** → **Test connection** (green = key found) → **Enable** → **Save**.

The `.ai-proxy.config.json` dotfile is excluded automatically, so dragging the folder will **not** expose your key. (You can confirm after deploy: visiting `https://your-app.vercel.app/.ai-proxy.config.json` should 404.)

### Option B — Vercel CLI (fastest)
From this folder:
```
npm i -g vercel
vercel            # first run: log in, accept defaults, link the project
vercel env add NVIDIA_API_KEY      # paste your nvapi-... key when prompted; choose Production (and Preview/Development if you want)
vercel --prod     # deploy
```

### Option C — GitHub + Vercel dashboard
1. Push this folder to a GitHub repo (the `.gitignore` keeps your key safe).
2. vercel.com → **Add New → Project → Import** that repo.
3. Framework preset: **Other**. Build command: none. Output dir: leave default (root). 
4. **Settings → Environment Variables →** add `NVIDIA_API_KEY` = your `nvapi-...` key (Production).
5. **Deploy.**

### After deploy
1. Open your `*.vercel.app` URL.
2. **Settings → AI features:** the **Proxy URL** should already read `/api`. Tick **Enable**, click **Test connection** (green = key found on the server), **Save**.
3. Test a screenshot read / AI draft / scope check.

If Test connection fails: the `NVIDIA_API_KEY` env var isn't set on Vercel (or you didn't redeploy after adding it). Re-add it and run `vercel --prod` again, or hit **Redeploy** in the dashboard.

## Deploying to Cloudflare Pages (100% free — free env vars, no Pro plan)

If Vercel asks you to upgrade to Pro to add an environment variable, use **Cloudflare Pages** instead. It's free, environment variables/secrets are free, and serverless functions are free. The proxy is a single **`_worker.js`** at the project root (Cloudflare "Advanced Mode") that handles `/api/health` + `/api/v1/chat/completions` and serves everything else as static files — the same paths the app calls, so nothing in the app changes.

> **Important — the dashboard "Upload assets" (drag-and-drop) does NOT run `_worker.js`.** It only serves static files, so the proxy routes return **404** and AI fails with "AI 404 / proxy returned 404". To activate the proxy you must deploy with **Wrangler** (below) or connect a **Git** repo. There is no drag-and-drop path that runs server-side code.

### Deploy with Wrangler (free, no GitHub) — this is what activates the proxy
From the project folder:
```
npx wrangler login                     # opens a browser; authorize (free account)
npx wrangler pages deploy .            # pick your existing project (keeps the URL) or create one
```
`_worker.js` is deployed as a real Worker (no build step needed). Then give it the key (free):
```
npx wrangler pages secret put NVIDIA_API_KEY --project-name <your-project>   # paste your nvapi-... key
npx wrangler pages deploy . --project-name <your-project>                    # redeploy so the secret applies
```
(You can instead set `NVIDIA_API_KEY` in the dashboard → project → Settings → Variables and Secrets, then re-run `wrangler pages deploy .`.)

Do NOT include `functions/` or `.wrangler/` in the folder — they're already removed. `wrangler` ignores `.wrangler/` automatically.

### Or connect Git (also activates the proxy)
Push this folder to a GitHub repo → Cloudflare **Workers & Pages → Create → Pages → Connect to Git** → select the repo → Framework preset **None**, no build command, output dir `/` → add the `NVIDIA_API_KEY` variable → Deploy.

### After deploy
1. Open your `*.pages.dev` URL.
2. Visit `https://<app>.pages.dev/api/health` → expect `{"ok":true,"key":true}`. `key:false` = the variable isn't set / you didn't redeploy after adding it.
3. **Settings → AI features:** Proxy URL already reads `/api`. **Test connection** (green) → **Enable** → **Save** → try a feature.

Your local key file `.ai-proxy.config.json` is a dotfile, so Cloudflare won't publish it (confirm `https://<app>.pages.dev/.ai-proxy.config.json` 404s). The key in production comes only from the `NVIDIA_API_KEY` variable.
