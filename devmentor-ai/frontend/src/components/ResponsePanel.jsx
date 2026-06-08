import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * ResponsePanel — Displays Gemini's streamed response as formatted Markdown.
 *
 * LESSON for Akhil:
 * - ReactMarkdown converts the raw markdown text (like **bold** and ```code```)
 *   into properly rendered HTML.
 * - The `useEffect` with scrollIntoView makes the panel auto-scroll as
 *   new content streams in — same trick used by ChatGPT.
 * - The copy button uses the Clipboard API, a standard browser feature.
 */
export function ResponsePanel({ response, isLoading, error, onReset }) {
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll as new content arrives
  useEffect(() => {
    if (isLoading && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [response, isLoading]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some browsers
    }
  };

  // ── EMPTY STATE ──────────────────────────────────────────────────────────
  if (!response && !isLoading && !error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: "300px",
          gap: "12px",
          opacity: 0.5,
        }}
      >
        <div style={{ fontSize: "2.5rem" }}>🤖</div>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text3)",
            textAlign: "center",
          }}
        >
          Paste your code and click{" "}
          <strong style={{ color: "var(--text2)" }}>Analyze</strong>
          <br />
          DevMentor AI will review it instantly.
        </p>
      </div>
    );
  }

  // ── ERROR STATE ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="animate-fadeIn"
        style={{
          background: "#ef444411",
          border: "1px solid #ef444444",
          borderRadius: "var(--radius-md)",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <p style={{ color: "var(--error)", fontWeight: 600, fontSize: "0.875rem" }}>
          ⚠️ Error
        </p>
        <p style={{ color: "var(--text2)", fontSize: "0.85rem" }}>{error}</p>
        <button
          onClick={onReset}
          style={{
            alignSelf: "flex-start",
            background: "transparent",
            border: "1px solid var(--error)",
            borderRadius: "var(--radius-sm)",
            color: "var(--error)",
            fontSize: "0.8rem",
            padding: "4px 12px",
            marginTop: "4px",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── LOADING + STREAMING STATE ────────────────────────────────────────────
  return (
    <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isLoading ? "var(--success)" : "var(--accent)",
            }}
            className={isLoading ? "animate-pulse" : ""}
          />
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {isLoading ? "DevMentor is thinking..." : "Analysis Complete"}
          </span>
        </div>

        {/* Toolbar: Copy + New Analysis buttons */}
        {response && (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={handleCopy}
              style={{
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: copied ? "var(--success)" : "var(--text2)",
                fontSize: "0.75rem",
                padding: "4px 10px",
              }}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
            {!isLoading && (
              <button
                onClick={onReset}
                style={{
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text2)",
                  fontSize: "0.75rem",
                  padding: "4px 10px",
                }}
              >
                New Analysis
              </button>
            )}
          </div>
        )}
      </div>

      {/* The actual markdown response */}
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          minHeight: "200px",
          maxHeight: "65vh",
          overflowY: "auto",
        }}
      >
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
        </div>
        {/* Streaming cursor */}
        {isLoading && (
          <span
            style={{
              display: "inline-block",
              width: "2px",
              height: "1rem",
              background: "var(--accent2)",
              marginLeft: "2px",
              verticalAlign: "middle",
            }}
            className="animate-pulse"
          />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
