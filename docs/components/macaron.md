# Macaron Component

The Macaron component is used to display a macaron plot for relation of nodes on
the page.

The Macaron component also has interactive features, such as the ability to drag
and drop nodes, and the ability to select nodes.

## Properties

The Macaron component has the following properties:

-   `type` (string): The type of the component, in this case `Macaron`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `config` (object): The configuration of the component.
-   `data` (object): The data of the component.

### config Properties

The `config` object has the following properties:

-   `animation` (boolean): Whether to animate the component or not.
-   `draggable` (boolean): Whether to make the component draggable or not.
-   `height` (int): The height of the component.
-   `unclickable` (array): The nodes that are unclickable.
-   `symbolSize` (string): The size of the symbols in the component.
-   `color` (object): The color of the component.
    -   `selected` (string): The color of the selected nodes.
    -   `unselectable` (string): The color of the unselectable nodes.

### data Properties

The `data` object has the following properties:

-   `nodes` (array): The nodes of the component.
    -   `name` (string): The name of the node.
    -   `category` (int): The category of the node.
    -   `value` (int): The value of the node.
-   `edges` (array): The edges of the component.
-   `categories` (array): The categories of the component.

### Example

```json
{
            "id": "celltype",
            "type": "Macaron",
            "title": "Select Cell Type",
            "style": {
                "height": "350px",
                "width": "350px",
                "font": "Arial, sans-serif",
                "border": ""
            },
            "data": {
                "nodes": [{
                        "name": "Esophagus",
                        "category": 1,
                        "value": 216229
                    },
                    {
                        "name": "Epithelium",
                        "category": 2,
                        "value": 108800
                    },
                    {
                        "name": "Stroma",
                        "category": 2,
                        "value": 107429
                    },
                    {
                        "name": "EPI (E)",
                        "category": 3,
                        "value": 97799
                    },
                    {
                        "name": "ST (E)",
                        "category": 3,
                        "value": 1760
                    }
                ],
                "edges": [{
                        "source": "Esophagus",
                        "target": "Epithelium",
                        "level": 1
                    },
                    {
                        "source": "Esophagus",
                        "target": "Stroma",
                        "level": 1
                    },
                    {
                        "source": "Epithelium",
                        "target": "IM (E)",
                        "level": 2
                    },
                    {
                        "source": "Epithelium",
                        "target": "ERY (E)",
                        "level": 2
                    },
                    {
                        "source": "Stroma",
                        "target": "MES (S)",
                        "level": 2
                    },
                    {
                        "source": "Stroma",
                        "target": "ENS (S)",
                        "level": 2
                    },
                    {
                        "source": "Stroma",
                        "target": "ENDO (S)",
                        "level": 2
                    }
                ],
                "categories": [{
                        "name": "Category 1"
                    },
                    {
                        "name": "Category 2"
                    },
                    {
                        "name": "Category 3"
                    }
                ]
            },
            "config": {
                "animation": false,
                "draggable": true,
                "height": "88%",
                "unclickable": ["EPI (S)", "Esophagus"],
                "symbolSize": "value",
                "color": {
                    "selected": "skyblue",
                    "unselectable": "black"
                }
            },
            "row": 1,
            "col": 1
        }
```
