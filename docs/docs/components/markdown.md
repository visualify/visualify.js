# Markdown Component

The Markdown component renders Markdown content within a page mode layout. Use it for text-heavy content like descriptions, documentation, or README-style content alongside visualizations.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Must be `"Markdown"`. |
| `id` | string | No | Unique identifier for the component. |
| `row` | int | Yes | The row in which the component is displayed. |
| `col` | int | Yes | The column in which the component is displayed. |
| `content` | string | No | Inline Markdown string to render. Use this for short content. |
| `src` | string | No | Path or URL to a Markdown file to load and render. Use this for longer content. |

> **Note:** Provide either `content` or `src`, not both. If both are specified, `content` takes precedence.

## Example

### Inline Content

```json
{
    "type": "Markdown",
    "id": "description",
    "row": 1,
    "col": 1,
    "content": "## About This Dataset\n\nThis dataset contains gene expression profiles across **12 tissue types**.\n\n- Source: GEO Database\n- Samples: 240\n- Platform: RNA-seq"
}
```

### Loading from a File

```json
{
    "type": "Markdown",
    "id": "readme",
    "row": 1,
    "col": 1,
    "src": "./data/description.md"
}
```
