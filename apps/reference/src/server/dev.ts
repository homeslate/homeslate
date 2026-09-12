import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../..", import.meta.url));

const children: ChildProcess[] = [
  spawn("pnpm", ["run", "dev:api"], { cwd, stdio: "inherit" }),
  spawn("pnpm", ["run", "dev:web"], { cwd, stdio: "inherit" }),
];

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exit(code);
}

for (const child of children) {
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shutdown(code ?? (signal ? 1 : 0));
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
