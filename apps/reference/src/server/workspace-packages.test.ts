import { describe, expect, it } from "vite-plus/test";
import { workspacePackageUrl } from "./workspace-packages.ts";

describe("workspace package source", () => {
  it("resolves @homeslate/server to its TypeScript entry", () => {
    expect(workspacePackageUrl("@homeslate/server")).toMatch(/\/packages\/server\/src\/index\.ts$/);
  });

  it("resolves subpath exports", () => {
    expect(workspacePackageUrl("@homeslate/relay/node")).toMatch(
      /\/packages\/relay\/src\/node\.ts$/,
    );
    expect(workspacePackageUrl("@homeslate/widgets/server")).toMatch(
      /\/packages\/widgets\/src\/server\.ts$/,
    );
  });

  it("leaves other specifiers alone", () => {
    expect(workspacePackageUrl("hono")).toBeUndefined();
  });
});
