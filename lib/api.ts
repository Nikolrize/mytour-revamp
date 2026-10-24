import type { ApiErrorResponse } from "@/lib/type";

// Preserve HTTP status and error codes for query retry rules and UI handling.
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function readError(payload: unknown, status: number): ApiErrorResponse {
  const message =
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
      ? payload.message
      : "The request could not be completed.";
  const code =
    payload &&
    typeof payload === "object" &&
    "code" in payload &&
    typeof payload.code === "string"
      ? payload.code
      : `HTTP_${status}`;
  return { message, code };
}

export async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  // Allow AbortError to propagate so React Query can cancel obsolete requests.
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (cause) {
    if (
      init?.signal?.aborted ||
      (cause instanceof Error && cause.name === "AbortError")
    )
      throw cause;
    throw new ApiError(
      "Could not connect to the server. Check your connection and try again.",
      0,
      "NETWORK_ERROR",
    );
  }
  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    if (response.ok)
      throw new ApiError(
        "The server returned an invalid response. Please try again.",
        response.status,
        "INVALID_RESPONSE",
      );
  }
  if (!response.ok) {
    const error = readError(payload, response.status);
    throw new ApiError(error.message, response.status, error.code);
  }
  if (payload === undefined && response.status !== 204) {
    throw new ApiError(
      "The server returned an empty response. Please try again.",
      response.status,
      "INVALID_RESPONSE",
    );
  }
  return payload as T;
}

// Retrying rejected credentials, permissions, or validation does not help the user.
export function shouldRetryQuery(failureCount: number, error: Error) {
  if (
    error instanceof ApiError &&
    error.status >= 400 &&
    error.status < 500 &&
    ![408, 429].includes(error.status)
  )
    return false;
  return failureCount < 1;
}
