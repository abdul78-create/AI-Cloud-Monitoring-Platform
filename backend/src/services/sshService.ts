import { NodeSSH } from "node-ssh";

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  authMethod: "password" | "key";
  password?: string;
  privateKey?: string;
}

/**
 * Validates SSH connection settings
 */
export async function verifySshConnection(config: SSHConfig): Promise<boolean> {
  const ssh = new NodeSSH();
  try {
    const connectParams: any = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
    };

    if (config.authMethod === "key") {
      if (!config.privateKey) {
        throw new Error("Private key is required for key auth method.");
      }
      connectParams.privateKey = config.privateKey;
    } else {
      if (!config.password) {
        throw new Error("Password is required for password auth method.");
      }
      connectParams.password = config.password;
    }

    await ssh.connect(connectParams);
    ssh.dispose();
    return true;
  } catch (err: any) {
    console.error(`[SSH] Verification failed for ${config.host}:`, err.message);
    throw err;
  }
}

/**
 * Connects via SSH and executes agent installation script
 */
export async function installAgentViaSsh(
  config: SSHConfig,
  serverEndpoint: string,
  apiKey: string,
  onProgress: (msg: string) => void
): Promise<void> {
  const ssh = new NodeSSH();
  try {
    onProgress(`[SSH] Connecting to ${config.host}:${config.port || 22} as ${config.username}...`);
    
    const connectParams: any = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
      readyTimeout: 10000,
    };

    if (config.authMethod === "key") {
      connectParams.privateKey = config.privateKey;
    } else {
      connectParams.password = config.password;
    }

    await ssh.connect(connectParams);
    onProgress("✓ SSH Connection established successfully.");

    // Run diagnostics
    onProgress("[SSH] Running system diagnostics...");
    const checkNode = await ssh.execCommand("node -v");
    if (checkNode.code !== 0) {
      onProgress("⚠️ Node.js is not detected on the remote server. Attempting to locate/install...");
    } else {
      onProgress(`✓ Node.js detected: ${checkNode.stdout.trim()}`);
    }

    const checkNpm = await ssh.execCommand("npm -v");
    if (checkNpm.code !== 0) {
      onProgress("⚠️ npm is not detected on the remote server.");
    } else {
      onProgress(`✓ npm detected: ${checkNpm.stdout.trim()}`);
    }

    // Construct curl command to fetch and execute installer
    const installerUrl = `${serverEndpoint}/api/ops/install.sh?apiKey=${encodeURIComponent(apiKey)}`;
    const installCmd = `curl -fsSL "${installerUrl}" | bash`;
    
    onProgress(`[SSH] Running installer command: ${installCmd}`);

    const result = await ssh.execCommand(installCmd, {
      onStdout: (chunk) => {
        const text = chunk.toString();
        // Send logs back line by line
        text.split("\n").forEach((line: string) => {
          if (line.trim()) {
            onProgress(`[REMOTE] ${line}`);
          }
        });
      },
      onStderr: (chunk) => {
        const text = chunk.toString();
        text.split("\n").forEach((line: string) => {
          if (line.trim()) {
            onProgress(`[REMOTE ERR] ${line}`);
          }
        });
      }
    });

    if (result.code !== 0) {
      throw new Error(`Installer exited with non-zero code ${result.code}. Stderr: ${result.stderr}`);
    }

    onProgress("✓ Agent installer script completed successfully.");
    ssh.dispose();
  } catch (err: any) {
    ssh.dispose();
    onProgress(`❌ Error: ${err.message}`);
    throw err;
  }
}
