# @homeslate/editor

## 1.0.3

### Patch Changes

- [#47](https://github.com/phthalo-dev/homeslate/pull/47) [`f9005fc`](https://github.com/phthalo-dev/homeslate/commit/f9005fc1d1cbb82c1fd2b59814a0e901d4a0abf0) Thanks [@dbanksdesign](https://github.com/dbanksdesign)! - Error messages now render in the danger color: `<Text tone="danger">` was ignored by var-ui, so they appeared as plain text. `@homeslate/widgets` exports an `ErrorText` component for this (until var-ui adds a `danger` tone). The "remove" button in the entity picker now shows its icon. Type errors across the packages are fixed and TypeScript errors now fail CI.
- Updated dependencies [[`f9005fc`](https://github.com/phthalo-dev/homeslate/commit/f9005fc1d1cbb82c1fd2b59814a0e901d4a0abf0)]:
  - @homeslate/widgets@1.3.0
  - @homeslate/display@1.1.1

## 1.0.2

### Patch Changes

- a7f67a8: Point the repository metadata at the phthalo-dev GitHub organization.
- Updated dependencies [f016429]
- Updated dependencies [6d33084]
- Updated dependencies [8b0fe7a]
- Updated dependencies [6a7c289]
- Updated dependencies [7924794]
- Updated dependencies [43e2d43]
- Updated dependencies [24dd8a8]
- Updated dependencies [d7ce792]
- Updated dependencies [38cbc67]
- Updated dependencies [8b0fe7a]
- Updated dependencies [ccd45bc]
- Updated dependencies [a7f67a8]
- Updated dependencies [b16106e]
- Updated dependencies [6ebdf88]
  - @homeslate/display@1.1.0
  - @homeslate/widgets@1.2.0
  - @homeslate/schema@1.1.0

## 1.0.1

### Patch Changes

- Updated dependencies [d0bcb9e]
  - @homeslate/widgets@1.1.0
  - @homeslate/display@1.0.1

## 1.0.0

### Major Changes

- 9fe796d: Remove Mantine. Theme documents are VarUI-shaped (`createDesignTheme` JSON). Hosts must follow the README contract: one TypeStyles extract of `@var-ui/core/styles` then `@homeslate/*/styles`, one `DesignSystemProvider` with `applyToDocument` on full-page routes, plus `IconProvider` and `LayerProvider`. `Editor` and `Display` nest their own provider and must not call `applyToDocument`.

### Minor Changes

- d010d08: Replace CSS modules with TypeStyles. Hosts can extract `@homeslate/*/styles` with `@typestyles/vite`; without the plugin, styles still inject at runtime.

### Patch Changes

- Updated dependencies [79fd3ae]
- Updated dependencies [d010d08]
- Updated dependencies [9fe796d]
- Updated dependencies [25def83]
  - @homeslate/widgets@1.0.0
  - @homeslate/display@1.0.0
  - @homeslate/schema@1.0.0
