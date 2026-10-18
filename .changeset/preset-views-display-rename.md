---
"@homeslate/display": minor
"@homeslate/host-react": minor
---

Add preset views and inline display rename.

- **`@homeslate/display/canvas`** — new `PRESET_VIEW_NAMES`, `createPresetView`,
  `missingPresetViews`, and `addPresetViews` helpers that build the
  Morning / Evening / Weekend starter views from the registered widget defaults.
- **`@homeslate/host-react`** — `ViewsPanel` gains an **Add preset views** button
  (skipping any presets already present), and the management header renames the
  display inline, saved through the same debounced document `PUT`.
