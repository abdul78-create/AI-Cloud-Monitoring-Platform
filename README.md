# AI Cloud Monitoring Platform

![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)
![Express](https://img.shields.io/badge/Backend-Express-1f2937?logo=express)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-22c55e)

Production-style full-stack AI observability platform that simulates cloud monitoring, detects anomalies, and generates optimization/security insights from logs.

## Why This Project
- Demonstrates **full-stack architecture** (Next.js + Express + TypeScript).
- Includes **real-time monitoring patterns** with polling and API-backed dashboards.
- Ships a **portfolio-safe Demo AI Mode** for public hosting where Ollama may not be available.
- Designed with **SaaS-grade UX** (glassmorphism, animated charts, upload workflow, toast feedback).

## Core Features
- Live dashboard for CPU, memory, network, requests, infrastructure health, and alerts.
- AI log analyzer with drag-drop upload, progress states, and analysis output.
- Intelligent AI pipeline:
  - Dev: Ollama (`llama3`)
  - Prod/demo: fallback generator with realistic insights
- 5-second monitoring refresh, typed API layer, caching for analytics, centralized Zustand store.

## Architecture
```text
Browser (Next.js on Vercel)
  -> Express API (Render)
    -> Monitoring mock engine (dynamic per request)
    -> Log upload service (Multer)
    -> AI service (Ollama in dev / Demo AI mode in production)
```

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand, Axios, React Hot Toast
- **Backend**: Node.js, Express, TypeScript, Multer, Helmet, CORS, dotenv, Axios
- **AI**: Ollama (`llama3`) + production fallback generator

## Screenshots
Add screenshots inside `screenshots/` and reference them here:
- `screenshots/dashboard-overview.png`
- `screenshots/ai-log-analysis.png`
- `screenshots/infrastructure-status.png`

See `docs/SCREENSHOTS.md` for capture checklist and naming conventions.

## Local Setup

### 1) Clone
```bash
git clone <your-repo-url>
cd AI-Cloud-Monitoring-Platform
```

### 2) Backend
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

### 3) Frontend
```bash
cd ../frontend
npm install
copy .env.example .env.local
npm run dev
```

## Environment Configuration

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
NEXT_PUBLIC_POLLING_INTERVAL_MS=5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (`backend/.env`)
```env
PORT=5001
CLIENT_ORIGIN=http://localhost:3000
MAX_UPLOAD_SIZE_MB=2
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
DEMO_AI_MODE=false
OLLAMA_TIMEOUT_MS=30000
NODE_ENV=development
```

## Deployment Guide

### Frontend -> Vercel
- Root directory: `frontend`
- Build command: `npm run build`
- Output: Next.js default
- Env vars:
  - `NEXT_PUBLIC_API_BASE_URL=<your-render-api>/api`
  - `NEXT_PUBLIC_POLLING_INTERVAL_MS=5000`
  - `NEXT_PUBLIC_APP_URL=<your-vercel-url>`

### Backend -> Render
- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Env vars:
  - `PORT=10000` (or Render default)
  - `CLIENT_ORIGIN=<your-vercel-url>`
  - `DEMO_AI_MODE=true` (recommended for free-tier demos)
  - `NODE_ENV=production`

## AI Workflow
1. Upload `.log`/`.txt` file.
2. Backend extracts content and validates limits/types.
3. `/api/ai/analyze` processes logs:
   - Ollama in development, or
   - Demo AI Mode in production.
4. UI displays summary, anomalies, recommendations, and threats.

## API Reference
- `GET /api/metrics`
- `GET /api/infrastructure`
- `GET /api/alerts`
- `GET /api/analytics`
- `POST /api/logs/upload`
- `POST /api/ai/analyze`

## Portfolio Highlights (Resume-Ready)
- Built a full-stack AI monitoring platform with real-time polling and production-grade dashboard UX.
- Designed a dual-mode AI pipeline (local Ollama + public demo fallback) for reliable deployment demos.
- Implemented secure file upload, typed APIs, centralized state management, and deployment-ready env strategy.

## Future Improvements
- WebSocket/SSE streaming instead of polling.
- Auth and RBAC for multi-tenant dashboards.
- Persistent data store for historical analytics.
- Alert rules engine with custom thresholds and notification channels.
