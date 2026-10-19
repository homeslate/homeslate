// Dev API entry. Registers a resolver before `listen.ts` imports
// `@homeslate/*`, so those specifiers hit workspace TypeScript. Node restarts
// this process when a file under `packages/` changes.
import { registerHooks } from "node:module";
import { workspacePackageUrl } from "./workspace-packages.ts";

registerHooks({
  resolve(specifier, context, nextResolve) {
    const url = workspacePackageUrl(specifier);
    if (url) return nextResolve(url, context);
    return nextResolve(specifier, context);
  },
});

await import("./listen.ts");
