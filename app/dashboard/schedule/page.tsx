"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

export default function SchedulePage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulerStatus, setSchedulerStatus] = useState<{ status: string; jobs?: any[] }>({ status: "stopped" });
  const [blasting, setBlasting] = useState<number | null>(null);
  const [toggling, setToggling] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ time: "", title: "", description: "", auto_announce: true });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    try {
      const [schedRes, slotsRes] = await Promise.allSettled([
        fetch(`${API}/api/scheduler/status`).then(r => r.json()),
        fetch(`${API}/api/schedule`).then(r => r.json()),
      ]);
      if (schedRes.status === "fulfilled") setSchedulerStatus(schedRes.value);
      if (slotsRes.status === "fulfilled") {
        const data = slotsRes.value;
        setSlots(Array.isArray(data) ? data : (data.slots ?? data.schedule ?? []));
      }
    } catch {
      showToast("Could not load schedule — backend offline?", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleScheduler = async (target: "start" | "stop") => {
    setToggling(true);
    try {
      await fetch(`${API}/api/scheduler/${target}`, { method: "POST" });
      setSchedulerStatus(s => ({ ...s, status: target === "start" ? "running" : "stopped" }));
      showToast(`Scheduler ${target === "start" ? "started" : "stopped"}`, target === "start" ? "success" : "info");
    } catch {
      showToast("Failed to control scheduler", "error");
    } finally {
      setToggling(false);
    }
  };

  const blast = async (slot: any) => {
    setBlasting(slot.id);
    try {
      await fetch(`${API}/api/scheduler/blast`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `📢 ${slot.title}: ${slot.description}`, at_time: slot.time }),
      });
      showToast(`Blast sent: ${slot.title} 📢`, "success");
    } catch {
      showToast("Backend unavailable — blast simulated!", "info");
    } finally {
      setBlasting(null);
    }
  };

  const toggleAutoAnnounce = async (id: number, current: boolean) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, auto_announce: !current } : s));
    try {
      await fetch(`${API}/api/schedule/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_announce: !current }),
      });
    } catch {
      // already updated locally, sync on next load
    }
  };

  const addSlot = async () => {
    if (!newSlot.time || !newSlot.title) { showToast("Time and title are required", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/schedule`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });
      const data = await res.json();
      const created = data.slot ?? data ?? { ...newSlot, id: Date.now() };
      setSlots(prev => [...prev, created].sort((a, b) => a.time.localeCompare(b.time)));
      showToast("Slot added! 📅", "success");
      setAddModal(false);
      setNewSlot({ time: "", title: "", description: "", auto_announce: true });
    } catch {
      // Optimistic add
      setSlots(prev => [...prev, { ...newSlot, id: Date.now() }].sort((a, b) => a.time.localeCompare(b.time)));
      showToast("Added locally (sync pending)", "info");
      setAddModal(false);
      setNewSlot({ time: "", title: "", description: "", auto_announce: true });
    } finally {
      setSaving(false);
    }
  };

  const isRunning = schedulerStatus.status === "running";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>📅</span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Schedule & Announcements</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: 14 }}>Manage event timeline and auto-announcement scheduler</p>
      </div>

      {/* Scheduler status card */}
      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <span className={`pulse-dot ${isRunning ? "pulse-dot-green" : "pulse-dot-red"}`} />
              <span style={{ fontWeight: 700, fontSize: 18, color: isRunning ? "#34d399" : "#f87171" }}>
                Scheduler {loading ? "…" : isRunning ? "Running" : "Stopped"}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              {slots.filter(s => s.auto_announce).length} slots set to auto-announce
              {schedulerStatus.jobs ? ` • ${schedulerStatus.jobs.length} jobs queued` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-success" onClick={() => toggleScheduler("start")} disabled={isRunning || toggling} style={{ padding: "10px 24px" }}>▶ Start</button>
            <button className="btn-danger" onClick={() => toggleScheduler("stop")} disabled={!isRunning || toggling} style={{ padding: "10px 24px" }}>⏹ Stop</button>
            <button className="btn-gradient" onClick={() => setAddModal(true)} style={{ padding: "10px 18px" }}>+ Add Slot</button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : slots.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No schedule slots yet</div>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Add your first slot to get started</div>
          <button className="btn-gradient" onClick={() => setAddModal(true)}>+ Add First Slot</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {slots.map((slot: any, idx: number) => (
            <div key={slot.id} style={{ display: "flex", gap: 0 }}>
              {/* Timeline indicator */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 60, flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: slot.auto_announce ? "linear-gradient(135deg,#a855f7,#3b82f6)" : "rgba(255,255,255,0.06)",
                  border: `2px solid ${slot.auto_announce ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: slot.auto_announce ? "white" : "#475569", zIndex: 1,
                }}>
                  {slot.auto_announce ? "📢" : "○"}
                </div>
                {idx < slots.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0", minHeight: 40 }} />
                )}
              </div>

              {/* Content */}
              <div className="glass glass-hover" style={{ flex: 1, padding: "16px 20px", margin: "0 0 12px 8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", fontFamily: "JetBrains Mono, monospace" }}>{slot.time}</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{slot.title}</span>
                      {slot.auto_announce && <span className="badge badge-purple">AUTO</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{slot.description}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>📢 Auto</span>
                      <label className="toggle">
                        <input type="checkbox" checked={!!slot.auto_announce}
                          onChange={() => toggleAutoAnnounce(slot.id, slot.auto_announce)} />
                        <span className="toggle-slider" />
                      </label>
                    </label>
                    <button className="btn-outline" style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}
                      onClick={() => blast(slot)} disabled={blasting === slot.id}>
                      {blasting === slot.id ? "Sending…" : "🚀 Blast Now"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Slot Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>📅 Add Schedule Slot</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Add a new activity to the event timeline</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Time *</label>
                <input className="input-glass" type="time" value={newSlot.time}
                  onChange={e => setNewSlot(s => ({ ...s, time: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Title *</label>
                <input className="input-glass" placeholder="e.g. Opening Ceremony" value={newSlot.title}
                  onChange={e => setNewSlot(s => ({ ...s, title: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Description</label>
              <input className="input-glass" placeholder="Brief description of this slot" value={newSlot.description}
                onChange={e => setNewSlot(s => ({ ...s, description: e.target.value }))} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <label className="toggle">
                <input type="checkbox" checked={newSlot.auto_announce}
                  onChange={e => setNewSlot(s => ({ ...s, auto_announce: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>📢 Auto-announce via Telegram bot</span>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-outline" onClick={() => setAddModal(false)}>Cancel</button>
              <button className="btn-gradient" onClick={addSlot} disabled={saving}>
                {saving ? "Saving…" : "Add Slot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
