# HTML Component

The HTML component renders raw HTML content within a page mode layout. Use it for custom content like images, iframes, embedded widgets, or any HTML that doesn't fit into other component types.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Must be `"HTML"`. |
| `id` | string | No | Unique identifier for the component. |
| `row` | int | Yes | The row in which the component is displayed. |
| `col` | int | Yes | The column in which the component is displayed. |
| `colspan` | int | No | The number of columns the component spans. |
| `html` | string | Yes | The HTML content to render. |

## Examples

### Displaying an Image

```json
{
    "type": "HTML",
    "row": 1,
    "col": 2,
    "colspan": 3,
    "html": "<img style='width: 100%' src='./mainpage.png' alt='Abstract'>"
}
```

### Embedding an Iframe

```json
{
    "type": "HTML",
    "row": 2,
    "col": 1,
    "colspan": 4,
    "html": "<iframe src='https://example.com/embed' style='width: 100%; height: 400px; border: none;'></iframe>"
}
```

### Styled Content Block

```json
{
    "type": "HTML",
    "id": "welcome-banner",
    "row": 1,
    "col": 1,
    "colspan": 4,
    "html": "<div style='padding: 20px; background: #f0f4f8; border-radius: 8px;'><h2>Welcome</h2><p>This dashboard displays gene expression data.</p></div>"
}
```

## Future Work

The following properties are planned for future releases:

- `script` (string) -- Inline JavaScript to execute within the component context.
- `style` (string) -- CSS styles to apply to the component container.
- Support for fetching HTML content from an external API endpoint.
