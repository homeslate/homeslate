import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import {
  WidgetErrorBoundary,
  WidgetErrorFallback,
  widgetHealthChangeDetail,
} from "./WidgetErrorBoundary";

function BoomIcon() {
  return <span data-icon="boom" />;
}

describe("WidgetErrorBoundary", () => {
  it("getDerivedStateFromError returns the error state", () => {
    const error = new Error("calendar failed");
    expect(WidgetErrorBoundary.getDerivedStateFromError(error)).toEqual({ error });
  });

  it("server-renders the fallback with the widget name, Retry, and Remove", () => {
    const html = renderToStaticMarkup(
      <WidgetErrorFallback
        name="Calendar"
        icon={BoomIcon}
        isEditing
        errorMessage="bad feed"
        showDetails
        onRetry={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(html).toContain("Calendar");
    expect(html).toContain("This widget crashed");
    expect(html).toContain("bad feed");
    expect(html).toContain("Retry");
    expect(html).toContain("Remove");
    expect(html).toContain('data-icon="boom"');
  });

  it("hides the error detail and Remove outside edit mode", () => {
    const html = renderToStaticMarkup(
      <WidgetErrorFallback
        name="Weather"
        isEditing={false}
        errorMessage="secret"
        onRetry={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(html).toContain("Weather");
    expect(html).toContain("Retry");
    expect(html).not.toContain("Remove");
    expect(html).not.toContain("secret");
  });

  it("describes a widget health error event", () => {
    expect(widgetHealthChangeDetail("widget-1", "error")).toEqual({
      widgetId: "widget-1",
      status: "error",
    });
  });
});
