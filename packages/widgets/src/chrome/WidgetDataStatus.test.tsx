import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { WidgetDataStatus, widgetDataStatus } from "./WidgetDataStatus";
import { SECURITY_CONTROL_MAX_AGE_MS, securityHighRiskLocked } from "../widgets/securityControls";

describe("WidgetDataStatus", () => {
  it("selects stale, ok, error, and loading", () => {
    expect(widgetDataStatus({ lastUpdated: 1, isStale: true })).toBe("stale");
    expect(widgetDataStatus({ lastUpdated: 1, error: "offline" })).toBe("stale");
    expect(widgetDataStatus({ lastUpdated: null, error: "offline" })).toBe("error");
    expect(widgetDataStatus({ lastUpdated: null, isLoading: true })).toBe("loading");
    expect(widgetDataStatus({ lastUpdated: 1 })).toBe("ok");
  });

  it("shows refreshing and cached copy", () => {
    const refreshing = renderToStaticMarkup(
      createElement(WidgetDataStatus, { lastUpdated: Date.now() - 60_000, isStale: true }),
    );
    expect(refreshing).toContain("Updated 1m ago (refreshing…)");

    const cached = renderToStaticMarkup(
      createElement(WidgetDataStatus, { lastUpdated: Date.now(), error: "offline" }),
    );
    expect(cached).toContain("(showing cached data)");
  });
});

describe("security controls", () => {
  it("disables unlock and disarm after two minutes", () => {
    const now = 10_000;
    expect(securityHighRiskLocked(now - SECURITY_CONTROL_MAX_AGE_MS, now)).toBe(false);
    expect(securityHighRiskLocked(now - SECURITY_CONTROL_MAX_AGE_MS - 1, now)).toBe(true);
    expect(securityHighRiskLocked(null, now)).toBe(false);
  });
});
