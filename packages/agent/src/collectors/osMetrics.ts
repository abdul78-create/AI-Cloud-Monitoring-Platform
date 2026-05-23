import si from "systeminformation";

export async function collectOsMetrics() {
  const [cpu, mem, fsSize, osInfo, currentLoad, processes, networkStats, time] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.fsSize(),
    si.osInfo(),
    si.currentLoad(),
    si.processes(),
    si.networkStats(),
    si.time(),
  ]);

  // Use the root filesystem or biggest mount point
  const rootFs = fsSize.find((fs) => fs.mount === "/") || fsSize[0] || { use: 0 };
  const defaultNetwork = networkStats[0] || { rx_bytes: 0, tx_bytes: 0 };

  // Top 5 processes by CPU usage
  const topProcesses = processes.list
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 5)
    .map(p => ({
      pid: p.pid,
      name: p.name,
      cpu: Math.round(p.cpu * 10) / 10,
      memory: Math.round(p.mem * 10) / 10
    }));

  return {
    cpu: Math.round(currentLoad.currentLoad * 10) / 10,
    memory: Math.round((mem.active / mem.total) * 1000) / 10,
    disk: Math.round(rootFs.use * 10) / 10,
    networkInBytes: defaultNetwork.rx_bytes,
    networkOutBytes: defaultNetwork.tx_bytes,
    uptime: time.uptime,
    processes: topProcesses,
    system: {
      hostname: osInfo.hostname,
      os: osInfo.distro || osInfo.platform,
      arch: osInfo.arch,
      cores: cpu.cores
    }
  };
}
