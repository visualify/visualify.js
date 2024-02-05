# Plotly Component

The Plotly component is used to display a plotly plot on the page.

## Properties

The Plotly component has the following properties:

-   `type` (string): The type of the component, in this case `Plotly`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `rowspan` (int): The number of rows the component is to span.
-   `colspan` (int): The number of columns the component is to span.
-   `settings` (object): The settings of the component.
-   `parser` (object): The parser of the component.
-   `trigger` (object): The trigger of the component.

### settings Properties

The `settings` object has the following properties:

-   `preset` (string): The preset of the component.
-   `ignoreEmptyData` (boolean): Whether to ignore empty data or not.

### parser Properties

The `parser` object has the following properties:

-   `sources` (array): The sources of the component.
    -   `name` (string): The name of the trigger.
    -   `url` (string): The URL of the data.
    -   `responseKey` (string): The response key of the component.
-   `exclude` (array): The data to be excluded.
-   `type` (string): The type of the component.

### Example

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
                "sources": [{
                    "name": "metadata",
                    "url": "<your-backend-url>"
                }, {
                    "name": "gene",
                    "url": "<your-backend-url>",
                    "responseKey": "gene"
                }],
                "exclude": ["BC-Mes", "BC-NE", "BC-Im"],
                "type": "scatter"
            }
        }
```
