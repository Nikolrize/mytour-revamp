import "server-only";

export class ItineraryServiceError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const models = (configured: string | undefined, defaults: string[]) =>
  [
    ...new Set(
      (configured ? configured.split(",") : defaults)
        .map((model) => model.trim())
        .filter(Boolean),
    ),
  ].slice(0, 3);

// Providers are only enabled when their server-side key has been configured.
export async function generateItinerary<T>(
  prompt: string,
  validate: (value: unknown) => T,
): Promise<T> {
  const candidates = [
    ...models(process.env.GEMINI_MODELS || process.env.GEMINI_MODEL, [
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
    ]).map((model) => ({
      provider: "gemini" as const,
      model,
      key: process.env.GEMINI_API_KEY,
    })),
    ...models(process.env.GROQ_MODELS, [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
    ]).map((model) => ({
      provider: "groq" as const,
      model,
      key: process.env.GROQ_API_KEY,
    })),
  ].filter((candidate) => candidate.key);
  let quotaFailures = 0;
  let authFailures = 0;
  const started = performance.now();
  const blockedProviders = new Set<string>();
  for (const { provider, model, key } of candidates) {
    const remaining = 65000 - (performance.now() - started);
    if (remaining < 1000) break;
    if (blockedProviders.has(provider)) continue;
    try {
      const gemini = provider === "gemini";
      const response = await fetch(
        gemini
          ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
          : "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: gemini
            ? { "Content-Type": "application/json", "x-goog-api-key": key! }
            : {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
              },
          body: JSON.stringify(
            gemini
              ? {
                  contents: [{ role: "user", parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 12000,
                  },
                }
              : {
                  model,
                  messages: [
                    {
                      role: "system",
                      content:
                        "Return only a JSON object containing a stops array.",
                    },
                    { role: "user", content: prompt },
                  ],
                  response_format: { type: "json_object" },
                  max_completion_tokens: 12000,
                },
          ),
          signal: AbortSignal.timeout(Math.min(20000, Math.floor(remaining))),
          cache: "no-store",
        },
      );
      if (!response.ok) {
        // Log model/status only: credentials, prompts and private trip data stay out of logs.
        console.warn("AI itinerary provider failed", {
          provider,
          model,
          status: response.status,
        });
        if (response.status === 429) quotaFailures++;
        if (response.status === 401 || response.status === 403) {
          authFailures++;
          blockedProviders.add(provider);
        }
        continue;
      }
      const result = await response.json();
      const text: unknown = gemini
        ? result.candidates?.[0]?.content?.parts
            ?.filter(
              (part: { thought?: boolean; text?: string }) =>
                !part.thought && typeof part.text === "string",
            )
            .map((part: { text: string }) => part.text)
            .join("")
        : result.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim())
        throw new Error("Empty response");
      const parsed: unknown = JSON.parse(
        text
          .trim()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, ""),
      );
      return validate(
        Array.isArray(parsed)
          ? parsed
          : (parsed as { stops?: unknown } | null)?.stops,
      );
    } catch {
      // Invalid JSON, invalid schedules and timeouts all advance to the next model.
      console.warn(
        "AI itinerary attempt timed out or returned an invalid plan",
        { provider, model },
      );
    }
  }
  if (quotaFailures)
    throw new ItineraryServiceError(
      "AI planning has reached the available provider limits. Try again later or configure another provider's free-tier key.",
      429,
    );
  if (authFailures)
    throw new ItineraryServiceError(
      "AI provider credentials were rejected. Check the server API keys and model permissions.",
      503,
    );
  throw new ItineraryServiceError(
    "The configured AI models could not produce a valid trip. Please try again. Check server logs for provider status codes.",
    502,
  );
}
