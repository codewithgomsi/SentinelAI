# Deploying SentinelAI

Recommended stack: **Render** (free tier) — backend + frontend from one repo.

## Architecture

| Service  | Type        | URL example                          |
|----------|-------------|--------------------------------------|
| Backend  | Python Web  | `https://sentinelai-api.onrender.com` |
| Frontend | Static Site | `https://sentinelai-frontend.onrender.com` |

---

## Step 1 — Push to GitHub

```powershell
cd H:\SentinelAI
git init
git add .
git commit -m "Initial SentinelAI deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/SentinelAI.git
git push -u origin main
```

> Do **not** commit `backend/venv4/`, `node_modules/`, or `.env` files (already in `.gitignore`).

---

## Step 2 — Deploy on Render

1. Go to [render.com](https://render.com) and sign up / log in.
2. Click **New → Blueprint**.
3. Connect your GitHub repo (`SentinelAI`).
4. Render reads `render.yaml` and creates both services automatically.
5. When prompted for environment variables, set:

   **sentinelai-api**
   ```
   CORS_ORIGINS=https://sentinelai-frontend.onrender.com
   ```
   (Use your actual frontend URL after it's created.)

   **sentinelai-frontend**
   ```
   VITE_API_URL=https://sentinelai-api.onrender.com/api
   ```
   (Use your actual backend URL.)

6. Click **Apply** and wait for both services to deploy (~5–10 min first time; model trains on build).

---

## Step 3 — Verify

1. Backend health: `https://sentinelai-api.onrender.com/api/health`
2. Open frontend URL in browser — all 7 tabs should load data.

---

## Alternative: Vercel (frontend only)

If you prefer Vercel for the frontend:

```powershell
cd H:\SentinelAI\frontend
npm i -g vercel
vercel
```

Set env var in Vercel dashboard:
```
VITE_API_URL=https://sentinelai-api.onrender.com/api
```

Keep backend on Render with `CORS_ORIGINS` set to your Vercel URL.

---

## Notes

- **Free tier cold starts**: Render free services spin down after ~15 min idle. First request may take 30–60s.
- **Model training**: Runs during backend build (`python -m ml.train`). First deploy takes longer.
- **Dataset**: `dataset/advanced_cybersecurity_data.csv` must be in the repo (already included).
- **Local dev** still works with `python app.py` + `npm run dev`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Set `CORS_ORIGINS` on backend to exact frontend URL (no trailing slash) |
| Empty dashboard | Check backend `/api/health` — cold start may need a minute |
| Build fails on ML | Ensure Python 3.11 (`backend/runtime.txt`) |
| 404 on page refresh | SPA rewrite rules in `render.yaml` / `vercel.json` handle this |
