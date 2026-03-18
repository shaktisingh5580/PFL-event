"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

const TIER_CLASSES: Record<string, string> = {
  Platinum: "tier-platinum", Gold: "tier-gold", Silver: "tier-silver", Bronze: "tier-bronze",
};

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailModal, setEmailModal] = useState(false);
  const [previewEmail, setPreviewEmail] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendModal, setSendModal] = useState(false);
  const [fromEmail, setFromEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [callListOpen, setCallListOpen] = useState(false);
  const { showToast } = useToast();

  const fetchSponsors = async (etype: string) => {
    setLoading(true);
    try {
      const url = etype === "all" ? `${API}/api/sponsors` : `${API}/api/sponsors?event_type_id=${etype}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSponsors(Array.isArray(data) ? data : (data.sponsors ?? []));
    } catch {
      showToast("Could not load sponsors — backend offline?", "error");
      setSponsors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSponsors("all"); }, []);

  const filtered = filterType === "all" ? sponsors : sponsors.filter(s => s.event_type_id === filterType);

  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === filtered.length ? [] : filtered.map(s => s.id));

  const openPreview = async () => {
    setEmailModal(true);
    setPreviewLoading(true);
    try {
      const res = await fetch(`${API}/api/sponsors/preview-email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsor_ids: selected }),
      });
      const data = await res.json();
      setPreviewEmail(data.email ?? data.preview ?? "Could not load preview.");
    } catch {
      setPreviewEmail("Backend unavailable — please start FastAPI server to preview AI-drafted emails.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const sendEmails = async () => {
    if (!fromEmail || !appPassword) { showToast("Please enter email and app password", "error"); return; }
    setSending(true);
    try {
      const res = await fetch(`${API}/api/sponsors/send-emails`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsor_ids: selected, from_email: fromEmail, app_password: appPassword }),
      });
      if (!res.ok) throw new Error();
      showToast(`Emails sent to ${selected.length} sponsors! 📧`, "success");
      setSendModal(false); setSelected([]);
    } catch {
      showToast("Failed to send emails", "error");
    } finally {
      setSending(false);
    }
  };

  const callList = filtered.filter(s => s.phone);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>🤝</span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Sponsors</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: 14 }}>Manage sponsor outreach, email campaigns & call lists</p>
      </div>

      {/* Filters + Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select className="input-glass" style={{ width: 200 }} value={filterType}
          onChange={e => { setFilterType(e.target.value); fetchSponsors(e.target.value); }}>
          <option value="all">All Event Types</option>
          <option value="techfest">TechFest</option>
          <option value="hackathon">Hackathon</option>
          <option value="cultural">Cultural Fest</option>
          <option value="sports">Sports Event</option>
          <option value="conference">Conference</option>
        </select>
        <div className="badge badge-purple">{filtered.length} sponsors</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button className="btn-outline" onClick={() => fetchSponsors(filterType)} disabled={loading}>🔄 Refresh</button>
          {selected.length > 0 && (
            <>
              <button className="btn-outline" onClick={openPreview}>📧 Preview Email ({selected.length})</button>
              <button className="btn-gradient" onClick={() => setSendModal(true)}>📤 Send Selected</button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass" style={{ marginBottom: 16, overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>No sponsors found</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Add sponsors via the backend or try a different filter</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={toggleAll}
                  checked={selected.length === filtered.length && filtered.length > 0}
                  style={{ accentColor: "#a855f7" }} /></th>
                <th>Company</th><th>Industry</th><th>Tier</th><th>Email</th><th>Phone</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.id}>
                  <td><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} style={{ accentColor: "#a855f7" }} /></td>
                  <td style={{ fontWeight: 600, color: "#f1f5f9" }}>{s.company}</td>
                  <td>{s.industry}</td>
                  <td><span className={`badge ${TIER_CLASSES[s.tier] ?? "badge-purple"}`}>{s.tier}</span></td>
                  <td><a href={`mailto:${s.email}`} style={{ color: "#60a5fa", textDecoration: "none" }}>{s.email}</a></td>
                  <td style={{ color: s.phone ? "#f1f5f9" : "#475569" }}>{s.phone || "—"}</td>
                  <td>
                    <button className="btn-outline" style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={() => { setSelected([s.id]); openPreview(); }}>
                      Draft Email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Call list accordion */}
      <div className="glass" style={{ overflow: "hidden" }}>
        <button className="btn-outline"
          style={{ width: "100%", borderRadius: 0, border: "none", borderBottom: callListOpen ? "1px solid rgba(255,255,255,0.06)" : "none", padding: "14px 20px", justifyContent: "space-between" }}
          onClick={() => setCallListOpen(!callListOpen)}>
          <span>📞 Call List ({callList.length} contacts with phone numbers)</span>
          <span>{callListOpen ? "▲" : "▼"}</span>
        </button>
        {callListOpen && (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {callList.length === 0 ? (
              <div style={{ color: "#475569", fontSize: 13 }}>No sponsors have phone numbers on record.</div>
            ) : callList.map((s: any) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                <span className={`badge ${TIER_CLASSES[s.tier]}`}>{s.tier}</span>
                <span style={{ fontWeight: 600, color: "#f1f5f9", flex: 1 }}>{s.company}</span>
                <a href={`tel:${s.phone}`} style={{ color: "#60a5fa", textDecoration: "none", fontSize: 14 }}>{s.phone}</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email preview modal */}
      {emailModal && (
        <div className="modal-overlay" onClick={() => setEmailModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>📧 AI Email Preview</div>
            {previewLoading ? (
              <div style={{ display: "flex", gap: 5, justifyContent: "center", padding: 40 }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            ) : (
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#94a3b8", background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 10, marginBottom: 16, fontFamily: "Inter,sans-serif", lineHeight: 1.7 }}>
                {previewEmail}
              </pre>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-outline" onClick={() => setEmailModal(false)}>Close</button>
              <button className="btn-gradient" onClick={() => { setEmailModal(false); setSendModal(true); }}>Send →</button>
            </div>
          </div>
        </div>
      )}

      {/* Send modal */}
      {sendModal && (
        <div className="modal-overlay" onClick={() => setSendModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>📤 Send Emails</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Configure your Gmail SMTP credentials to send</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>From Email</label>
              <input className="input-glass" type="email" placeholder="yourname@gmail.com" value={fromEmail} onChange={e => setFromEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>App Password</label>
              <input className="input-glass" type="password" placeholder="••••••••••••••••" value={appPassword} onChange={e => setAppPassword(e.target.value)} />
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Use a Gmail App Password, not your account password</div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-outline" onClick={() => setSendModal(false)}>Cancel</button>
              <button className="btn-gradient" onClick={sendEmails} disabled={sending}>
                {sending ? "Sending…" : `Send to ${selected.length} Sponsors`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
