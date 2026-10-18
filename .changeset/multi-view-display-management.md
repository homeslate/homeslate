---
"@homeslate/adapters": minor
"@homeslate/display": minor
"@homeslate/host-react": minor
"@homeslate/server": minor
---

Add multi-view display management and an optional viewer passcode.

- **`@homeslate/host-react`** — `EditorPage` is now a display management surface
  (Views / Settings / Theme tabs) and a new `ViewEditorPage` renders the per-view
  canvas editor. `DisplaySettingsPanel` covers auto-rotate, sticky notes, alarms,
  voice commands, holiday effects, and the viewer passcode; `ViewsPanel` adds,
  renames, reorders, hides, and deletes views. `KioskPage` prompts for the PIN
  when the display is locked. Also exports `useDisplayDocument` and the API
  helpers (`getPublicDocument`, `publicDocumentUrl`, `patchJson`,
  `setDisplayPasscode`).
- **`@homeslate/display/canvas`** — adds `addView`, `removeView`, `moveView`, and
  `setActiveView` document helpers.
- **`@homeslate/adapters`** — display stores gain `getPasscodeHash` /
  `setPasscode`; `SqliteDisplayStore` keeps the hash in a new `passcode_hash`
  column (migrated with `ALTER TABLE`) and never returns it on a `DisplayRecord`.
- **`@homeslate/server`** — display responses expose `passcodeEnabled` instead of
  the hash, adds `PATCH /api/displays/:id` to set or clear a 4-digit passcode,
  gates `GET` / `PUT /api/public/:publicId` with `401 { passcodeRequired: true }`,
  and exports `hashPasscode` / `verifyPasscode` / `isValidPin`.
