export async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload && typeof payload.message === "string"
        ? payload.message
        : "The request could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}
