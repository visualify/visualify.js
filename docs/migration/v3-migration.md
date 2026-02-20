# Migration Guide: Visualify.js v3.0.0

This guide will help you migrate from Visualify.js v2.x to v3.0.0. Version 3.0.0 introduces significant improvements including a unified CLI, configuration file support, and a cleaner command structure.

## Table of Contents

- [Overview](#overview)
- [From `@visualify/cli`](#from-visualifycli)
- [From `window.$visualify`](#from-windowvisualify)
- [Breaking Changes](#breaking-changes)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What's Changing and Why

Visualify.js v3.0.0 represents a major architectural improvement focused on:

1. **Unified Package**: The CLI has been merged into the core `visualifyjs` package. No more separate `@visualify/cli` installation.
2. **Configuration File**: Support for `visualify.json` configuration file instead of inline JavaScript configuration.
3. **Command Restructure**: Cleaner command namespace with `docs` and `portal` subcommands.
4. **Auto-Detection**: The `visualify dev` command now auto-detects your project type.

### Timeline and Deprecation Notice

| Version | Status | Notes |
|---------|--------|-------|
| v2.x | Maintenance mode | Bug fixes only until 2026-06-01 |
| v3.0.0 | Current | Active development |
| v2.x | End of life | 2026-12-01 - No more updates |

**Important**: The `@visualify/cli` package is now deprecated and will not receive updates after 2026-06-01.

### Quick Start for New Users

If you're starting a new project:

```bash
# Install the new unified package
npm i -g visualifyjs

# Initialize a new docs project
visualify init docs

# Or initialize a portal project
visualify init portal

# Start development server
visualify dev
```

---

## From `@visualify/cli`

### Installation Change

**Before (v2.x):**
```bash
npm i -g @visualify/cli
```

**After (v3.0.0):**
```bash
npm i -g visualifyjs
```

### Command Mapping

| Old Command | New Command | Notes |
|-------------|-------------|-------|
| `visualify init [path]` | `visualify init docs [path]` or `visualify init portal [path]` | Must specify template type |
| `visualify serve [path]` | `visualify dev [path]` | Auto-detects mode |
| `visualify start [path]` | `visualify dev portal [path]` | Explicit portal mode |
| `visualify load-json <path>` | `visualify portal load-json <path>` | Now a subcommand |
| `visualify mapping [options] <path>` | `visualify portal mapping [options] <path>` | Now a subcommand |
| `visualify rtree2d [options] <path>` | `visualify portal rtree2d [options] <path>` | Now a subcommand |

### Examples

#### Initializing a New Project

**Before:**
```bash
visualify init ./my-project
```

**After:**
```bash
# For documentation projects
visualify init docs ./my-project

# For data portal projects
visualify init portal ./my-project

# For both
visualify init full ./my-project
```

#### Running Development Server

**Before:**
```bash
# For docs
visualify serve ./docs

# For portal
visualify start ./portal
```

**After:**
```bash
# Auto-detects mode from visualify.json or project structure
visualify dev

# Explicit docs mode
visualify dev docs

# Explicit portal mode
visualify dev portal
```

#### Portal Data Commands

**Before:**
```bash
visualify load-json ./data/points.json
visualify mapping --key id ./data/mapping.csv
visualify rtree2d --output ./rtree ./data/spatial.json
```

**After:**
```bash
visualify portal load-json ./data/points.json
visualify portal mapping --key id ./data/mapping.csv
visualify portal rtree2d --output ./rtree ./data/spatial.json
```

---

## From `window.$visualify`

### Configuration File Migration

**Before (inline HTML configuration):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Visualify Site</title>
</head>
<body>
  <div id="root"></div>
  <script>
    window.$visualify = {
      mode: 'pages',
      el: '#root',
      theme: 'modern',
      homepage: 'home.json',
      repo: 'https://github.com/username/repo',
      alias: {
        '/docsify': 'https://docsify.js.org/#/configuration?id=alias'
      }
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/visualifyjs"></script>
</body>
</html>
```

**After (visualify.json configuration):**
```json
{
  "version": "3.0.0",
  "mode": "portal",
  "el": "#root",
  "portal": {
    "homepage": "home.json",
    "theme": "modern",
    "repo": "https://github.com/username/repo",
    "alias": {
      "/docsify": "https://docsify.js.org/#/configuration?id=alias"
    }
  }
}
```

And your `index.html` becomes simpler:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Visualify Site</title>
</head>
<body>
  <div id="root"></div>
  <script src="https://cdn.jsdelivr.net/npm/visualifyjs"></script>
</body>
</html>
```

### Mode Changes

| Old Mode | New Mode | Notes |
|----------|----------|-------|
| `pages` | `portal` | Renamed for clarity |
| `charts` | `docs` | Renamed to reflect documentation focus |

**Before:**
```js
window.$visualify = {
  mode: 'pages',  // or 'charts'
  // ...
};
```

**After:**
```json
{
  "version": "3.0.0",
  "mode": "portal"
}
```

Or for documentation mode:
```json
{
  "version": "3.0.0",
  "mode": "docs"
}
```

### Property Mapping

| Old Property | New Location | Notes |
|--------------|--------------|-------|
| `mode` | `mode` | Now uses `"portal"` or `"docs"` |
| `el` | `el` | Unchanged |
| `theme` | `portal.theme` / `docs.theme` | Mode-specific |
| `homepage` | `portal.homepage` / `docs.homepage` | Mode-specific |
| `repo` | `portal.repo` / `docs.repo` | Mode-specific |
| `alias` | `portal.alias` / `docs.alias` | Mode-specific |

---

## Breaking Changes

### Critical (Will Break Your Build)

1. **Package Name Change**
   - Old: `@visualify/cli`
   - New: `visualifyjs`
   - Action: Uninstall old package, install new package

2. **Mode Values Changed**
   - Old: `mode: 'pages'` or `mode: 'charts'`
   - New: `mode: 'portal'` or `mode: 'docs'`
   - Action: Update your configuration

3. **Command Structure**
   - Portal commands now require `portal` prefix
   - Action: Update your scripts and CI/CD pipelines

### Major (Requires Code Changes)

1. **Configuration Location**
   - Old: Inline `window.$visualify` in HTML
   - New: External `visualify.json` file
   - Action: Extract configuration to JSON file

2. **Init Command Requires Template**
   - Old: `visualify init [path]`
   - New: `visualify init <template> [path]`
   - Action: Specify `docs`, `portal`, or `full` template

3. **Serve/Start Commands Merged**
   - Old: `visualify serve` and `visualify start`
   - New: `visualify dev` with auto-detection or explicit mode
   - Action: Update your npm scripts

### Minor (Behavior Changes)

1. **Default Port**
   - The development server may use different default ports
   - Use `--port` flag to specify explicitly

2. **Build Output**
   - Build output structure has changed for separate entry points
   - Review your deployment configuration

---

## Troubleshooting

### Common Migration Issues

#### Issue: "Command not found: visualify"

**Cause**: Old package still installed or not properly linked.

**Solution**:
```bash
# Uninstall old package
npm uninstall -g @visualify/cli

# Clear npm cache
npm cache clean --force

# Install new package
npm i -g visualifyjs

# Verify installation
visualify --version
```

#### Issue: "Cannot find module 'visualify.json'"

**Cause**: Configuration file is missing or in wrong location.

**Solution**:
Ensure `visualify.json` exists in your project root:
```bash
ls visualify.json

# If missing, create one
echo '{"version": "3.0.0", "mode": "portal"}' > visualify.json
```

#### Issue: "Invalid mode: 'pages'"

**Cause**: Using old mode values.

**Solution**:
Update your `visualify.json`:
```json
{
  "version": "3.0.0",
  "mode": "portal"
}
```

#### Issue: Portal commands not working

**Cause**: Missing `portal` prefix in commands.

**Solution**:
```bash
# Wrong
visualify load-json ./data.json

# Correct
visualify portal load-json ./data.json
```

#### Issue: "visualify dev" not detecting mode

**Cause**: Missing or invalid `visualify.json`.

**Solution**:
1. Create a `visualify.json` with explicit mode
2. Or specify mode explicitly: `visualify dev portal`

### Getting Help

- **Documentation**: [https://visualify.pharmacy.arizona.edu](https://visualify.pharmacy.arizona.edu)
- **Issues**: [GitHub Issues](https://github.com/visualify/visualify.js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/visualify/visualify.js/discussions)

### Migration Checklist

- [ ] Uninstall `@visualify/cli` package
- [ ] Install `visualifyjs` package globally
- [ ] Create `visualify.json` configuration file
- [ ] Migrate `window.$visualify` settings to `visualify.json`
- [ ] Update mode values (`pages` → `portal`, `charts` → `docs`)
- [ ] Update npm scripts with new command syntax
- [ ] Update CI/CD pipelines with new commands
- [ ] Test `visualify dev` command
- [ ] Test portal subcommands (`visualify portal *`)
- [ ] Verify build output

---

## Additional Resources

- [Configuration Reference](../configuration/visualify-json.md)
- [CLI Command Reference](../cli/commands.md)
- [Full Documentation](https://visualify.pharmacy.arizona.edu)
