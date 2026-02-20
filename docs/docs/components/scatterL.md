# ScatterL Component

ScatterL is a high-performance 2D scatter plot built on Plotly, optimized for large datasets using R-tree spatial indexing. It supports viewport-based data loading, meaning only visible data points are fetched from the backend. This makes it suitable for datasets with millions of points where loading everything at once would be impractical.

> **Note:** ScatterL requires a backend API and cannot be used as an inline docsify component. See [MmTrBC](https://visualify.pharmacy.arizona.edu/MmTrBC/) for a live example.

## How It Works

ScatterL uses a viewport-based loading strategy. As the user pans and zooms, the component calculates the visible coordinate range and requests only the data points within that region from the backend API.

```
┌──────────────────────────────────┐
│          Full Dataset            │
│  ┌────────────────┐              │
│  │   Viewport     │  Only this   │
│  │   (visible)    │  region is   │
│  │                │  loaded via  │
│  │  ● ● ●  ●     │  API call    │
│  │    ●   ●  ●    │              │
│  └────────────────┘              │
│         ●    ●         ●         │
│    ●        ●    ●               │
└──────────────────────────────────┘
API: /api/<x-min>/<y-min>/<x-max>/<y-max>
```

**Loading flow:**

1. The component renders with an initial viewport.
2. On pan/zoom, the new bounding box coordinates are computed.
3. A request is sent to the R-tree API with the bounding box: `<x-min>/<y-min>/<x-max>/<y-max>`.
4. The API returns only the data points within that region.
5. The scatter plot updates with the new data.

## Properties

### Top-Level Properties

| Property   | Type     | Required | Description                                        |
|------------|----------|----------|----------------------------------------------------|
| `type`     | string   | Yes      | Must be `"ScatterL"`.                              |
| `id`       | string   | Yes      | Unique identifier for the component.               |
| `row`      | int      | Yes      | Grid row position for layout.                      |
| `col`      | int      | Yes      | Grid column position for layout.                   |
| `rowspan`  | int      | No       | Number of rows the component spans.                |
| `config`   | object   | Yes      | Configuration object (see below).                  |

### Config Properties

| Property       | Type     | Required | Description                                                    |
|----------------|----------|----------|----------------------------------------------------------------|
| `merge`        | boolean  | No       | Whether to merge data from multiple API responses.             |
| `startup_msg`  | string   | No       | Message displayed while the component initializes.             |
| `size`         | object   | No       | Dimensions of the component (see Size below).                  |
| `colourby`     | string   | No       | Property name used to colour the data points.                  |
| `exclusion`    | array    | No       | List of property names to exclude from display.                |
| `api`          | object   | Yes      | API endpoints for data fetching (see API below).               |
| `mapping`      | object   | Yes      | Data mapping configuration (see Mapping below).                |

### Size Properties

| Property    | Type   | Description                                       |
|-------------|--------|---------------------------------------------------|
| `width`     | int    | Width of the component in pixels.                 |
| `height`    | int    | Height of the component in pixels.                |
| `dotsize`   | object | Controls dot rendering size.                      |
| `dotFactor` | int    | Multiplier applied to dot size.                   |
| `min`       | int    | Minimum dot size in pixels.                       |
| `max`       | int    | Maximum dot size in pixels.                       |

### API Properties

| Property         | Type   | Description                                                         |
|------------------|--------|---------------------------------------------------------------------|
| `api.metadata`   | object | Metadata endpoint configuration.                                    |
| `metadata.href`  | string | URL of the metadata API.                                            |
| `metadata.val`   | string | Variable name used to reference the metadata.                       |
| `api.gene`       | object | Gene expression endpoint configuration.                             |
| `gene.href`      | string | URL of the gene API.                                                |
| `gene.val`       | string | Variable name used to reference the gene data.                      |
| `gene.dep`       | string | Dependent property that triggers gene data loading.                 |

### Mapping Properties

| Property        | Type   | Description                                                                |
|-----------------|--------|----------------------------------------------------------------------------|
| `mapping.api`   | object | Maps display labels to R-tree API endpoint names.                          |
| `mapping.axis`  | object | Maps axis identifiers to data property names.                              |
| `axis.x`        | string | Data property name mapped to the x-axis (e.g., `"X_Coord"`).             |
| `axis.y`        | string | Data property name mapped to the y-axis (e.g., `"Y_Coord"`).             |
| `axis.extra`    | object | Additional data properties to include (key-value pairs of label to name). |

## API Requirements

ScatterL expects a backend API that serves data using R-tree spatial indexing. The API must accept bounding box coordinates in the URL path:

```
<base-url>/<endpoint>/<x-min>/<y-min>/<x-max>/<y-max>
```

**Response format:** The API should return a JSON object containing arrays for each mapped property. For example:

```json
{
  "X_Coord": [1.2, 3.4, 5.6],
  "Y_Coord": [7.8, 9.0, 1.1],
  "Cell_Type": ["TypeA", "TypeB", "TypeA"],
  "Gene": [0.5, 1.2, 0.8]
}
```

The `mapping.api` object maps user-facing labels to specific R-tree endpoints. Each endpoint returns data for a particular subset or iteration of the dataset.

## Example

```json
{
  "id": "scatter_large",
  "type": "ScatterL",
  "row": 1,
  "col": 1,
  "rowspan": 3,
  "config": {
    "merge": false,
    "startup_msg": "Loading scatter plot...",
    "size": {
      "width": 800,
      "height": 600,
      "dotsize": { "min": 2, "max": 10 },
      "dotFactor": 1
    },
    "colourby": "Cell_Type",
    "exclusion": ["Cell_ID"],
    "api": {
      "metadata": {
        "href": "https://your-api.example.com/metadata",
        "val": "scatter_meta"
      },
      "gene": {
        "href": "https://your-api.example.com/gene",
        "val": "scatter_gene",
        "dep": "Gene"
      }
    },
    "mapping": {
      "api": {
        "ENS (S)": "ens_iter_2",
        "IM (S)": "im_iter_2",
        "MES (S)": "mes_iter_2"
      },
      "axis": {
        "x": "X_Coord",
        "y": "Y_Coord",
        "extra": {
          "Stage": "Stage",
          "MT": "MT",
          "Gene": "Gene",
          "Cell_Type": "Cell_Type",
          "Cell_ID": "Cell_ID"
        }
      }
    }
  }
}
```

## See Also

- [MmTrBC Showcase](https://visualify.pharmacy.arizona.edu/MmTrBC/) -- live example using ScatterL with R-tree spatial indexing
- [Visium Component](/components/visium.md) -- spatial transcriptomics visualization with image overlay
- [Plotly Component](/components/plotly.md) -- general-purpose Plotly charts in page mode
