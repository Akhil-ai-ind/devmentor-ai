import { useState, useCallback } from "react";

/**
 * useDevMentor — Custom hook that handles streaming API calls to the backend.
 *
 * LESSON for Akhil:
 * - This hook encapsulates all API logic away from the UI.
 * - It uses the Fetch API with streaming (ReadableStream) to show
 *   Gemini's response word-by-word as it arrives, instead of waiting
 *   for the whole thing. This makes the UX feel much faster.
 * - "useCallback" prevents the function from being re-created on every render.
 */
export function useDevMentor() {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async ({ code, question, mode, language }) => {
    // Reset state before new request
    setResponse("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, question, mode, language }),
      });

      // Handle non-streaming errors (400, 401, 429, 500)
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      // ── STREAMING RESPONSE HANDLER ──────────────────────────────────
      // The backend sends Server-Sent Events (SSE).
      // Each event looks like: data: {"text": "Hello"}\n\n
      // We read the stream chunk by chunk and append to the response state.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep the incomplete line in the buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.done) break;
              if (json.text) {
                // Append each streamed chunk to the response
                setResponse((prev) => prev + json.text);
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse("");
    setError(null);
    setIsLoading(false);
  }, []);

  return { response, isLoading, error, analyze, reset };
}
