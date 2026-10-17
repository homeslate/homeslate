# Minimal homeslate host

A complete homeslate host in seven files. It depends only on the **published**
`@homeslate/*` packages — no repo checkout, and upgrading is a version bump plus
a rebuild.

This is the [self-hosting guide](../../docs/content/docs/self-hosting.mdx) as a
runnable app. Start your own host from it, or read the guide if you'd rather
build the files up yourself.

## What's here

| file | what it is |
| --- | --- |
| `src/server.mjs` | the API — `startHomeslateServer(...)` |
| `src/web/main.tsx` | the web entry — VarUI providers + `<HomeslateApp />` |
| `typestyles-entry.ts` | the CSS import graph TypeStyles extracts from |
| `vite.config.ts` | Vite + TypeStyles |
| `index.html` | the shell Vite builds around |
| `Dockerfile`, `compose.yaml` | the optional container path |

`HomeslateApp` needs no props: it defaults the product name, calls the API on
the same origin, and uses the widget registry that `@homeslate/host-react`
brings in via `@homeslate/widgets`.

## Develop

```sh
npm install
npm run dev:api     # API on http://127.0.0.1:8787
npm run dev:web     # UI on http://127.0.0.1:5174, proxies /api
```

## Build and serve

```sh
npm run build:web   # emits dist/: index.html, assets/, typestyles.css
```

The API only answers `/api/*`, so a proxy serves `dist/`:

```caddyfile
homeslate.lan {
    encode zstd gzip

    handle /api/* {
        reverse_proxy 127.0.0.1:8787
    }

    handle {
        root * /path/to/examples/minimal-host/dist
        try_files {path} /index.html
        file_server
    }
}
```

The two `handle` blocks matter: Caddy runs `try_files` before `reverse_proxy`,
so a top-level fallback would rewrite `/api/*` to `index.html`. And the fallback
itself is what makes deep links work — without it, opening `/d/<publicId>`
directly (which is what a kiosk does) is a 404.

The API binds `127.0.0.1` by default, which is right when the proxy shares the
host. Set `HOMESLATE_HOSTNAME=0.0.0.0` when it doesn't.

## Container

```sh
cp .env.example .env     # set HOMESLATE_PUBLIC_BASE_URL
npm run build:web        # your proxy serves dist/ from the host
docker compose up -d --build
```

The image runs the API only. `compose.yaml` sets `HOMESLATE_HOSTNAME=0.0.0.0`
because Docker forwards a published port to the container's bridge address, not
its loopback — a `127.0.0.1` bind leaves the port dead while the container still
looks healthy.

If your proxy is itself a container, you can drop the `ports:` mapping entirely:
put both containers on one Docker network and point the proxy at
`homeslate:8787` instead.

## Why this isn't a workspace package

This directory is deliberately **not** listed in `pnpm-workspace.yaml`, and that
is what makes it useful: it resolves `@homeslate/server` and
`@homeslate/host-react` from npm exactly like an external consumer, rather than
linking to the local workspace copies. It also escapes the repo's `vite` /
`vite-plus` overrides, so it builds the way *your* app will.

The trade-off is that the root `pnpm install` ignores it and CI doesn't build
it. When you change the public API of a published package, run
`npm install && npm run build:web` in here to check the consumer path.
