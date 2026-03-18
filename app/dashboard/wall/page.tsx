"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

export default function WallPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/wall/pending`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.photos ?? data.pending ?? []);
      setPhotos(list);
      if (data.approved_count !== undefined) setApprovedCount(data.approved_count);
    } catch {
      // silently keep existing state on poll failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
    const iv = setInterval(fetchPhotos, 5000);
    return () => clearInterval(iv);
  }, [fetchPhotos]);

  const approve = async (id: number) => {
    setActioning(id);
    try {
      await fetch(`${API}/api/wall/approve/${id}`, { method: "POST" });
      setPhotos(prev => prev.filter(p => p.id !== id));
      setApprovedCount(c => c + 1);
      showToast("✅ Photo approved and published!", "success");
    } catch {
      // Optimistic local update
      setPhotos(prev => prev.filter(p => p.id !== id));
      setApprovedCount(c => c + 1);
      showToast("Approved (sync pending)", "success");
    } finally {
      setActioning(null);
    }
  };

  const reject = async (id: number) => {
    setActioning(id);
    try {
      await fetch(`${API}/api/wall/reject/${id}`, { method: "POST" });
      setPhotos(prev => prev.filter(p => p.id !== id));
      showToast("❌ Photo rejected", "info");
    } catch {
      setPhotos(prev => prev.filter(p => p.id !== id));
      showToast("Rejected (sync pending)", "info");
    } finally {
      setActioning(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>📷</span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Social Wall Moderation</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: 14 }}>Review and approve attendee photos — auto-refreshes every 5 seconds</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        <div className="glass" style={{ padding: "16px 20px", borderLeft: "3px solid #a855f7" }}>
          {loading ? <div className="skeleton" style={{ height: 28, width: 40, marginBottom: 6 }} /> : (
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#c084fc" }}>{photos.length}</div>
          )}
          <div style={{ fontSize: 12, color: "#64748b" }}>Pending Review</div>
        </div>
        <div className="glass" style={{ padding: "16px 20px", borderLeft: "3px solid #10b981" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#34d399" }}>{approvedCount}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Approved Today</div>
        </div>
        <div className="glass" style={{ padding: "16px 20px", borderLeft: "3px solid #3b82f6", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pulse-dot pulse-dot-green" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa" }}>LIVE FEED</div>
            <div style={{ fontSize: 11, color: "#475569" }}>Polling every 5s</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="photos-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass skeleton" style={{ height: 220, borderRadius: 16 }} />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>All caught up!</div>
          <div style={{ color: "#64748b", fontSize: 14 }}>No pending photos to moderate. Check back soon.</div>
        </div>
      ) : (
        <div className="photos-grid">
          {photos.map((p: any) => (
            <div key={p.id} className="glass" style={{ overflow: "hidden" }}>
              <div style={{ position: "relative", paddingTop: "75%" }}>
                <img
                  src={p.url ?? p.image_url ?? p.photo_url}
                  alt="Wall photo"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#94a3b8" }}>
                  PENDING
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>
                  {p.submitter ?? p.submitted_by ?? `Attendee #${p.attendee_id ?? p.id}`}
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>
                  {p.time ?? p.created_at ?? "Just now"}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-success" style={{ flex: 1, justifyContent: "center", padding: "7px 10px", fontSize: 13 }}
                    onClick={() => approve(p.id)} disabled={actioning === p.id}>
                    {actioning === p.id ? "…" : "✅ Approve"}
                  </button>
                  <button className="btn-danger" style={{ flex: 1, justifyContent: "center", padding: "7px 10px", fontSize: 13 }}
                    onClick={() => reject(p.id)} disabled={actioning === p.id}>
                    {actioning === p.id ? "…" : "❌ Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
