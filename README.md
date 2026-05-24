# SentinelAI

**AI-Powered DevOps & SRE Command Center** — real-time API monitoring, ML anomaly detection, and cinematic incident response.

Built for hackathons. Premium dark-mode dashboard inspired by Datadog, Grafana, and SOC war rooms.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)
![License](https://img.shields.io/badge/License-MIT-green)

**Author:** [@codewithgomsi](https://github.com/codewithgomsi)

---

## Live Demo

| Service   | URL |
|-----------|-----|
| Frontend  | _Add after deploy — e.g. `https://sentinelai-frontend.onrender.com`_ |
| Backend   | _Add after deploy — e.g. `https://sentinelai-api.onrender.com/api/health`_ |

---

## Features

- **Dashboard** — KPI cards, hourly trends, status distribution, top endpoints
- **Live Monitoring** — auto-refreshing log stream every 5 seconds with severity filters
- **ML Anomaly Detection** — Isolation Forest model with confidence scores & severity breakdown
- **Analytics & Trends** — line, bar, and pie charts from real cybersecurity dataset
- **Incident Reports** — AI-generated root causes, fixes, timelines, and business impact
- **Model Evaluation** — accuracy, precision, recall, F1, confusion matrix
- **AI War Room** — cinematic command center with terminal panels, service health map, recovery playbook

---

## Tech Stack

| Layer    | Technologies |
|----------|-------------|
| Frontend | React, Vite, Tailwind CSS, Recharts, Framer Motion, Axios, Lucide React |
| Backend  | Flask, scikit-learn (Isolation Forest), pandas, gunicorn |
| Deploy   | Render (Blueprint — backend + frontend from one repo) |

---

## Project Structure

```
SentinelAI/
├── backend/          # Flask API + ML pipeline
│   ├── routes/       # API endpoints (/api/*)
│   ├── ml/           # Train, detect, evaluate
│   └── utils/        # Log simulator, incident analyzer
├── frontend/         # React dashboard
│   └── src/
│       ├── pages/    # 7 dashboard tabs
│       ├── components/
│       └── api/      # Axios services
├── dataset/          # Training CSV
├── model/            # Trained artifacts (generated on build)
└── render.yaml       # One-click deploy config
```

---

## Run Locally

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

API runs at **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard at **http://localhost:5173**

---

## Deploy (Fastest — ~5 min setup)

Uses **[Render](https://render.com)** free tier. One Blueprint deploys **both** backend and frontend from this repo.

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "SentinelAI — AI DevOps dashboard"
git branch -M main
git remote add origin https://github.com/codewithgomsi/SentinelAI.git
git push -u origin main
```

> Create the empty repo first on GitHub: [github.com/new](https://github.com/new) → name it `SentinelAI`

### Step 2 — Deploy on Render

1. Go to [render.com](https://render.com) → sign in with GitHub
2. **New → Blueprint** → select `codewithgomsi/SentinelAI`
3. Set environment variables:

| Service | Variable | Value |
|---------|----------|-------|
| `sentinelai-api` | `CORS_ORIGINS` | `https://sentinelai-frontend.onrender.com` |
| `sentinelai-frontend` | `VITE_API_URL` | `https://sentinelai-api.onrender.com/api` |

4. Click **Apply** — wait ~5–10 min for first build (ML model trains automatically)

### Step 3 — Update README

Add your live URLs to the **Live Demo** section above and push again.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | KPIs & charts |
| GET | `/api/live-logs` | Real-time logs |
| GET | `/api/anomaly-detection` | ML anomaly scan |
| GET | `/api/analytics` | Trends & distributions |
| GET | `/api/incidents` | Incident reports |
| GET | `/api/model-evaluation` | Model metrics |
| GET | `/api/war-room` | War room data |

---

## Screenshots

_Add screenshots of Dashboard and AI War Room after deploy._

---

## License

MIT © [codewithgomsi](https://github.com/codewithgomsi)

---

## Acknowledgments

Built for hackathon demo — combining ML anomaly detection with a premium SRE dashboard experience.
