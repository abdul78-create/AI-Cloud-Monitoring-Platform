import Docker from "dockerode";
import { ConnectedServer, MetricPoint, ProcessInfo } from "./infrastructureService";

/**
 * Docker Service
 * Connects to local or remote Docker engines using Dockerode.
 */

// Cache docker instances by connection ID or host to avoid reconnecting constantly
const dockerInstances = new Map<string, Docker>();

export function getDockerClient(connectionId: string, host?: string, port?: number): Docker {
  if (dockerInstances.has(connectionId)) {
    return dockerInstances.get(connectionId)!;
  }

  let docker: Docker;
  if (host && host !== "local" && host !== "localhost") {
    docker = new Docker({ host, port: port || 2375 });
  } else {
    // Local socket connection
    docker = new Docker({ socketPath: process.platform === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock" });
  }

  dockerInstances.set(connectionId, docker);
  return docker;
}

export async function pingDocker(docker: Docker): Promise<boolean> {
  try {
    await docker.ping();
    return true;
  } catch (err) {
    return false;
  }
}

export async function getDockerInfo(docker: Docker): Promise<any> {
  return await docker.info();
}

export async function getDockerContainers(docker: Docker): Promise<any[]> {
  return await docker.listContainers({ all: true });
}

export async function generateServerFromDocker(connectionId: string, docker: Docker, region: string): Promise<ConnectedServer> {
  const info = await getDockerInfo(docker);
  const containers = await getDockerContainers(docker);

  // Map containers to processes for the UI
  const processes: ProcessInfo[] = containers.map(c => ({
    pid: 0, // Docker doesn't easily expose host PID without inspect
    name: c.Names[0]?.replace("/", "") || "container",
    cpu: 0, // Will be filled by stats if needed, or mocked
    memory: 0,
    status: c.State === "running" ? "running" : "sleeping"
  }));

  const runningCount = containers.filter(c => c.State === "running").length;

  return {
    id: connectionId,
    hostname: info.Name || "docker-host",
    ip: "127.0.0.1",
    provider: "docker",
    instanceType: `${info.NCPU} CPU / ${Math.round(info.MemTotal / 1024 / 1024 / 1024)}GB`,
    os: info.OperatingSystem,
    status: runningCount > 0 ? "healthy" : "warning",
    uptime: "Live", // Docker info doesn't give uptime directly
    region,
    cpu: 0, // Real stats need continuous polling
    memory: 0,
    disk: 0,
    networkIn: 0,
    networkOut: 0,
    processes,
    services: [
      { name: "docker-engine", status: "active", uptime: "Live" }
    ],
    lastSeen: new Date().toISOString()
  };
}
