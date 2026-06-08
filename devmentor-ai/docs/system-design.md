# DevMentor AI — System Design Document

**Author:** Akhil S Nair  
**Date:** June 2026  
**Word count:** ~720 words

---

## Problem Statement

Early-career developers consistently face a learning bottleneck: they write code, encounter bugs or bad patterns, and have no immediate way to get feedback. Stack Overflow provides answers but not explanations tailored to their code. Generic AI chatbots give responses but lack structured mentorship. DevMentor AI addresses this with a tool purpose-built for the learner — providing code review, debugging help, concept explanations, and comprehension quizzes, all powered by a live LLM API.

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│                  Browser                      │
│   ┌──────────────┐    ┌───────────────────┐  │
│   │ ModeSelector │    │  ResponsePanel    │  │
│   │ CodeInput    │    │  (streaming SSE)  │  │
│   └──────┬───────┘    └─────────▲─────────┘  │
└──────────┼─────────────────────────┼──────────┘
           │ POST /api/review        │ SSE stream
┌──────────▼────────────────────────┼──────────┐
│                Express.js          │           │
│   ┌──────────────┐  ┌─────────────┴────────┐ │
│   │ Rate Limiter │  │    Prompt Engine     │ │
│   │ + Validator  │  │ (4 mode templates)   │ │
│   └──────┬───────┘  └─────────────┬────────┘ │
└──────────┼───────────────────────┼───────────┘
           │ Anthropic SDK          │
┌──────────▼───────────────────────┴──────────┐
│          Claude Sonnet API                   │
│          (streaming messages)                │
└──────────────────────────────────────────────┘
```

---

## Component Breakdown

### Frontend (React 18 + Vite)

The UI is a single-page application with three main components and one custom hook.

**ModeSelector** presents four modes (Code Review, Debug Help, Explain Code, Quiz Me) as interactive cards. The selected mode is lifted to App state and passed down to both the input component (to load relevant examples) and the API hook (to select the correct system prompt).

**CodeInput** handles code entry, language selection, and an optional freeform question. The "Try an example" button loads a pre-written snippet appropriate to the active mode — this lowers the barrier to first use and helps demonstrate the tool during a live demo.

**ResponsePanel** consumes a string of streamed markdown and renders it progressively using `react-markdown`. A blinking cursor indicates live streaming. When streaming ends, copy and "New Analysis" buttons appear.

**useDevMentor (custom hook)** encapsulates all API communication. It calls the backend, reads the Server-Sent Events stream chunk-by-chunk using the Fetch ReadableStream API, and appends each token to the `response` state — producing the word-by-word streaming effect without any WebSocket complexity.

### Backend (Node.js + Express)

**Rate limiter** caps requests at 20 per IP per 15 minutes using `express-rate-limit`. This prevents abuse without requiring user authentication.

**Input validator** enforces a maximum code length of 8,000 characters and whitelists valid mode values, returning clear error messages for bad inputs.

**Prompt Engine** selects one of four system prompts based on the requested mode. Each prompt specifies:
- A role and persona for Claude to adopt
- The exact markdown output structure (using `##` headings and code blocks)
- A tone constraint (encouraging for review, direct for debug, simple for explain)
- A length heuristic ("readable in under 3 minutes")

The user message is constructed from: `Language: {lang}\n\nCode:\n\`\`\`\n{code}\n\`\`\`\n\nQuestion: {question}`.

**Streaming pipeline** uses the Anthropic SDK's `messages.stream()` method. Each `content_block_delta` event is forwarded to the client as an SSE event (`data: {"text": "..."}\n\n`). This means the first token reaches the browser in under a second, regardless of total response length.

---

## Prompt Design

The most critical design decision was using separate, mode-specific system prompts rather than a single prompt with a mode parameter. Testing revealed that a single prompt produces "averaged" responses — moderately good at everything but excellent at nothing.

For example, the `review` prompt requires Claude to always lead with positives ("What You Did Well") before criticisms. This ordering is pedagogically important for beginner learners and cannot be reliably enforced through a shared prompt without it bleeding into debug mode.

The `quiz` prompt uses a specific `<details>/<summary>` HTML block for answers, enabling native browser collapsing — this small format choice makes the quiz genuinely interactive without any JavaScript.

---

## Trade-offs

**Streaming vs. single response:** Streaming adds complexity (SSE, chunked parsing) but dramatically improves perceived performance. For a 500-word response, streaming begins rendering in ~1 second; waiting for the complete response takes 4-6 seconds. The UX difference is significant enough to justify the implementation cost.

**Client-side markdown rendering:** `react-markdown` adds ~30KB to the bundle but handles all formatting (code blocks, headers, bold, collapsible details) correctly out of the box. Writing a custom renderer would be error-prone for a prototype.

**No authentication:** The prototype uses IP-based rate limiting only. Adding auth would require a database, session management, and a login UI — all out of scope for a 3-day build. For production, JWT-based auth + a usage tracking database would be the next step.

**Model choice (claude-sonnet-4 vs. claude-haiku):** Haiku is 10× cheaper and faster, but early testing showed it produced noticeably shorter explanations and skipped the real-world analogy section in explain mode. Sonnet's quality justifies the cost for this use case.

---

## Key Learnings

Building this reinforced three principles: (1) prompt structure matters as much as model choice, (2) streaming is non-negotiable for real-time AI UX, and (3) a focused single-purpose tool beats a general-purpose chatbot for specific workflows.
