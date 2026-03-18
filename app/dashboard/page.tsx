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
          position: "absolute", top: -20, right: -20,
          width: 80, height: 80, borderRadius: "50%",
          background: color, opacity: 0.05,
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

// Mini SVG bar chart for check-ins per hour
function CheckInChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const hours = ["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm"];
  const W = 480, H = 100, pad = 24, barW = 32, gap = (W - pad * 2 - barW * data.length) / (data.length - 1);

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 28}`} style={{ display: "block" }}>
        {data.map((v, i) => {
          const barH = ((v / max) * H) || 2;
          const x = pad + i * (barW + gap);
          const y = H - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={5}
                fill={`url(#barGrad${i})`} opacity={0.9} />
              <defs>
                <linearGradient id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={10} fill="#64748b">{v}</text>
              <text x={x + barW / 2} y={H + 18} textAnchor="middle" fontSize={10} fill="#475569">{hours[i]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [botStatus, setBotStatus] = useState<"running" | "stopped">("stopped");
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [stats, setStats] = useState({ registrations: 0, checkedIn: 0, complaints: 0, certificates: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [checkInData, setCheckInData] = useState<number[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [botRes, schedRes, statsRes] = await Promise.allSettled([
          fetch(`${API}/api/bot/status`).then(r => r.json()),
          fetch(`${API}/api/scheduler/status`).then(r => r.json()),
          fetch(`${API}/api/stats`).then(r => r.json()),
        ]);
        if (botRes.status === "fulfilled") setBotStatus(botRes.value?.status === "running" ? "running" : "stopped");
        if (schedRes.status === "fulfilled") setSchedulerStatus(schedRes.value);
        if (statsRes.status === "fulfilled" && statsRes.value) {
          const s = statsRes.value;
          setStats({
            registrations: s.registrations ?? s.total_registrations ?? 0,
            checkedIn: s.checked_in ?? s.checkedIn ?? 0,
            complaints: s.open_complaints ?? s.complaints ?? 0,
            certificates: s.certificates_issued ?? s.certificates ?? 0,
          });
          if (s.checkin_by_hour) setCheckInData(s.checkin_by_hour);
          if (s.recent_activity) setActivities(s.recent_activity);
        }
      } catch {
        // backend offline — show zeros
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
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

  const defaultActivity = [
    { icon: "📷", text: "Connect backend to see live activity", time: "—", color: "#a855f7" },
    { icon: "🆘", text: "Help desk will appear here in real-time", time: "—", color: "#ef4444" },
    { icon: "👥", text: "Registration events will appear here", time: "—", color: "#3b82f6" },
  ];

  const feed = activities.length > 0 ? activities : defaultActivity;
  const showChart = checkInData.length > 0;

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

      {/* Check-in chart (only if real data) */}
      {showChart && (
        <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="section-title">📈 Check-In Trend</div>
              <div className="section-subtitle">Hourly check-ins for today</div>
            </div>
          </div>
          <CheckInChart data={checkInData} />
        </div>
      )}

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
              <span style={{ fontSize: 12, fontWeight: 700, color: botStatus === "running" ? "#34d399" : "#f87171" }}>
                {botStatus === "running" ? "RUNNING" : "STOPPED"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-success" onClick={() => toggleBot("start")} disabled={botStatus === "running"} style={{ flex: 1, justifyContent: "center" }}>
              ▶ Start Bot
            </button>
            <button className="btn-danger" onClick={() => toggleBot("stop")} disabled={botStatus === "stopped"} style={{ flex: 1, justifyContent: "center" }}>
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
              <span style={{ fontSize: 12, fontWeight: 700, color: schedulerStatus?.status === "running" ? "#34d399" : "#f87171" }}>
                {loading ? "LOADING…" : (schedulerStatus?.status?.toUpperCase() ?? "STOPPED")}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-success" onClick={() => toggleScheduler("start")} disabled={schedulerStatus?.status === "running"} style={{ flex: 1, justifyContent: "center" }}>
              ▶ Start
            </button>
            <button className="btn-danger" onClick={() => toggleScheduler("stop")} disabled={schedulerStatus?.status !== "running"} style={{ flex: 1, justifyContent: "center" }}>
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
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 10 }} />)}
          </div>
        ) : (
          feed.map((a: any, i: number) => (
            <ActivityItem
              key={i}
              icon={a.icon || "📌"}
              text={a.text || a.message || String(a)}
              time={a.time || a.created_at || "—"}
              color={a.color || "#a855f7"}
            />
          ))
        )}
      </div>
    </div>
  );
}
