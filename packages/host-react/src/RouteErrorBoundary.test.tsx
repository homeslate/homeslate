import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import {
  RouteErrorBoundary,
  RouteErrorFallback,
  routeErrorBoundaryContent,
} from "./RouteErrorBoundary";

function Boom(): never {
  throw new Error("route failed");
}

describe("RouteErrorBoundary", () => {
  it("renders Reload and Back to displays", () => {
    const html = renderToStaticMarkup(
      <RouteErrorFallback productName="Homeslate" onReload={() => {}} />,
    );
    expect(html).toContain("Homeslate");
    expect(html).toContain("Something went wrong");
    expect(html).toContain("Reload");
    expect(html).toContain("Back to displays");
    expect(html).toContain('href="/"');
  });

  it("switches to the fallback when a child throws", () => {
    let thrown: unknown;
    try {
      Boom();
    } catch (error) {
      thrown = error;
    }
    const state = { ...RouteErrorBoundary.getDerivedStateFromError(thrown), resetKey: 0 };
    const html = renderToStaticMarkup(
      <>
        {routeErrorBoundaryContent(
          state,
          { productName: "Homeslate", children: <p>still here</p> },
          () => {},
        )}
      </>,
    );
    expect(html).toContain("Something went wrong");
    expect(html).toContain("Reload");
    expect(html).toContain("Back to displays");
    expect(html).not.toContain("still here");
    expect(html).not.toContain("route failed");
  });
});
