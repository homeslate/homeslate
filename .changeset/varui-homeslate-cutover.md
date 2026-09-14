---
"@homeslate/schema": major
"@homeslate/display": major
"@homeslate/widgets": major
"@homeslate/editor": major
---

Remove Mantine. Theme documents are VarUI-shaped (`createDesignTheme` JSON). Hosts must follow the README contract: one TypeStyles extract of `@var-ui/core/styles` then `@homeslate/*/styles`, one `DesignSystemProvider` with `applyToDocument` on full-page routes, plus `IconProvider` and `LayerProvider`. `Editor` and `Display` nest their own provider and must not call `applyToDocument`.
