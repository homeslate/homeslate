import type { DisplayDocument } from "@homeslate/schema";

export type DisplaySummary = { id: string; name: string };

export type DisplayRecord = {
  id: string;
  publicId: string;
  document: DisplayDocument;
  /** True when the kiosk prompts for a 4-digit passcode before rendering. */
  passcodeEnabled?: boolean;
};

/** Join an API base URL and a path without doubling the slash. */
export function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

/** Public (kiosk) document URL, carrying the passcode when one is known. */
export function publicDocumentUrl(
  baseUrl: string,
  publicId: string,
  passcode?: string | null,
): string {
  const url = joinUrl(baseUrl, `/api/public/${encodeURIComponent(publicId)}`);
  return passcode ? `${url}?passcode=${encodeURIComponent(passcode)}` : url;
}

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json() as Promise<T>;
}

export type KioskDocumentResult =
  | { status: "ok"; document: DisplayDocument }
  | { status: "passcode-required" };

/**
 * Fetches the public kiosk document. A display with a passcode answers 401 with
 * `{ passcodeRequired: true }` instead of an error, so that case is returned
 * rather than thrown.
 */
export async function getPublicDocument(
  baseUrl: string,
  publicId: string,
  passcode?: string | null,
): Promise<KioskDocumentResult> {
  const response = await fetch(publicDocumentUrl(baseUrl, publicId, passcode));
  if (response.status === 401) return { status: "passcode-required" };
  if (!response.ok) throw new Error(await readError(response));
  const body = (await response.json()) as { document: DisplayDocument };
  return { status: "ok", document: body.document };
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

export async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json() as Promise<T>;
}

/** Sets (4-digit string) or clears (`null`) the display's kiosk passcode. */
export async function setDisplayPasscode(
  baseUrl: string,
  id: string,
  passcode: string | null,
): Promise<void> {
  await patchJson(joinUrl(baseUrl, `/api/displays/${encodeURIComponent(id)}`), { passcode });
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
