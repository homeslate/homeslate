# Self-hosting homeslate behind Caddy on a homelab

This guide gets the homeslate reference app running as a Docker container
on a Linux VM with a static IP, fronted by your existing Caddy reverse
proxy and a pi-hole-provided local hostname. It assumes the goal is
"kitchen tablet on the LAN" — single user, no public exposure.

## Architecture

```
Phone / tablet / laptop on LAN
  │
  │  http://homeslate.lan/
  ▼
pi-hole (resolves homeslate.lan → VM static IP)
  │
  ▼
Caddy on the VM (port 80)
  │  ├── /api/*  → http://127.0.0.1:8787  (homeslate container)
  │  └── /*      → file server: ./web      (bind mount, host path)
  ▼
homeslate container
  ├── Hono API on 127.0.0.1:8787
  └── /data (named volume) holds displays.sqlite and Google refresh tokens
```

The container runs as a non-root user, publishes only `127.0.0.1:8787`
on the host (LAN-reachable only via Caddy), and has the built web UI
materialized into `./web` on the host so Caddy can serve it as static
files.

## Prerequisites

- Linux VM with a static LAN IP. This guide assumes the IP is reachable
  by all devices that will view homeslate.
- Docker Engine 24+ and the `docker compose` plugin (v2).
- Caddy installed on the host (`apt install caddy` or equivalent).
- pi-hole on the LAN with custom DNS records enabled.
- Node 22.13+ and pnpm 10.11+ on the build machine. The build runs on
  the host before `docker build` (see step 4 for why); the resulting
  Docker image is self-contained and the VM does not need Node.

## 1. Create the Google Cloud project

This is a one-time setup. You use your normal Google account; the
project is free, lives under your account, and does not affect Gmail.

1. Open https://console.cloud.google.com/ and create a new project.
   Name it whatever you like (e.g. `homeslate-homelab`).
2. In the project, go to **APIs & Services → Library** and enable the
   **Google Calendar API**. (You do not need to enable any other API.)
3. Go to **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - On the scopes step, add
     `https://www.googleapis.com/auth/calendar.readonly` (this is the
     only scope homeslate requests).
   - On the test users step, add the Gmail address you'll sign in with.
     While the app is in "Testing" status, only test users can complete
     the OAuth flow. (You can submit for verification later if you ever
     want to share the kiosk publicly; for a single-user homelab, you
     don't need to.)
   - Finish the rest of the wizard with the defaults.
4. Go to **APIs & Services → Credentials → Create credentials →
   OAuth client ID**:
   - Application type: **Web application**.
   - Name: anything (e.g. `homeslate-homelab`).
   - **Authorized redirect URIs**: add exactly
     `http://homeslate.lan/api/google/callback` (and only that, for now).
     The URI must match byte-for-byte what the homeslate server sends;
     `http` is fine, no port needed because Caddy listens on 80.
5. Copy the **Client ID** and **Client Secret** from the resulting page.

## 2. Add the pi-hole DNS record

In pi-hole's **Local DNS → DNS records**, add:

| Type | Host      | Value                 |
| ---- | --------- | --------------------- |
| A    | homeslate | `<your-vm-static-ip>` |

Click **Add**. From any LAN device, `nslookup homeslate.lan` should
return your VM's IP within a few seconds.

## 3. Add the Caddy vhost

Append to your Caddyfile (or create a new one) on the VM:

```caddyfile
homeslate.lan {
    encode zstd gzip

    # The API listens on all interfaces inside the container; the compose
    # file publishes it on the host's loopback only, so Caddy is the only
    # thing that can reach it.
    handle /api/* {
        reverse_proxy 127.0.0.1:8787
    }

    # Serve the built SPA. The container populates this directory on first
    # start; see step 5. `try_files` is what makes deep links work — without
    # it, a hard refresh on /edit/<id> or /d/<publicId> is a 404.
    handle {
        root * /home/<your-user>/homeslate-oss/web
        try_files {path} /index.html
        file_server
    }
}
```

Replace `<your-user>` with the user that owns the repo directory
(usually the user you'll `git clone` as). Reload Caddy:

```sh
sudo systemctl reload caddy
```

## 4. Build the image

The build happens in two halves: the workspace packages and the web
bundle are built on the host (because `vp pack` needs more heap than
Docker BuildKit reliably provides), then the resulting artifacts are
packaged into a runtime image by `docker build`. The `bin/homeslate-build`
script does both.

```sh
git clone https://github.com/homeslate/homeslate.git
cd homeslate
cp .env.example .env
# Open .env and fill in:
#   HOMESLATE_PUBLIC_BASE_URL=http://homeslate.lan
#   GOOGLE_CLIENT_ID=<from step 1>
#   GOOGLE_CLIENT_SECRET=<from step 1>
#   HOMEASSISTANT_BASE_URL=<reachable from the container, e.g. http://192.168.1.20:8123>
#   HOMEASSISTANT_TOKEN=<long-lived access token from your HA profile>

bin/homeslate-build
```

The first run takes a few minutes. Once it finishes, the image
`homeslate-reference:local` is in your local Docker registry.

## 5. Start the container

```sh
docker compose up -d
```

The first start does:

- Creates the `homeslate-data` named volume.
- Starts the API on `127.0.0.1:8787`.
- The entrypoint populates `./web` from the baked image. Watch it with:
  ```sh
  docker compose logs -f api
  ```

Once the log line `Reference API listening on http://127.0.0.1:8787`
appears, open http://homeslate.lan/ in a browser. You should see the
homeslate editor. Caddy will reload the new `./web` automatically if
you restart it once after the first start:

```sh
sudo systemctl reload caddy
```

## 6. Connect your Google account

1. In the homeslate editor, add a **Calendar** widget to a display.
2. The widget's placeholder will read "Sign in to Google" or similar.
   Click it. You're redirected to Google, grant the read-only
   permission, and bounced back to http://homeslate.lan/.
3. A refresh token is now stored at `/data/tokens/local.json` _inside
   the volume_. The container refreshes access tokens transparently
   from then on. You do not need to sign in again unless you revoke
   the token from your Google account.

To back up your data, copy the contents of the `homeslate-data` named
volume. The relevant files are:

- `displays.sqlite` — all your displays and layouts.
- `tokens/local.json` — the Google refresh token. Treat this like a
  password. If it leaks, someone with read access to the file can read
  your calendar.

## 7. Upgrades

```sh
cd /path/to/homeslate
git pull
bin/homeslate-build                # rebuild the image
docker compose up -d               # restart the container with the new image
bin/homeslate-update-web           # refresh ./web on the host
sudo systemctl reload caddy
```

The named `homeslate-data` volume is preserved across upgrades.

## 8. Day-to-day operations

```sh
# Tail the API log
docker compose logs -f api

# Restart the API
docker compose restart api

# Stop everything
docker compose down

# Stop and wipe the database (destructive)
docker compose down -v
```

## 9. Going further (not covered here)

- **HTTPS on the LAN.** Caddy can issue a local CA cert for
  `homeslate.lan` and your other apps, then push the CA to your
  devices. Google's OAuth accepts `http://` for loopback and `.lan`
  hosts are typically fine without, so this is optional.
- **Multiple users / devices.** The reference app is single-tenant by
  design (see `LOCAL_ACCOUNT_ID` in `@homeslate/server`). For a
  household, one Google account on a shared display is usually enough;
  for separate accounts per device, you'd want the hosted product.
- **Removing Google entirely.** Leave `GOOGLE_CLIENT_ID` and
  `GOOGLE_CLIENT_SECRET` empty. Everything except the calendar widget
  works.
- **Commute widget.** Add `OPENROUTESERVICE_API_KEY` to `.env` and
  rebuild. The free tier at openrouteservice.org is enough for a
  homelab.
- **Home Assistant thermostat.** Add `HOMEASSISTANT_BASE_URL` and
  `HOMEASSISTANT_TOKEN` to `.env` and rebuild. The token comes from your
  Home Assistant profile (Security → Long-lived access tokens). The URL
  must be reachable from _inside the container_: `homeassistant.local`
  (mDNS) usually isn't, so use the host's LAN IP and port, e.g.
  `http://192.168.1.20:8123`. The token stays in the API process — the
  browser only ever talks to `/api/homeassistant/*`.

## Troubleshooting

- **"redirect_uri_mismatch" from Google.** The redirect URI in GCP
  doesn't match `HOMESLATE_PUBLIC_BASE_URL + /api/google/callback`
  byte-for-byte. Check the trailing slash: there should be none on
  the base URL, and the path must be exactly `/api/google/callback`.
- **The page loads but `/api/...` requests 502.** The Hono server isn't
  up. Check `docker compose logs api` and `docker compose ps`. Common
  cause: `HOMESLATE_PUBLIC_BASE_URL` was missing from `.env`.
- **Caddy says "no such file or directory" for `/web`.** The `./web`
  directory wasn't populated. Restart the container once
  (`docker compose restart api`) and check the log for
  `entrypoint: populating /opt/homeslate/web from baked image`. Then
  `sudo systemctl reload caddy`.
- **Refresh tokens stopped working.** Google may have invalidated them
  (e.g. you removed yourself from the OAuth consent screen's test
  users list, or revoked from your Google account). Delete the file
  at `/data/tokens/local.json` (via
  `docker compose exec api rm /data/tokens/local.json`) and re-connect.
- **`docker build` OOMs on `vp pack`.** This is the reason we build
  packages on the host. If you see this, you skipped `bin/homeslate-build`
  and went straight to `docker compose up -d --build` — the `--build`
  flag only runs `docker build`, not the host-side `pnpm -r build`.
  Use `bin/homeslate-build` instead.
