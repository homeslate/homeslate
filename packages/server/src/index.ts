export const SERVER_PACKAGE_NAME = "@homeslate/server";

export { LOCAL_ACCOUNT_ID, createHomeslateServer } from "./createHomeslateServer";
export { startHomeslateServer } from "./node";
export type { StartHomeslateServerOptions } from "./node";
export type {
  HomeslateGoogleCredentials,
  HomeslateListenInfo,
  HomeslateServerOptions,
} from "./types";
export {
  DEFAULT_PUBLIC_BASE_URL,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_STATE_MAX_AGE_S,
  createOAuthState,
  googleAuthorizationUrl,
  googleRedirectUri,
  isMatchingOAuthState,
} from "./oauth";
export { homeslateDatabasePath, homeslateTokensPath } from "./paths";
export { createTtlCache } from "./ttlCache";
export type { TtlCache } from "./ttlCache";
export { estimateCommute } from "./commute";
export { fetchWeatherAlerts, parseWeatherAlertPoint } from "./weatherAlerts";
