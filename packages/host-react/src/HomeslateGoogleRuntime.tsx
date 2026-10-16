import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { GoogleRuntimeProvider, type GoogleRuntime } from "@homeslate/widgets";
import { joinUrl } from "./api";

export type HomeslateGoogleRuntimeProps = {
  displayId: string | null;
  isPreview?: boolean;
  /** Prefix for API calls. Defaults to `""` (same origin). */
  apiBaseUrl?: string;
  children: ReactNode;
};

/**
 * Wires the `@homeslate/widgets` Google runtime to the homeslate API's
 * `/api/google/*` routes.
 */
export function HomeslateGoogleRuntime({
  displayId,
  isPreview = false,
  apiBaseUrl = "",
  children,
}: HomeslateGoogleRuntimeProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch(joinUrl(apiBaseUrl, "/api/google/session"));
      const body = (await response.json()) as { accessToken?: string | null };
      const next = body.accessToken ?? null;
      setAccessToken(next);
      return next;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void refreshAccessToken();
  }, [refreshAccessToken]);

  const value = useMemo<GoogleRuntime>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      signIn: () => {
        window.location.href = joinUrl(apiBaseUrl, "/api/google/connect");
      },
      refreshAccessToken,
      displayId,
      isPreview,
      kioskFetchBaseUrl: joinUrl(apiBaseUrl, "/api"),
    }),
    [accessToken, apiBaseUrl, displayId, isLoading, isPreview, refreshAccessToken],
  );

  return <GoogleRuntimeProvider value={value}>{children}</GoogleRuntimeProvider>;
}
