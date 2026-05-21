"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Box, Network, Terminal, Check, ChevronRight,
  ArrowLeft, Wifi, AlertTriangle, Activity,
  Plus, Shield, Globe,
  KeyRound, Eye, EyeOff, Loader2, CheckCircle2, Clock, Zap
} from "lucide-react";
import { api } from "@/services/api";
import { useMonitoringStore } from "@/store/useMonitoringStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type Provider = "aws" | "docker" | "kubernetes" | "linux";
type Step = 0 | 1 | 2 | 3;
type AuthMethod = "key" | "password";

interface ServerData {
  id: string;
  hostname: string;
  ip: string;
  instanceType: string;
  os: string;
  status: "healthy" | "warning" | "critical";
  uptime: string;
  region: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
}

// ─── Mock server data ─────────────────────────────────────────────────────────

const INITIAL_SERVERS: ServerData[] = [
  {
    id: "srv-prod-api-1",
    hostname: "prod-api-1.us-east.internal",
    ip: "10.0.1.45",
    instanceType: "t3.xlarge",
    os: "Ubuntu 22.04 LTS",
    status: "healthy",
    uptime: "14d 7h 23m",
    region: "us-east-1a",
    cpu: 67, memory: 84, disk: 52,
    networkIn: 124.5, networkOut: 89.2,
  },
  {
    id: "srv-prod-api-2",
    hostname: "prod-api-2.us-east.internal",
    ip: "10.0.1.46",
    instanceType: "t3.xlarge",
    os: "Ubuntu 22.04 LTS",
    status: "healthy",
    uptime: "14d 7h 21m",
    region: "us-east-1b",
    cpu: 43, memory: 71, disk: 51,
    networkIn: 98.1, networkOut: 74.4,
  },
  {
    id: "srv-worker-1",
    hostname: "worker-node-1.us-east.internal",
    ip: "10.0.2.10",
    instanceType: "c5.2xlarge",
    os: "Ubuntu 22.04 LTS",
    status: "warning",
    uptime: "6d 4h 11m",
    region: "us-east-1c",
    cpu: 89, memory: 92, disk: 38,
    networkIn: 287.3, networkOut: 42.1,
  },
  {
    id: "srv-db-primary",
    hostname: "db-primary.us-east.internal",
    ip: "10.0.3.5",
    instanceType: "r5.xlarge",
    os: "Ubuntu 22.04 LTS",
    status: "healthy",
    uptime: "30d 2h 44m",
    region: "us-east-1a",
    cpu: 22, memory: 78, disk: 71,
    networkIn: 54.7, networkOut: 18.9,
  },
];

// ─── Provider config ──────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    id: "aws" as Provider,
    name: "AWS EC2",
    icon: Server,
    description: "Connect Amazon EC2 instances using IAM credentials or instance metadata for automatic discovery.",
    tags: ["EC2", "CloudWatch", "Auto-discovery"],
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "hover:border-orange-300 dark:hover:border-orange-700",
    selectedBg: "bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700",
  },
  {
    id: "docker" as Provider,
    name: "Docker",
    icon: Box,
    description: "Monitor Docker containers, networks, and volumes in real-time via the Docker daemon API.",
    tags: ["Containers", "Stats API", "Health checks"],
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "hover:border-blue-300 dark:hover:border-blue-700",
    selectedBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700",
  },
  {
    id: "kubernetes" as Provider,
    name: "Kubernetes",
    icon: Network,
    description: "Full cluster visibility: nodes, pods, namespaces, and workloads via the Kubernetes API.",
    tags: ["Pods", "Nodes", "kubectl"],
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "hover:border-indigo-300 dark:hover:border-indigo-700",
    selectedBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700",
  },
  {
    id: "linux" as Provider,
    name: "Linux Server",
    icon: Terminal,
    description: "Connect any Linux VM or bare-metal server via SSH or install our lightweight monitoring agent.",
    tags: ["SSH", "systemd", "Agent"],
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "hover:border-emerald-300 dark:hover:border-emerald-700",
    selectedBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700",
  },
];

const AWS_REGIONS = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
  "ap-southeast-1", "ap-southeast-2", "ap-northeast-1",
];

const PROGRESS_STEPS_LABELS = [
  "Validating credentials",
  "Fetching instance metadata",
  "Discovering servers",
  "Starting metric collection",
  "Establishing WebSocket channel",
];

const WIZARD_STEPS = ["Choose Provider", "Configure", "Connecting", "Live Monitoring"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MetricBar({ value, label, colorClass }: { value: number; label: string; colorClass: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{label}</span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "healthy" | "warning" | "critical" }) {
  const map = {
    healthy:  { cls: "badge-success",  label: "Healthy" },
    warning:  { cls: "badge-warning",  label: "Warning" },
    critical: { cls: "badge-critical", label: "Critical" },
  };
  return <span className={`badge ${map[status].cls}`}>{map[status].label}</span>;
}

function InputField({
  label, placeholder, value, onChange, type = "text", disabled = false
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-label" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 text-sm border rounded-lg transition-colors"
        style={{
          background: "var(--surface-0)",
          borderColor: "var(--border-default)",
          color: "var(--text-primary)",
          fontFamily: type === "password" || placeholder.startsWith("AKIA") ? "var(--font-mono)" : "inherit",
        }}
      />
    </div>
  );
}

// ─── Step Components ───────────────────────────────────────────────────────────

function StepChooseProvider({
  selected,
  onSelect,
}: {
  selected: Provider | null;
  onSelect: (p: Provider) => void;
}) {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Connect Your Infrastructure
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Choose your infrastructure provider to get started with live monitoring.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {PROVIDERS.map((provider) => {
          const isSelected = selected === provider.id;
          return (
            <motion.button
              key={provider.id}
              onClick={() => onSelect(provider.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative text-left p-5 rounded-xl border-2 transition-all duration-150 cursor-pointer
                ${isSelected ? provider.selectedBg : `border-transparent bg-white dark:bg-slate-900 ${provider.borderColor}`}
              `}
              style={{
                borderColor: isSelected ? undefined : "var(--border-default)",
                boxShadow: isSelected ? "var(--shadow-2)" : "var(--shadow-1)",
              }}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </span>
              )}
              <div className={`inline-flex p-2.5 rounded-lg mb-3 ${provider.bgColor}`}>
                <provider.icon size={22} className={provider.color} />
              </div>
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                {provider.name}
              </h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                {provider.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {provider.tags.map(tag => (
                  <span key={tag} className="badge badge-info text-[10px] px-1.5 py-0.5">{tag}</span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StepConfigure({
  provider,
  form,
  setForm,
  onBack,
  onConnect,
  linuxMode,
  setLinuxMode,
}: {
  provider: Provider;
  form: Record<string, string>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onBack: () => void;
  onConnect: () => void;
  linuxMode: "manual" | "ssh";
  setLinuxMode: (m: "manual" | "ssh") => void;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("key");
  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const providerName = PROVIDERS.find(p => p.id === provider)?.name ?? provider;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm mb-4 hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h2 className="text-2xl font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
          Configure {providerName}
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Enter your connection details to begin monitoring.
        </p>
      </div>

      <div
        className="max-w-lg mx-auto p-6 rounded-xl border space-y-5"
        style={{ background: "var(--surface-0)", borderColor: "var(--border-default)" }}
      >
        {/* AWS */}
        {provider === "aws" && (
          <>
            <div className="space-y-1.5">
              <label className="text-label" style={{ color: "var(--text-secondary)" }}>AWS Region</label>
              <select
                value={form.region || "us-east-1"}
                onChange={e => set("region")(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ background: "var(--surface-0)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                {AWS_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <InputField label="Access Key ID" placeholder="AKIAIOSFODNN7EXAMPLE" value={form.accessKeyId || ""} onChange={set("accessKeyId")} />
            <div className="space-y-1.5">
              <label className="text-label" style={{ color: "var(--text-secondary)" }}>Secret Access Key</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  value={form.secretKey || ""}
                  onChange={e => set("secretKey")(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm border rounded-lg font-mono"
                  style={{ background: "var(--surface-0)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <InputField
              label="Instance Tag Filter (optional)"
              placeholder="Environment=production"
              value={form.tagFilter || ""}
              onChange={set("tagFilter")}
            />
            <div
              className="flex items-start gap-2.5 p-3 rounded-lg text-xs"
              style={{ background: "var(--color-info-bg)", borderColor: "var(--color-info-border)", border: "1px solid" }}
            >
              <Shield size={13} className="mt-0.5 flex-shrink-0 text-blue-500" />
              <span style={{ color: "var(--text-secondary)" }}>
                Credentials are only used for API calls and are never stored in plaintext.
                We recommend using an IAM role with least-privilege read-only permissions.
              </span>
            </div>
          </>
        )}

        {/* Docker */}
        {provider === "docker" && (
          <>
            <InputField
              label="Docker Host"
              placeholder="unix:///var/run/docker.sock"
              value={form.dockerHost || "unix:///var/run/docker.sock"}
              onChange={set("dockerHost")}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="use-tls"
                checked={form.useTLS === "true"}
                onChange={e => set("useTLS")(e.target.checked ? "true" : "false")}
                className="rounded"
              />
              <label htmlFor="use-tls" className="text-sm" style={{ color: "var(--text-primary)" }}>
                Enable TLS
              </label>
            </div>
            {form.useTLS === "true" && (
              <div className="space-y-1.5">
                <label className="text-label" style={{ color: "var(--text-secondary)" }}>TLS Certificate (PEM)</label>
                <textarea
                  rows={4}
                  placeholder="-----BEGIN CERTIFICATE-----&#10;..."
                  value={form.tlsCert || ""}
                  onChange={e => set("tlsCert")(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg font-mono resize-none"
                  style={{ background: "var(--surface-0)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>
            )}
          </>
        )}

        {/* Kubernetes */}
        {provider === "kubernetes" && (
          <>
            <div className="space-y-1.5">
              <label className="text-label" style={{ color: "var(--text-secondary)" }}>Kubeconfig</label>
              <textarea
                rows={8}
                placeholder="Paste your kubeconfig YAML here..."
                value={form.kubeconfig || ""}
                onChange={e => set("kubeconfig")(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-lg font-mono resize-none"
                style={{ background: "var(--surface-0)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <InputField
              label="Context"
              placeholder="prod-cluster-us-east-1"
              value={form.context || ""}
              onChange={set("context")}
            />
            <div className="space-y-1.5">
              <label className="text-label" style={{ color: "var(--text-secondary)" }}>Namespace</label>
              <select
                value={form.namespace || "all"}
                onChange={e => set("namespace")(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ background: "var(--surface-0)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                <option value="all">All Namespaces</option>
                <option value="default">default</option>
                <option value="production">production</option>
                <option value="staging">staging</option>
                <option value="kube-system">kube-system</option>
              </select>
            </div>
          </>
        )}

        {/* Linux SSH */}
        {provider === "linux" && (
          <>
            <div className="space-y-1.5 mb-4">
              <label className="text-label" style={{ color: "var(--text-secondary)" }}>Deployment Mode</label>
              <div className="flex gap-2">
                {[
                  { id: "ssh", label: "Automatic Agent (SSH)" },
                  { id: "manual", label: "Manual Install Script" },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setLinuxMode(m.id as "manual" | "ssh")}
                    className="flex-1 py-2 rounded-md text-sm font-medium border transition-colors text-center animate-pulse-subtle"
                    style={{
                      background: linuxMode === m.id ? "var(--brand-50)" : "var(--surface-1)",
                      borderColor: linuxMode === m.id ? "var(--brand-600)" : "var(--border-default)",
                      color: linuxMode === m.id ? "var(--brand-600)" : "var(--text-secondary)",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {linuxMode === "ssh" ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <InputField label="Hostname / IP Address" placeholder="192.168.1.100 or server.example.com" value={form.hostname || ""} onChange={set("hostname")} />
                  </div>
                  <InputField label="SSH Port" placeholder="22" value={form.port || "22"} onChange={set("port")} />
                </div>
                <InputField label="Username" placeholder="ubuntu" value={form.username || ""} onChange={set("username")} />

                {/* Auth method toggle */}
                <div className="space-y-1.5">
                  <label className="text-label" style={{ color: "var(--text-secondary)" }}>Authentication Method</label>
                  <div className="flex gap-2">
                    {(["key", "password"] as AuthMethod[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setAuthMethod(m);
                          set("authMethod")(m);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
                        style={{
                          background: authMethod === m ? "var(--brand-50)" : "var(--surface-1)",
                          borderColor: authMethod === m ? "var(--brand-600)" : "var(--border-default)",
                          color: authMethod === m ? "var(--brand-600)" : "var(--text-secondary)",
                        }}
                      >
                        {m === "key" ? <KeyRound size={13} /> : <Shield size={13} />}
                        {m === "key" ? "SSH Key" : "Password"}
                      </button>
                    ))}
                  </div>
                </div>

                {authMethod === "key" ? (
                  <div className="space-y-1.5">
                    <label className="text-label" style={{ color: "var(--text-secondary)" }}>Private Key (PEM)</label>
                    <textarea
                      rows={6}
                      placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;..."
                      value={form.privateKey || ""}
                      onChange={e => set("privateKey")(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-lg font-mono resize-none"
                      style={{ background: "var(--surface-0)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-label" style={{ color: "var(--text-secondary)" }}>Password</label>
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        placeholder="Enter SSH password"
                        value={form.password || ""}
                        onChange={e => set("password")(e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-sm border rounded-lg"
                        style={{ background: "var(--surface-0)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg text-sm bg-slate-950 border border-slate-800 text-slate-200 space-y-3 font-mono relative group">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>LINUX AGENT SHELL INSTALLER</span>
                    <button
                      type="button"
                      onClick={() => {
                        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
                          ? process.env.NEXT_PUBLIC_API_BASE_URL.replace("/api", "")
                          : "http://localhost:5000";
                        const cmd = `curl -fsSL "${apiBaseUrl}/api/ops/install.sh?apiKey=dev-key" | bash`;
                        navigator.clipboard.writeText(cmd);
                        alert("Command copied to clipboard!");
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="break-all whitespace-pre-wrap select-all text-xs bg-transparent border-0 p-0 text-emerald-400 font-mono">
                    {`curl -fsSL "${process.env.NEXT_PUBLIC_API_BASE_URL ? process.env.NEXT_PUBLIC_API_BASE_URL.replace("/api", "") : "http://localhost:5000"}/api/ops/install.sh?apiKey=dev-key" | bash`}
                  </pre>
                </div>
                
                <div className="space-y-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <p className="font-semibold text-slate-300">Instructions:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                    <li>Log in to your target Linux server.</li>
                    <li>Copy and paste the command block above into your terminal.</li>
                    <li>Press Enter. The script will automatically discover and install all agent telemetry requirements and start the daemon service.</li>
                    <li>Click &apos;Listen for Connection&apos; below to wait for the server&apos;s telemetry heartbeat.</li>
                  </ol>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={onConnect}
          className="btn btn-primary px-8 py-2.5 text-sm font-semibold flex items-center gap-2"
        >
          <Wifi size={15} />
          {provider === "linux"
            ? linuxMode === "ssh"
              ? "Connect & Install Agent"
              : "Listen for Connection"
            : "Connect & Discover Servers"}
        </button>
      </div>
    </div>
  );
}

function StepConnecting({
  provider,
  linuxMode,
  sshLogs,
  sshError,
  onRetry,
  onSimulateHeartbeat,
}: {
  provider: Provider;
  linuxMode: "manual" | "ssh";
  sshLogs: string[];
  sshError: string | null;
  onRetry: () => void;
  onSimulateHeartbeat?: () => void;
}) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const providerName = PROVIDERS.find(p => p.id === provider)?.name ?? provider;
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (provider !== "linux" || linuxMode !== "ssh") {
      PROGRESS_STEPS_LABELS.forEach((_, i) => {
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, i]);
        }, 700 + i * 750);
      });
    }
  }, [provider, linuxMode]);

  useEffect(() => {
    if (provider === "linux" && linuxMode === "ssh") {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [sshLogs, provider, linuxMode]);

  if (provider === "linux" && linuxMode === "ssh") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "var(--brand-50)" }}>
            <Terminal size={28} className={sshError ? "text-red-500" : "animate-spin"} style={{ color: sshError ? undefined : "var(--brand-600)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {sshError ? "Deployment Failed" : "Agent Automatic Deployment"}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {sshError ? "SSH command execution failed. See terminal output below." : "SSH credentials authenticated. Running installer on remote host..."}
          </p>
        </div>

        <div className="rounded-xl border bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${sshError ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className="ml-1 text-[10px]">deploy-agent.sh (SSH Console)</span>
            </span>
            <span className="text-[10px] animate-pulse">{sshError ? "FAILED" : "STREAMING"}</span>
          </div>
          
          <div className="h-64 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent pr-2">
            {sshLogs.map((log, idx) => {
              let textClass = "text-slate-300";
              if (log.startsWith("❌") || log.startsWith("[REMOTE ERR]")) textClass = "text-red-400";
              else if (log.startsWith("✓") || log.includes("completed successfully") || log.startsWith("Success")) textClass = "text-emerald-400 font-semibold";
              else if (log.startsWith("[LOCAL]")) textClass = "text-blue-400";
              else if (log.startsWith("[SSH]")) textClass = "text-cyan-400 font-semibold";

              return (
                <div key={idx} className={`leading-relaxed break-all ${textClass}`}>
                  {log}
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </div>

        {sshError && (
          <div className="flex justify-center gap-3">
            <button
              onClick={onRetry}
              className="btn btn-primary px-6 py-2 text-sm font-semibold"
            >
              Configure & Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  if (provider === "linux" && linuxMode === "manual") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: "var(--brand-50)" }}>
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--brand-600)" }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Waiting for Agent Heartbeat
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Please run the curl command on your remote Linux host.
            Once executed, the agent will send its first telemetry packet and this screen will transition automatically.
          </p>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
          >
            <Clock size={12} />
            Listening on WebSocket port...
          </div>
        </div>

        <div className="p-5 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            No real VM on hand? Click below to send a mock heartbeat to the local daemon and bypass waiting.
          </p>
          <button
            onClick={onSimulateHeartbeat}
            className="w-full btn btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all shadow-md"
          >
            <Zap size={14} />
            Simulate Agent Heartbeat
          </button>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onRetry}
            className="btn btn-outlined text-sm font-semibold"
          >
            Back to Config
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "var(--brand-50)" }}>
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--brand-600)" }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Connecting to {providerName}
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Establishing secure connection and discovering your infrastructure...
        </p>
      </div>

      <div
        className="text-left rounded-xl border p-5 space-y-3"
        style={{ background: "var(--surface-0)", borderColor: "var(--border-default)" }}
      >
        {PROGRESS_STEPS_LABELS.map((label, i) => {
          const isDone = completedSteps.includes(i);
          const isActive = !isDone && completedSteps.length === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : isActive ? (
                  <Loader2 size={16} className="animate-spin" style={{ color: "var(--brand-600)" }} />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: "var(--border-default)" }} />
                )}
              </div>
              <span
                className="text-sm"
                style={{
                  color: isDone ? "var(--color-success)" : isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StepLiveMonitoring({
  provider,
  servers,
  onConnectMore,
}: {
  provider: Provider;
  servers: ServerData[];
  onConnectMore: () => void;
}) {
  const [liveMetrics, setLiveMetrics] = useState<Record<string, { cpu: number; memory: number; disk: number }>>(
    Object.fromEntries(servers.map(s => [s.id, { cpu: s.cpu, memory: s.memory, disk: s.disk }]))
  );

  // Simulate live metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev =>
        Object.fromEntries(
          Object.entries(prev).map(([id, m]) => [
            id,
            {
              cpu:    Math.max(1, Math.min(99, m.cpu    + (Math.random() - 0.5) * 4)),
              memory: Math.max(1, Math.min(99, m.memory + (Math.random() - 0.5) * 2)),
              disk:   Math.max(1, Math.min(99, m.disk   + (Math.random() - 0.5) * 0.5)),
            },
          ])
        )
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const healthyCount = servers.filter(s => s.status === "healthy").length;
  const warningCount = servers.filter(s => s.status === "warning").length;

  return (
    <div>
      {/* Success banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-xl border mb-6"
        style={{
          background: "var(--color-success-bg)",
          borderColor: "var(--color-success-border)",
        }}
      >
        <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>
            Live telemetry active — {servers.length} servers connected
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Data is streaming to your dashboard. Monitoring interval: 3 seconds.
          </p>
        </div>
        <span className="live-dot text-xs flex-shrink-0">LIVE</span>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Servers Connected", value: servers.length, icon: Server, color: "text-blue-500" },
          { label: "Healthy", value: healthyCount, icon: CheckCircle2, color: "text-green-500" },
          { label: "Warnings", value: warningCount, icon: AlertTriangle, color: "text-yellow-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <div className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Server cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {servers.map((server, i) => {
          const metrics = liveMetrics[server.id] ?? { cpu: server.cpu, memory: server.memory, disk: server.disk };
          return (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {server.hostname}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>{server.ip}</span>
                    <span className="badge badge-info text-[10px] px-1.5 py-0">{server.instanceType}</span>
                  </div>
                </div>
                <StatusBadge status={server.status} />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <Globe size={11} />{server.region}
                </div>
                <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <Clock size={11} />{server.uptime}
                </div>
                <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <Server size={11} />{server.os}
                </div>
                <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <Activity size={11} />{server.networkIn.toFixed(0)} Mbps in
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <MetricBar
                  value={metrics.cpu}
                  label="CPU"
                  colorClass={metrics.cpu > 80 ? "bg-red-500" : metrics.cpu > 60 ? "bg-yellow-500" : "bg-green-500"}
                />
                <MetricBar
                  value={metrics.memory}
                  label="Memory"
                  colorClass={metrics.memory > 85 ? "bg-red-500" : metrics.memory > 70 ? "bg-yellow-500" : "bg-blue-500"}
                />
                <MetricBar
                  value={metrics.disk}
                  label="Disk"
                  colorClass={metrics.disk > 85 ? "bg-red-500" : "bg-indigo-500"}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard" className="btn btn-primary flex items-center gap-2">
          <Zap size={15} />
          Go to Dashboard
          <ChevronRight size={14} />
        </Link>
        <button onClick={onConnectMore} className="btn btn-outlined flex items-center gap-2">
          <Plus size={14} />
          Connect More Servers
        </button>
        <Link href="/dashboard/topology" className="btn btn-ghost flex items-center gap-2">
          <Network size={14} />
          View Topology Map
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConnectInfrastructurePage() {
  const [step, setStep]               = useState<Step>(0);
  const [provider, setProvider]       = useState<Provider | null>(null);
  const [form, setForm]               = useState<Record<string, string>>({});
  const [servers, setServers]         = useState<ServerData[]>([]);
  const [linuxMode, setLinuxMode]     = useState<"manual" | "ssh">("ssh");
  const [sshLogs, setSshLogs]         = useState<string[]>([]);
  const [isSshRunning, setIsSshRunning] = useState<boolean>(false);
  const [sshError, setSshError]       = useState<string | null>(null);

  const socket = useMonitoringStore(state => state.socket);

  const handleSelectProvider = (p: Provider) => setProvider(p);

  const handleNext = () => {
    if (step === 0 && !provider) return;
    setStep(s => (s + 1) as Step);
  };

  const handleSimulateHeartbeat = async () => {
    try {
      const mockPayload = {
        agentId: "agent-simulated-" + Math.random().toString(36).substring(2, 7),
        hostname: "simulated-linux-node-" + Math.random().toString(36).substring(2, 5) + ".internal",
        ip: "192.168.1.144",
        version: "1.0.0",
        metrics: {
          cpu: 34.5,
          memory: 62.8,
          disk: 41.2,
          networkIn: 8.4,
          networkOut: 5.6,
          networkInBytes: 8400,
          networkOutBytes: 5600,
          uptime: 120
        },
        processes: [
          { pid: 101, name: "node", cpu: 0.8, memory: 1.5, command: "node agent.js" },
          { pid: 202, name: "nginx", cpu: 0.3, memory: 0.8, command: "nginx: worker process" }
        ]
      };
      await api.post("/ops/agent/heartbeat", mockPayload);
    } catch (err) {
      console.error("Error simulating agent heartbeat:", err);
    }
  };

  const handleConnect = async () => {
    if (provider === "linux") {
      if (linuxMode === "ssh") {
        const config = {
          host: form.hostname,
          port: parseInt(form.port || "22", 10),
          username: form.username,
          password: form.password || undefined,
          privateKey: form.privateKey || undefined,
        };
        setIsSshRunning(true);
        setSshError(null);
        setSshLogs(["[LOCAL] Initiating connection request to remote host..."]);
        setStep(2);

        try {
          const response = await api.post("/ops/ssh/install-agent", {
            config,
            apiKey: "dev-key",
            socketId: socket?.id
          });
          if (response.data.success) {
            setSshLogs(prev => [...prev, "[LOCAL] SSH authentication verified. Script deployment sequence running in background."]);
          } else {
            setSshError(response.data.message || "Failed to initiate agent installation");
            setIsSshRunning(false);
          }
        } catch (err: any) {
          setSshError(err.message || "Failed to connect to remote server");
          setIsSshRunning(false);
        }
      } else {
        // Manual mode: simply go to connecting screen to wait for connection
        setStep(2);
      }
    } else {
      setStep(2);
      // Mock discovery for AWS, Docker, Kubernetes
      setTimeout(() => {
        setServers(INITIAL_SERVERS);
        setStep(3);
      }, 5000);
    }
  };

  const handleConnectMore = () => {
    setStep(0);
    setProvider(null);
    setForm({});
    setServers([]);
    setSshLogs([]);
    setSshError(null);
    setIsSshRunning(false);
  };

  // Wire up socket listeners when on step 2 (Connecting / Installing)
  useEffect(() => {
    if (!socket) return;

    const handleSshProgress = (data: { message: string }) => {
      setSshLogs(prev => [...prev, data.message]);
      if (data.message.includes("❌")) {
        setSshError(data.message);
        setIsSshRunning(false);
      }
      if (data.message.includes("Installation completed successfully!")) {
        setIsSshRunning(false);
      }
    };

    const handleAgentTelemetry = async () => {
      try {
        const response = await api.get("/ops/agents");
        if (response.data.success) {
          const agents = response.data.data;
          const serverDataList = agents.map((agent: any) => ({
            id: agent.agentId,
            hostname: agent.hostname,
            ip: agent.ip,
            instanceType: `Agent v${agent.version}`,
            os: "Linux OS",
            status: agent.status === "offline" ? "critical" : (agent.status === "healthy" ? "healthy" : "warning"),
            uptime: agent.uptime ? `${Math.round(agent.uptime)}s` : "0s",
            region: "On-Premises",
            cpu: agent.metrics?.cpu ?? 0,
            memory: agent.metrics?.memory ?? 0,
            disk: agent.metrics?.disk ?? 0,
            networkIn: agent.metrics?.networkIn ?? 0,
            networkOut: agent.metrics?.networkOut ?? 0,
          }));
          setServers(serverDataList);
          if (step === 2 && provider === "linux") {
            setStep(3);
          }
        }
      } catch (err) {
        console.error("Error fetching agents list:", err);
      }
    };

    socket.on("ssh:install-progress", handleSshProgress);
    socket.on("agent:telemetry", handleAgentTelemetry);

    return () => {
      socket.off("ssh:install-progress", handleSshProgress);
      socket.off("agent:telemetry", handleAgentTelemetry);
    };
  }, [socket, step, provider]);

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--text-tertiary)" }}>
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <ChevronRight size={12} style={{ color: "var(--text-tertiary)" }} />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Connect Infrastructure</span>
        </div>
        <h1 className="heading-page flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: "var(--brand-50)" }}>
            <Server size={16} style={{ color: "var(--brand-600)" }} />
          </div>
          Connect Infrastructure
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Add AWS EC2 instances, Docker containers, Kubernetes clusters, or Linux servers to start monitoring.
        </p>
      </div>

      {/* Stepper */}
      {step < 4 && (
        <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-1">
          {WIZARD_STEPS.map((label, i) => {
            const isActive   = i === step;
            const isComplete = i < step;
            return (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                    style={{
                      background: isComplete ? "var(--color-success)" : isActive ? "var(--brand-600)" : "var(--surface-3)",
                      color: isComplete || isActive ? "#fff" : "var(--text-tertiary)",
                    }}
                  >
                    {isComplete ? <Check size={12} /> : i + 1}
                  </div>
                  <span
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: isActive ? "var(--text-primary)" : "var(--text-tertiary)" }}
                  >
                    {label}
                  </span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div
                    className="flex-1 h-px mx-3"
                    style={{
                      background: i < step ? "var(--color-success)" : "var(--border-default)",
                      minWidth: 24,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <StepChooseProvider selected={provider} onSelect={handleSelectProvider} />
          )}
          {step === 1 && provider && (
            <StepConfigure
              provider={provider}
              form={form}
              setForm={setForm}
              onBack={() => setStep(0)}
              onConnect={handleConnect}
              linuxMode={linuxMode}
              setLinuxMode={setLinuxMode}
            />
          )}
          {step === 2 && provider && (
            <StepConnecting
              provider={provider}
              linuxMode={linuxMode}
              sshLogs={sshLogs}
              sshError={sshError}
              onRetry={() => setStep(1)}
              onSimulateHeartbeat={handleSimulateHeartbeat}
            />
          )}
          {step === 3 && provider && (
            <StepLiveMonitoring
              provider={provider}
              servers={servers}
              onConnectMore={handleConnectMore}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next button for step 0 */}
      {step === 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleNext}
            disabled={!provider}
            className="btn btn-primary px-8 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
