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

export async function executeSshCommand(ssh: NodeSSH, command: string, timeoutMs = 10000): Promise<string> {
  const resultPromise = ssh.execCommand(command);
  const timeoutPromise = new Promise<{ stdout: string, stderr: string, code: number }>((_, reject) => {
    setTimeout(() => reject(new Error(`Command timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  const result = await Promise.race([resultPromise, timeoutPromise]);
  
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
    ip: (ssh.connection as any)?.config?.host || "Unknown",
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

export async function verifySshConnection(config: any): Promise<void> {
  const ssh = await getSshClient(
    config.hostname, // Using hostname as connection ID for mock verification
    config.hostname,
    config.username,
    config.privateKey,
    config.password,
    config.port || 22
  );
  // Just execute a simple command to verify
  await executeSshCommand(ssh, "echo 'Connection Verified'");
}

export async function installAgentViaSsh(
  config: any, 
  apiBaseUrl: string, 
  apiKey: string, 
  onProgress?: (msg: string) => void
): Promise<void> {
  const ssh = await getSshClient(
    config.hostname,
    config.hostname,
    config.username,
    config.privateKey,
    config.password,
    config.port || 22
  );
  
  if (onProgress) onProgress("Connected via SSH. Downloading installer...");
  // Simulate the installation process
  await new Promise(r => setTimeout(r, 1000));
  
  if (onProgress) onProgress("Running installation script...");
  await executeSshCommand(ssh, `curl -fsSL ${apiBaseUrl}/install.sh | bash`);
  
  if (onProgress) onProgress("Agent installed and service started successfully.");
}

const WHITELISTED_COMMANDS = [
  // Read-only diagnostics
  "uptime",
  "df -h",
  "free -m",
  "docker ps",
  "systemctl status",
  // Phase 7 — AI Agent remediation commands
  "sudo systemctl restart",
  "sudo systemctl reload",
  "sudo systemctl stop",
  "docker restart",
  "docker stop",
  "redis-cli FLUSHDB",
  "redis-cli CONFIG",
  "kubectl scale",
  "kubectl rollout restart",
  "kubectl rollout status",
  "kill -9",
  "sudo kill",
];

export async function executeSafeSshCommand(connectionId: string, command: string): Promise<string> {
  if (!sshInstances.has(connectionId)) {
    throw new Error("SSH session not found");
  }

  // Validate command
  const isSafe = WHITELISTED_COMMANDS.some(cmd => command.startsWith(cmd));
  if (!isSafe) {
    throw new Error("Command not allowed. Only whitelisted commands can be executed.");
  }

  const ssh = sshInstances.get(connectionId)!;
  try {
    const resultPromise = ssh.execCommand(command);
    const timeoutPromise = new Promise<{ stdout: string, stderr: string, code: number }>((_, reject) => {
      setTimeout(() => reject(new Error("Command execution timed out after 15s")), 15000);
    });

    const result = await Promise.race([resultPromise, timeoutPromise]);
    
    if (result.stderr && result.code !== 0) {
      throw new Error(result.stderr);
    }
    return result.stdout || result.stderr || "Success";
  } catch (err: any) {
    throw new Error(`Execution failed: ${err.message}`);
  }
}
