# Echart Component

The Echart component is a wrapper around the
[Apache ECharts](https://echarts.apache.org/en/index.html) library. It is used
to create a variety of visualizations including scatter plots, line charts, bar
charts, and more.

This Echart Component is same as the Rechart Component, but it is used for the
page mode, which enable the user to create a page with multiple components. And
it also **support the API to fetch the data**.

## Properties

The Echart component has the following properties:

-   `type` (string): The type of the component, in this case `Echart`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `rowspan` (int): The number of rows the component is to span.
-   `colspan` (int): The number of columns the component is to span.
-   `config` (object): The configuration of the component.
-   `parser` (object): The parser of the component.
-   `trigger` (object): The trigger of the component.

### config Properties

The `config` object has the following properties:

-   `width` (int): The width of the component.
-   `height` (int): The height of the component.
-   `preset` (string): The preset of the component.
-   `title` (string): The title of the component.
-   `xAxis` (string): The x-axis of the component.
-   `yAxis` (string): The y-axis of the component.
-   `legend` (string): The legend of the component.
-   `tooltip` (string): The tooltip of the component.
-   `data` (string): The data of the component.

### parser Properties

The `parser` object has the following properties:

-   `sources` (array): The sources of the component.
    -   `name` (string): The name of the trigger.
    -   `url` (string): The URL of the data.
    -   `type` (string): The type of the component.
    -   `responseKey` (string): The response key of the component.
    -   `trigger` (object): The trigger of the component.
        -   `title` (boolean): set the title to the triiger value.

### Example

```json
        {
            "id": "mmtrbc_tsne",
            "type": "Echart",
            "col": 2,
            "rowspan": 3,
            "config": {
                "width": 600,
                "height": 600,
                "preset": "mmtrbc",
                "title": " "
            },
            "parser": {
                "sources": [{
                    "name": "metadata",
                    "url": "<your-backend-url>"
                }, {
                    "name": "gene",
                    "url": "<your-backend-url>",
                    "responseKey": "gene",
                    "trigger": {
                        "name": "mmtrbc_gene",
                        "title": true
                    }
                }],
                "type": "scatter"
            }
        }
```
