import Docker from "dockerode";

// Use standard local docker socket if available
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export async function collectDockerMetrics() {
  try {
    const containers = await docker.listContainers({ all: true });
    
    // We'll limit to max 10 to keep payloads light
    const results = [];
    for (const containerInfo of containers.slice(0, 10)) {
      let cpu = 0;
      let memory = 0;
      
      // If container is running, we can fetch live stats
      if (containerInfo.State === "running") {
        try {
          const container = docker.getContainer(containerInfo.Id);
          const stats = await container.stats({ stream: false });
          
          // Calculate CPU %
          const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
          const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
          if (systemDelta > 0 && cpuDelta > 0) {
            cpu = Math.round((cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 1000) / 10;
          }

          // Calculate Mem %
          const usedMemory = stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0);
          if (stats.memory_stats.limit > 0) {
            memory = Math.round((usedMemory / stats.memory_stats.limit) * 1000) / 10;
          }
        } catch (err) {
          // Ignore stats error for individual container
        }
      }

      results.push({
        id: containerInfo.Id.substring(0, 12),
        name: containerInfo.Names[0].replace(/^\//, ""),
        state: containerInfo.State, // "running", "exited", etc.
        status: containerInfo.Status,
        image: containerInfo.Image,
        cpu,
        memory,
      });
    }

    return results;
  } catch (error) {
    // Docker might not be installed or socket inaccessible
    return [];
  }
}
