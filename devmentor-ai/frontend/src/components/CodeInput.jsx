import React from "react";

// Language options for the dropdown
const LANGUAGES = [
  "Auto-detect",
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C",
  "C++",
  "Go",
  "Rust",
  "HTML/CSS",
  "SQL",
  "Other",
];

// Example code snippets for the "Try an example" button
// These help users quickly see what the tool can do
const EXAMPLES = {
  review: {
    code: `def fibonacci(n):
    result = []
    a = 0
    b = 1
    for i in range(n):
        result.append(a)
        temp = a
        a = b
        b = temp + b
    return result

numbers = fibonacci(10)
for n in numbers:
    print(n)`,
    question: "Is this code written well? How can I make it more Pythonic?",
    language: "Python",
  },
  debug: {
    code: `function reverseString(str) {
  let reversed = ""
  for (let i = str.length; i >= 0; i--) {
    reversed += str[i]
  }
  return reversed
}

console.log(reverseString("hello"))  // Expected: "olleh"`,
    question: "This function outputs 'undefinedolleh' instead of 'olleh'. Why?",
    language: "JavaScript",
  },
  explain: {
    code: `nums = [3, 1, 4, 1, 5, 9, 2, 6]
result = sorted(set(nums), key=lambda x: -nums.count(x))
print(result[:3])`,
    question: "Can you explain what this code does, line by line?",
    language: "Python",
  },
  quiz: {
    code: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if self.is_empty():
            return None
        return self.items.pop()
    
    def peek(self):
        return self.items[-1] if self.items else None
    
    def is_empty(self):
        return len(self.items) == 0`,
    question: "",
    language: "Python",
  },
};

export function CodeInput({
  code,
  question,
  language,
  mode,
  isLoading,
  onCodeChange,
  onQuestionChange,
  onLanguageChange,
  onSubmit,
}) {
  const loadExample = () => {
    const example = EXAMPLES[mode] || EXAMPLES.review;
    onCodeChange(example.code);
    onQuestionChange(example.question);
    onLanguageChange(example.language);
  };

  const charCount = code.length;
  const isNearLimit = charCount > 6000;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Header row: Language selector + Example button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Language
          </label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text)",
              fontSize: "0.8rem",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadExample}
          disabled={isLoading}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text2)",
            fontSize: "0.75rem",
            padding: "4px 10px",
          }}
        >
          Try an example ✨
        </button>
      </div>

      {/* Code Textarea */}
      <div style={{ position: "relative" }}>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--text3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "4px",
          }}
        >
          Your Code
        </p>
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder={`Paste your ${language === "Auto-detect" ? "" : language + " "}code here...`}
          rows={10}
          style={{
            width: "100%",
            background: "var(--bg)",
            border: `1px solid ${isNearLimit ? "var(--warning)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            color: "#a5f3fc",
            fontSize: "0.83rem",
            padding: "0.75rem 1rem",
            lineHeight: 1.7,
          }}
        />
        {/* Character count */}
        <span
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            fontSize: "0.7rem",
            color: isNearLimit ? "var(--warning)" : "var(--text3)",
          }}
        >
          {charCount}/8000
        </span>
      </div>

      {/* Optional question input */}
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--text3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "4px",
          }}
        >
          Your Question{" "}
          <span style={{ fontWeight: 400, textTransform: "none" }}>
            (optional)
          </span>
        </p>
        <input
          type="text"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && code.trim()) onSubmit();
          }}
          placeholder='e.g. "Why is this giving a TypeError?" or "Is there a faster way?"'
          style={{
            width: "100%",
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text)",
            fontSize: "0.875rem",
            padding: "0.6rem 0.875rem",
          }}
        />
      </div>

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={!code.trim() || isLoading}
        style={{
          width: "100%",
          background: code.trim() && !isLoading ? "var(--accent)" : "var(--bg3)",
          color: code.trim() && !isLoading ? "white" : "var(--text3)",
          borderRadius: "var(--radius-md)",
          padding: "0.75rem",
          fontSize: "0.9rem",
          fontWeight: 600,
          letterSpacing: "0.01em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {isLoading ? (
          <>
            <span className="animate-spin" style={{ fontSize: "1rem" }}>
              ⟳
            </span>
            Analyzing...
          </>
        ) : (
          <>Analyze Code →</>
        )}
      </button>
    </div>
  );
}
