import { NodeSSH } from "node-ssh";
import { ConnectedServer, ProcessInfo } from "./infrastructureService";

/**
 * SSH Service
 * Connects to remote Linux machines to gather basic telemetry.
 */

const sshInstances = new Map<string, NodeSSH>();

export async function getSshClient(
  connectionId: string,
  host: string,
  username: string,
  privateKey?: string,
  password?: string,
  port = 22
): Promise<NodeSSH> {
  if (sshInstances.has(connectionId)) {
    return sshInstances.get(connectionId)!;
  }

  const ssh = new NodeSSH();
  await ssh.connect({
    host,
    username,
    privateKey,
    password,
    port,
    tryKeyboard: true,
  });

  sshInstances.set(connectionId, ssh);
  return ssh;
}

export async function executeSshCommand(ssh: NodeSSH, command: string): Promise<string> {
  const result = await ssh.execCommand(command);
  if (result.stderr && result.code !== 0) {
    throw new Error(`Command failed: ${result.stderr}`);
  }
  return result.stdout;
}

export async function generateServerFromSsh(
  connectionId: string,
  ssh: NodeSSH,
  region: string
): Promise<ConnectedServer> {
  // Try to gather basic info
  const hostname = await executeSshCommand(ssh, "hostname");
  const osInfo = await executeSshCommand(ssh, "cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '\"'");
  const uptimeRaw = await executeSshCommand(ssh, "uptime -p");
  
  // CPU usage (top in batch mode)
  let cpuStr = "0";
  try {
    cpuStr = await executeSshCommand(ssh, "top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'");
  } catch (e) {}

  // Memory usage
  let memStr = "0";
  try {
    memStr = await executeSshCommand(ssh, "free | grep Mem | awk '{print $3/$2 * 100.0}'");
  } catch (e) {}

  return {
    id: connectionId,
    hostname: hostname.trim(),
    ip: ssh.connection?.config?.host || "Unknown",
    provider: "linux",
    instanceType: "Remote SSH Node",
    os: osInfo.trim() || "Linux",
    status: "healthy",
    uptime: uptimeRaw.trim().replace("up ", ""),
    region,
    cpu: Math.round(parseFloat(cpuStr) * 10) / 10 || 0,
    memory: Math.round(parseFloat(memStr) * 10) / 10 || 0,
    disk: 0,
    networkIn: 0,
    networkOut: 0,
    processes: [],
    services: [
      { name: "sshd", status: "active", uptime: "Live" }
    ],
    lastSeen: new Date().toISOString()
  };
}
