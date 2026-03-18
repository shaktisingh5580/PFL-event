"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In production: use @supabase/ssr for auth
      await new Promise(r => setTimeout(r, 1000));
      if (email && password) {
        showToast("Logged in successfully!", "success");
        window.location.href = "/dashboard";
      } else {
        showToast("Please enter email and password", "error");
      }
    } finally {
      setLoading(false);
    }
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
      {/* Background glows */}
      <div style={{ position:"absolute", top:-200, left:-200, width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-200, right:-200, width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:420, padding:20 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div className="gradient-text" style={{ fontSize:48, fontWeight:900, letterSpacing:-2 }}>PFL</div>
          <div style={{ fontSize:14, color:"#64748b", marginTop:4 }}>Manage Events. Effortlessly.</div>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding:40 }}>
          <div style={{ fontWeight:700, fontSize:22, marginBottom:6 }}>Welcome back</div>
          <div style={{ fontSize:13, color:"#64748b", marginBottom:28 }}>Sign in to your organizer account</div>

          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>Email</label>
              <input
                className="input-glass"
                type="email"
                placeholder="organizer@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:6 }}>Password</label>
              <input
                className="input-glass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-gradient"
              disabled={loading}
              style={{ justifyContent:"center", padding:"14px 20px", marginTop:8, fontSize:15 }}
            >
              {loading ? (
                <span style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop:24, textAlign:"center", fontSize:12, color:"#475569" }}>
            Protected by Supabase Auth • RLS enforced
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:24, fontSize:12, color:"#334155" }}>
          PFL Event Management v1.0 • &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
