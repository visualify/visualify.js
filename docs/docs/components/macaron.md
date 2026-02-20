# Macaron Component

The Macaron component renders an interactive **graph visualization** showing relationships between nodes. It's ideal for displaying hierarchical data, network graphs, and taxonomy trees with drag-and-drop interactivity.

## Features

- Interactive node selection with click events
- Drag-and-drop repositioning of nodes
- Configurable node sizes based on data values
- Category-based coloring
- Hierarchical edge relationships

## Architecture

```
┌─────────────────────────────────────────┐
│              Macaron Graph               │
│                                          │
│    ┌───────┐                             │
│    │ Root  │──────────┐                  │
│    │ Node  │          │                  │
│    └───┬───┘     ┌────┴────┐             │
│        │         │ Child B │             │
│   ┌────┴────┐    └────┬────┘             │
│   │ Child A │         │                  │
│   └────┬────┘    ┌────┴────┐             │
│        │         │ Leaf D  │             │
│   ┌────┴────┐    └─────────┘             │
│   │ Leaf C  │                            │
│   └─────────┘                            │
│                                          │
│  Nodes: sized by value, colored by       │
│  category, draggable, selectable         │
└─────────────────────────────────────────┘
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Must be `"Macaron"` |
| `id` | string | Yes | Unique identifier for the component |
| `title` | string | No | Title displayed above the graph |
| `row` | int | No | Grid row position |
| `col` | int | No | Grid column position |
| `style` | object | No | CSS styles (height, width, font, border) |
| `config` | object | Yes | Graph configuration (see below) |
| `data` | object | Yes | Graph data: nodes, edges, categories |

### config Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `animation` | boolean | `true` | Enable/disable animation |
| `draggable` | boolean | `false` | Allow drag-and-drop of nodes |
| `height` | string | `"100%"` | Graph height |
| `unclickable` | array | `[]` | Node names that cannot be clicked |
| `symbolSize` | string | `"value"` | Size basis: `"value"` for data-driven |
| `color.selected` | string | - | Color for selected nodes |
| `color.unselectable` | string | - | Color for unclickable nodes |

### data Properties

| Property | Type | Description |
|----------|------|-------------|
| `nodes` | array | Array of `{ name, category, value }` objects |
| `edges` | array | Array of `{ source, target, level }` objects |
| `categories` | array | Array of `{ name }` objects for node coloring |

## Example

### Cell Type Hierarchy

This example shows a biological cell type taxonomy tree:

```json
{
    "id": "celltype",
    "type": "Macaron",
    "title": "Select Cell Type",
    "row": 1,
    "col": 1,
    "style": {
        "height": "350px",
        "width": "350px"
    },
    "data": {
        "nodes": [
            { "name": "Esophagus", "category": 1, "value": 216229 },
            { "name": "Epithelium", "category": 2, "value": 108800 },
            { "name": "Stroma", "category": 2, "value": 107429 },
            { "name": "EPI (E)", "category": 3, "value": 97799 },
            { "name": "ST (E)", "category": 3, "value": 1760 },
            { "name": "IM (E)", "category": 3, "value": 5200 },
            { "name": "MES (S)", "category": 3, "value": 45000 },
            { "name": "ENS (S)", "category": 3, "value": 32000 },
            { "name": "ENDO (S)", "category": 3, "value": 30429 }
        ],
        "edges": [
            { "source": "Esophagus", "target": "Epithelium", "level": 1 },
            { "source": "Esophagus", "target": "Stroma", "level": 1 },
            { "source": "Epithelium", "target": "EPI (E)", "level": 2 },
            { "source": "Epithelium", "target": "ST (E)", "level": 2 },
            { "source": "Epithelium", "target": "IM (E)", "level": 2 },
            { "source": "Stroma", "target": "MES (S)", "level": 2 },
            { "source": "Stroma", "target": "ENS (S)", "level": 2 },
            { "source": "Stroma", "target": "ENDO (S)", "level": 2 }
        ],
        "categories": [
            { "name": "Root" },
            { "name": "Tissue" },
            { "name": "Cell Type" }
        ]
    },
    "config": {
        "animation": false,
        "draggable": true,
        "height": "88%",
        "unclickable": ["Esophagus"],
        "symbolSize": "value",
        "color": {
            "selected": "skyblue",
            "unselectable": "black"
        }
    }
}
```

### How Selection Works

When a user clicks a node in the Macaron graph:

1. The node becomes **highlighted** with the `selected` color
2. The selection is stored in the global state under the component's `id`
3. Other components (e.g., Echart, ScatterL) can **trigger** on this selection to update their data
4. `unclickable` nodes are displayed with the `unselectable` color and do not respond to clicks

This creates an interactive filtering workflow:

```
User clicks "EPI (E)" in Macaron
        │
        v
Global state: celltype = "EPI (E)"
        │
        v
Echart component triggers API call with "EPI (E)"
        │
        v
Scatter plot updates to show only EPI cells
```

## See Also

- [EsoDev Showcase](https://visualify.pharmacy.arizona.edu/EsoDev/) - Live example with Macaron cell type selector
- [Configuration](/configuration.md) - Page mode setup
