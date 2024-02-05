# Recharts Attributes

`Rechart` is primarily composed of 4 attribute groups:

-   **Basic** configuration
-   **Data** configuration
-   **Plugins** configuration
-   **Override** configuration.

## Basic Configuration

The basic configuration includes:

| Attribute       | Type         | Description             | Choice                     | Default |
| --------------- | ------------ | ----------------------- | -------------------------- | ------- |
| title           | string       | The main title          | User-defined title         | -       |
| subtitle        | string       | A secondary title       | User-defined subtitle      | -       |
| width           | string       | The width dimension     | Any valid CSS width value  | -       |
| height          | string       | The height dimension    | Any valid CSS height value | 400px   |
| legend          | bool         | show or hide legend     | True, False                | true    |
| xAxis           | string/false | The xAxis               | User-defined xAxis         | {}      |
| yAxis           | string/false | The yAxis               | User-defined yAxis         | {}      |
| tooltip         | object       | The tooltip             | User-defined tooltip       | {}      |
| xAxisLineshow   | bool         | show or hide xAxisLines | True, False                | true    |
| yAxisLineshow   | bool         | show or hide yAxisLines | True, False                | true    |
| xAxisLabelShow  | bool         | show or hide xAxisLabel | True, False                | true    |
| yAxisLabelShow  | bool         | show or hide yAxisLabel | True, False                | true    |
| xAxisLabelColor | string       | The xAxisLabelColor     | Any valid CSS color value  | -       |
| yAxisLabelColor | string       | The yAxisLabelColor     | Any valid CSS color value  | -       |

## Data Configuration

The data configuration includes:

| Attribute | Type         | Description        | Choice                                                                                    | Default   |
| --------- | ------------ | ------------------ | ----------------------------------------------------------------------------------------- | --------- |
| data      | string       | The data           | User-defined data                                                                         | {}        |
| type      | string/array | The type           | 'line', 'bar'                                                                             | undefined |
| smooth    | bool/array   | The smooth         | True, False, [true, false]                                                                | false     |
| areaStyle | object       | The area style     | {},[{color: 'red'},{color: 'blue'}]                                                       | {}        |
| stack     | string/array | The stack          | {}, ['Vue', 'React', 'Angular'],{lang: ['Vue', 'React', 'Angular']}                       | -         |
| markArea  | object/array | The mark area      | {XAxis: [{start: '...', end:'...', name: "..."}, ... ], YAxis: ..., props: ..}, [{}, ...] | -         |
| markLine  | object/array | The mark line      | {data: { name: 'average', type: 'average'}, props: .. }, [{ data: {}, props: ..}, ...]    | -         |
| peak      | bool/string  | name of the peak   | True, False, user-defined name of the peak                                                | false     |
| valley    | bool/string  | name of the valley | True, False, user-defined name of the valley                                              | false     |

### Specific Data Configuration for Line Charts

| Attribute  | Type              | Description                 | Choice                                                            | Default |
| ---------- | ----------------- | --------------------------- | ----------------------------------------------------------------- | ------- |
| smooth     | bool/array        | The smooth                  | True, False, [true, false]                                        | false   |
| areaStyle  | object            | The area style              | {},[{color: 'red'},{color: 'blue'}]                               | {}      |
| stack      | string/array      | The stack                   | {}, ['x', 'y'],{lang: ['x', 'y', 'z']}                            | -       |
| percentage | bool              | The percentage stacked mode | True, False                                                       | false   |
| steps      | bool/string/array | The steps                   | True, False, 'start', 'middle', 'end', ['start', 'middle', 'end'] | false   |

### Specific Data Configuration for Bar Charts

| Attribute  | Type | Description                 | Choice      | Default |
| ---------- | ---- | --------------------------- | ----------- | ------- |
| percentage | bool | The percentage stacked mode | True, False | false   |

## Plugins Configuration

The plgins configuration includes:

| Attribute | Type   | Description | Choice               | Default |
| --------- | ------ | ----------- | -------------------- | ------- |
| plugins   | string | The plugins | User-defined plugins | -       |

## Override Configuration

configuration to override the encapsulated preset configurations in order to
achieve custom effects.
