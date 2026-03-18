"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

const TAG_COLORS = ["badge-purple", "badge-blue", "badge-cyan", "badge-green", "badge-yellow", "badge-orange"];
function getTagColor(key: string) {
  return TAG_COLORS[key.charCodeAt(0) % TAG_COLORS.length];
}

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "email" | "checked_in">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { showToast } = useToast();

  const loadAttendees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/attendees`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAttendees(Array.isArray(data) ? data : data.attendees ?? []);
    } catch {
      showToast("Could not load attendees — backend offline?", "error");
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAttendees(); }, []);

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Checked In", "Dynamic Fields"];
    const rows = filtered.map((a: any) => [a.id, a.name, a.email, a.checked_in ? "Yes" : "No", JSON.stringify(a.dynamic_fields ?? {})]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "attendees.csv"; a.click();
    showToast("CSV exported!", "success");
  };

  const toggleCheckIn = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`${API}/api/attendees/${id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked_in: !current }),
      });
      if (!res.ok) throw new Error();
      setAttendees(prev => prev.map(a => a.id === id ? { ...a, checked_in: !current } : a));
      showToast("Check-in status updated ✅", "success");
    } catch {
      // Optimistic local update if backend call fails
      setAttendees(prev => prev.map(a => a.id === id ? { ...a, checked_in: !current } : a));
      showToast("Updated locally (backend offline)", "info");
    }
  };

  const filtered = attendees
    .filter((a: any) =>
      (a.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.email ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => {
      let va = a[sortKey]; let vb = b[sortKey];
      if (typeof va === "boolean") va = va ? 1 : 0 as any;
      if (typeof vb === "boolean") vb = vb ? 1 : 0 as any;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

  const sort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };
  const SortIcon = ({ k }: { k: string }) => <>{sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"}</>;

  const total = attendees.length;
  const checkedIn = attendees.filter((a: any) => a.checked_in).length;
  const pending = total - checkedIn;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>👥</span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Attendees Directory</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: 14 }}>Search, sort, and manage all event attendees</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Registered", value: total, color: "#a855f7" },
          { label: "Checked In", value: checkedIn, color: "#10b981" },
          { label: "Pending Check-In", value: pending, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ padding: "16px 20px", borderLeft: `3px solid ${color}` }}>
            {loading ? <div className="skeleton" style={{ height: 28, width: 60, marginBottom: 6 }} /> : (
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{value}</div>
            )}
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search + Refresh + Export */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input className="input-glass" placeholder="🔍 Search by name or email…" value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <button className="btn-outline" onClick={loadAttendees} disabled={loading}>🔄 Refresh</button>
        <button className="btn-outline" onClick={exportCSV} disabled={loading || attendees.length === 0}>⬇️ Export CSV</button>
      </div>

      {/* Table */}
      <div className="glass" style={{ overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              {attendees.length === 0 ? "No attendees yet" : "No results found"}
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              {attendees.length === 0 ? "Attendees will appear here once they register" : "Try a different search term"}
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => sort("name")} style={{ cursor: "pointer" }}>Name<SortIcon k="name" /></th>
                <th onClick={() => sort("email")} style={{ cursor: "pointer" }}>Email<SortIcon k="email" /></th>
                <th onClick={() => sort("checked_in")} style={{ cursor: "pointer" }}>Status<SortIcon k="checked_in" /></th>
                <th>Fields</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a: any) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: "#f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg,#a855f7,#3b82f6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0,
                      }}>
                        {(a.name ?? "?")[0].toUpperCase()}
                      </div>
                      {a.name}
                    </div>
                  </td>
                  <td><a href={`mailto:${a.email}`} style={{ color: "#60a5fa", textDecoration: "none" }}>{a.email}</a></td>
                  <td>
                    <span className={`badge ${a.checked_in ? "badge-green" : "badge-yellow"}`}>
                      {a.checked_in ? "✅ Checked In" : "⏳ Pending"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {Object.entries(a.dynamic_fields ?? {}).map(([k, v]) => (
                        <span key={k} className={`badge ${getTagColor(k)}`} style={{ fontSize: 11 }}>
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      className={a.checked_in ? "btn-danger" : "btn-success"}
                      style={{ padding: "5px 12px", fontSize: 12 }}
                      onClick={() => toggleCheckIn(a.id, a.checked_in)}
                    >
                      {a.checked_in ? "Undo" : "Check In"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
