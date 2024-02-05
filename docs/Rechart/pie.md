<script defers>

const Basic_Pie = {
    code: `const getOption = () => {
    return {
        type: 'pie',
        data: {
            'Referer of a Websit': [
                { value: 1048, name: 'Search Engine' },
                { value: 735, name: 'Direct' },
                { value: 580, name: 'Email' },
                { value: 484, name: 'Union Ads' },
                { value: 300, name: 'Video Ads' }
            ],
        },
	}
};
return getOption;`
};

const selected_Pie = {
    code: `const getOption = () => {
    return {
        type: 'pie',
        data: {
            'Referer of a Websit': [
                { value: 1048, name: 'Search Engine' },
                { value: 735, name: 'Direct' },
                { value: 580, name: 'Email' },
                { value: 484, name: 'Union Ads' },
                { value: 300, name: 'Video Ads' }
            ],
        },
        selectedMode: "single", // "multiple"
	}
};
return getOption;`
};

const Nightingale = {
    code: `const getOption = () => {
    return {
        type: 'pie',
        data: {
            'Rose': [
                { value: 40, name: 'rose 1' },
                { value: 33, name: 'rose 2' },
                { value: 28, name: 'rose 3' },
                { value: 22, name: 'rose 4' },
                { value: 20, name: 'rose 5' },
                { value: 15, name: 'rose 6' },
                { value: 12, name: 'rose 7' },
                { value: 10, name: 'rose 8' }
            ],
            'Rose2': [
                { value: 30, name: 'rose 1' },
                { value: 28, name: 'rose 2' },
                { value: 26, name: 'rose 3' },
                { value: 24, name: 'rose 4' },
                { value: 22, name: 'rose 5' },
                { value: 20, name: 'rose 6' },
                { value: 18, name: 'rose 7' },
                { value: 16, name: 'rose 8' }
            ]
        },
        roseType: 'area',
        radius: [20, 140],
        center: [['75%', '50%'],['25%', '50%']],
        overrides:{
              toolbox: {
                show: true,
                feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                restore: { show: true },
                saveAsImage: { show: true }
                }
            },
        }
	}
};
return getOption;`
};


const Nested_Pie = {
    code: `const getOption = () => {
    return {
        type: 'pie',
        data: {
            'Access From 2': [
                { value: 1048, name: 'Baidu' },
                { value: 335, name: 'Direct' },
                { value: 310, name: 'Email' },
                { value: 251, name: 'Google' },
                { value: 234, name: 'Union Ads' },
                { value: 147, name: 'Bing' },
                { value: 135, name: 'Video Ads' },
                { value: 102, name: 'Others' }
            ],
            'Access From': [
                { value: 1548, name: 'Search Engine' },
                { value: 775, name: 'Direct' },
                { value: 679, name: 'Marketing', selected: true }
            ],
        },
        legend: {
            data: [
                'Email',
                'Union Ads',
                'Video Ads',
                'Baidu',
                'Google',
                'Bing',
                'Others'
            ],
            orient: 'horizontal',
        },
        radius: [['45%', '60%'],[0, '30%']],
        label: [
            {
                formatter: '{a|{a}}{abg|}\\n{hr|}\\n  {b|{b}：}{c}  {per|{d}%}  ',
                backgroundColor: '#F6F8FC',
                borderColor: '#8C8D8E',
                borderWidth: 1,
                borderRadius: 4,
                rich: {
                    a: {
                        color: '#6E7079',
                        lineHeight: 22,
                        align: 'center'
                    },
                    hr: {
                        borderColor: '#8C8D8E',
                        width: '100%',
                        borderWidth: 1,
                        height: 0
                    },
                    b: {
                        color: '#4C5058',
                        fontSize: 14,
                        fontWeight: 'bold',
                        lineHeight: 33
                    },
                    per: {
                        color: '#fff',
                        backgroundColor: '#4C5058',
                        padding: [3, 4],
                        borderRadius: 4
                    }
                }
            },
            {
                position: 'inner',
                fontSize: 14
            },
        ]
	}
};
return getOption;`
};



const ex1 = new $visualify.LiveEditor(Basic_Pie).mount('#ex1');
const ex2 = new $visualify.LiveEditor(selected_Pie).mount('#ex2');
const ex3 = new $visualify.LiveEditor(Nightingale).mount('#ex3');
const ex4 = new $visualify.LiveEditor(Nested_Pie).mount('#ex4');
</script>

# Pie Chart

## Basic Pie Chart

<div id="ex1"></div>

## Selected Pie Chart

<div id="ex2"></div>

## Nightingale Rose Chart

<div id="ex3"></div>

## Nested Pie Chart

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

| Attribute  | Type                  | Description                 | Choice                              | Default   |
| ---------- | --------------------- | --------------------------- | ----------------------------------- | --------- |
| data       | string                | The data                    | User-defined data                   | {}        |
| type       | string/array          | The type                    | 'line', 'bar'                       | undefined |
| areaStyle  | object                | The area style              | {},[{color: 'red'},{color: 'blue'}] | {}        |
| stack      | string/array          | The stack                   | 'total',['x','y']                   | -         |
| percentage | bool                  | The percentage stacked mode | True, False                         | false     |
| areaStyle  | object                | The area style              | {},[{color: 'red'},{color: 'blue'}] | {}        |
| radius     | array/ array of array | The radius                  | [20, 140], [[20,140]]               | -         |
| center     | array/ array of array | The center                  | ['75%', '50%'], [['75%', '50%']]    | -         |
