import type { DisplayStore } from "@homeslate/adapters";
import type { TokenStore } from "@homeslate/google";
import type { HomeAssistantTransport } from "./homeAssistant";

/** Google OAuth client credentials. Empty strings disable the calendar routes. */
export type HomeslateGoogleCredentials = {
  clientId?: string;
  clientSecret?: string;
};

/**
 * Home Assistant connection. Omit (or blank either field) to disable the
 * `/api/homeassistant/*` routes; widgets stay designable but show config copy.
 */
export type HomeslateHomeAssistantCredentials = {
  baseUrl?: string;
  token?: string;
  /**
   * Supply a transport directly (e.g. the relay transport for a hosted host)
   * instead of `baseUrl`/`token`. Takes precedence when set.
   */
  transport?: HomeAssistantTransport;
};

export type HomeslateServerOptions = {
  /** Directory for the sqlite database and Google refresh tokens. */
  dataDir: string;
  /**
   * Externally reachable origin of the host, used to build the OAuth redirect
   * URI. Must match the Authorized redirect URI registered for the client.
   */
  publicBaseUrl?: string;
  /** Google OAuth client. Omit (or pass empty strings) to disable calendar. */
  google?: HomeslateGoogleCredentials;
  /** Home Assistant connection. Omit (or pass empty strings) to disable HA widgets. */
  homeAssistant?: HomeslateHomeAssistantCredentials;
  /** openrouteservice.org API key. Omit to disable the commute route. */
  openRouteServiceApiKey?: string;
  /** Account that owns the single-user display. Defaults to `"local"`. */
  accountId?: string;
  /**
   * Override the display store. Defaults to a sqlite store in `dataDir`.
   * The display → Google account binding stays in sqlite in `dataDir`.
   */
  displayStore?: DisplayStore;
  /** Override the token store. Defaults to a file store in `dataDir`. */
  tokenStore?: TokenStore;
};

export type HomeslateListenInfo = {
  hostname: string;
  port: number;
};
