import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const OPENROUTER_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

// ─── STARTUP CHECK ─────────────────────────────────────────────────────────────
if (!OPENROUTER_API_KEY) {
  console.error("❌ OPENROUTER_API_KEY is missing from your .env file!");
  process.exit(1);
}

// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:3000",
  ]
}));
app.use(express.json({ limit: "50kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many requests. Please wait a few minutes and try again." },
});
app.use("/api/", limiter);

// ─── PROMPT TEMPLATES ──────────────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  review: `You are DevMentor AI, a senior software engineer who gives warm, encouraging code reviews to beginner and early-career developers. Your goal is to TEACH, not just critique.

When reviewing code:
1. Start with 1-2 genuine positives ("What you did well")
2. Give 2-4 specific, actionable improvements with EXPLANATIONS of WHY
3. Provide corrected code snippets for each issue
4. End with a "Next step to learn" suggestion

Format your response using this exact structure:
## ✅ What You Did Well
[positives here]

## 🔧 Improvements
### Issue 1: [short title]
**Why this matters:** [explanation]
**Fixed code:**
\`\`\`[language]
[corrected snippet]
\`\`\`

## 🚀 Next Step
[one actionable learning suggestion]

Be concise. A beginner should be able to read this in under 3 minutes.`,

  debug: `You are DevMentor AI, a patient debugging mentor. Help beginners find and fix bugs by teaching them the debugging thought process.

Structure your response as:
## 🐛 Bug Found
[clearly state what the bug is in plain English]

## 🔍 Why It Happens
[explain the root cause simply — use an analogy if helpful]

## ✅ Fixed Code
\`\`\`[language]
[the complete corrected code]
\`\`\`

## 🧠 Debugging Tip
[one mental model or technique they can use next time]

Be direct and clear. No jargon.`,

  explain: `You are DevMentor AI, a brilliant CS teacher. Explain programming concepts and code in the clearest possible way for beginners.

Structure your response as:
## 💡 The Core Idea
[1-2 sentence plain English summary, no jargon]

## 📖 How It Works
[step-by-step explanation with the code broken down line by line if relevant]

## 🌍 Real-World Analogy
[one relatable analogy that makes it click]

## 🧪 Try This
[one small experiment they can do to deepen understanding]

Use simple language. If you use a technical term, immediately define it in parentheses.`,

  quiz: `You are DevMentor AI, a quiz generator. Based on the code or topic provided, generate a short quiz to test the user's understanding.

Generate exactly 3 multiple-choice questions. Format as:

## 🎯 Quiz Time!

**Q1: [question]**
- A) [option]
- B) [option]
- C) [option]
- D) [option]

**Q2: [question]**
- A) [option]
- B) [option]
- C) [option]
- D) [option]

**Q3: [question]**
- A) [option]
- B) [option]
- C) [option]
- D) [option]

---
**Answers:** Q1: [letter]) [brief reason] | Q2: [letter]) [brief reason] | Q3: [letter]) [brief reason]

Make questions test genuine understanding, not just memorization.`,
};

// ─── OPENROUTER HELPER ─────────────────────────────────────────────────────────
async function callOpenRouter(systemPrompt, userMessage, stream = true) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "DevMentor AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage  },
      ],
      stream,
      max_tokens: 1500,
    }),
  });
  return response;
}

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    const response = await callOpenRouter(
      "You are a helpful assistant.",
      "Reply with just the word OK.",
      false
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        status: "error",
        api_key_works: false,
        error: data.error?.message || "Unknown error",
      });
    }

    res.json({
      status: "ok",
      model: MODEL,
      api_key_works: true,
      test_response: data.choices?.[0]?.message?.content || "OK",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─── MAIN REVIEW ENDPOINT ──────────────────────────────────────────────────────
app.post("/api/review", async (req, res) => {
  const { code, question, mode, language } = req.body;

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Please paste some code before clicking Analyze." });
  }
  if (code.length > 8000) {
    return res.status(400).json({ error: "Code is too long. Please limit to around 200 lines." });
  }

  const validModes = ["review", "debug", "explain", "quiz"];
  const selectedMode = validModes.includes(mode) ? mode : "review";
  const systemPrompt = SYSTEM_PROMPTS[selectedMode];

  const userMessage =
    `Language: ${language || "auto-detect"}\n\nCode:\n\`\`\`\n${code.trim()}\n\`\`\`` +
    (question?.trim() ? `\n\nUser's question: ${question.trim()}` : "");

  try {
    // SSE headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const aiResponse = await callOpenRouter(systemPrompt, userMessage, true);

    if (!aiResponse.ok) {
      const errData = await aiResponse.json();
      const msg = errData.error?.message || "OpenRouter API error";
      console.error("OpenRouter error:", msg);
      if (!res.headersSent) {
        return res.status(aiResponse.status).json({ error: msg });
      }
      return;
    }

    // Read the SSE stream from OpenRouter and forward to browser
    const reader = aiResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
          try {
            const json = JSON.parse(line.slice(6));
            const text = json.choices?.[0]?.delta?.content || "";
            if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
          } catch { /* skip malformed chunks */ }
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error("Server error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  }
});

// ─── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("");
  console.log("╔══════════════════════════════════════════╗");
  console.log("║        DevMentor AI — Backend            ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`✅ Running at:  http://localhost:${PORT}`);
  console.log(`🔑 API Key:     ${OPENROUTER_API_KEY ? "Loaded ✓" : "MISSING ✗"}`);
  console.log(`🤖 Model:       ${MODEL} via OpenRouter`);
  console.log(`🩺 Health URL:  http://localhost:${PORT}/api/health`);
  console.log("");
});
