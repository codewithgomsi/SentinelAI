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
| Frontend  | https://sentinelai-frontend-olv3.onrender.com/
| Backend   | https://sentinelai-api-fv1w.onrender.com |

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

<img width="1902" height="903" alt="image" src="https://github.com/user-attachments/assets/6a077d6f-ca47-4cf0-9efa-19421d8aba47" />
<img width="1518" height="542" alt="image" src="https://github.com/user-attachments/assets/06aa4a25-6c41-484b-892c-00d4774d8279" />
<img width="1552" height="821" alt="image" src="https://github.com/user-attachments/assets/a48fd070-cb60-4465-8ddf-bfce4b6bef85" />
<img width="1515" height="787" alt="image" src="https://github.com/user-attachments/assets/5f252e0a-4bb2-4c43-8d98-95102d67a033" />
<img width="1551" height="867" alt="image" src="https://github.com/user-attachments/assets/7a5bab95-aee1-45b1-8e2f-cadb6fe06736" />
<img width="1523" height="756" alt="image" src="https://github.com/user-attachments/assets/6d496ed5-28bd-4ca4-b9aa-f5063512b4df" />







---

## License

MIT © [codewithgomsi](https://github.com/codewithgomsi)

---

## Acknowledgments

Built for hackathon demo — combining ML anomaly detection with a premium SRE dashboard experience.
