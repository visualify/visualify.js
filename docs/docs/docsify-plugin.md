# Docsify Plugin

The Visualify Docsify Plugin enables seamless embedding of interactive charts directly in your Docsify documentation using simple markdown code blocks.

## Overview

The Visualify Docsify Plugin extends Docsify's markdown rendering to support ` ```visualify ` code blocks that automatically render as interactive charts. It provides:

- **Zero-configuration setup** - Works out of the box with auto-mounting
- **Multiple chart types** - Line, bar, pie, scatter, 3D charts, and more
- **External data support** - Load chart data from JSON files
- **SPA navigation aware** - Charts persist and remount during route changes
- **Lazy loading** - Visualify components load only when needed

## Installation

### CDN Method (Recommended)

Add the Visualify Docsify Plugin script to your `index.html` after the Docsify script:

```html
<!-- Docsify -->
<script src="//cdn.jsdelivr.net/npm/docsify/lib/docsify.min.js"></script>

<!-- Visualify Docsify Plugin -->
<script src="https://unpkg.com/visualify@latest/dist/docsify-plugin.js"></script>
```

### npm Method

If you're building a custom Docsify setup with a bundler:

```bash
npm install visualify
```

Then import and register the plugin:

```javascript
import VisualifyDocs from 'visualify/docsify';

window["$docsify"] = {
    plugins: [
        VisualifyDocs.plugin.install,
        // ... other plugins
    ]
};
```

### Manual Registration

The plugin auto-registers with Docsify if `window["$docsify"]` exists, but you can also manually register it:

```javascript
window["$docsify"] = window["$docsify"] || {};
window["$docsify"].plugins = [].concat(
    window["$docsify"].plugins || [],
    VisualifyDocs.plugin.install
);
```

## Basic Usage

### Using Visualify Code Blocks

Embed charts in your markdown using ` ```visualify ` code blocks with JSON configuration:

<pre lang="markdown">
```visualify
{
    "type": "line",
    "title": "Monthly Sales",
    "data": {
        "categories": ["Jan", "Feb", "Mar", "Apr", "May"],
        "series": [{
            "name": "Revenue",
            "data": [120, 200, 150, 280, 220]
        }]
    }
}
```
</pre>

### Configuration Format

The configuration inside visualify blocks is standard JSON with the following structure:

```json
{
    "type": "line",
    "title": "Chart Title",
    "data": {
        "categories": ["A", "B", "C"],
        "series": [{
            "name": "Series 1",
            "data": [10, 20, 30]
        }]
    },
    "xAxis": { "name": "X Axis" },
    "yAxis": { "name": "Y Axis" }
}
```

### Auto-Mounting Behavior

The plugin automatically:

1. Detects ` ```visualify ` code blocks during markdown rendering
2. Converts them to chart containers with `data-visualify` attributes
3. Lazily loads Visualify components on first use
4. Mounts charts when the DOM is ready
5. Handles cleanup and remounting during SPA navigation

## Configuration Options

### Chart Types

The following chart types are supported:

| Type | Description |
|------|-------------|
| `line` | Line charts with area fill options |
| `bar` | Vertical and horizontal bar charts |
| `pie` | Pie and donut charts |
| `scatter` | Scatter plots with bubble options |
| `scatter3d` | 3D scatter plots (requires WebGL) |
| `bar3d` | 3D bar charts (requires WebGL) |
| `surface3d` | 3D surface plots (requires WebGL) |
| `line3d` | 3D line charts (requires WebGL) |
| `heatmap` | Heatmap visualization |
| `violin` | Violin plots for distribution |
| `dotplot` | Dot plots for categorical data |
| `hilbert` | Hilbert curve visualization |
| `visium` | Spatial transcriptomics visualization |

### Data Format

#### Standard Charts (line, bar, pie, scatter)

```json
{
    "type": "bar",
    "data": {
        "categories": ["A", "B", "C", "D"],
        "series": [
            {
                "name": "Series 1",
                "data": [120, 200, 150, 80]
            },
            {
                "name": "Series 2",
                "data": [90, 150, 200, 120]
            }
        ]
    }
}
```

**Live Demo:**

```visualify
{
    "type": "bar",
    "title": "Standard Bar Chart Demo",
    "data": {
        "categories": ["A", "B", "C", "D"],
        "series": [
            {
                "name": "Series 1",
                "data": [120, 200, 150, 80]
            },
            {
                "name": "Series 2",
                "data": [90, 150, 200, 120]
            }
        ]
    }
}
```

#### 3D Charts

For 3D scatter plots:

```json
{
    "type": "scatter3d",
    "data": {
        "x": [1, 2, 3, 4, 5],
        "y": [10, 15, 8, 20, 12],
        "z": [5, 8, 12, 7, 9]
    },
    "xAxis3D": { "name": "X" },
    "yAxis3D": { "name": "Y" },
    "zAxis3D": { "name": "Z" }
}
```

**Live Demo:**

```visualify
{
    "type": "scatter3d",
    "title": "3D Scatter Demo",
    "data": {
        "x": [1, 2, 3, 4, 5],
        "y": [10, 15, 8, 20, 12],
        "z": [5, 8, 12, 7, 9]
    },
    "xAxis3D": { "name": "X" },
    "yAxis3D": { "name": "Y" },
    "zAxis3D": { "name": "Z" }
}
```

### Styling Options

Control chart appearance with these common options:

```json
{
    "type": "line",
    "title": {
        "text": "Styled Chart",
        "left": "center"
    },
    "theme": {
        "color": ["#5470c6", "#91cc75", "#fac858"]
    },
    "grid": {
        "left": "10%",
        "right": "10%",
        "bottom": "15%"
    },
    "legend": {
        "bottom": 10
    },
    "tooltip": {
        "trigger": "axis"
    }
}
```

### External Data Sources

Load chart configuration from external JSON files using the `src` property:

<pre lang="markdown">
```visualify
{
    "src": "./data/sales-chart.json"
}
```
</pre>

The external JSON file should contain the complete chart configuration:

```json
{
    "type": "pie",
    "title": "Sales Distribution",
    "data": {
        "series": [{
            "name": "Sales",
            "data": [
                { "name": "Product A", "value": 435 },
                { "name": "Product B", "value": 310 },
                { "name": "Product C", "value": 234 }
            ]
        }]
    }
}
```

## Advanced Features

### 3D Visualization Support

3D charts are automatically detected and rendered using ECharts GL. No additional configuration is required:

<pre lang="markdown">
```visualify
{
    "type": "scatter3d",
    "title": "3D Data Visualization",
    "data": {
        "x": [1, 2, 3, 4, 5],
        "y": [10, 15, 8, 20, 12],
        "z": [5, 8, 12, 7, 9]
    },
    "xAxis3D": { "name": "X Dimension" },
    "yAxis3D": { "name": "Y Dimension" },
    "zAxis3D": { "name": "Z Dimension" },
    "grid3D": {
        "viewControl": {
            "autoRotate": true,
            "autoRotateSpeed": 10
        }
    }
}
```
</pre>

### Live Editor Integration

Create interactive chart editors for documentation examples:

```html
<div id="live-editor"></div>
<script>
    const editor = new VisualifyDocs.createEditor({
        container: '#live-editor',
        initialConfig: {
            type: 'line',
            data: {
                categories: ['A', 'B', 'C'],
                series: [{ name: 'Data', data: [10, 20, 30] }]
            }
        }
    });
</script>
```

### Custom Themes

Apply custom themes to charts:

```json
{
    "type": "bar",
    "theme": {
        "color": ["#ff6b6b", "#4ecdc4", "#45b7d1"],
        "backgroundColor": "#f8f9fa"
    },
    "data": { ... }
}
```

### Event Handling

Access chart instances for custom event handling:

```javascript
// After chart is mounted, access via DOM
document.querySelectorAll('[data-visualify]').forEach(el => {
    const chart = VisualifyDocs.plugin.getChart(el);
    if (chart) {
        // Add custom event listeners
        console.log('Chart mounted:', chart.getId());
    }
});
```

## Examples

### Simple Line Chart

<pre lang="markdown">
```visualify
{
    "type": "line",
    "title": "Monthly Revenue",
    "data": {
        "categories": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "series": [{
            "name": "Revenue ($K)",
            "data": [65, 78, 90, 85, 95, 110],
            "smooth": true,
            "areaStyle": { "opacity": 0.3 }
        }]
    },
    "yAxis": { "name": "Revenue ($K)" }
}
```
</pre>

### Bar Chart with Multiple Series

<pre lang="markdown">
```visualify
{
    "type": "bar",
    "title": {
        "text": "Quarterly Comparison",
        "left": "center"
    },
    "data": {
        "categories": ["Q1", "Q2", "Q3", "Q4"],
        "series": [
            {
                "name": "2023",
                "data": [320, 332, 301, 334]
            },
            {
                "name": "2024",
                "data": [420, 452, 401, 474]
            }
        ]
    },
    "legend": { "bottom": 10 }
}
```
</pre>

### 3D Scatter Plot

<pre lang="markdown">
```visualify
{
    "type": "scatter3d",
    "title": "3D Point Cloud",
    "data": {
        "x": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "y": [10, 15, 8, 20, 12, 18, 22, 16, 14, 25],
        "z": [5, 8, 12, 7, 9, 11, 6, 13, 10, 15]
    },
    "xAxis3D": { "name": "X", "type": "value" },
    "yAxis3D": { "name": "Y", "type": "value" },
    "zAxis3D": { "name": "Z", "type": "value" },
    "grid3D": {
        "boxWidth": 100,
        "boxDepth": 80,
        "viewControl": {
            "autoRotate": true,
            "autoRotateSpeed": 10
        }
    },
    "visualMap": {
        "dimension": 2,
        "max": 25,
        "inRange": {
            "color": ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8"]
        }
    }
}
```
</pre>

### Using External JSON File

Create a `chart-data.json` file:

```json
{
    "type": "pie",
    "title": "Market Share",
    "radius": ["40%", "70%"],
    "data": {
        "series": [{
            "name": "Market Share",
            "data": [
                { "value": 1048, "name": "Product A" },
                { "value": 735, "name": "Product B" },
                { "value": 580, "name": "Product C" },
                { "value": 484, "name": "Product D" },
                { "value": 300, "name": "Product E" }
            ]
        }]
    }
}
```

Reference it in markdown:

<pre lang="markdown">
```visualify
{
    "src": "./chart-data.json"
}
```
</pre>

## Troubleshooting

### Charts Not Rendering

**Problem**: Chart container appears but no chart is displayed.

**Solutions**:

1. **Check JSON syntax** - Ensure your configuration is valid JSON:
   ```bash
   # Validate JSON
   cat your-config.json | python -m json.tool
   ```

2. **Check browser console** - Look for JavaScript errors

3. **Verify plugin is loaded** - Check that the script tag is present:
   ```javascript
   console.log(window.VisualifyDocs); // Should output the plugin object
   ```

4. **Check data format** - Ensure `data` property exists and matches the chart type requirements

### WebGL Issues for 3D Charts

**Problem**: 3D charts show a warning or don't render.

**Solutions**:

1. **Verify WebGL support**:
   ```javascript
   const canvas = document.createElement('canvas');
   const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
   console.log('WebGL supported:', !!gl);
   ```

2. **Update graphics drivers** - Outdated drivers can cause WebGL issues

3. **Check browser compatibility**:
   - Chrome 9+
   - Firefox 4+
   - Safari 5.1+
   - Edge 12+

4. **Disable hardware acceleration** (for testing):
   - Chrome: Settings > Advanced > System > Use hardware acceleration when available

### CORS Issues with External Data

**Problem**: External JSON files fail to load with CORS errors.

**Solutions**:

1. **Enable CORS on your server** - Add headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET
   ```

2. **Use relative paths** - For local files:
   ```json
   { "src": "./data/chart.json" }
   ```

3. **Host data on same origin** - Place JSON files in your docs folder

4. **Use a CORS proxy** (for development only):
   ```json
   { "src": "https://cors-anywhere.herokuapp.com/https://example.com/data.json" }
   ```

### Performance Issues

**Problem**: Page becomes slow with multiple charts.

**Solutions**:

1. **Limit concurrent charts** - Consider using tabs or accordions
2. **Use external data** - Load large datasets from separate files
3. **Enable lazy loading** - Charts load only when scrolled into view
4. **Optimize data size** - Sample large datasets before visualization

## API Reference

### window.$visualify

The global Visualify configuration object (if using Visualify as a chart module):

```javascript
window["$visualify"] = {
    mode: 'charts',
    theme: 'modern',
    // ... other options
};
```

### Recharts Class Methods

When creating charts programmatically:

```javascript
const chart = new VisualifyDocs.Recharts(config);

// Mount to DOM element
chart.mount('#chart-container');

// Mount to element reference
const el = document.getElementById('chart');
chart.mount(el);

// Update configuration
chart.update(newConfig);

// Unmount and cleanup
chart.unmount();

// Get chart ID
const id = chart.getId();

// Check if mounted
const isMounted = chart.getIsMounted();
```

### Plugin Hooks

Access the plugin's lifecycle methods:

```javascript
// Mount a single chart element
VisualifyDocs.plugin.mountChart(element, config);

// Mount all charts in a container
VisualifyDocs.plugin.mountAllCharts(document);

// Cleanup charts (useful for SPA navigation)
VisualifyDocs.plugin.cleanupCharts(document);

// Check if element has mounted chart
const isMounted = VisualifyDocs.plugin.isMounted(element);

// Get chart instance for element
const chart = VisualifyDocs.plugin.getChart(element);

// Preload components
await VisualifyDocs.plugin.loadVisualifyComponents();
```

### Plugin Lifecycle

The plugin integrates with Docsify's lifecycle hooks:

| Hook | Description |
|------|-------------|
| `init` | Registers the markdown renderer |
| `beforeEach` | Preloads components if visualify blocks detected |
| `afterEach` | Fallback processing for any missed blocks |
| `mounted` | Initial chart mounting |
| `doneEach` | Re-mount charts after SPA navigation |
| `destroyed` | Cleanup charts when leaving page |

### Markdown Processing Utilities

Process visualify blocks programmatically:

```javascript
// Process a single code block
const html = VisualifyDocs.markdown.process(jsonString);

// Process all blocks in markdown content
const processed = VisualifyDocs.markdown.processBlocks(markdownContent);

// Extract configurations (useful for search indexing)
const configs = VisualifyDocs.markdown.extractConfigs(markdownContent);
```

---

## See Also

- [3D Visualization](./3d-visualization.md)
- [Configuration](./configuration.md)
- [Recharts Basic Usage](./rechart-basic-usage.md)
- [Rechart Attributes](./rechart-attributes.md)
