"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast("Logged in successfully!", "success");
      window.location.href = "/dashboard";
    } catch (err: any) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    setEmail("demo@pfl.events");
    setPassword("demo1234");
    showToast("Demo credentials filled!", "info");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#07070f",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Grid overlay */}
      <div className="login-grid" />

      <div style={{ width: "100%", maxWidth: 440, padding: 20, position: "relative", zIndex: 2 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #a855f7, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 26, color: "white",
            margin: "0 auto 16px",
            boxShadow: "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(168,85,247,0.15)",
          }}>P</div>
          <div className="gradient-text" style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1 }}>PFL</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 6, letterSpacing: 0.3 }}>Manage Events. Effortlessly.</div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: 40,
          backdropFilter: "blur(30px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.1)",
        }}>
          <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Welcome back 👋</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 28 }}>Sign in to your organizer account</div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Email address</label>
              <input
                className="input-glass"
                type="email"
                placeholder="organizer@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ fontSize: 15 }}
              />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Password</label>
                <span style={{ fontSize: 12, color: "#a855f7", cursor: "pointer" }}>Forgot?</span>
              </div>
              <input
                className="input-glass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ fontSize: 15 }}
              />
            </div>

            <button
              type="submit"
              className="btn-gradient"
              disabled={loading}
              style={{ justifyContent: "center", padding: "14px 20px", marginTop: 4, fontSize: 15, borderRadius: 12 }}
            >
              {loading ? (
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 12, color: "#334155" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          <button
            type="button"
            onClick={demoLogin}
            className="btn-outline"
            style={{ width: "100%", justifyContent: "center", padding: "12px 20px", fontSize: 14 }}
          >
            🚀 Use Demo Credentials
          </button>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "#334155" }}>
            🔒 Protected by Supabase Auth · RLS enforced
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#1e293b" }}>
          PFL Event Management v1.0 · © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
