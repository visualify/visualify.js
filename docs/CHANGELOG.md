# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-02-20

### Fixed

- **Bundle externalization** — echarts and plotly.js are now externalized from legacy IIFE builds, reducing bundle from 9.6 MB to 2.8 MB. Three.js remains bundled (eagerly imported).
- **CDN dependency warnings** — visualify.js now warns in console if echarts or plotly CDN scripts are missing, with instructions on what to add.
- **Docs site cleanup** — removed unnecessary Three.js CDN and ReactThree stubs from docs/index.html (now bundled).
- **Loader update** — `visualify-loader.js` no longer auto-loads Three.js CDN (bundled with main script).
- **Dot plot rendering** — RePlotly now respects `props.data` passed directly from parent components (e.g., DotBio), fixing MmTrBC dot plots that stopped rendering.
- **Console noise cleanup** — removed debug `console.log` statements from production output (echartswitcher, selection, scatter components).

### Improved

- **Selection component UI** — redesigned react-select dropdown with pill-shaped tags, refined theme colors, smooth hover/focus transitions, and cleaner indicator styles.
- **Timeline component UI** — redesigned with card-like node containers, hollow animated dots, gradient connector line, chip-style sub-item buttons, active node highlighting, and custom scrollbar.
- **Beta channel** — development builds available directly from the `dev` branch via CDN or `npm install github:visualify/visualify.js#dev`.

### Breaking Changes

- **CLI merged into core package** - The `@visualify/cli` package is now deprecated and merged into the main `visualifyjs` package. Users should uninstall `@visualify/cli` and install `visualifyjs` globally instead.
- **Configuration moved from `window.$visualify` to `visualify.json`** - Inline JavaScript configuration is no longer supported. Create a `visualify.json` file in your project root instead.
- **New command structure with namespaces** - Commands have been restructured:
  - `visualify serve` → `visualify dev`
  - `visualify start` → `visualify dev portal`
  - `visualify load-json` → `visualify portal load-json`
  - `visualify mapping` → `visualify portal mapping`
  - `visualify rtree2d` → `visualify portal rtree2d`
- **Mode values changed** - The `mode` property values have been renamed:
  - `mode: 'pages'` → `mode: 'portal'`
  - `mode: 'charts'` → `mode: 'docs'`
- **Init command requires template** - The `visualify init` command now requires a template argument: `docs`, `portal`, or `full`.

### Added

- **3D Visualization Support** - New 3D chart types using ECharts GL and Three.js
  - `scatter3d` - 3D scatter plots with x, y, z dimensions
  - `bar3d` - 3D bar charts with Lambert shading
  - `surface3d` - 3D surface/height map visualizations
  - `line3d` - 3D line/trajectory charts
  - `threejs` - Custom Three.js scenes with React Three Fiber integration
- WebGL support detection with graceful fallback for unsupported browsers
- Lazy loading for 3D libraries (loaded on-demand to minimize bundle size)
- Docsify plugin system for embedding charts in markdown documentation
  - `visualify` code block support in markdown
  - Auto-mount charts with `data-visualify` attribute
  - SPA navigation support for single-page documentation
- `visualify.json` configuration file support with JSON schema validation
- Auto-detection mode for `visualify dev` command - automatically detects project type from configuration or directory structure
- Separate entry points for `docs` and `portal` bundles for optimized builds
- `visualify docs` namespace with `dev` and `build` subcommands
- `visualify portal` namespace with `dev`, `build`, `load-json`, `mapping`, and `rtree2d` subcommands
- Support for `visualify.config.js` for dynamic configuration
- `--verbose` global flag for debug output
- `--dry-run` option for configuration validation
- Environment variable support (`VISUALIFY_PORT`, `VISUALIFY_HOST`, `VISUALIFY_MODE`)

### Changed

- Build output structure now uses separate entry points for docs and portal modes
- Development server now defaults to auto-detection mode
- Improved error messages with suggestions for common issues
- Updated CLI help documentation with examples

### Deprecated

- `@visualify/cli` package - will not receive updates after 2026-06-01
- `window.$visualify` inline configuration - migrate to `visualify.json`
- Old mode values (`pages`, `charts`) - use `portal`, `docs` instead

### Removed

- Support for `visualify serve` command (use `visualify dev`)
- Support for `visualify start` command (use `visualify dev portal`)
- Direct `visualify load-json` command (use `visualify portal load-json`)
- Direct `visualify mapping` command (use `visualify portal mapping`)
- Direct `visualify rtree2d` command (use `visualify portal rtree2d`)

### Migration Guide

See the [v3.0.0 Migration Guide](./docs/migration/v3-migration.md) for detailed instructions on upgrading from v2.x.

Quick migration steps:
1. `npm uninstall -g @visualify/cli`
2. `npm i -g visualifyjs`
3. Create `visualify.json` with your configuration
4. Update mode values (`pages` → `portal`, `charts` → `docs`)
5. Update npm scripts with new command syntax

---

## [2.5.3] - 2024-XX-XX

### Fixed

- Minor bug fixes and dependency updates

---

## [2.5.2] - 2024-XX-XX

### Changed

- Dependency upgrades

---

## [2.5.1] - 2024-XX-XX

### Fixed

- Documentation updates

---

## [2.5.0] - 2024-XX-XX

### Added

- New visualization components
- Improved theming support

---

## [2.0.0] - 2024-XX-XX

### Added

- React 18 support
- New CLI commands
- Enhanced chart types

---

## [1.0.0] - 2023-XX-XX

### Added

- Initial release of Visualify.js
- Basic chart components
- CLI tooling
- Documentation site support
