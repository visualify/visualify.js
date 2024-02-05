<script defers>

const Basic_Bar = {
    code: `const getOption = () => {
    return {
        type: 'bar',
        data: {
            'PV': [256, 767, 1356, 2087, 803, 582, 432],
        },
		xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
	}
};
return getOption;`
};

const Group_Bar = {
    code: `const getOption = () => {
    return {
        type: 'bar',
        data: {
            'PV': [256, 767, 1356, 2087, 803, 582, 432],
            'UV': [287, 707, 1756, 1822, 987, 432, 322],
        },
		xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
	}
};
return getOption;`
};

const Stacked_Bar = {
    code: `const getOption = () => {
    return {
        type: 'bar',
        data: {
            'PV': [256, 767, 1356, 2087, 803, 582, 432],
            'UV': [287, 707, 1756, 1822, 987, 432, 322],
        },
		xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        areaStyle: [{color: 'red'}, {color: 'blue'}],
        stack: [ 'PV', 'UV' ],
	}
};
return getOption;`
};


const Percentage_Stacked_Bar = {
    code: `const getOption = () => {
    return {
        type: 'bar',
        data: {
            'PV': [256, 767, 1356, 2087, 803, 582, 432],
            'UV': [287, 707, 1756, 1822, 987, 432, 322],
        },
		xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        percentage: true,
	}
};
return getOption;`
};

const Stacked_Horizontal_Bar = {
    code: `const getOption = () => {
    return {
        type: 'bar',
        data: {
            'PV': [256, 767, 1356, 2087, 803, 582, 432],
            'UV': [287, 707, 1756, 1822, 987, 432, 322].reverse(),
        },
		yAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        stack: [ 'PV', 'UV' ],
	}
};
return getOption;`
};

const waterfall = {
    code: `const getOption = () => {
    return {
        type: 'bar',
        data: {
            'Placeholder': [0, 1700, 1400, 1200, 300, 0],
            'Life Cost': [2900, 1200, 300, 200, 900, 300],
        },
        xAxis: ['Total', 'Rent', 'Utility', 'Transport', 'Meals', 'Other'],
        stack: 'total',
        waterfall: true,
    }
};
return getOption;`
};

const Basic_Area_bar = {
    code: `const getOption = () => {
    return {
        title: 'Daily Electricity Usage',
        type: 'bar',
        data: {
            'usage': [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400],
            'usage2': [125, 280, 223, 260, 270, 300, 550, 343, 400, 390, 553, 213, 400, 223, 123, 750, 321, 123, 542, 135],
        },
		xAxis: ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45'],
        markArea: [
            {
                'xAxis': [{start:'06:15', end:'08:45', name: "High Demanding Period"}],
                'yAxis': {start: 400, end: 600},
            },
            {
                'xAxis': [{start:'00:00', end:'02:30', name: "Low Demanding Period"}, {start:'05:00',end:'06:15'}],
                'data': [[{ name: 'avg to max', type: 'average'},{ type: 'max' }]],
            }
        ],
	}
};
return getOption;`};

const ex1 = new $visualify.LiveEditor(Basic_Bar).mount('#ex1');
const ex2 = new $visualify.LiveEditor(Group_Bar).mount('#ex2');
const ex3 = new $visualify.LiveEditor(Stacked_Bar).mount('#ex3');
const ex4 = new $visualify.LiveEditor(Percentage_Stacked_Bar).mount('#ex4');
const ex5 = new $visualify.LiveEditor(Stacked_Horizontal_Bar).mount('#ex5');
const ex6 = new $visualify.LiveEditor(waterfall).mount('#ex6');
const ex7 = new $visualify.LiveEditor(Basic_Area_bar).mount('#ex7');
</script>

# Line Chart

## Basic Bar Chart

<div id="ex1"></div>

## Group Bar Chart

<div id="ex2"></div>

## Stacked Bar Chart

<div id="ex3"></div>

## Percentage Stacked Bar Chart

<div id="ex4"></div>

## Stacked Horizontal Bar Chart

<div id="ex5"></div>

## Waterfall Chart

<div id="ex6"></div>

## Basic Area Bar Chart

<div id="ex7"></div>

## Overall Configuration

### Basic Configuration

The basic configuration includes:

| Attribute       | Type        | Description             | Choice                     | Default |
| --------------- | ----------- | ----------------------- | -------------------------- | ------- |
| title           | string      | The main title          | User-defined title         | -       |
| subtitle        | string      | A secondary title       | User-defined subtitle      | -       |
| width           | string      | The width dimension     | Any valid CSS width value  | -       |
| height          | string      | The height dimension    | Any valid CSS height value | 400px   |
| legend          | bool/object | show or hide legend     | False, User-defined legend | {}      |
| xAxis           | array/false | The xAxis               | User-defined xAxis Data    | []      |
| yAxis           | array/false | The yAxis               | User-defined yAxis Data    | []      |
| label           | object      | The label               | User-defined label         | {}      |
| labelLine       | object      | The labelLine           | User-defined labelLine     | {}      |
| tooltip         | object      | The tooltip             | User-defined tooltip       | {}      |
| xAxisLineshow   | bool        | show or hide xAxisLines | True, False                | true    |
| yAxisLineshow   | bool        | show or hide yAxisLines | True, False                | true    |
| xAxisLabelShow  | bool        | show or hide xAxisLabel | True, False                | true    |
| yAxisLabelShow  | bool        | show or hide yAxisLabel | True, False                | true    |
| xAxisLabelColor | string      | The xAxisLabelColor     | Any valid CSS color value  | -       |
| yAxisLabelColor | string      | The yAxisLabelColor     | Any valid CSS color value  | -       |

### Data Configuration

| Attribute  | Type         | Description                 | Choice                              | Default   |
| ---------- | ------------ | --------------------------- | ----------------------------------- | --------- |
| data       | string       | The data                    | User-defined data                   | {}        |
| type       | string/array | The type                    | 'line', 'bar'                       | undefined |
| areaStyle  | object       | The area style              | {},[{color: 'red'},{color: 'blue'}] | {}        |
| stack      | string/array | The stack                   | 'total',['x','y']                   | -         |
| percentage | bool         | The percentage stacked mode | True, False                         | false     |
| areaStyle  | object       | The area style              | {},[{color: 'red'},{color: 'blue'}] | {}        |
