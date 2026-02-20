# DotBio Component

The DotBio component creates dot plots (also known as bubble plots) commonly used in bioinformatics to display gene expression patterns across cell types. Each dot represents the expression of a gene in a specific cell type, with size indicating the percentage of expressing cells and color indicating expression level.

> **Note:** This component requires a backend API to supply gene expression and metadata. A live demo is not available in this documentation.

## How It Works

The DotBio component fetches cell-type metadata and gene expression data from backend APIs, then renders a matrix of dots where rows are cell types and columns are genes.

```
              Gene A   Gene B   Gene C   Gene D
Cell Type 1    ●        ◉        ○        ●
Cell Type 2    ○        ●        ◉        ○
Cell Type 3    ◉        ○        ●        ◉
Cell Type 4    ●        ●        ○        ○

● = high expression (large, dark)
◉ = medium expression
○ = low expression (small, light)
```

The dot size encodes the percentage of cells expressing the gene, while the dot color encodes the average expression level. This dual encoding lets researchers quickly identify which genes are active in which cell populations.

## Properties

| Property | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | Must be set to `"DotBio"`. |
| `id` | string | Yes | A unique identifier for this component instance. Used for cross-component references and event targeting. |
| `row` | int | No | The grid row position where the component is placed (1-based). |
| `col` | int | No | The grid column position where the component is placed (1-based). |
| `rowspan` | int | No | The number of grid rows this component spans. Defaults to 1. |
| `colspan` | int | No | The number of grid columns this component spans. Defaults to 1. |
| `settings` | object | No | Display and behavior settings. See the **Settings** table below. |
| `meta` | object | Yes | Defines the metadata API endpoint that provides cell-type information. |
| `meta.name` | string | Yes | A label for the metadata source (e.g., `"metadata"`). |
| `meta.url` | string | Yes | The backend URL that returns cell-type metadata. |
| `exclude_celltype` | array | No | An array of cell-type names to exclude from the plot. Useful for filtering out irrelevant or noisy populations. |
| `gene` | string | Yes | The backend API URL that returns gene expression data for the selected genes. |
| `genelist` | string | Yes | The name of the gene list variable to use. This should match a gene list defined elsewhere in the page configuration. |

### Settings

| Property | Type | Default | Description |
|---|---|---|---|
| `preset` | string | - | A named preset that applies predefined styling and layout options (e.g., `"mmtrbc"`). |
| `ignoreEmptyData` | boolean | `false` | When `true`, the component will not render an error or placeholder if the API returns empty data. |
| `showscale` | boolean | `true` | Whether to display the color scale legend alongside the plot. |
| `showlegend` | boolean | `true` | Whether to display the size legend indicating percentage of expressing cells. |

## Example

```json
{
    "id": "dotbio_expression",
    "type": "DotBio",
    "col": 1,
    "rowspan": 4,
    "colspan": 2,
    "settings": {
        "preset": "mmtrbc",
        "ignoreEmptyData": true,
        "showscale": true,
        "showlegend": true
    },
    "meta": {
        // Label for this metadata source
        "name": "metadata",
        // Backend endpoint returning cell-type information
        "url": "<your-backend-url>/api/metadata"
    },
    // Cell types to exclude from the visualization
    "exclude_celltype": ["BC-Mes", "BC-NE"],
    // Backend endpoint returning gene expression values
    "gene": "<your-backend-url>/api/gene",
    // References a gene list defined in the page configuration
    "genelist": "selected_genes"
}
```

## See Also

- [Plotly Component](/components/plotly.md) - For scatter and violin plots of expression data
- [Echart Component](/components/echart.md) - General-purpose chart component
- [Configuration](/configuration.md) - How to set up page mode
- [MmTrBC Showcase](https://visualify.pharmacy.arizona.edu/MmTrBC/) - Live project using DotBio and other components
