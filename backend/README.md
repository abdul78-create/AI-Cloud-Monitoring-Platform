# Backend API Guide

## Install
```bash
cd backend
npm install
copy .env.example .env
```

## Run
```bash
npm run dev
```

## Build + Start
```bash
npm run build
npm start
```

## API Endpoints
- `GET /api/metrics`
- `GET /api/infrastructure`
- `GET /api/alerts`
- `GET /api/analytics`
- `POST /api/logs/upload`
- `POST /api/ai/analyze`

## Example Requests

### Analyze Logs
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d "{\"logs\":\"ERROR timeout on node-3\"}"
```

### Upload Log File
```bash
curl -X POST http://localhost:5000/api/logs/upload \
  -F "logFile=@sample.log"
```

## Ollama
- Base URL: `http://localhost:11434`
- Model: `llama3`
- Pull model:
```bash
ollama pull llama3
```
