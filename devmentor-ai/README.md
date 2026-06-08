# 🤖 DevMentor AI

> An AI-powered code review and learning assistant for student and early-career developers.

![DevMentor AI Demo](https://img.shields.io/badge/Status-Working_Prototype-22c55e?style=flat-square)
![Powered by Claude](https://img.shields.io/badge/LLM-Claude_Sonnet_API-6366f1?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Express.js-339933?style=flat-square&logo=node.js)

---

## 🎯 The Problem

Students and early-career developers write code and hit walls — bugs they can't fix, patterns they don't understand, no senior developer nearby to help. Stack Overflow gives answers but not explanations. ChatGPT gives code but not mentorship.

**DevMentor AI bridges that gap**: it acts as your 24/7 senior developer mentor, giving real, educational feedback on your code — not just answers, but understanding.

---

## ✨ Features

| Mode | What it does |
|------|-------------|
| 🔍 **Code Review** | Structured feedback: what you did well + specific improvements with code examples |
| 🐛 **Debug Help** | Finds your bug, explains *why* it happens, provides the fix + a debugging tip |
| 💡 **Explain Code** | Line-by-line breakdown with a real-world analogy that makes it click |
| 🎯 **Quiz Me** | Generates 3 MCQs from your code to test your understanding |

**Other highlights:**
- ⚡ Streaming responses (word-by-word, like ChatGPT)
- 🌐 Supports 12+ languages: Python, JS, Java, C, Go, Rust, SQL...
- 📋 One-click copy of the full analysis
- 🧪 Built-in code examples to try each mode instantly

---

## 🏗 Architecture

```
User (Browser)
    │
    ▼
React Frontend (Vite)          ← Port 5173
    │  • ModeSelector
    │  • CodeInput + Question
    │  • ResponsePanel (streaming markdown)
    │
    ▼  POST /api/review
Express.js Backend             ← Port 3001
    │  • Input validation (max 8000 chars)
    │  • Rate limiting (20 req / 15 min)
    │  • Prompt Engine (mode-aware templates)
    │
    ▼  Streaming API call
Anthropic Claude API           ← claude-sonnet-4
    │  • System prompt (role + output format)
    │  • User message (language + code + question)
    │
    ▼  Server-Sent Events (SSE)
Back to Frontend (streamed chunk by chunk)
```

**Data flow:** Code + mode → prompt template → Claude API → streamed markdown → rendered in browser.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/devmentor-ai.git
cd devmentor-ai
```

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm run dev
```

### 3. Set up the frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Open your browser
Visit `http://localhost:5173`

---

## 📁 Project Structure

```
devmentor-ai/
├── backend/
│   ├── src/
│   │   └── index.js          # Express server + prompt engine + Claude API
│   ├── .env.example          # Environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ModeSelector.jsx   # The 4 AI modes UI
│   │   │   ├── CodeInput.jsx      # Code editor + question input
│   │   │   └── ResponsePanel.jsx  # Streaming markdown output
│   │   ├── hooks/
│   │   │   └── useDevMentor.js    # Custom hook: streaming API client
│   │   ├── App.jsx                # Root component, state management
│   │   ├── index.css              # Global styles + markdown theme
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   └── vite.config.js
│
├── docs/
│   └── system-design.md      # Full system design document
│
└── README.md
```

---

## 🧠 Prompt Engineering

The backend has four carefully engineered system prompts, one per mode. Here's the key design decision:

**Why separate prompts per mode instead of one big prompt?**

Each mode needs a fundamentally different *personality* and *output format*:
- `review` mode needs to be encouraging and structured (positives first)
- `debug` mode needs to be direct and diagnostic (bug → cause → fix → tip)
- `explain` mode needs analogies and simple language
- `quiz` mode needs to output parseable MCQ format

Mixing these into one prompt causes Claude to produce generic responses that aren't optimal for any use case.

**Key prompt engineering techniques used:**
1. **Role assignment** — "You are DevMentor AI, a senior software engineer..."
2. **Output format specification** — Exact markdown structure with `## ✅ What You Did Well`
3. **Behavioral constraints** — "Be concise. A beginner should read this in under 3 minutes."
4. **Persona consistency** — Each prompt establishes a consistent teaching persona

---

## ⚖️ Trade-offs Considered

| Decision | Chose | Alternative | Why |
|----------|-------|-------------|-----|
| **Streaming** | SSE streaming | Wait for full response | Much better UX — feels instant |
| **Separate prompts** | 4 focused prompts | 1 mega-prompt | Better quality per mode |
| **Frontend rendering** | ReactMarkdown | Custom renderer | Saves dev time, well-tested |
| **Rate limiting** | Express middleware | None / DB-based | Simple, effective for prototype |
| **Model** | claude-sonnet-4 | Opus / Haiku | Best balance of quality + cost |

---

## 🔮 What I'd Build Next

If I had more time:
- **Authentication** — Let users save and revisit past analyses
- **File upload** — Accept `.py`, `.js` etc. instead of paste-only
- **History panel** — See all previous reviews in the session
- **Diff view** — Show original vs. corrected code side by side
- **Shareable links** — Share a review with a classmate

---

## 👤 Built By

**Akhil S Nair** — B.Tech CSE (AI & ML), 2025 Graduate  
Sree Buddha College of Engineering, Kerala

📧 akhilsnair.work@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/akhil-s-nair-65232427b)
