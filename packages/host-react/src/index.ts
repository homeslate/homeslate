export const HOST_REACT_PACKAGE_NAME = "@homeslate/host-react";

export { HomeslateApp } from "./HomeslateApp";
export type { HomeslateAppProps } from "./HomeslateApp";
export { DisplayListPage, EditorPage, KioskPage } from "./pages";
export { HomeslateGoogleRuntime } from "./HomeslateGoogleRuntime";
export type { HomeslateGoogleRuntimeProps } from "./HomeslateGoogleRuntime";
export { DEFAULT_HOMESLATE_HOST, HomeslateHostProvider, useHomeslateHost } from "./hostContext";
export type { HomeslateHostConfig } from "./hostContext";
export { createDebouncedPersist } from "./createDebouncedPersist";
export type { DebouncedPersist, PersistPutOptions } from "./createDebouncedPersist";
export { errorMessage, getJson, joinUrl, postJson, putJson, readError } from "./api";
export type { DisplayRecord, DisplaySummary } from "./api";
