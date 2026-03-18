import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { BotPill } from "@/components/BotPill";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          marginLeft: 240,
          flex: 1,
          padding: "32px",
          background: "#07070f",
          minHeight: "100vh",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* Subtle background radial glow */}
        <div style={{
          position: "fixed",
          top: 0, right: 0,
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />
        <div style={{
          position: "fixed",
          bottom: 0, left: 240,
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Topbar />
          {children}
        </div>

        {/* Floating bot pill — visible on every dashboard page */}
        <BotPill />
      </main>
    </div>
  );
}
