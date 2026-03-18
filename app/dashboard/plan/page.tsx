"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

interface PlanField {
  key: string;
  value: any;
  editing: boolean;
}

export default function PlanEditorPage() {
  const [plan, setPlan] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rawMode, setRawMode] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const { showToast } = useToast();

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/plan`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlan(data);
      setRawJson(JSON.stringify(data, null, 2));
    } catch {
      // Demo fallback plan
      const demo: Record<string, any> = {
        event_name: "TechFest 2026",
        event_type: "techfest",
        date: "2026-04-15",
        venue: "Main Auditorium, BITS Pilani",
        expected_attendees: 500,
        prize_pool: "₹5,00,000",
        registration_deadline: "2026-04-10",
        schedule: [
          { time: "09:00", title: "Opening Ceremony", duration: "1h" },
          { time: "10:00", title: "Technical Events Begin", duration: "6h" },
          { time: "16:00", title: "Cultural Program", duration: "2h" },
          { time: "18:00", title: "Prize Distribution & Closing", duration: "1h" },
        ],
        contact: {
          organizer: "Prince Singh",
          email: "organizer@techfest.com",
          phone: "+91-9876543210",
        },
        sponsors: {
          platinum: ["Tech Corp India"],
          gold: ["InnovateTech", "DevHub"],
          silver: ["CodeBase", "DataFlow"],
        },
        website_url: "https://techfest2026.vercel.app",
        registration_url: "https://techfest2026.vercel.app/register",
        telegram_group: "@techfest2026",
      };
      setPlan(demo);
      setRawJson(JSON.stringify(demo, null, 2));
      showToast("Showing demo plan — connect backend for real data", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlan(); }, []);

  const updateField = (key: string, value: any) => {
    setPlan(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [key]: value };
      setRawJson(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const savePlan = async () => {
    setSaving(true);
    let dataToSave = plan;

    if (rawMode) {
      try {
        dataToSave = JSON.parse(rawJson);
        setPlan(dataToSave);
        setJsonError("");
      } catch {
        setJsonError("Invalid JSON — please fix syntax errors before saving");
        setSaving(false);
        return;
      }
    }

    try {
      await fetch(`${API}/api/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
      showToast("Plan saved! ✅", "success");
    } catch {
      showToast("Saved locally (backend offline)", "info");
    } finally {
      setSaving(false);
    }
  };

  const renderValue = (key: string, value: any): React.ReactNode => {
    if (typeof value === "object" && value !== null) {
      return (
        <div style={{
          background: "rgba(168,85,247,0.05)",
          border: "1px solid rgba(168,85,247,0.15)",
          borderRadius: 10,
          padding: "12px 14px",
          fontSize: 13,
          color: "#94a3b8",
          fontFamily: "JetBrains Mono, monospace",
          lineHeight: 1.7,
        }}>
          {JSON.stringify(value, null, 2)}
        </div>
      );
    }
    if (typeof value === "number") {
      return (
        <input
          className="input-glass"
          type="number"
          value={value}
          onChange={e => updateField(key, parseFloat(e.target.value) || 0)}
        />
      );
    }
    // detect date
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return (
        <input
          className="input-glass"
          type="date"
          value={value}
          onChange={e => updateField(key, e.target.value)}
        />
      );
    }
    return (
      <input
        className="input-glass"
        value={String(value)}
        onChange={e => updateField(key, e.target.value)}
      />
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>📋</span>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Plan Editor</h1>
            </div>
            <p style={{ color: "#64748b", fontSize: 14 }}>View and edit your finalized event plan details</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="btn-outline"
              style={{ fontSize: 13, padding: "8px 16px" }}
              onClick={() => setRawMode(!rawMode)}
            >
              {rawMode ? "📋 Form View" : "{ } JSON View"}
            </button>
            <button className="btn-outline" onClick={fetchPlan} disabled={loading} style={{ fontSize: 13, padding: "8px 14px" }}>
              🔄 Refresh
            </button>
            <button className="btn-gradient" onClick={savePlan} disabled={saving} style={{ padding: "10px 24px" }}>
              {saving ? (
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  Saving…
                </span>
              ) : "💾 Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />
          ))}
        </div>
      ) : rawMode ? (
        /* Raw JSON editor */
        <div className="glass" style={{ padding: 4, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>JSON EDITOR</span>
            {jsonError && <span style={{ fontSize: 12, color: "#f87171" }}>⚠ {jsonError}</span>}
          </div>
          <textarea
            value={rawJson}
            onChange={e => {
              setRawJson(e.target.value);
              try { JSON.parse(e.target.value); setJsonError(""); } catch { setJsonError("Invalid JSON"); }
            }}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 520, background: "transparent",
              color: "#c4b5fd", fontFamily: "JetBrains Mono, monospace",
              fontSize: 13, lineHeight: 1.7, padding: 20, border: "none",
              outline: "none", resize: "vertical",
              borderTop: jsonError ? "2px solid rgba(239,68,68,0.4)" : "none",
            }}
          />
        </div>
      ) : plan ? (
        /* Form view */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Top-level scalars */}
          <div className="glass" style={{ padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>🎯 Event Details</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Core information about your event</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {Object.entries(plan)
                .filter(([, v]) => typeof v !== "object")
                .map(([key, value]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {key.replace(/_/g, " ")}
                    </label>
                    {renderValue(key, value)}
                  </div>
                ))}
            </div>
          </div>

          {/* Nested objects */}
          {Object.entries(plan)
            .filter(([, v]) => typeof v === "object" && v !== null)
            .map(([key, value]) => (
              <div key={key} className="glass" style={{ padding: 28 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, textTransform: "capitalize" }}>
                  📁 {key.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                  {Array.isArray(value) ? `${value.length} items` : `${Object.keys(value).length} fields`}
                </div>
                {renderValue(key, value)}
              </div>
            ))}
        </div>
      ) : (
        <div className="glass" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No plan found</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>
            Complete the AI Event Planner to generate a plan, or connect the backend.
          </div>
        </div>
      )}
    </div>
  );
}
