# Echart Component

The Echart component is a wrapper around the [Apache ECharts](https://echarts.apache.org/en/index.html) library. It provides the same charting capabilities as [Charts (2D)](/rechart-basic-usage.md) but is designed for **page mode**, enabling multi-component layouts with API data fetching.

## Live Demo

The Echart component uses the same rendering engine as the standard charts. Here's a scatter plot example:

```visualify
{
    "type": "scatter",
    "title": "Gene Expression Scatter Plot",
    "data": {
        "categories": [],
        "series": [
            {
                "name": "Cluster A",
                "data": [[10.0, 8.04], [8.0, 6.95], [13.0, 7.58], [9.0, 8.81], [11.0, 8.33], [14.0, 9.96], [6.0, 7.24], [4.0, 4.26], [12.0, 10.84], [7.0, 4.82], [5.0, 5.68]]
            },
            {
                "name": "Cluster B",
                "data": [[8.0, 3.04], [8.0, 3.95], [8.0, 4.58], [8.0, 3.81], [8.0, 4.33], [8.0, 3.96], [8.0, 4.24], [19.0, 12.5], [8.0, 3.26], [8.0, 3.84], [8.0, 3.68]]
            }
        ]
    }
}
```

And a line chart with multiple series:

```visualify
{
    "type": "line",
    "title": "Time-Series Expression Data",
    "smooth": true,
    "data": {
        "categories": ["0h", "2h", "4h", "8h", "12h", "24h", "48h"],
        "series": [
            { "name": "Gene A", "data": [2.1, 3.5, 5.2, 8.1, 6.3, 4.2, 3.0] },
            { "name": "Gene B", "data": [1.0, 1.2, 2.8, 7.5, 12.1, 9.8, 5.4] },
            { "name": "Gene C", "data": [5.5, 5.0, 4.2, 3.1, 2.5, 2.0, 1.8] }
        ]
    },
    "yAxis": { "name": "Expression Level" }
}
```

## How It Works

In page mode, the Echart component connects to **backend APIs** to fetch data dynamically. The data flow is:

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  visualify   │────>│   Parser    │────>│   ECharts    │
│   .json      │     │  (fetch +   │     │  (render)    │
│  config      │     │   transform)│     │              │
└─────────────┘     └─────────────┘     └──────────────┘
       │                    │
       │  parser.sources    │  fetched_data
       v                    v
┌─────────────┐     ┌─────────────┐
│  Backend    │────>│  Data       │
│  API        │     │  Transform  │
└─────────────┘     └─────────────┘
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Must be `"Echart"` |
| `id` | string | Yes | Unique identifier for the component |
| `row` | int | No | Grid row position |
| `col` | int | No | Grid column position |
| `rowspan` | int | No | Number of rows to span |
| `colspan` | int | No | Number of columns to span |
| `config` | object | Yes | Chart configuration (see below) |
| `parser` | object | No | Data fetching configuration |
| `trigger` | object | No | Event trigger configuration |

### config Properties

| Property | Type | Description |
|----------|------|-------------|
| `width` | int | Chart width in pixels |
| `height` | int | Chart height in pixels |
| `preset` | string | Named preset configuration |
| `title` | string | Chart title |
| `xAxis` | string/array | X-axis configuration |
| `yAxis` | string/array | Y-axis configuration |
| `legend` | object | Legend configuration |
| `tooltip` | object | Tooltip configuration |
| `data` | object | Inline data (when not using parser) |

### parser Properties

The `parser` object configures dynamic data fetching:

| Property | Type | Description |
|----------|------|-------------|
| `sources` | array | Array of data source configurations |
| `sources[].name` | string | Source identifier |
| `sources[].url` | string | Backend API URL |
| `sources[].type` | string | Chart type (e.g., `"scatter"`) |
| `sources[].responseKey` | string | Key to extract from API response |
| `sources[].trigger` | object | Trigger configuration for interactivity |
| `sources[].trigger.name` | string | Trigger name (links to other components) |
| `sources[].trigger.title` | boolean | Whether to update the chart title |

## Example

### Page Mode with API Data

```json
{
    "id": "expression_tsne",
    "type": "Echart",
    "col": 2,
    "rowspan": 3,
    "config": {
        "width": 600,
        "height": 600,
        "preset": "mmtrbc",
        "title": "t-SNE Visualization"
    },
    "parser": {
        "sources": [
            {
                "name": "metadata",
                "url": "https://your-api.com/metadata"
            },
            {
                "name": "gene",
                "url": "https://your-api.com/gene",
                "responseKey": "gene",
                "trigger": {
                    "name": "gene_search",
                    "title": true
                }
            }
        ],
        "type": "scatter"
    }
}
```

### Static Data (No API)

```json
{
    "id": "static_chart",
    "type": "Echart",
    "row": 1,
    "col": 1,
    "config": {
        "title": "Static Bar Chart",
        "type": "bar",
        "data": {
            "Series A": [120, 200, 150, 80, 70],
            "Series B": [60, 120, 90, 140, 130]
        },
        "xAxis": ["Mon", "Tue", "Wed", "Thu", "Fri"]
    }
}
```

## See Also

- [Charts (2D)](/rechart-basic-usage.md) - Same engine, simpler usage for standalone charts
- [Configuration](/configuration.md) - How to set up page mode
- [MmTrBC Showcase](https://visualify.pharmacy.arizona.edu/MmTrBC/) - Live example using Echart components
