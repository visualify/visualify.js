# Visual Configuration Editor

Visualify.js includes a built-in visual editor for creating and modifying chart configurations through an intuitive graphical interface.

## Overview

The Visual Editor enables:
- Point-and-click chart configuration
- Real-time preview of changes
- Drag-and-drop data import
- Theme customization
- Export to JSON/JavaScript

## Launching the Editor

### CLI Command

```bash
# Start the visual editor
visualify edit

# With a specific configuration file
visualify edit ./my-chart.json

# With custom port
visualify edit --port 8080
```

### Programmatic API

```javascript
import { launchEditor } from 'visualify';

// Launch editor
const editor = await launchEditor({
    port: 3000,
    config: './chart-config.json',
    theme: 'dark'
});

// Close editor
editor.close();
```

### React Component

```javascript
import { VisualEditor } from 'visualify';

function App() {
    return (
        <VisualEditor
            initialConfig={chartConfig}
            onChange={(config) => console.log('Updated:', config)}
            onSave={(config) => saveToFile(config)}
        />
    );
}
```

## Editor Interface

### Layout

The editor consists of four main panels:

1. **Toolbar** (Top) - Chart type, save, export, undo/redo
2. **Canvas** (Center) - Live chart preview
3. **Properties** (Right) - Configuration options
4. **Data** (Bottom) - Data table and import

### Chart Type Selection

```javascript
// Available chart types in editor
const chartTypes = [
    'line',      // Line charts
    'bar',       // Bar/Column charts
    'pie',       // Pie/Donut charts
    'scatter',   // Scatter plots
    'radar',     // Radar/Spider charts
    'funnel',    // Funnel charts
    'heatmap',   // Heat maps
    'scatter3d', // 3D scatter plots
    'bar3d',     // 3D bar charts
    'surface3d'  // 3D surface plots
];
```

## Data Import

### Supported Formats

The editor accepts data in multiple formats:

| Format | Extension | Description |
|--------|-----------|-------------|
| JSON | `.json` | Standard JSON array/object |
| CSV | `.csv` | Comma-separated values |
| Excel | `.xlsx`, `.xls` | Microsoft Excel files |
| Google Sheets | URL | Import from Google Sheets |

### Drag and Drop

```javascript
// Enable drag-and-drop in editor
<VisualEditor
    allowDragDrop={true}
    onDataImport={(data, format) => {
        console.log(`Imported ${data.length} rows from ${format}`);
    }}
/>
```

### Data Transformation

```javascript
// Transform imported data
const transformConfig = {
    // Map columns to chart dimensions
    mapping: {
        x: 'date',
        y: 'revenue',
        category: 'region'
    },
    // Apply aggregations
    aggregation: {
        type: 'sum',
        groupBy: 'region'
    },
    // Filter data
    filter: {
        date: { from: '2024-01-01', to: '2024-12-31' }
    }
};
```

## Property Panels

### Basic Properties

Configure fundamental chart settings:

- **Title** - Chart title and subtitle
- **Legend** - Position, orientation, styling
- **Tooltip** - Trigger, formatter, position
- **Toolbox** - Export, data view, magic type

### Axis Configuration

```javascript
// X-axis properties
{
    "xAxis": {
        "type": "category",
        "name": "Month",
        "nameLocation": "middle",
        "nameGap": 30,
        "axisLine": { "show": true },
        "axisLabel": { "rotate": 45 }
    }
}
```

### Series Styling

Visual styling options:

- **Colors** - Single color, gradient, or palette
- **Line Style** - Width, type (solid/dashed/dotted)
- **Area Fill** - Opacity, gradient
- **Symbol** - Shape, size, rotation
- **Label** - Position, formatter, font

### Theme Customization

```javascript
// Custom theme in editor
const customTheme = {
    color: ['#5470c6', '#91cc75', '#fac858'],
    backgroundColor: '#f5f5f5',
    textStyle: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12
    },
    title: {
        textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    legend: {
        textStyle: { fontSize: 12 }
    }
};
```

## Real-Time Preview

### Auto-Update

Changes are reflected immediately in the preview panel:

```javascript
<VisualEditor
    autoUpdate={true}
    updateDelay={300}  // Debounce delay in ms
/>
```

### Preview Modes

- **Desktop** (1200px) - Full width preview
- **Tablet** (768px) - Medium width preview
- **Mobile** (375px) - Narrow width preview

## Export Options

### Configuration Export

```javascript
// Export formats
const exports = {
    json: () => editor.toJSON(),
    javascript: () => editor.toJavaScript(),
    react: () => editor.toReactComponent(),
    vue: () => editor.toVueComponent(),
    image: () => editor.toImage({ format: 'png', quality: 1 })
};
```

### Embedding

```javascript
// Generate embed code
const embedCode = editor.generateEmbed({
    type: 'iframe',
    width: 800,
    height: 600,
    responsive: true
});

// Result: <iframe src="..." width="100%" height="600"></iframe>
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save configuration |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + E` | Export |
| `Ctrl/Cmd + P` | Preview toggle |
| `Delete` | Remove selected element |
| `Escape` | Deselect / Close panel |

## Collaboration Features

### Real-Time Collaboration

```javascript
// Enable collaborative editing
<VisualEditor
    collaboration={{
        enabled: true,
        roomId: 'project-123',
        userName: 'John Doe',
        userColor: '#5470c6'
    }}
/>
```

### Version History

```javascript
// Access version history
const history = editor.getHistory();

// Revert to previous version
editor.revertTo(history[2].timestamp);

// Create named snapshot
editor.createSnapshot('Before color changes');
```

## Custom Extensions

### Adding Custom Widgets

```javascript
import { registerWidget } from 'visualify';

// Register custom property widget
registerWidget('custom-color-picker', {
    component: MyColorPicker,
    props: {
        allowGradient: true,
        presetColors: ['#f00', '#0f0', '#00f']
    }
});

// Use in configuration
{
    "properties": [{
        "key": "series.color",
        "widget": "custom-color-picker"
    }]
}
```

### Custom Chart Types

```javascript
// Register custom chart for editor
import { registerChartType } from 'visualify';

registerChartType('custom-gauge', {
    name: 'Gauge Chart',
    icon: 'gauge-icon.svg',
    component: GaugeChart,
    defaultConfig: {
        type: 'custom-gauge',
        min: 0,
        max: 100,
        value: 50
    },
    properties: [
        { key: 'min', type: 'number', label: 'Minimum' },
        { key: 'max', type: 'number', label: 'Maximum' },
        { key: 'value', type: 'number', label: 'Current Value' }
    ]
});
```

## Best Practices

1. **Save frequently** - Use auto-save or manual saves
2. **Use snapshots** - Create named versions before major changes
3. **Test responsive** - Check all preview modes
4. **Validate data** - Ensure imported data is clean
5. **Export backups** - Keep JSON exports as backups

## Troubleshooting

### Editor Not Loading

- Check port availability
- Verify configuration file is valid JSON
- Clear browser cache

### Preview Not Updating

- Disable browser extensions
- Check for JavaScript errors in console
- Reduce update delay if performance is slow

### Data Import Fails

- Verify file format is supported
- Check for encoding issues (use UTF-8)
- Ensure data is not too large (>10MB)
