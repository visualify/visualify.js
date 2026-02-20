# Charts

Visualify's charting engine is built on `React` and `ECharts` to simplify complex chart configuration. You only need to provide **data** and minimal **options** to generate interactive charts.

## Quick Start

The easiest way to create charts is using ` ```visualify ` code blocks in your Docsify markdown:

<pre lang="markdown">
```visualify
{
    "type": "bar",
    "title": "My Chart",
    "data": {
        "categories": ["A", "B", "C"],
        "series": [{ "name": "Data", "data": [10, 20, 30] }]
    }
}
```
</pre>

See the [Docsify Plugin](/docsify-plugin.md) documentation for full setup instructions.

## Example: Bar Chart

```visualify
{
    "type": "bar",
    "title": "The Popular Web Frameworks Before 2017",
    "subtitle": "GitHub New Star Number",
    "data": {
        "categories": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        "series": [
            {
                "name": "Vue",
                "data": [3000, 3500, 3900, 3100, 3200, 3100, 3600, 3300, 3600, 3400, 3100, 3000]
            },
            {
                "name": "React",
                "data": [4000, 4500, 4900, 4300, 4400, 4300, 4800, 4500, 4800, 4600, 4300, 4000]
            },
            {
                "name": "Angular",
                "data": [827, 949, 1400, 1000, 884, 911, 983, 989, 925, 1100, 1200, 930]
            }
        ]
    }
}
```

## Data Formats

### Structured Format (Recommended)

The structured format separates categories and series explicitly:

```json
{
    "type": "line",
    "data": {
        "categories": ["Jan", "Feb", "Mar"],
        "series": [
            { "name": "Sales", "data": [100, 200, 150] },
            { "name": "Costs", "data": [80, 120, 90] }
        ]
    }
}
```

### Flat Object Format

The flat format uses keys as series names (legacy, still supported):

```json
{
    "type": "line",
    "data": {
        "Sales": [100, 200, 150],
        "Costs": [80, 120, 90]
    },
    "xAxis": ["Jan", "Feb", "Mar"]
}
```

## Hybrid Types & Smooth

Support hybrid types such as `line`, `bar`, `scatter` by setting `type` as an array:

```visualify
{
    "type": ["line", "bar"],
    "title": "Hybrid Chart: Line + Bar",
    "smooth": [true, false],
    "data": {
        "categories": ["Jan", "Feb", "Mar", "Apr", "May"],
        "series": [
            { "name": "Revenue", "data": [3000, 3500, 3900, 3100, 3200], "smooth": true },
            { "name": "Orders", "data": [200, 250, 280, 220, 240] }
        ]
    }
}
```

More options can be found in the [Attributes](/rechart-attributes.md).

## Overrides Configuration

The preset configuration can be overridden to match the original ECharts configuration. For example, setting `smooth` on specific series:

```visualify
{
    "type": "bar",
    "title": "The Popular Web Frameworks Before 2017",
    "data": {
        "categories": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        "series": [
            { "name": "Vue", "data": [3000, 3500, 3900, 3100, 3200, 3100, 3600, 3300, 3600, 3400, 3100, 3000] },
            { "name": "React", "data": [4000, 4500, 4900, 4300, 4400, 4300, 4800, 4500, 4800, 4600, 4300, 4000] },
            { "name": "Angular", "data": [827, 949, 1400, 1000, 884, 911, 983, 989, 925, 1100, 1200, 930] }
        ]
    },
    "overrides": {
        "series": [{ "type": "line", "smooth": true }]
    }
}
```

More advanced usage can be found in the [ECharts documentation](https://echarts.apache.org/en/index.html).

## Programmatic API

For advanced use cases, you can create charts programmatically using JavaScript:

```html
<head>
  <script src="https://unpkg.com/visualify@latest/dist/visualify.js"></script>
</head>
```

Initialize and mount:

```javascript
// Initialize Visualify in charts mode
window.$visualify = { mode: 'charts' };

// Create and mount a chart
const chart = new $visualify.Recharts({
    title: 'My Chart',
    type: 'bar',
    data: {
        'Series A': [10, 20, 30],
        'Series B': [15, 25, 35],
    },
    xAxis: ['Jan', 'Feb', 'Mar'],
}).mount('#my-chart');
```

```html
<div id="my-chart"></div>
```
