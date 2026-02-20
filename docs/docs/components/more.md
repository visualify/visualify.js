# Utility Components

These components provide UI controls and interactive elements for page mode layouts. They work alongside visualization components to create complete data exploration interfaces.

## Overview

| Component | Purpose | Interactive |
|-----------|---------|-------------|
| SearchBar | Gene/item search with autocomplete | Yes - triggers other components |
| List | Display and manage a list of items | Yes - add/remove/clear |
| RatioBox | Radio button selector for options | Yes - stores selection globally |

---

## SearchBar

The SearchBar component provides a search input with autocomplete, powered by an external data source. When a user selects a result, the value can be saved to the global data store for use by other components.

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Must be `"SearchBar"`. |
| `id` | string | Yes | Unique identifier for the component. |
| `row` | int | No | The row in which the component is displayed. |
| `col` | int | No | The column in which the component is displayed. |
| `title` | string | No | Label displayed above the search input. |
| `config` | object | Yes | Configuration for data source and behavior. See below. |
| `style` | object | No | CSS styles applied to the component container. |

#### Config Properties

| Property | Type | Description |
|----------|------|-------------|
| `save` | boolean / string | If `true`, saves the selected value to global data using the component `id` as the key. If a string, uses that string as the global data key instead. |
| `source` | object | Defines the autocomplete data source. |
| `source.name` | string | Name identifier for the data source. |
| `source.url` | string | API endpoint that returns the list of searchable items. |
| `source.responseKey` | string | Key in the API response that contains the list of items. |

### Example

```json
{
    "id": "mmtrbc_gene",
    "type": "SearchBar",
    "title": "Search Gene",
    "config": {
        "save": true,
        "source": {
            "name": "genelist",
            "url": "https://visualify.pharmacy.arizona.edu/api/mmtrbc/genelist",
            "responseKey": "gene"
        }
    }
}
```

### Interaction with Other Components

When `save` is enabled, the selected search result is stored in the global data store. Other components (such as charts or tables) can reference this value to filter or update their displayed data. For example, a SearchBar with `id: "mmtrbc_gene"` makes the selected gene available to any component that reads from the `mmtrbc_gene` global key.

---

## List

The List component displays a managed list of items. Users can add items (typically from a SearchBar), remove individual items, or clear the entire list. It is commonly used to build a working set of genes or other entities for downstream analysis.

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Must be `"List"`. |
| `id` | string | Yes | Unique identifier for the component. |
| `row` | int | No | The row in which the component is displayed. |
| `col` | int | No | The column in which the component is displayed. |
| `rowspan` | int | No | The number of rows the component spans. |
| `title` | string | No | Label displayed above the list. |
| `btn` | object | No | Configuration for action buttons (add, remove, clear). See below. |
| `style` | object | No | CSS styles applied to the component container. |

#### Button Properties

Each button (`add`, `remove`, `clear`) accepts the following:

| Property | Type | Description |
|----------|------|-------------|
| `text` | string | Label displayed on the button. |
| `show` | boolean | Whether the button is visible. |
| `style` | object | CSS styles for the button. |
| `msg` | string | Confirmation or success message (used by `clear`). |
| `addfrom` | string | ID of the SearchBar component to pull values from (used by `add`). |

### Example

```json
{
    "id": "genelist",
    "type": "List",
    "row": 2,
    "col": 1,
    "rowspan": 3,
    "btn": {
        "add": {
            "text": "Add",
            "show": true,
            "style": {
                "color": "white",
                "backgroundColor": "#FF8E8E",
                "fontSize": "12px",
                "border": "none",
                "cursor": "pointer"
            },
            "addfrom": "mmtrbc_gene"
        },
        "clear": {
            "text": "Clear",
            "show": true,
            "msg": "Successfully cleared the list",
            "style": {}
        },
        "remove": {
            "show": true,
            "style": {
                "color": "white",
                "backgroundColor": "#f44336"
            }
        }
    }
}
```

### Interaction with Other Components

The List component connects to a SearchBar through the `addfrom` property on the `add` button. In the example above, `"addfrom": "mmtrbc_gene"` pulls the currently selected value from the SearchBar with `id: "mmtrbc_gene"`. The list contents can then be consumed by visualization components that need a set of items to display.

---

## RatioBox

The RatioBox component renders a group of radio buttons, allowing the user to select one option from a predefined set. The selected value is stored in the global data store so that other components can react to the user's choice.

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Must be `"RatioBox"`. |
| `id` | string | Yes | Unique identifier for the component. |
| `row` | int | No | The row in which the component is displayed. |
| `col` | int | No | The column in which the component is displayed. |
| `title` | string | No | Label displayed above the radio buttons. |
| `choice` | array | Yes | Array of strings representing the available options. |
| `val` | string | Yes | Name of the global variable where the selected choice is stored. |
| `style` | object | No | CSS styles applied to the component container. |

### Example

```json
{
    "type": "RatioBox",
    "id": "chrom_colour",
    "row": 2,
    "col": 1,
    "choice": ["Cell Type", "Stage"],
    "style": {
        "width": "350px"
    },
    "val": "chrom_colour",
    "title": "Colour by"
}
```

### Interaction with Other Components

The selected option is saved to the global variable specified by `val`. In the example above, choosing "Cell Type" or "Stage" updates the `chrom_colour` global variable. Visualization components (such as scatter plots or UMAP charts) can reference this variable to change their color mapping dynamically.

---

## See Also

- [HTML Component](components/html.md) -- Render raw HTML content in page layouts.
- [Markdown Component](components/markdown.md) -- Render Markdown content in page layouts.
- [Page Mode Overview](bindData/bindPage.md) -- How components are arranged in page layouts.
