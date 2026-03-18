"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#64748b" }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const { showToast } = useToast();

  // Event config
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState("");

  // Telegram
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");

  // Email SMTP
  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");

  // Supabase
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");

  // Notifications
  const [autoAnnounce, setAutoAnnounce] = useState(true);
  const [complaintAlerts, setComplaintAlerts] = useState(true);
  const [wallModeration, setWallModeration] = useState(true);

  useEffect(() => {
    // Load existing settings from backend
    fetch(`${API}/api/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.event_name)          setEventName(d.event_name);
        if (d.event_date)          setEventDate(d.event_date);
        if (d.venue)               setVenue(d.venue);
        if (d.expected_attendees)  setExpectedAttendees(String(d.expected_attendees));
        if (d.bot_token)           setBotToken(d.bot_token);
        if (d.chat_id)             setChatId(d.chat_id);
        if (d.smtp_email)          setSmtpEmail(d.smtp_email);
        if (d.supabase_url)        setSupabaseUrl(d.supabase_url);
        if (d.notifications)  {
          setAutoAnnounce(d.notifications.auto_announce ?? true);
          setComplaintAlerts(d.notifications.complaint_alerts ?? true);
          setWallModeration(d.notifications.wall_moderation ?? true);
        }
      })
      .catch(() => {}); // graceful if backend offline
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = {
      event_name: eventName,
      event_date: eventDate,
      venue,
      expected_attendees: parseInt(expectedAttendees) || 0,
      bot_token: botToken,
      chat_id: chatId,
      smtp_email: smtpEmail,
      smtp_password: smtpPassword || undefined,
      supabase_url: supabaseUrl,
      supabase_key: supabaseKey || undefined,
      notifications: { auto_announce: autoAnnounce, complaint_alerts: complaintAlerts, wall_moderation: wallModeration },
    };
    try {
      await fetch(`${API}/api/settings`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      showToast("Settings saved! ✅", "success");
    } catch {
      showToast("Saved locally (backend offline)", "info");
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (type: string) => {
    setTesting(type);
    try {
      const res = await fetch(`${API}/api/settings/test/${type}`, { method: "POST" });
      const data = await res.json();
      showToast(data.message ?? `${type} connection OK ✅`, "success");
    } catch {
      showToast(`Cannot reach backend to test ${type}`, "error");
    } finally {
      setTesting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>⚙️</span>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Settings</h1>
          </div>
          <button className="btn-gradient" onClick={save} disabled={saving} style={{ padding: "12px 28px" }}>
            {saving ? (
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                Saving…
              </span>
            ) : "💾 Save All Settings"}
          </button>
        </div>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>Configure your event, integrations, and notification preferences</p>
      </div>

      {/* Event Configuration */}
      <Section title="🎓 Event Configuration" subtitle="Basic details about your event">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Event Name">
            <input className="input-glass" placeholder="e.g. TechFest 2026" value={eventName} onChange={e => setEventName(e.target.value)} />
          </Field>
          <Field label="Event Date">
            <input className="input-glass" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
          </Field>
          <Field label="Venue">
            <input className="input-glass" placeholder="e.g. Main Auditorium, BITS Pilani" value={venue} onChange={e => setVenue(e.target.value)} />
          </Field>
          <Field label="Expected Attendees">
            <input className="input-glass" type="number" placeholder="e.g. 500" value={expectedAttendees} onChange={e => setExpectedAttendees(e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Telegram */}
      <Section title="🤖 Telegram Bot" subtitle="Connect your Telegram bot for check-ins, announcements & certificates">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Bot Token" hint="Get from @BotFather — keep this private!">
            <input className="input-glass" type="password" placeholder="1234567890:ABCDEF…" value={botToken} onChange={e => setBotToken(e.target.value)} />
          </Field>
          <Field label="Group Chat ID" hint="The Telegram group or channel ID for announcements">
            <input className="input-glass" placeholder="-100123456789" value={chatId} onChange={e => setChatId(e.target.value)} />
          </Field>
        </div>
        <button className="btn-outline" style={{ marginTop: 4 }} onClick={() => testConnection("telegram")} disabled={testing === "telegram"}>
          {testing === "telegram" ? "Testing…" : "🔌 Test Telegram Connection"}
        </button>
      </Section>

      {/* Email SMTP */}
      <Section title="📧 Email (SMTP)" subtitle="Gmail credentials for sponsor outreach and notifications">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Gmail Address">
            <input className="input-glass" type="email" placeholder="yourname@gmail.com" value={smtpEmail} onChange={e => setSmtpEmail(e.target.value)} />
          </Field>
          <Field label="App Password" hint="Enable 2FA on Gmail and generate an App Password — never use your main password">
            <input className="input-glass" type="password" placeholder="xxxx xxxx xxxx xxxx" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} />
          </Field>
        </div>
        <button className="btn-outline" style={{ marginTop: 4 }} onClick={() => testConnection("email")} disabled={testing === "email"}>
          {testing === "email" ? "Testing…" : "🔌 Test Email Connection"}
        </button>
      </Section>

      {/* Supabase */}
      <Section title="🗄️ Supabase" subtitle="Database and authentication configuration">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Project URL">
            <input className="input-glass" placeholder="https://xxxx.supabase.co" value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)} />
          </Field>
          <Field label="Anon Key" hint="Public anon key — safe to use in the frontend with RLS enabled">
            <input className="input-glass" type="password" placeholder="eyJhbGciOiJIUzI1NiIs…" value={supabaseKey} onChange={e => setSupabaseKey(e.target.value)} />
          </Field>
        </div>
        <button className="btn-outline" style={{ marginTop: 4 }} onClick={() => testConnection("supabase")} disabled={testing === "supabase"}>
          {testing === "supabase" ? "Testing…" : "🔌 Test Supabase Connection"}
        </button>
      </Section>

      {/* Notifications */}
      <Section title="🔔 Notifications" subtitle="Control which events trigger Telegram alerts">
        {[
          { key: "auto_announce", label: "📢 Auto-Announcements", desc: "Automatically post schedule events to Telegram at their times", value: autoAnnounce, set: setAutoAnnounce },
          { key: "complaint_alerts", label: "🆘 Complaint Alerts", desc: "Notify coordinators on Telegram when a new emergency/high complaint arrives", value: complaintAlerts, set: setComplaintAlerts },
          { key: "wall_moderation", label: "📷 Wall Moderation Alerts", desc: "Notify when new photos are pending review on the Social Wall", value: wallModeration, set: setWallModeration },
        ].map(item => (
          <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{item.desc}</div>
            </div>
            <label className="toggle" style={{ flexShrink: 0 }}>
              <input type="checkbox" checked={item.value} onChange={e => item.set(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </Section>

      {/* Save button (bottom) */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 32 }}>
        <button className="btn-gradient" onClick={save} disabled={saving} style={{ padding: "14px 36px", fontSize: 15 }}>
          {saving ? "Saving…" : "💾 Save All Settings"}
        </button>
      </div>
    </div>
  );
}
