export const HOST_REACT_PACKAGE_NAME = "@homeslate/host-react";

export { HomeslateApp } from "./HomeslateApp";
export type { HomeslateAppProps } from "./HomeslateApp";
export { DisplayListPage, EditorPage, KioskPage, ViewEditorPage } from "./pages";
export { RouteErrorBoundary, RouteErrorFallback } from "./RouteErrorBoundary";
export { TemplatePicker } from "./TemplatePicker";
export { HomeslateGoogleRuntime } from "./HomeslateGoogleRuntime";
export type { HomeslateGoogleRuntimeProps } from "./HomeslateGoogleRuntime";
export { DEFAULT_HOMESLATE_HOST, HomeslateHostProvider, useHomeslateHost } from "./hostContext";
export type { HomeslateHostConfig } from "./hostContext";
export { useDisplayDocument } from "./useDisplayDocument";
export type { DisplayDocumentState } from "./useDisplayDocument";
export { createDebouncedPersist } from "./createDebouncedPersist";
export type { DebouncedPersist, PersistPutOptions } from "./createDebouncedPersist";
export {
  errorMessage,
  getJson,
  getPublicDocument,
  joinUrl,
  patchJson,
  createDisplay,
  postJson,
  publicDocumentUrl,
  putJson,
  readError,
  setDisplayPasscode,
} from "./api";
export type { DisplayRecord, DisplaySummary, KioskDocumentResult } from "./api";
