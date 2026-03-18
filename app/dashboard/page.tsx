"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

function StatCard({
  icon, label, value, color, loading,
}: {
  icon: string; label: string; value: string | number; color: string; loading?: boolean;
}) {
  return (
    <div
      className="glass"
      style={{
        padding: 24,
        borderTop: `2px solid ${color}`,
        boxShadow: `0 0 30px ${color}18`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      {loading ? (
        <div className="skeleton" style={{ height: 36, width: 80, marginBottom: 8 }} />
      ) : (
        <div className="stat-number" style={{ color, marginBottom: 4 }}>{value}</div>
      )}
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</div>
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: color,
          opacity: 0.05,
        }}
      />
    </div>
  );
}

function ActivityItem({ icon, text, time, color }: { icon: string; text: string; time: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>{text}</div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{time}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [botStatus, setBotStatus] = useState<"running" | "stopped">("stopped");
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [stats, setStats] = useState({ registrations: 0, checkedIn: 0, complaints: 0, certificates: 0 });
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [botRes, schedRes] = await Promise.allSettled([
          fetch(`${API}/api/bot/status`).then((r) => r.json()),
          fetch(`${API}/api/scheduler/status`).then((r) => r.json()),
        ]);
        if (botRes.status === "fulfilled") setBotStatus(botRes.value?.status === "running" ? "running" : "stopped");
        if (schedRes.status === "fulfilled") setSchedulerStatus(schedRes.value);
        // Simulate supabase stats
        setStats({ registrations: 342, checkedIn: 287, complaints: 5, certificates: 0 });
      } catch {
        setStats({ registrations: 342, checkedIn: 287, complaints: 5, certificates: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleBot = async (target: "start" | "stop") => {
    try {
      await fetch(`${API}/api/bot/${target}`, { method: "POST" });
      setBotStatus(target === "start" ? "running" : "stopped");
      showToast(`Bot ${target === "start" ? "started 🤖" : "stopped"}`, target === "start" ? "success" : "info");
    } catch {
      showToast("Failed to control bot", "error");
    }
  };

  const toggleScheduler = async (target: "start" | "stop") => {
    try {
      await fetch(`${API}/api/scheduler/${target}`, { method: "POST" });
      setSchedulerStatus((prev: any) => ({ ...prev, status: target === "start" ? "running" : "stopped" }));
      showToast(`Scheduler ${target === "start" ? "started" : "stopped"}`, target === "start" ? "success" : "info");
    } catch {
      showToast("Failed to control scheduler", "error");
    }
  };

  const activities = [
    { icon: "📷", text: "New photo submitted to Social Wall by Attendee #142", time: "2 min ago", color: "#a855f7" },
    { icon: "🆘", text: "Emergency complaint: Projector down in Hall B", time: "5 min ago", color: "#ef4444" },
    { icon: "👥", text: "23 new attendees registered in the last hour", time: "15 min ago", color: "#3b82f6" },
    { icon: "✅", text: "Wall photo approved — Hackathon Team Alpha", time: "22 min ago", color: "#10b981" },
    { icon: "📢", text: "Scheduled announcement sent: 'Lunch break at 1PM'", time: "1 hr ago", color: "#f59e0b" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>📊</span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Overview Dashboard</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          Real-time event health at a glance — {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon="👥" label="Registrations" value={stats.registrations} color="#a855f7" loading={loading} />
        <StatCard icon="✅" label="Checked In" value={stats.checkedIn} color="#3b82f6" loading={loading} />
        <StatCard icon="🆘" label="Open Complaints" value={stats.complaints} color="#ef4444" loading={loading} />
        <StatCard icon="🎓" label="Certificates Issued" value={stats.certificates} color="#10b981" loading={loading} />
      </div>

      {/* Bot + Scheduler row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Bot card */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="section-title">🤖 Telegram Bot</div>
              <div className="section-subtitle">Auto-replies, check-in, certificates</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`pulse-dot ${botStatus === "running" ? "pulse-dot-green" : "pulse-dot-red"}`} />
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: botStatus === "running" ? "#34d399" : "#f87171",
              }}>
                {botStatus === "running" ? "RUNNING" : "STOPPED"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-success"
              onClick={() => toggleBot("start")}
              disabled={botStatus === "running"}
              style={{ flex: 1, justifyContent: "center" }}
            >
              ▶ Start Bot
            </button>
            <button
              className="btn-danger"
              onClick={() => toggleBot("stop")}
              disabled={botStatus === "stopped"}
              style={{ flex: 1, justifyContent: "center" }}
            >
              ⏹ Stop Bot
            </button>
          </div>
        </div>

        {/* Scheduler card */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="section-title">📅 Scheduler</div>
              <div className="section-subtitle">
                {schedulerStatus?.jobs ? `${schedulerStatus.jobs.length} jobs queued` : "Auto-announcements engine"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`pulse-dot ${schedulerStatus?.status === "running" ? "pulse-dot-green" : "pulse-dot-red"}`} />
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: schedulerStatus?.status === "running" ? "#34d399" : "#f87171",
              }}>
                {schedulerStatus?.status?.toUpperCase() ?? "UNKNOWN"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-success"
              onClick={() => toggleScheduler("start")}
              disabled={schedulerStatus?.status === "running"}
              style={{ flex: 1, justifyContent: "center" }}
            >
              ▶ Start
            </button>
            <button
              className="btn-danger"
              onClick={() => toggleScheduler("stop")}
              disabled={schedulerStatus?.status !== "running"}
              style={{ flex: 1, justifyContent: "center" }}
            >
              ⏹ Stop
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div className="section-title">⚡ Recent Activity</div>
            <div className="section-subtitle">Live feed from complaints & wall</div>
          </div>
          <div className="badge badge-purple">LIVE</div>
        </div>
        {activities.map((a, i) => (
          <ActivityItem key={i} {...a} />
        ))}
      </div>
    </div>
  );
}
