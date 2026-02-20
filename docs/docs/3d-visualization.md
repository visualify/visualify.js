<!-- Load 3D visualization examples from external script to avoid docsify parsing issues -->
<script src="./static/js/3d-viz-examples.js"></script>

# 3D Visualization

Visualify.js supports 3D visualization through ECharts GL and Three.js integration.

## Table of Contents

- [Overview](#overview)
- [ECharts GL 3D Charts](#echarts-gl-3d-charts)
  - [Scatter3D](#scatter3d)
  - [Bar3D](#bar3d)
  - [Surface3D](#surface3d)
  - [Line3D](#line3d)
- [Three.js Integration](#threejs-integration)
- [WebGL Support](#webgl-support)
- [Performance Considerations](#performance-considerations)

---

## Overview

Visualify.js provides two approaches to 3D visualization:

1. **ECharts GL** - For standard 3D charts (scatter, bar, surface, line)
2. **Three.js** - For custom 3D scenes and advanced visualizations

Both libraries are loaded on-demand to minimize initial bundle size.

---

## ECharts GL 3D Charts

### Scatter3D

Create interactive 3D scatter plots with x, y, z dimensions.

<!-- tabs:start -->

#### **Output**

<div id="scatter3d-example" style="height: 400px;">
    <p>Loading 3D Scatter Plot... (requires WebGL support)</p>
</div>

#### **Configuration**

```json
{
  "type": "scatter3d",
  "title": "3D Scatter Plot Example",
  "data": {
    "x": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "y": [10, 15, 8, 20, 12, 18, 22, 16, 14, 25],
    "z": [5, 8, 12, 7, 9, 11, 6, 13, 10, 15]
  },
  "xAxis3D": { "name": "X Dimension", "type": "value" },
  "yAxis3D": { "name": "Y Dimension", "type": "value" },
  "zAxis3D": { "name": "Z Dimension", "type": "value" },
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

<!-- tabs:end -->

#### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `data.x` | Array | X-axis data values |
| `data.y` | Array | Y-axis data values |
| `data.z` | Array | Z-axis data values |
| `xAxis3D` | Object | X-axis configuration (name, type, min, max) |
| `yAxis3D` | Object | Y-axis configuration |
| `zAxis3D` | Object | Z-axis configuration |
| `grid3D.viewControl.autoRotate` | Boolean | Enable auto-rotation |
| `visualMap` | Object | Color mapping based on dimension |

---

### Bar3D

Create 3D bar charts for volumetric data visualization.

<!-- tabs:start -->

#### **Output**

<div id="bar3d-example" style="height: 400px;">
    <p>Loading 3D Bar Chart... (requires WebGL support)</p>
</div>

#### **Configuration**

```json
{
  "type": "bar3d",
  "title": "3D Bar Chart Example",
  "data": [
    [0, 0, 10], [0, 1, 20], [0, 2, 15],
    [1, 0, 25], [1, 1, 30], [1, 2, 20],
    [2, 0, 15], [2, 1, 25], [2, 2, 35]
  ],
  "xAxis3D": {
    "type": "category",
    "data": ["A", "B", "C"]
  },
  "yAxis3D": {
    "type": "category",
    "data": ["X", "Y", "Z"]
  },
  "zAxis3D": { "type": "value" },
  "grid3D": {
    "boxWidth": 200,
    "boxDepth": 80,
    "light": {
      "main": { "intensity": 1.2, "shadow": true }
    }
  },
  "shading": "lambert"
}
```

<!-- tabs:end -->

#### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `data` | Array | Array of [x, y, z] values |
| `xAxis3D.type` | String | `"category"` for discrete values |
| `yAxis3D.type` | String | `"category"` for discrete values |
| `shading` | String | `"lambert"` for realistic lighting |
| `grid3D.light` | Object | Lighting configuration |

---

### Surface3D

Create 3D surface plots for continuous data visualization.

<!-- tabs:start -->

#### **Output**

<div id="surface3d-example" style="height: 400px;">
    <p>Loading 3D Surface Plot... (requires WebGL support)</p>
</div>

#### **Configuration**

```json
{
  "type": "surface3d",
  "title": "3D Surface Plot Example",
  "data": {
    "x": [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
    "y": [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
    "z": [
      [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0],
      [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
      [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2],
      [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
      [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
      [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5],
      [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
      [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
      [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2],
      [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
      [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0]
    ]
  },
  "xAxis3D": { "type": "value" },
  "yAxis3D": { "type": "value" },
  "zAxis3D": { "type": "value" },
  "grid3D": {
    "viewControl": { "autoRotate": true }
  },
  "visualMap": {
    "show": true,
    "dimension": 2,
    "min": 0,
    "max": 1.0,
    "inRange": {
      "color": ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]
    }
  }
}
```

<!-- tabs:end -->

#### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `data.x` | Array | X-axis grid values |
| `data.y` | Array | Y-axis grid values |
| `data.z` | 2D Array | Height values (z[x][y]) |
| `visualMap` | Object | Color gradient for height values |

---

### Line3D

Create 3D line charts for trajectory visualization.

```json
{
  "type": "line3d",
  "title": "3D Line Chart",
  "data": [
    [0, 0, 0],
    [1, 2, 3],
    [2, 4, 2],
    [3, 6, 5],
    [4, 8, 4],
    [5, 10, 7]
  ],
  "xAxis3D": { "type": "value" },
  "yAxis3D": { "type": "value" },
  "zAxis3D": { "type": "value" },
  "grid3D": {
    "viewControl": {
      "projection": "perspective",
      "autoRotate": false
    }
  },
  "lineStyle": {
    "width": 4,
    "color": "#5470c6"
  }
}
```

---

## Three.js Integration

For custom 3D scenes beyond standard charts, Visualify.js provides Three.js integration through `@react-three/fiber`.

### Basic Three.js Scene

```json
{
  "type": "threejs",
  "scene": {
    "camera": {
      "position": [0, 0, 100],
      "fov": 75,
      "near": 0.1,
      "far": 1000
    },
    "lights": [
      {
        "type": "ambient",
        "color": "#ffffff",
        "intensity": 0.5
      },
      {
        "type": "directional",
        "position": [10, 10, 10],
        "castShadow": true
      }
    ],
    "objects": [
      {
        "type": "mesh",
        "geometry": {
          "type": "box",
          "width": 10,
          "height": 10,
          "depth": 10
        },
        "material": {
          "type": "standard",
          "color": "#ff0000"
        },
        "position": [0, 0, 0],
        "rotation": [0, 0.5, 0]
      }
    ]
  },
  "controls": "orbit",
  "animation": {
    "autoRotate": true,
    "speed": 0.01
  }
}
```

---

## WebGL Support

3D charts require WebGL support. Visualify.js automatically detects WebGL availability and shows a fallback message if not supported.

### Browser Compatibility

| Browser | Version | WebGL Support |
|---------|---------|---------------|
| Chrome | 9+ | ✓ Full |
| Firefox | 4+ | ✓ Full |
| Safari | 5.1+ | ✓ Full |
| Edge | 12+ | ✓ Full |
| IE | 11 | ⚠ Limited |

### Fallback Behavior

If WebGL is not supported:
1. A user-friendly error message is displayed
2. The chart container shows fallback content
3. Console warnings provide debugging information

---

## Performance Considerations

### Large Datasets

For datasets with 10,000+ points:
- Use `sampling` or `progressive` rendering
- Consider level-of-detail (LOD) techniques
- Enable `large` mode in ECharts GL

```json
{
  "type": "scatter3d",
  "data": { ... },
  "series": [{
    "type": "scatter3D",
    "large": true,
    "largeThreshold": 2000,
    "progressive": 400,
    "progressiveThreshold": 3000
  }]
}
```

### Lazy Loading

3D libraries are loaded on-demand:
- ECharts GL loads when first 3D chart is rendered
- Three.js loads when ThreeScene component is used
- No impact on initial page load if no 3D charts are present

### Memory Management

- WebGL contexts are automatically cleaned up when charts unmount
- Dispose geometries, materials, and textures properly
- Use `cleanupWebGL()` utility for manual cleanup if needed

---

## See Also

- [Configuration Reference](./configuration/visualify-json.md)
- [CLI Commands](./cli/commands.md)
- [Migration Guide](./migration/v3-migration.md)
