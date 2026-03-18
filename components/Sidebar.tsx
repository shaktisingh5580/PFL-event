"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS = [
  {
    label: "MANAGEMENT",
    items: [
      { href: "/dashboard",            icon: "📊", label: "Dashboard" },
      { href: "/dashboard/planner",    icon: "🎓", label: "Event Planner" },
      { href: "/dashboard/plan",       icon: "📋", label: "Plan Editor" },
      { href: "/dashboard/attendees",  icon: "👥", label: "Attendees" },
      { href: "/dashboard/schedule",   icon: "📅", label: "Schedule" },
    ],
  },
  {
    label: "MARKETING",
    items: [
      { href: "/dashboard/website",    icon: "🌐", label: "Website Builder" },
      { href: "/dashboard/branding",   icon: "🎨", label: "Branding" },
      { href: "/dashboard/sponsors",   icon: "🤝", label: "Sponsors" },
    ],
  },
  {
    label: "LIVE EVENT",
    items: [
      { href: "/dashboard/wall",       icon: "📷", label: "Social Wall" },
      { href: "/dashboard/complaints", icon: "🆘", label: "Help Desk" },
    ],
  },
  {
    label: "WRAP-UP",
    items: [
      { href: "/dashboard/post-event", icon: "🏆", label: "Post-Event" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      background: "rgba(7,7,15,0.98)",
      backdropFilter: "blur(20px)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      padding: "0 10px",
      position: "fixed",
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 10px 20px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {/* Logo mark */}
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #a855f7, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 16, color: "white",
            boxShadow: "0 0 20px rgba(168,85,247,0.4)",
            flexShrink: 0,
          }}>P</div>
          <div>
            <div className="gradient-text" style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>PFL</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 0.3, marginTop: 1 }}>Event Management</div>
          </div>
        </div>
      </div>

      <div className="gradient-divider" style={{ marginBottom: 8, marginLeft: 10, marginRight: 10 }} />

      {/* Nav sections */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 4 }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 4 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#334155",
              letterSpacing: "0.1em", padding: "10px 14px 4px",
            }}>
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className={`sidebar-item ${active ? "active" : ""}`}>
                  <span style={{
                    fontSize: 16,
                    filter: active ? "none" : "grayscale(0.3)",
                    transition: "filter 0.15s",
                  }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {active && (
                    <span style={{
                      marginLeft: "auto",
                      width: 6, height: 6,
                      borderRadius: "50%",
                      background: "#a855f7",
                      boxShadow: "0 0 8px #a855f7",
                    }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="gradient-divider" style={{ marginTop: 8, marginBottom: 8, marginLeft: 10, marginRight: 10 }} />

      {/* Bottom */}
      <div style={{ padding: "4px 0 20px", display: "flex", flexDirection: "column", gap: 2 }}>
        <Link href="/dashboard/settings" className={`sidebar-item ${pathname === "/dashboard/settings" ? "active" : ""}`}>
          <span style={{ fontSize: 16 }}>⚙️</span>
          <span>Settings</span>
        </Link>
        <Link href="/login" className="sidebar-item" style={{ color: "#f87171" }}>
          <span style={{ fontSize: 16 }}>🚪</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
