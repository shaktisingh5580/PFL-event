"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ToastProvider";

const API = "http://localhost:8000";

const EVENT_TYPES = [
  { id: "techfest", icon: "🎓", name: "TechFest", desc: "Technology showcases, workshops & competitions" },
  { id: "hackathon", icon: "💻", name: "Hackathon", desc: "48-hour coding sprint with teams & prizes" },
  { id: "cultural", icon: "🎭", name: "Cultural Fest", desc: "Performances, art exhibitions & cultural shows" },
  { id: "sports", icon: "🏏", name: "Sports Event", desc: "Tournaments, leagues & athletic competitions" },
  { id: "conference", icon: "🎤", name: "Conference", desc: "Talks, panels & networking opportunities" },
];

interface Message { role: "user" | "ai"; content: string; timestamp: Date; }

export default function PlannerPage() {
  const [templates, setTemplates] = useState(EVENT_TYPES);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sessionId] = useState(() => `sess_${Date.now()}`);
  const [finalized, setFinalized] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`${API}/api/templates`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length) setTemplates(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const startWithTemplate = (id: string) => {
    setSelectedTemplate(id);
    const tpl = templates.find((t) => t.id === id);
    setMessages([{
      role: "ai",
      content: `Hello! I'm your AI Event Architect 🎯\n\nYou've selected **${tpl?.name}** — perfect choice! Let's build your event plan step by step.\n\nTell me:\n• What's your event name?\n• Expected number of attendees?\n• Which dates are you targeting?`,
      timestamp: new Date(),
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || typing) return;
    const userMsg: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API}/api/architect/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, session_id: sessionId, template_id: selectedTemplate }),
      });
      const data = await res.json();
      const aiMsg: Message = { role: "ai", content: data.reply || "Got it! Let me process that…", timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
      if (data.finalized) {
        setFinalized(true);
        setPlan(data.plan);
        showToast("Event plan finalized! 🎉", "success");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I couldn't reach the AI backend. Please ensure the server is running at localhost:8000.", timestamp: new Date() },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) showToast(`📎 ${files[0].name} added to knowledge base`, "success");
  };

  if (!selectedTemplate) {
    return (
      <div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>🎓</span>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>AI Event Planner</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: 14 }}>Select a template to start building your event with AI</p>
        </div>

        <div className="cards-grid" style={{ marginBottom: 32 }}>
          {templates.map((t) => (
            <div key={t.id} className="glass glass-hover" style={{ padding: 28, cursor: "pointer" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{t.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t.name}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>{t.desc}</div>
              <button className="btn-gradient" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => startWithTemplate(t.id)}>
                Use This Template →
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button className="btn-outline" style={{ padding: "12px 32px" }}
            onClick={() => { setSelectedTemplate("blank"); setMessages([{ role: "ai", content: "Hello! I'm your AI Event Architect. Let's build your perfect event from scratch! What kind of event are you planning?", timestamp: new Date() }]); }}>
            Start Blank →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-outline" style={{ padding: "6px 12px", fontSize: 12 }}
            onClick={() => { setSelectedTemplate(null); setMessages([]); setFinalized(false); }}>
            ← Back
          </button>
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            {templates.find((t) => t.id === selectedTemplate)?.icon} {templates.find((t) => t.id === selectedTemplate)?.name ?? "Custom Event"}
          </span>
        </div>
        {finalized && <div className="badge badge-green">✅ Plan Ready</div>}
      </div>

      {/* Finalized banner */}
      {finalized && (
        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: "#34d399", marginBottom: 8 }}>✅ Event Plan Ready!</div>
          {plan && (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              {Object.entries(plan).map(([k, v]) => (
                <span key={k} style={{ marginRight: 16 }}><strong>{k}:</strong> {String(v)}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat */}
      <div className="glass" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "ai" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 10, flexShrink: 0 }}>
                  🤖
                </div>
              )}
              <div
                className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}
                style={{ maxWidth: "70%", padding: "12px 16px", fontSize: 14, lineHeight: 1.7, color: "#e2e8f0" }}
              >
                {msg.content.split("\n").map((line, j) => (
                  <span key={j}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}<br /></span>
                ))}
                <div style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>🤖</div>
              <div className="chat-bubble-ai" style={{ padding: "12px 20px", display: "flex", gap: 5, alignItems: "center" }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* PDF Upload zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          style={{
            margin: "0 16px",
            padding: "10px 16px",
            borderRadius: 10,
            border: `1px dashed ${dragOver ? "#a855f7" : "rgba(255,255,255,0.1)"}`,
            background: dragOver ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.02)",
            fontSize: 12,
            color: "#475569",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: 12,
            transition: "all 0.2s ease",
          }}
        >
          📎 Drop PDF (rules/coordinators) to add to AI knowledge base
        </div>

        {/* Input row */}
        <div style={{ padding: "12px 16px 16px", display: "flex", gap: 10 }}>
          <input
            className="input-glass"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={typing}
          />
          <button
            className="btn-gradient"
            onClick={sendMessage}
            disabled={typing || !input.trim()}
            style={{ flexShrink: 0 }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
