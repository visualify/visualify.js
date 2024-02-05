# More components

## Markdown

The Markdown component is used to render markdown content on the page.



## SearchBar

The SearchBar component is used to search for a specific gene.

### Properties

The SearchBar component has the following properties:

-   `type` (string): The type of the component, in this case `SearchBar`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `config` (object): The configuration of the component.
-   `style` (object): The style of the component.
-   `title` (string): The title of the component.

### config Properties

The `config` object has the following properties:

-   `save` (boolean/String): Whether to save the search or not.
    -   (string): The name to be saved at global data.
-   `source` (object): The source of the component.
    -   `name` (string): The name of the source.
    -   `url` (string): The URL of the source.
    -   `responseKey` (string): The response key of the source.

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

## List

The List component is used to display a list of genes.

### Properties

The List component has the following properties:

-   `type` (string): The type of the component, in this case `List`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `rowspan` (int): The number of rows the component is to span.
-   `btn` (object): The button of the component.
-   `style` (object): The style of the component.
-   `title` (string): The title of the component.

### example

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
                    "style": {
                    }
                },
                "remove": {
                    "show": true,
                    "style": {
                        "color": "white",
                        "backgroundColor": "#f44336",
                    }
                }
            }
        }
```

## RatioBox

The RatioBox component is used to display a ratio box on the page.

### Properties

The RatioBox component has the following properties:

-   `type` (string): The type of the component, in this case `RatioBox`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `choice` (array): The choice of the component.
-   `style` (object): The style of the component.
-   `val` (string): Will save the choices to the name of global variable.

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
