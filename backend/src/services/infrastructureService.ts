/**
 * Infrastructure Service
 *
 * Provides realistic mock infrastructure data.
 * In production this layer would SSH / call cloud APIs into real servers.
 * The mock data is intentionally detailed so the UI renders like a real
 * production SaaS (Datadog / New Relic style).
 */

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: "running" | "sleeping" | "zombie";
}

export interface ServiceInfo {
  name: string;
  status: "active" | "inactive" | "failed";
  uptime: string;
}

export interface MetricPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  latencyMs: number;
}

export interface ConnectedServer {
  id: string;
  hostname: string;
  ip: string;
  provider: "aws" | "docker" | "kubernetes" | "linux";
  instanceType: string;
  os: string;
  status: "healthy" | "warning" | "critical" | "offline";
  uptime: string;
  region: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  processes: ProcessInfo[];
  services: ServiceInfo[];
  lastSeen: string;
}

export interface ConnectionConfig {
  provider: "aws" | "docker" | "kubernetes" | "linux";
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  dockerHost?: string;
  kubeconfig?: string;
  context?: string;
  namespace?: string;
  hostname?: string;
  port?: number;
  username?: string;
  authMethod?: "key" | "password";
  privateKey?: string;
  password?: string;
  tagFilter?: string;
}

export interface ConnectionResult {
  connected: boolean;
  serversFound: number;
  connectionId: string;
  provider: string;
  region: string;
  latencyMs: number;
}

// ─── Realistic Mock Servers ────────────────────────────────────────────────────

const MOCK_SERVERS: ConnectedServer[] = [
  {
    id: "srv-0a1b2c3d",
    hostname: "prod-api-1.us-east.internal",
    ip: "10.0.1.45",
    provider: "aws",
    instanceType: "t3.xlarge",
    os: "Ubuntu 22.04 LTS",
    status: "healthy",
    uptime: "14d 7h 23m",
    region: "us-east-1",
    cpu: 67,
    memory: 84,
    disk: 52,
    networkIn: 142.3,
    networkOut: 98.7,
    processes: [
      { pid: 1,     name: "systemd",       cpu: 0.0,  memory: 0.1,  status: "sleeping" },
      { pid: 312,   name: "node",          cpu: 24.3, memory: 18.4, status: "running"  },
      { pid: 313,   name: "node",          cpu: 21.7, memory: 16.9, status: "running"  },
      { pid: 891,   name: "nginx",         cpu:  2.1, memory:  1.2, status: "sleeping" },
      { pid: 892,   name: "nginx: worker", cpu:  1.8, memory:  0.9, status: "sleeping" },
      { pid: 1204,  name: "redis-server",  cpu:  0.6, memory:  2.3, status: "sleeping" },
      { pid: 2011,  name: "promtail",      cpu:  0.3, memory:  1.4, status: "sleeping" },
      { pid: 2100,  name: "vector",        cpu:  0.8, memory:  2.1, status: "running"  },
      { pid: 3301,  name: "sshd",          cpu:  0.0, memory:  0.1, status: "sleeping" },
      { pid: 3450,  name: "containerd",    cpu:  0.4, memory:  3.2, status: "sleeping" },
    ],
    services: [
      { name: "nginx",      status: "active",   uptime: "14d 7h" },
      { name: "node-api",   status: "active",   uptime: "14d 7h" },
      { name: "redis",      status: "active",   uptime: "14d 7h" },
      { name: "promtail",   status: "active",   uptime: "3d 2h"  },
      { name: "vector",     status: "active",   uptime: "3d 2h"  },
    ],
    lastSeen: new Date().toISOString(),
  },
  {
    id: "srv-4e5f6a7b",
    hostname: "prod-api-2.us-east.internal",
    ip: "10.0.1.46",
    provider: "aws",
    instanceType: "t3.xlarge",
    os: "Ubuntu 22.04 LTS",
    status: "healthy",
    uptime: "14d 7h 21m",
    region: "us-east-1",
    cpu: 43,
    memory: 71,
    disk: 51,
    networkIn: 118.9,
    networkOut: 84.2,
    processes: [
      { pid: 1,     name: "systemd",       cpu: 0.0,  memory: 0.1,  status: "sleeping" },
      { pid: 319,   name: "node",          cpu: 16.2, memory: 15.7, status: "running"  },
      { pid: 320,   name: "node",          cpu: 14.8, memory: 14.2, status: "running"  },
      { pid: 876,   name: "nginx",         cpu:  1.9, memory:  1.1, status: "sleeping" },
      { pid: 877,   name: "nginx: worker", cpu:  1.6, memory:  0.8, status: "sleeping" },
      { pid: 1198,  name: "redis-server",  cpu:  0.5, memory:  2.1, status: "sleeping" },
      { pid: 2022,  name: "promtail",      cpu:  0.3, memory:  1.3, status: "sleeping" },
      { pid: 2110,  name: "vector",        cpu:  0.7, memory:  2.0, status: "running"  },
      { pid: 3310,  name: "sshd",          cpu:  0.0, memory:  0.1, status: "sleeping" },
      { pid: 3461,  name: "containerd",    cpu:  0.3, memory:  3.1, status: "sleeping" },
    ],
    services: [
      { name: "nginx",      status: "active",   uptime: "14d 7h" },
      { name: "node-api",   status: "active",   uptime: "14d 7h" },
      { name: "redis",      status: "active",   uptime: "14d 7h" },
      { name: "promtail",   status: "active",   uptime: "3d 2h"  },
      { name: "vector",     status: "active",   uptime: "3d 2h"  },
    ],
    lastSeen: new Date().toISOString(),
  },
  {
    id: "srv-8c9d0e1f",
    hostname: "worker-node-1.us-east.internal",
    ip: "10.0.2.10",
    provider: "aws",
    instanceType: "c5.2xlarge",
    os: "Ubuntu 22.04 LTS",
    status: "warning",
    uptime: "14d 7h 19m",
    region: "us-east-1",
    cpu: 89,
    memory: 92,
    disk: 38,
    networkIn: 321.4,
    networkOut: 198.6,
    processes: [
      { pid: 1,     name: "systemd",          cpu: 0.0,  memory: 0.1,  status: "sleeping" },
      { pid: 405,   name: "python3",           cpu: 38.1, memory: 22.3, status: "running"  },
      { pid: 406,   name: "python3",           cpu: 33.7, memory: 20.8, status: "running"  },
      { pid: 407,   name: "python3",           cpu: 12.4, memory: 18.1, status: "running"  },
      { pid: 1012,  name: "celery",            cpu:  3.2, memory:  8.4, status: "running"  },
      { pid: 1013,  name: "celery",            cpu:  2.9, memory:  7.8, status: "running"  },
      { pid: 2301,  name: "rabbitmq-server",   cpu:  0.8, memory:  4.2, status: "sleeping" },
      { pid: 2401,  name: "node_exporter",     cpu:  0.4, memory:  1.8, status: "sleeping" },
      { pid: 3101,  name: "sshd",              cpu:  0.0, memory:  0.1, status: "sleeping" },
      { pid: 3501,  name: "containerd",        cpu:  0.5, memory:  3.8, status: "sleeping" },
    ],
    services: [
      { name: "celery",          status: "active",   uptime: "14d 6h" },
      { name: "rabbitmq",        status: "active",   uptime: "14d 7h" },
      { name: "node-exporter",   status: "active",   uptime: "14d 7h" },
      { name: "promtail",        status: "active",   uptime: "3d 2h"  },
      { name: "docker",          status: "active",   uptime: "14d 7h" },
    ],
    lastSeen: new Date().toISOString(),
  },
  {
    id: "srv-2a3b4c5d",
    hostname: "db-primary.us-east.internal",
    ip: "10.0.3.5",
    provider: "aws",
    instanceType: "r5.xlarge",
    os: "Ubuntu 22.04 LTS",
    status: "healthy",
    uptime: "14d 7h 23m",
    region: "us-east-1",
    cpu: 22,
    memory: 78,
    disk: 71,
    networkIn: 89.1,
    networkOut: 47.3,
    processes: [
      { pid: 1,     name: "systemd",       cpu: 0.0,  memory: 0.1,  status: "sleeping" },
      { pid: 512,   name: "postgres",      cpu:  8.3, memory: 32.1, status: "sleeping" },
      { pid: 513,   name: "postgres",      cpu:  4.1, memory:  4.2, status: "sleeping" },
      { pid: 514,   name: "postgres",      cpu:  3.8, memory:  4.0, status: "sleeping" },
      { pid: 515,   name: "postgres",      cpu:  2.9, memory:  3.8, status: "sleeping" },
      { pid: 701,   name: "pgbouncer",     cpu:  0.4, memory:  0.9, status: "sleeping" },
      { pid: 802,   name: "barman",        cpu:  0.2, memory:  1.1, status: "sleeping" },
      { pid: 2401,  name: "node_exporter", cpu:  0.1, memory:  1.6, status: "sleeping" },
      { pid: 3101,  name: "sshd",          cpu:  0.0, memory:  0.1, status: "sleeping" },
      { pid: 3601,  name: "crond",         cpu:  0.0, memory:  0.2, status: "sleeping" },
    ],
    services: [
      { name: "postgresql",    status: "active",   uptime: "14d 7h" },
      { name: "pgbouncer",     status: "active",   uptime: "14d 7h" },
      { name: "barman",        status: "active",   uptime: "14d 7h" },
      { name: "node-exporter", status: "active",   uptime: "14d 7h" },
      { name: "cron",          status: "active",   uptime: "14d 7h" },
    ],
    lastSeen: new Date().toISOString(),
  },
  {
    id: "srv-6e7f8a9b",
    hostname: "cache-node-1.us-east.internal",
    ip: "172.16.0.10",
    provider: "aws",
    instanceType: "r6g.large",
    os: "Amazon Linux 2023",
    status: "healthy",
    uptime: "7d 3h 14m",
    region: "us-east-1",
    cpu: 14,
    memory: 61,
    disk: 29,
    networkIn: 204.8,
    networkOut: 312.6,
    processes: [
      { pid: 1,    name: "systemd",       cpu: 0.0,  memory: 0.1,  status: "sleeping" },
      { pid: 411,  name: "redis-server",  cpu:  4.2, memory: 18.3, status: "sleeping" },
      { pid: 412,  name: "redis-sentinel",cpu:  0.1, memory:  0.8, status: "sleeping" },
      { pid: 601,  name: "memcached",     cpu:  2.8, memory: 11.4, status: "sleeping" },
      { pid: 2401, name: "node_exporter", cpu:  0.1, memory:  1.5, status: "sleeping" },
      { pid: 3101, name: "sshd",          cpu:  0.0, memory:  0.1, status: "sleeping" },
      { pid: 3701, name: "crond",         cpu:  0.0, memory:  0.2, status: "sleeping" },
      { pid: 4001, name: "promtail",      cpu:  0.3, memory:  1.3, status: "sleeping" },
      { pid: 4101, name: "vector",        cpu:  0.6, memory:  1.9, status: "running"  },
      { pid: 4201, name: "awslogs",       cpu:  0.2, memory:  0.8, status: "sleeping" },
    ],
    services: [
      { name: "redis",         status: "active",   uptime: "7d 3h" },
      { name: "redis-sentinel",status: "active",   uptime: "7d 3h" },
      { name: "memcached",     status: "active",   uptime: "7d 3h" },
      { name: "node-exporter", status: "active",   uptime: "7d 3h" },
      { name: "promtail",      status: "active",   uptime: "7d 3h" },
    ],
    lastSeen: new Date().toISOString(),
  },
  {
    id: "srv-0c1d2e3f",
    hostname: "bastion.us-east.internal",
    ip: "10.0.0.5",
    provider: "aws",
    instanceType: "t3.small",
    os: "Ubuntu 22.04 LTS",
    status: "healthy",
    uptime: "30d 11h 5m",
    region: "us-east-1",
    cpu: 3,
    memory: 21,
    disk: 18,
    networkIn: 12.4,
    networkOut: 8.9,
    processes: [
      { pid: 1,    name: "systemd",     cpu: 0.0, memory: 0.1, status: "sleeping" },
      { pid: 301,  name: "sshd",        cpu: 0.1, memory: 0.2, status: "sleeping" },
      { pid: 302,  name: "sshd",        cpu: 0.0, memory: 0.1, status: "sleeping" },
      { pid: 501,  name: "fail2ban",    cpu: 0.0, memory: 0.3, status: "sleeping" },
      { pid: 601,  name: "auditd",      cpu: 0.0, memory: 0.2, status: "sleeping" },
      { pid: 701,  name: "node_exporter",cpu:0.1, memory: 1.4, status: "sleeping" },
      { pid: 801,  name: "promtail",    cpu: 0.2, memory: 1.2, status: "sleeping" },
      { pid: 901,  name: "crond",       cpu: 0.0, memory: 0.1, status: "sleeping" },
      { pid: 1001, name: "rsyslogd",    cpu: 0.0, memory: 0.2, status: "sleeping" },
      { pid: 1101, name: "awslogs",     cpu: 0.1, memory: 0.7, status: "sleeping" },
    ],
    services: [
      { name: "sshd",          status: "active",   uptime: "30d 11h" },
      { name: "fail2ban",      status: "active",   uptime: "30d 11h" },
      { name: "auditd",        status: "active",   uptime: "30d 11h" },
      { name: "node-exporter", status: "active",   uptime: "30d 11h" },
      { name: "promtail",      status: "active",   uptime: "30d 11h" },
    ],
    lastSeen: new Date().toISOString(),
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function jitter(base: number, range: number): number {
  return Math.round(clamp(base + (Math.random() - 0.5) * range * 2, 0, 100) * 10) / 10;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the list of all mock servers with refreshed lastSeen timestamps.
 */
export function getMockServers(): ConnectedServer[] {
  return MOCK_SERVERS.map((s) => ({
    ...s,
    lastSeen: new Date().toISOString(),
  }));
}

/**
 * Returns a single server by ID with a small random metric jitter to simulate
 * live polling.
 */
export function getServerById(id: string): ConnectedServer | null {
  const server = MOCK_SERVERS.find((s) => s.id === id);
  if (!server) return null;
  return {
    ...server,
    cpu:    jitter(server.cpu,    5),
    memory: jitter(server.memory, 3),
    disk:   jitter(server.disk,   1),
    lastSeen: new Date().toISOString(),
  };
}

/**
 * Generates ~60 time-series metric points spanning the past hour (1 per minute).
 */
export function getServerMetrics(serverId: string): MetricPoint[] {
  const server = MOCK_SERVERS.find((s) => s.id === serverId);
  if (!server) return [];

  const points: MetricPoint[] = [];
  const now = Date.now();

  let cpu    = server.cpu;
  let memory = server.memory;
  let disk   = server.disk;
  let netIn  = server.networkIn;
  let netOut = server.networkOut;
  let lat    = 42;

  for (let i = 60; i >= 0; i--) {
    cpu    = clamp(cpu    + (Math.random() - 0.5) * 6,  2, 99);
    memory = clamp(memory + (Math.random() - 0.5) * 3,  5, 99);
    disk   = clamp(disk   + (Math.random() - 0.5) * 0.5, 5, 99);
    netIn  = clamp(netIn  + (Math.random() - 0.5) * 20, 0, 1000);
    netOut = clamp(netOut + (Math.random() - 0.5) * 15, 0, 800);
    lat    = clamp(lat    + (Math.random() - 0.5) * 12, 5, 500);

    points.push({
      timestamp:  new Date(now - i * 60 * 1000).toISOString(),
      cpu:        Math.round(cpu    * 10) / 10,
      memory:     Math.round(memory * 10) / 10,
      disk:       Math.round(disk   * 10) / 10,
      networkIn:  Math.round(netIn  * 10) / 10,
      networkOut: Math.round(netOut * 10) / 10,
      latencyMs:  Math.round(lat),
    });
  }

  return points;
}

/**
 * Returns the process list for a given server (with a small random cpu jitter).
 */
export function getServerProcesses(serverId: string): ProcessInfo[] {
  const server = MOCK_SERVERS.find((s) => s.id === serverId);
  if (!server) return [];
  return server.processes.map((p) => ({
    ...p,
    cpu:    Math.round(Math.max(0, p.cpu + (Math.random() - 0.5) * 2) * 10) / 10,
    memory: Math.round(Math.max(0, p.memory + (Math.random() - 0.5) * 0.5) * 10) / 10,
  }));
}

/**
 * Returns the systemd/service list for a given server.
 */
export function getServerServices(serverId: string): ServiceInfo[] {
  const server = MOCK_SERVERS.find((s) => s.id === serverId);
  if (!server) return [];
  return server.services;
}

/**
 * Simulates a connection attempt.
 * In demo mode this always succeeds after a short delay.
 * Returns details suitable for the wizard Step 2 → 3 transition.
 */
export async function simulateConnection(config: ConnectionConfig): Promise<ConnectionResult> {
  // Validate that the provider is specified
  if (!config.provider) {
    throw new Error("provider is required");
  }

  // Simulate network latency (1.2s – 1.8s)
  const latencyMs = 1200 + Math.floor(Math.random() * 600);
  await new Promise((resolve) => setTimeout(resolve, latencyMs));

  const regionMap: Record<string, string> = {
    aws:        config.region  ?? "us-east-1",
    docker:     "local",
    kubernetes: config.namespace ?? "default",
    linux:      config.hostname  ?? "localhost",
  };

  return {
    connected:    true,
    serversFound: MOCK_SERVERS.filter((s) => s.provider === config.provider).length || 4,
    connectionId: `conn-${Date.now().toString(36)}`,
    provider:     config.provider,
    region:       regionMap[config.provider] ?? "us-east-1",
    latencyMs,
  };
}

/**
 * Simulates a lightweight ping / health-check for a single server.
 */
export async function pingServer(serverId: string): Promise<{
  alive: boolean;
  latencyMs: number;
  timestamp: string;
}> {
  const server = MOCK_SERVERS.find((s) => s.id === serverId);
  const latencyMs = Math.round(0.5 + Math.random() * 4);
  await new Promise((resolve) => setTimeout(resolve, latencyMs));
  return {
    alive:     !!server && server.status !== "offline",
    latencyMs,
    timestamp: new Date().toISOString(),
  };
}
