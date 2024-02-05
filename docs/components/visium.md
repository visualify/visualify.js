# Visium Component

The Visium component is used to display the Visium data on the page.

## Properties

The Visium component has the following properties:

-   `type` (string): The type of the component, in this case `Visium`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `rowspan` (int): The number of rows the component is to span.
-   `startup_msg` (string): The startup message of the component.
-   `meta` (string): The metadata API of the component.
-   `simpleload` (boolean): Whether to load the data simply or not.
-   `metaval` (string): The metadata variable name we want to use.
-   `gene` (string): The gene API.
-   `geneval` (string): The gene variable name we want to use.
-   `image` (string): The image API.
-   `cellval` (string): The celltype variable name we want to use.
-   `axis_mapping` (object): The axis mapping of the component.
    -   `x: X_Coord` (string): Maps the X_Coord to the x-axis.
    -   `y: Y_Coord` (string): Maps the Y_Coord to the y-axis.
    -   `extra` (object): The extra properties.
        -   Example:
            -   `BC : BC` (string): Maps the BC to the BC property.
            -   `SB-1 : SB-1` (string): Maps the SB-1 to the SB-1 property.


### Example

```json
        {
            "id": "visium_scatter2d",
            "type": "Visium",
            "row": 1,
            "col": 2,
            "rowspan": 3,
            "startup_msg": "Section",
            "meta": "<your-api-for-metadata>",
            "simpleload": false,
            "metaval": "visium_section",
            "gene": "<your-api-for-gene-data>",
            "geneval": "visium_gene",
            "image": "<your-api-for-image>",
            "cellval": "visium_celltype",
            "axis_mapping": {
                "x": "X_Coord",
                "y": "Y_Coord",
                "extra": {
                    "BC": "BC",
                    "SB-1": "SB-1",
                }
            }
        }
```