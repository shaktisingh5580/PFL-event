"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

export default function BrandingPage() {
  const [generating, setGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const { showToast } = useToast();

  const generatePoster = async () => {
    setGenerating(true);
    setApproved(false);
    try {
      const res = await fetch(`${API}/api/branding/generate`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({custom_url: customUrl || undefined}) });
      const data = await res.json();
      setPosterUrl(data.poster_url || `${API}/api/branding/poster`);
      setQrUrl(data.qr_url);
      showToast("Poster generated! 🎨", "success");
    } catch {
      // Demo fallback
      setPosterUrl("https://via.placeholder.com/600x800/1a0a2e/a855f7?text=TechFest+2026+Poster");
      showToast("Demo poster generated!", "success");
    } finally { setGenerating(false); }
  };

  const downloadPoster = async () => {
    try {
      const res = await fetch(`${API}/api/branding/poster`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "poster.png"; a.click();
      showToast("Poster downloaded!", "success");
    } catch { showToast("Download failed", "error"); }
  };

  return (
    <div>
      <div style={{marginBottom:32}}>
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:6}}>
          <span style={{fontSize:28}}>🎨</span>
          <h1 style={{fontSize:"1.75rem", fontWeight:800}}>Branding & Posters</h1>
        </div>
        <p style={{color:"#64748b", fontSize:14}}>Generate AI-powered event posters and QR codes</p>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24}}>
        {/* Controls */}
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          <div className="glass" style={{padding:24}}>
            <div className="section-title" style={{marginBottom:4}}>🖼️ Poster Generator</div>
            <div className="section-subtitle" style={{marginBottom:20}}>AI creates a stunning event poster in seconds</div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12, color:"#64748b", fontWeight:600, display:"block", marginBottom:6}}>Custom URL for QR (optional)</label>
              <input className="input-glass" placeholder="https://your-event-site.com/register" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
            </div>
            <button className="btn-gradient" onClick={generatePoster} disabled={generating} style={{width:"100%", justifyContent:"center", padding:"14px 20px"}}>
              {generating ? (
                <span style={{display:"flex", gap:8, alignItems:"center"}}>
                  <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
                  Generating…
                </span>
              ) : "✨ Generate Poster with AI"}
            </button>
          </div>

          {posterUrl && (
            <div className="glass" style={{padding:24}}>
              <div className="section-title" style={{marginBottom:16}}>Actions</div>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                <button className="btn-gradient" onClick={generatePoster} disabled={generating} style={{justifyContent:"center"}}>🔄 Regenerate</button>
                <button className="btn-outline" onClick={downloadPoster} style={{justifyContent:"center"}}>⬇️ Download PNG</button>
                <button
                  className={approved ? "btn-success" : "btn-outline"}
                  onClick={() => { setApproved(true); showToast("Poster approved for sharing! ✅", "success"); }}
                  style={{justifyContent:"center"}}
                >
                  {approved ? "✅ Approved!" : "✅ Approve Poster"}
                </button>
              </div>
              {approved && (
                <div style={{marginTop:16, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#34d399"}}>
                  ✅ Marked as ready for sharing on social media &amp; Telegram
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview */}
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          {posterUrl ? (
            <div className="glass" style={{padding:20, display:"flex", flexDirection:"column", alignItems:"center", gap:16}}>
              <div className="section-title" style={{alignSelf:"flex-start"}}>Preview</div>
              <img
                src={posterUrl} alt="Event Poster"
                style={{width:"100%", maxHeight:400, objectFit:"cover", borderRadius:12, border:"1px solid rgba(168,85,247,0.2)"}}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' style='background:%231a0a2e'><text x='50%' y='45%' font-family='sans-serif' font-size='32' fill='%23a855f7' text-anchor='middle' font-weight='bold'>TechFest 2026</text><text x='50%' y='60%' font-family='sans-serif' font-size='16' fill='%2394a3b8' text-anchor='middle'>Event Poster Preview</text></svg>`;
                }}
              />
              {qrUrl && (
                <div style={{textAlign:"center"}}>
                  <img src={qrUrl} alt="QR Code" style={{width:120, height:120, borderRadius:8, background:"white", padding:8}} />
                  <div style={{fontSize:12, color:"#64748b", marginTop:8}}>📱 Scan = Attendee Registration Page</div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass" style={{padding:40, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:16}}>
              <div style={{fontSize:64}}>🎨</div>
              <div style={{fontSize:16, color:"#475569", textAlign:"center"}}>No poster yet — click "Generate Poster with AI" to create one</div>
            </div>
          )}

          {/* QR standalone card */}
          {!qrUrl && posterUrl && (
            <div className="glass" style={{padding:24, textAlign:"center"}}>
              <div className="section-title" style={{marginBottom:4}}>📱 QR Code</div>
              <div style={{color:"#64748b", fontSize:13, marginBottom:16}}>QR code will be generated alongside your poster</div>
              <div style={{width:100, height:100, borderRadius:10, background:"rgba(168,85,247,0.1)", border:"1px dashed rgba(168,85,247,0.3)", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32}}>
                📷
              </div>
              <div style={{fontSize:11, color:"#475569", marginTop:10}}>Scan = Attendee Registration Page</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
