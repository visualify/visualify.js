# CLI Command Reference

Complete reference for the Visualify.js CLI commands. The CLI is included in the `visualifyjs` package (v3.0.0+).

## Table of Contents

- [Installation](#installation)
- [Global Options](#global-options)
- [Commands](#commands)
  - [visualify dev](#visualify-dev)
  - [visualify init](#visualify-init)
  - [visualify docs](#visualify-docs)
  - [visualify portal](#visualify-portal)
- [Exit Codes](#exit-codes)
- [Environment Variables](#environment-variables)

---

## Installation

```bash
# Install globally
npm i -g visualifyjs

# Or use with npx
npx visualifyjs dev
```

Verify installation:
```bash
visualify --version
```

---

## Global Options

These options are available for all commands:

| Option | Description |
|--------|-------------|
| `-v, --version` | Display version number |
| `-h, --help` | Display help for command |
| `--verbose` | Enable verbose output for debugging |

---

## Commands

### visualify dev

Start the development server with auto-detection or explicit mode.

#### Usage

```bash
visualify dev [mode] [path] [options]
```

#### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `mode` | Development mode: `auto`, `docs`, or `portal` | `auto` |
| `path` | Path to project directory | Current directory |

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --port <port>` | Port to run the server | `3000` |
| `-H, --host <host>` | Host to bind the server | `localhost` |
| `--no-open` | Do not open browser automatically | `false` |

#### Examples

```bash
# Auto-detect mode from visualify.json
visualify dev

# Explicit docs mode
visualify dev docs

# Explicit portal mode with custom port
visualify dev portal ./my-project --port 8080

# Auto-detect with specific path
visualify dev auto ./docs --port 4000
```

#### Auto-Detection Logic

When `mode` is `auto` (default), the CLI checks in order:

1. `mode` property in `visualify.json`
2. Presence of `docs/` directory → `docs` mode
3. Presence of `portal/` directory → `portal` mode
4. Default to `portal` mode

---

### visualify init

Initialize a new Visualify.js project with a template.

#### Usage

```bash
visualify init <template> [path] [options]
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `template` | Template type: `docs`, `portal`, or `full` | Yes |
| `path` | Directory to initialize | No (defaults to current) |

#### Templates

| Template | Description |
|----------|-------------|
| `docs` | Documentation site with chart support |
| `portal` | Data portal with navigation and visualization |
| `full` | Both docs and portal in one project |

#### Options

| Option | Description |
|--------|-------------|
| `--force` | Overwrite existing files |
| `--skip-install` | Skip npm install after initialization |

#### Examples

```bash
# Initialize docs template in current directory
visualify init docs

# Initialize portal template in specific directory
visualify init portal ./my-data-portal

# Initialize full template with force overwrite
visualify init full ./my-project --force

# Initialize without running npm install
visualify init docs ./docs --skip-install
```

#### Generated Structure

**Docs template:**
```
docs/
├── visualify.json
├── index.html
├── home.json
└── .nojekyll
```

**Portal template:**
```
portal/
├── visualify.json
├── index.html
├── home.json
├── data/
└── .nojekyll
```

**Full template:**
```
my-project/
├── visualify.json
├── index.html
├── docs/
│   └── home.json
├── portal/
│   └── home.json
└── .nojekyll
```

---

### visualify docs

Commands for documentation mode projects.

#### Subcommands

##### visualify docs dev

Start development server in docs mode.

```bash
visualify docs dev [path] [options]
```

Options:
| Option | Description | Default |
|--------|-------------|---------|
| `-p, --port <port>` | Port to run the server | `3000` |
| `-H, --host <host>` | Host to bind the server | `localhost` |
| `--no-open` | Do not open browser | `false` |

Example:
```bash
visualify docs dev ./docs --port 8080
```

##### visualify docs build

Build the documentation for production.

```bash
visualify docs build [path] [options]
```

Options:
| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <dir>` | Output directory | `dist` |
| `--minify` | Minify output | `true` |

Example:
```bash
visualify docs build ./docs --output ./build
```

---

### visualify portal

Commands for portal mode projects and data management.

#### Subcommands

##### visualify portal dev

Start development server in portal mode.

```bash
visualify portal dev [path] [options]
```

Options:
| Option | Description | Default |
|--------|-------------|---------|
| `-p, --port <port>` | Port to run the server | `3000` |
| `-H, --host <host>` | Host to bind the server | `localhost` |
| `--no-open` | Do not open browser | `false` |

Example:
```bash
visualify portal dev ./portal --port 8080
```

##### visualify portal build

Build the portal for production.

```bash
visualify portal build [path] [options]
```

Options:
| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <dir>` | Output directory | `dist` |
| `--minify` | Minify output | `true` |

Example:
```bash
visualify portal build ./portal --output ./build
```

##### visualify portal load-json

Load points from a JSON file into the portal data store.

```bash
visualify portal load-json <path> [options]
```

Arguments:
| Argument | Description | Required |
|----------|-------------|----------|
| `path` | Path to JSON file | Yes |

Options:
| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <path>` | Output file path | Auto-generated |
| `-f, --format <format>` | Output format: `json`, `csv` | `json` |

Example:
```bash
# Load JSON file
visualify portal load-json ./data/points.json

# Load with custom output
visualify portal load-json ./data/points.json --output ./processed/data.json
```

##### visualify portal mapping

Create a mapping file with optional key specification.

```bash
visualify portal mapping [options] <path>
```

Arguments:
| Argument | Description | Required |
|----------|-------------|----------|
| `path` | Path to source file | Yes |

Options:
| Option | Description | Default |
|--------|-------------|---------|
| `-k, --key <key>` | Key column name | `id` |
| `-o, --output <path>` | Output file path | `mapping.json` |
| `-s, --separator <char>` | CSV separator | `,` |

Example:
```bash
# Create mapping with default key
visualify portal mapping ./data/mapping.csv

# Create mapping with custom key
visualify portal mapping --key gene_id ./data/genes.csv --output ./gene-mapping.json
```

##### visualify portal rtree2d

Create a 2D R-tree index for efficient spatial data searching.

```bash
visualify portal rtree2d [options] <path>
```

Arguments:
| Argument | Description | Required |
|----------|-------------|----------|
| `path` | Path to spatial data file | Yes |

Options:
| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <path>` | Output directory | `./rtree` |
| `-x, --x-field <field>` | X coordinate field name | `x` |
| `-y, --y-field <field>` | Y coordinate field name | `y` |
| `-i, --id-field <field>` | ID field name | `id` |
| `--max-entries <number>` | Maximum entries per node | `9` |

Example:
```bash
# Create R-tree with defaults
visualify portal rtree2d ./data/spatial.json

# Create R-tree with custom fields
visualify portal rtree2d \
  --x-field longitude \
  --y-field latitude \
  --id-field sample_id \
  --output ./indexes/spatial \
  ./data/samples.json
```

---

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `0` | Success | Command executed successfully |
| `1` | General Error | Unspecified error occurred |
| `2` | Invalid Arguments | Invalid or missing command arguments |
| `3` | Configuration Error | Error in visualify.json configuration |
| `4` | File Not Found | Required file not found |
| `5` | Port In Use | Specified port is already in use |
| `6` | Build Error | Error during build process |
| `7` | Validation Error | Data validation failed |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VISUALIFY_PORT` | Default port for dev server | `3000` |
| `VISUALIFY_HOST` | Default host for dev server | `localhost` |
| `VISUALIFY_MODE` | Default mode (docs/portal) | `portal` |
| `VISUALIFY_CONFIG` | Path to config file | `./config/visualify.json` |
| `DEBUG` | Enable debug logging | `visualify:*` |

---

## Common Use Cases

### Development Workflow

```bash
# 1. Initialize a new portal project
visualify init portal ./my-portal

# 2. Navigate to project
cd ./my-portal

# 3. Start development server
visualify dev

# 4. Load spatial data
visualify portal load-json ./data/points.json

# 5. Create R-tree index
visualify portal rtree2d --output ./rtree ./data/points.json

# 6. Build for production
visualify portal build --output ./dist
```

### CI/CD Integration

```bash
#!/bin/bash
set -e

# Install visualifyjs
npm i -g visualifyjs

# Validate configuration
visualify dev --dry-run

# Build project
visualify portal build --output ./dist

# Verify build
if [ ! -d "./dist" ]; then
  echo "Build failed: dist directory not found"
  exit 1
fi
```

### Migration Script

```bash
#!/bin/bash

# Update from v2.x to v3.0.0

# 1. Uninstall old CLI
npm uninstall -g @visualify/cli

# 2. Install new CLI
npm i -g visualifyjs

# 3. Verify installation
visualify --version

# 4. Create visualify.json if it doesn't exist
if [ ! -f "visualify.json" ]; then
  echo '{"version": "3.0.0", "mode": "portal"}' > visualify.json
  echo "Created visualify.json with default configuration"
fi

echo "Migration complete!"
```

---

## Troubleshooting

### Command not found

```bash
# Check if installed
which visualify

# If not found, reinstall
npm i -g visualifyjs

# Or use npx
npx visualifyjs --version
```

### Port already in use

```bash
# Use a different port
visualify dev --port 8080

# Or let the CLI find an available port
visualify dev --port 0
```

### Configuration errors

```bash
# Validate configuration
visualify dev --dry-run

# Check configuration file
cat visualify.json
```

---

## Related Documentation

- [Migration Guide](../migration/v3-migration.md)
- [Configuration Reference](../configuration/visualify-json.md)
- [Quick Start](../../docs/quickstart.md)
