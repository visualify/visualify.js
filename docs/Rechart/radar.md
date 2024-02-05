<script defers>

const Basic_Radar = {
    code: `const getOption = () => {
    return {
        type: 'radar',
        data: {
            'Referer of a Websit': [
                {
                    name: '2018', 
                    value: [5000, 7000, 12000, 11000, 15000, 14000]
                }
            ],
        },
        radar:{
            indicator: [
                        { name: 'APP', max: 6000 },
                        { name: 'PC', max: 16000 },
                        { name: 'Mobile', max: 30000 },
                        { name: 'Wechat', max: 35000 },
                        { name: 'Mobile QQ', max: 50000 },
                        { name: 'Mini App', max: 25000 }
            ]
        },
	}
};
return getOption;`
};

const Circular_radar = {
    code: `const getOption = () => {
    return {
        type: 'radar',
        data: {
            'Referer of a Websit': [
                {
                    name: '2018', 
                    value: [5000, 7000, 12000, 11000, 15000, 14000]
                }
            ],
        },
        radar:{
            indicator: [
                        { name: 'APP', max: 6000 },
                        { name: 'PC', max: 16000 },
                        { name: 'Mobile', max: 30000 },
                        { name: 'Wechat', max: 35000 },
                        { name: 'Mobile QQ', max: 50000 },
                        { name: 'Mini App', max: 25000 }
            ],
            radius: 120,
            splitNumber: 3,
            shape: 'circle', 
            splitArea: {
                areaStyle: {
                        color: ['rgba(114, 172, 209, 0.2)','rgba(114, 172, 209, 0.4)', 'rgba(114, 172, 209, 0.6)','rgba(114, 172, 209, 0.8)', 'rgba(114, 172, 209, 1)'],
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        shadowBlur: 10
                }
            }
        },
	}
};
return getOption;`
};


const Indicator_radar = {
    code: `const getOption = () => {
    return {
        type: 'radar',
        data: {
            'Referer of a Websit': [
                {
                    name: '2018', 
                    value: [5000, 7000, 12000, 11000, 15000, 14000]
                },
                {
                    name: '2019', 
                    value: [4000, 9000, 15000, 15000, 13000, 11000],
                    symbol: 'rect',
                    symbolSize: 12,
                    lineStyle: {
                        type: 'dashed'
                    },
                    label: {
                        show: true,
                        formatter: function (params) {
                        return params.value;
                        }
                    }
                }
            ],
        },
        radar:{
            indicator: [
                        { name: 'APP', max: 6000 },
                        { name: 'PC', max: 16000 },
                        { name: 'Mobile', max: 30000 },
                        { name: 'Wechat', max: 35000 },
                        { name: 'Mobile QQ', max: 50000 },
                        { name: 'Mini App', max: 25000 }
            ],
            radius: 120,
            splitNumber: 3,
            shape: 'circle',
            name: {
                fontSize: 20,
                color: 'rgba(185, 11, 220, 1)'
            }
        },
	}
};
return getOption;`
};

const Multiple_radar = {
    code: `const getOption = () => {
    return {
        type: 'radar',
        data: {
            'First': [
                {
                value: [60, 73, 85, 40],
                name: 'A Software'
                }
            ],
            "Second": [
                {
                    value: [85, 90, 90, 95, 95],
                    name: 'A Phone'
                },
                {
                    value: [95, 80, 95, 90, 93],
                    name: 'Another Phone'
                }
            ],
            'Third': [
                {
                    name: 'Precipitation',
                    value: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 75.6, 82.2, 48.7, 18.8, 6.0, 2.3]
                },
                {
                    name: 'Evaporation',
                    value: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 35.6, 62.2, 32.6, 20.0, 6.4, 3.3]
                }
            ],
        },
        radar: [
            {
                indicator: [
                    { text: 'Brand', max: 100 },
                    { text: 'Content', max: 100 },
                    { text: 'Usability', max: 100 },
                    { text: 'Function', max: 100 }
                ],
                center: ['25%', '40%'],
                radius: 80
            },
            {
                indicator: [
                    { text: 'Look', max: 100 },
                    { text: 'Photo', max: 100 },
                    { text: 'System', max: 100 },
                    { text: 'Performance', max: 100 },
                    { text: 'Screen', max: 100 }
                ],
                radius: 80,
                center: ['50%', '60%']
            },
            {
                indicator: (function () {
                    var res = [];
                    for (var i = 1; i <= 12; i++) {
                    res.push({ text: i + '月', max: 100 });
                    }
                    return res;
                })(),
                center: ['75%', '40%'],
                radius: 80
            }
        ],
	}
};
return getOption;`
};

const ex1 = new $visualify.LiveEditor(Basic_Radar).mount('#ex1');
const ex2 = new $visualify.LiveEditor(Circular_radar).mount('#ex2');
const ex3 = new $visualify.LiveEditor(Indicator_radar).mount('#ex3');
const ex4 = new $visualify.LiveEditor(Multiple_radar).mount('#ex4');
</script>

# Radar Chart

## Basic Radar Chart

<div id="ex1"></div>

## Circular Radar Chart

<div id="ex2"></div>

## Indicator Radar Chart

<div id="ex3"></div>

## Multiple Radar Chart

<div id="ex4"></div>

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

| Attribute | Type         | Description | Choice            | Default   |
| --------- | ------------ | ----------- | ----------------- | --------- |
| data      | string       | The data    | User-defined data | {}        |
| type      | string/array | The type    | 'line', 'bar'     | undefined |
| radar     | object       | The radar   | User-defined data | {}        |

### Radar Configuration

| Attribute   | Type   | Description     | Choice                   | Default   |
| ----------- | ------ | --------------- | ------------------------ | --------- |
| indicator   | array  | The indicator   | User-defined indicator   | []        |
| radius      | number | The radius      | User-defined radius      | 75        |
| splitNumber | number | The splitNumber | User-defined splitNumber | 5         |
| shape       | string | The shape       | 'polygon', 'circle'      | 'polygon' |
| splitArea   | object | The splitArea   | User-defined splitArea   | {}        |
