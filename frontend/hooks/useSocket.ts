"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { toast } from "react-hot-toast";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useSocket = () => {
  const { metrics, infrastructure } = useMonitoringStore();

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("[SOCKET] Connected to backend");
    });

    socket.on("metrics", (data) => {
      useMonitoringStore.setState((state) => ({
        metrics: [...state.metrics, data].slice(-20)
      }));
    });

    socket.on("alert", (data) => {
      useMonitoringStore.setState((state) => ({
        alerts: [data, ...state.alerts].slice(-10)
      }));
      toast.error(`Alert on ${data.hostname}: ${data.metric} exceeded threshold!`);
    });

    socket.on("infrastructure", (data) => {
      useMonitoringStore.setState({ infrastructure: data });
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Disconnected from backend");
    });

    return () => {
      socket.disconnect();
    };
  }, []);
};
