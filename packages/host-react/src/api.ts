import type { DisplayDocument } from "@homeslate/schema";

export type DisplaySummary = { id: string; name: string };

export type DisplayRecord = {
  id: string;
  publicId: string;
  document: DisplayDocument;
};

/** Join an API base URL and a path without doubling the slash. */
export function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json() as Promise<T>;
}

export async function postJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json() as Promise<T>;
}

export async function putJson(
  url: string,
  body: DisplayDocument,
  options?: { keepalive?: boolean },
): Promise<void> {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: options?.keepalive,
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
}

export async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      error?: string;
      errors?: Array<{ path?: string; message?: string }>;
    };
    if (body.error) return body.error;
    if (body.errors?.length) {
      return body.errors
        .map((issue) => [issue.path, issue.message].filter(Boolean).join(": "))
        .join("; ");
    }
  } catch {
    // Body was not JSON; fall back to the status line below.
  }
  return `${response.status} ${response.statusText}`;
}

export function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
