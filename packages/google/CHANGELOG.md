# @homeslate/google

## 0.1.3

### Patch Changes

- a7f67a8: Point the repository metadata at the phthalo-dev GitHub organization.

## 0.1.2

### Patch Changes

- 79fd3ae: Fix Google Calendar week/month views on kiosk displays by fetching events from 42 days back (configurable via `daysBack` on `/display-calendar`). Add IndexedDB stale-while-revalidate caching in `useDisplayCalendar` so displays poll less often without blanking on network hiccups. Editor-mode `useGoogleCalendar` uses the same past window by default. `displayCalendarUrl` now includes `daysBack` in its params.
