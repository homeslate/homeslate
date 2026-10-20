import { isImageCacheCandidate } from "../../../packages/widgets/src/services/imageCachePolicy.ts";

const WEEK_SECONDS = 7 * 24 * 60 * 60;

export function isPublicDocumentGet(url: URL, method: string): boolean {
  return method === "GET" && /^\/api\/public\/[^/]+$/.test(url.pathname);
}

export function isServiceCall(url: URL): boolean {
  return url.pathname.startsWith("/api/homeassistant/services");
}

export interface RuntimeCacheRule {
  cacheName: string;
  match: (url: URL, method: string) => boolean;
}

export const runtimeCacheRules: RuntimeCacheRule[] = [
  {
    cacheName: "homeslate-static-v1",
    match: (url, method) =>
      method === "GET" && !url.pathname.startsWith("/api/") && !isImageCacheCandidate(url, method),
  },
  {
    cacheName: "homeslate-document-v1",
    match: (url, method) => isPublicDocumentGet(url, method) && !isServiceCall(url),
  },
  {
    cacheName: "homeslate-data-v1",
    match: (url, method) =>
      method === "GET" &&
      (url.pathname === "/api/commute" ||
        url.pathname === "/api/news" ||
        url.pathname === "/api/calendar/ical" ||
        url.pathname.startsWith("/api/weather/") ||
        url.pathname.startsWith("/api/stocks/") ||
        url.pathname.startsWith("/api/sports/")),
  },
  {
    cacheName: "homeslate-images-v1",
    match: (url, method) => isImageCacheCandidate(url, method) && !isServiceCall(url),
  },
];

export function matchingRuntimeCache(
  url: string,
  method: string,
  pageOrigin = "http://localhost",
): string | null {
  const parsed = new URL(url, pageOrigin);
  if (isServiceCall(parsed)) return null;
  const cacheName = runtimeCacheRules.find((rule) => rule.match(parsed, method))?.cacheName ?? null;
  if (cacheName === "homeslate-images-v1" && parsed.origin !== new URL(pageOrigin).origin)
    return null;
  return cacheName;
}

export const referencePwaOptions = {
  registerType: "autoUpdate" as const,
  injectRegister: "auto" as const,
  devOptions: { enabled: false },
  manifest: {
    name: "Homeslate",
    short_name: "Homeslate",
    description: "Always-on home display",
    display: "standalone" as const,
    start_url: "/",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
    // The reference app shell is one large chunk. Precache it so a warm
    // kiosk can boot offline; the default Workbox cap is 2 MiB.
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    navigateFallback: "/index.html",
    navigateFallbackDenylist: [/^\/api\//],
    // Workbox copies each urlPattern with Function#toString. Keep the
    // bodies self-contained so the service worker does not call missing imports.
    runtimeCaching: [
      {
        urlPattern: ({ url, request }: { url: URL; request: { method: string } }) => {
          if (request.method !== "GET" || url.pathname.startsWith("/api/")) return false;
          return !/\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(url.pathname);
        },
        handler: "StaleWhileRevalidate" as const,
        options: { cacheName: "homeslate-static-v1" },
      },
      {
        urlPattern: ({ url, request }: { url: URL; request: { method: string } }) =>
          request.method === "GET" && /^\/api\/public\/[^/]+$/.test(url.pathname),
        handler: "NetworkFirst" as const,
        options: {
          cacheName: "homeslate-document-v1",
          expiration: { maxAgeSeconds: WEEK_SECONDS },
        },
      },
      {
        urlPattern: ({ url, request }: { url: URL; request: { method: string } }) => {
          if (request.method !== "GET") return false;
          return (
            url.pathname === "/api/commute" ||
            url.pathname === "/api/news" ||
            url.pathname === "/api/calendar/ical" ||
            url.pathname.startsWith("/api/weather/") ||
            url.pathname.startsWith("/api/stocks/") ||
            url.pathname.startsWith("/api/sports/")
          );
        },
        handler: "StaleWhileRevalidate" as const,
        options: {
          cacheName: "homeslate-data-v1",
          expiration: { maxEntries: 200, maxAgeSeconds: WEEK_SECONDS },
          cacheableResponse: { statuses: [200] },
        },
      },
      {
        urlPattern: ({
          url,
          request,
          sameOrigin,
        }: {
          url: URL;
          request: { method: string };
          sameOrigin: boolean;
        }) => {
          if (!sameOrigin || request.method !== "GET") return false;
          if (url.pathname.startsWith("/api/homeassistant/services")) return false;
          if (url.pathname === "/api/homeassistant/image" || url.pathname === "/api/photo-proxy")
            return true;
          if (url.pathname.startsWith("/api/")) return false;
          return /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(url.pathname);
        },
        handler: "StaleWhileRevalidate" as const,
        options: {
          cacheName: "homeslate-images-v1",
          expiration: { maxEntries: 100, maxAgeSeconds: WEEK_SECONDS },
          cacheableResponse: { statuses: [200] },
        },
      },
    ],
  },
};
