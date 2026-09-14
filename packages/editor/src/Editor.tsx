import { useCallback, useEffect, useMemo, useRef, useState, type JSX, type ReactNode } from "react";
import { Button, DesignSystemProvider, Dialog, HStack, Stack } from "@var-ui/react";
import { IconSettings, IconUsers } from "@tabler/icons-react";
import type { DisplayDocument, StickyNote, ThemeDocument, ViewBackground } from "@homeslate/schema";
import {
  AlarmsProvider,
  HouseholdEditor,
  HouseholdProvider,
  OverlayPortalContext,
  TimersProvider,
  getWidgetByType,
  getWidgetTypes,
} from "@homeslate/widgets";
import {
  BackgroundSlideshow,
  DocumentCanvas,
  applyWidgetLayouts,
  getCanvasBackgroundStyle,
  patchView,
  patchViewNotes,
  patchWidgetConfig,
  pickActiveDocument,
  removeWidget,
  useCompiledDisplayTheme,
  type WidgetRegistryApi,
} from "@homeslate/display/canvas";
import { BgSettings, WidgetPanel } from "./WidgetPanel";
import * as classes from "./Editor.styles";

const DEFAULT_WIDGET_REGISTRY: WidgetRegistryApi = { getWidgetByType, getWidgetTypes };

export type EditorProps = {
  document: DisplayDocument;
  onChange?: (next: DisplayDocument) => void;
  viewId: string;
  widgetRegistry?: WidgetRegistryApi;
  onUploadBackgroundPhoto?: (payload: {
    dataUrl?: string;
    url?: string;
    filename?: string;
  }) => Promise<{ key: string; filename: string }>;
  actions?: ReactNode;
};

export function Editor(props: EditorProps): JSX.Element {
  const {
    document,
    onChange,
    viewId,
    widgetRegistry = DEFAULT_WIDGET_REGISTRY,
    onUploadBackgroundPhoto,
    actions,
  } = props;
  const [bgSettingsOpen, setBgSettingsOpen] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(false);
  const documentRef = useRef(document);
  // eslint-disable-next-line react-hooks/refs -- keeps the ref current for edits that land in the same tick
  documentRef.current = document;

  const view = document.views.find((item) => item.id === viewId);
  const themeDocument = useMemo(
    () => pickActiveDocument(document.themes as ThemeDocument[], document.activeThemeId),
    [document.themes, document.activeThemeId],
  );
  const theme = useCompiledDisplayTheme(themeDocument);
  const editorColorMode = document.colorMode === "light" ? "light" : "dark";
  const canvasBackground = getCanvasBackgroundStyle(themeDocument, editorColorMode);
  const rootRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<Element | undefined>(undefined);

  useEffect(() => {
    setPortalContainer(rootRef.current ?? undefined);
  }, []);

  const emit = useCallback(
    (next: DisplayDocument) => {
      documentRef.current = next;
      onChange?.(next);
    },
    [onChange],
  );

  const updateBg = useCallback(
    (patch: Partial<ViewBackground>) => {
      const current = documentRef.current;
      const currentView = current.views.find((item) => item.id === viewId);
      if (!currentView) return;
      emit(
        patchView(current, viewId, {
          background: { ...currentView.background, ...patch },
        }),
      );
    },
    [emit, viewId],
  );

  const handleLayoutChange = useCallback(
    (layouts: Array<{ i: string; x: number; y: number; w: number; h: number }>) => {
      emit(applyWidgetLayouts(documentRef.current, viewId, layouts));
    },
    [emit, viewId],
  );

  const handleWidgetConfigChange = useCallback(
    (widgetId: string, config: Record<string, unknown>) => {
      emit(patchWidgetConfig(documentRef.current, viewId, widgetId, config));
    },
    [emit, viewId],
  );

  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      emit(removeWidget(documentRef.current, viewId, widgetId));
    },
    [emit, viewId],
  );

  const handleAddNote = useCallback(
    (note: StickyNote) => {
      const current = documentRef.current;
      const notes = current.views.find((item) => item.id === viewId)?.notes ?? [];
      emit(patchViewNotes(current, viewId, [...notes, note]));
    },
    [emit, viewId],
  );

  const handleRemoveNote = useCallback(
    (noteId: string) => {
      const current = documentRef.current;
      const notes = current.views.find((item) => item.id === viewId)?.notes ?? [];
      emit(
        patchViewNotes(
          current,
          viewId,
          notes.filter((note) => note.id !== noteId),
        ),
      );
    },
    [emit, viewId],
  );

  const handleUpdateNote = useCallback(
    (noteId: string, updates: Partial<StickyNote>) => {
      const current = documentRef.current;
      const notes = current.views.find((item) => item.id === viewId)?.notes ?? [];
      emit(
        patchViewNotes(
          current,
          viewId,
          notes.map((note) => (note.id === noteId ? { ...note, ...updates } : note)),
        ),
      );
    },
    [emit, viewId],
  );

  return (
    <DesignSystemProvider customTheme={theme} colorMode={editorColorMode}>
      <OverlayPortalContext.Provider value={portalContainer}>
        <div ref={rootRef} className={classes.root}>
          <div className={classes.pageActions}>
            <HStack gap="sm">
              <Button appearance="outline" onPress={() => setBgSettingsOpen(true)}>
                <IconSettings size={16} />
                Background Settings
              </Button>
              <Button appearance="outline" onPress={() => setHouseholdOpen(true)}>
                <IconUsers size={16} />
                Household
              </Button>
              {actions}
            </HStack>
          </div>

          <div className={classes.body}>
            <WidgetPanel
              document={document}
              viewId={viewId}
              onChange={emit}
              widgetRegistry={widgetRegistry}
            />
            <main className={classes.main} style={canvasBackground}>
              {view && <BackgroundSlideshow view={view} />}
              <TimersProvider>
                <HouseholdProvider
                  members={document.household?.members ?? []}
                  onMembersChange={(members) =>
                    emit({ ...documentRef.current, household: { members } })
                  }
                >
                  <AlarmsProvider
                    alarms={document.alarms ?? []}
                    onAlarmsChange={(next) => emit({ ...documentRef.current, alarms: next })}
                  >
                    {view && (
                      <DocumentCanvas
                        view={view}
                        isEditing
                        stickyNotesEnabled={document.settings.stickyNotesEnabled ?? false}
                        widgetRegistry={widgetRegistry}
                        portalContainer={portalContainer}
                        onLayoutChange={handleLayoutChange}
                        onWidgetConfigChange={handleWidgetConfigChange}
                        onRemoveWidget={handleRemoveWidget}
                        onAddNote={handleAddNote}
                        onRemoveNote={handleRemoveNote}
                        onUpdateNote={handleUpdateNote}
                      />
                    )}
                  </AlarmsProvider>
                </HouseholdProvider>
              </TimersProvider>
            </main>
          </div>
          <Dialog.Root
            isOpen={householdOpen}
            onOpenChange={(isOpen) => {
              if (!isOpen) setHouseholdOpen(false);
            }}
            portalContainer={portalContainer}
          >
            <Dialog.Backdrop>
              <Dialog.Popup>
                <Dialog.Title>Household</Dialog.Title>
                <Stack gap="md">
                  <HouseholdEditor
                    members={document.household?.members ?? []}
                    onChange={(members) => emit({ ...documentRef.current, household: { members } })}
                  />
                  <Button onPress={() => setHouseholdOpen(false)}>Done</Button>
                </Stack>
              </Dialog.Popup>
            </Dialog.Backdrop>
          </Dialog.Root>
          <Dialog.Root
            isOpen={bgSettingsOpen}
            onOpenChange={(isOpen) => {
              if (!isOpen) setBgSettingsOpen(false);
            }}
            portalContainer={portalContainer}
          >
            <Dialog.Backdrop>
              <Dialog.Popup>
                <Dialog.Title>View Background</Dialog.Title>
                <Stack gap="md">
                  {view && (
                    <BgSettings
                      view={view}
                      updateBg={updateBg}
                      onUploadBackgroundPhoto={onUploadBackgroundPhoto}
                    />
                  )}
                  <Button onPress={() => setBgSettingsOpen(false)}>Done</Button>
                </Stack>
              </Dialog.Popup>
            </Dialog.Backdrop>
          </Dialog.Root>
        </div>
      </OverlayPortalContext.Provider>
    </DesignSystemProvider>
  );
}
