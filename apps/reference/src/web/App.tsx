import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { RouterProvider } from "react-aria-components";
import {
  Navigate,
  Route,
  BrowserRouter,
  Routes,
  useHref,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  AppShell,
  Button,
  Heading,
  HStack,
  Link,
  Spinner,
  Stack,
  Text,
  TopNav,
} from "@var-ui/react";
import type { DisplayDocument } from "@homeslate/schema";
import { Editor } from "@homeslate/editor";
import { Display } from "@homeslate/display";
import { createDebouncedPersist } from "./editorPersist";
import { ReferenceGoogleRuntime } from "./ReferenceGoogleRuntime";

type DisplaySummary = { id: string; name: string };
type DisplayRecord = { id: string; publicId: string; document: DisplayDocument };

const EDITOR_PUT_DEBOUNCE_MS = 400;
const KIOSK_POLL_MS = 10_000;

const KIOSK_SAVE_ERROR_STYLE: CSSProperties = {
  position: "fixed",
  insetInline: 0,
  top: 0,
  zIndex: 1000,
  textAlign: "center",
  background: "rgba(0, 0, 0, 0.75)",
};

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      <Routes>
        <Route path="/" element={<DisplayListPage />} />
        <Route path="/edit/:id" element={<EditorPage />} />
        <Route path="/d/:publicId" element={<KioskPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouterProvider>
  );
}

function DisplayListPage() {
  const navigate = useNavigate();
  const [displays, setDisplays] = useState<Array<DisplaySummary & { publicId?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await getJson<DisplaySummary[]>("/api/displays");
        const withPublicIds = await Promise.all(
          list.map(async (item) => {
            const record = await getJson<DisplayRecord>(`/api/displays/${item.id}`);
            return { ...item, publicId: record.publicId };
          }),
        );
        if (!cancelled) setDisplays(withPublicIds);
      } catch (cause) {
        if (!cancelled) setError(errorMessage(cause));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const createDisplay = async () => {
    setCreating(true);
    setError(null);
    try {
      const record = await postJson<DisplayRecord>("/api/displays");
      navigate(`/edit/${record.id}`);
    } catch (cause) {
      setError(errorMessage(cause));
      setCreating(false);
    }
  };

  return (
    <AppShell
      contentPadding={4}
      topNav={
        <TopNav
          heading={<TopNav.Heading heading="Homeslate" />}
          endContent={
            <Button intent="primary" onPress={() => void createDisplay()} isPending={creating}>
              New display
            </Button>
          }
        />
      }
    >
      {loading && <Spinner />}
      {error && <Text role="alert">{error}</Text>}
      {!loading && displays.length === 0 && (
        <Text tone="secondary">No displays yet. Create one to open the editor.</Text>
      )}
      <Stack gap="sm">
        {displays.map((display) => (
          <HStack key={display.id} justify="between">
            <Text>{display.name}</Text>
            <HStack gap="md">
              <Link href={`/edit/${display.id}`}>Editor</Link>
              {display.publicId && <Link href={`/d/${display.publicId}`}>Kiosk</Link>}
            </HStack>
          </HStack>
        ))}
      </Stack>
    </AppShell>
  );
}

function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<DisplayRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const persist = useMemo(
    () =>
      createDebouncedPersist((next: DisplayDocument, { keepalive }) => {
        if (!id) return;
        void putJson(`/api/displays/${id}`, next, { keepalive }).then(
          () => setSaveError(null),
          (cause: unknown) => setSaveError(errorMessage(cause)),
        );
      }, EDITOR_PUT_DEBOUNCE_MS),
    [id],
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const next = await getJson<DisplayRecord>(`/api/displays/${id}`);
        if (!cancelled) setRecord(next);
      } catch (cause) {
        if (!cancelled) setError(errorMessage(cause));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const detach = persist.attach();
    return () => {
      detach();
      persist.flush();
    };
  }, [persist]);

  const onChange = useCallback(
    (next: DisplayDocument) => {
      setRecord((current) => (current ? { ...current, document: next } : current));
      persist.schedule(next);
    },
    [persist],
  );

  if (error)
    return (
      <Text role="alert" style={{ padding: "1rem" }}>
        {error}
      </Text>
    );
  if (!record) return <Spinner />;

  const viewId = record.document.activeViewId ?? record.document.views[0].id;

  return (
    <ReferenceGoogleRuntime displayId={record.publicId}>
      <AppShell
        contentPadding={0}
        topNav={
          <TopNav
            heading={
              <HStack gap="md">
                <Link href="/">Displays</Link>
                <Heading level={4}>{record.document.name}</Heading>
              </HStack>
            }
            endContent={
              <HStack gap="md">
                {saveError && (
                  <Text as="span" size="sm" role="alert">
                    Not saved: {saveError}
                  </Text>
                )}
                <Link href={`/d/${record.publicId}`}>Open kiosk</Link>
              </HStack>
            }
          />
        }
      >
        <div style={{ height: "100%", display: "flex" }}>
          <Editor document={record.document} viewId={viewId} onChange={onChange} />
        </div>
      </AppShell>
    </ReferenceGoogleRuntime>
  );
}

function KioskPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [document, setDocument] = useState<DisplayDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const body = await getJson<{ document: DisplayDocument }>(`/api/public/${publicId}`);
        if (!cancelled) {
          setDocument(body.document);
          setError(null);
        }
      } catch (cause) {
        if (!cancelled) setError(errorMessage(cause));
      }
    };

    void load();
    const interval = setInterval(() => void load(), KIOSK_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicId]);

  const onChange = useCallback(
    (next: DisplayDocument) => {
      setDocument(next);
      if (!publicId) return;
      void putJson(`/api/public/${publicId}`, next).then(
        () => setSaveError(null),
        (cause: unknown) => setSaveError(errorMessage(cause)),
      );
    },
    [publicId],
  );

  if (error && !document)
    return (
      <Text role="alert" style={{ padding: "1rem" }}>
        {error}
      </Text>
    );
  if (!document || !publicId) return <Spinner />;

  return (
    <ReferenceGoogleRuntime displayId={publicId}>
      {saveError && (
        <Text as="span" size="sm" role="alert" style={KIOSK_SAVE_ERROR_STYLE}>
          Not saved: {saveError}
        </Text>
      )}
      <Display document={document} onChange={onChange} />
    </ReferenceGoogleRuntime>
  );
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json() as Promise<T>;
}

async function postJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json() as Promise<T>;
}

async function putJson(
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

async function readError(response: Response): Promise<string> {
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

function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
