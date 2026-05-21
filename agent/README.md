# CloudAI Monitoring Agent

A lightweight, production-grade monitoring agent that streams real-time infrastructure telemetry to your CloudAI Monitor backend.

## What It Collects

| Metric | Details |
|---|---|
| **CPU** | Real-time utilization via `systeminformation` |
| **Memory** | Used / Total in GB, percentage |
| **Disk** | Usage % for primary filesystem |
| **Network** | Bytes in / out across all interfaces |
| **Processes** | Top 10 by CPU: pid, name, cpu%, memory |
| **Uptime** | Host uptime in seconds |
| **Heartbeat** | Agent version, hostname, IP, timestamp |

## Installation

### Prerequisites

- Node.js ≥ 18
- `systeminformation` (installed via npm)

### Quick Start

```bash
# Clone or copy the agent directory
cd agent

# Install dependencies
npm install

# Run against local development backend
npm run start:local

# Run against production backend
node agent.js --endpoint=https://your-backend.onrender.com --api-key=YOUR_KEY
```

### Docker

```bash
docker run -d \
  --name cloudai-agent \
  --pid=host \
  --network=host \
  -v /proc:/host/proc:ro \
  -e CLOUDAI_ENDPOINT=https://your-backend.onrender.com \
  -e CLOUDAI_API_KEY=your_key \
  node:18-alpine sh -c "npm install systeminformation && node agent.js"
```

### Linux systemd Service

```ini
# /etc/systemd/system/cloudai-agent.service
[Unit]
Description=CloudAI Monitoring Agent
After=network.target

[Service]
Type=simple
User=cloudai
WorkingDirectory=/opt/cloudai-agent
ExecStart=/usr/bin/node /opt/cloudai-agent/agent.js
Environment=CLOUDAI_ENDPOINT=https://your-backend.onrender.com
Environment=CLOUDAI_API_KEY=your_key
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now cloudai-agent
sudo systemctl status cloudai-agent
```

## Configuration

| Flag / Env Var | Default | Description |
|---|---|---|
| `--api-key` / `CLOUDAI_API_KEY` | `dev-key` | Your backend ingress API key |
| `--endpoint` / `CLOUDAI_ENDPOINT` | `http://localhost:5000` | Backend base URL |
| `--interval` / `CLOUDAI_INTERVAL` | `5` | Collection interval in seconds |
| `--hostname` / `CLOUDAI_HOSTNAME` | `os.hostname()` | Override reported hostname |

## Agent API

The agent sends `POST /api/ops/agent/heartbeat` with the following payload:

```json
{
  "agentId": "agent-myhost-12345",
  "hostname": "prod-api-01",
  "ip": "10.0.1.45",
  "version": "2.4.1",
  "collectedAt": "2026-05-21T08:00:00.000Z",
  "uptime": 1234567,
  "metrics": {
    "cpu": 45.2,
    "memory": 68.1,
    "memoryUsedGB": 10.9,
    "memoryTotalGB": 16.0,
    "disk": 52.3,
    "diskUsedGB": 104.6,
    "diskTotalGB": 200.0,
    "networkInBytes": 4294967296,
    "networkOutBytes": 1073741824,
    "loadAvg1m": 2.4
  },
  "processes": [
    { "pid": 1234, "name": "node", "cpu": 24.3, "memory": 512.4, "status": "running" }
  ]
}
```

## Viewing Agent Data

After starting the agent, navigate to **Dashboard → Infrastructure → Connected Agents** to see your host appear in real-time.
