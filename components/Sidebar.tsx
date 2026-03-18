"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/dashboard/planner", icon: "🎓", label: "Event Planner" },
  { href: "/dashboard/website", icon: "🌐", label: "Website Builder" },
  { href: "/dashboard/branding", icon: "🎨", label: "Branding" },
  { href: "/dashboard/sponsors", icon: "🤝", label: "Sponsors" },
  { href: "/dashboard/attendees", icon: "👥", label: "Attendees" },
  { href: "/dashboard/wall", icon: "📷", label: "Social Wall" },
  { href: "/dashboard/complaints", icon: "🆘", label: "Help Desk" },
  { href: "/dashboard/schedule", icon: "📅", label: "Schedule" },
  { href: "/dashboard/post-event", icon: "🏆", label: "Post-Event" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "rgba(13,13,26,0.95)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 12px",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "8px 10px 24px" }}>
        <div
          className="gradient-text"
          style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}
        >
          PFL
        </div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 2, letterSpacing: 0.3 }}>
          Manage Events. Effortlessly.
        </div>
      </div>

      {/* Divider */}
      <div className="gradient-divider" style={{ marginBottom: 12 }} />

      {/* Nav items */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="gradient-divider" style={{ marginTop: 12, marginBottom: 12 }} />

      {/* Bottom */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Link href="/dashboard/settings" className="sidebar-item">
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
