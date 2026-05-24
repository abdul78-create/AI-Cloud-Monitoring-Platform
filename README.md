# CloudAI Monitor

CloudAI Monitor is an enterprise-grade observability platform designed for modern distributed systems.

## Demo Video Script & Flow

To record the perfect 90-second cinematic demo video for your portfolio, follow this exact sequence:

**0–10s: Introduction & Architecture**
- Start on the landing page hero section.
- Scroll smoothly to the **Architecture Diagram** to demonstrate the data flow (Infra Nodes -> eBPF Agent -> Redis Queue -> AI Correlation -> WebSocket Gateway).

**10–25s: Agent Installation**
- Open your terminal and run the one-line installer:
  ```bash
  curl -fsSL https://install.cloudai.dev | bash
  ```
- Show the terminal output as the agent connects and discovers services via eBPF.

**25–40s: Mission Control (Live)**
- Switch to the **Mission Control Overview Page**.
- Show the newly connected node appearing as "Operational" in the Infrastructure Health widget.
- Highlight the real-time telemetry charts streaming live data.

**40–60s: Incident Simulation**
- Trigger the deterministic **Redis failure scenario** (e.g., via the Guided Demo Flow or a simulated script).
- Watch the Mission Control dashboard react instantly:
  - Telemetry charts show a spike in latency.
  - Active Incidents widget populates.
  - Service Map shows the Redis node turning red (Critical).

**60–75s: Alert & AI Root Cause Analysis**
- Navigate to the **AI Insights** or click the incident.
- Show the AI automatically correlating the latency spike to the Redis failure.
- Highlight the "Root Cause Identified" banner.

**75–90s: Remediation & Resolution**
- Execute the guided SSH playbook or automated remediation step to restart/fix the Redis instance.
- Watch the Service Map node turn green again.
- The incident resolves, and the "All monitored systems are operating normally" empty state returns.

---

## Architecture
- Next.js 14 Frontend
- Zustand for state management
- Recharts for live telemetry
- TailwindCSS for styling
