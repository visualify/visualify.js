# DotBio Component

The DotBio component is a dot plot that
displays the expression of genes in different cell types. 


## Properties

The DotBio component has the following properties:

-   `type` (string): The type of the component, in this case `DotBio`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `rowspan` (int): The number of rows the component is to span.
-   `colspan` (int): The number of columns the component is to span.
-   `settings` (object): The settings of the component.
-   `meta` (object): The metadata API of the component.
    -   `name` (string): The name of the metadata.
    -   `url` (string): The URL of the metadata.
-   `exclude_celltype` (array): The cell types to be excluded.
-   `gene` (string): The gene API.
-   `genelist` (string): The genelist variable name we want to use.

### settings Properties

The `settings` object has the following properties:

-   `preset` (string): The preset of the component.
-   `ignoreEmptyData` (boolean): Whether to ignore empty data or not.
-   `showscale` (boolean): Whether to show the scale or not.
-   `showlegend` (boolean): Whether to show the legend or not.
        

