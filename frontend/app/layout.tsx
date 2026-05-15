import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Cloud Monitoring Platform | Real-Time AI Observability",
  description: "Enterprise-grade AI observability platform with live metrics, anomaly detection, and topology intelligence.",
  keywords: ["Cloud Monitoring", "AI Monitoring", "Observability", "Kubernetes", "DevOps Dashboard", "SRE"],
  openGraph: {
    title: "AI Cloud Monitoring Platform",
    description: "Real-time AI observability with streaming telemetry and intelligent incident management.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "AI Cloud Monitor",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(15, 23, 42, 0.95)",
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                borderRadius: "12px",
                fontSize: "13px",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
