# Deployment Guide

## Frontend (Vercel)
- Root: `frontend`
- Install: `npm install`
- Build: `npm run build`
- Runtime: Next.js

### Required Environment Variables
- `NEXT_PUBLIC_API_BASE_URL=https://<render-backend-domain>/api`
- `NEXT_PUBLIC_POLLING_INTERVAL_MS=5000`
- `NEXT_PUBLIC_APP_URL=https://<vercel-domain>`

## Backend (Render)
- Root: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`

### Required Environment Variables
- `PORT=10000`
- `CLIENT_ORIGIN=https://<vercel-domain>`
- `MAX_UPLOAD_SIZE_MB=2`
- `DEMO_AI_MODE=true`
- `NODE_ENV=production`
- `OLLAMA_BASE_URL=http://localhost:11434` (optional for local/self-hosted)
- `OLLAMA_MODEL=llama3`
- `OLLAMA_TIMEOUT_MS=30000`

## Public Demo Recommendation
Use `DEMO_AI_MODE=true` on free/public deployments. This preserves a realistic AI experience without requiring local Ollama runtime.
