# CLI Reference

Visualify.js provides a unified command-line interface for documentation, data visualization, and development workflows.

## Installation

### Global Installation

```bash
npm install -g visualify
```

### Local Installation

```bash
npm install --save-dev visualify
npx visualify --help
```

## Commands Overview

| Command | Description |
|---------|-------------|
| `dev` | Start development server with HMR |
| `docs` | Build and serve documentation |
| `portal` | Start data portal server |
| `init` | Initialize a new Visualify project |
| `edit` / `editor` | Launch visual configuration editor |

## Global Options

| Option | Description |
|--------|-------------|
| `-v, --version` | Display version number |
| `-h, --help` | Display help information |
| `--verbose` | Enable verbose logging |

## Command Details

### `dev` - Development Server

Start a development server with Hot Module Replacement (HMR).

```bash
visualify dev [mode]
```

**Arguments:**
- `mode` - Development mode: `auto`, `docs`, or `portal` (default: `auto`)

**Options:**
- `-p, --port <number>` - Port number (default: 3000)
- `-h, --host <host>` - Host to bind to (default: `localhost`)

**Examples:**

```bash
# Auto-detect mode based on project structure
visualify dev

# Start docs dev server
visualify dev docs

# Start portal dev server on custom port
visualify dev portal --port 8080
```

### `docs` - Documentation

Build and serve static documentation.

```bash
visualify docs [action]
```

**Arguments:**
- `action` - Action to perform: `build`, `serve`, or `deploy` (default: `serve`)

**Options:**
- `-p, --port <number>` - Port for serve mode (default: 3000)
- `-o, --output <dir>` - Output directory for build (default: `dist/docs`)

**Examples:**

```bash
# Serve docs with live reload
visualify docs serve

# Build static documentation
visualify docs build

# Build to custom directory
visualify docs build --output ./site
```

### `portal` - Data Portal

Start the data portal server for spatial data visualization.

```bash
visualify portal [action]
```

**Arguments:**
- `action` - Action to perform: `dev`, `build`, or `start` (default: `dev`)

**Options:**
- `-p, --port <number>` - Port number (default: 3000)
- `-d, --data <path>` - Path to data directory

**Examples:**

```bash
# Start portal dev server
visualify portal dev

# Build portal for production
visualify portal build

# Start production server
visualify portal start --port 8080
```

### `init` - Initialize Project

Create a new Visualify project with boilerplate files.

```bash
visualify init [path]
```

**Arguments:**
- `path` - Project directory path (default: current directory)

**Options:**
- `-t, --template <name>` - Project template: `docs`, `portal`, or `full` (default: `docs`)
- `-f, --force` - Overwrite existing files

**Examples:**

```bash
# Initialize docs project in current directory
visualify init

# Create new portal project
visualify init my-portal --template portal

# Force overwrite existing project
visualify init ./project --force
```

**Templates:**

- `docs` - Documentation site with Docsify
- `portal` - Data portal with spatial visualization
- `full` - Full-featured project with both docs and portal

### `edit` / `editor` - Visual Editor

Launch the visual configuration editor for creating and editing charts.

```bash
visualify edit [file]
```

**Aliases:** `editor`

**Arguments:**
- `file` - Configuration file to edit (optional)

**Options:**
- `-p, --port <number>` - Editor server port (default: 3456)
- `-h, --host <host>` - Host to bind to (default: `localhost`)
- `--no-open` - Do not open browser automatically

**Examples:**

```bash
# Start editor with new configuration
visualify edit

# Edit existing configuration file
visualify edit ./my-chart.json

# Start on custom port without opening browser
visualify edit --port 8080 --no-open
```

## Configuration File

Create a `visualify.json` or `.visualify.json` file to configure default options:

```json
{
  "mode": "auto",
  "port": 3000,
  "host": "localhost",
  "docs": {
    "title": "My Documentation",
    "theme": "vue"
  },
  "portal": {
    "dataPath": "./data",
    "rtreeEnabled": true
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | string | `"auto"` | Default mode: `auto`, `docs`, `portal` |
| `port` | number | `3000` | Default server port |
| `host` | string | `"localhost"` | Default host |
| `docs.title` | string | `"Documentation"` | Documentation site title |
| `docs.theme` | string | `"vue"` | Docsify theme name |
| `portal.dataPath` | string | `"./data"` | Path to data files |
| `portal.rtreeEnabled` | boolean | `true` | Enable spatial indexing |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VISUALIFY_PORT` | Default port override |
| `VISUALIFY_HOST` | Default host override |
| `VISUALIFY_VERBOSE` | Enable verbose logging (set to `1` or `true`) |
| `VISUALIFY_HMR` | Enable HMR (set to `1` or `true`) |

## Examples

### Complete Workflow

```bash
# 1. Initialize new project
visualify init my-project --template full
cd my-project

# 2. Start development server
visualify dev

# 3. Edit configuration visually
visualify edit

# 4. Build for production
visualify docs build
visualify portal build
```

### Legacy Commands

The following legacy commands from `@visualify/cli` have been integrated into the unified CLI:

| Legacy | New Equivalent | Notes |
|--------|----------------|-------|
| `serve` | `dev` or `docs serve` | Use `dev` for development |
| `start` | `portal start` | Start production portal |
| `load-json` | Portal data import | Use portal UI or API |
| `mapping` | Portal configuration | Configure in `visualify.json` |
| `rtree2d` | Automatic | Enabled by default in portal |

## Troubleshooting

### Port Already in Use

```bash
# Try a different port
visualify dev --port 8080
```

### Permission Denied

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use npx without global install
npx visualify dev
```

### Command Not Found

```bash
# Verify installation
npm list -g visualify

# Reinstall if needed
npm install -g visualify
```

## Getting Help

```bash
# General help
visualify --help

# Command-specific help
visualify dev --help
visualify docs --help
visualify portal --help
visualify init --help
visualify edit --help
```
