"use client";

import { useState, useEffect } from "react";
import { useToast } from "./ToastProvider";

const API = "http://localhost:8000";

export function BotPill() {
  const [status, setStatus] = useState<"running" | "stopped" | "loading">("loading");
  const { showToast } = useToast();

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API}/api/bot/status`);
      const data = await res.json();
      setStatus(data.status === "running" ? "running" : "stopped");
    } catch {
      setStatus("stopped");
    }
  };

  useEffect(() => {
    fetchStatus();
    const iv = setInterval(fetchStatus, 10000);
    return () => clearInterval(iv);
  }, []);

  const toggle = async () => {
    setStatus("loading");
    try {
      if (status === "running") {
        await fetch(`${API}/api/bot/stop`, { method: "POST" });
        showToast("Bot stopped", "info");
        setStatus("stopped");
      } else {
        await fetch(`${API}/api/bot/start`, { method: "POST" });
        showToast("Bot started 🤖", "success");
        setStatus("running");
      }
    } catch {
      showToast("Failed to toggle bot", "error");
      fetchStatus();
    }
  };

  const isRunning = status === "running";

  return (
    <button
      onClick={toggle}
      disabled={status === "loading"}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        borderRadius: 40,
        background: "rgba(13,13,26,0.95)",
        backdropFilter: "blur(20px)",
        border: isRunning
          ? "1px solid rgba(16,185,129,0.4)"
          : "1px solid rgba(239,68,68,0.3)",
        boxShadow: isRunning
          ? "0 4px 20px rgba(16,185,129,0.2)"
          : "0 4px 20px rgba(239,68,68,0.1)",
        cursor: status === "loading" ? "not-allowed" : "pointer",
        zIndex: 900,
        transition: "all 0.3s ease",
        color: "#f1f5f9",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {status === "loading" ? (
        <>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#94a3b8" }} />
          <span style={{ color: "#94a3b8" }}>Connecting…</span>
        </>
      ) : (
        <>
          <span
            className={`pulse-dot ${isRunning ? "pulse-dot-green" : "pulse-dot-red"}`}
          />
          <span style={{ color: isRunning ? "#34d399" : "#f87171" }}>
            🤖 Bot {isRunning ? "Running" : "Stopped"}
          </span>
        </>
      )}
    </button>
  );
}
