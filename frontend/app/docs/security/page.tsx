import React from "react";
import { Shield, Key, Lock, FileSearch } from "lucide-react";

export default function SecurityDocsPage() {
  return (
    <div className="max-w-3xl prose prose-slate dark:prose-invert">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Security & Authentication
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          CloudAI Monitor is built with enterprise security in mind. Learn about our security model, encryption standards, and authentication mechanisms.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-10">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Shield className="text-indigo-500 mb-3" size={20} />
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">Data in Transit</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">All data transmitted between agents, the API, and your browser is encrypted using TLS 1.3 (HTTPS/WSS).</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Lock className="text-indigo-500 mb-3" size={20} />
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">Data at Rest</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">Databases and Redis streams are encrypted at rest using AES-256. API keys are hashed and salted.</p>
        </div>
      </div>

      <h2>Authentication Models</h2>

      <h3>1. Dashboard Access (Users)</h3>
      <p>
        User authentication is handled via NextAuth.js using secure, HttpOnly, SameSite cookies.
        We support SSO integrations including Google Workspace, GitHub, and custom SAML/OIDC providers.
        JWT tokens are signed with a strong 256-bit secret and have a short expiration window.
      </p>

      <h3>2. API & Agent Access (Machines)</h3>
      <p>
        Agents and external systems must authenticate using API Keys passed in the <code>Authorization</code> header as a Bearer token.
      </p>
      <ul>
        <li>Keys are strictly scoped (e.g. <code>Ingress Only</code>, <code>Read Only</code>, or <code>Admin</code>).</li>
        <li>For production agents, always use an <code>Ingress Only</code> key.</li>
        <li>Keys can be rotated or revoked instantly from the dashboard.</li>
      </ul>

      <h2>Network Security</h2>
      
      <h3>WebSocket Connections</h3>
      <p>
        The real-time telemetry stream operates over WSS (WebSocket Secure). 
        Connections are authenticated during the initial HTTP upgrade handshake using the API key. 
        If a key is revoked, the WebSocket server immediately drops all active connections using that key.
      </p>

      <h3>VPC & Private Links</h3>
      <p>
        For enterprise customers, CloudAI Monitor supports AWS PrivateLink, allowing agents to stream metrics to our platform without traffic ever traversing the public internet.
      </p>

      <hr className="my-10 border-slate-200 dark:border-slate-800" />

      <h2>Audit Logging</h2>
      <p>
        All sensitive actions within the platform are logged in an immutable audit trail. This includes:
      </p>
      <ul>
        <li>Login events (success and failure)</li>
        <li>API Key generation, rotation, and revocation</li>
        <li>Changes to alerting rules or infrastructure configuration</li>
        <li>Manual execution of automated remediation playbooks</li>
      </ul>
      <p>
        Audit logs are retained for 365 days and can be exported to your SIEM (e.g., Datadog, Splunk, Panther) via webhooks or Amazon S3 buckets.
      </p>
    </div>
  );
}
