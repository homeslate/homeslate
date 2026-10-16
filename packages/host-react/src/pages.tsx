import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import type { DisplayDocument } from "@homeslate/schema";
import { Editor } from "@homeslate/editor";
import { Display } from "@homeslate/display";
import {
  errorMessage,
  getJson,
  joinUrl,
  postJson,
  putJson,
  type DisplayRecord,
  type DisplaySummary,
} from "./api";
import { createDebouncedPersist } from "./createDebouncedPersist";
import { HomeslateGoogleRuntime } from "./HomeslateGoogleRuntime";
import { useHomeslateHost } from "./hostContext";

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

/** Lists displays and offers a "New display" button. */
export function DisplayListPage() {
  const navigate = useNavigate();
  const { apiBaseUrl, productName } = useHomeslateHost();
  const [displays, setDisplays] = useState<Array<DisplaySummary & { publicId?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await getJson<DisplaySummary[]>(joinUrl(apiBaseUrl, "/api/displays"));
        const withPublicIds = await Promise.all(
          list.map(async (item) => {
            const record = await getJson<DisplayRecord>(
              joinUrl(apiBaseUrl, `/api/displays/${item.id}`),
            );
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
  }, [apiBaseUrl]);

  const createDisplay = async () => {
    setCreating(true);
    setError(null);
    try {
      const record = await postJson<DisplayRecord>(joinUrl(apiBaseUrl, "/api/displays"));
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
          heading={<TopNav.Heading heading={productName} />}
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

/** Editor route. Loads the display by id and persists edits with a debounce. */
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const { apiBaseUrl, widgetRegistry } = useHomeslateHost();
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
    <HomeslateGoogleRuntime displayId={record.publicId} apiBaseUrl={apiBaseUrl}>
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
          <Editor
            document={record.document}
            viewId={viewId}
            widgetRegistry={widgetRegistry}
            onChange={onChange}
          />
        </div>
      </AppShell>
    </HomeslateGoogleRuntime>
  );
}

/** Kiosk route. Polls the public document and renders it full-bleed. */
export function KioskPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const { apiBaseUrl, widgetRegistry } = useHomeslateHost();
  const [document, setDocument] = useState<DisplayDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const body = await getJson<{ document: DisplayDocument }>(
          joinUrl(apiBaseUrl, `/api/public/${publicId}`),
        );
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
  }, [apiBaseUrl, publicId]);

  const onChange = useCallback(
    (next: DisplayDocument) => {
      setDocument(next);
      if (!publicId) return;
      void putJson(joinUrl(apiBaseUrl, `/api/public/${publicId}`), next).then(
        () => setSaveError(null),
        (cause: unknown) => setSaveError(errorMessage(cause)),
      );
    },
    [apiBaseUrl, publicId],
  );

  if (error && !document)
    return (
      <Text role="alert" style={{ padding: "1rem" }}>
        {error}
      </Text>
    );
  if (!document || !publicId) return <Spinner />;

  return (
    <HomeslateGoogleRuntime displayId={publicId} apiBaseUrl={apiBaseUrl}>
      {saveError && (
        <Text as="span" size="sm" role="alert" style={KIOSK_SAVE_ERROR_STYLE}>
          Not saved: {saveError}
        </Text>
      )}
      <Display document={document} widgetRegistry={widgetRegistry} onChange={onChange} />
    </HomeslateGoogleRuntime>
  );
}
