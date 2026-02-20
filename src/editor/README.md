# Visualify Visual Editor

A visual configuration editor for Visualify.js that makes it easy to create and edit chart configurations without writing JSON.

## Features

- **Drag-and-Drop Interface**: Build charts by dragging chart types from the sidebar
- **Property Panels**: Dynamic forms for each chart type (2D and 3D)
- **Live Preview**: Real-time chart rendering as you edit
- **Import/Export**: Load and save `visualify.json` configurations
- **Undo/Redo History**: Full editing history with keyboard shortcuts
- **Auto-Save**: Automatic saving to localStorage
- **Responsive Design**: Works on different screen sizes

## Supported Chart Types

### 2D Charts
- Scatter
- Bar
- Line
- Pie
- Radar
- Funnel
- Heatmap
- Box Plot

### 3D Charts
- 3D Scatter
- 3D Bar
- 3D Surface
- 3D Line

## Usage

### CLI Command

```bash
# Open editor with default config
visualify edit

# Open specific config file
visualify edit my-config.json

# Custom port
visualify edit --port 4000

# Don't open browser automatically
visualify edit --no-open
```

### Programmatic Usage

```javascript
import { mountEditor } from './editor';

// Mount editor to a DOM element
mountEditor('#editor-container', {
  config: {
    version: '3.0.0',
    charts: [],
    layout: { type: 'grid', rows: 1, cols: 1 },
    theme: 'modern'
  }
});
```

## UI Layout

```
+------------------------------------------+
|  Toolbar (New, Open, Save, Export, Undo) |
+----------+----------------+--------------+
|          |                |              |
| Chart    |    Canvas      |  Properties  |
| Types    |    (D&D)       |  Panel       |
|          |                |              |
+----------+----------------+--------------+
|  Status Bar (Errors, Auto-save status)   |
+------------------------------------------+
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + Shift + Z` | Redo (alternative) |
| `Ctrl/Cmd + S` | Export configuration |
| `Escape` | Close modals |

## File Structure

```
editor/
├── index.js                 # Main entry point
├── context/
│   └── EditorContext.js     # React context for state management
├── components/
│   ├── Editor.jsx           # Main editor UI
│   ├── ChartBuilder.jsx     # Drag-and-drop canvas
│   ├── ChartTypeSidebar.jsx # Chart type selector
│   ├── PropertyPanel.jsx    # Property editor
│   ├── Preview.jsx          # Live preview
│   └── StatusBar.jsx        # Status bar
├── utils/
│   └── chartValidator.js    # Configuration validation
├── styles/
│   └── editor.css           # Editor styles
└── README.md                # This file
```

## Architecture

### State Management

The editor uses React Context for state management with the following structure:

```javascript
{
  config: {
    version: '3.0.0',
    charts: [...],
    layout: {...},
    theme: 'modern'
  },
  selectedChartId: string | null,
  history: {
    past: [...],
    present: {...},
    future: [...]
  }
}
```

### Actions

- `setConfig(config)` - Replace entire configuration
- `addChart(chart)` - Add a new chart
- `updateChart(id, updates)` - Update chart properties
- `removeChart(id)` - Remove a chart
- `setSelectedChart(id)` - Select a chart for editing
- `undo()` / `redo()` - History navigation

## Validation

Charts are validated in real-time with checks for:

- Required fields (type, data)
- Data format compatibility
- 3D WebGL support
- Configuration completeness

## Building

The editor is built as a React application and bundled for distribution:

```bash
# Development
npm run editor:dev

# Build
npm run editor:build
```

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

3D charts require WebGL support.
