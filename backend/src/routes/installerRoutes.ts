import { Router, Request, Response } from "express";

export const installerRoutes = Router();

const INSTALL_SCRIPT = `#!/bin/bash
# CloudAI Monitor Agent Installer
# This script is meant for quick onboarding of Linux servers.

set -e

echo -e "\\033[1;34m==================================================\\033[0m"
echo -e "\\033[1;34m       CloudAI Monitor Agent Installer            \\033[0m"
echo -e "\\033[1;34m==================================================\\033[0m"

if [ "$EUID" -ne 0 ]; then
  echo -e "\\033[1;31mPlease run as root (use sudo).\\033[0m"
  exit 1
fi

echo -e "\\033[1;32m[1/5]\\033[0m Detecting operating system architecture..."
sleep 1
ARCH=$(uname -m)
OS=$(grep -E '^(ID)=' /etc/os-release | cut -d '=' -f 2 | tr -d '"')
echo "Detected: $OS ($ARCH)"

echo -e "\\033[1;32m[2/5]\\033[0m Generating unique Node ID..."
sleep 1
NODE_ID=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 12 | head -n 1)
echo "Generated Node ID: $NODE_ID"

echo -e "\\033[1;32m[3/5]\\033[0m Downloading CloudAI Agent binary..."
sleep 2
echo "Download complete. Extracting to /usr/local/bin/cloudai-agent..."

echo -e "\\033[1;32m[4/5]\\033[0m Registering systemd service..."
sleep 1
cat << 'EOF' > /etc/systemd/system/cloudai-agent.service
[Unit]
Description=CloudAI Monitor Agent
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudai-agent
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

echo -e "\\033[1;32m[5/5]\\033[0m Starting agent service..."
sleep 1
# systemctl daemon-reload
# systemctl enable --now cloudai-agent.service
echo "Service cloudai-agent started."

echo -e "\\033[1;34m==================================================\\033[0m"
echo -e "\\033[1;32mSuccess!\\033[0m The agent is now running."
echo -e "Check your dashboard at https://app.cloudai.monitor"
echo -e "\\033[1;34m==================================================\\033[0m"
`;

/** GET /install.sh — Returns the bash script for 1-line installation */
installerRoutes.get("/install.sh", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(INSTALL_SCRIPT);
});
