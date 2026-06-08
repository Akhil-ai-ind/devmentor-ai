import React, { useState } from "react";
import { ModeSelector } from "./components/ModeSelector.jsx";
import { CodeInput } from "./components/CodeInput.jsx";
import { ResponsePanel } from "./components/ResponsePanel.jsx";
import { useDevMentor } from "./hooks/useDevMentor.js";

/**
 * App — Root component. Owns all top-level state.
 *
 * LESSON for Akhil:
 * - This follows the "lifting state up" pattern in React.
 *   Child components (ModeSelector, CodeInput, ResponsePanel) don't
 *   own state — they receive it via props and call callback functions.
 *   This single source of truth prevents bugs from state getting out of sync.
 * - The layout uses CSS Grid for the two-column desktop view.
 */

export default function App() {
  // Form state
  const [code, setCode] = useState("");
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("Auto-detect");
  const [mode, setMode] = useState("review");

  // API state comes from our custom hook
  const { response, isLoading, error, analyze, reset } = useDevMentor();

  const handleSubmit = () => {
    if (!code.trim() || isLoading) return;
    analyze({ code, question, mode, language });
  };

  const handleReset = () => {
    reset();
    // Optionally clear the form too — user can uncomment if they prefer
    // setCode(""); setQuestion("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 1.5rem",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 0",
          borderBottom: "1px solid var(--border)",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
            }}
          >
            🤖
          </div>
          <div>
            <h1
              style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1 }}
            >
              DevMentor AI
            </h1>
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--text3)",
                marginTop: "2px",
              }}
            >
              Your 24/7 senior developer mentor
            </p>
          </div>
        </div>

        {/* Badge showing it's AI-powered */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "0.72rem",
            color: "var(--text2)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--success)",
              display: "inline-block",
            }}
          />
          Powered by Gemini 2.5 Flash
        </div>
      </header>

      {/* ── MAIN LAYOUT (two columns on wide screens) ──────────────────── */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
          gap: "1.5rem",
          alignItems: "start",
          paddingBottom: "2rem",
        }}
      >
        {/* LEFT COLUMN — Input panel */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            position: "sticky",
            top: "1rem",
          }}
        >
          <ModeSelector selectedMode={mode} onModeChange={setMode} />

          <div
            style={{
              height: "1px",
              background: "var(--border)",
              margin: "0.75rem 0",
            }}
          />

          <CodeInput
            code={code}
            question={question}
            language={language}
            mode={mode}
            isLoading={isLoading}
            onCodeChange={setCode}
            onQuestionChange={setQuestion}
            onLanguageChange={setLanguage}
            onSubmit={handleSubmit}
          />
        </div>

        {/* RIGHT COLUMN — Response panel */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            minHeight: "500px",
          }}
        >
          <ResponsePanel
            response={response}
            isLoading={isLoading}
            error={error}
            onReset={handleReset}
          />
        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1rem 0",
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          fontSize: "0.72rem",
          color: "var(--text3)",
        }}
      >
        <span>Built by Akhil S Nair</span>
        <span>·</span>
        <span>Powered by OpenRouter</span>
        <span>·</span>
        <a
          href="https://github.com/akhilsnair"
          style={{ color: "var(--text3)", textDecoration: "none" }}
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
