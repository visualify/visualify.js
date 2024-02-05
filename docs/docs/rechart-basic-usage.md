<script defers>
let ex1 = {
                title: 'The Popular Web frameworks Before 2017',
                subtitle: 'GitHub New Star Number',
                type: 'bar',
                data: {
                    'Vue': [3000, 3500, 3900, 3100, 3200, 3100, 3600, 3300, 3600, 3400, 3100, 3000],
                    'React': [4000, 4500, 4900, 4300, 4400, 4300, 4800, 4500, 4800, 4600, 4300, 4000],
                    'Angular': [827, 949, 1400, 1000, 884, 911, 983, 989, 925, 1100, 1200, 930, ],
                },
                xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            };
const app = new $visualify.Recharts(ex1).mount('#example1');
let ex2 = structuredClone(ex1);
ex2.overrides= {
                series: [{
                        type: 'line',
                        smooth: true
                    }, ]
                };
const app2 = new $visualify.Recharts(ex2).mount('#example2');
</script>

# Visualify.Recharts

`Visualify.Recharts` is a component library built on `React` and `ECharts` to solve
the hassle of complex ECharts configuration items and data conversion. When
generating an ECharts chart, users only need to care about **data** and
**configuration items**, or even no configuration items, to generate a default
chart. `ReCharts` helps you build charts **quickly** and **efficiently**.

## Quick Start

<details open>

<summary>Recharts stands for React-Echarts, in order to use Recharts, you can follow
these steps.</summary>

Insert the `visualify` script in your `index.html` file.

```html
<head>
  ...
  <script src="https://visualify.pharmacy.arizona.edu/dist/visualify.js"></script>
</head>
```

Initilaize the `visualify` object in your `index.html` file.

```html
$visualify = {
    mode: 'charts',
}
```

Use the `Recharts` object in your `index.html` file.

```html
<div id="example1"></div>
<script>
new $visualify.Recharts( config... ).mount('#example1');
</script>
```

</details>

## Example of Recharts

<!-- tabs:start -->

#### **Output**

<div id="example1">Here is the example of bar chart by using Recharts to show 2017 top popular frames. </div>

#### **HTML**

<pre data-lang="html">
<code class="lang-html">
&lt;div id=&quot;example1&quot;&gt;Example 1&lt;/div&gt;
const app = new $visualify.Recharts({
                title: 'The Popular Web frameworks Before 2017',
                subtitle: 'GitHub New Star Number',
                type: 'bar',
                data: {
                    'Vue': [3000, 3500, 3900, 3100, 3200, 3100, 3600, 3300, 3600, 3400, 3100, 3000],
                    'React': [4000, 4500, 4900, 4300, 4400, 4300, 4800, 4500, 4800, 4600, 4300, 4000],
                    'Angular': [827, 949, 1400, 1000, 884, 911, 983, 989, 925, 1100, 1200, 930, ],
                },
                xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            });
app.mount('#example1');
</code>
</pre>

<!-- tabs:end -->

## Advanced Usage

### Hybird Types & Smooth & More options

'Rechart' support hybird types such as `line` , `bar` , `scatter` , and more
types by setting `type` as array of types, also for the `smooth`.

```html
{
  ...
  type: ['line', 'bar']
  smooth: [true, false]
}
```

More options can be found in the [Attributes](rechart-attributes).

### Overrides Configuration

The **preset** configuration in `Recharts` can be overridden to match the
original `Echarts` configuration. For example, we can set `smooth` to `true` in
`series`.

```html
{
  ...
  overrides: {
        series: [{
        type: 'line',
        smooth: true
    }, ]
  },
}
```

More advanced usage can be found in the
[Echarts documentation](https://echarts.apache.org/en/index.html).

<!-- tabs:start -->

#### **Output**

<div id="example2">Example 2</div>

#### **HTML**

<pre data-lang="html">
    <code class="lang-html">
        const app = new $visualify.Recharts({
                        ...
                        overrides: {
                            series: [{
                                type: 'line',
                                smooth: true
                            }, ]
                        },
                    }).mount('#example1');
    </code>
     <button class="docsify-copy-code-button">
        <span class="label">Copy to clipboard</span>
        <span class="error">Error</span>
        <span class="success">Copied</span>
    </button>
</pre>

<!-- tabs:end -->
