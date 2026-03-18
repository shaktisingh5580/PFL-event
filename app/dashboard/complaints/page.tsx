"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

const SEVERITY_MAP: Record<string, { cls: string; icon: string; label: string; border: string }> = {
  emergency: { cls: "severity-emergency", icon: "🔴", label: "Emergency", border: "#ef4444" },
  high:      { cls: "severity-high",      icon: "🟠", label: "High",      border: "#f97316" },
  medium:    { cls: "severity-medium",    icon: "🟡", label: "Medium",    border: "#f59e0b" },
  low:       { cls: "severity-low",       icon: "🟢", label: "Low",       border: "#10b981" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Technical: "badge-blue", Facilities: "badge-purple", Catering: "badge-yellow",
  Registration: "badge-cyan", Security: "badge-red",
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [resolving, setResolving] = useState<number | null>(null);
  const { showToast } = useToast();

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/complaints`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : (data.complaints ?? []));
    } catch {
      showToast("Could not load complaints — backend offline?", "error");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    const iv = setInterval(loadComplaints, 15000); // poll every 15s
    return () => clearInterval(iv);
  }, []);

  const resolve = async (id: number) => {
    setResolving(id);
    try {
      await fetch(`${API}/api/complaints/${id}/resolve`, { method: "PATCH" });
      setComplaints(prev => prev.filter(c => c.id !== id));
      showToast("Complaint resolved ✅", "success");
    } catch {
      setComplaints(prev => prev.filter(c => c.id !== id));
      showToast("Resolved locally (sync pending)", "success");
    } finally {
      setResolving(null);
    }
  };

  const filtered = filterSeverity === "all" ? complaints : complaints.filter(c => c.severity === filterSeverity);

  const catCounts = complaints.reduce((acc, c) => {
    const cat = c.category ?? "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const maxCat = Math.max(...Object.values(catCounts) as number[], 1);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>🆘</span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Help Desk</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: 14 }}>Track and resolve attendee complaints in real-time</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Main complaints list */}
        <div>
          {/* Severity filter + refresh */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {["all", "emergency", "high", "medium", "low"].map(s => (
              <button key={s} onClick={() => setFilterSeverity(s)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "1px solid",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                  background: filterSeverity === s ? "rgba(168,85,247,0.2)" : "transparent",
                  borderColor: filterSeverity === s ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.1)",
                  color: filterSeverity === s ? "#c084fc" : "#64748b",
                }}>
                {s === "all" ? "All Severities" : (SEVERITY_MAP[s]?.icon + " " + SEVERITY_MAP[s]?.label)}
              </button>
            ))}
            <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
              <div className="badge badge-red">{filtered.length} Open</div>
              <button className="btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={loadComplaints} disabled={loading}>
                🔄
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.length === 0 && (
                <div className="glass" style={{ padding: 40, textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontWeight: 700 }}>
                    {complaints.length === 0 ? "No complaints in the system!" : "No open complaints for this severity!"}
                  </div>
                </div>
              )}
              {filtered.map(c => {
                const sev = SEVERITY_MAP[c.severity] ?? SEVERITY_MAP.low;
                return (
                  <div key={c.id} className="glass" style={{ padding: 20, borderLeft: `3px solid ${sev.border}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span className={`badge ${sev.cls}`}>{sev.icon} {sev.label}</span>
                          <span className={`badge ${CATEGORY_COLORS[c.category] ?? "badge-purple"}`}>{c.category ?? "General"}</span>
                          <span style={{ fontSize: 11, color: "#475569" }}>{c.time ?? c.created_at ?? "—"}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 6 }}>{c.title}</div>
                        <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{c.description}</div>
                      </div>
                      <button className="btn-success" style={{ flexShrink: 0, padding: "7px 16px" }}
                        onClick={() => resolve(c.id)} disabled={resolving === c.id}>
                        {resolving === c.id ? "…" : "Resolve"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="glass" style={{ padding: 20, height: "fit-content" }}>
          <div className="section-title" style={{ marginBottom: 16 }}>📊 By Category</div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 32, borderRadius: 6 }} />)}
            </div>
          ) : Object.keys(catCounts).length === 0 ? (
            <div style={{ color: "#475569", fontSize: 13 }}>No data yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(catCounts).map(([cat, count]) => (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{cat}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#c084fc" }}>{count as number}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${((count as number) / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="gradient-divider" style={{ marginTop: 20, marginBottom: 20 }} />
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8 }}>
            🔴 Emergency: Escalate immediately<br />
            🟠 High: Resolve within 15 min<br />
            🟡 Medium: Resolve within 1 hr<br />
            🟢 Low: Resolve by end of day
          </div>
        </div>
      </div>
    </div>
  );
}
