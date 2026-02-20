# Plotly Component

The Plotly component integrates Plotly.js for advanced interactive visualizations. It supports scatter plots, violin plots, and other Plotly chart types with dynamic data fetching from backend APIs. Plotly provides additional interactivity like zoom, pan, hover tooltips, and data selection that complement the ECharts-based visualizations.

> **Note:** This component requires a backend API to supply data. A live demo is not available in this documentation.

## How It Works

The Plotly component uses a parser-based data pipeline. It fetches data from one or more backend sources, transforms the responses based on the configured parser type, and renders the result as an interactive Plotly chart.

```
 +-----------+      +------------+      +-----------+      +----------------+
 |  Backend  | ---> |   Parser   | ---> |  Plotly   | ---> |  Interactive   |
 |  API(s)   |      | (transform)|      |  Render   |      |  Chart Output  |
 +-----------+      +------------+      +-----------+      +----------------+
       |                  |
       |   sources[]      |   type: "scatter" | "violin" | ...
       |   responseKey    |   exclude: [...]
       +------------------+

 Trigger (optional)
 +------------+      Listens for events from other components
 |  Event     | ---> to refresh or filter the chart dynamically
 +------------+
```

When multiple sources are defined, the parser merges them before rendering. For example, a scatter plot may combine cell metadata (coordinates, cell types) with gene expression values (color overlay).

## Properties

| Property | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | Must be set to `"Plotly"`. |
| `id` | string | Yes | A unique identifier for this component instance. Used for cross-component references and event targeting. |
| `row` | int | No | The grid row position where the component is placed (1-based). |
| `col` | int | No | The grid column position where the component is placed (1-based). |
| `rowspan` | int | No | The number of grid rows this component spans. Defaults to 1. |
| `colspan` | int | No | The number of grid columns this component spans. Defaults to 1. |
| `settings` | object | No | Display and behavior settings. See the **Settings** table below. |
| `parser` | object | Yes | Defines data sources, transformations, and chart type. See the **Parser** table below. |
| `trigger` | object | No | Configures event listeners so this component reacts to changes in other components (e.g., gene selection). |

### Settings

| Property | Type | Default | Description |
|---|---|---|---|
| `preset` | string | - | A named preset that applies predefined styling and layout options (e.g., `"mmtrbc"`). |
| `ignoreEmptyData` | boolean | `false` | When `true`, the component will not render an error or placeholder if the API returns empty data. |

### Parser

| Property | Type | Required | Description |
|---|---|---|---|
| `sources` | array | Yes | An array of data source objects. Each source defines a backend endpoint to fetch data from. |
| `sources[].name` | string | Yes | A label identifying this data source (e.g., `"metadata"`, `"gene"`). Used internally for data merging. |
| `sources[].url` | string | Yes | The backend URL that returns the data for this source. |
| `sources[].responseKey` | string | No | A dot-path key to extract a specific field from the API response. For example, `"gene"` extracts `response.gene`. |
| `exclude` | array | No | An array of category names to exclude from the rendered chart. Useful for filtering out unwanted groups. |
| `type` | string | Yes | The Plotly chart type to render. Supported values include `"scatter"` and `"violin"`. |

## Example

### Scatter Plot (t-SNE / UMAP)

```json
{
    "id": "mmtrbc_tsne",
    "type": "Plotly",
    "col": 2,
    "rowspan": 3,
    "settings": {
        "preset": "mmtrbc",
        "ignoreEmptyData": true
    },
    "parser": {
        "sources": [
            {
                // Cell-type metadata with x/y coordinates
                "name": "metadata",
                "url": "<your-backend-url>/api/metadata"
            },
            {
                // Gene expression values overlaid as color
                "name": "gene",
                "url": "<your-backend-url>/api/gene",
                "responseKey": "gene"
            }
        ],
        // Exclude specific cell-type categories from the plot
        "exclude": ["BC-Mes", "BC-NE", "BC-Im"],
        "type": "scatter"
    }
}
```

### Violin Plot

```json
{
    "id": "mmtrbc_violin",
    "type": "Plotly",
    "col": 1,
    "rowspan": 3,
    "settings": {
        "preset": "mmtrbc",
        "ignoreEmptyData": true
    },
    "parser": {
        "sources": [
            {
                "name": "metadata",
                "url": "<your-backend-url>/api/metadata"
            },
            {
                "name": "gene",
                "url": "<your-backend-url>/api/gene",
                "responseKey": "gene"
            }
        ],
        "exclude": ["BC-Mes", "BC-NE"],
        // Renders a violin plot showing expression distribution per cell type
        "type": "violin"
    }
}
```

## See Also

- [DotBio Component](/components/dotBio.md) - Dot plot for gene expression across cell types
- [Echart Component](/components/echart.md) - General-purpose chart component using ECharts
- [Configuration](/configuration.md) - How to set up page mode
- [MmTrBC Showcase](https://visualify.pharmacy.arizona.edu/MmTrBC/) - Live project using Plotly scatter and violin plots
