---
"@homeslate/widgets": patch
---

Request the read-only Google Calendar scope (`calendar.readonly`) from the
client-side Google Identity Services flow, matching the reference server's
`/api/google/connect` scope. Calendar widgets only read events, so the
narrower scope shrinks the blast radius if a refresh token ever leaks.
