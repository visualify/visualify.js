# visualify.json Configuration Reference

The `visualify.json` file is the central configuration file for Visualify.js v3.0.0+. It replaces the inline `window.$visualify` JavaScript configuration used in v2.x.

## Table of Contents

- [Overview](#overview)
- [Schema](#schema)
- [Root Properties](#root-properties)
- [Portal Configuration](#portal-configuration)
- [Docs Configuration](#docs-configuration)
- [Examples](#examples)
- [Validation](#validation)

---

## Overview

### File Location

Place `visualify.json` in your project root directory (same level as `package.json` or `index.html`).

```
my-project/
├── visualify.json    # Configuration file
├── package.json
├── index.html
└── ...
```

### Minimum Configuration

```json
{
  "version": "3.0.0",
  "mode": "portal"
}
```

---

## Schema

### Complete Schema

```json
{
  "$schema": "https://visualify.pharmacy.arizona.edu/schema/visualify.json",
  "version": "3.0.0",
  "mode": "portal",
  "el": "#root",
  "portal": {
    "homepage": "home.json",
    "theme": "modern",
    "repo": "",
    "alias": {}
  },
  "docs": {
    "homepage": "home.json",
    "theme": "modern",
    "repo": "",
    "alias": {}
  }
}
```

---

## Root Properties

### version

- **Type**: `string`
- **Required**: Yes
- **Default**: `"3.0.0"`
- **Description**: Configuration file version for compatibility checking.

```json
{
  "version": "3.0.0"
}
```

### mode

- **Type**: `string`
- **Required**: Yes
- **Default**: `"portal"`
- **Options**: `"portal"`, `"docs"`
- **Description**: Determines the operating mode of Visualify.js.

| Mode | Description | Use Case |
|------|-------------|----------|
| `portal` | Full-featured data portal with navigation | Multi-page data visualization sites |
| `docs` | Documentation-focused with chart support | Technical docs with embedded charts |

```json
{
  "mode": "portal"
}
```

### el

- **Type**: `string`
- **Required**: No
- **Default**: `"#root"`
- **Description**: CSS selector for the DOM element where Visualify will mount.

```json
{
  "el": "#app"
}
```

---

## Portal Configuration

The `portal` object contains settings specific to portal mode.

### portal.homepage

- **Type**: `string`
- **Required**: No
- **Default**: `"home.json"`
- **Description**: Path to the homepage JSON file.

```json
{
  "portal": {
    "homepage": "home.json"
  }
}
```

Can also be a remote URL:
```json
{
  "portal": {
    "homepage": "https://raw.githubusercontent.com/username/repo/main/home.json"
  }
}
```

### portal.theme

- **Type**: `string`
- **Required**: No
- **Default**: `"modern"`
- **Options**: `"modern"`, `"classic"`
- **Description**: Visual theme for the portal.

```json
{
  "portal": {
    "theme": "modern"
  }
}
```

### portal.repo

- **Type**: `string`
- **Required**: No
- **Default**: `""`
- **Description**: GitHub repository URL for the corner widget. Accepts full URL or `username/repo` format.

```json
{
  "portal": {
    "repo": "https://github.com/username/repo"
  }
}
```

Or shorthand:
```json
{
  "portal": {
    "repo": "username/repo"
  }
}
```

### portal.alias

- **Type**: `object`
- **Required**: No
- **Default**: `{}`
- **Description**: Route aliases for custom routing. Supports string paths and RegExp patterns.

```json
{
  "portal": {
    "alias": {
      "/docs": "/documentation",
      "/api/(.*)": "https://api.example.com/$1"
    }
  }
}
```

---

## Docs Configuration

The `docs` object contains settings specific to docs mode. All properties mirror the portal configuration.

### docs.homepage

- **Type**: `string`
- **Required**: No
- **Default**: `"home.json"`

```json
{
  "docs": {
    "homepage": "getting-started.json"
  }
}
```

### docs.theme

- **Type**: `string`
- **Required**: No
- **Default**: `"modern"`
- **Options**: `"modern"`, `"classic"`

```json
{
  "docs": {
    "theme": "classic"
  }
}
```

### docs.repo

- **Type**: `string`
- **Required**: No
- **Default**: `""`

```json
{
  "docs": {
    "repo": "username/repo"
  }
}
```

### docs.alias

- **Type**: `object`
- **Required**: No
- **Default**: `{}`

```json
{
  "docs": {
    "alias": {
      "/components": "/api/components"
    }
  }
}
```

---

## Examples

### Basic Portal Configuration

```json
{
  "version": "3.0.0",
  "mode": "portal",
  "el": "#root",
  "portal": {
    "homepage": "home.json",
    "theme": "modern",
    "repo": "myorg/data-portal"
  }
}
```

### Documentation Site Configuration

```json
{
  "version": "3.0.0",
  "mode": "docs",
  "el": "#app",
  "docs": {
    "homepage": "introduction.json",
    "theme": "classic",
    "repo": "https://github.com/myorg/docs",
    "alias": {
      "/api": "/reference",
      "/guide": "/tutorial"
    }
  }
}
```

### Dual-Mode Configuration

If you need to support both modes (useful for full-template projects):

```json
{
  "version": "3.0.0",
  "mode": "portal",
  "el": "#root",
  "portal": {
    "homepage": "home.json",
    "theme": "modern",
    "repo": "myorg/project"
  },
  "docs": {
    "homepage": "docs/home.json",
    "theme": "modern",
    "repo": "myorg/project",
    "alias": {
      "/": "/docs/home.json"
    }
  }
}
```

### Advanced Configuration with Aliases

```json
{
  "version": "3.0.0",
  "mode": "portal",
  "el": "#visualify-root",
  "portal": {
    "homepage": "content/home.json",
    "theme": "modern",
    "repo": "https://github.com/organization/visualify-portal",
    "alias": {
      "/": "/content/home.json",
      "/about": "/content/about.json",
      "/api/(.*)": "https://api.example.com/docs/$1",
      "/legacy/(.*)": "/content/deprecated/$1"
    }
  }
}
```

---

## Validation

### Validation Rules

| Property | Validation | Error Message |
|----------|------------|---------------|
| `version` | Must match semver format | "Invalid version format" |
| `mode` | Must be "portal" or "docs" | "Invalid mode: must be 'portal' or 'docs'" |
| `el` | Must be valid CSS selector | "Invalid CSS selector" |
| `portal.homepage` | Must be valid path or URL | "Invalid homepage path" |
| `portal.theme` | Must be "modern" or "classic" | "Invalid theme" |
| `docs.homepage` | Must be valid path or URL | "Invalid homepage path" |
| `docs.theme` | Must be "modern" or "classic" | "Invalid theme" |

### Default Values Table

| Property | Default Value | Applies When |
|----------|---------------|--------------|
| `version` | `"3.0.0"` | Always |
| `mode` | `"portal"` | When not specified |
| `el` | `"#root"` | When not specified |
| `portal.homepage` | `"home.json"` | In portal mode when not specified |
| `portal.theme` | `"modern"` | In portal mode when not specified |
| `portal.repo` | `""` | In portal mode when not specified |
| `portal.alias` | `{}` | In portal mode when not specified |
| `docs.homepage` | `"home.json"` | In docs mode when not specified |
| `docs.theme` | `"modern"` | In docs mode when not specified |
| `docs.repo` | `""` | In docs mode when not specified |
| `docs.alias` | `{}` | In docs mode when not specified |

### CLI Validation

When running `visualify dev`, the CLI will:

1. Look for `visualify.json` in the current directory
2. Validate the configuration against the schema
3. Report any validation errors with line numbers
4. Use default values for missing optional properties

Example validation error:
```
Error: Invalid configuration in visualify.json
  at line 3: "mode" must be either "portal" or "docs"
  at line 7: "portal.theme" must be either "modern" or "classic"
```

---

## Migration from window.$visualify

### Before (v2.x)
```html
<script>
window.$visualify = {
  mode: 'pages',
  el: '#root',
  theme: 'modern',
  homepage: 'home.json',
  repo: 'username/repo',
  alias: {
    '/docs': '/documentation'
  }
};
</script>
```

### After (v3.0.0)
```json
{
  "version": "3.0.0",
  "mode": "portal",
  "el": "#root",
  "portal": {
    "homepage": "home.json",
    "theme": "modern",
    "repo": "username/repo",
    "alias": {
      "/docs": "/documentation"
    }
  }
}
```

---

## Environment-Specific Configuration

For different environments, you can use:

### visualify.config.js (JavaScript)

If you need dynamic configuration, create `visualify.config.js`:

```javascript
module.exports = {
  version: '3.0.0',
  mode: process.env.VISUALIFY_MODE || 'portal',
  el: '#root',
  portal: {
    homepage: process.env.NODE_ENV === 'production'
      ? 'https://cdn.example.com/home.json'
      : 'home.json',
    theme: 'modern',
    repo: 'username/repo'
  }
};
```

**Loading priority:**
1. `visualify.config.js` (if exists)
2. `visualify.json` (if exists)
3. Default values

---

## Related Documentation

- [Migration Guide](../migration/v3-migration.md)
- [CLI Commands](../cli/commands.md)
- [Quick Start](../../docs/quickstart.md)
