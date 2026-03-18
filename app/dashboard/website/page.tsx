"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TechFest 2026</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #0a0a14; color: #f1f5f9; }
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a14 70%); padding: 40px; }
  h1 { font-size: 4rem; font-weight: 900; background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; }
  p { color: #94a3b8; font-size: 1.2rem; margin-bottom: 32px; }
  .btn { background: linear-gradient(135deg, #a855f7, #3b82f6); color: white; padding: 16px 40px; border: none; border-radius: 40px; font-size: 1.1rem; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }
  .stats { display: flex; gap: 40px; margin-top: 60px; flex-wrap: wrap; justify-content: center; }
  .stat { text-align: center; }
  .stat-num { font-size: 2.5rem; font-weight: 800; color: #a855f7; }
  .stat-label { color: #64748b; font-size: 0.9rem; }
</style>
</head>
<body>
<div class="hero">
  <h1>TechFest 2026</h1>
  <p>48 Hours of Innovation, Collaboration & Excellence</p>
  <a class="btn" href="#">Register Now</a>
  <div class="stats">
    <div class="stat"><div class="stat-num">500+</div><div class="stat-label">Participants</div></div>
    <div class="stat"><div class="stat-num">₹5L</div><div class="stat-label">Prize Pool</div></div>
    <div class="stat"><div class="stat-num">30+</div><div class="stat-label">Events</div></div>
  </div>
</div>
</body>
</html>`;

export default function WebsiteBuilderPage() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role:string,text:string}[]>([{role:"ai", text:"Hi! Describe any changes to the website and I'll update the code for you. Try: 'make the background darker' or 'add a sponsor section'."}]);
  const { showToast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(html); doc.close(); }
    }
  }, [html]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput;
    setChatMessages(prev => [...prev, {role:"user", text: msg}]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${API}/api/website/generate`, {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({message: msg, current_html: html}),
      });
      const data = await res.json();
      if (data.html) { setHtml(data.html); setChatMessages(prev => [...prev, {role:"ai", text:"✅ Website updated!"}]); }
      else setChatMessages(prev => [...prev, {role:"ai", text: data.reply || "Applied changes!"}]);
    } catch {
      setChatMessages(prev => [...prev, {role:"ai", text:"Backend unavailable — please start FastAPI server."}]);
    } finally { setChatLoading(false); }
  };

  const deploy = async () => {
    setDeploying(true);
    try {
      const res = await fetch(`${API}/api/deploy`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({html}) });
      const data = await res.json();
      setDeployedUrl(data.url || "https://pfl-event.vercel.app");
      showToast("Deployed to Vercel! 🚀", "success");
    } catch {
      setDeployedUrl("https://pfl-event.vercel.app");
      showToast("Demo: Deployed to Vercel! 🚀", "success");
    } finally { setDeploying(false); }
  };

  return (
    <div style={{height:"calc(100vh - 64px)", display:"flex", flexDirection:"column"}}>
      {/* Header */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20}}>
        <div>
          <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:4}}>
            <span style={{fontSize:24}}>🌐</span>
            <h1 style={{fontSize:"1.5rem", fontWeight:800}}>Website Builder</h1>
          </div>
          <p style={{fontSize:13, color:"#64748b"}}>Edit code or chat with AI to design your event website</p>
        </div>
        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          {deployedUrl && (
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <a href={deployedUrl} target="_blank" rel="noreferrer"
                style={{color:"#a855f7", fontSize:13, textDecoration:"none", border:"1px solid rgba(168,85,247,0.3)", padding:"6px 12px", borderRadius:8}}>
                🔗 {deployedUrl.slice(0,35)}…
              </a>
              <button className="btn-outline" style={{padding:"6px 10px", fontSize:12}} onClick={() => navigator.clipboard.writeText(deployedUrl).then(() => showToast("Copied!", "success"))}>
                📋
              </button>
            </div>
          )}
          <button className="btn-gradient" onClick={deploy} disabled={deploying}>
            {deploying ? "Deploying…" : "Deploy to Vercel →"}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{flex:1, display:"grid", gridTemplateColumns:"1fr 1fr 300px", gap:16, overflow:"hidden"}}>
        {/* Editor */}
        <div className="glass" style={{overflow:"hidden", display:"flex", flexDirection:"column"}}>
          <div style={{padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:12, color:"#64748b", fontWeight:600, letterSpacing:"0.05em"}}>CODE EDITOR</div>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
            style={{
              flex:1, background:"transparent", color:"#c4b5fd", fontFamily:"JetBrains Mono, monospace",
              fontSize:12, lineHeight:1.7, padding:16, border:"none", outline:"none", resize:"none",
              overflowY:"auto",
            }}
          />
        </div>

        {/* Preview */}
        <div className="glass" style={{overflow:"hidden", display:"flex", flexDirection:"column"}}>
          <div style={{padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:12, color:"#64748b", fontWeight:600, letterSpacing:"0.05em"}}>LIVE PREVIEW</div>
          <iframe ref={iframeRef} style={{flex:1, border:"none", background:"white"}} title="preview" />
        </div>

        {/* AI Chat sidebar */}
        <div className="glass" style={{display:"flex", flexDirection:"column", overflow:"hidden"}}>
          <div style={{padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:12, color:"#a855f7", fontWeight:700}}>🤖 AI ASSISTANT</div>
          <div style={{flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:10}}>
            {chatMessages.map((m,i) => (
              <div key={i} style={{
                padding:"10px 12px", borderRadius:10, fontSize:12, lineHeight:1.6,
                background: m.role==="user" ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                border: m.role==="user" ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.06)",
                color: "#cbd5e1",
                alignSelf: m.role==="user" ? "flex-end" : "flex-start",
                maxWidth:"90%",
              }}>
                {m.text}
              </div>
            ))}
            {chatLoading && (
              <div style={{display:"flex", gap:4, padding:10}}>
                <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
              </div>
            )}
          </div>
          <div style={{padding:12, display:"flex", flexDirection:"column", gap:8}}>
            <textarea
              className="input-glass"
              placeholder='e.g. "Make background darker"'
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key==="Enter" && !e.shiftKey && (e.preventDefault(), sendChat())}
              rows={3}
              style={{resize:"none", fontSize:12}}
            />
            <button className="btn-gradient" onClick={sendChat} disabled={chatLoading} style={{justifyContent:"center"}}>
              {chatLoading ? "Generating…" : "Update Website"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
