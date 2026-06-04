"use client";

import { useState, useEffect } from "react";

interface BriefingData {
  whatsHappened: string[];
  disagreements: string[] | null;
  whatsNew: { text: string; sourceUrl: string }[];
  whatsNext: string[];
  sources: { outlet: string; url: string }[];
}

function BulletText({ text }: { text: string }) {
  const match = text.match(/^\*\*(.+?)\*\*:?\s*(.*)/s);
  if (!match) return <span>{text}</span>;
  return (
    <span>
      <strong>{match[1]}:</strong> {match[2]}
    </span>
  );
}

const LOADING_MESSAGES = ["Searching the web...", "Reading sources...", "Writing your briefing..."];

function LoadingIndicator() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx(i => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(interval);
  }, []);
  return (
    <p style={{ textAlign: "center", color: "#aaa", marginTop: "40px", fontSize: "15px", fontStyle: "italic" }}>
      {LOADING_MESSAGES[idx]}
    </p>
  );
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setBriefing(null);
    try {
      const response = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate briefing");
      setBriefing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: "100vh",
      background: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: briefing ? "flex-start" : "center",
      padding: briefing ? "60px 24px" : "0 24px",
      boxSizing: "border-box",
      transition: "padding 0.3s",
    }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>

        <h1 style={{
          fontSize: "72px",
          fontWeight: "800",
          margin: "0 0 40px 0",
          letterSpacing: "0.05em",
          background: "linear-gradient(135deg, #111 0%, #555 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.05,
          textAlign: "center",
        }}>
          Tell me about...
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #2563eb", paddingBottom: "10px" }}>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="California elections"
              style={{
                flex: 1,
                fontSize: "18px",
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#111",
                fontFamily: "inherit",
                padding: "0",
              }}
            />
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              style={{
                background: "none",
                border: "none",
                color: "#bbb",
                fontSize: "22px",
                cursor: loading ? "wait" : !topic.trim() ? "default" : "pointer",
                fontFamily: "inherit",
                padding: "0 0 0 12px",
                lineHeight: 1,
              }}
            >
              →
            </button>
          </div>
        </form>

        <p style={{ color: "#bbb", fontSize: "13px", marginTop: "10px", textAlign: "center" }}>
          Try{" "}
          <span style={{ cursor: "pointer", color: "#888" }} onClick={() => setTopic("Iran War")}>Iran War</span>
          {" "}or{" "}
          <span style={{ cursor: "pointer", color: "#888" }} onClick={() => setTopic("Anthropic IPO")}>Anthropic IPO</span>
        </p>

        {loading && <LoadingIndicator />}

        {error && (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "12px", padding: "14px 18px", marginTop: "20px" }}>
            <p style={{ color: "#e11d48", margin: 0, fontSize: "14px" }}>{error}</p>
          </div>
        )}

        {briefing && (
          <div style={{ marginTop: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
              <p style={{ fontSize: "12px", fontWeight: "500", color: "#aaa", margin: 0 }}>{topic}</p>
              <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
            </div>

            {/* What happened */}
            <section style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563eb", margin: "0 0 12px 0" }}>What happened</p>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {briefing.whatsHappened.map((item, i) => (
                  <li key={i} style={{ fontSize: "15px", lineHeight: "1.7", marginBottom: "8px", color: "#222" }}>
                    <BulletText text={item} />
                  </li>
                ))}
              </ul>
              {briefing.disagreements && briefing.disagreements.length > 0 && (
                <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", borderLeft: "3px solid #2563eb" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", margin: "0 0 8px 0" }}>Where people disagree</p>
                  <ul style={{ margin: 0, paddingLeft: "18px" }}>
                    {briefing.disagreements.map((item, i) => (
                      <li key={i} style={{ fontSize: "14px", lineHeight: "1.7", marginBottom: "6px", color: "#444" }}>
                        <BulletText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* What's new */}
            <section style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563eb", margin: "0 0 12px 0" }}>What's new</p>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {(briefing.whatsNew || []).map((item, i) => (
                  <li key={i} style={{ fontSize: "15px", lineHeight: "1.7", marginBottom: "8px", color: "#222" }}>
                    <BulletText text={item.text} />
                    {item.sourceUrl && (
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: "#999", fontSize: "11px", verticalAlign: "super", marginLeft: "2px", textDecoration: "none" }}>
                        [{i + 1}]
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {/* What's next */}
            <section style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563eb", margin: "0 0 12px 0" }}>What's next</p>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {(briefing.whatsNext || []).map((item, i) => (
                  <li key={i} style={{ fontSize: "15px", lineHeight: "1.7", marginBottom: "8px", color: "#222" }}>
                    <BulletText text={item} />
                  </li>
                ))}
              </ul>
            </section>

            {/* Sources */}
            {briefing.sources?.length > 0 && (
              <section style={{ borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", margin: "0 0 10px 0" }}>Sources</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(briefing.sources || []).map((source, i) => (
                    <a key={i} href={source.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "13px", color: "#444", textDecoration: "none", background: "#eff6ff", borderRadius: "8px", padding: "4px 12px", color: "#2563eb" }}>
                      {source.outlet}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <p style={{ fontSize: "12px", color: "#ccc", textAlign: "center", marginTop: "28px" }}>
          AI-generated · verify against original reporting
        </p>
      </div>
    </main>
  );
}
