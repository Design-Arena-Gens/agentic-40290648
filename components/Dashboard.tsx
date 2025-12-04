"use client";

import { useEffect, useMemo, useState } from "react";

type Message = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  draft?: string;
  autoReplied?: boolean;
  basic?: boolean;
};

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("autoReply");
    if (saved) setAuto(saved === "true");
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      // Trigger poll (also returns the current inbox snapshot)
      const res = await fetch("/api/agent/poll", { method: "POST" });
      const data = await res.json();
      setMessages(data.messages ?? []);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuto = async () => {
    const next = !auto;
    setAuto(next);
    localStorage.setItem("autoReply", String(next));
    await fetch("/api/agent/poll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ autoReply: next })
    });
    await refresh();
  };

  const sendDraft = async (id: string) => {
    const res = await fetch("/api/agent/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!data.ok) alert("Send failed: " + data.error);
    await refresh();
  };

  const pending = useMemo(() => messages.filter(m => !m.autoReplied), [messages]);

  return (
    <main>
      <section style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button onClick={refresh} disabled={loading} style={btn}>
          {loading ? 'Refreshing?' : 'Refresh Inbox'}
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={auto} onChange={toggleAuto} />
          Auto-reply to basic emails
        </label>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '16px 0' }}>Inbox</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {pending.map(m => (
            <article key={m.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ opacity: 0.8 }}>{m.from} ? {new Date(m.date).toLocaleString()}</div>
                  <div style={{ fontWeight: 600 }}>{m.subject}</div>
                </div>
                {m.basic && !m.autoReplied ? (
                  <span style={pill}>basic</span>
                ) : null}
              </div>
              <p style={{ opacity: 0.9, marginTop: 8 }}>{m.snippet}</p>
              {m.draft ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Draft</div>
                  <pre style={pre}>{m.draft}</pre>
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {m.draft && !m.autoReplied ? (
                  <button onClick={() => sendDraft(m.id)} style={btn}>Send Draft</button>
                ) : null}
              </div>
              {m.autoReplied ? (
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Auto-replied</div>
              ) : null}
            </article>
          ))}
          {pending.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No messages pending.</div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

const btn: React.CSSProperties = {
  background: '#1f6feb',
  color: 'white',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #1b4a9a'
};

const card: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: 12,
  padding: 16
};

const pill: React.CSSProperties = {
  background: '#21262d',
  color: '#a5d6ff',
  border: '1px solid #30363d',
  padding: '2px 8px',
  borderRadius: 999
};

const pre: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  background: '#0b0f14',
  border: '1px solid #30363d',
  padding: 12,
  borderRadius: 8
};
