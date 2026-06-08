import React from "react";

/**
 * ModeSelector — lets the user choose what kind of AI help they want.
 *
 * LESSON: This is a "controlled component" — the parent (App) owns the
 * `selectedMode` state. ModeSelector just displays it and calls
 * `onModeChange` when the user clicks. This pattern makes components
 * reusable and easier to test.
 */

const MODES = [
  {
    id: "review",
    label: "Code Review",
    icon: "🔍",
    description: "Get feedback like a senior dev",
    color: "#6366f1",
  },
  {
    id: "debug",
    label: "Debug Help",
    icon: "🐛",
    description: "Find & fix bugs with explanations",
    color: "#f59e0b",
  },
  {
    id: "explain",
    label: "Explain Code",
    icon: "💡",
    description: "Understand what any code does",
    color: "#14b8a6",
  },
  {
    id: "quiz",
    label: "Quiz Me",
    icon: "🎯",
    description: "Test your understanding",
    color: "#ec4899",
  },
];

export function ModeSelector({ selectedMode, onModeChange }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <p
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text3)",
          marginBottom: "0.5rem",
        }}
      >
        What do you need?
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        }}
      >
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              style={{
                background: isSelected
                  ? `${mode.color}22`
                  : "var(--bg2)",
                border: `1px solid ${isSelected ? mode.color : "var(--border)"}`,
                borderRadius: "var(--radius-md)",
                padding: "0.6rem 0.75rem",
                textAlign: "left",
                color: "var(--text)",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: "1.1rem", marginBottom: "2px" }}>
                {mode.icon}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: isSelected ? mode.color : "var(--text)",
                }}
              >
                {mode.label}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text3)",
                  marginTop: "2px",
                  lineHeight: 1.3,
                }}
              >
                {mode.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
