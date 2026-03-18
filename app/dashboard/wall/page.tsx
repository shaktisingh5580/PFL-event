"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";

const DEMO_PHOTOS = [
  { id:1, url:"https://picsum.photos/seed/pfl1/400/300", submitter:"Attendee #101", time:"5 min ago", approved:false },
  { id:2, url:"https://picsum.photos/seed/pfl2/400/300", submitter:"Attendee #88", time:"8 min ago", approved:false },
  { id:3, url:"https://picsum.photos/seed/pfl3/400/300", submitter:"Attendee #215", time:"12 min ago", approved:false },
  { id:4, url:"https://picsum.photos/seed/pfl4/400/300", submitter:"Attendee #334", time:"15 min ago", approved:false },
  { id:5, url:"https://picsum.photos/seed/pfl5/400/300", submitter:"Attendee #77", time:"20 min ago", approved:false },
  { id:6, url:"https://picsum.photos/seed/pfl6/400/300", submitter:"Attendee #156", time:"25 min ago", approved:false },
];

export default function WallPage() {
  const [photos, setPhotos] = useState(DEMO_PHOTOS);
  const [approvedCount, setApprovedCount] = useState(24);
  const { showToast } = useToast();

  // Poll every 5 seconds for new photos
  const poll = useCallback(async () => {
    try {
      // In production: fetch from Supabase wall_photos where approved = false
      // const res = await fetch('/api/wall-photos');
      // const data = await res.json();
      // setPhotos(data);
    } catch {}
  }, []);

  useEffect(() => {
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [poll]);

  const approve = (id: number) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    setApprovedCount(c => c + 1);
    showToast("✅ Photo approved and published!", "success");
  };

  const reject = (id: number) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    showToast("❌ Photo rejected", "info");
  };

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:6}}>
          <span style={{fontSize:28}}>📷</span>
          <h1 style={{fontSize:"1.75rem", fontWeight:800}}>Social Wall Moderation</h1>
        </div>
        <p style={{color:"#64748b", fontSize:14}}>Review and approve attendee photos — auto-refreshes every 5 seconds</p>
      </div>

      {/* Stats bar */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24}}>
        <div className="glass" style={{padding:"16px 20px", borderLeft:"3px solid #a855f7"}}>
          <div style={{fontSize:"1.5rem", fontWeight:800, color:"#c084fc"}}>{photos.length}</div>
          <div style={{fontSize:12, color:"#64748b"}}>Pending Review</div>
        </div>
        <div className="glass" style={{padding:"16px 20px", borderLeft:"3px solid #10b981"}}>
          <div style={{fontSize:"1.5rem", fontWeight:800, color:"#34d399"}}>{approvedCount}</div>
          <div style={{fontSize:12, color:"#64748b"}}>Approved</div>
        </div>
        <div className="glass" style={{padding:"16px 20px", borderLeft:"3px solid #3b82f6", display:"flex", alignItems:"center", gap:10}}>
          <span className="pulse-dot pulse-dot-green" />
          <div>
            <div style={{fontSize:12, fontWeight:700, color:"#60a5fa"}}>LIVE FEED</div>
            <div style={{fontSize:11, color:"#475569"}}>Polling every 5s</div>
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="glass" style={{padding:60, textAlign:"center"}}>
          <div style={{fontSize:48, marginBottom:16}}>🎉</div>
          <div style={{fontWeight:700, fontSize:18, marginBottom:8}}>All caught up!</div>
          <div style={{color:"#64748b", fontSize:14}}>No pending photos to moderate. Check back soon.</div>
        </div>
      ) : (
        <div className="photos-grid">
          {photos.map(p => (
            <div key={p.id} className="glass" style={{overflow:"hidden"}}>
              <div style={{position:"relative", paddingTop:"75%"}}>
                <img src={p.url} alt="Wall photo"
                  style={{position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover"}}
                />
                <div style={{position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.7)", borderRadius:6, padding:"3px 8px", fontSize:11, color:"#94a3b8"}}>
                  PENDING
                </div>
              </div>
              <div style={{padding:"12px 14px"}}>
                <div style={{fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:4}}>{p.submitter}</div>
                <div style={{fontSize:11, color:"#475569", marginBottom:12}}>{p.time}</div>
                <div style={{display:"flex", gap:8}}>
                  <button className="btn-success" style={{flex:1, justifyContent:"center", padding:"7px 10px", fontSize:13}}
                    onClick={() => approve(p.id)}>✅ Approve</button>
                  <button className="btn-danger" style={{flex:1, justifyContent:"center", padding:"7px 10px", fontSize:13}}
                    onClick={() => reject(p.id)}>❌ Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
