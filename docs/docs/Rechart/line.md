<script defers>

const basic_line = {
    code: `const getOption = () => {
    return {
        type: 'line',
        data: {
            '1': [820, 932, 901, 934, 1290, 1330, 1320],
            '2': [1320, 820,1290, 901, 934, 932, 1330],
        },
		xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        legend: false,
	}
};
return getOption;`
};

const smooth_line = {
    code: `const getOption = () => {
    return {
        type: 'line',
        data: {
            '1': [820, 932, 901, 934, 1290, 1330, 1320],
            '2': [1320, 820,1290, 901, 934, 932, 1330],
        },
		xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        smooth: true,
        legend: false,
	}
};
return getOption;`
};

const basic_area_chart = {
    code: `const getOption = () => {
    return {
        type: 'line',
        data: {
            '1': [820, 932, 901, 934, 1290, 1330, 1320],
            '2': [1320, 820,1290, 901, 934, 932, 1330],
        },
		xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        areaStyle: [{color: 'red'}, {color: 'blue'}],
        smooth: [true, false],
        legend: false,
	}
};
return getOption;`
};

const stacked_area_chart = {
    code: `const getOption = () => {
    return {
        type: 'line',
        data: {
            'Vue': [3000, 3500, 3900, 3100, 3200, 3100, 3600, 3300, 3600, 3400, 3100, 3000],
            'React': [2000, 2000, 2600, 2300, 2300, 2000, 2600, 2200, 2500, 2800, 2500, 2200],
            'Angular': [827, 949, 1400, 1000, 884, 911, 983, 989, 925, 1100, 1200, 930],
        },
		xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
        areaStyle: {},
        stack: 'total',
        smooth: true,
        overrides:{
            tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
        }
	}
};
return getOption;`
};

const percentage_stacked_area_chart = {
    code: `const getOption = () => {
			    return {
			        type: 'line',
			        data: {
			            'Vue': [3000, 3500, 3900, 3100, 3200, 3100, 3600, 3300, 3600, 3400, 3100, 3000],
			            'React': [4000, 4500, 4900, 4300, 4400, 4300, 4800, 4500, 4800, 4600, 4300, 4000],
			            'Angular': [827, 949, 1400, 1000, 884, 911, 983, 989, 925, 1100, 1200, 930, ],
			        },
					xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
			        areaStyle: {},
			        smooth: true,
                    percentage: true,
				}
			};
return getOption;`
};

const step_line_chart ={
    code: `const getOption = () => {
			    return {
			        type: 'line',
			        data: {
			            'Vue': [3000, 3500, 3900, 3100, 3200],
			            'React': [4000, 4500, 4900, 4300, 4400],
			            'Angular': [827, 949, 1400, 1000, 884],
			        },
					xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
			        smooth: true,
			        areaStyle: {},
			        step: ['start', 'end', 'middle'],
				}
			};
return getOption;`
};

// Addition Line Setting

const line_label_Axis = {
    code: `const getOption = () => {
        return {
            type: 'line',
            data: {
                'Vue': [3000, 3500, 3900, 3100, 3200],
                'React': [4000, 4500, 4900, 4300, 4400],
                'Angular': [827, 949, 1400, 1000, 884],
                },
            xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            smooth: true,
            label: [
                {bold: true, color: 'blue',fontSize: 20},
                {color: 'red'},
                {color: 'green'},
            ],
            yAxisLabelColor: 'rgba(209, 10, 220, 1)',
            xAxisLabelColor: 'rgba(14, 33, 237, 1)',
        }
};
return getOption;`
};

const hide_axis = {
    code: `const getOption = () => {
    return {
        title: 'Daily Electricity Usage',
        type: 'line',
        data: {
            'usage': [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400],
            'usage2': [125, 280, 223, 260, 270, 300, 550, 343, 400, 390, 553, 213, 400, 223, 123, 750, 321, 123, 542, 135],
        },
		xAxis: ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45'],
        xAxisLineshow: false,
        yAxisLineshow: true,
        yAxisLabelShow:false,
        smooth: true,
        overrides:{
        }
	}
};
return getOption;`
};

const markArea = {
    code: `const getOption = () => {
    return {
        title: 'Daily Electricity Usage',
        type: 'line',
        data: {
            'usage': [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400],
            'usage2': [125, 280, 223, 260, 270, 300, 550, 343, 400, 390, 553, 213, 400, 223, 123, 750, 321, 123, 542, 135],
        },
		xAxis: ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45'],
		smooth: true,
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

const markLine = {
    code: `const getOption = () => {
    return {
        title: 'Daily Electricity Usage',
        type: 'line',
        data: {
            'usage': [300, 280, 250, 260, 270, 300, 550],
            'usage2': [125, 373, 223, 323, 270, 352, 250],
        },
		xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		smooth: true,
        markLine: [
            {
                data: [
                { name: 'avg', type: 'average'},
                { name: 'min', type: 'min'},
                { name: 'max', type: 'max'},
                ],
            },{
                data: [
                { 
                    name: 'Y-axis', 
                    yAxis: 100, 
                    label: { formatter: '{b}', }
                },
                [ 
                    { name: 'min to avg', type: 'min'},
                    { type: 'average'} 
                ],
                [
                    { name: 'from two points', coord: ['Wed', 100]},
                    { coord: ['Fri', 200] }
                ],
                [
                    { yAxis: 'average', x: '30%' }, 
                    { type: 'max' }
                ]
            ],
        }],
	}
};
return getOption;`};

const peak_valley = {
    code: `const getOption = () => {
    return {
        title: 'Daily Electricity Usage',
        type: 'line',
        data: {
            'usage': [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400],
            'usage2': [125, 280, 223, 260, 270, 300, 550, 343, 400, 390, 553, 213, 400, 223, 123, 750, 321, 123, 542, 135],
        },
		xAxis: ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45'],
		smooth: true,
        peak: '峰',
        valley: true,
        overrides:{}
	}
};
return getOption;`};

const ex1 = new $visualify.LiveEditor(basic_line).mount('#ex1');
const ex2 = new $visualify.LiveEditor(smooth_line).mount('#ex2');
const ex3 = new $visualify.LiveEditor(basic_area_chart).mount('#ex3');
const ex4 = new $visualify.LiveEditor(stacked_area_chart).mount('#ex4');
const ex5 = new $visualify.LiveEditor(percentage_stacked_area_chart).mount('#ex5');
const ex6 = new $visualify.LiveEditor(step_line_chart).mount('#ex6');
const ex7 = new $visualify.LiveEditor(line_label_Axis).mount('#ex7');
const ex8 = new $visualify.LiveEditor(hide_axis).mount('#ex8');
const ex9 = new $visualify.LiveEditor(markArea).mount('#ex9');
const ex10 = new $visualify.LiveEditor(markLine).mount('#ex10');
const ex11 = new $visualify.LiveEditor(peak_valley).mount('#ex11');
</script>

# Line Chart

## Basic Line Chart

<div id="ex1"></div>

## Smooth Line Chart

<div id="ex2"></div>

## Basic Area Chart

<div id="ex3"></div>

## Stacked Area Chart

<div id="ex4"></div>

## Percentage Stacked Area Chart

<div id="ex5"></div>

## Step Line Chart

<div id="ex6"></div>

## Addition Line Setting

### Setting Label & AxisColor

<div id="ex7"></div>

### Hiding Axis

<div id="ex8"></div>

### Marking Area

<div id="ex9"></div>

### Marking Line

<div id="ex10"></div>

### Peak & Valley

<div id="ex11"></div>

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

| Attribute  | Type              | Description                 | Choice                                                                                    | Default   |
| ---------- | ----------------- | --------------------------- | ----------------------------------------------------------------------------------------- | --------- |
| data       | string            | The data                    | User-defined data                                                                         | {}        |
| type       | string/array      | The type                    | 'line', 'bar'                                                                             | undefined |
| smooth     | bool/array        | The smooth                  | True, False, [true, false]                                                                | false     |
| areaStyle  | object            | The area style              | {},[{color: 'red'},{color: 'blue'}]                                                       | {}        |
| stack      | string/array      | The stack                   | {}, ['x', 'y'], 'total'                                                                   | -         |
| markArea   | object/array      | The mark area               | {XAxis: [{start: '...', end:'...', name: "..."}, ... ], YAxis: ..., props: ..}, [{}, ...] | -         |
| markLine   | object/array      | The mark line               | {data: { name: 'average', type: 'average'}, props: .. }, [{ data: {}, props: ..}, ...]    | -         |
| peak       | bool/string       | name of the peak            | True, False, user-defined name of the peak                                                | false     |
| valley     | bool/string       | name of the valley          | True, False, user-defined name of the valley                                              | false     |
| smooth     | bool/array        | The smooth                  | True, False, [true, false]                                                                | false     |
| areaStyle  | object            | The area style              | {},[{color: 'red'},{color: 'blue'}]                                                       | {}        |
| percentage | bool              | The percentage stacked mode | True, False                                                                               | false     |
| steps      | bool/string/array | The steps                   | True, False, 'start', 'middle', 'end', ['start', 'middle', 'end']                         | false     |
