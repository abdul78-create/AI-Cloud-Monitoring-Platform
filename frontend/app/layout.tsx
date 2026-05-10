import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Cloud Monitoring Platform | AI-Powered Observability SaaS",
  description: "Production-style AI cloud monitoring dashboard with live metrics, anomaly detection, and portfolio-ready deployment.",
  keywords: ["Cloud Monitoring", "AI Monitoring", "Next.js SaaS", "Ollama", "DevOps Dashboard", "Portfolio Project"],
  openGraph: {
    title: "AI Cloud Monitoring Platform",
    description: "A full-stack AI observability platform with real-time infrastructure insights.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "AI Cloud Monitoring Platform",
    type: "website"
  },
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0f172a",
              color: "#e2e8f0",
              border: "1px solid rgba(148,163,184,0.25)"
            }
          }}
        />
      </body>
    </html>
  );
}
