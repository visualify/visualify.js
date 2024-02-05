# ScatterL Components

The ScatterL component is a scatter plot that is used to visualize the data in
2D. It is a part of the Plotly library and is used to visualize the data in 2D.
The ScatterL component is used to visualize the data in 2D.

The ScatterL component is designed for a specified data Format, like R-tree, to
visualize a large data set in 2D.

## Requirements

The ScatterL component requires the specified API to fetch the data. Currently,
the ScatterL component supports the API for fetching the data - in the format of
JSON, - and it need API to consist as
`your-backend-server-url/xxx/<x-min>/<y-min>/<x-max>/<y-max>`

We will provide an example of the backend to show you how to implement our
customized Rtree API.

## Properties

The ScatterL component has the following properties:

-   `type` (string): The type of the component, in this case `ScatterL`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `rowspan` (int): The number of rows the component is to span.
-   `config` (object): The configuration of the component.

### config Properties

The `config` object has the following properties:

-   `merge` (boolean): Whether to merge the data or not.
-   `startup_msg` (string): The message to be displayed when the component is
    started.
-   `size` (object): The size of the component.
    -   `width` (int): The width of the component.
    -   `height` (int): The height of the component.
    -   `dotsize` (object): The size of the dots in the scatter plot.
    -   `dotFactor` (int): The factor by which the dot size is to be multiplied.
        -   `min` (int): The minimum size of the dot.
        -   `max` (int): The maximum size of the dot.
    -   `colourby` (string): The property by which the dots are to be coloured.
    -   `exclusion` (array): The properties to be excluded.
    -   `api` (object): The API to be used to fetch the data.
        -   `metadata` (object): The metadata API.
            -   `href` (string): The URL of the metadata API.
            -   `val` (string): The value of the metadata API.
        -   `gene` (object): The gene API.
            -   `href` (string): The URL of the gene API.
            -   `val` (string): The value of the gene API.
            -   `dep` (string): The dependent property of the gene API.
    -   `mapping` (object): The mapping of the data.
        -   `api` (object): The API to be used for mapping.
            -   Example:
                -   `ENS (S): 'ens_iter_2'` (string): Maps ENS (S) to endo_iter_2 API.
                -   `IM (S): 'im_iter_2'` (string): Maps IM (S) to im_iter_2 API.
                -   `MES (S): 'mes_iter_2'` (string): Maps MES (S) to mes_iter_2 API.
        -   `axis` (object): The axis to be used for mapping.
            -   `x: X_Coord` (string):  Maps x-axis to specified value name.
            -   `y: Y_Coord` (string): Maps y-axis to specified value name.
            -   `extra` (object): The extra properties.
                -   Example:
                    -   `Stage : Stage` (string): Mapes the Stage to the stage property.
                    -   `MT : MT` (string): Maps the MT to the MT property.
                    -   `Gene : Gene` (string): Maps the Gene to the gene property.
                    -   `Cell_Type : Cell_Type` (string): Maps the Cell_Type to the cell type property.
                    -   `Cell_ID : Cell_ID` (string): Maps the Cell_ID to the cell ID property.
