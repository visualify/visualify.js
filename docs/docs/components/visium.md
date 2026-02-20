# Visium Component

The Visium component visualizes spatial transcriptomics data from the 10x Genomics Visium platform. It overlays gene expression data on tissue section images, allowing researchers to explore spatial patterns of gene expression. Each spot on the tissue is rendered as a colored dot, where the color represents either gene expression levels or cell type annotations.

> **Note:** Visium requires backend APIs for metadata, gene expression, and tissue images. It cannot be used as an inline docsify component. See [EsoDev](https://visualify.pharmacy.arizona.edu/EsoDev/) for a live example.

## How It Works

The Visium component combines three data sources to produce a spatial overlay visualization:

```
┌─────────────────────────────────────┐
│         Tissue Section Image         │
│                                      │
│    ●(red)  ●(blue)   ●(green)       │
│        ●(yellow)  ●(blue)            │
│    ●(green)     ●(red)   ●(blue)    │
│                                      │
│  Spots colored by gene expression    │
│  or cell type annotation             │
└─────────────────────────────────────┘

Data Sources:
  metadata API → cell annotations
  gene API     → expression values
  image API    → tissue image
```

**Rendering flow:**

1. The tissue section image is loaded from the image API and displayed as the background.
2. Cell metadata (annotations, barcodes, coordinates) is fetched from the metadata API.
3. Spots are plotted at their spatial coordinates on top of the tissue image.
4. When a gene is selected, expression values are fetched from the gene API and used to colour the spots.
5. Users can switch between colouring by cell type annotation or gene expression.

## Properties

| Property       | Type     | Required | Description                                                                 |
|----------------|----------|----------|-----------------------------------------------------------------------------|
| `type`         | string   | Yes      | Must be `"Visium"`.                                                         |
| `id`           | string   | Yes      | Unique identifier for the component.                                        |
| `row`          | int      | Yes      | Grid row position for layout.                                               |
| `col`          | int      | Yes      | Grid column position for layout.                                            |
| `rowspan`      | int      | No       | Number of rows the component spans.                                         |
| `startup_msg`  | string   | No       | Message displayed while the component initializes.                          |
| `meta`         | string   | Yes      | URL of the metadata API endpoint.                                           |
| `metaval`      | string   | Yes      | Variable name used to reference the metadata.                               |
| `gene`         | string   | Yes      | URL of the gene expression API endpoint.                                    |
| `geneval`      | string   | Yes      | Variable name used to reference the gene data.                              |
| `image`        | string   | Yes      | URL of the tissue section image API endpoint.                               |
| `cellval`      | string   | Yes      | Variable name used to reference cell type annotations.                      |
| `simpleload`   | boolean  | No       | When `true`, loads all data at once. When `false`, uses incremental loading.|
| `axis_mapping` | object   | Yes      | Maps data properties to axes and extra display fields (see below).          |

### Axis Mapping Properties

| Property          | Type   | Description                                                          |
|-------------------|--------|----------------------------------------------------------------------|
| `axis_mapping.x`  | string | Data property name mapped to the x-axis (e.g., `"X_Coord"`).       |
| `axis_mapping.y`  | string | Data property name mapped to the y-axis (e.g., `"Y_Coord"`).       |
| `axis_mapping.extra` | object | Additional data properties to display. Key-value pairs where the key is the display label and the value is the property name in the data. |

## Example

```json
{
  "id": "visium_scatter2d",
  "type": "Visium",
  "row": 1,
  "col": 2,
  "rowspan": 3,

  // Message shown during initial load
  "startup_msg": "Section",

  // Metadata API: provides cell annotations and coordinates
  "meta": "https://your-api.example.com/metadata",
  "metaval": "visium_section",

  // Gene expression API: provides per-spot expression values
  "gene": "https://your-api.example.com/gene",
  "geneval": "visium_gene",

  // Tissue image API: serves the H&E stained tissue image
  "image": "https://your-api.example.com/tissue-image",

  // Cell type variable name for annotation colouring
  "cellval": "visium_celltype",

  // Load data incrementally (false) or all at once (true)
  "simpleload": false,

  // Map data properties to axes and tooltip fields
  "axis_mapping": {
    "x": "X_Coord",
    "y": "Y_Coord",
    "extra": {
      "BC": "BC",
      "SB-1": "SB-1"
    }
  }
}
```

> **Note:** JSON does not support comments. The comments above are included for explanation only. Remove them in your actual configuration.

## See Also

- [EsoDev Showcase](https://visualify.pharmacy.arizona.edu/EsoDev/) -- live example using the Visium component
- [ScatterL Component](/components/scatterL.md) -- high-performance scatter plot with R-tree spatial indexing
- [DotBio Component](/components/dotBio.md) -- another biology-focused visualization component
