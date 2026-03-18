"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const PAGE_META: Record<string, { label: string; icon: string; desc: string }> = {
  "/dashboard":              { label: "Dashboard",        icon: "📊", desc: "Real-time event health overview" },
  "/dashboard/planner":      { label: "Event Planner",    icon: "🎓", desc: "AI-powered event architecture" },
  "/dashboard/website":      { label: "Website Builder",  icon: "🌐", desc: "Design & deploy your event site" },
  "/dashboard/branding":     { label: "Branding",         icon: "🎨", desc: "Generate posters and QR codes" },
  "/dashboard/sponsors":     { label: "Sponsors",         icon: "🤝", desc: "Outreach, emails & call lists" },
  "/dashboard/attendees":    { label: "Attendees",        icon: "👥", desc: "Directory and check-in management" },
  "/dashboard/wall":         { label: "Social Wall",      icon: "📷", desc: "Moderate attendee photo submissions" },
  "/dashboard/complaints":   { label: "Help Desk",        icon: "🆘", desc: "Track and resolve issues in real-time" },
  "/dashboard/schedule":     { label: "Schedule",         icon: "📅", desc: "Timeline and auto-announcements" },
  "/dashboard/post-event":   { label: "Post-Event",       icon: "🏆", desc: "Certificates, feedback & ROI report" },
  "/dashboard/settings":     { label: "Settings",         icon: "⚙️", desc: "Configure integrations and preferences" },
};

export function Topbar() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? { label: "Dashboard", icon: "📊", desc: "" };
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(7,7,15,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 32px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 32,
      marginLeft: -32,
      marginRight: -32,
      marginTop: -32,
    }}>
      {/* Left: page title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22 }}>{meta.icon}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>{meta.label}</div>
          {meta.desc && <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{meta.desc}</div>}
        </div>
      </div>

      {/* Right: clock + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Live clock */}
        <div style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 13,
          color: "#64748b",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "5px 12px",
        }}>
          🕐 {time}
        </div>

        {/* Status pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: 20, padding: "5px 12px",
        }}>
          <span className="pulse-dot pulse-dot-green" style={{ width: 7, height: 7 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#34d399" }}>LIVE</span>
        </div>

        {/* User avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #a855f7, #3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "white",
          cursor: "pointer",
          boxShadow: "0 0 16px rgba(168,85,247,0.35)",
        }}>
          P
        </div>
      </div>
    </header>
  );
}
