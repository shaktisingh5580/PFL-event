"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

const DEMO_SLOTS = [
  { id:1, time:"09:00", title:"Opening Ceremony", description:"Welcome address by Director", auto_announce:true },
  { id:2, time:"10:00", title:"Hackathon Kickoff", description:"Problem statements released + team formation", auto_announce:true },
  { id:3, time:"13:00", title:"Lunch Break", description:"Catering at Ground Floor & B-Wing", auto_announce:true },
  { id:4, time:"15:00", title:"Workshop: AI/ML Basics", description:"Room 301 — 60 participants max", auto_announce:false },
  { id:5, time:"17:00", title:"Sponsor Talks", description:"TCS & Infosys product demos", auto_announce:false },
  { id:6, time:"20:00", title:"Cultural Night", description:"DJ + stage performances", auto_announce:true },
  { id:7, time:"22:00", title:"Day 1 Wrap-Up", description:"Summary, scores announcement", auto_announce:false },
];

export default function SchedulePage() {
  const [slots, setSlots] = useState(DEMO_SLOTS);
  const [schedulerStatus, setSchedulerStatus] = useState<{status:string, jobs?:any[]}>({status:"stopped"});
  const [blasting, setBlasting] = useState<number|null>(null);
  const [toggling, setToggling] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`${API}/api/scheduler/status`).then(r=>r.json()).then(setSchedulerStatus).catch(()=>{});
  }, []);

  const toggleScheduler = async (target:"start"|"stop") => {
    setToggling(true);
    try {
      await fetch(`${API}/api/scheduler/${target}`, {method:"POST"});
      setSchedulerStatus(s => ({...s, status:target==="start"?"running":"stopped"}));
      showToast(`Scheduler ${target==="start"?"started":"stopped"}`, target==="start"?"success":"info");
    } catch { showToast("Failed to control scheduler","error"); }
    finally { setToggling(false); }
  };

  const blast = async (slot: typeof slots[0]) => {
    setBlasting(slot.id);
    try {
      await fetch(`${API}/api/scheduler/blast`, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({message:`📢 ${slot.title}: ${slot.description}`, at_time:slot.time})});
      showToast(`Blast sent: ${slot.title} 📢`, "success");
    } catch { showToast("Backend unavailable — blast simulated!", "info"); }
    finally { setBlasting(null); }
  };

  const toggleAutoAnnounce = (id:number) => {
    setSlots(prev => prev.map(s => s.id===id ? {...s, auto_announce:!s.auto_announce} : s));
  };

  const isRunning = schedulerStatus.status==="running";

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:6}}>
          <span style={{fontSize:28}}>📅</span>
          <h1 style={{fontSize:"1.75rem", fontWeight:800}}>Schedule & Announcements</h1>
        </div>
        <p style={{color:"#64748b", fontSize:14}}>Manage event timeline and auto-announcement scheduler</p>
      </div>

      {/* Scheduler status card */}
      <div className="glass" style={{padding:24, marginBottom:24}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:4}}>
              <span className={`pulse-dot ${isRunning?"pulse-dot-green":"pulse-dot-red"}`}/>
              <span style={{fontWeight:700, fontSize:18, color:isRunning?"#34d399":"#f87171"}}>
                Scheduler {isRunning ? "Running" : "Stopped"}
              </span>
            </div>
            <div style={{fontSize:13, color:"#64748b"}}>
              {slots.filter(s=>s.auto_announce).length} slots set to auto-announce
              {schedulerStatus.jobs ? ` • ${schedulerStatus.jobs.length} jobs queued` : ""}
            </div>
          </div>
          <div style={{display:"flex", gap:10}}>
            <button className="btn-success" onClick={()=>toggleScheduler("start")} disabled={isRunning||toggling} style={{padding:"10px 24px"}}>▶ Start Scheduler</button>
            <button className="btn-danger" onClick={()=>toggleScheduler("stop")} disabled={!isRunning||toggling} style={{padding:"10px 24px"}}>⏹ Stop Scheduler</button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{display:"flex", flexDirection:"column", gap:0}}>
        {slots.map((slot, idx) => (
          <div key={slot.id} style={{display:"flex", gap:0}}>
            {/* Timeline line */}
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", width:60, flexShrink:0}}>
              <div style={{
                width:36, height:36, borderRadius:"50%", flexShrink:0,
                background:slot.auto_announce?"linear-gradient(135deg,#a855f7,#3b82f6)":"rgba(255,255,255,0.06)",
                border:`2px solid ${slot.auto_announce?"rgba(168,85,247,0.5)":"rgba(255,255,255,0.1)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:14, color:slot.auto_announce?"white":"#475569",
                zIndex:1,
              }}>
                {slot.auto_announce ? "📢" : "○"}
              </div>
              {idx < slots.length-1 && <div style={{width:2, flex:1, background:"rgba(255,255,255,0.06)", margin:"4px 0", minHeight:40}}/>}
            </div>

            {/* Content */}
            <div className="glass glass-hover" style={{flex:1, padding:"16px 20px", margin:"0 0 12px 8px"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12}}>
                <div>
                  <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:4}}>
                    <span style={{fontSize:12, fontWeight:700, color:"#a855f7", fontFamily:"JetBrains Mono, monospace"}}>{slot.time}</span>
                    <span style={{fontWeight:700, fontSize:15, color:"#f1f5f9"}}>{slot.title}</span>
                    {slot.auto_announce && <span className="badge badge-purple">AUTO</span>}
                  </div>
                  <div style={{fontSize:13, color:"#64748b"}}>{slot.description}</div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:12, flexShrink:0}}>
                  {/* Toggle */}
                  <label style={{display:"flex", alignItems:"center", gap:8, cursor:"pointer"}}>
                    <span style={{fontSize:12, color:"#64748b"}}>📢 Auto-Announce</span>
                    <label className="toggle">
                      <input type="checkbox" checked={slot.auto_announce} onChange={()=>toggleAutoAnnounce(slot.id)}/>
                      <span className="toggle-slider"/>
                    </label>
                  </label>
                  {/* Blast button */}
                  <button className="btn-outline" style={{padding:"6px 12px", fontSize:12, flexShrink:0}}
                    onClick={()=>blast(slot)} disabled={blasting===slot.id}>
                    {blasting===slot.id ? "Sending…" : "🚀 Test Blast"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
