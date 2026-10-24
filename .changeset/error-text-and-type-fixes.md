---
"@homeslate/widgets": minor
"@homeslate/editor": patch
"@homeslate/display": patch
"@homeslate/host-react": patch
"@homeslate/server": patch
"@homeslate/relay": patch
---

Error messages now render in the danger color: `<Text tone="danger">` was ignored by var-ui, so they appeared as plain text. `@homeslate/widgets` exports an `ErrorText` component for this (until var-ui adds a `danger` tone). The "remove" button in the entity picker now shows its icon. Type errors across the packages are fixed and TypeScript errors now fail CI.
