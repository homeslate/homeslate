import { useCallback, useEffect, useMemo, useState } from "react";
import type { DisplayDocument } from "@homeslate/schema";
import { errorMessage, getJson, joinUrl, putJson, type DisplayRecord } from "./api";
import { createDebouncedPersist } from "./createDebouncedPersist";

const EDITOR_PUT_DEBOUNCE_MS = 400;

export type DisplayDocumentState = {
  record: DisplayRecord | null;
  document: DisplayDocument | null;
  passcodeEnabled: boolean;
  error: string | null;
  saveError: string | null;
  setDocument: (next: DisplayDocument) => void;
  setPasscodeEnabled: (enabled: boolean) => void;
};

/**
 * Loads one display and persists document edits with a debounce. The pending
 * PUT flushes on unmount so navigating between management and the view editor
 * cannot drop the last keystroke.
 */
export function useDisplayDocument(
  apiBaseUrl: string,
  id: string | undefined,
): DisplayDocumentState {
  const [record, setRecord] = useState<DisplayRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const persist = useMemo(
    () =>
      createDebouncedPersist((next: DisplayDocument, { keepalive }) => {
        if (!id) return;
        void putJson(joinUrl(apiBaseUrl, `/api/displays/${id}`), next, { keepalive }).then(
          () => setSaveError(null),
          (cause: unknown) => setSaveError(errorMessage(cause)),
        );
      }, EDITOR_PUT_DEBOUNCE_MS),
    [apiBaseUrl, id],
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const next = await getJson<DisplayRecord>(joinUrl(apiBaseUrl, `/api/displays/${id}`));
        if (!cancelled) setRecord(next);
      } catch (cause) {
        if (!cancelled) setError(errorMessage(cause));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, id]);

  useEffect(() => {
    const detach = persist.attach();
    return () => {
      detach();
      persist.flush();
    };
  }, [persist]);

  const setDocument = useCallback(
    (next: DisplayDocument) => {
      setRecord((current) => (current ? { ...current, document: next } : current));
      persist.schedule(next);
    },
    [persist],
  );

  const setPasscodeEnabled = useCallback((enabled: boolean) => {
    setRecord((current) => (current ? { ...current, passcodeEnabled: enabled } : current));
  }, []);

  return {
    record,
    document: record?.document ?? null,
    passcodeEnabled: record?.passcodeEnabled ?? false,
    error,
    saveError,
    setDocument,
    setPasscodeEnabled,
  };
}
