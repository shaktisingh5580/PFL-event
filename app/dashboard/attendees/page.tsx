"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";

const DEMO_ATTENDEES = [
  { id:1, name:"Arjun Sharma", email:"arjun@example.com", checked_in:true, dynamic_fields:{tshirt:"L", team:"Alpha", role:"Developer"} },
  { id:2, name:"Priya Mehta", email:"priya@example.com", checked_in:false, dynamic_fields:{tshirt:"M", role:"Designer"} },
  { id:3, name:"Rahul Kumar", email:"rahul@example.com", checked_in:true, dynamic_fields:{tshirt:"XL", team:"Beta", role:"Data Scientist", diet:"Veg"} },
  { id:4, name:"Sneha Patel", email:"sneha@example.com", checked_in:false, dynamic_fields:{tshirt:"S", role:"PM"} },
  { id:5, name:"Vikram Singh", email:"vikram@example.com", checked_in:true, dynamic_fields:{tshirt:"L", team:"Gamma", role:"AI/ML", diet:"Non-Veg"} },
  { id:6, name:"Ananya Gupta", email:"ananya@example.com", checked_in:false, dynamic_fields:{tshirt:"M", role:"Frontend Dev"} },
  { id:7, name:"Karan Joshi", email:"karan@example.com", checked_in:true, dynamic_fields:{tshirt:"XXL", team:"Delta", role:"Backend Dev"} },
  { id:8, name:"Divya Nair", email:"divya@example.com", checked_in:false, dynamic_fields:{tshirt:"S", role:"UX Research"} },
];

const TAG_COLORS = ["badge-purple","badge-blue","badge-cyan","badge-green","badge-yellow","badge-orange"];

function getTagColor(key: string) {
  const idx = key.charCodeAt(0) % TAG_COLORS.length;
  return TAG_COLORS[idx];
}

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState(DEMO_ATTENDEES);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name"|"email"|"checked_in">("name");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const { showToast } = useToast();

  const exportCSV = () => {
    const headers = ["ID","Name","Email","Checked In","Dynamic Fields"];
    const rows = filtered.map(a => [a.id, a.name, a.email, a.checked_in?"Yes":"No", JSON.stringify(a.dynamic_fields)]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="attendees.csv"; a.click();
    showToast("CSV exported!", "success");
  };

  const toggleCheckIn = (id: number) => {
    setAttendees(prev => prev.map(a => a.id===id ? {...a, checked_in:!a.checked_in} : a));
    showToast("Check-in status updated ✅", "success");
  };

  const filtered = attendees
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      let va = a[sortKey]; let vb = b[sortKey];
      if (typeof va === "boolean") va = va?1:0 as any;
      if (typeof vb === "boolean") vb = vb?1:0 as any;
      return sortDir==="asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

  const sort = (key: typeof sortKey) => {
    if (sortKey===key) setSortDir(d => d==="asc"?"desc":"asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({k}:{k:string}) => sortKey===k ? (sortDir==="asc" ? " ↑" : " ↓") : " ↕";

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:6}}>
          <span style={{fontSize:28}}>👥</span>
          <h1 style={{fontSize:"1.75rem", fontWeight:800}}>Attendees Directory</h1>
        </div>
        <p style={{color:"#64748b", fontSize:14}}>Search, sort, and manage all event attendees</p>
      </div>

      {/* Summary cards */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20}}>
        {[
          {label:"Total Registered", value:attendees.length, color:"#a855f7"},
          {label:"Checked In", value:attendees.filter(a=>a.checked_in).length, color:"#10b981"},
          {label:"Pending Check-In", value:attendees.filter(a=>!a.checked_in).length, color:"#f59e0b"},
        ].map(({label,value,color}) => (
          <div key={label} className="glass" style={{padding:"16px 20px", borderLeft:`3px solid ${color}`}}>
            <div style={{fontSize:"1.5rem", fontWeight:800, color}}>{value}</div>
            <div style={{fontSize:12, color:"#64748b", fontWeight:500}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search + Export */}
      <div style={{display:"flex", gap:12, marginBottom:16}}>
        <input className="input-glass" placeholder="🔍 Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1}}/>
        <button className="btn-outline" onClick={exportCSV}>⬇️ Export CSV</button>
      </div>

      {/* Table */}
      <div className="glass" style={{overflow:"auto"}}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={()=>sort("name")} style={{cursor:"pointer"}}>Name<SortIcon k="name"/></th>
              <th onClick={()=>sort("email")} style={{cursor:"pointer"}}>Email<SortIcon k="email"/></th>
              <th onClick={()=>sort("checked_in")} style={{cursor:"pointer"}}>Status<SortIcon k="checked_in"/></th>
              <th>Fields</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td style={{fontWeight:600, color:"#f1f5f9"}}>
                  <div style={{display:"flex", alignItems:"center", gap:10}}>
                    <div style={{width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#a855f7,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"white"}}>
                      {a.name[0]}
                    </div>
                    {a.name}
                  </div>
                </td>
                <td><a href={`mailto:${a.email}`} style={{color:"#60a5fa", textDecoration:"none"}}>{a.email}</a></td>
                <td>
                  <span className={`badge ${a.checked_in?"badge-green":"badge-yellow"}`}>
                    {a.checked_in ? "✅ Checked In" : "⏳ Pending"}
                  </span>
                </td>
                <td>
                  <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                    {Object.entries(a.dynamic_fields).map(([k,v]) => (
                      <span key={k} className={`badge ${getTagColor(k)}`} style={{fontSize:11}}>
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <button className={a.checked_in?"btn-danger":"btn-success"} style={{padding:"5px 12px", fontSize:12}}
                    onClick={()=>toggleCheckIn(a.id)}>
                    {a.checked_in ? "Undo" : "Check In"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
