"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const DEMO_COMPLAINTS = [
  { id:1, title:"Projector not working in Hall B", category:"Technical", severity:"emergency", status:"open", time:"5 min ago", description:"The main projector in Hall B has stopped working mid-presentation." },
  { id:2, title:"AC not cooling in Room 203", category:"Facilities", severity:"high", status:"open", time:"12 min ago", description:"Room 203 AC is not functioning. 50 attendees are uncomfortable." },
  { id:3, title:"Lunch queue too long", category:"Catering", severity:"medium", status:"open", time:"30 min ago", description:"Food queue at stall 3 hasn't moved in 20 minutes." },
  { id:4, title:"WiFi slow near auditorium", category:"Technical", severity:"high", status:"open", time:"45 min ago", description:"Network speeds dropping below 1 Mbps near main auditorium." },
  { id:5, title:"Missing name badge", category:"Registration", severity:"low", status:"open", time:"1 hr ago", description:"Attendee Priya Mehta did not receive name badge at counter." },
];

const SEVERITY_MAP: Record<string, { cls: string; icon: string; label: string }> = {
  emergency: { cls:"severity-emergency", icon:"🔴", label:"Emergency" },
  high: { cls:"severity-high", icon:"🟠", label:"High" },
  medium: { cls:"severity-medium", icon:"🟡", label:"Medium" },
  low: { cls:"severity-low", icon:"🟢", label:"Low" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Technical:"badge-blue", Facilities:"badge-purple", Catering:"badge-yellow",
  Registration:"badge-cyan", Security:"badge-red",
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState(DEMO_COMPLAINTS);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [resolving, setResolving] = useState<number|null>(null);
  const { showToast } = useToast();

  const resolve = async (id: number) => {
    setResolving(id);
    try {
      // In production: PATCH Supabase row status = 'resolved'
      await new Promise(r => setTimeout(r, 800));
      setComplaints(prev => prev.filter(c => c.id !== id));
      showToast("Complaint resolved ✅", "success");
    } catch { showToast("Failed to resolve", "error"); }
    finally { setResolving(null); }
  };

  const filtered = filterSeverity==="all" ? complaints : complaints.filter(c=>c.severity===filterSeverity);

  // Category chart data
  const catCounts = complaints.reduce((acc,c) => { acc[c.category]=(acc[c.category]||0)+1; return acc; }, {} as Record<string,number>);
  const maxCat = Math.max(...Object.values(catCounts), 1);

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:6}}>
          <span style={{fontSize:28}}>🆘</span>
          <h1 style={{fontSize:"1.75rem", fontWeight:800}}>Help Desk</h1>
        </div>
        <p style={{color:"#64748b", fontSize:14}}>Track and resolve attendee complaints in real-time</p>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 280px", gap:20}}>
        {/* Main complaints list */}
        <div>
          {/* Severity filter */}
          <div style={{display:"flex", gap:8, marginBottom:16, flexWrap:"wrap"}}>
            {["all","emergency","high","medium","low"].map(s => (
              <button key={s} onClick={()=>setFilterSeverity(s)}
                style={{
                  padding:"6px 14px", borderRadius:8, border:"1px solid",
                  fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                  background: filterSeverity===s ? "rgba(168,85,247,0.2)" : "transparent",
                  borderColor: filterSeverity===s ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.1)",
                  color: filterSeverity===s ? "#c084fc" : "#64748b",
                }}>
                {s==="all" ? "All Severities" : (SEVERITY_MAP[s]?.icon+" "+SEVERITY_MAP[s]?.label)}
              </button>
            ))}
            <div className="badge badge-red" style={{marginLeft:"auto", alignSelf:"center"}}>{filtered.length} Open</div>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {filtered.length===0 && (
              <div className="glass" style={{padding:40, textAlign:"center"}}>
                <div style={{fontSize:40, marginBottom:12}}>🎉</div>
                <div style={{fontWeight:700}}>No open complaints!</div>
              </div>
            )}
            {filtered.map(c => {
              const sev = SEVERITY_MAP[c.severity] || SEVERITY_MAP.low;
              return (
                <div key={c.id} className="glass" style={{padding:20, borderLeft:`3px solid ${c.severity==="emergency"?"#ef4444":c.severity==="high"?"#f97316":c.severity==="medium"?"#f59e0b":"#10b981"}`}}>
                  <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:10}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:6}}>
                        <span className={`badge ${sev.cls}`}>{sev.icon} {sev.label}</span>
                        <span className={`badge ${CATEGORY_COLORS[c.category]||"badge-purple"}`}>{c.category}</span>
                        <span style={{fontSize:11, color:"#475569"}}>{c.time}</span>
                      </div>
                      <div style={{fontWeight:700, fontSize:15, color:"#f1f5f9", marginBottom:6}}>{c.title}</div>
                      <div style={{fontSize:13, color:"#94a3b8", lineHeight:1.6}}>{c.description}</div>
                    </div>
                    <button className="btn-success" style={{flexShrink:0, padding:"7px 16px"}}
                      onClick={() => resolve(c.id)} disabled={resolving===c.id}>
                      {resolving===c.id ? "…" : "Resolve"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown mini chart */}
        <div className="glass" style={{padding:20, height:"fit-content"}}>
          <div className="section-title" style={{marginBottom:16}}>📊 By Category</div>
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {Object.entries(catCounts).map(([cat,count]) => (
              <div key={cat}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                  <span style={{fontSize:12, color:"#94a3b8", fontWeight:500}}>{cat}</span>
                  <span style={{fontSize:12, fontWeight:700, color:"#c084fc"}}>{count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{width:`${(count/maxCat)*100}%`}}/>
                </div>
              </div>
            ))}
          </div>
          <div className="gradient-divider" style={{marginTop:20, marginBottom:20}}/>
          <div style={{fontSize:12, color:"#475569", lineHeight:1.8}}>
            🔴 Emergency: Escalate immediately<br/>
            🟠 High: Resolve within 15 min<br/>
            🟡 Medium: Resolve within 1 hr<br/>
            🟢 Low: Resolve by end of day
          </div>
        </div>
      </div>
    </div>
  );
}
